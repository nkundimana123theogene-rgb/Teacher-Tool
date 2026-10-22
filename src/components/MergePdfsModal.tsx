import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Plus, 
  ArrowLeft,
  Files,
  Sparkles
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export interface UploadedPdfItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

interface MergePdfsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MergePdfsModal: React.FC<MergePdfsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [pdfFiles, setPdfFiles] = useState<UploadedPdfItem[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState<boolean>(false);
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [mergedBlobUrl, setMergedBlobUrl] = useState<string | null>(null);
  const [mergedPageCount, setMergedPageCount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Format bytes helper
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Handle file additions
  const processFiles = async (files: FileList | File[]) => {
    setIsProcessingFiles(true);
    setErrorMessage(null);
    const newItems: UploadedPdfItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        continue;
      }
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pageCount = pdfDoc.getPageCount();
        newItems.push({
          id: `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          file,
          name: file.name,
          size: file.size,
          pageCount
        });
      } catch (err) {
        console.error('Error loading PDF file:', file.name, err);
        // Add anyway with fallback page count
        newItems.push({
          id: `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          file,
          name: file.name,
          size: file.size,
          pageCount: 1
        });
      }
    }

    setPdfFiles(prev => [...prev, ...newItems]);
    setIsProcessingFiles(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Reordering controls
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setPdfFiles(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return updated;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === pdfFiles.length - 1) return;
    setPdfFiles(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return updated;
    });
  };

  const handleRemove = (id: string) => {
    setPdfFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleClearAll = () => {
    setPdfFiles([]);
    setMergedBlobUrl(null);
    setErrorMessage(null);
  };

  // Perform PDF Merge
  const handleMergePdfs = async () => {
    if (pdfFiles.length < 2) {
      setErrorMessage('Please add at least 2 PDF files to merge.');
      return;
    }

    setIsMerging(true);
    setErrorMessage(null);

    try {
      const mergedPdf = await PDFDocument.create();
      let totalPages = 0;

      for (const item of pdfFiles) {
        const arrayBuffer = await item.file.arrayBuffer();
        const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
          totalPages++;
        });
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes.buffer.slice(mergedPdfBytes.byteOffset, mergedPdfBytes.byteOffset + mergedPdfBytes.byteLength) as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedBlobUrl(url);
      setMergedPageCount(totalPages);

      // Auto download
      const a = document.createElement('a');
      a.href = url;
      a.download = `Merged_Document_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (err: any) {
      console.error('PDF Merge Error:', err);
      setErrorMessage(`Failed to merge PDFs: ${err.message || 'Unknown error'}`);
    } finally {
      setIsMerging(false);
    }
  };

  const totalBytes = pdfFiles.reduce((acc, f) => acc + f.size, 0);
  const totalPages = pdfFiles.reduce((acc, f) => acc + f.pageCount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fade-in text-slate-100">
      <div className="bg-slate-900 w-full max-w-3xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col my-auto">
        
        {/* HEADER BAR */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer px-2.5 py-1 rounded-xl hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Tools</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WORKSPACE AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-slate-950/60">
          
          {/* TITLE & SUBTITLE */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                <Files className="w-6 h-6" />
              </span>
              <span>Merge PDFs</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Combine multiple PDF files into a single document. Upload your files, reorder them, and merge.
            </p>
          </div>

          {/* ERROR NOTIFICATION */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SUCCESS BANNER */}
          {mergedBlobUrl && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold">PDF Merged Successfully!</span>
                  <span className="text-slate-300 ml-1.5">({mergedPageCount} pages combined). Download started automatically.</span>
                </div>
              </div>
              <a
                href={mergedBlobUrl}
                download="Merged_Document.pdf"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-md shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Again</span>
              </a>
            </div>
          )}

          {/* DRAG & DROP UPLOAD ZONE */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-amber-400 bg-slate-900/80 hover:bg-slate-900 rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all space-y-3 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              multiple
              accept=".pdf,application/pdf"
              className="hidden"
            />
            
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
              <Upload className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                Drop PDF files here or click to browse
              </h4>
              <p className="text-xs text-slate-400">
                Up to 20 files, 100 MB total
              </p>
            </div>

            {isProcessingFiles && (
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-400 pt-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing PDF files...</span>
              </div>
            )}
          </div>

          {/* LIST OF UPLOADED PDF FILES */}
          {pdfFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Files to Merge ({pdfFiles.length})
                </h4>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-2.5">
                {pdfFiles.map((pdf, idx) => (
                  <div
                    key={pdf.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-md group hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <FileText className="w-5 h-5 text-red-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                          {pdf.name}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{formatFileSize(pdf.size)}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-medium">{pdf.pageCount} {pdf.pageCount === 1 ? 'page' : 'pages'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === pdfFiles.length - 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemove(pdf.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-all cursor-pointer ml-1"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* STATS SUMMARY BAR */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 font-bold">
                <div>
                  Total Files: <strong className="text-white">{pdfFiles.length}</strong>
                </div>
                <div>
                  Total Pages: <strong className="text-amber-400">{totalPages} pages</strong>
                </div>
                <div>
                  Combined Size: <strong className="text-slate-100">{formatFileSize(totalBytes)}</strong>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Add More Files</span>
                </button>

                <button
                  type="button"
                  onClick={handleMergePdfs}
                  disabled={isMerging || pdfFiles.length < 2}
                  className="px-7 py-3 rounded-2xl text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 shadow-xl shadow-amber-950/50 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isMerging ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Merging {pdfFiles.length} PDF Files...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>Merge {pdfFiles.length} PDFs</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
