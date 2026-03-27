'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import CollegeStoryCanvas from '@/components/CollegeStoryCanvas';
import PortalLayout from '@/components/PortalLayout';
import DepartmentSection from '@/components/DepartmentSection';
import {
  HomeContent, AboutContent, AdmissionsContent, ResearchContent,
  PlacementsContent, FacilitiesContent, InnovationContent,
  ContactContent, DocumentsContent, ActivitiesContent, GenericContent
} from '@/components/ContentPages';
import { BookOpen, FlaskConical, Briefcase, GraduationCap } from 'lucide-react';

const MapZoomScroll = dynamic(() => import('@/components/MapZoomScroll'), { ssr: false });

export default function Page() {
  const [activeSection, setActiveSection] = useState('home');
  const [activeSubSection, setActiveSubSection] = useState(null);

  const handleSectionChange = useCallback((section, subSection = null) => {
    setActiveSection(section);
    setActiveSubSection(subSection);
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case 'home': return <HomeContent />;
      case 'about': return <AboutContent activeSubSection={activeSubSection} />;
      case 'academics': return <DepartmentSection activeSubSection={activeSubSection} />;
      case 'admissions': return <AdmissionsContent activeSubSection={activeSubSection} />;
      case 'research': return <ResearchContent activeSubSection={activeSubSection} />;
      case 'innovation':
      case 'skilllabs': return <InnovationContent activeSubSection={activeSubSection} />;
      case 'coe': return <GenericContent title="Controller of Examinations" icon={BookOpen} activeSubSection={activeSubSection} sectionId="coe" />;
      case 'teqip': return <GenericContent title="TEQIP" icon={GraduationCap} activeSubSection={activeSubSection} sectionId="teqip" />;
      case 'facilities': return <FacilitiesContent activeSubSection={activeSubSection} />;
      case 'placements': return <PlacementsContent activeSubSection={activeSubSection} />;
      case 'documents': return <DocumentsContent activeSubSection={activeSubSection} />;
      case 'activities': return <ActivitiesContent activeSubSection={activeSubSection} /> ;
      case 'contact': return <ContactContent activeSubSection={activeSubSection} />;
      default: return <HomeContent activeSubSection={activeSubSection} />;
    }
  };

  return (
    <PortalLayout activeSection={activeSection} onSectionChange={handleSectionChange}>
      {activeSection === 'home' && (
        <CollegeStoryCanvas />
      )}
      <div id="details-section" className="max-w-[1400px] mx-auto mt-6">
        {renderContent()}
      </div>
    </PortalLayout>
  );
}
