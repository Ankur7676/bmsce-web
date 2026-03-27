'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Users, Award, TrendingUp, Calendar, MapPin, Building, Trophy } from 'lucide-react';

const STATS = [
  { label: 'Year Established', value: '1946', icon: Calendar, color: 'from-blue-600 to-blue-800' },
  { label: 'Departments', value: '20+', icon: Building, color: 'from-emerald-600 to-emerald-800' },
  { label: 'NAAC Grade', value: 'A++', icon: Award, color: 'from-yellow-500 to-amber-700' },
  { label: 'NIRF Rank', value: '83rd', icon: TrendingUp, color: 'from-purple-600 to-purple-800' },
  { label: 'Recruiting Companies', value: '350+', icon: Users, color: 'from-rose-600 to-rose-800' },
  { label: 'Location', value: 'Bengaluru', icon: MapPin, color: 'from-cyan-600 to-cyan-800' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

export default function HomeContent() {
  return (
    <div className="p-6 md:p-10 lg:p-12">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#001e3c] via-[#0056b3] to-[#003d80] p-8 md:p-12 mb-10"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-yellow-400/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-400/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative z-10">
          <motion.p
            className="text-yellow-400 text-xs font-semibold tracking-[0.25em] uppercase mb-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            Welcome to the Portal
          </motion.p>
          <motion.h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            B.M.S. College of<br />Engineering
          </motion.h1>
          <motion.p
            className="text-slate-300 text-lg max-w-2xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Founded in 1946, BMSCE is the first private sector initiative in engineering 
            education in India. Offering 13 Undergraduate & 16 Postgraduate courses across 
            conventional and emerging areas.
          </motion.p>
          <motion.div
            className="mt-6 flex flex-wrap gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-white text-sm border border-white/10">
              🏆 ISO 14001:2015 Certified
            </span>
            <span className="px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-white text-sm border border-white/10">
              🎓 Autonomous Institution
            </span>
            <span className="px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-white text-sm border border-white/10">
              📍 Bull Temple Road, Bengaluru
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              variants={item}
              className="stat-card group"
              style={{
                background: `linear-gradient(135deg, var(--tw-gradient-stops))`
              }}
            >
              <div className={`relative z-10 bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-center`}>
                <Icon className="w-6 h-6 mx-auto mb-2 text-white/70" />
                <p className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-[11px] text-white/70 uppercase tracking-wider">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Links / About */}
      <motion.div
        className="grid md:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#0056b3]" />
            About BMSCE
          </h3>
          <p className="text-slate-600 leading-relaxed text-sm">
            B.M.S. College of Engineering was founded by Late Sri. B. M. Sreenivasaiah, 
            a great visionary and philanthropist, and nurtured by his illustrious son 
            Late Sri. B. S. Narayan. BMSCE has completed 75+ years of dedicated service 
            in Engineering Education, producing world-class engineers who occupy coveted 
            positions globally.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">VTU Affiliated</span>
            <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">NBA Accredited</span>
            <span className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium">AICTE Approved</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Placement Highlights
          </h3>
          <ul className="space-y-3">
            {[
              'About 350+ companies visiting each year',
              '250+ companies offer pay ≥ 6 LPA',
              'MoUs with HPE, VOLVO, TCS, BOSCH, Mercedes-Benz',
              'Pool Drives conducted on BMSCE campus',
              'Pre-Employability Skill Tests for pre-final & final year'
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
