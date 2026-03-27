'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2, Phone, PhoneOff, Send, X, Square, Bot } from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const API_BASE         = process.env.NEXT_PUBLIC_VOICE_API_URL || 'http://localhost:5000';
const SILENCE_DB       = 0.015;  // below = silence while listening
const SILENCE_MS       = 1800;   // quiet after speech -> send
const HANGUP_MS        = 12000;  // no speech at all -> warn
const HANGUP_MS2       = 5000;   // after warn -> end
// Barge-in: lower threshold because mic+speaker echo is already filtered
// We detect CHANGE in volume, not absolute volume
const BARGE_THRESHOLD  = 0.025;  // lower than SILENCE_DB - any voice counts
const BARGE_SUSTAIN    = 200;    // ms must stay above threshold (avoids speaker bleed)

const PAUSE_KEYWORDS = [
  'stop','wait','ruko','bas','hold on','ek second','ek min',
  'suno','pause','chup','thehro','sun','baat karo',
];

// End-call phrases -> checked against real Azure STT transcript (reliable)
const END_PHRASES = [
  'end call','end the call','stop the call','disconnect','hang up',
  'goodbye','good bye','bye bye','ok bye','okay bye','thank you bye',
  'thanks bye','that is all','i am done','no more questions','nothing else',
  'call khatam','call band karo','call end karo','band karo',
  'bas karo','khatam karo','phone rakh','rakh do','theek hai bye',
  'alvida','shukriya bye','ok shukriya','bas itna hi','aur kuch nahi',
  'koi sawal nahi','thank you bhai','dhanyawad',
];
// Single words -> end call only if that is the ENTIRE message
const END_SINGLE = ['bye','done','thanks','shukriya','alvida','bas','khatam'];
const isEndPhrase = (text) => {
  const t = text.toLowerCase().trim();
  if (END_PHRASES.some(p => t.includes(p))) return true;
  if (t.split(/\s+/).length <= 2 && END_SINGLE.some(w => t === w || t.startsWith(w + ' '))) return true;
  return false;
};

