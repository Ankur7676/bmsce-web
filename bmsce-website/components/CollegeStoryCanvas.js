'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const TOTAL_FRAMES = 240;
const SCENARIOS = [
  { id: 's1', path: '/story/s1/ezgif-frame-', label: 'Arrival', frameCount: TOTAL_FRAMES },
  { id: 's2', path: '/story/s2/ezgif-frame-', label: 'Classroom', frameCount: TOTAL_FRAMES },
  { id: 's3', path: '/story/s3/ezgif-frame-', label: 'Sports', frameCount: TOTAL_FRAMES },
];

const TEXT_OVERLAYS = [
  {
    scenario: 0,
    start: 0.0,
    end: 0.12,
    heading: 'WELCOME TO BMSCE',
    subtext: 'Where Innovation Meets Legacy',
    accent: 'Since 1946',
  },
  {
    scenario: 0,
    start: 0.15,
    end: 0.28,
    heading: 'ENTER THE FUTURE',
    subtext: 'Gateway to India\'s Finest Engineers',
    accent: 'NAAC A++ Accredited',
  },
  {
    scenario: 1,
    start: 0.35,
    end: 0.48,
    heading: 'WORLD-CLASS MENTORS',
    subtext: 'Faculty dedicated to shaping industry leaders',
    accent: '350+ Recruiting Companies',
  },
  {
    scenario: 1,
    start: 0.52,
    end: 0.62,
    heading: 'EXCELLENCE IN EDUCATION',
    subtext: '20+ Departments across Engineering, Science & Management',
    accent: 'NIRF Ranked',
  },
  {
    scenario: 2,
    start: 0.67,
    end: 0.80,
    heading: 'CHAMPIONS RISE HERE',
    subtext: 'State-of-the-art indoor & outdoor facilities',
    accent: 'Life Beyond Books',
  },
  {
    scenario: 2,
    start: 0.85,
    end: 0.97,
    heading: 'YOUR JOURNEY BEGINS',
    subtext: 'Explore what BMSCE has to offer',
    accent: null,
    cta: true,
  },
];

function padNumber(num) {
  return String(num).padStart(3, '0');
}

export default function CollegeStoryCanvas() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef({ s1: [], s2: [], s3: [] });
  const [loadedCount, setLoadedCount] = useState(0);
  const [allLoaded, setAllLoaded] = useState(false);
  const animFrameRef = useRef(null);
  const lastFrameRef = useRef({ scenario: -1, frame: -1 });

  const totalImages = SCENARIOS.length * TOTAL_FRAMES;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Preload all images
  useEffect(() => {
    let loaded = 0;
    const loadPromises = [];

    SCENARIOS.forEach((scenario, sIdx) => {
      imagesRef.current[scenario.id] = new Array(scenario.frameCount);
      for (let i = 1; i <= scenario.frameCount; i++) {
        const promise = new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            loaded++;
            setLoadedCount(loaded);
            resolve();
          };
          img.onerror = () => {
            loaded++;
            setLoadedCount(loaded);
            resolve();
          };
          img.src = `${scenario.path}${padNumber(i)}.jpg`;
          imagesRef.current[scenario.id][i - 1] = img;
        });
        loadPromises.push(promise);
      }
    });

    Promise.all(loadPromises).then(() => {
      setAllLoaded(true);
    });
  }, [totalImages]);

  // Draw frame on canvas based on scroll
  const drawFrame = useCallback((progress) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Map progress 0-1 to scenario + frame
    // 0-0.3 -> s1, 0.3-0.6 -> s2, 0.6-1.0 -> s3
    let scenarioIdx, frameProgress;

    if (progress <= 0.3) {
      scenarioIdx = 0;
      frameProgress = progress / 0.3;
    } else if (progress <= 0.6) {
      scenarioIdx = 1;
      frameProgress = (progress - 0.3) / 0.3;
    } else {
      scenarioIdx = 2;
      frameProgress = (progress - 0.6) / 0.4;
    }

    frameProgress = Math.min(1, Math.max(0, frameProgress));
    const frameIdx = Math.min(
      TOTAL_FRAMES - 1,
      Math.floor(frameProgress * (TOTAL_FRAMES - 1))
    );

    // Only redraw if frame changed
    if (lastFrameRef.current.scenario === scenarioIdx && lastFrameRef.current.frame === frameIdx) {
      return;
    }
    lastFrameRef.current = { scenario: scenarioIdx, frame: frameIdx };

    const scenarioId = SCENARIOS[scenarioIdx].id;
    const img = imagesRef.current[scenarioId]?.[frameIdx];

    if (img && img.complete && img.naturalWidth > 0) {
      // Set canvas size to match viewport
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
      }

      // Draw image covering canvas (object-fit: cover)
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = w / h;

      let drawW, drawH, offsetX, offsetY;
      if (imgAspect > canvasAspect) {
        drawH = h;
        drawW = h * imgAspect;
        offsetX = (w - drawW) / 2;
        offsetY = 0;
      } else {
        drawW = w;
        drawH = w / imgAspect;
        offsetX = 0;
        offsetY = (h - drawH) / 2;
      }

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    }
  }, []);

  // Animation loop driven by scroll
  useEffect(() => {
    if (!allLoaded) return;

    const unsubscribe = scrollYProgress.on('change', (v) => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(() => drawFrame(v));
    });

    // Draw first frame
    drawFrame(0);

    return () => {
      unsubscribe();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [allLoaded, scrollYProgress, drawFrame]);

  // Current scroll progress for text overlays
  const progress = useTransform(scrollYProgress, (v) => v);

  return (
    <div ref={containerRef} className="story-section" style={{ height: '500vh' }}>
      <div className="story-canvas-container">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', background: '#0f172a' }}
        />
        <div className="canvas-gradient-overlay" />

        {/* Particles */}
        <Particles />

        {/* Scenario Progress Navigation */}
        <ScenarioProgress scrollYProgress={scrollYProgress} />

        {/* Text Overlays */}
        {TEXT_OVERLAYS.map((overlay, i) => (
          <TextOverlay
            key={i}
            overlay={overlay}
            scrollYProgress={scrollYProgress}
          />
        ))}

        {/* Scroll Indicator - only visible at the very beginning */}
        <ScrollIndicator scrollYProgress={scrollYProgress} />
      </div>
    </div>
  );
}

