import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Smartphone, 
  BookOpen, 
  Calendar, 
  User, 
  School
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  LessonPlanQrDetails, 
  buildLessonPlanDigitalUrl, 
  generatePrintableLessonPlanQrPdf, 
  generateQrCodeDataUrl, 
  downloadQrCodePng 
} from '../utils/qrCodeGenerator';

interface PrintableLessonPlanQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: LessonPlanQrDetails | null;
  onOpenDigitalPlan?: (planId: string, type: string) => void;
}

export const PrintableLessonPlanQrModal: React.FC<PrintableLessonPlanQrModalProps> = ({
  isOpen,
  onClose,
  plan,
  onOpenDigitalPlan
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [printFormat, setPrintFormat] = useState<'single-placard' | 'desk-cards-4up'>('single-placard');

  if (!isOpen || !plan) return null;

  const digitalUrl = buildLessonPlanDigitalUrl(plan.id, plan.type || 'cbc');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(digitalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPng = async () => {
    try {
      const dataUrl = await generateQrCodeDataUrl(digitalUrl, 600);
      const filename = `${(plan.title || 'lesson_plan').replace(/[^a-zA-Z0-9_-]/g, '_')}_QR.png`;
      downloadQrCodePng(dataUrl, filename);
    } catch (err) {
      console.error('Failed to download QR PNG:', err);
    }
  };

  const handleDownloadPdf = async (format: 'single-placard' | 'desk-cards-4up' = printFormat) => {
    setIsGeneratingPdf(true);
    try {
      await generatePrintableLessonPlanQrPdf(plan, format);
    } catch (err) {
      console.error('Failed to generate printable PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl text-white flex flex-col relative">
        
        {/* TOP ACCENT DECORATION */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* HEADER */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3 shrink-0">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <QrCode className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wide flex items-center gap-2">
              <span>Printable Lesson Plan QR Code</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full uppercase border border-emerald-500/30">
                Live Scanner
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Scan to instantly open, teach, and verify this digital lesson plan on any mobile phone or tablet
            </p>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* MAIN QR CODE DISPLAY CARD */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-6 shadow-inner">
            {/* QR BOX (WHITE BACKGROUND FOR OPTIMAL CONTRAST & SCANNING) */}
            <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center justify-center shrink-0 relative group">
              <QRCodeSVG
                value={digitalUrl}
                size={180}
                level="H"
                includeMargin={false}
              />
              <div className="mt-2 text-[9px] font-black text-slate-900 tracking-wider uppercase text-center flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-emerald-600" />
                <span>Nkorera Scan</span>
              </div>
            </div>

            {/* LESSON DETAILS & METADATA */}
            <div className="flex-1 space-y-3 text-center sm:text-left w-full">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  {plan.subject}
                </span>
                <span className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  {plan.className}
                </span>
                {plan.term && (
                  <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                    Term {plan.term}
                  </span>
                )}
                <span className="bg-purple-500/15 text-purple-300 border border-purple-500/25 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  {plan.type === 'remedial' ? 'Remedial' : plan.type === 'nursery' ? 'Nursery' : 'CBC Standard'}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-white leading-tight">
                  {plan.title || 'Untitled Lesson Plan'}
                </h3>
                {plan.unitTitle && (
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    Unit: {plan.unitTitle}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{plan.teacherName || 'Teacher'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{plan.schoolName || 'School'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{plan.date ? new Date(plan.date).toLocaleDateString() : 'Active Date'}</span>
                </div>
                {plan.duration && (
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{plan.duration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DEEP LINK URL & COPY BAR */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Direct Mobile Access Link</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Ready to share</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={digitalUrl}
                className="flex-1 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 font-mono focus:outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  copied 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* PRINT & EXPORT OPTIONS */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-300 tracking-wide flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Printable Document Formats</span>
              </span>

              {/* FORMAT SWITCHER */}
              <div className="bg-slate-900 p-0.5 rounded-lg border border-slate-800 flex gap-1 text-[10px]">
                <button
                  onClick={() => setPrintFormat('single-placard')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                    printFormat === 'single-placard' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Full A4 Placard
                </button>
                <button
                  onClick={() => setPrintFormat('desk-cards-4up')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                    printFormat === 'desk-cards-4up' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  4-in-1 Desk Cards
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <button
                onClick={() => handleDownloadPdf(printFormat)}
                disabled={isGeneratingPdf}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Print PDF'}</span>
              </button>

              <button
                onClick={handleDownloadPng}
                className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Download QR (PNG)</span>
              </button>

              {onOpenDigitalPlan && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenDigitalPlan(plan.id, plan.type || 'cbc');
                  }}
                  className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-purple-400" />
                  <span>Open Digital Plan</span>
                </button>
              )}
            </div>
          </div>

          {/* TEACHER / INSPECTOR SCANNING INSTRUCTIONS */}
          <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-200 space-y-1.5 leading-relaxed">
            <p className="font-bold flex items-center gap-1 text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>How scanning works:</span>
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[10.5px]">
              <li>Print the QR Code and place it on your lesson binder, teacher desk, or blackboard corner.</li>
              <li>When inspected or teaching, open any standard phone camera and point at the QR code.</li>
              <li>The digital lesson plan opens immediately with full CBC steps, objectives, and evaluation notes.</li>
            </ul>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBrowserPrint}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quick Print</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
