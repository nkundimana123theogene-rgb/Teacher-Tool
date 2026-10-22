import React, { useState, useEffect } from 'react';
import { X, Folder, FileSpreadsheet, Award, GraduationCap, FileText, Sparkles } from 'lucide-react';
import { CahierDesChargesStudio } from './CahierDesChargesStudio';
import { ProfessionalRecordsStudio } from './ProfessionalRecordsStudio';
import { TeachingRecordsStudio } from './TeachingRecordsStudio';
import { TeacherDocumentsStudio } from './TeacherDocumentsStudio';
import { SpecialCoachCertificateStudio } from './SpecialCoachCertificateStudio';

export type RecordsTab = 'cahier' | 'professional' | 'teaching' | 'documents' | 'special_coach';

interface TeacherRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: RecordsTab;
}

export const TeacherRecordsModal: React.FC<TeacherRecordsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'cahier'
}) => {
  const [activeTab, setActiveTab] = useState<RecordsTab>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 md:p-4 overflow-hidden animate-fade-in">
      <div className="bg-slate-900 w-full max-w-7xl h-[95vh] rounded-3xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col text-slate-100">
        
        {/* HEADER BAR */}
        <div className="bg-slate-950 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 border border-purple-500/40 rounded-2xl">
              <Folder className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-purple-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full">
                  MY RECORDS PORTAL
                </span>
                <span className="text-purple-400 text-xs font-bold">Official Pedagogical Archives</span>
              </div>
              <h2 className="text-base md:text-lg font-black text-white">
                Teacher Records, Cahier des Charges & Gradebook
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION BAR */}
        <div className="bg-slate-950/80 px-6 py-2.5 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('cahier')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'cahier'
                ? 'bg-purple-600 text-white shadow-lg font-black shadow-purple-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>📋 1. Cahier des Charges</span>
          </button>

          <button
            onClick={() => setActiveTab('professional')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'professional'
                ? 'bg-cyan-600 text-white shadow-lg font-black shadow-cyan-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>📁 2. Professional Records (CPD)</span>
          </button>

          <button
            onClick={() => setActiveTab('teaching')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'teaching'
                ? 'bg-emerald-600 text-white shadow-lg font-black shadow-emerald-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>🎓 3. Teaching Records (Marks & Gradebook)</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'documents'
                ? 'bg-blue-600 text-white shadow-lg font-black shadow-blue-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📄 4. Official Documents & Archive</span>
          </button>

          <button
            onClick={() => setActiveTab('special_coach')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'special_coach'
                ? 'bg-amber-600 text-white shadow-lg font-black shadow-amber-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>🏅 5. Special Coach Certificate</span>
          </button>
        </div>

        {/* WORKSPACE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'cahier' && <CahierDesChargesStudio />}
            {activeTab === 'professional' && <ProfessionalRecordsStudio />}
            {activeTab === 'teaching' && <TeachingRecordsStudio />}
            {activeTab === 'documents' && <TeacherDocumentsStudio />}
            {activeTab === 'special_coach' && <SpecialCoachCertificateStudio />}
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-3 flex items-center justify-between shrink-0 text-white rounded-b-3xl">
          <p className="text-xs text-slate-400 font-bold">
            Republic of Rwanda • Ministry of Education (MINEDUC) Teaching Standards
          </p>
          <button
            onClick={onClose}
            className="px-6 py-1.5 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