function TextOverlay({ overlay, scrollYProgress }) {
  const opacity = useTransform(scrollYProgress, (v) => {
    const fadeIn = overlay.start;
    const fullIn = overlay.start + 0.02;
    const fullOut = overlay.end - 0.02;
    const fadeOut = overlay.end;

    if (v < fadeIn || v > fadeOut) return 0;
    if (v < fullIn) return (v - fadeIn) / (fullIn - fadeIn);
    if (v > fullOut) return 1 - (v - fullOut) / (fadeOut - fullOut);
    return 1;
  });

  const y = useTransform(scrollYProgress, (v) => {
    if (v < overlay.start) return 40;
    if (v > overlay.end) return -40;
    return 0;
  });

  return (
    <motion.div
      className="story-overlay"
      style={{ opacity, y }}
    >
      <div className="max-w-3xl px-6">
        {overlay.accent && (
          <motion.p
            className="text-yellow-400 text-sm md:text-base font-semibold tracking-[0.3em] uppercase mb-4"
          >
            {overlay.accent}
          </motion.p>
        )}
        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight leading-tight"
          style={{
            textShadow: '0 4px 30px rgba(0,0,0,0.5)',
          }}
        >
          {overlay.heading}
        </motion.h1>
        <motion.p
          className="text-slate-300 text-lg md:text-xl lg:text-2xl max-w-xl mx-auto font-light"
          style={{
            textShadow: '0 2px 15px rgba(0,0,0,0.5)',
          }}
        >
          {overlay.subtext}
        </motion.p>
        {overlay.cta && (
          <motion.button
            className="cta-btn mt-8 px-8 py-4 bg-gradient-to-r from-[#0056b3] to-[#003d80] text-white 
                       rounded-full font-semibold text-lg tracking-wide
                       hover:from-[#fbbf24] hover:to-[#f59e0b] hover:text-[#0f172a]
                       transition-all duration-300 shadow-2xl
                       border border-white/10 hover:border-yellow-300/50
                       hover:scale-105 active:scale-95"
            onClick={() => {
              document.getElementById('details-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            whileHover={{ boxShadow: '0 0 40px rgba(251,191,36,0.3)' }}
          >
            EXPLORE CAMPUS DETAILS ↓
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

function ScrollIndicator({ scrollYProgress }) {
  const opacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  return (
    <motion.div className="scroll-indicator" style={{ opacity }}>
      <div className="mouse" />
      <span className="text-white/60 text-xs tracking-widest uppercase">Scroll to explore</span>
      <ChevronDown className="w-4 h-4 text-yellow-400" />
    </motion.div>
  );
}

function ScenarioProgress({ scrollYProgress }) {
  const scenarios = ['Arrival', 'Classroom', 'Sports'];

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4 items-end">
      {scenarios.map((name, i) => (
        <ScenarioDot key={i} index={i} name={name} scrollYProgress={scrollYProgress} />
      ))}
    </div>
  );
}

function ScenarioDot({ index, name, scrollYProgress }) {
  const ranges = [
    [0, 0.3],
    [0.3, 0.6],
    [0.6, 1.0],
  ];

  const isActive = useTransform(scrollYProgress, (v) => {
    return v >= ranges[index][0] && v < ranges[index][1];
  });

  const dotOpacity = useTransform(scrollYProgress, (v) => {
    return v >= ranges[index][0] && v < ranges[index][1] ? 1 : 0.4;
  });

  const dotScale = useTransform(scrollYProgress, (v) => {
    return v >= ranges[index][0] && v < ranges[index][1] ? 1.3 : 1;
  });

  return (
    <motion.div className="flex items-center gap-3" style={{ opacity: dotOpacity }}>
      <motion.span
        className="text-white text-xs font-medium tracking-wider hidden md:block"
        style={{ opacity: dotOpacity }}
      >
        {name}
      </motion.span>
      <motion.div
        className="w-3 h-3 rounded-full border-2 border-white"
        style={{
          scale: dotScale,
          backgroundColor: useTransform(scrollYProgress, (v) =>
            v >= ranges[index][0] && v < ranges[index][1] ? '#fbbf24' : 'transparent'
          ),
        }}
      />
    </motion.div>
  );
}

// Pre-computed particle data to avoid hydration mismatch from Math.random()
const PARTICLES = [
  { left: 12, top: 58, w: 2.5, h: 3.1, dur: 9.2, del: 1.3 },
  { left: 27, top: 72, w: 3.8, h: 2.4, dur: 11.5, del: 0.7 },
  { left: 45, top: 65, w: 2.1, h: 4.2, dur: 7.8, del: 3.1 },
  { left: 63, top: 82, w: 4.5, h: 2.8, dur: 13.0, del: 2.4 },
  { left: 8,  top: 91, w: 3.2, h: 3.6, dur: 8.4, del: 4.2 },
  { left: 78, top: 55, w: 2.9, h: 4.8, dur: 10.1, del: 0.5 },
  { left: 34, top: 76, w: 4.1, h: 2.2, dur: 12.3, del: 1.9 },
  { left: 91, top: 68, w: 2.3, h: 3.4, dur: 6.7, del: 3.8 },
  { left: 55, top: 88, w: 3.6, h: 2.6, dur: 9.9, del: 2.1 },
  { left: 19, top: 62, w: 4.3, h: 3.9, dur: 11.2, del: 4.6 },
  { left: 72, top: 95, w: 2.7, h: 2.1, dur: 7.3, del: 0.9 },
  { left: 41, top: 53, w: 3.4, h: 4.5, dur: 13.6, del: 3.4 },
  { left: 86, top: 79, w: 2.0, h: 3.0, dur: 8.8, del: 1.6 },
  { left: 3,  top: 85, w: 4.7, h: 2.3, dur: 10.5, del: 2.8 },
  { left: 60, top: 71, w: 3.1, h: 4.0, dur: 6.2, del: 4.0 },
  { left: 29, top: 93, w: 2.6, h: 3.3, dur: 12.7, del: 0.3 },
  { left: 50, top: 57, w: 4.0, h: 2.9, dur: 9.4, del: 3.5 },
  { left: 15, top: 84, w: 3.5, h: 4.4, dur: 11.8, del: 1.1 },
  { left: 83, top: 61, w: 2.2, h: 3.7, dur: 7.6, del: 2.6 },
  { left: 38, top: 97, w: 4.4, h: 2.5, dur: 10.9, del: 4.4 },
];

function Particles() {
  return (
    <div className="absolute inset-0 z-[6] pointer-events-none overflow-hidden">
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.w}px`,
            height: `${p.h}px`,
            background: i % 3 === 0
              ? 'rgba(251, 191, 36, 0.6)'
              : 'rgba(255, 255, 255, 0.4)',
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.del}s`,
          }}
        />
      ))}
    </div>
  );
}
