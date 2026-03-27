'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, ExternalLink } from 'lucide-react';

const MAIN_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'admissions', label: 'Admissions', badge: true },
  { id: 'academics', label: 'Academics' },
  { id: 'research', label: 'Research' },
  { id: 'activities', label: 'Campus Life' },
];

const QUICK_LINKS = [
  { label: 'Campus Login', href: 'https://bmsce.ac.in/home/Campus-Login' },
  { label: 'Results', href: 'https://bmsce.ac.in/home/About-COE-Office' },
  { label: 'Swayam', href: 'https://swayam.gov.in/' },
  { label: 'Virtual Labs', href: 'https://www.vlab.co.in/' },
];

export default function ModernHeader({ activeSection, onSectionChange }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickLinksOpen, setQuickLinksOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setQuickLinksOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#001e3c]/80 backdrop-blur-md border-b border-white/10 shadow-lg transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LEFT: Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              onSectionChange('home');
              setMobileMenuOpen(false);
            }}
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white/10 p-1 border border-white/20 group-hover:border-[#fbbf24] transition-colors">
              <img 
                src="https://bmsce.ac.in/assets/img/bmsce_logo.jpg" 
                alt="BMSCE Logo" 
                className="w-full h-full object-contain rounded-full"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg md:text-xl tracking-tight leading-none group-hover:text-[#fbbf24] transition-colors">BMSCE</span>
              <span className="text-slate-300 text-[10px] font-medium tracking-widest uppercase mt-1">Est. 1946</span>
            </div>
          </div>

          {/* CENTER: Main Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-x-8">
            {MAIN_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => onSectionChange(link.id)}
                className={`relative text-sm font-medium transition-colors duration-300 ${
                  activeSection === link.id ? 'text-[#fbbf24]' : 'text-slate-200 hover:text-[#fbbf24]'
                }`}
              >
                {link.label}
                {link.badge && (
                  <span className="absolute -top-1 -right-3 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
                {activeSection === link.id && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-[#fbbf24] rounded-full"
                  />
                )}
              </button>
            ))}
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Quick Links Dropdown (Desktop) */}
            <div className="hidden lg:block relative" ref={dropdownRef}>
              <button 
                onClick={() => setQuickLinksOpen(!quickLinksOpen)}
                className="flex items-center gap-2 p-2 rounded-full text-slate-200 hover:bg-white/10 hover:text-white transition-colors border border-transparent hover:border-white/10"
                aria-label="User Menu"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              </button>

              <AnimatePresence>
                {quickLinksOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden py-2 z-50"
                  >
                    <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Quick Portals
                    </div>
                    {QUICK_LINKS.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0056b3] transition-colors"
                        onClick={() => setQuickLinksOpen(false)}
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Primary CTA */}
            <button 
              className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#001e3c] px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-[#fbbf24]/20 transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
              onClick={() => onSectionChange('admissions')}
            >
              Apply Now
            </button>

            {/* Mobile Hamburger */}
            <button
              className="lg:hidden p-2 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-[#001e3c] border-l border-white/10 shadow-2xl z-[70] lg:hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <span className="text-white font-bold text-lg">Menu</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
                <button
                  onClick={() => {
                    onSectionChange('home');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between p-4 rounded-xl text-left font-medium transition-colors ${
                    activeSection === 'home' 
                      ? 'bg-white/10 text-[#fbbf24]' 
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>Home</span>
                </button>
                {MAIN_LINKS.map(link => (
                  <button
                    key={link.id}
                    onClick={() => {
                      onSectionChange(link.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between p-4 rounded-xl text-left font-medium transition-colors ${
                      activeSection === link.id 
                        ? 'bg-white/10 text-[#fbbf24]' 
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold uppercase rounded-full border border-red-500/30">
                        Open
                      </span>
                    )}
                  </button>
                ))}

                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                    Quick Portals
                  </div>
                  <div className="grid grid-cols-2 gap-3 px-2">
                    {QUICK_LINKS.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white/5 rounded-xl border border-white/5 text-center hover:bg-white/10 transition-colors"
                      >
                        <span className="text-xs font-medium text-slate-300">{link.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
