import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Trash2, 
  Calendar, 
  FolderOpen, 
  Search,
  FolderHeart,
  Sparkles,
  BookOpen,
  Download,
  QrCode,
  Sliders,
  Check,
  Edit,
  ArrowDownAZ,
  ArrowUpZA,
  ArrowUpDown
} from 'lucide-react';
import { 
  loadLessonPlansFromFirestore, 
  deleteLessonPlanFromFirestore,
  loadRemedialPlansFromFirestore,
  deleteRemedialPlanFromFirestore,
  loadNurseryPlansFromFirestore,
  deleteNurseryPlanFromFirestore,
  saveLessonPlanToFirestore,
  saveRemedialPlanToFirestore,
  saveNurseryPlanToFirestore
} from '../utils/firebase';
import { CbcLessonPlanData, RemedialLessonPlanData, NurseryLessonPlanData } from '../types';
import { 
  exportCbcLessonPlanToPdf, 
  exportRemedialLessonPlanToPdf, 
  exportNurseryLessonPlanToPdf 
} from '../utils/jspdfExporter';
import { PrintableLessonPlanQrModal } from './PrintableLessonPlanQrModal';
import { LessonPlanQrDetails } from '../utils/qrCodeGenerator';

interface MyLessonPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: CbcLessonPlanData) => void;
  onSelectRemedialPlan: (plan: RemedialLessonPlanData) => void;
  onSelectNurseryPlan: (plan: NurseryLessonPlanData) => void;
}

