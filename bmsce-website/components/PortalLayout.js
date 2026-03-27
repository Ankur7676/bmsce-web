'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, ChevronDown, 
  BookOpen, FileText, Briefcase, Image as ImageIcon, 
  Users, Phone, BellRing, ExternalLink, GraduationCap, ArrowRight
} from 'lucide-react';

const QUICK_LINKS = [
  { label: 'First Year UG', href: 'https://bmsce.ac.in/home/Under-Graduation', icon: GraduationCap },
  { label: 'Syllabus', href: 'https://bmsce.ac.in/home/Syllabus', icon: BookOpen },
  { label: 'Tenders', href: 'https://bmsce.ac.in/home/Tenders', icon: FileText },
  { label: 'Gallery', href: 'https://bmsce.ac.in/home/CollegeGallery', icon: ImageIcon },
  { label: 'Alumni', href: '#', icon: Users },
  { label: 'Contact us', href: '#contact', icon: Phone },
];

const NAV_ITEMS = [
  {
    id: 'about', label: 'ABOUT US',
    sub: ['About BMSCE', 'Governing Body', 'Administration', 'Staff Details', 'IQAC', 'Life at BMSCE', 'Consultancy']
  },
  {
    id: 'academics', label: 'ACADEMICS',
    sub: ['Civil Engineering', 'Mechanical Engineering', 'EEE', 'ECE', 'CSE', 'ISE', 'ETE', 'EIE', 'Medical Electronics', 'Chemical Engineering', 'Biotechnology', 'MCA', 'Management Studies', 'Aerospace', 'AI & ML', 'AI & DS', 'CSE (Data Science)', 'CSE (IoT & CS)', 'CSBS']
  },
  {
    id: 'admissions', label: 'ADMISSIONS',
    sub: ['Under Graduation', 'Post Graduation', 'Ph.D', 'International Admissions', 'Syllabus']
  },
  {
    id: 'research', label: 'RESEARCH',
    sub: ['About R&D', 'Research Centers', 'Funded Projects', 'MoUs', 'Ph.D Awarded', 'Patents', 'Journal Publications']
  },
  {
    id: 'innovation', label: 'INNOVATION',
    sub: ['CIIE', 'IIC', 'Idea Lab']
  },
  {
    id: 'skilllabs', label: 'SKILL LABS',
    sub: ['Product Innovation Lab', '3D Printing Lab', 'Aerospace Lab', 'BULLZ RACING', 'IoT', 'Robotics & Embedded Systems', 'AI & ML Center']
  },
  { id: 'coe', label: 'COE', sub: ['About COE', 'Results', 'Notifications', 'Rules & Regulations'] },
  { id: 'teqip', label: 'TEQIP', sub: ['TEQIP-III', 'TEQIP-II', 'TEQIP-I'] },
  {
    id: 'facilities', label: 'FACILITIES',
    sub: ['BMS Hospital', 'Library', 'Hostel', 'Data Center', 'Sports', 'Counselling Center']
  },
  {
    id: 'placements', label: 'PLACEMENTS',
    sub: ['About Placements', 'Achievements', 'Statistics', 'Recruiting Companies', 'Training']
  },
  {
    id: 'documents', label: 'DOCUMENTS',
    sub: ['NAAC', 'NBA', 'NIRF', 'AICTE', 'Rankings', 'Mandatory Disclosure']
  },
  {
    id: 'activities', label: 'ACTIVITIES',
    sub: ['NCC', 'NSS', 'IEEE', 'Phase Shift', 'Graduation Day']
  },
];

