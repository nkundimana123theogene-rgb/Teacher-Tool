import React, { useState } from 'react';
import { FileText, Printer, X, Layout, Layers, Download, Check, AlertCircle } from 'lucide-react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  filename: string;
  onDownloadPdf: () => void;
  children: React.ReactNode;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  filename,
  onDownloadPdf,
  children,
}) => {
  const [viewMode, setViewMode] = useState<'page' | 'scroll'>('page');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await onDownloadPdf();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                  A4 Print-Ready
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {filename} ({viewMode === 'page' ? 'Page-by-Page Sheet View' : 'Continuous Scroll View with Print Breaks'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* VIEW MODE TOGGLE */}
            <div className="bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setViewMode('page')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'page'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950'
                }`}
                title="Page View (Sheet-by-Sheet with Page Breaks)"
              >
                <Layout className="w-3.5 h-3.5 text-orange-500" />
                <span className="hidden sm:inline">Page View</span>
              </button>
              <button
                onClick={() => setViewMode('scroll')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'scroll'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950'
                }`}
                title="Scroll View (Continuous Stream with Print Break Markers)"
              >
                <Layers className="w-3.5 h-3.5 text-blue-500" />
                <span className="hidden sm:inline">Scroll View</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOOLBAR INFO / PRINT BREAK TIP */}
        <div className="bg-amber-50 dark:bg-amber-950/30 px-5 py-2.5 border-b border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Print Break Visualizer:</strong> Elements tagged with <code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded font-mono text-[11px]">.no-break</code> are protected against awkward page splits.
            </span>
          </div>
          <div className="hidden md:flex items-center gap-3 font-semibold text-[11px]">
            <span>Margins: 10mm A4</span>
            <span>•</span>
            <span>REB Compliant</span>
          </div>
        </div>

        {/* PREVIEW CONTAINER BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-start">
          {viewMode === 'page' ? (
            /* PAGE VIEW (MOCK A4 SHEET) */
            <div className="w-full max-w-[210mm] bg-white text-slate-900 shadow-2xl rounded-sm border border-slate-300 p-8 sm:p-12 my-auto relative min-h-[297mm] flex flex-col justify-between print:shadow-none print:m-0 print:w-full">
              {/* PAGE HEADER DECORATION */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 text-xs text-slate-500">
                <span className="font-bold tracking-wider uppercase">Republic of Rwanda • Ministry of Education</span>
                <span>Nkorera Education AI Preview (Page 1)</span>
              </div>

              {/* DOCUMENT CONTENT */}
              <div className="flex-1 space-y-4 text-slate-900 text-sm">
                {children}
              </div>

              {/* PAGE FOOTER */}
              <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                <span>Document ID: {filename}</span>
                <span className="font-bold text-slate-600">Page 1 of 1 (Print Preview)</span>
                <span>REB Standards 2026</span>
              </div>
            </div>
          ) : (
            /* SCROLL VIEW (CONTINUOUS WITH DASHED PRINT BREAKS) */
            <div className="w-full max-w-[210mm] bg-white text-slate-900 shadow-2xl rounded-sm border border-slate-300 p-8 sm:p-12 space-y-8 relative">
              <div className="text-center pb-4 border-b border-dashed border-slate-300 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Continuous Stream View — Page Break Boundary Below
              </div>

              <div className="space-y-6 text-slate-900 text-sm">
                {children}
              </div>

              {/* PRINT BREAK VISUALIZER DIVIDER */}
              <div className="relative py-4 my-8">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t-2 border-dashed border-orange-400"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-orange-100 text-orange-900 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm border border-orange-300">
                    A4 Page Break (Approx. 297mm)
                  </span>
                </div>
              </div>

              <div className="text-center pt-2 text-xs text-slate-400 font-medium">
                End of Preview Stream
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Ready to export or print official document.
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Close Preview
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              title="Print document directly"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold transition-colors flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Downloaded!</span>
                </>
              ) : isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