export default function VoiceWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode,        setMode]        = useState('chat');
  const [callStatus,  setCallStatus]  = useState('idle');
  const [callDuration,setCallDuration]= useState(0);
  const [isMuted,     setIsMuted]     = useState(false);
  const [vadLevel,    setVadLevel]    = useState(0);
  const [messages,    setMessages]    = useState([]);
  const [chatInput,   setChatInput]   = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showBadge,   setShowBadge]   = useState('');

  // single persistent mic - open for entire call
  const micStream   = useRef(null);
  const micCtx      = useRef(null);
  const micAnalyser = useRef(null);

  // Recorder (reuses micStream, starts/stops per turn)
  const recorderRef = useRef(null);
  const chunksRef   = useRef([]);

  // Playback
  const audioRef    = useRef(null);

  // Timers
  const silTimerRef  = useRef(null);
  const hangTimerRef = useRef(null);
  const bargeTimerRef= useRef(null);
  const callTimerRef = useRef(null);
  const vadAnimRef   = useRef(null);

  // State refs -> source of truth inside ALL async/closure code
  const callActive     = useRef(false);
  const statusRef      = useRef('idle');
  const mutedRef       = useRef(false);
  // Interrupt callback -> speak() sets this, VAD/keyword calls it
  const onInterruptRef = useRef(null);
  // Volume baseline during TTS playback -> barge-in detects RISE above this
  const speakBaselineRef = useRef(0);

  // Web Speech for keyword detection
  const recognitionRef = useRef(null);

  const msgEndRef  = useRef(null);
  const sessionId  = useRef(`s_${Date.now()}`);

  const setStatus = (s) => { statusRef.current = s; setCallStatus(s); };
  const setMutedB = (v) => { mutedRef.current  = v; setIsMuted(v); };
  const addMsg    = (type, content) =>
    setMessages(p => [...p, { type, content }]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (mode === 'call') {
      setCallDuration(0);
      callTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => clearInterval(callTimerRef.current);
  }, [mode]);

  useEffect(() => () => {
    killEverything();
    clearInterval(callTimerRef.current);
  }, []);

  const fmt = (s) =>
    `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const openMic = async () => {
    if (micStream.current) return true;
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl:  true,
          sampleRate: 48000,
        },
      });
    } catch (err) {
      addMsg('ai', err.name === 'NotAllowedError'
        ? 'Mic access denied — allow it in browser settings.'
        : 'No microphone found.');
      return false;
    }
    micStream.current = stream;
    const ctx = new window.AudioContext();
    micCtx.current = ctx;
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    src.connect(analyser);
    micAnalyser.current = analyser;
    return true;
  };

  const startVADLoop = () => {
    if (!micAnalyser.current) return;
    cancelAnimationFrame(vadAnimRef.current);

    const analyser = micAnalyser.current;
    const buf      = new Uint8Array(analyser.fftSize);
    let spokenOnce = false;

    const tick = () => {
      if (!callActive.current) { setVadLevel(0); return; }

      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      const vol = Math.sqrt(sum / buf.length);
      setVadLevel(Math.min(vol * 6, 1));

      const st    = statusRef.current;
      const muted = mutedRef.current;

      if (st === 'listening' && !muted) {
        if (vol > SILENCE_DB) {
          spokenOnce = true;
          clearTimeout(silTimerRef.current);
          clearTimeout(hangTimerRef.current);
          silTimerRef.current  = null;
          hangTimerRef.current = null;
        } else if (spokenOnce && !silTimerRef.current) {
          silTimerRef.current = setTimeout(async () => {
            if (!callActive.current || statusRef.current !== 'listening') return;
            cancelAnimationFrame(vadAnimRef.current);
            spokenOnce = false;
            const blob = await stopRecorder();
            if (callActive.current) {
              processBlob(blob);
              startVADLoop();
            }
          }, SILENCE_MS);
        }
      } else if (st === 'speaking' && !muted) {
        const rise = vol - speakBaselineRef.current;
        if (rise > BARGE_THRESHOLD) {
          if (!bargeTimerRef.current) {
            bargeTimerRef.current = setTimeout(() => {
              bargeTimerRef.current = null;
              if (statusRef.current !== 'speaking' || !callActive.current) return;
              console.log('Barge-in!', { vol, baseline: speakBaselineRef.current, rise });
              const cb = onInterruptRef.current;
              onInterruptRef.current = null;
              cb?.('bargein');
            }, BARGE_SUSTAIN);
          }
        } else {
          if (bargeTimerRef.current) {
            clearTimeout(bargeTimerRef.current);
            bargeTimerRef.current = null;
          }
        }
      } else {
        if (bargeTimerRef.current) {
          clearTimeout(bargeTimerRef.current);
          bargeTimerRef.current = null;
        }
      }

      vadAnimRef.current = requestAnimationFrame(tick);
    };

    vadAnimRef.current = requestAnimationFrame(tick);
  };

  const startKeywordWatch = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const r          = new SR();
    r.continuous     = true;
    r.interimResults = true;
    r.lang           = 'hi-IN';

    r.onresult = (e) => {
      if (!callActive.current) return;
      const text = Array.from(e.results)
        .map(res => res[0].transcript.toLowerCase())
        .join(' ');

      const endHit = isEndPhrase(text);
      if (endHit) {
        console.log('End call keyword:', text);
        handleEndByVoice();
        return;
      }

      if (statusRef.current !== 'speaking') return;
      const pauseHit = PAUSE_KEYWORDS.some(kw => text.includes(kw));
      if (pauseHit) {
        console.log('Pause keyword:', text);
        const cb = onInterruptRef.current;
        onInterruptRef.current = null;
        cb?.('keyword');
      }
    };

    r.onerror = () => {
      try { r.stop(); setTimeout(() => { try { r.start(); } catch(_){} }, 300); } catch(_) {}
    };

    try { r.start(); recognitionRef.current = r; } catch(_) {}
  };

  const stopKeywordWatch = () => {
    try { recognitionRef.current?.stop(); } catch(_) {}
    recognitionRef.current = null;
  };

  const startRecorder = () => {
    if (!micStream.current || recorderRef.current) return;
    chunksRef.current = [];
    const rec = new window.MediaRecorder(micStream.current, { mimeType: 'audio/webm;codecs=opus' });
    rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    rec.start(200);
    recorderRef.current = rec;
  };

  const stopRecorder = () => new Promise(resolve => {
    const rec    = recorderRef.current;
    const chunks = [...chunksRef.current];
    recorderRef.current = null;
    chunksRef.current   = [];

    if (!rec || rec.state === 'inactive') {
      resolve(chunks.length ? new Blob(chunks, { type: 'audio/webm' }) : null);
      return;
    }
    rec.onstop = () =>
      resolve(chunks.length ? new Blob(chunks, { type: 'audio/webm' }) : null);
    try { rec.stop(); } catch { resolve(null); }
  });

  const speak = async (text) => {
    if (!callActive.current) return 'ended';

    if (micAnalyser.current) {
      const buf = new Uint8Array(micAnalyser.current.fftSize);
      micAnalyser.current.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128; sum += v * v;
      }
      speakBaselineRef.current = Math.sqrt(sum / buf.length);
    }

    setStatus('speaking');
    setShowBadge('');

    let result = 'ended';
    try {
      const r = await fetch(`${API_BASE}/api/tts?text=${encodeURIComponent(text)}`);
      if (!r.ok) throw new Error('TTS');
      const blob = await r.blob();
      const url  = URL.createObjectURL(blob);
      const aud  = new Audio(url);
      audioRef.current = aud;

      result = await new Promise((resolve) => {
        onInterruptRef.current = (reason) => {
          aud.pause();
          URL.revokeObjectURL(url);
          audioRef.current = null;
          resolve(reason);
        };
        aud.onended = () => {
          onInterruptRef.current = null;
          URL.revokeObjectURL(url);
          audioRef.current = null;
          resolve('ended');
        };
        aud.onerror = () => {
          onInterruptRef.current = null;
          URL.revokeObjectURL(url);
          audioRef.current = null;
          resolve('ended');
        };
        aud.play().catch(() => resolve('ended'));
      });
    } catch {
      onInterruptRef.current = null;
    }

    clearTimeout(bargeTimerRef.current);
    bargeTimerRef.current = null;

    if (callActive.current && statusRef.current === 'speaking') {
      setStatus('idle');
    }
    return result;
  };

  const listen = () => {
    if (!callActive.current) return;

    clearTimeout(silTimerRef.current);
    clearTimeout(hangTimerRef.current);
    silTimerRef.current  = null;
    hangTimerRef.current = null;

    if (recorderRef.current) {
      try { recorderRef.current.stop(); } catch(_) {}
      recorderRef.current = null;
      chunksRef.current   = [];
    }

    setStatus('listening');
    setShowBadge('');
    startRecorder();

    hangTimerRef.current = setTimeout(async () => {
      if (!callActive.current || statusRef.current !== 'listening') return;
      clearTimeout(silTimerRef.current);
      silTimerRef.current = null;
      await stopRecorder();
      addMsg('ai', "Still there? I didn't hear anything…");
      const r = await speak("Are you still there? I didn't hear anything.");
      if (!callActive.current) return;
      if (r === 'ended') {
        hangTimerRef.current = setTimeout(() => {
          if (callActive.current) endCall();
        }, HANGUP_MS2);
      } else {
        handleInterrupt(r);
      }
    }, HANGUP_MS);
  };

  const handleInterrupt = (reason) => {
    if (!callActive.current) return;
    clearTimeout(bargeTimerRef.current);
    bargeTimerRef.current = null;

    if (reason === 'bargein') {
      setShowBadge('interrupted');
      listen();
    } else if (reason === 'keyword') {
      setShowBadge('paused');
      addMsg('ai', '(paused — go ahead)');
      listen();
    }
  };

  const processBlob = async (blob) => {
    if (!callActive.current) return;

    if (!blob || blob.size < 3000) {
      const r = await speak("I didn't catch that — could you speak a bit louder?");
      if (callActive.current) r === 'ended' ? listen() : handleInterrupt(r);
      return;
    }

    setStatus('processing');

    try {
      const fd = new FormData();
      fd.append('audio', blob, 'voice.webm');
      const sttR = await fetch(`${API_BASE}/api/stt`, { method: 'POST', body: fd });
      if (!sttR.ok) throw new Error('STT');
      const { transcript } = await sttR.json();
      const userText = transcript?.trim();

      if (!userText) {
        const r = await speak("Sorry, didn't catch that — could you repeat?");
        if (callActive.current) r === 'ended' ? listen() : handleInterrupt(r);
        return;
      }

      addMsg('user', userText);

      if (isEndPhrase(userText)) { handleEndByVoice(); return; }

      const aiR = await fetch(`${API_BASE}/web/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId.current, text: userText }),
      });
      if (!aiR.ok) throw new Error('AI');
      const { answer } = await aiR.json();
      const reply = answer?.trim() || "I don't have an answer for that right now.";

      addMsg('ai', reply);
      const r = await speak(reply);
      if (!callActive.current) return;
      r === 'ended' ? listen() : handleInterrupt(r);

    } catch (e) {
      console.error('[process]', e);
      const r = await speak("Something went wrong, go ahead.");
      if (callActive.current) r === 'ended' ? listen() : handleInterrupt(r);
    }
  };

  const startCall = async () => {
    callActive.current = true;
    setMutedB(false);
    setShowBadge('');
    setMode('call');
    setStatus('idle');

    await new Promise(r => setTimeout(r, 150));
    if (!callActive.current) return;

    const ok = await openMic();
    if (!ok) { endCall(); return; }

    startVADLoop();
    startKeywordWatch();

    addMsg('ai', 'Call connected. How can I help you?');
    const r = await speak('Call connected. How can I help you?');
    if (callActive.current) r === 'ended' ? listen() : handleInterrupt(r);
  };

  const handleEndByVoice = async () => {
    if (!callActive.current) return;
    const cb = onInterruptRef.current;
    onInterruptRef.current = null;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    cb?.('keyword');

    setStatus('speaking');
    const goodbyes = [
      "Sure, take care! Feel free to call again if you need help.",
      "Okay, goodbye! All the best for your admission.",
      "Sure! Bye bye, feel free to call anytime.",
    ];
    const bye = goodbyes[Math.floor(Math.random() * goodbyes.length)];
    addMsg('ai', bye);

    try {
      const r = await fetch(`${API_BASE}/api/tts?text=${encodeURIComponent(bye)}`);
      if (r.ok) {
        const blob = await r.blob();
        const url  = URL.createObjectURL(blob);
        const aud  = new Audio(url);
        await new Promise(res => {
          aud.onended = aud.onerror = () => { URL.revokeObjectURL(url); res(); };
          aud.play().catch(res);
        });
      }
    } catch(_) {}

    endCall();
  };

  const endCall = () => {
    killEverything();
    setStatus('ended');
    addMsg('system', '— Call ended —');
    setTimeout(() => { setMode('chat'); setStatus('idle'); }, 400);
  };

  const stopSpeaking = () => {
    const cb = onInterruptRef.current;
    onInterruptRef.current = null;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setShowBadge('paused');
    addMsg('ai', '(paused — go ahead)');
    if (callActive.current) {
      setStatus('idle');
      cb?.('keyword');
      setTimeout(() => { if (callActive.current) listen(); }, 60);
    }
  };

  const killEverything = () => {
    callActive.current     = false;
    onInterruptRef.current = null;

    cancelAnimationFrame(vadAnimRef.current);
    clearTimeout(silTimerRef.current);
    clearTimeout(hangTimerRef.current);
    clearTimeout(bargeTimerRef.current);
    silTimerRef.current   = null;
    hangTimerRef.current  = null;
    bargeTimerRef.current = null;

    stopKeywordWatch();

    try { recorderRef.current?.stop(); } catch(_) {}
    recorderRef.current = null;
    chunksRef.current   = [];

    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }

    micStream.current?.getTracks().forEach(t => t.stop());
    micStream.current  = null;
    try { micCtx.current?.close(); } catch(_) {}
    micCtx.current     = null;
    micAnalyser.current = null;

    setVadLevel(0);
    setShowBadge('');
  };

  const sendChat = async (text) => {
    const t = text?.trim();
    if (!t || chatLoading) return;
    addMsg('user', t);
    setChatInput('');
    setChatLoading(true);
    try {
      const r = await fetch(`${API_BASE}/web/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId.current, text: t }),
      });
      const { answer } = await r.json();
      addMsg('ai', answer?.trim() || "Sorry, I don't have an answer right now.");
    } catch {
      addMsg('ai', "Couldn't reach the assistant. Is the server running?");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[99]">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/30 text-white transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Bot className="h-7 w-7 relative z-10" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-indigo-200"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute bottom-0 right-0 w-[380px] max-w-[calc(100vw-48px)] bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col font-sans"
              style={{ maxHeight: '80vh', height: mode === 'call' ? '460px' : '600px' }}
            >
              {/* HEADER */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 bg-white/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 leading-tight">BMSCE Assistant</h3>
                    <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span> Online
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100/50 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* CHAT MODE */}
              {mode === 'chat' && (
                <>
                  <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-200">
                    {messages.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                        <div className="h-16 w-16 mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                          <Mic className="h-6 w-6 text-blue-500" />
                        </div>
                        <h4 className="font-semibold text-slate-800">Hi, I'm the BMSCE AI</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Ask me anything about admissions, campus life, or departments.</p>
                      </div>
                    ) : (
                      messages.map((m, i) => {
                        if (m.type === 'system') return <div key={i} className="text-center text-[11px] text-slate-400 my-2 font-medium tracking-wider uppercase">{m.content}</div>;
                        const isAi = m.type === 'ai';
                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={i}
                            className={cn("flex items-end gap-2 max-w-[85%]", isAi ? "self-start" : "self-end flex-row-reverse")}
                          >
                            <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white", isAi ? "bg-indigo-600" : "bg-slate-300")}>
                              {isAi ? <Bot className="h-3 w-3" /> : 'U'}
                            </div>
                            <div className={cn("rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm", isAi ? "rounded-bl-sm bg-white border border-slate-100 text-slate-700" : "rounded-br-sm bg-indigo-600 text-white")}>
                              {m.content}
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                    {chatLoading && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2 max-w-[85%] self-start">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white"><Bot className="h-3 w-3" /></div>
                        <div className="rounded-2xl rounded-bl-sm bg-white border border-slate-100 px-4 py-3 shadow-sm flex gap-1">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                        </div>
                      </motion.div>
                    )}
                    <div ref={msgEndRef} />
                  </div>

                  <div className="p-4 bg-white border-t border-slate-100">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <textarea
                          rows={1}
                          placeholder="Type or try Voice Call..."
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(chatInput); } }}
                          className="w-full resize-none rounded-xl border-none bg-slate-50 px-4 py-3 pl-4 pr-10 text-sm outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all max-h-[100px] scrollbar-thin overflow-y-auto"
                        />
                        <button
                          disabled={!chatInput.trim() || chatLoading}
                          onClick={() => sendChat(chatInput)}
                          className={cn("absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg transition-colors", chatInput.trim() ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-transparent text-slate-300")}
                        >
                          <Send size={14} />
                        </button>
                      </div>
                      <button
                        onClick={startCall}
                        className="flex h-[44px] px-4 items-center gap-2 justify-center rounded-xl bg-green-500 text-white shadow-lg shadow-green-500/20 hover:bg-green-600 transition-colors font-medium text-sm shrink-0"
                      >
                        <Phone size={16} /> Call
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* CALL MODE */}
              {mode === 'call' && (
                <div className="relative flex-1 flex flex-col items-center justify-center p-6 overflow-hidden bg-slate-50">
                   <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-0"></div>
                  
                  {/* Background Pings */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <AnimatePresence>
                      {!isMuted && (callStatus === 'listening' || callStatus === 'speaking') && (
                        <motion.div
                           key="ping1"
                           className={cn("absolute w-64 h-64 border-2 rounded-full", callStatus === 'speaking' ? "border-green-400/30" : "border-indigo-400/30")}
                           initial={{ scale: 0.5, opacity: 1 }}
                           animate={{ scale: 1.5, opacity: 0 }}
                           transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                        />
                      )}
                      {!isMuted && (callStatus === 'listening' || callStatus === 'speaking') && (
                        <motion.div
                           key="ping2"
                           className={cn("absolute w-64 h-64 border-2 rounded-full", callStatus === 'speaking' ? "border-green-400/30" : "border-indigo-400/30")}
                           initial={{ scale: 0.5, opacity: 1 }}
                           animate={{ scale: 1.5, opacity: 0 }}
                           transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="z-10 text-center mb-8">
                    <h3 className="text-xl font-bold tracking-tight text-slate-800">
                      {callStatus === 'listening' ? 'Listening...' : 
                       callStatus === 'processing' ? 'Thinking...' : 
                       callStatus === 'speaking' ? 'Assistant Speaking' : 'Connected'}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">{fmt(callDuration)}</p>
                    
                    <AnimatePresence>
                      {showBadge && (
                         <motion.div initial={{opacity:0, y:5}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="mt-3 inline-flex px-3 py-1 bg-amber-100 text-amber-700 font-medium text-xs rounded-full border border-amber-200">
                           {showBadge} — go ahead
                         </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <motion.div 
                     animate={{ scale: 1 + vadLevel * 0.15 }}
                     className={cn(
                       "z-10 flex h-32 w-32 items-center justify-center rounded-full shadow-2xl transition-colors duration-300",
                       callStatus === 'processing' ? "bg-amber-500 shadow-amber-500/40" : 
                       callStatus === 'speaking' ? "bg-green-500 shadow-green-500/40" : 
                       isMuted ? "bg-slate-400 shadow-slate-400/40" : "bg-indigo-600 shadow-indigo-600/40"
                     )}
                  >
                    {callStatus === 'processing' ? <Loader2 className="w-12 h-12 text-white animate-spin" /> :
                     isMuted ? <MicOff className="w-12 h-12 text-white" /> : <Mic className="w-12 h-12 text-white" />}
                  </motion.div>

                  <div className="z-10 mt-12 flex items-center justify-center gap-6">
                    <button
                      onClick={() => setMutedB(!mutedRef.current)}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className={cn("flex h-14 w-14 items-center justify-center rounded-full transition-all border", isMuted ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-white border-slate-200 text-slate-600 group-hover:bg-slate-50")}>
                        {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                      </div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{isMuted ? 'Unmute' : 'Mute'}</span>
                    </button>

                    {callStatus === 'speaking' && (
                      <motion.button
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        onClick={stopSpeaking}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                          <Square size={20} fill="currentColor" />
                        </div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stop</span>
                      </motion.button>
                    )}

                    <button
                      onClick={endCall}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 shadow-lg shadow-rose-500/30 text-white hover:bg-rose-600 transition-colors">
                        <PhoneOff size={22} />
                      </div>
                      <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">End</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
