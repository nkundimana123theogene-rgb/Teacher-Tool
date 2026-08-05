import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  X, 
  RotateCcw, 
  Download, 
  Sliders, 
  Check, 
  Sparkles, 
  ZoomIn, 
  ZoomOut,
  Maximize2,
  FileCheck2,
  Eye,
  Lock
} from 'lucide-react';

export interface PrintSettings {
  orientation: 'landscape' | 'portrait';
  scale: number; // percentage, e.g. 100, 95, 90
  marginPreset: 'standard' | 'narrow' | 'wide';
  includeBackgrounds: boolean;
}

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  documentName?: string;
  defaultOrientation?: 'landscape' | 'portrait';
  onConfirmPrint: (settings: PrintSettings) => void;
  onDownloadPdf?: () => void;
  isLocked?: boolean;
  onUnlockRequest?: () => void;
  children: React.ReactNode;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  title = "Iboneza ry'Icapa na Preview (Print Setup & Preview)",
  documentName = "Certificate_Official.pdf",
  defaultOrientation = 'landscape',
  onConfirmPrint,
  onDownloadPdf,
  isLocked = false,
  onUnlockRequest,
  children,
}) => {
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(defaultOrientation);
  const [scale, setScale] = useState<number>(100);
  const [marginPreset, setMarginPreset] = useState<'standard' | 'narrow' | 'wide'>('standard');
  const [includeBackgrounds, setIncludeBackgrounds] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'settings'>('preview');

  useEffect(() => {
    setOrientation(defaultOrientation);
  }, [defaultOrientation, isOpen]);

  // Handle Ctrl+P / Cmd+P to directly print from modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (!isLocked) {
          handlePrint();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, orientation, scale, marginPreset, includeBackgrounds, isLocked]);

  if (!isOpen) return null;

  const handleReset = () => {
    setOrientation(defaultOrientation);
    setScale(100);
    setMarginPreset('standard');
    setIncludeBackgrounds(true);
  };

  const handlePrint = () => {
    if (isLocked) {
      if (onUnlockRequest) onUnlockRequest();
      return;
    }
    onConfirmPrint({
      orientation,
      scale,
      marginPreset,
      includeBackgrounds,
    });
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex flex-col justify-between overflow-hidden print:hidden select-none animate-fadeIn">
      {/* HEADER TOOLBAR */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 text-white flex items-center justify-between gap-4 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-lime-400/20">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm md:text-base text-white flex items-center gap-2 leading-tight">
              <span>{title}</span>
              {isLocked && (
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Yafunzwe
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 font-medium leading-tight mt-0.5">
              {documentName} • {orientation === 'landscape' ? 'A4 Landscape (297 x 210 mm)' : 'A4 Portrait (210 x 297 mm)'}
            </p>
          </div>
        </div>

        {/* Action Controls Header */}
        <div className="flex items-center gap-2">
          {onDownloadPdf && (
            <button
              onClick={onDownloadPdf}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all hover:scale-105 active:scale-95"
              title="Bika nka PDF"
            >
              <Download className="w-3.5 h-3.5 text-lime-400" />
              <span>PDF</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className={`px-5 py-2.5 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95 ${
              isLocked
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 shadow-amber-500/20'
                : 'bg-lime-400 hover:bg-lime-300 text-slate-950 shadow-lime-400/20 hover:scale-105'
            }`}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Printer className="w-4 h-4" />}
            <span>{isLocked ? 'Fungura yo gucapa 🔒' : 'Gucapa / Print Now 🖨️'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-600/90 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-700 hover:border-rose-500"
            title="Funga (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MAIN BODY LAYOUT: CONTROLS SIDEBAR + PREVIEW CANVAS */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* CONTROLS PANEL */}
        <div className="w-full md:w-80 lg:w-96 bg-slate-900 border-r border-slate-800 p-4 md:p-5 text-white overflow-y-auto space-y-5 shrink-0 shadow-2xl">
          {/* Orientation Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>1. Icyerekezo cy'Urupapuro (Orientation)</span>
              <span className="text-[10px] text-lime-400 font-bold">A4 Size</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center gap-2 relative ${
                  orientation === 'landscape'
                    ? 'bg-lime-500/10 border-lime-400 text-lime-300 shadow-md ring-2 ring-lime-400/30'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                {orientation === 'landscape' && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-lime-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                    ✓
                  </span>
                )}
                <div className="w-12 h-8 rounded-md border-2 border-current bg-current/20 flex items-center justify-center font-black text-[9px]">
                  297x210
                </div>
                <div className="text-center">
                  <div className="text-xs font-black">Landscape 🖼️</div>
                  <div className="text-[10px] opacity-75">Runguruye (A4)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center gap-2 relative ${
                  orientation === 'portrait'
                    ? 'bg-lime-500/10 border-lime-400 text-lime-300 shadow-md ring-2 ring-lime-400/30'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                {orientation === 'portrait' && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-lime-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                    ✓
                  </span>
                )}
                <div className="w-8 h-12 rounded-md border-2 border-current bg-current/20 flex items-center justify-center font-black text-[9px]">
                  210x297
                </div>
                <div className="text-center">
                  <div className="text-xs font-black">Portrait 📄</div>
                  <div className="text-[10px] opacity-75">Uhagaze (A4)</div>
                </div>
              </button>
            </div>
          </div>

          {/* Scale / Zoom Settings */}
          <div className="space-y-3 bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-lime-400" />
                <span>2. Scale / Ubwiyongere ({scale}%)</span>
              </label>
              <button
                type="button"
                onClick={() => setScale(100)}
                className="text-[10px] font-bold text-slate-400 hover:text-lime-400 transition-colors underline"
              >
                Reset (100%)
              </button>
            </div>

            <input
              type="range"
              min="75"
              max="125"
              step="1"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full accent-lime-400 bg-slate-700 h-2 rounded-lg cursor-pointer"
            />

            {/* Quick Presets */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[85, 95, 100, 105].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setScale(preset)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                    scale === preset
                      ? 'bg-lime-400 text-slate-950 border-lime-400 font-black shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>

          {/* Margin Preset */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-lime-400" />
              <span>3. Imbibe z'Urupapuro (Margins)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['narrow', 'standard', 'wide'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMarginPreset(m)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border capitalize transition-all text-center ${
                    marginPreset === m
                      ? 'bg-lime-500/20 text-lime-300 border-lime-400 font-black'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700/80 hover:text-slate-200'
                  }`}
                >
                  {m === 'narrow' ? 'Ntoya (4mm)' : m === 'standard' ? 'Sanzwe (6mm)' : 'Ngunyuka (10mm)'}
                </button>
              ))}
            </div>
          </div>

          {/* Background Toggle */}
          <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/60 space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-slate-200 block">Print Backgrounds & Frames</span>
                <span className="text-[10px] text-slate-400 block">Shyiramo amabara n'ibirango by'inyuma</span>
              </div>
              <input
                type="checkbox"
                checked={includeBackgrounds}
                onChange={(e) => setIncludeBackgrounds(e.target.checked)}
                className="w-5 h-5 rounded accent-lime-400 cursor-pointer"
              />
            </label>
          </div>

          {/* Quick Guidance Box */}
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl text-[11px] text-slate-300 space-y-1.5">
            <div className="font-black text-lime-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inyagisho yo gucapa neza:</span>
            </div>
            <p className="leading-relaxed opacity-90">
              Mu gucapa, hitamo option ya <strong>"Background graphics"</strong> kuri printer yawe kugira ngo amabara yose azaze neza.
            </p>
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Subiza byose ku buryo bw'Intango</span>
          </button>
        </div>

        {/* PREVIEW CANVAS STAGE */}
        <div className="flex-1 bg-slate-950 p-4 md:p-8 overflow-auto flex items-center justify-center relative min-h-[400px]">
          {/* Background studio grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

          {/* Paper Frame Simulation Container */}
          <div
            className={`transition-all duration-300 ease-out origin-center flex items-center justify-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border border-slate-700/80 bg-white relative rounded-sm overflow-hidden`}
            style={{
              width: orientation === 'landscape' ? '840px' : '595px',
              minHeight: orientation === 'landscape' ? '595px' : '840px',
              transform: `scale(${scale / 100})`,
            }}
          >
            {/* Margins preview guide line */}
            <div
              className="w-full h-full p-2 flex flex-col justify-between overflow-hidden"
              style={{
                padding: marginPreset === 'narrow' ? '4px' : marginPreset === 'wide' ? '12px' : '8px',
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER BAR */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-3 text-white flex items-center justify-between shrink-0">
        <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
          <Eye className="w-4 h-4 text-lime-400" />
          <span>Icyitonderwa: Preview ni ko bizasohoka kuri Printer yawe.</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all border border-slate-700"
          >
            Funga (Cancel)
          </button>

          <button
            onClick={handlePrint}
            className={`px-6 py-2.5 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95 ${
              isLocked
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500'
                : 'bg-lime-400 hover:bg-lime-300 text-slate-950 shadow-lime-400/20 hover:scale-105'
            }`}
          >
            {isLocked ? <Lock className="w-4 h-4 text-slate-950" /> : <Printer className="w-4 h-4 text-slate-950" />}
            <span>{isLocked ? 'Fungura Ingufuri 🔒' : 'Gucapa Muri Systeme 🖨️'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