export const MyLessonPlansModal: React.FC<MyLessonPlansModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  onSelectRemedialPlan,
  onSelectNurseryPlan
}) => {
  const [plans, setPlans] = useState<CbcLessonPlanData[]>([]);
  const [remedialPlans, setRemedialPlans] = useState<RemedialLessonPlanData[]>([]);
  const [nurseryPlans, setNurseryPlans] = useState<NurseryLessonPlanData[]>([]);
  const [activeListTab, setActiveListTab] = useState<'cbc' | 'remedial' | 'nursery'>('cbc');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'a-z' | 'z-a'>('newest');
  const [qrModalPlan, setQrModalPlan] = useState<LessonPlanQrDetails | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);

  // Batch Rename States
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [selectedPlanIds, setSelectedPlanIds] = useState<Set<string>>(new Set());
  const [isRenameModalOpen, setIsRenameModalOpen] = useState<boolean>(false);
  const [renamePattern, setRenamePattern] = useState<'prefix' | 'suffix' | 'replace' | 'date' | 'custom_numbering'>('prefix');
  const [renamePrefix, setRenamePrefix] = useState<string>('');
  const [renameSuffix, setRenameSuffix] = useState<string>('');
  const [renameFindText, setRenameFindText] = useState<string>('');
  const [renameReplaceText, setRenameReplaceText] = useState<string>('');
  const [renameCustomName, setRenameCustomName] = useState<string>('');
  const [batchRenaming, setBatchRenaming] = useState<boolean>(false);

  const getActiveFilteredPlans = () => {
    if (activeListTab === 'cbc') return sortedPlans;
    if (activeListTab === 'remedial') return sortedRemedialPlans;
    return sortedNurseryPlans;
  };

  const handleSelectAll = () => {
    const active = getActiveFilteredPlans();
    setSelectedPlanIds(new Set(active.map(p => p.id)));
  };

  const handleDeselectAll = () => {
    setSelectedPlanIds(new Set());
  };

  const toggleBatchMode = () => {
    setIsBatchMode(!isBatchMode);
    setSelectedPlanIds(new Set());
  };

  const handleTabChange = (tab: 'cbc' | 'remedial' | 'nursery') => {
    setActiveListTab(tab);
    setSearchQuery('');
    setSelectedPlanIds(new Set());
    setIsBatchMode(false);
  };

  const toggleSelectPlan = (id: string) => {
    setSelectedPlanIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getRenamePreview = () => {
    const active = getActiveFilteredPlans();
    const firstSelected = active.find(p => selectedPlanIds.has(p.id));
    if (!firstSelected) return "No item selected";
    
    const originalName = activeListTab === 'cbc' 
      ? (firstSelected as CbcLessonPlanData).lessonTitle 
      : (firstSelected as RemedialLessonPlanData | NurseryLessonPlanData).lessonName;
    
    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    if (renamePattern === 'prefix') {
      return `${renamePrefix || '[Prefix]'}${originalName}`;
    }
    if (renamePattern === 'suffix') {
      return `${originalName}${renameSuffix || '[Suffix]'}`;
    }
    if (renamePattern === 'replace') {
      if (!renameFindText) return originalName;
      return originalName.split(renameFindText).join(renameReplaceText);
    }
    if (renamePattern === 'date') {
      return `${originalName} - ${today}`;
    }
    if (renamePattern === 'custom_numbering') {
      return `${renameCustomName || '[Custom Name]'} 1`;
    }
    return originalName;
  };

  const handleBatchRename = async () => {
    if (selectedPlanIds.size === 0) {
      alert("Please select at least one lesson plan to rename.");
      return;
    }

    setBatchRenaming(true);
    setErrorMsg(null);

    try {
      const today = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }); // e.g., "Aug 28, 2026"

      if (activeListTab === 'cbc') {
        const updatedList = [...plans];
        for (let i = 0; i < updatedList.length; i++) {
          const plan = updatedList[i];
          if (selectedPlanIds.has(plan.id)) {
            let currentTitle = plan.lessonTitle || "Untitled Lesson Plan";
            let newTitle = currentTitle;

            if (renamePattern === 'prefix') {
              newTitle = `${renamePrefix}${currentTitle}`;
            } else if (renamePattern === 'suffix') {
              newTitle = `${currentTitle}${renameSuffix}`;
            } else if (renamePattern === 'replace') {
              if (renameFindText) {
                newTitle = currentTitle.split(renameFindText).join(renameReplaceText);
              }
            } else if (renamePattern === 'date') {
              newTitle = `${currentTitle} - ${today}`;
            } else if (renamePattern === 'custom_numbering') {
              const selectedIndex = Array.from(selectedPlanIds).indexOf(plan.id) + 1;
              newTitle = `${renameCustomName} ${selectedIndex}`;
            }

            const updatedPlan = {
              ...plan,
              lessonTitle: newTitle,
              updatedAt: new Date().toISOString()
            };
            updatedList[i] = updatedPlan;
            await saveLessonPlanToFirestore(updatedPlan);
          }
        }
        setPlans(updatedList);
      } else if (activeListTab === 'remedial') {
        const updatedList = [...remedialPlans];
        for (let i = 0; i < updatedList.length; i++) {
          const plan = updatedList[i];
          if (selectedPlanIds.has(plan.id)) {
            let currentName = plan.lessonName || "Untitled Remedial Lesson Plan";
            let newName = currentName;

            if (renamePattern === 'prefix') {
              newName = `${renamePrefix}${currentName}`;
            } else if (renamePattern === 'suffix') {
              newName = `${currentName}${renameSuffix}`;
            } else if (renamePattern === 'replace') {
              if (renameFindText) {
                newName = currentName.split(renameFindText).join(renameReplaceText);
              }
            } else if (renamePattern === 'date') {
              newName = `${currentName} - ${today}`;
            } else if (renamePattern === 'custom_numbering') {
              const selectedIndex = Array.from(selectedPlanIds).indexOf(plan.id) + 1;
              newName = `${renameCustomName} ${selectedIndex}`;
            }

            const updatedPlan = {
              ...plan,
              lessonName: newName,
              updatedAt: new Date().toISOString()
            };
            updatedList[i] = updatedPlan;
            await saveRemedialPlanToFirestore(updatedPlan);
          }
        }
        setRemedialPlans(updatedList);
      } else if (activeListTab === 'nursery') {
        const updatedList = [...nurseryPlans];
        for (let i = 0; i < updatedList.length; i++) {
          const plan = updatedList[i];
          if (selectedPlanIds.has(plan.id)) {
            let currentName = plan.lessonName || "Untitled Nursery Lesson Plan";
            let newName = currentName;

            if (renamePattern === 'prefix') {
              newName = `${renamePrefix}${currentName}`;
            } else if (renamePattern === 'suffix') {
              newName = `${currentName}${renameSuffix}`;
            } else if (renamePattern === 'replace') {
              if (renameFindText) {
                newName = currentName.split(renameFindText).join(renameReplaceText);
              }
            } else if (renamePattern === 'date') {
              newName = `${currentName} - ${today}`;
            } else if (renamePattern === 'custom_numbering') {
              const selectedIndex = Array.from(selectedPlanIds).indexOf(plan.id) + 1;
              newName = `${renameCustomName} ${selectedIndex}`;
            }

            const updatedPlan = {
              ...plan,
              lessonName: newName,
              updatedAt: new Date().toISOString()
            };
            updatedList[i] = updatedPlan;
            await saveNurseryPlanToFirestore(updatedPlan);
          }
        }
        setNurseryPlans(updatedList);
      }

      setIsRenameModalOpen(false);
      setSelectedPlanIds(new Set());
      setIsBatchMode(false);
      // Clean states
      setRenamePrefix('');
      setRenameSuffix('');
      setRenameFindText('');
      setRenameReplaceText('');
      setRenameCustomName('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to apply batch rename. Please check your internet connection.");
    } finally {
      setBatchRenaming(false);
    }
  };

  const handleOpenQrModal = (planDetails: LessonPlanQrDetails, e: React.MouseEvent) => {
    e.stopPropagation();
    setQrModalPlan(planDetails);
    setIsQrModalOpen(true);
  };

  const fetchPlans = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [cbcData, remedialData, nurseryData] = await Promise.all([
        loadLessonPlansFromFirestore(),
        loadRemedialPlansFromFirestore(),
        loadNurseryPlansFromFirestore()
      ]);
      setPlans(cbcData);
      setRemedialPlans(remedialData);
      setNurseryPlans(nurseryData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to load your lesson plans. Please verify your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter plans based on search
  const filteredPlans = plans.filter(p => {
    const query = searchQuery.toLowerCase();
    return (
      (p.lessonTitle || '').toLowerCase().includes(query) ||
      (p.subject || '').toLowerCase().includes(query) ||
      (p.className || '').toLowerCase().includes(query) ||
      (p.unitTitle || '').toLowerCase().includes(query)
    );
  });

  const filteredRemedialPlans = remedialPlans.filter(p => {
    const query = searchQuery.toLowerCase();
    return (
      (p.lessonName || '').toLowerCase().includes(query) ||
      (p.subject || '').toLowerCase().includes(query) ||
      (p.className || '').toLowerCase().includes(query)
    );
  });

  const filteredNurseryPlans = nurseryPlans.filter(p => {
    const query = searchQuery.toLowerCase();
    return (
      (p.lessonName || '').toLowerCase().includes(query) ||
      (p.subject || '').toLowerCase().includes(query) ||
      (p.classLevel || '').toLowerCase().includes(query)
    );
  });

  const sortListByName = <T extends { lessonTitle?: string; lessonName?: string }>(list: T[], getTitle: (item: T) => string) => {
    return [...list].sort((a, b) => {
      const nameA = getTitle(a).toLowerCase();
      const nameB = getTitle(b).toLowerCase();
      if (sortOrder === 'a-z') return nameA.localeCompare(nameB);
      if (sortOrder === 'z-a') return nameB.localeCompare(nameA);
      return 0; // Default (newest / stored order)
    });
  };

  const sortedPlans = sortListByName(filteredPlans, p => p.lessonTitle || '');
  const sortedRemedialPlans = sortListByName(filteredRemedialPlans, p => p.lessonName || '');
  const sortedNurseryPlans = sortListByName(filteredNurseryPlans, p => p.lessonName || '');

  const handleDelete = async (planId: string, type: 'cbc' | 'remedial' | 'nursery', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this lesson plan?")) {
      return;
    }

    try {
      if (type === 'remedial') {
        await deleteRemedialPlanFromFirestore(planId);
        setRemedialPlans(prev => prev.filter(p => p.id !== planId));
      } else if (type === 'nursery') {
        await deleteNurseryPlanFromFirestore(planId);
        setNurseryPlans(prev => prev.filter(p => p.id !== planId));
      } else {
        await deleteLessonPlanFromFirestore(planId);
        setPlans(prev => prev.filter(p => p.id !== planId));
      }
    } catch (err: any) {
      alert("Failed to delete lesson plan. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl text-white flex flex-col relative">
        
        {/* TOP ACCENT DECORATION */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* HEADER SECTION */}
        <div className="p-6 border-b border-slate-800 space-y-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
              <FolderHeart className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wide">
                My Saved Lesson Plans
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                All your lesson plans securely and permanently stored in Cloud Firestore
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">
            {/* SEARCH BAR & SORT BUTTONS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by subject, class level, or lesson title..."
                  className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-slate-600 font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* SORT CONTROLS */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setSortOrder('newest')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    sortOrder === 'newest'
                      ? 'bg-emerald-600 text-white font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                  title="Newest / Default Order"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Default</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSortOrder('a-z')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    sortOrder === 'a-z'
                      ? 'bg-emerald-600 text-white font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                  title="Sort A to Z"
                >
                  <ArrowDownAZ className="w-3.5 h-3.5" />
                  <span>A to Z</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSortOrder('z-a')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    sortOrder === 'z-a'
                      ? 'bg-emerald-600 text-white font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                  title="Sort Z to A"
                >
                  <ArrowUpZA className="w-3.5 h-3.5" />
                  <span>Z to A</span>
                </button>
              </div>
            </div>

            {/* LIST SELECTOR TABS */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex gap-1">
              <button
                onClick={() => handleTabChange('cbc')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeListTab === 'cbc' 
                    ? 'bg-emerald-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
                id="my-plans-cbc-tab"
              >
                Standard CBC ({plans.length})
              </button>
              <button
                onClick={() => handleTabChange('remedial')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeListTab === 'remedial' 
                    ? 'bg-amber-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
                id="my-plans-remedial-tab"
              >
                <Sparkles className="w-3 h-3" />
                Remedial ({remedialPlans.length})
              </button>
              <button
                onClick={() => handleTabChange('nursery')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeListTab === 'nursery' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
                id="my-plans-nursery-tab"
              >
                <BookOpen className="w-3 h-3" />
                Nursery ({nurseryPlans.length})
              </button>
            </div>
          </div>

          {/* BATCH ACTION TRIGGER BAR */}
          {getActiveFilteredPlans().length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3.5 border-t border-slate-800/50">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Showing {getActiveFilteredPlans().length} saved plans</span>
              </div>
              <button
                onClick={toggleBatchMode}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                  isBatchMode 
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20' 
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
                id="toggle-batch-mode-btn"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isBatchMode ? "Cancel Batch Selection" : "Batch Actions (Rename)"}</span>
              </button>
            </div>
          )}
        </div>

        {/* MAIN BODY CONTENTS */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-300 rounded-xl text-xs font-bold leading-relaxed">
              {errorMsg}
            </div>
          )}

          {/* BATCH ORGANIZING CONTROLS */}
          {isBatchMode && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3.5 animate-fade-in relative overflow-hidden shrink-0">
              {/* Decorative accent background indicator matching tab theme color */}
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${
                activeListTab === 'cbc' 
                  ? 'from-emerald-500 to-teal-500' 
                  : activeListTab === 'remedial'
                    ? 'from-amber-500 to-orange-500'
                    : 'from-blue-500 to-indigo-500'
              }`} />
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-black uppercase text-white tracking-wider animate-pulse">
                      Batch Rename Mode Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Selected <strong className="text-emerald-400 font-extrabold">{selectedPlanIds.size}</strong> out of <strong className="text-slate-300 font-extrabold">{getActiveFilteredPlans().length}</strong> filtered {activeListTab.toUpperCase()} plans.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors cursor-pointer"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors cursor-pointer"
                  >
                    Clear Selection
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedPlanIds.size === 0) {
                        alert("Please select at least one plan to rename first.");
                        return;
                      }
                      setIsRenameModalOpen(true);
                    }}
                    disabled={selectedPlanIds.size === 0}
                    className={`px-4 py-1.5 rounded-lg text-[11px] font-black flex items-center gap-1.5 shadow-md transition-all ${
                      selectedPlanIds.size > 0 
                        ? activeListTab === 'cbc'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95'
                          : activeListTab === 'remedial'
                            ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer active:scale-95'
                            : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Rename Selected ({selectedPlanIds.size})</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <span className="animate-spin rounded-full h-8 w-8 border-3 border-emerald-500 border-t-transparent" />
              <p className="text-xs text-slate-400 font-bold animate-pulse">Loading your lesson plans...</p>
            </div>
          ) : activeListTab === 'cbc' ? (
            /* ==================== SUB-LIST 1: CBC PLANS ==================== */
            sortedPlans.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-4 bg-slate-950/40 rounded-2xl border border-slate-800/50">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-500">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-xs mx-auto">
                  <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">
                    No CBC Plans Found
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {searchQuery 
                      ? "No plans matched your search query. Try another term!"
                      : "You haven't saved any lesson plans to Cloud Firestore yet. Generate a new plan and save it!"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {sortedPlans.map((plan) => (
                  <div 
                    key={plan.id}
                    onClick={isBatchMode ? () => toggleSelectPlan(plan.id) : () => onSelectPlan(plan)}
                    className={`bg-slate-950/75 border rounded-2xl p-4 transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-95 group relative flex flex-col justify-between gap-3 shadow-md ${
                      isBatchMode 
                        ? selectedPlanIds.has(plan.id)
                          ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30'
                          : 'border-slate-800 hover:border-slate-700'
                        : 'border-slate-800 hover:border-emerald-500/50'
                    }`}
                  >
                    {isBatchMode && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedPlanIds.has(plan.id) 
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950' 
                            : 'border-slate-600 bg-slate-900'
                        }`}>
                          {selectedPlanIds.has(plan.id) && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-[8.5px] font-black px-2 py-0.5 rounded-full uppercase">
                          {plan.subject}
                        </span>
                        <span className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 text-[8.5px] font-black px-2 py-0.5 rounded-full uppercase">
                          {plan.className}
                        </span>
                        <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[8.5px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Term {plan.term}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-xs text-white leading-snug group-hover:text-emerald-300 transition-colors">
                          {plan.lessonTitle || "Untitled Lesson Plan"}
                        </h4>
                        {plan.unitTitle && (
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                            Unit: {plan.unitTitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {!isBatchMode ? (
                      <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>{plan.date ? new Date(plan.date).toLocaleDateString() : 'No date'}</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleOpenQrModal({
                              id: plan.id,
                              title: plan.lessonTitle,
                              subject: plan.subject,
                              className: plan.className,
                              type: 'cbc',
                              schoolName: plan.schoolName,
                              teacherName: plan.teacherName,
                              date: plan.date,
                              term: plan.term,
                              unitTitle: plan.unitTitle,
                              duration: plan.duration
                            }, e)}
                            className="p-1.5 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded-lg transition-colors cursor-pointer"
                            title="Generate Printable QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportCbcLessonPlanToPdf(plan);
                            }}
                            className="p-1.5 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded-lg transition-colors cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(plan.id, 'cbc', e)}
                            className="p-1.5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg transition-colors cursor-pointer"
                            title="Delete Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1.5 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded-lg transition-colors flex items-center gap-1 font-bold text-[10px]"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>Open & Edit</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-[10px]">
                        <span className="text-slate-500 flex items-center gap-1 font-semibold">
                          <Calendar className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                          <span>{plan.date ? new Date(plan.date).toLocaleDateString() : 'No date'}</span>
                        </span>
                        <span className={`font-black uppercase text-[9px] ${selectedPlanIds.has(plan.id) ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`}>
                          {selectedPlanIds.has(plan.id) ? 'Selected' : 'Click to Select'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : activeListTab === 'remedial' ? (
            /* ==================== SUB-LIST 2: REMEDIAL PLANS ==================== */
            sortedRemedialPlans.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-4 bg-slate-950/40 rounded-2xl border border-slate-800/50">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-500">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-xs mx-auto">
                  <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">
                    No Remedial Plans Found
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {searchQuery 
                      ? "No remedial plans matched your search query. Try another term!"
                      : "You haven't saved any remedial lesson plans to Cloud Firestore yet. Generate a new remedial plan and save it!"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {sortedRemedialPlans.map((plan) => (
                  <div 
                    key={plan.id}
                    onClick={isBatchMode ? () => toggleSelectPlan(plan.id) : () => onSelectRemedialPlan(plan)}
                    className={`bg-slate-950/75 border rounded-2xl p-4 transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-95 group relative flex flex-col justify-between gap-3 shadow-md ${
                      isBatchMode 
                        ? selectedPlanIds.has(plan.id)
                          ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30'
                          : 'border-slate-800 hover:border-slate-700'
                        : 'border-slate-800 hover:border-amber-500/50'
                    }`}
                  >
                    {isBatchMode && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedPlanIds.has(plan.id) 
                            ? 'bg-amber-500 border-amber-500 text-slate-950' 
                            : 'border-slate-600 bg-slate-900'
                        }`}>
                          {selectedPlanIds.has(plan.id) && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="bg-amber-500/15 text-amber-300 border border-amber-500/25 text-[8.5px] font-black px-2 py-0.5 rounded-full uppercase">
                          {plan.subject}
                        </span>
                        <span className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 text-[8.5px] font-black px-2 py-0.5 rounded-full uppercase">
                          {plan.className}
                        </span>
                        <span className="bg-teal-500/15 text-teal-300 border border-teal-500/25 text-[8.5px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Remedial
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-xs text-white leading-snug group-hover:text-amber-300 transition-colors">
                          {plan.lessonName || "Untitled Remedial Lesson Plan"}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          G1 Count: {plan.group1Count} | G2 Count: {plan.group2Count}
                        </p>
                      </div>
                    </div>

                    {!isBatchMode ? (
                      <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>{plan.date ? new Date(plan.date).toLocaleDateString() : 'No date'}</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleOpenQrModal({
                              id: plan.id,
                              title: plan.lessonName,
                              subject: plan.subject,
                              className: plan.className,
                              type: 'remedial',
                              teacherName: plan.teacherName,
                              date: plan.date,
                              duration: plan.period
                            }, e)}
                            className="p-1.5 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 rounded-lg transition-colors cursor-pointer"
                            title="Generate Printable QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportRemedialLessonPlanToPdf(plan, plan.language || 'English');
                            }}
                            className="p-1.5 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 rounded-lg transition-colors cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(plan.id, 'remedial', e)}
                            className="p-1.5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg transition-colors cursor-pointer"
                            title="Delete Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1.5 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 rounded-lg transition-colors flex items-center gap-1 font-bold text-[10px]"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>Open & Edit</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-[10px]">
                        <span className="text-slate-500 flex items-center gap-1 font-semibold">
                          <Calendar className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                          <span>{plan.date ? new Date(plan.date).toLocaleDateString() : 'No date'}</span>
                        </span>
                        <span className={`font-black uppercase text-[9px] ${selectedPlanIds.has(plan.id) ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`}>
                          {selectedPlanIds.has(plan.id) ? 'Selected' : 'Click to Select'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            /* ==================== SUB-LIST 3: NURSERY PLANS ==================== */
            sortedNurseryPlans.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-4 bg-slate-950/40 rounded-2xl border border-slate-800/50">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-500">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-xs mx-auto">
                  <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">
                    No Nursery Plans Found
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {searchQuery 
                      ? "No nursery plans matched your search query. Try another term!"
                      : "You haven't saved any nursery lesson plans to Cloud Firestore yet. Generate a new nursery plan and save it!"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {sortedNurseryPlans.map((plan) => (
                  <div 
                    key={plan.id}
                    onClick={isBatchMode ? () => toggleSelectPlan(plan.id) : () => onSelectNurseryPlan(plan)}
                    className={`bg-slate-950/75 border rounded-2xl p-4 transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-95 group relative flex flex-col justify-between gap-3 shadow-md ${
                      isBatchMode 
                        ? selectedPlanIds.has(plan.id)
                          ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/30'
                          : 'border-slate-800 hover:border-slate-700'
                        : 'border-slate-800 hover:border-blue-500/50'
                    }`}
                  >
                    {isBatchMode && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedPlanIds.has(plan.id) 
                            ? 'bg-blue-500 border-blue-500 text-slate-950' 
                            : 'border-slate-600 bg-slate-900'
                        }`}>
                          {selectedPlanIds.has(plan.id) && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="bg-blue-500/15 text-blue-300 border border-blue-500/25 text-[8.5px] font-black px-2 py-0.5 rounded-full uppercase">
                          {plan.subject}
                        </span>
                        <span className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 text-[8.5px] font-black px-2 py-0.5 rounded-full uppercase">
                          {plan.classLevel}
                        </span>
                        <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-[8.5px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                          <BookOpen className="w-2.5 h-2.5" /> Nursery
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-xs text-white leading-snug group-hover:text-blue-300 transition-colors">
                          {plan.lessonName || "Untitled Nursery Lesson Plan"}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                          {plan.instructionalObjective}
                        </p>
                      </div>
                    </div>

                    {!isBatchMode ? (
                      <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>{plan.date ? new Date(plan.date).toLocaleDateString() : 'No date'}</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleOpenQrModal({
                              id: plan.id,
                              title: plan.lessonName,
                              subject: plan.subject,
                              className: plan.classLevel,
                              type: 'nursery',
                              schoolName: plan.schoolName,
                              teacherName: plan.teacherName,
                              date: plan.date,
                              duration: plan.duration
                            }, e)}
                            className="p-1.5 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-lg transition-colors cursor-pointer"
                            title="Generate Printable QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportNurseryLessonPlanToPdf(plan, plan.language || 'English');
                            }}
                            className="p-1.5 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-lg transition-colors cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(plan.id, 'nursery', e)}
                            className="p-1.5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg transition-colors cursor-pointer"
                            title="Delete Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1.5 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-lg transition-colors flex items-center gap-1 font-bold text-[10px]"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>Open & Edit</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-[10px]">
                        <span className="text-slate-500 flex items-center gap-1 font-semibold">
                          <Calendar className="w-3.5 h-3.5 animate-pulse text-blue-400" />
                          <span>{plan.date ? new Date(plan.date).toLocaleDateString() : 'No date'}</span>
                        </span>
                        <span className={`font-black uppercase text-[9px] ${selectedPlanIds.has(plan.id) ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`}>
                          {selectedPlanIds.has(plan.id) ? 'Selected' : 'Click to Select'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* BOTTOM FOOOTER */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center shrink-0">
          <p className="text-[10px] text-slate-500 font-medium">
            💡 Click on any saved lesson plan to instantly view, modify, generate QR codes, or download it as an official REB PDF.
          </p>
        </div>
      </div>

      {/* PRINTABLE QR CODE MODAL */}
      <PrintableLessonPlanQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        plan={qrModalPlan}
        onOpenDigitalPlan={(planId, type) => {
          setIsQrModalOpen(false);
          onClose();
          if (type === 'remedial') {
            const match = remedialPlans.find(p => p.id === planId);
            if (match) onSelectRemedialPlan(match);
          } else if (type === 'nursery') {
            const match = nurseryPlans.find(p => p.id === planId);
            if (match) onSelectNurseryPlan(match);
          } else {
            const match = plans.find(p => p.id === planId);
            if (match) onSelectPlan(match);
          }
        }}
      />

      {/* SECONDARY BATCH RENAME PATTERN MODAL */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-white flex flex-col relative animate-scale-up">
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
            
            <button
              onClick={() => setIsRenameModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 space-y-5">
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Batch Rename Pattern
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Choose a pattern to organize your {selectedPlanIds.size} selected plans.
                </p>
              </div>

              {/* PATTERN SELECTOR BUTTONS */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRenamePattern('prefix')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    renamePattern === 'prefix'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  Add Prefix
                </button>
                <button
                  type="button"
                  onClick={() => setRenamePattern('suffix')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    renamePattern === 'suffix'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  Add Suffix
                </button>
                <button
                  type="button"
                  onClick={() => setRenamePattern('date')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    renamePattern === 'date'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  Date-Stamping
                </button>
                <button
                  type="button"
                  onClick={() => setRenamePattern('replace')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    renamePattern === 'replace'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  Find & Replace
                </button>
                <button
                  type="button"
                  onClick={() => setRenamePattern('custom_numbering')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border col-span-2 transition-all cursor-pointer ${
                    renamePattern === 'custom_numbering'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  Custom Name + Numbering Sequentially
                </button>
              </div>

              {/* DYNAMIC FORM INPUTS */}
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                {renamePattern === 'prefix' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Prefix Text
                    </label>
                    <input
                      type="text"
                      value={renamePrefix}
                      onChange={(e) => setRenamePrefix(e.target.value)}
                      placeholder="e.g. Term 3 - "
                      className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                )}

                {renamePattern === 'suffix' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Suffix Text
                    </label>
                    <input
                      type="text"
                      value={renameSuffix}
                      onChange={(e) => setRenameSuffix(e.target.value)}
                      placeholder="e.g. - 2026 Revised"
                      className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                )}

                {renamePattern === 'replace' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Find Text
                      </label>
                      <input
                        type="text"
                        value={renameFindText}
                        onChange={(e) => setRenameFindText(e.target.value)}
                        placeholder="e.g. CBC"
                        className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Replace With
                      </label>
                      <input
                        type="text"
                        value={renameReplaceText}
                        onChange={(e) => setRenameReplaceText(e.target.value)}
                        placeholder="e.g. Competency Based"
                        className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-semibold"
                      />
                    </div>
                  </div>
                )}

                {renamePattern === 'date' && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Date Stamp
                    </span>
                    <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                      This will automatically append today's date stamp to each plan's name.
                    </p>
                  </div>
                )}

                {renamePattern === 'custom_numbering' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      New Custom Name Base
                    </label>
                    <input
                      type="text"
                      value={renameCustomName}
                      onChange={(e) => setRenameCustomName(e.target.value)}
                      placeholder="e.g. Biology S3 Plan"
                      className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                )}

                {/* LIVE PREVIEW BOX */}
                <div className="border-t border-slate-800/80 pt-3 mt-2 space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 block">
                    Live Preview (1st selected)
                  </span>
                  <div className="text-[11px] text-slate-400 bg-slate-900/50 p-2 rounded-lg border border-slate-800 truncate font-semibold">
                    {getRenamePreview()}
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRenameModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBatchRename}
                  disabled={batchRenaming}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-lg shadow-emerald-950/20"
                >
                  {batchRenaming ? (
                    <>
                      <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                      <span>Renaming...</span>
                    </>
                  ) : (
                    <span>Apply Rename</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
