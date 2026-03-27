'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, BookOpen, Users, Eye, FlaskConical, Phone, Mail, MapPin, X } from 'lucide-react';

const DEPARTMENTS = [
  { name: 'Artificial Intelligence & Machine Learning', code: 'AI&ML', established: '2020' },
  { name: 'Biotechnology', code: 'BT', established: '2001' },
  { name: 'Chemical Engineering', code: 'CH', established: '1952' },
  { name: 'Chemistry', code: 'CY', established: '1946' },
  { name: 'Civil Engineering', code: 'CV', established: '1946' },
  { name: 'Computer Science & Engineering', code: 'CSE', established: '1984' },
  { name: 'Computer Science & Engineering (Data Science)', code: 'CSD', established: '2021' },
  { name: 'Computer Science & Engineering (Cyber Security)', code: 'CSC', established: '2021' },
  { name: 'Computer Science & Business Systems', code: 'CSBS', established: '2021' },
  { name: 'Electrical & Electronics Engineering', code: 'EEE', established: '1950' },
  { name: 'Electronics & Communication Engineering', code: 'ECE', established: '1957' },
  { name: 'Electronics & Instrumentation Engineering', code: 'EIE', established: '1981' },
  { name: 'Electronics & Telecommunication Engineering', code: 'ETE', established: '1996' },
  { name: 'Industrial Engineering & Management', code: 'IEM', established: '1979' },
  { name: 'Information Science & Engineering', code: 'ISE', established: '1993' },
  { name: 'Mathematics', code: 'MA', established: '1946' },
  { name: 'Master of Computer Applications', code: 'MCA', established: '2000' },
  { name: 'Mechanical Engineering', code: 'ME', established: '1946' },
  { name: 'Medical Electronics Engineering', code: 'ML', established: '1988' },
  { name: 'Physics', code: 'PH', established: '1946' },
  { name: 'School of Management (MBA)', code: 'MBA', established: '2009' },
];

import ExtractedDepts from '../data/extracted_departments.json';

const DEPT_DETAILS = {
  default: {
    about: 'This department at BMSCE is committed to excellence in education and research, fostering innovation and producing graduates who meet industry demands.',
    vision: 'To be a center of excellence in education, research, and innovation, producing competent professionals.',
    mission: [
      'To impart quality education through innovative teaching-learning methodologies',
      'To promote research and development activities',
      'To develop competent professionals with ethical values',
      'To strengthen industry-institute interaction',
    ],
    hod: 'Department Head',
    designation: 'Professor & Head',
    programs: ['B.E. / B.Tech (4 years)', 'M.Tech (2 years)', 'Ph.D. Programme'],
    contact: {
      email: 'hod_dept@bmsce.ac.in',
      phone: '080-2662 2130',
      location: 'BMSCE Campus, Bull Temple Rd, Bengaluru - 560019'
    }
  }
};

// Map exact codes or keys to extracted data if present
const MAP_CODE_TO_FILE_KEY = {
  'AI&ML': 'aiml',
  'BT': 'biotech',
  'CH': 'chemical',
  'CV': 'civil',
  'CSE': 'cse',
  'CSD': 'cse_ds',
  'CSBS': 'csbs',
  'EEE': 'eee',
  'ECE': 'ece',
  'EIE': 'eie',
  'ETE': 'ete',
  'IEM': 'iem',
  'ISE': 'ise',
  'MBA': 'management',
  'MCA': 'mca',
  'ME': 'mechanical',
  'ML': 'medical_electronics'
};