export default function PortalLayout({ children, activeSection, onSectionChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      
      {/* === 1. TOP ANNOUNCEMENT BAR === */}
      <div className="bg-gradient-to-r from-[#eef2f6] to-[#e2e8f0] border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 py-2 flex items-center justify-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <p className="text-[#0056b3] text-sm font-semibold tracking-wide">
            Admissions for Management Quota seats are Opened for First Year
          </p>
        </div>
      </div>

      {/* === 2. MAIN HEADER (Logo, Actions) === */}
      <header className="bg-white/95 backdrop-blur-md relative z-50 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 py-4 lg:py-5 flex items-center justify-between gap-6">
          
          {/* LEFT: Logo + Name */}
          <div 
            className="flex items-center gap-4 cursor-pointer group" 
            onClick={() => onSectionChange('home')}
          >
            <img
              src="/images/bmsce_logo.jpg"
              alt="BMSCE Logo"
              className="h-[65px] w-auto object-contain drop-shadow-md rounded-full"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="flex flex-col justify-center">
              <h1 className="text-lg md:text-xl font-black text-[#003366] leading-tight tracking-tight font-serif">
                B.M.S. COLLEGE OF ENGINEERING
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] md:text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                  ESTD. 1946
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                <span className="text-[10px] md:text-[11px] font-medium text-slate-500 tracking-wide">
                  Autonomous Institute, Affiliated to VTU
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Action Buttons */}
          <div className="flex items-center gap-3 hidden lg:flex">
            <a
              href="https://bmsce.ac.in/home/Campus-Login"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-5 py-2 bg-white border border-red-500 text-red-600 text-sm font-bold rounded-full overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            >
              <div className="absolute inset-0 bg-red-50 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative flex items-center gap-2">Campus Login <ExternalLink className="w-3.5 h-3.5" /></span>
            </a>
            
            <a
              href="https://bmsce.ac.in/home/About-COE-Office"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-5 py-2 bg-[#0056b3] text-white text-sm font-bold rounded-full overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(0,86,179,0.4)]"
            >
              <div className="absolute inset-0 bg-[#003d80] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative flex items-center gap-2">Results <ExternalLink className="w-3.5 h-3.5" /></span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-full bg-slate-50 border border-slate-200 absolute right-4 top-6 shadow-sm"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* === 3. PREMIUM BLUE NAVIGATION BAR === */}
      <nav 
        className="sticky top-0 z-40 hidden lg:block bg-gradient-to-r from-[#003d80] via-[#0056b3] to-[#003d80] shadow-[0_10px_30px_-10px_rgba(0,86,179,0.5)] border-y border-white/10" 
        ref={dropdownRef}
      >
        <div className="max-w-[1400px] mx-auto flex items-stretch h-[54px]">
          {NAV_ITEMS.map((item) => (
            <div 
              key={item.id} 
              className="relative group flex-1 text-center border-r border-white/10 last:border-0"
              onMouseEnter={() => setOpenDropdown(item.id)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className={`relative w-full h-full px-2 xl:px-3 text-white text-[10px] xl:text-[11px] font-bold tracking-[0.08em] uppercase transition-all duration-300 flex justify-center items-center shadow-inner
                           ${activeSection === item.id ? 'bg-white/10 text-yellow-300' : 'hover:bg-white/5 hover:text-yellow-100'}`}
                onClick={() => {
                  onSectionChange(item.id);
                  setOpenDropdown(null);
                }}
              >
                {item.label}
                
                {/* Active Indicator Line */}
                {activeSection === item.id && (
                  <motion.div 
                    layoutId="activeBottomNav"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]"
                  />
                )}
              </button>

              {/* Mega Dropdown Hover Menu */}
              <AnimatePresence>
                {item.sub && openDropdown === item.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-[100%] left-1/2 -translate-x-1/2 mt-2 w-[260px] bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 text-left backdrop-blur-3xl"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0056b3] to-[#fbbf24]"></div>
                    <div className="py-2">
                      {item.sub.map((subItem) => (
                        <button
                          key={subItem}
                          className="group flex items-center justify-between w-full px-5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0056b3] transition-colors border-b border-gray-50 last:border-0"
                          onClick={() => {
                            onSectionChange(item.id, subItem);
                            setOpenDropdown(null);
                          }}
                        >
                          <span className="transform group-hover:translate-x-1 transition-transform">{subItem}</span>
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all text-[#0056b3]" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </nav>

      {/* === MOBILE NAV === */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 w-[85%] max-w-sm h-full bg-white z-50 overflow-y-auto shadow-2xl flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-[#003d80] tracking-wide text-lg">BMSCE Mobile</h3>
                <button onClick={() => setMobileOpen(false)} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-100">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="py-4 flex-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => (
                  <div key={item.id}>
                    <button
                      className={`w-full text-left px-6 py-4 text-sm font-bold flex justify-between items-center transition-colors
                                 ${activeSection === item.id ? 'text-[#0056b3] bg-blue-50/50 border-l-4 border-[#0056b3]' : 'text-slate-700 border-l-4 border-transparent hover:bg-slate-50'}`}
                      onClick={() => {
                        onSectionChange(item.id);
                        setMobileOpen(false);
                      }}
                    >
                      {item.label}
                      {item.sub && <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <a href="https://bmsce.ac.in/home/Campus-Login" className="flex items-center justify-center w-full py-3 bg-red-50 text-red-600 font-bold rounded-lg border border-red-200 mb-3">
                  Campus Login
                </a>
                <a href="https://bmsce.ac.in/home/About-COE-Office" className="flex items-center justify-center w-full py-3 bg-[#0056b3] text-white font-bold rounded-lg shadow-md">
                  Results Portal
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* === CONTENT AREA === */}
      <main className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* === FOOTER === */}
      <footer className="bg-[#0a1628] text-slate-400 mt-16 relative overflow-hidden">
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0056b3] via-yellow-400 to-[#0056b3]"></div>
        
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <span className="text-yellow-400 text-sm">🏛</span>
                </div>
                BMSCE
              </h4>
              <p className="text-sm leading-relaxed text-slate-400 font-medium">
                Bull Temple Road, Basavanagudi,<br />
                Bengaluru – 560019,<br />
                Karnataka, India
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <p className="text-sm flex items-center gap-3"><Phone className="w-4 h-4 text-[#fbbf24]"/> 080-2662 2130</p>
                <p className="text-sm flex items-center gap-3"><Users className="w-4 h-4 text-[#fbbf24]"/> principal@bmsce.ac.in</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">Quick Links</h4>
              <ul className="space-y-3 text-sm font-medium">
                {['About BMSCE', 'Admissions', 'Placements', 'Research', 'Results'].map((l) => (
                  <li key={l}>
                    <a href="#" className="flex items-center gap-2 text-slate-400 hover:text-white hover:translate-x-1 transition-all group">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0056b3] group-hover:bg-[#fbbf24] transition-colors"></span>
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">Departments</h4>
              <ul className="space-y-3 text-sm font-medium">
                {['Computer Science', 'Electronics & Comm.', 'Mechanical', 'Civil', 'Information Science', 'AI & ML'].map((l) => (
                  <li key={l}>
                    <a href="#" className="flex items-center gap-2 text-slate-400 hover:text-white hover:translate-x-1 transition-all group">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0056b3] group-hover:bg-[#fbbf24] transition-colors"></span>
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">Accreditations</h4>
              <div className="flex flex-wrap gap-2 mb-6">
                {['NAAC A++', 'NBA', 'AICTE', 'VTU', 'ISO 14001'].map((badge) => (
                  <span key={badge} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-[11px] font-bold tracking-wider text-slate-300 shadow-sm">
                    {badge}
                  </span>
                ))}
              </div>
              <p className="text-xs leading-relaxed text-slate-500 font-medium">
                Autonomous Institution affiliated to Visvesvaraya Technological University (VTU), Belagavi.
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium tracking-wide">
              © {new Date().getFullYear()} B.M.S. College of Engineering, Bengaluru. All Rights Reserved.
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
