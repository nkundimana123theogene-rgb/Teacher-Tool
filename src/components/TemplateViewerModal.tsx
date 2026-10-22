import React from 'react';
import { X, FileText } from 'lucide-react';
import { CBCTemplate, RLPTemplate } from './TemplateTemplates';

interface TemplateViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateType: 'cbc' | 'rlp';
}

export const TemplateViewerModal: React.FC<TemplateViewerModalProps> = ({ isOpen, onClose, templateType }) => {
  if (!isOpen) return null;

  const title = templateType === 'cbc' ? 'CBC Lesson Plan' : 'RLP Lesson Plan';
  const description = templateType === 'cbc' ? 'Competency-Based Curriculum Template' : 'Remedial Lesson Plan Template';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 md:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-700 flex flex-col max-h-[95vh] text-slate-800">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-md">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wide text-white">{title}</h2>
              <p className="text-xs text-emerald-400 font-bold">{description}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex flex-col items-center bg-slate-100 gap-4">
          {templateType === 'cbc' ? <CBCTemplate /> : <RLPTemplate />}
        </div>
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0 text-white rounded-b-3xl">
          <span className="text-xs text-slate-400 font-bold">REB Lesson Plan Template Viewer</span>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