const HOD_IMAGES = {
  'AI&ML': '/images/hod/aiml.jpg',
  'BT': '/images/hod/biotech.jpg',
  'CH': '/images/hod/chemical.jpg',
  'CV': '/images/hod/civil.jpg',
  'CSE': '/images/hod/cse.jpg',
  'CSD': '/images/hod/cse_ds.jpg',
  'CSBS': '/images/hod/csbs.jpg',
  'EEE': '/images/hod/eee.jpg',
  'ECE': '/images/hod/ece.jpg',
  'EIE': '/images/hod/eie.jpg',
  'ETE': '/images/hod/ete.jpg',
  'IEM': '/images/hod/iem.jpg',
  'ISE': '/images/hod/ise.jpg',
  'MBA': '/images/hod/management.jpg',
  'MCA': '/images/hod/mca.jpg',
  'ME': '/images/hod/mechanical.jpg',
  'ML': '/images/hod/medical_electronics.jpg',
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

export default function DepartmentSection({ activeSubSection }) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState(null);

  useEffect(() => {
    if (activeSubSection) {
      // Find mapping
      const query = activeSubSection.toLowerCase().replace(' and ', ' & ').replace(/engineering/g, '').trim();
      
      const exactCodeMatch = DEPARTMENTS.find(d => d.code.toLowerCase() === activeSubSection.toLowerCase());
      if (exactCodeMatch) return setSelectedDept(exactCodeMatch);
      
      const fuzzyMatch = DEPARTMENTS.find(d => {
         const n = d.name.toLowerCase();
         return n.includes(query) || query.includes(d.code.toLowerCase()) || (n.includes('management') && query.includes('management'));
      });
      
      if (fuzzyMatch) {
         setSelectedDept(fuzzyMatch);
      }
    } else {
      setSelectedDept(null);
    }
  }, [activeSubSection]);

  const filtered = useMemo(() => {
    if (!search.trim()) return DEPARTMENTS;
    const q = search.toLowerCase();
    return DEPARTMENTS.filter(
      d => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)
    );
  }, [search]);

  const deptKey = MAP_CODE_TO_FILE_KEY[selectedDept?.code];
  const scrapedDetail = deptKey ? ExtractedDepts[deptKey] : null;

  // Build the dynamic detail object by falling back to default where scraped data is missing
  const detail = {
    ...DEPT_DETAILS.default,
    about: scrapedDetail?.about || DEPT_DETAILS.default.about,
    vision: scrapedDetail?.vision || DEPT_DETAILS.default.vision,
    mission: scrapedDetail?.mission ? scrapedDetail.mission.split('\n').filter(m => m.trim().length > 0) : DEPT_DETAILS.default.mission,
    hod: scrapedDetail?.hod || DEPT_DETAILS.default.hod,
    designation: scrapedDetail?.designation || DEPT_DETAILS.default.designation,
    contact: {
      ...DEPT_DETAILS.default.contact,
      email: `hod.${selectedDept?.code?.toLowerCase() || 'dept'}@bmsce.ac.in`
    }
  };

  return (
    <div className="p-6 md:p-10 lg:p-12">
      <AnimatePresence mode="wait">
        {selectedDept ? (
          <DepartmentDetail
            key="detail"
            dept={selectedDept}
            detail={detail}
            onBack={() => setSelectedDept(null)}
          />
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="mb-8">
              <motion.h1
                className="text-3xl font-bold text-slate-800 mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Departments
              </motion.h1>
              <motion.p
                className="text-slate-500 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Explore {DEPARTMENTS.length} departments across Engineering, Science & Management
              </motion.p>
            </div>

            {/* Search */}
            <motion.div
              className="relative mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search departments by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl 
                          text-slate-800 text-sm placeholder:text-slate-400
                          focus:outline-none focus:ring-2 focus:ring-[#0056b3]/20 focus:border-[#0056b3]
                          shadow-sm transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </motion.div>

            {/* Results count */}
            {search && (
              <p className="text-sm text-slate-400 mb-4">
                Found {filtered.length} department{filtered.length !== 1 ? 's' : ''}
              </p>
            )}

            {/* Grid */}
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={container}
              initial="hidden"
              animate="show"
              key={search}
            >
              {filtered.map((dept) => (
                <motion.div
                  key={dept.code}
                  variants={cardVariant}
                  className="dept-card group"
                  onClick={() => setSelectedDept(dept)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-bold text-[#0056b3] bg-blue-50 px-2.5 py-1 rounded-md tracking-wider">
                      {dept.code}
                    </span>
                    <span className="text-[11px] text-slate-400">Est. {dept.established}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 group-hover:text-[#0056b3] transition-colors leading-snug">
                    {dept.name}
                  </h3>
                  <div className="mt-4 flex items-center gap-1 text-xs text-[#0056b3] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>View Details</span>
                    <ArrowLeft className="w-3 h-3 rotate-180" />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-slate-400 text-lg">No departments found for &ldquo;{search}&rdquo;</p>
                <button
                  onClick={() => setSearch('')}
                  className="mt-2 text-[#0056b3] text-sm hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DepartmentDetail({ dept, detail, onBack }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.4 }}
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-[#0056b3] hover:text-[#003d80] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Departments
      </button>

      <div className="dept-detail-panel">
        {/* Header */}
        <div className="dept-detail-header">
          <span className="text-yellow-400 text-xs font-bold tracking-[0.2em] mb-2 block">
            {dept.code}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold">{dept.name}</h1>
          <p className="text-slate-300 text-sm mt-2">Established {dept.established}</p>
        </div>

        {/* Body */}
        <div className="dept-detail-body text-slate-700 text-sm leading-relaxed">
          {/* About */}
          <div className="dept-detail-section">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0056b3]" />
              About
            </h3>
            <p>{detail.about}</p>
          </div>

          {/* Vision */}
          <div className="dept-detail-section">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#0056b3]" />
              Vision
            </h3>
            <p>{detail.vision}</p>
          </div>

          {/* Mission */}
          <div className="dept-detail-section">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-[#0056b3]" />
              Mission
            </h3>
            <ul className="space-y-2">
              {detail.mission.map((m, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#0056b3] rounded-full mt-2 flex-shrink-0" />
                  <span className="flex-1">{m}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* HOD Info */}
          <div className="dept-detail-section bg-blue-50/50 p-6 rounded-xl border border-blue-100">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0056b3]" />
              Head of Department
            </h3>
            <div className="flex items-center gap-4">
              {HOD_IMAGES[dept.code] && (
                <img src={HOD_IMAGES[dept.code]} alt={detail.hod}
                  className="w-20 h-20 rounded-full object-cover border-2 border-blue-200 shadow-md" />
              )}
              <div>
                <p className="text-lg font-bold text-[#0056b3]">{detail.hod}</p>
                <p className="text-slate-600 font-medium">{detail.designation}</p>
              </div>
            </div>
          </div>

          {/* Programs */}
          <div className="dept-detail-section">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0056b3]" />
              Programs Offered
            </h3>
            <div className="flex flex-wrap gap-2">
              {detail.programs.map((p, i) => (
                <span key={i} className="px-4 py-2 bg-blue-50 text-[#0056b3] rounded-lg text-sm font-medium">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="dept-detail-section">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#0056b3]" />
              Contact
            </h3>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                {detail.contact.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                {detail.contact.phone}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                {detail.contact.location}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
