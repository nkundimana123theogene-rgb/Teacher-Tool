import React, { useState } from 'react';
import { 
  Folder, 
  FileSpreadsheet, 
  Award, 
  GraduationCap, 
  FileText 
} from 'lucide-react';
import { CahierDesChargesStudio } from './CahierDesChargesStudio';
import { ProfessionalRecordsStudio } from './ProfessionalRecordsStudio';
import { TeachingRecordsStudio } from './TeachingRecordsStudio';
import { TeacherDocumentsStudio } from './TeacherDocumentsStudio';
import { RecordsTab } from './TeacherRecordsModal';

interface TeacherRecordsPageViewProps {
  initialTab?: RecordsTab;
  onBackToDashboard: () => void;
}

export const TeacherRecordsPageView: React.FC<TeacherRecordsPageViewProps> = ({
  initialTab = 'cahier',
  onBackToDashboard
}) => {
  const [activeTab, setActiveTab] = useState<RecordsTab>(initialTab);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-100">
      
      {/* HEADER & TABS */}
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl">
              <Folder className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                  MY RECORDS PORTAL
                </span>
                <span className="text-amber-400 text-xs font-bold">Official Pedagogical Archives & Dossier</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Teacher Records & Gradebook
              </h2>
            </div>
          </div>

          <button
            onClick={onBackToDashboard}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all self-start sm:self-auto cursor-pointer"
          >
            &larr; Back to Dashboard
          </button>
        </div>

        {/* RECORDS TABS */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar-nav pt-1 pb-2">
          <button
            onClick={() => setActiveTab('cahier')}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'cahier'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50 scale-105 border border-amber-400'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>1. Cahier des Charges Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('professional')}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'professional'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50 scale-105 border border-amber-400'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4 text-cyan-400" />
            <span>2. Professional Records & CPD</span>
          </button>

          <button
            onClick={() => setActiveTab('teaching')}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'teaching'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50 scale-105 border border-amber-400'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>3. Teaching Records & Marks</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'documents'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50 scale-105 border border-amber-400'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-teal-400" />
            <span>4. Official Documents & Policies</span>
          </button>
        </div>
      </div>

      {/* ACTIVE RECORDS CONTENT */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl">
        {activeTab === 'cahier' && <CahierDesChargesStudio />}
        {activeTab === 'professional' && <ProfessionalRecordsStudio />}
        {activeTab === 'teaching' && <TeachingRecordsStudio />}
        {activeTab === 'documents' && <TeacherDocumentsStudio />}
      </div>

    </div>
  );
};
