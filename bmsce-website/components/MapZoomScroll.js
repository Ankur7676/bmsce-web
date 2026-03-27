'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { MapPin, Users, Clock, Building, GraduationCap, Award } from 'lucide-react';

const TOTAL_FRAMES = 231;
const FRAME_PREFIX = '/map_frames/ezgif-frame-';

/* ─── Glassmorphic Stat Card ─── */
function StatCard({ icon: Icon, value, label, sublabel, position, visible }) {
  const posClass = {
    'left': 'left-6 md:left-12 top-1/2 -translate-y-1/2',
    'right': 'right-6 md:right-12 top-1/2 -translate-y-1/2',
    'bottom': 'bottom-20 left-1/2 -translate-x-1/2',
    'top-left': 'left-6 md:left-12 top-20',
    'top-right': 'right-6 md:right-12 top-20',
    'bottom-left': 'left-6 md:left-12 bottom-24',
  }[position] || 'left-12 top-1/2 -translate-y-1/2';

  return (
    <motion.div
      className={`absolute z-30 ${posClass}`}
      initial={{ opacity: 0, scale: 0.7, y: position === 'bottom' ? 40 : 0, x: position === 'left' || position === 'top-left' || position === 'bottom-left' ? -40 : position === 'right' || position === 'top-right' ? 40 : 0 }}
      animate={{
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.7,
        y: visible ? 0 : (position === 'bottom' ? 40 : 0),
        x: visible ? 0 : (position === 'left' || position === 'top-left' || position === 'bottom-left' ? -40 : position === 'right' || position === 'top-right' ? 40 : 0),
      }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative group">
        {/* Glow ring behind card */}
        <div className="absolute -inset-1 rounded-2xl opacity-50 blur-lg transition-opacity duration-500"
          style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.3), rgba(59,130,246,0.3))' }} />

        <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/15
                        px-6 py-5 flex items-center gap-4 min-w-[200px] md:min-w-[240px]
                        shadow-2xl shadow-black/50 hover:border-white/30 transition-all duration-300">
          {/* Icon container */}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,170,0,0.1))', border: '1px solid rgba(255,215,0,0.3)' }}>
            <Icon className="w-6 h-6 text-yellow-400" />
          </div>

          <div>
            <p className="text-2xl md:text-3xl font-extrabold text-yellow-400 leading-none tracking-tight">{value}</p>
            <p className="text-white text-sm font-semibold mt-0.5">{label}</p>
            {sublabel && <p className="text-white/50 text-xs mt-0.5">{sublabel}</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Radar Pulse ─── */
function RadarPulse({ visible }) {
  return (
    <motion.div
      className="absolute z-20 pointer-events-none"
      style={{ left: '50%', top: '45%', transform: 'translate(-50%, -50%)' }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="absolute rounded-full border border-yellow-400/40"
          style={{
            width: `${80 + i * 60}px`,
            height: `${80 + i * 60}px`,
            left: `${-(40 + i * 30)}px`,
            top: `${-(40 + i * 30)}px`,
            animation: `radar-pulse 2.5s ease-out infinite ${i * 0.6}s`,
          }}
        />
      ))}
      {/* Center dot */}
      <div className="absolute w-3 h-3 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50"
        style={{ left: '-6px', top: '-6px', animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
    </motion.div>
  );
}

/* ─── Title Overlay ─── */
function TitleOverlay({ progress }) {
  const showTitle = progress < 0.15;
  const showSubtitle = progress > 0.05 && progress < 0.25;

  return (
    <>
      <motion.div
        className="absolute z-30 left-1/2 top-[15%] -translate-x-1/2 text-center pointer-events-none"
        animate={{ opacity: showTitle ? 1 : 0, y: showTitle ? 0 : -30 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-white/60 text-xs md:text-sm font-medium tracking-[0.3em] uppercase mb-2">
          Scroll to Explore
        </p>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
          Locating{' '}
          <span style={{ background: 'linear-gradient(135deg, #ffd700, #ffaa00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BMSCE
          </span>
        </h2>
        <p className="text-white/50 text-sm mt-2">Bengaluru, Karnataka, India</p>
      </motion.div>

      <motion.div
        className="absolute z-30 left-1/2 bottom-8 -translate-x-1/2 pointer-events-none"
        animate={{ opacity: showSubtitle ? 0.6 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col items-center gap-1">
          <div className="w-5 h-8 rounded-full border-2 border-white/40 flex items-start justify-center p-1">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-white/70"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <p className="text-white/40 text-[10px] tracking-widest uppercase">Scroll</p>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Coordinates Display ─── */
function CoordinatesHUD({ progress }) {
  const lat = (12.9416 + (1 - progress) * 0.5).toFixed(4);
  const lng = (77.5656 + (1 - progress) * 0.3).toFixed(4);
  const alt = Math.round(35786 * Math.pow(1 - progress, 3) + 0.2);

  return (
    <motion.div
      className="absolute z-30 bottom-4 left-4 md:bottom-6 md:left-6 pointer-events-none"
      animate={{ opacity: progress > 0.05 && progress < 0.95 ? 0.7 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="font-mono text-[10px] md:text-xs text-green-400/80 space-y-0.5 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2 border border-green-400/20">
        <p>LAT {lat}° N</p>
        <p>LNG {lng}° E</p>
        <p>ALT {alt.toLocaleString()} km</p>
        <div className="w-full bg-green-400/20 rounded-full h-1 mt-1">
          <div className="bg-green-400/60 h-1 rounded-full transition-all duration-300" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT: MapZoomScroll
   ═══════════════════════════════════════════ */
export default function MapZoomScroll() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const loadedCountRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [imagesReady, setImagesReady] = useState(false);
  const lastDrawnFrame = useRef(-1);

  // Scroll tracking
  const { scrollYProgress } = useScroll({ target: containerRef });
  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

  // Track progress for overlays
  useMotionValueEvent(scrollYProgress, 'change', (v) => setProgress(v));

  // Preload all images
  useEffect(() => {
    const imgs = [];
    let loaded = 0;
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const num = String(i).padStart(3, '0');
      img.src = `${FRAME_PREFIX}${num}.jpg`;
      img.onload = () => {
        loaded++;
        loadedCountRef.current = loaded;
        if (loaded === TOTAL_FRAMES) setImagesReady(true);
      };
      img.onerror = () => {
        loaded++;
        loadedCountRef.current = loaded;
        if (loaded === TOTAL_FRAMES) setImagesReady(true);
      };
      imgs.push(img);
    }
    imagesRef.current = imgs;
  }, []);

  // Draw frame to canvas
  const drawFrame = useCallback((index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const frameIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(index)));
    if (frameIdx === lastDrawnFrame.current) return;
    lastDrawnFrame.current = frameIdx;

    const img = imagesRef.current[frameIdx];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    // Fit image covering canvas
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, sx, sy, sw, sh);
  }, []);

  // Subscribe to frame changes
  useEffect(() => {
    const unsub = frameIndex.on('change', drawFrame);
    return unsub;
  }, [frameIndex, drawFrame]);

  // Resize canvas to viewport
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame(frameIndex.get());
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [drawFrame, frameIndex]);

  // Draw first frame once loaded
  useEffect(() => {
    if (imagesReady) drawFrame(0);
  }, [imagesReady, drawFrame]);

  // Stat card visibility based on progress
  const card1Visible = progress >= 0.15 && progress <= 0.55;
  const card2Visible = progress >= 0.35 && progress <= 0.70;
  const card3Visible = progress >= 0.50 && progress <= 0.80;
  const card4Visible = progress >= 0.60 && progress <= 0.88;
  const card5Visible = progress >= 0.72 && progress <= 0.95;
  const radarVisible = progress >= 0.55;
  const fadeOut = progress > 0.92;

  return (
    <>
      {/* Scroll container — 400vh of scroll distance */}
      <div ref={containerRef} className="relative" style={{ height: '400vh' }}>
        {/* Sticky viewport */}
        <div className="sticky top-0 w-full h-screen overflow-hidden" style={{ background: '#0a0a0f' }}>

          {/* Loading state */}
          {!imagesReady && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0f]">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-yellow-400/20" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-yellow-400"
                  style={{ animation: 'spin 1s linear infinite' }} />
              </div>
              <p className="text-white/60 text-sm font-medium">Loading satellite imagery...</p>
              <p className="text-white/30 text-xs mt-1">
                {Math.round((loadedCountRef.current / TOTAL_FRAMES) * 100)}% loaded
              </p>
            </div>
          )}

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ opacity: fadeOut ? 0 : 1, transition: 'opacity 0.6s ease-out' }}
          />

          {/* Vignette overlay */}
          <div className="absolute inset-0 pointer-events-none z-10"
            style={{ boxShadow: 'inset 0 0 150px 50px rgba(0,0,0,0.5)' }} />

          {/* Scan line effect */}
          <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
            }}
          />

          {/* Title overlay */}
          <TitleOverlay progress={progress} />

          {/* Coordinates HUD */}
          <CoordinatesHUD progress={progress} />

          {/* Radar pulse on campus location */}
          <RadarPulse visible={radarVisible} />

          {/* Stat Cards — appear on scroll beats */}
          <StatCard
            icon={MapPin} value="15 Acres" label="Campus Area"
            sublabel="Bull Temple Road, Bengaluru"
            position="left" visible={card1Visible}
          />
          <StatCard
            icon={Users} value="350+" label="Expert Faculty"
            sublabel="From IITs, IISc & Global Universities"
            position="right" visible={card2Visible}
          />
          <StatCard
            icon={Clock} value="Est. 1946" label="Legacy of Excellence"
            sublabel="India's First Private Engineering College"
            position="bottom-left" visible={card3Visible}
          />
          <StatCard
            icon={Building} value="20+" label="Departments"
            sublabel="Engineering, Science & Management"
            position="top-right" visible={card4Visible}
          />
          <StatCard
            icon={Award} value="A++" label="NAAC Grade"
            sublabel="Highest Accreditation"
            position="bottom" visible={card5Visible}
          />

          {/* Final fade-to-white transition zone */}
          <motion.div
            className="absolute inset-0 z-40 pointer-events-none bg-[#f8fafc]"
            animate={{ opacity: fadeOut ? 1 : 0 }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {/* Inline animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes radar-pulse {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); box-shadow: 0 0 6px rgba(255,215,0,0.6); }
          50% { transform: scale(1.3); box-shadow: 0 0 16px rgba(255,215,0,0.9); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </>
  );
}
