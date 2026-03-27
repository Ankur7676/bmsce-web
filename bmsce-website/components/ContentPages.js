'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap, Users, Award, TrendingUp, Calendar, MapPin, Clock,
  Building, Trophy, BookOpen, FlaskConical, Lightbulb, Briefcase,
  Heart, Phone, Mail, Globe, Shield, Star, FileText, Zap, ChevronLeft
} from 'lucide-react';
import bmsceData from '../data/merged_bmsce_data.json';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } }
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

/* ===== DYNAMIC WRAPPER ===== */
function DynamicSubSection({ category, subSection, children }) {
  if (!subSection) return children;

  const safeId = subSection.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
  const catData = bmsceData[category];
  let itemData = catData ? catData[safeId] : null;

  // Fallback fuzzy search if exact key match fails
  if (!itemData && catData) {
    for (const key of Object.keys(catData)) {
      if (key.includes(safeId) || safeId.includes(key) || key.startsWith(safeId.split('_')[0])) {
         itemData = catData[key];
         break;
      }
    }
  }

  if (itemData && itemData.content && itemData.content.length > 5) {
    const paragraphs = itemData.content.split('\n\n').filter(p => p.trim());
    return (
      <div className="p-6 md:p-10 animate-fade-in">
        <div className="mb-4">
          <span className="text-[#0056b3] text-xs font-semibold tracking-[0.2em] uppercase mb-1 flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> BMSCE Information Portal
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-2 leading-tight">
            {itemData.title || subSection}
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-[#0056b3] to-[#fbbf24] rounded-full mt-3" />
        </div>
        
        <div className="bg-white rounded-2xl p-6 md:p-10 border border-slate-100 shadow-sm mt-8 relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-full pointer-events-none opacity-50 z-0"></div>
           <div className="relative z-10 prose prose-slate max-w-none">
             {paragraphs.map((p, i) => {
               // Render lists if bulleted, or just standard paras
               if (p.startsWith('*') || p.startsWith('-')) {
                  return <li key={i} className="text-sm text-slate-700 leading-relaxed mb-2 ml-4 list-disc">{p.replace(/^[\*\-]\s*/, '')}</li>;
               }
               return <p key={i} className="text-sm text-slate-700 leading-relaxed mb-6 whitespace-pre-line text-justify">{p}</p>;
             })}
           </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-400">Information extracted seamlessly from official sources.</span>
        </div>
      </div>
    );
  }

  // Fallback generic display if no matched JSON data for this specific subSection
  return (
    <div className="p-6 md:p-10 animate-fade-in">
       <div className="mb-4">
         <span className="text-[#0056b3] text-xs font-semibold tracking-[0.2em] uppercase mb-1 flex items-center gap-1">
            Browse Category Overview
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-2">
            {subSection}
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-[#0056b3] to-[#fbbf24] rounded-full mt-3" />
       </div>
       <div className="mt-8 bg-amber-50 border border-amber-200 p-6 rounded-xl flex items-start gap-4 mb-10">
          <FileText className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Specific details for <strong>{subSection}</strong> are currently being curated into the knowledge base. 
            Below is the comprehensive overview for the entire category.
          </p>
       </div>
       <div className="opacity-80 grayscale-[20%] pointer-events-none">
          {children}
       </div>
    </div>
  );
}

/* ===== Animated Counter Hook ===== */
function AnimatedCounter({ value, duration = 2 }) {
  const numericPart = value.replace(/[^0-9]/g, '');
  const prefix = value.match(/^[^0-9]*/)?.[0] || '';
  const suffix = value.match(/[^0-9]*$/)?.[0] || '';
  const target = parseInt(numericPart, 10);
  const [count, setCount] = React.useState(0);
  const [hasStarted, setHasStarted] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !hasStarted) setHasStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  React.useEffect(() => {
    if (!hasStarted || isNaN(target)) return;
    let start = 0;
    const step = Math.max(1, Math.floor(target / (duration * 60)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [hasStarted, target, duration]);

  if (isNaN(target)) return <span ref={ref}>{value}</span>;
  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

/* ===== SATELLITE ZOOM HERO ===== */
const SAT_TOTAL = 231;
const SAT_FPS = 30;

function SatelliteHero() {
  const canvasRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const imagesRef = React.useRef([]);
  const [phase, setPhase] = React.useState('loading'); // loading | playing | done
  const [progress, setProgress] = React.useState(0);
  const animRef = React.useRef(null);
  const startTimeRef = React.useRef(null);

  // Preload frames
  React.useEffect(() => {
    let loaded = 0;
    const imgs = [];
    for (let i = 1; i <= SAT_TOTAL; i++) {
      const img = new Image();
      img.src = `/map_frames/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
      img.onload = () => { loaded++; if (loaded >= SAT_TOTAL) setPhase('ready'); };
      img.onerror = () => { loaded++; if (loaded >= SAT_TOTAL) setPhase('ready'); };
      imgs.push(img);
    }
    imagesRef.current = imgs;
  }, []);

  // Start auto-play when images loaded & component in view
  React.useEffect(() => {
    if (phase !== 'ready') return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setPhase('playing'); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [phase]);

  // Animation loop
  React.useEffect(() => {
    if (phase !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const duration = SAT_TOTAL / SAT_FPS * 1000; // ms

    const drawFrame = (idx) => {
      const img = imagesRef.current[idx];
      if (!img || !img.complete || !img.naturalWidth) return;
      const cw = canvas.width, ch = canvas.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    startTimeRef.current = performance.now();
    const tick = (now) => {
      const elapsed = now - startTimeRef.current;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);
      const idx = Math.min(SAT_TOTAL - 1, Math.floor(p * SAT_TOTAL));
      drawFrame(idx);
      if (p < 1) animRef.current = requestAnimationFrame(tick);
      else setPhase('done');
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [phase]);

  // Resize canvas
  React.useEffect(() => {
    const resize = () => {
      const c = canvasRef.current;
      const box = containerRef.current;
      if (!c || !box) return;
      c.width = box.clientWidth;
      c.height = box.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Stat cards timing
  const card1 = progress > 0.18 && progress < 0.55;
  const card2 = progress > 0.35 && progress < 0.70;
  const card3 = progress > 0.55 && progress < 0.85;
  const card4 = progress > 0.70;
  const radar = progress > 0.50;
  const showText = phase === 'done' || progress > 0.92;

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-3xl mb-10" style={{ height: '480px', background: '#0a0a0f' }}>
      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"
        style={{ opacity: showText ? 0 : 1, transition: 'opacity 1s ease-out' }} />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none z-10"
        style={{ boxShadow: 'inset 0 0 120px 30px rgba(0,0,0,0.5)' }} />

      {/* Scan lines */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }} />

      {/* Loading spinner */}
      {phase === 'loading' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center">
          <div className="relative w-14 h-14 mb-3">
            <div className="absolute inset-0 rounded-full border-2 border-yellow-400/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-yellow-400" style={{ animation: 'sat-spin 1s linear infinite' }} />
          </div>
          <p className="text-white/50 text-xs">Loading satellite view…</p>
        </div>
      )}

      {/* Title — "Locating BMSCE" (early phase) */}
      {(phase === 'playing' || phase === 'ready') && progress < 0.2 && (
        <div className="absolute z-30 inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-white/50 text-[10px] tracking-[0.3em] uppercase mb-2">Zooming in from Space</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Locating <span style={{ background: 'linear-gradient(135deg, #ffd700, #ffaa00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BMSCE</span>
          </h2>
          <p className="text-white/40 text-xs mt-1">Bengaluru, Karnataka, India</p>
        </div>
      )}

      {/* Coordinates HUD */}
      {(phase === 'playing') && progress > 0.05 && (
        <div className="absolute z-30 bottom-3 left-3 pointer-events-none">
          <div className="font-mono text-[9px] text-green-400/70 space-y-0.5 bg-black/40 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-green-400/15">
            <p>LAT {(12.9416 + (1 - progress) * 0.5).toFixed(4)}° N</p>
            <p>LNG {(77.5656 + (1 - progress) * 0.3).toFixed(4)}° E</p>
            <p>ALT {Math.round(35786 * Math.pow(1 - progress, 3) + 0.2).toLocaleString()} km</p>
            <div className="w-full bg-green-400/20 rounded-full h-0.5 mt-1">
              <div className="bg-green-400/60 h-0.5 rounded-full" style={{ width: `${progress * 100}%`, transition: 'width 0.1s' }} />
            </div>
          </div>
        </div>
      )}

      {/* Radar pulse */}
      {radar && !showText && (
        <div className="absolute z-20 pointer-events-none" style={{ left: '50%', top: '42%', transform: 'translate(-50%,-50%)' }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="absolute rounded-full border border-yellow-400/30"
              style={{ width: `${60 + i * 50}px`, height: `${60 + i * 50}px`, left: `${-(30 + i * 25)}px`, top: `${-(30 + i * 25)}px`, animation: `sat-radar 2.5s ease-out infinite ${i * 0.5}s` }} />
          ))}
          <div className="absolute w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/60" style={{ left: '-5px', top: '-5px', animation: 'sat-dot 1.5s ease-in-out infinite' }} />
        </div>
      )}

      {/* Glassmorphic stat cards */}
      <SatStatCard icon={MapPin} value="15 Acres" label="Green Campus" pos="left" show={card1} />
      <SatStatCard icon={Users} value="350+" label="Expert Faculty" pos="right" show={card2} />
      <SatStatCard icon={Clock} value="Est. 1946" label="Legacy of Excellence" pos="bottom-left" show={card3} />
      <SatStatCard icon={Building} value="20+" label="Departments" pos="top-right" show={card4} />

      {/* Final cross-fade to campus photo with text */}
      <div className="absolute inset-0 z-20 transition-opacity duration-1000" style={{ opacity: showText ? 1 : 0 }}>
        <img src="/images/campus/building.png" alt="BMSCE Campus" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,30,60,0.92) 0%, rgba(0,86,179,0.70) 50%, rgba(0,61,128,0.35) 100%)' }} />

        {/* Floating orbs */}
        <div className="absolute top-8 right-8 w-56 h-56 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.35) 0%, transparent 70%)', animation: 'float 6s ease-in-out infinite' }} />
        <div className="absolute bottom-8 left-1/3 w-40 h-40 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite reverse' }} />

        <div className="relative z-10 p-8 md:p-12 flex flex-col justify-center h-full">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase w-fit mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,215,0,0.05))', border: '1px solid rgba(255,215,0,0.3)', color: '#ffd700' }}>
            <span className="w-2 h-2 rounded-full bg-yellow-400" style={{ animation: 'pulse-glow 2s ease-in-out infinite' }} />
            Welcome to BMSCE
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-[1.1]">
            B.M.S. College of<br />
            <span style={{ background: 'linear-gradient(135deg, #ffd700, #ffaa00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Engineering</span>
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-lg leading-relaxed mb-6">
            Founded in 1946 — India&apos;s first private engineering college.
            <span className="text-white font-medium"> NAAC A++ </span> accredited,
            <span className="text-white font-medium"> Autonomous</span>, affiliated to VTU.
          </p>
          <div className="flex flex-wrap gap-2">
            {['🏆 NAAC A++ Accredited', '🎓 Autonomous Institution', '📍 Bull Temple Road, Bengaluru', '🏅 ISO 14001:2015'].map(t =>
              <span key={t} className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white text-xs border border-white/10 hover:border-white/25 transition-colors">{t}</span>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#f8fafc] to-transparent" />
      </div>
    </div>
  );
}

/* Satellite stat card sub-component */
function SatStatCard({ icon: Icon, value, label, pos, show }) {
  const positions = {
    'left': 'left-4 md:left-8 top-1/2 -translate-y-1/2',
    'right': 'right-4 md:right-8 top-1/2 -translate-y-1/2',
    'bottom-left': 'left-4 md:left-8 bottom-16',
    'top-right': 'right-4 md:right-8 top-16',
  };
  const fromX = pos.includes('left') ? -30 : pos.includes('right') ? 30 : 0;

  return (
    <div className={`absolute z-30 ${positions[pos]} transition-all duration-700 ease-out pointer-events-none`}
      style={{ opacity: show ? 1 : 0, transform: `${positions[pos].includes('translate') ? '' : ''}translateX(${show ? 0 : fromX}px)` }}>
      <div className="relative">
        <div className="absolute -inset-0.5 rounded-xl opacity-40 blur-md" style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.3), rgba(59,130,246,0.2))' }} />
        <div className="relative bg-black/45 backdrop-blur-xl rounded-xl border border-white/15 px-4 py-3 flex items-center gap-3 min-w-[170px] shadow-xl">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,170,0,0.1))', border: '1px solid rgba(255,215,0,0.25)' }}>
            <Icon className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-yellow-400 leading-none">{value}</p>
            <p className="text-white/70 text-[10px] font-medium mt-0.5">{label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== HOME ===== */
export function HomeContent() {
  return (
    <div className="p-6 md:p-10">
      {/* ——— SATELLITE ZOOM HERO ——— */}
      <SatelliteHero />

      {/* ——— STATS GRID — Glassmorphic Animated ——— */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } } }}
      >
        {[
          { v: '1946', l: 'Established', icon: Calendar, gradient: 'from-blue-500 via-blue-600 to-indigo-700', ring: 'ring-blue-400/30' },
          { v: '20+', l: 'Departments', icon: Building, gradient: 'from-emerald-500 via-green-600 to-teal-700', ring: 'ring-emerald-400/30' },
          { v: 'A++', l: 'NAAC Grade', icon: Award, gradient: 'from-amber-400 via-yellow-500 to-orange-600', ring: 'ring-amber-400/30' },
          { v: '83rd', l: 'NIRF Rank', icon: TrendingUp, gradient: 'from-violet-500 via-purple-600 to-fuchsia-700', ring: 'ring-purple-400/30' },
          { v: '350+', l: 'Companies', icon: Users, gradient: 'from-rose-500 via-red-500 to-pink-600', ring: 'ring-rose-400/30' },
          { v: '15 Acres', l: 'Campus', icon: MapPin, gradient: 'from-cyan-500 via-sky-500 to-blue-600', ring: 'ring-cyan-400/30' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.9 },
                show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 150, damping: 15 } }
              }}
              whileHover={{ y: -6, scale: 1.04, transition: { duration: 0.25 } }}
              className={`relative overflow-hidden bg-gradient-to-br ${s.gradient} rounded-2xl p-5 text-center text-white
                         cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300 ring-1 ${s.ring}`}
            >
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)' }} />
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 bg-white" />
              <div className="relative z-10">
                <div className="w-10 h-10 mx-auto mb-2.5 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  <AnimatedCounter value={s.v} duration={1.5} />
                </p>
                <p className="text-[10px] text-white/70 uppercase tracking-[0.15em] mt-1 font-semibold">{s.l}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Inline keyframe styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(2deg); }
          66% { transform: translateY(8px) rotate(-1deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; box-shadow: 0 0 4px rgba(255,215,0,0.6); }
          50% { opacity: 0.5; box-shadow: 0 0 12px rgba(255,215,0,0.9); }
        }
        @keyframes sat-radar {
          0% { transform: scale(0.5); opacity: 0.7; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes sat-dot {
          0%, 100% { transform: scale(1); box-shadow: 0 0 4px rgba(255,215,0,0.5); }
          50% { transform: scale(1.4); box-shadow: 0 0 14px rgba(255,215,0,1); }
        }
        @keyframes sat-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />

      {/* Campus Gallery */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { src: '/images/campus/building1.png', label: 'Main Block' },
          { src: '/images/campus/slider1.jpg', label: 'Campus View' },
          { src: '/images/facilities/library2.jpg', label: 'Central Library' },
          { src: '/images/events/graduation_day.png', label: 'Graduation Day' },
        ].map((img, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="relative rounded-xl overflow-hidden aspect-[4/3] group cursor-pointer">
            <img src={img.src} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <span className="absolute bottom-2 left-3 text-white text-xs font-medium drop-shadow">{img.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Founders + About */}
      <div className="grid md:grid-cols-2 gap-5 mb-8">
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#0056b3]" /> Our Founders
          </h3>
          <div className="flex gap-5 mb-4">
            {[
              { src: '/images/founders/bm_sreenivasaiah.jpg', name: 'Late Sri. B. M. Sreenivasaiah', role: 'Founder' },
              { src: '/images/founders/bs_narayan.jpg', name: 'Late Sri. B. S. Narayan', role: 'Nurturer & Visionary' },
            ].map((f, i) => (
              <div key={i} className="text-center flex-1">
                <img src={f.src} alt={f.name} className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-blue-100 shadow" />
                <p className="text-xs font-bold text-slate-800 mt-2">{f.name}</p>
                <p className="text-[10px] text-slate-500">{f.role}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            BMSCE was established in 1946, the first private sector initiative in engineering education in India.
            75+ years of excellence producing world-class engineers globally.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['VTU Affiliated', 'NBA Accredited', 'AICTE Approved', 'UGC Recognized'].map(t =>
              <span key={t} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">{t}</span>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" /> Placement Highlights
          </h3>
          <img src="/images/placements/stats.png" alt="Placement Stats" className="rounded-lg mb-3 w-full object-contain max-h-32 bg-slate-50" />
          <ul className="space-y-2">
            {['350+ companies recruit annually from campus', '250+ companies offer packages >= 6 LPA',
              'MoUs with HPE, VOLVO, TCS, BOSCH, Mercedes-Benz', 'Pre-Employability Skill Training programs',
              'Centre for Training and Placements established'
            ].map((t, i) =>
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0" />{t}
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Accreditation Certs */}
      <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" /> Accreditations & Certifications
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { src: '/images/certificates/naac_a_plus.png', label: 'NAAC A++' },
            { src: '/images/certificates/nirf_2022.jpg', label: 'NIRF Ranking' },
            { src: '/images/certificates/iso_cert.png', label: 'ISO 14001:2015' },
            { src: '/images/certificates/outstanding_award.png', label: 'Outstanding Award' },
          ].map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 hover:shadow-md transition-shadow cursor-pointer">
              <img src={c.src} alt={c.label} className="w-full h-28 object-contain p-2" />
              <p className="text-center text-xs font-medium text-slate-700 py-2 border-t border-slate-100">{c.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===== ABOUT US ===== */
export function AboutContent({ activeSubSection }) {
  return (
    <DynamicSubSection category="about" subSection={activeSubSection}>
      <div className="p-6 md:p-10">
        <SectionHeader title="About BMSCE" icon={BookOpen} accent="Since 1946" />

        {/* Campus Banner */}
        <div className="relative rounded-xl overflow-hidden mb-8" style={{ height: '220px' }}>
          <img src="/images/campus/building1.png" alt="BMSCE Main Building" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-6 text-white">
            <h2 className="text-xl font-bold">B.M.S. College of Engineering</h2>
            <p className="text-sm text-white/70">Bull Temple Road, Basavanagudi, Bengaluru — 15 Acres Campus</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-8">
          <div className="md:col-span-2 bg-white rounded-xl p-6 border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-3">History & Legacy</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              B.M.S. College of Engineering was established in the year 1946 by Late Sri. B. M. Sreenivasaiah, a great
              visionary and philanthropist. It is the first private sector initiative in technical education in India.
              Starting with just Civil, Mechanical, and Electrical Engineering, the institution has grown to encompass
              20+ departments across engineering, science, and management.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              The College is affiliated to Visvesvaraya Technological University (VTU), Belagavi, and is approved by
              AICTE, New Delhi. BMSCE has been conferred Autonomous status by UGC, New Delhi since 2008. The institution
              has been re-accredited with &ldquo;A++&rdquo; grade by NAAC in the 3rd cycle.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              The campus is spread over 15 acres in the heart of Bengaluru, on Bull Temple Road, Basavanagudi.
              The college offers 13 Undergraduate programs, 16 Postgraduate programs, and Ph.D. programs in various disciplines.
            </p>
          </div>
          <div className="space-y-4">
            <InfoCard title="Vision" icon={Star} text="To emerge as one among the best institutions for engineering education and research, contributing to advancement of knowledge and its application for the welfare of the society." />
            <InfoCard title="Mission" icon={Zap} text="To impart quality education, promote research, provide leadership, and prepare competent professionals with ethical values who will serve as responsible members of the society." />
          </div>
        </div>

        {/* Administration — Real Photos */}
        <div className="bg-white rounded-xl p-6 border border-slate-100 mb-8">
          <h3 className="font-bold text-slate-800 mb-5 text-lg">Administration</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { name: 'Dr. B. Bheemsha', role: 'Principal', img: '/images/faculty/dr_bheemsha.jpeg' },
              { name: 'Dr. Ravi Kumar L.', role: 'Director', img: '/images/faculty/dr_ravi_kumar.jpg' },
              { name: 'Wg. Cdr. R.A. Raghavan', role: 'Registrar', img: '/images/faculty/wg_cdr_raghavan.png' },
              { name: 'Dr. Seshachalam D.', role: 'Dean (Academics)', img: '/images/faculty/dr_seshachalam.jpeg' },
            ].map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} className="text-center">
                <img src={p.img} alt={p.name}
                  className="w-24 h-24 rounded-full mx-auto object-cover border-3 border-blue-100 shadow-md mb-3" />
                <p className="text-sm font-bold text-slate-800">{p.name}</p>
                <p className="text-[11px] text-[#0056b3] font-medium">{p.role}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { title: 'Governing Body', desc: 'BMS Educational Trust oversees the governance with distinguished members from academia and industry.', icon: Shield },
            { title: 'Administration', desc: 'Led by the Principal, with Dean of Academics, Dean of R&D, COE, and departmental HoDs.', icon: Users },
            { title: 'IQAC', desc: 'Internal Quality Assurance Cell ensures quality benchmarks across teaching, research, and governance.', icon: Award },
            { title: 'Life at BMSCE', desc: 'Vibrant campus life with cultural fests, tech workshops, sports events, NCC, NSS, and 50+ clubs.', icon: Heart },
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="bg-white rounded-xl p-5 border border-slate-100 hover:shadow-md hover:border-[#0056b3]/20 transition-all cursor-pointer">
                <Icon className="w-6 h-6 text-[#0056b3] mb-2" />
                <h4 className="font-bold text-sm text-slate-800 mb-1">{c.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{c.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Campus Life Gallery */}
        <div className="mb-8">
          <h3 className="font-bold text-slate-800 mb-4 text-lg">Campus Life</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { src: '/images/events/alumni_day.png', label: 'Alumni Day' },
              { src: '/images/events/sports_day.png', label: 'Sports Day' },
              { src: '/images/events/inauguration_day.png', label: 'Inauguration' },
              { src: '/images/events/independence_day.png', label: 'Independence Day' },
              { src: '/images/events/utsav.png', label: 'Utsav Fest' },
              { src: '/images/gallery/5g_lab.jpg', label: '5G Lab' },
            ].map((img, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden aspect-square group cursor-pointer">
                <img src={img.src} alt={img.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">{img.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-3">Key Milestones</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { y: '1946', e: 'Founded by Late Sri. B. M. Sreenivasaiah with 3 departments' },
              { y: '2008', e: 'Conferred Autonomous Status by UGC' },
              { y: '2014', e: 'NAAC accreditation — Grade "A"' },
              { y: '2019', e: 'NAAC re-accreditation — Grade "A++"' },
              { y: '2020', e: 'New departments: AI & ML, CSE (Data Science), CSBS' },
              { y: '2024', e: 'NIRF Ranking: 83rd among Engineering Institutions' },
            ].map((m, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-xs font-bold text-[#0056b3] bg-blue-50 px-2 py-1 rounded min-w-[48px] text-center">{m.y}</span>
                <p className="text-sm text-slate-600">{m.e}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DynamicSubSection>
  );
}

/* ===== ADMISSIONS ===== */
export function AdmissionsContent({ activeSubSection }) {
  return (
    <DynamicSubSection category="admissions" subSection={activeSubSection}>
      <div className="p-6 md:p-10">
        <SectionHeader title="Admissions" icon={GraduationCap} accent="Apply Now" />
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {[
            {
              title: 'Under Graduation (B.E.)',
              desc: '4-year B.E. programs in 13+ disciplines. Admissions through KCET / COMEDK / Management Quota.',
              details: ['Duration: 4 Years', 'Intake: 60-120 per branch', 'Eligibility: 10+2 with PCM (45% aggregate)'],
              color: 'from-blue-500 to-blue-700'
            },
            {
              title: 'Post Graduation (M.Tech / MBA / MCA)',
              desc: '2-year PG programs in 16+ specializations. Admissions through GATE / PGCET / Management Quota.',
              details: ['M.Tech: 16 specializations', 'MBA: Management Studies', 'MCA: Computer Applications'],
              color: 'from-purple-500 to-purple-700'
            },
            {
              title: 'Ph.D. Programme',
              desc: 'Research programs in all engineering and science departments under VTU.',
              details: ['Full-time & Part-time modes', 'Research Centers in 15+ depts', 'BSN Fellowship available'],
              color: 'from-emerald-500 to-emerald-700'
            },
          ].map((prog, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all">
              <div className={`bg-gradient-to-r ${prog.color} p-5`}>
                <h3 className="text-white font-bold text-lg">{prog.title}</h3>
              </div>
              <div className="p-5">
                <p className="text-sm text-slate-600 mb-4">{prog.desc}</p>
                <ul className="space-y-2">
                  {prog.details.map((d, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="w-1.5 h-1.5 bg-[#0056b3] rounded-full flex-shrink-0" />{d}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-100 mb-6">
          <h3 className="font-bold text-slate-800 mb-4">Admission Process</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {['1. Apply Online — Submit application form with required documents',
              '2. Entrance Exam — Qualify KCET / COMEDK / GATE / PGCET',
              '3. Counselling — Attend the counselling and select branch/specialization',
              '4. Enrolment — Complete fee payment and register for the program',
            ].map((s, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-700 leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-bold text-yellow-800 mb-2">📢 International Admissions</h3>
          <p className="text-sm text-yellow-700">
            BMSCE welcomes international students. Admissions are processed through ICCR, DASA,
            and direct admission routes. Contact the International Relations Office for details.
          </p>
        </div>
      </div>
    </DynamicSubSection>
  );
}

/* ===== RESEARCH ===== */
export function ResearchContent({ activeSubSection }) {
  return (
    <DynamicSubSection category="research" subSection={activeSubSection}>
      <div className="p-6 md:p-10">
        <SectionHeader title="Research & Development" icon={FlaskConical} accent="Innovation Hub" />
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-3">About R&D at BMSCE</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              BMSCE has a dedicated R&D Directorate that promotes research across all departments.
              The institution has established Research Centers recognized by VTU in multiple disciplines.
              Faculty members are actively engaged in funded projects from DST, AICTE, VGST, KSCST, and other agencies.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              The college has filed 100+ patents, published 5000+ research papers in international journals,
              and has active MoUs with industries like HPE, VOLVO, BOSCH, Mercedes-Benz, TCS, and Infosys.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { v: '100+', l: 'Patents Filed', icon: FileText },
              { v: '5000+', l: 'Publications', icon: BookOpen },
              { v: '15+', l: 'Research Centers', icon: Building },
              { v: '₹50Cr+', l: 'Funded Projects', icon: Briefcase },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-gradient-to-br from-[#001e3c] to-[#0056b3] rounded-xl p-4 text-white text-center">
                  <Icon className="w-5 h-5 mx-auto mb-1.5 opacity-70" />
                  <p className="text-xl font-bold">{s.v}</p>
                  <p className="text-[10px] opacity-70 uppercase tracking-wider">{s.l}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-100 mb-6">
          <h3 className="font-bold text-slate-800 mb-4">Research Centers</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {['Advanced Manufacturing', 'VLSI Design & Embedded Systems', 'Structural Engineering',
              'Power Systems & Power Electronics', 'Signal Processing & Machine Learning',
              'Renewable Energy & Environment', 'Polymer Science & Composites', 'IoT & Cyber Physical Systems',
              'Biomedical Engineering', 'Data Science & Analytics', 'Microelectronics & MEMS', 'Robotics & Automation'
            ].map((c, i) => (
              <div key={i} className="px-4 py-3 bg-slate-50 rounded-lg text-sm text-slate-700 hover:bg-blue-50 hover:text-[#0056b3] transition-colors cursor-pointer">
                {c}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Key MoUs & Industry Collaborations</h3>
          <div className="flex flex-wrap gap-2">
            {['Hewlett Packard Enterprise', 'VOLVO', 'BOSCH', 'Mercedes-Benz R&D', 'TCS', 'Infosys',
              'Texas Instruments', 'ISRO', 'DRDO', 'HAL', 'BEL', 'National Instruments', 'Intel', 'Amazon AWS'
            ].map((c, i) => (
              <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium hover:border-[#0056b3] transition-colors">{c}</span>
            ))}
          </div>
        </div>
      </div>
    </DynamicSubSection>
  );
}

/* ===== PLACEMENTS ===== */
export function PlacementsContent({ activeSubSection }) {
  return (
    <DynamicSubSection category="placements" subSection={activeSubSection}>
      <div className="p-6 md:p-10">
        <SectionHeader title="Training & Placements" icon={Briefcase} accent="Career Gateway" />
        <div className="bg-gradient-to-r from-[#001e3c] to-[#0056b3] rounded-xl p-6 md:p-8 mb-8 text-white">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {[
              { v: '350+', l: 'Recruiting Companies' },
              { v: '90%+', l: 'Placement Rate' },
              { v: '₹42 LPA', l: 'Highest Package' },
              { v: '₹6+ LPA', l: 'Average Package' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-3xl font-bold">{s.v}</p>
                <p className="text-xs opacity-70 uppercase tracking-wider mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Placement Stats Images */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { src: '/images/placements/placement_stats.png', label: 'Placement Overview' },
            { src: '/images/placements/ug_stats.png', label: 'UG Placements' },
            { src: '/images/placements/pg_stats.png', label: 'PG Placements' },
            { src: '/images/placements/2023_placement.png', label: '2023 Stats' },
          ].map((img, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              <img src={img.src} alt={img.label} className="w-full h-32 object-contain p-2 bg-slate-50" />
              <p className="text-center text-xs font-medium text-slate-600 py-2 border-t border-slate-100">{img.label}</p>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-3">About the Centre for Training & Placements</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              The Centre for Training & Placements (CTP) at BMSCE coordinates placement activities for all departments.
              CTP organizes pool campus drives, company-specific drives, and provides pre-placement training to students
              including aptitude tests, group discussions, mock interviews, and soft skills development.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Companies from IT, Core Engineering, Consulting, Finance, and Research sectors visit the campus annually.
              MoU-based collaborations with HPE, VOLVO, TCS, BOSCH, and Mercedes-Benz ensure regular recruitment.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-3">Top Recruiters</h3>
            <div className="flex flex-wrap gap-2">
              {['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Samsung', 'Cisco', 'Oracle',
                'JPMorgan', 'Deloitte', 'Accenture', 'Wipro', 'Infosys', 'TCS', 'Cognizant',
                'BOSCH', 'Mercedes-Benz', 'HPE', 'VOLVO', 'Honeywell', 'ABB', 'L&T', 'Siemens'
              ].map((c, i) => (
                <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 font-medium">{c}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Placement Process</h3>
          <div className="grid md:grid-cols-5 gap-3">
            {['Pre-Placement Talk', 'Aptitude/Online Test', 'Technical Interview', 'HR Interview', 'Offer Letter'].map((s, i) => (
              <div key={i} className="text-center p-4 bg-slate-50 rounded-lg relative">
                <div className="w-8 h-8 bg-[#0056b3] text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">{i + 1}</div>
                <p className="text-xs text-slate-700 font-medium">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DynamicSubSection>
  );
}

/* ===== FACILITIES ===== */
export function FacilitiesContent({ activeSubSection }) {
  return (
    <DynamicSubSection category="facilities" subSection={activeSubSection}>
      <div className="p-6 md:p-10">
        <SectionHeader title="Facilities" icon={Building} accent="World-Class Infrastructure" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { title: 'BMS Hospital', desc: 'On-campus healthcare facility with general medicine, dental, and emergency services. Free medical check-ups for students and staff.', icon: Heart, color: 'from-red-500 to-rose-700', img: '/images/facilities/hospital1.jpg' },
            { title: 'Central Library', desc: 'Over 1,00,000 volumes, 300+ journals, DELNET membership, IEEE/Springer/Elsevier e-resources. Digital library with 200+ terminals.', icon: BookOpen, color: 'from-amber-500 to-orange-700', img: '/images/facilities/library1.jpg' },
            { title: 'Hostels', desc: 'Separate hostels for boys and girls with modern amenities, Wi-Fi, mess, study halls, and 24/7 security. Capacity: 1500+ students.', icon: Building, color: 'from-indigo-500 to-indigo-700', img: '/images/facilities/hostels.png' },
            { title: 'Data Center', desc: 'State-of-the-art data center with high-speed internet (1 Gbps), campus-wide Wi-Fi, servers for e-learning, and cloud infrastructure.', icon: Globe, color: 'from-cyan-500 to-teal-700', img: '/images/gallery/5g_lab.jpg' },
            { title: 'Sports Complex', desc: 'Indoor stadium for basketball, volleyball, badminton. Outdoor cricket ground, football field, tennis and volleyball courts, gymnasium.', icon: Trophy, color: 'from-green-500 to-emerald-700', img: '/images/events/sports_day.png' },
            { title: 'Counselling Center', desc: 'Professional counselling services for students covering academic, personal, and career guidance. Mental health awareness programs conducted regularly.', icon: Users, color: 'from-purple-500 to-violet-700', img: '/images/campus/slider3.jpg' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all">
                <div className={`bg-gradient-to-r ${f.color} p-5 flex items-center gap-3 relative overflow-hidden`} style={{ minHeight: '120px' }}>
                  {f.img && <img src={f.img} alt={f.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />}
                  <div className="relative z-10 flex items-center gap-3">
                    <Icon className="w-6 h-6 text-white" />
                    <h3 className="text-white font-bold">{f.title}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DynamicSubSection>
  );
}

/* ===== INNOVATION ===== */
export function InnovationContent({ activeSubSection }) {
  return (
    <DynamicSubSection category="innovation" subSection={activeSubSection}>
      <div className="p-6 md:p-10">
        <SectionHeader title="Innovation & Entrepreneurship" icon={Lightbulb} accent="Create, Innovate, Lead" />
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {[
            { title: 'CIIE', full: 'Centre for Innovation, Incubation & Entrepreneurship', desc: 'CIIE promotes innovation-driven entrepreneurship among students and faculty. Offers mentorship, seed funding, and workspace for startups. Incubated 20+ startups.', color: 'from-orange-500 to-red-600' },
            { title: 'IIC', full: "Institution's Innovation Council", desc: "MoE's IIC promotes innovation systematically through workshops, hackathons, idea competitions, and IPR awareness programs. BMSCE IIC has earned 4-star rating.", color: 'from-blue-500 to-indigo-600' },
            { title: 'Idea Lab', full: 'Idea Lab — Tinkering Space', desc: 'A makerspace with 3D printers, CNC machines, laser cutters, electronics workbenches, and prototyping tools. Open to all students for converting ideas into prototypes.', color: 'from-emerald-500 to-teal-600' },
          ].map((inn, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all">
              <div className={`bg-gradient-to-r ${inn.color} p-5`}>
                <h3 className="text-white font-bold text-lg">{inn.title}</h3>
                <p className="text-white/80 text-xs mt-1">{inn.full}</p>
              </div>
              <div className="p-5">
                <p className="text-sm text-slate-600 leading-relaxed">{inn.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-3">Skill Labs & Centres of Excellence</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {['Product Innovation Lab', '3D Printing Lab', 'Aerospace Lab', 'BULLZ RACING',
              'Photovoltaic Systems', 'Structural Integrity Lab', 'IoT Lab', 'Polymer Composites Lab',
              'Robotics & Embedded Systems', 'SEM/XRD Lab', 'AI & ML Center', 'Centre of Excellence'
            ].map((lab, i) => (
              <div key={i} className="px-4 py-3 bg-slate-50 rounded-lg text-sm text-slate-700 hover:bg-blue-50 hover:text-[#0056b3] transition-colors cursor-pointer border border-transparent hover:border-[#0056b3]/20">
                🔬 {lab}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DynamicSubSection>
  );
}

/* ===== CONTACT ===== */
export function ContactContent({ activeSubSection }) {
  return (
    <DynamicSubSection category="about" subSection={activeSubSection}>
      <div className="p-6 md:p-10">
        <SectionHeader title="Contact Us" icon={Phone} accent="Get in Touch" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#0056b3] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Address</p>
                  <p className="text-sm text-slate-600">B.M.S. College of Engineering, Bull Temple Road, Basavanagudi, Bengaluru – 560019, Karnataka, India</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#0056b3] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Phone</p>
                  <p className="text-sm text-slate-600">080-2662 2130 / 2662 1783 / 2661 0709</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#0056b3] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Email</p>
                  <p className="text-sm text-slate-600">principal@bmsce.ac.in | info@bmsce.ac.in</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-[#0056b3] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Website</p>
                  <a href="https://bmsce.ac.in" target="_blank" rel="noopener noreferrer" className="text-sm text-[#0056b3] hover:underline">https://www.bmsce.ac.in</a>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.4815!2d77.56495!3d12.94135!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15b277a93807%3A0x88518f37b8a4b4da!2sB.M.S.%20College%20of%20Engineering!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              className="w-full h-full min-h-[300px]" style={{ border: 0 }} allowFullScreen loading="lazy"
            />
          </div>
        </div>
      </div>
    </DynamicSubSection>
  );
}

/* ===== DOCUMENTS ===== */
export function DocumentsContent({ activeSubSection }) {
  return (
    <DynamicSubSection category="documents" subSection={activeSubSection}>
      <div className="p-6 md:p-10">
        <SectionHeader title="Documents & Accreditations" icon={FileText} accent="Transparency" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'NAAC', desc: 'National Assessment and Accreditation Council — Grade "A++" (3rd Cycle)', badge: 'A++', color: 'text-green-700 bg-green-50' },
            { title: 'NBA', desc: 'National Board of Accreditation — Programs accredited across departments', badge: 'Accredited', color: 'text-blue-700 bg-blue-50' },
            { title: 'NIRF', desc: 'National Institutional Ranking Framework — Ranked 83rd (Engineering)', badge: '#83', color: 'text-purple-700 bg-purple-50' },
            { title: 'AICTE', desc: 'All India Council for Technical Education — Approved institution', badge: 'Approved', color: 'text-orange-700 bg-orange-50' },
            { title: 'ARIIA', desc: 'Atal Ranking of Institutions on Innovation Achievements — Band "Excellent"', badge: 'Excellent', color: 'text-cyan-700 bg-cyan-50' },
            { title: 'VTU Affiliation', desc: 'Affiliated to Visvesvaraya Technological University, Belagavi', badge: 'Affiliated', color: 'text-indigo-700 bg-indigo-50' },
            { title: 'Autonomous Status', desc: 'Conferred Autonomous Status by UGC, New Delhi since 2008', badge: 'UGC', color: 'text-rose-700 bg-rose-50' },
            { title: 'ISO Certification', desc: 'ISO 14001:2015 certified for Environmental Management System', badge: 'ISO', color: 'text-teal-700 bg-teal-50' },
            { title: 'Mandatory Disclosure', desc: 'AICTE mandatory disclosure document available for download', badge: 'View', color: 'text-slate-700 bg-slate-50' },
          ].map((doc, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl p-5 border border-slate-100 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-slate-800">{doc.title}</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${doc.color}`}>{doc.badge}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{doc.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </DynamicSubSection>
  );
}

/* ===== ACTIVITIES ===== */
export function ActivitiesContent({ activeSubSection }) {
  return (
    <DynamicSubSection category="other" subSection={activeSubSection}>
      <div className="p-6 md:p-10">
        <SectionHeader title="Activities & Student Life" icon={Zap} accent="Beyond Academics" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { title: 'NCC', desc: 'National Cadet Corps — Army wing training with regular camps, parades, Republic Day participation, and adventure activities.', color: 'from-green-600 to-green-800', img: '/images/clubs/ncc.png' },
            { title: 'NSS', desc: 'National Service Scheme — Community service, blood donation drives, village adoption programs, and environmental awareness campaigns.', color: 'from-blue-600 to-blue-800', img: '/images/clubs/nss.png' },
            { title: 'IEEE Student Branch', desc: 'Active IEEE student chapter conducting technical workshops, paper presentations, industry visits, and inter-college competitions.', color: 'from-cyan-600 to-cyan-800', img: '/images/clubs/ieee.png' },
            { title: 'Phase Shift', desc: "BMSCE's flagship inter-college national-level techno-cultural fest with 50+ events, workshops, hackathons, and cultural performances.", color: 'from-purple-600 to-purple-800', img: '/images/clubs/phase_shift.png' },
            { title: 'Upagraha', desc: 'Annual cultural festival celebrating art, music, dance, drama, and literary events. Inter-college participation from across Karnataka.', color: 'from-pink-600 to-rose-800', img: '/images/events/utsav.png' },
            { title: 'Graduation Day', desc: 'Annual convocation ceremony celebrating the achievements of graduating students with distinguished guest speakers and award ceremonies.', color: 'from-amber-600 to-orange-800', img: '/images/events/graduation_ceremony.png' },
          ].map((act, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all">
              <div className={`bg-gradient-to-r ${act.color} p-5 relative overflow-hidden`} style={{ minHeight: '100px' }}>
                {act.img && <img src={act.img} alt={act.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />}
                <h3 className="text-white font-bold relative z-10">{act.title}</h3>
              </div>
              <div className="p-5">
                <p className="text-sm text-slate-600 leading-relaxed">{act.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DynamicSubSection>
  );
}

/* ===== GENERIC SECTION ===== */
export function GenericContent({ title, icon, sectionId, activeSubSection }) {
  const Icon = icon || BookOpen;
  return (
    <DynamicSubSection category={sectionId || 'other'} subSection={activeSubSection}>
      <div className="p-6 md:p-10">
        <SectionHeader title={title} icon={Icon} accent="BMSCE" />
        <div className="bg-white rounded-xl p-8 border border-slate-100 text-center">
          <Icon className="w-12 h-12 text-[#0056b3]/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-sm text-slate-500">
            Detailed content for this section is being prepared. Visit{' '}
            <a href="https://bmsce.ac.in" target="_blank" rel="noopener noreferrer" className="text-[#0056b3] underline">bmsce.ac.in</a>{' '}
            for the latest information.
          </p>
        </div>
      </div>
    </DynamicSubSection>
  );
}

/* ===== SHARED COMPONENTS ===== */
function SectionHeader({ title, icon: Icon, accent }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
      {accent && <p className="text-[#0056b3] text-xs font-semibold tracking-[0.2em] uppercase mb-1">{accent}</p>}
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
        {Icon && <Icon className="w-7 h-7 text-[#0056b3]" />}
        {title}
      </h1>
      <div className="w-16 h-1 bg-gradient-to-r from-[#0056b3] to-[#fbbf24] rounded-full mt-3" />
    </motion.div>
  );
}

function InfoCard({ title, icon: Icon, text }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-100">
      <h4 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-[#0056b3]" />} {title}
      </h4>
      <p className="text-xs text-slate-600 leading-relaxed">{text}</p>
    </div>
  );
}
