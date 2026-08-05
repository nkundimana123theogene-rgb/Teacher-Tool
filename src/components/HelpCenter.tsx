import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Video,
  FileText,
  MessageSquare,
  Search,
  Sparkles,
  CheckCircle2,
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone,
  Download,
  Send,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Bot,
  ExternalLink,
  BookOpen,
  Zap,
  Shield,
  Award,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { TutorialItem, HelpChatMessage, UserProfile, LanguageOption } from '../types';
import { SYSTEM_GUIDE_ITEMS } from '../data/guide';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  currentModule?: string;
  selectedLanguage: LanguageOption;
  onNavigateTab?: (tab: any) => void;
}

const MODULE_OPTIONS = [
  { id: 'all', label: 'Byose (All)' },
  { id: 'system_master', label: '🌟 Master Tutorial (Amakuru Yose)' },
  { id: 'system_structure', label: '🏗️ System Architecture & Modules' },
  { id: 'lesson_plans', label: 'Lesson Plans' },
  { id: 'remedial', label: 'Remedial RLP' },
  { id: 'exercises', label: 'Exercises & Quizzes' },
  { id: 'worksheets', label: 'Worksheets' },
  { id: 'slides', label: 'Slides' },
  { id: 'class_diary', label: 'Class Diary' },
  { id: 'certificates', label: 'AI Certificates' },
  { id: 'subscription', label: 'MoMo Payment & Top-Up' },
];

export const HelpCenter: React.FC<HelpCenterProps> = ({
  isOpen,
  onClose,
  user,
  currentModule = 'lesson_plans',
  selectedLanguage,
  onNavigateTab,
}) => {
  const [tutorials, setTutorials] = useState<TutorialItem[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>(currentModule || 'all');
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'video' | 'guide' | 'chat' | 'admin' | 'dev_docs'>('chat');
  const [loading, setLoading] = useState<boolean>(true);

  // Interactive Video Player State
  const [isPlayingDemo, setIsPlayingDemo] = useState<boolean>(true);
  const [demoStepIndex, setDemoStepIndex] = useState<number>(0);
  const [isSpeakingScript, setIsSpeakingScript] = useState<boolean>(false);

  // Auto-advance video demo steps when playing
  useEffect(() => {
    let timer: any;
    if (activeTab === 'video' && isPlayingDemo) {
      timer = setInterval(() => {
        setDemoStepIndex((prev) => (prev + 1) % 4);
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [activeTab, isPlayingDemo, selectedTutorial]);

  // Reset step index on tutorial change
  useEffect(() => {
    setDemoStepIndex(0);
    setIsPlayingDemo(true);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingScript(false);
    }
  }, [selectedTutorial]);

  const toggleSpeakScript = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }
    if (isSpeakingScript) {
      window.speechSynthesis.cancel();
      setIsSpeakingScript(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeakingScript(false);
      utterance.onerror = () => setIsSpeakingScript(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeakingScript(true);
    }
  };

  // Developer Codebase Doc Helper State
  const [devQueryType, setDevQueryType] = useState<'codebase_summary' | 'function_explanation' | 'parity_check'>('codebase_summary');
  const [devTargetQuery, setDevTargetQuery] = useState<string>('All Core Application Services');
  const [devContext, setDevContext] = useState<string>('');
  const [devDocResult, setDevDocResult] = useState<string | null>(null);
  const [isGeneratingDevDoc, setIsGeneratingDevDoc] = useState<boolean>(false);

  // Chat Assistant State
  const [chatMessages, setChatMessages] = useState<HelpChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: selectedLanguage === 'Kinyarwanda'
        ? `Muraho! Ndi AI Support Assistant ya Teacher Tool. Mbasha kugufasha gusobanukirwa n'uburyo bwo gukora Lesson Plans, Exercises, Class Diary, Certificates, n'uburyo bwo kwishyura kuri MoMo (0781339530). Unsubize ikibazo ufite cyangwa uhitemo kimwe mu bibazo bikurikira!`
        : `Hello! I am your AI Support Assistant for Teacher Tool. How can I help you today? Ask me any question or pick a quick topic below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);

  // Admin Tutorial Management State
  const [isGeneratingAiDoc, setIsGeneratingAiDoc] = useState<boolean>(false);
  const [isUpdatingFeature, setIsUpdatingFeature] = useState<boolean>(false);
  const [aiGenModule, setAiGenModule] = useState<string>('lesson_plans');
  const [aiGenTitle, setAiGenTitle] = useState<string>('');
  const [aiGenDescription, setAiGenDescription] = useState<string>('');
  const [featureUpdateText, setFeatureUpdateText] = useState<string>('');
  const [selectedTutorialForUpdate, setSelectedTutorialForUpdate] = useState<string>('');
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  // Fetch tutorials from backend
  const fetchTutorials = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tutorials');
      if (res.ok) {
        const data: TutorialItem[] = await res.json();
        setTutorials(data);
        if (data.length > 0) {
          // Find matching tutorial for current module if available
          const matching = data.find((t) => t.module === currentModule) || data[0];
          setSelectedTutorial(matching);
        }
      }
    } catch (err) {
      console.error('Error fetching tutorials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTutorials();
    }
  }, [isOpen, currentModule]);

  if (!isOpen) return null;

  const filteredTutorials = tutorials.filter((t) => {
    const matchesModule = selectedModule === 'all' || t.module === selectedModule;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.module.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesModule && matchesSearch;
  });

  const handleSendChat = async (questionText?: string) => {
    const textToSend = questionText || chatInput;
    if (!textToSend.trim() || isSendingChat) return;

    const userMsg: HelpChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsSendingChat(true);

    try {
      const token = localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token');
      const res = await fetch('/api/help-center/chat-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: textToSend,
          currentModule,
          userEmail: user?.email,
        }),
      });

      if (res.ok) {
        const aiMsg: HelpChatMessage = await res.json();
        setChatMessages((prev) => [...prev, aiMsg]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            id: 'err_' + Date.now(),
            sender: 'assistant',
            text: 'Sorry, there was a temporary issue responding to your query. Please try again or reach out directly on WhatsApp at 0781339530.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error('Help Chat AI Error:', err);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleGenerateAiTutorial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiGenTitle || !aiGenModule) return;
    setIsGeneratingAiDoc(true);
    setAdminNotice(null);

    try {
      const token = localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token');
      const res = await fetch('/api/tutorials/generate-ai-doc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: aiGenTitle,
          module: aiGenModule,
          systemDescription: aiGenDescription,
          language: selectedLanguage,
        }),
      });

      if (res.ok) {
        const newDoc: TutorialItem = await res.json();
        setAdminNotice(`✅ Feature Documentation Generated via AI successfully! (Version ${newDoc.version})`);
        setAiGenTitle('');
        setAiGenDescription('');
        await fetchTutorials();
        setSelectedTutorial(newDoc);
        setActiveTab('guide');
      } else {
        setAdminNotice('❌ Failed to generate tutorial documentation.');
      }
    } catch (err) {
      console.error('Error generating tutorial doc:', err);
      setAdminNotice('❌ Error communicating with AI generator backend.');
    } finally {
      setIsGeneratingAiDoc(false);
    }
  };

  const handleUpdateFeatureWithAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutorialForUpdate || !featureUpdateText) return;
    setIsUpdatingFeature(true);
    setAdminNotice(null);

    try {
      const token = localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token');
      const res = await fetch('/api/tutorials/update-feature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          tutorialId: selectedTutorialForUpdate,
          featureChangesDescription: featureUpdateText,
        }),
      });

      if (res.ok) {
        const updatedDoc: TutorialItem = await res.json();
        setAdminNotice(`🎉 Tutorial Updated! Version bumped to ${updatedDoc.version}`);
        setFeatureUpdateText('');
        await fetchTutorials();
        setSelectedTutorial(updatedDoc);
        setActiveTab('guide');
      } else {
        setAdminNotice('❌ Failed to update tutorial feature.');
      }
    } catch (err) {
      console.error('Error updating feature tutorial:', err);
      setAdminNotice('❌ Error communicating with backend.');
    } finally {
      setIsUpdatingFeature(false);
    }
  };

  const handleDeleteTutorial = async (id: string) => {
    if (!window.confirm('Ese urabyemeza ko ushaka gusiba iyi tutorial mu database?')) return;
    try {
      const token = localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token');
      const res = await fetch(`/api/tutorials/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        await fetchTutorials();
        if (selectedTutorial?.id === id) {
          setSelectedTutorial(tutorials[0] || null);
        }
      }
    } catch (err) {
      console.error('Error deleting tutorial:', err);
    }
  };

  const handleGenerateDevDoc = async (presetTarget?: string, presetType?: 'codebase_summary' | 'function_explanation' | 'parity_check') => {
    setIsGeneratingDevDoc(true);
    setDevDocResult(null);
    const qType = presetType || devQueryType;
    const target = presetTarget || devTargetQuery;

    try {
      const res = await fetch('/api/admin/codebase-doc-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryType: qType,
          targetFunctionOrQuery: target,
          context: devContext,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDevDocResult(data.documentation);
      } else {
        setDevDocResult(`Error generating documentation: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setDevDocResult(`Network Error: ${err.message}`);
    } finally {
      setIsGeneratingDevDoc(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[92vh] max-h-[850px] rounded-2xl shadow-2xl border border-emerald-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-inner">
              <HelpCircle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  Help Center & AI Documentation
                </h2>
                <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black rounded-md">
                  Database & AI Engine
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                Tutorials, Video Scripts, Printable PDF Guides & AI Chat Assistant
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all focus:outline-hidden"
            title="Funga Help Center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Main Category Filter Bar */}
        <div className="bg-emerald-50/70 border-b border-emerald-100 p-3 sm:px-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Shaka tutorial, guide, cyangwa video (Search tutorials...)"
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-emerald-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {MODULE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedModule(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedModule === opt.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-emerald-950 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Body Grid */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Sidebar Tutorials List */}
          <div className="w-full md:w-72 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0 min-h-[160px] md:min-h-0">
            <div className="p-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                📚 Tutorials Database ({filteredTutorials.length})
              </span>
              <button
                onClick={fetchTutorials}
                className="p-1 hover:bg-slate-200 rounded-md text-slate-500 transition-colors"
                title="Refresh tutorials"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {loading ? (
                <div className="p-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Loading tutorials database...</span>
                </div>
              ) : filteredTutorials.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Nta tutorial ibonetse kuri uyu muco.
                </div>
              ) : (
                filteredTutorials.map((tut) => {
                  const isSelected = selectedTutorial?.id === tut.id;
                  return (
                    <button
                      key={tut.id}
                      onClick={() => {
                        setSelectedTutorial(tut);
                        if (activeTab === 'chat' || activeTab === 'admin') {
                          setActiveTab('guide');
                        }
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-white hover:bg-emerald-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {tut.module}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            isSelected ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {tut.version || 'v1.0'}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold line-clamp-2 leading-snug">
                        {tut.title}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Main Display Pane */}
          <div className="flex-1 flex flex-col min-w-0 bg-white min-h-0">
            {/* Top View Mode Tabs */}
            <div className="border-b border-slate-200 px-4 py-2 bg-slate-50 flex items-center justify-between shrink-0 overflow-x-auto">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                    activeTab === 'chat'
                      ? 'bg-amber-500 text-slate-950 border border-amber-600 shadow-xs scale-105'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Bot className="w-4 h-4 text-slate-950 fill-amber-300" />
                  <span>💬 Baza AI Assistant</span>
                </button>

                <button
                  onClick={() => setActiveTab('video')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                    activeTab === 'video'
                      ? 'bg-emerald-700 text-white shadow-xs scale-105'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Video className="w-4 h-4 text-emerald-500" />
                  <span>🎥 Reba Video & Script</span>
                </button>

                <button
                  onClick={() => setActiveTab('guide')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                    activeTab === 'guide'
                      ? 'bg-blue-600 text-white shadow-xs scale-105'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>📄 Read System Guide & PDF</span>
                </button>

                {user?.isAdmin && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                      activeTab === 'admin'
                        ? 'bg-purple-700 text-white shadow-xs scale-105'
                        : 'bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>⚡ AI Admin Maintainer</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('dev_docs')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                    activeTab === 'dev_docs'
                      ? 'bg-slate-900 text-white shadow-xs scale-105 border border-slate-700'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
                  }`}
                  title="Automated Developer Codebase & Architecture Doc Helper"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>💻 Dev Codebase Helper</span>
                </button>
              </div>

              {selectedTutorial && (
                <div className="hidden lg:flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500">
                    Version: <strong className="text-emerald-700">{selectedTutorial.version}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Content Display Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
              {/* TAB 1: AI Chat Assistant */}
              {activeTab === 'chat' && (
                <div className="h-full flex flex-col justify-between max-w-3xl mx-auto space-y-4">
                  {/* Chat Messages Log */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${
                          msg.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {msg.sender === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm mt-1">
                            <Bot className="w-4 h-4 text-amber-300" />
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] rounded-2xl p-3.5 text-xs font-medium leading-relaxed shadow-xs ${
                            msg.sender === 'user'
                              ? 'bg-emerald-700 text-white rounded-tr-none'
                              : 'bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200/80'
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{msg.text}</div>

                          {/* Suggested Action Button if present */}
                          {msg.suggestedAction && (
                            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-2">
                              {msg.suggestedAction.type === 'nav_tab' && onNavigateTab && (
                                <button
                                  onClick={() => {
                                    onNavigateTab(msg.suggestedAction?.target as any);
                                    onClose();
                                  }}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all hover:scale-105"
                                >
                                  <span>{msg.suggestedAction.label}</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {msg.suggestedAction.type === 'open_video' && (
                                <button
                                  onClick={() => setActiveTab('video')}
                                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                                >
                                  <Video className="w-3.5 h-3.5" />
                                  <span>{msg.suggestedAction.label}</span>
                                </button>
                              )}
                              {msg.suggestedAction.type === 'open_guide' && (
                                <button
                                  onClick={() => setActiveTab('guide')}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>{msg.suggestedAction.label}</span>
                                </button>
                              )}
                            </div>
                          )}

                          <span className="block text-[10px] opacity-60 text-right mt-1 font-sans">
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}

                    {isSendingChat && (
                      <div className="flex gap-3 justify-start items-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          <Bot className="w-4 h-4 text-amber-300 animate-spin" />
                        </div>
                        <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-2xl text-xs font-bold animate-pulse">
                          AI yandika igisubizo... (AI is thinking...)
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Question Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none border-t border-slate-100 shrink-0">
                    <span className="text-[11px] font-bold text-slate-400 shrink-0">💡 Baza mu buryo bwihuse:</span>
                    <button
                      onClick={() => handleSendChat('Nakora nte lesson plan mu buryo bwa REB?')}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200 shrink-0"
                    >
                      "Nakora nte lesson plan?"
                    </button>
                    <button
                      onClick={() => handleSendChat('Kwishyura kuri MoMo 0781339530 bikora nte?')}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold rounded-lg border border-amber-200 shrink-0"
                    >
                      "Kwishyura kuri MoMo bikora nte?"
                    </button>
                    <button
                      onClick={() => handleSendChat('Certificate ya graduation cyangwa ishuri nyikora nte?')}
                      className="px-2.5 py-1 bg-lime-50 hover:bg-lime-100 text-slate-950 text-[11px] font-bold rounded-lg border border-lime-300 shrink-0"
                    >
                      "Certificate nyikora nte?"
                    </button>
                    <button
                      onClick={() => handleSendChat('Nakosora nte amakosa mu mateguro yanjye?')}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 text-[11px] font-bold rounded-lg border border-blue-200 shrink-0"
                    >
                      "Nakosora nte amakosa?"
                    </button>
                  </div>

                  {/* Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChat();
                    }}
                    className="flex items-center gap-2 pt-2 border-t border-slate-200 shrink-0"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Baza AI kibazo cyose kuri system (e.g. Nakora nte invoice?)..."
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isSendingChat}
                      className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <span>Baza AI</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: Video Player & Script */}
              {activeTab === 'video' && (
                <div className="space-y-5">
                  {selectedTutorial ? (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md">
                              Module: {selectedTutorial.module}
                            </span>
                            <span className="text-[10px] font-extrabold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md">
                              {selectedTutorial.version || 'v1.0'}
                            </span>
                          </div>
                          <h3 className="text-lg font-black text-slate-900 mt-1">
                            {selectedTutorial.title}
                          </h3>
                          <p className="text-xs text-slate-600 font-medium mt-0.5">
                            {selectedTutorial.description}
                          </p>
                        </div>
                      </div>

                      {/* Native Video Player Display Screen */}
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl flex flex-col justify-between p-4 sm:p-6 text-white group">
                          {/* Top Video Header Bar */}
                          <div className="flex items-center justify-between gap-2 z-10 bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                              <span className="text-xs font-black tracking-wider text-emerald-400 uppercase">
                                System Video Tutorial (Live Demo)
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold bg-slate-800 px-2 py-0.5 rounded-md text-slate-300 border border-slate-700">
                                Step {demoStepIndex + 1} of 4
                              </span>
                              <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md">
                                4K 60FPS
                              </span>
                            </div>
                          </div>

                          {/* Center Screen Animated UI Simulation */}
                          <div className="flex-1 my-3 relative flex items-center justify-center overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 p-4">
                            {/* Simulated Mouse Pointer & Pulse Effect */}
                            <div
                              className="absolute z-20 transition-all duration-700 pointer-events-none"
                              style={{
                                top: demoStepIndex === 0 ? '30%' : demoStepIndex === 1 ? '50%' : demoStepIndex === 2 ? '70%' : '40%',
                                left: demoStepIndex === 0 ? '25%' : demoStepIndex === 1 ? '60%' : demoStepIndex === 2 ? '80%' : '50%',
                              }}
                            >
                              <div className="relative">
                                <span className="absolute -inset-2 bg-amber-400/40 rounded-full animate-ping" />
                                <div className="w-5 h-5 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center font-black text-[9px] shadow-lg border border-white">
                                  ✓
                                </div>
                              </div>
                            </div>

                            {/* Simulated Interactive UI Cards based on Step */}
                            <div className="w-full max-w-lg bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 shadow-2xl space-y-3 transform transition-all">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-amber-400" />
                                  <span className="text-xs font-black text-emerald-300">
                                    {selectedTutorial.module.toUpperCase()} SYSTEM PREVIEW
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">
                                  Nkorera Education Engine
                                </span>
                              </div>

                              {demoStepIndex === 0 && (
                                <div className="space-y-2 animate-in fade-in duration-300">
                                  <p className="text-xs font-bold text-amber-300">
                                    📌 Step 1: Kwinjira mu gice cy'isomo n'ibipimo
                                  </p>
                                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-[11px] text-slate-300 space-y-1">
                                    <p>• Hitamo Subject: <strong>Mathematics / Biology / History</strong></p>
                                    <p>• Hitamo Grade: <strong>Senior 1 - Senior 6 (REB CBC)</strong></p>
                                    <p>• Instructional Objective: <strong>"Abanyeshuri bazashobora..."</strong></p>
                                  </div>
                                </div>
                              )}

                              {demoStepIndex === 1 && (
                                <div className="space-y-2 animate-in fade-in duration-300">
                                  <p className="text-xs font-bold text-emerald-300">
                                    ⚡ Step 2: Alignment na REB CBC Grid Standards
                                  </p>
                                  <div className="p-2.5 bg-emerald-950/60 rounded-xl border border-emerald-500/50 text-[11px] text-emerald-200 space-y-1">
                                    <p>• Key Unit Competency: <strong>Analyzed & Verified</strong></p>
                                    <p>• Learning Activities & Assessment Criteria: <strong>Auto-Mapped</strong></p>
                                    <p>• Materials: <strong>Textbooks, Visual Aids & Digital Tools</strong></p>
                                  </div>
                                </div>
                              )}

                              {demoStepIndex === 2 && (
                                <div className="space-y-2 animate-in fade-in duration-300">
                                  <p className="text-xs font-bold text-blue-300">
                                    🤖 Step 3: Fast AI Generation (Gemini 2.5 Engine)
                                  </p>
                                  <div className="p-2.5 bg-blue-950/60 rounded-xl border border-blue-500/50 text-[11px] text-blue-200 space-y-1">
                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                      <div className="bg-gradient-to-r from-emerald-400 to-amber-400 h-full w-[85%] animate-pulse" />
                                    </div>
                                    <p className="text-[10px] text-slate-300 text-right font-mono">Generating... 85% completed</p>
                                  </div>
                                </div>
                              )}

                              {demoStepIndex === 3 && (
                                <div className="space-y-2 animate-in fade-in duration-300">
                                  <p className="text-xs font-bold text-lime-300">
                                    🖨️ Step 4: 1-Page Printable PDF & Cloud Sync
                                  </p>
                                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-[11px] text-slate-200 flex items-center justify-between">
                                    <span>Document Ready (Firestore Synced)</span>
                                    <span className="px-2 py-1 bg-emerald-600 text-white font-extrabold text-[10px] rounded-md">
                                      PDF Download Ready
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Interactive Step Navigation Bar */}
                          <div className="grid grid-cols-4 gap-1.5 my-2">
                            {[0, 1, 2, 3].map((stepIdx) => (
                              <button
                                key={stepIdx}
                                onClick={() => {
                                  setDemoStepIndex(stepIdx);
                                  setIsPlayingDemo(false);
                                }}
                                className={`p-1.5 rounded-lg text-[10px] font-extrabold text-left transition-all truncate border ${
                                  demoStepIndex === stepIdx
                                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800'
                                }`}
                              >
                                Step {stepIdx + 1}
                              </button>
                            ))}
                          </div>

                          {/* Bottom Video Controls Toolbar */}
                          <div className="flex items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/60 z-10">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setIsPlayingDemo(!isPlayingDemo)}
                                className="p-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all font-black"
                                title={isPlayingDemo ? 'Pause Video' : 'Play Video'}
                              >
                                {isPlayingDemo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
                              </button>
                              <button
                                onClick={() => setDemoStepIndex(0)}
                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
                                title="Restart Video"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => toggleSpeakScript(selectedTutorial.videoScript || selectedTutorial.description)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                                  isSpeakingScript
                                    ? 'bg-red-600 text-white animate-pulse'
                                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
                                }`}
                                title="Umva Ijwi rya Video Script"
                              >
                                {isSpeakingScript ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                                <span className="hidden sm:inline">{isSpeakingScript ? 'Hagarika Ijwi' : 'Umva Ijwi'}</span>
                              </button>
                            </div>

                            {/* Timeline Bar */}
                            <div className="flex-1 max-w-xs hidden md:flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-mono">
                                0:0{(demoStepIndex + 1) * 2} / 0:10
                              </span>
                              <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full transition-all duration-300"
                                  style={{ width: `${((demoStepIndex + 1) / 4) * 100}%` }}
                                />
                              </div>
                            </div>

                            <span className="text-[11px] font-bold text-emerald-400">
                              System Native Player
                            </span>
                          </div>
                        </div>

                      {/* AI Generated Spoken Video Script */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span>AI Spoken Video Script (Inyandiko y'Ijwi rya Video)</span>
                          </h4>
                          <button
                            onClick={() => toggleSpeakScript(selectedTutorial.videoScript || selectedTutorial.description)}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                            <span>{isSpeakingScript ? 'Hagarika Ijwi' : 'Soma n\'Ijwi (Read Aloud)'}</span>
                          </button>
                        </div>
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                          {selectedTutorial.videoScript || 'Nta script iratangwa kuri iyi tutorial.'}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      Hitamo tutorial ku ruhande ngo urebe video na script.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Guide Content & PDF */}
              {activeTab === 'guide' && (
                <div className="space-y-6">
                  {/* System Header with PDF Print Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md">
                          26 System Modules
                        </span>
                        <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-md">
                          IT Developer: Nkundimana Theogene (0781339530)
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                        📄 System Guide & User Manual (Incamake y'Ibyikubiye Muri System)
                      </h3>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        Incamake n'uburyo bwo gukoresha buri gice muri 26 agize Teacher Tool System.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span>Print / Download Guide PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* 26 System Guide Modules Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SYSTEM_GUIDE_ITEMS.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                              {item.number}
                            </span>
                            <div>
                              <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                                {item.title}
                              </h4>
                              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                                {item.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs font-semibold text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {item.summary}
                        </p>

                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                            Ibikubiyemo (Detailed Steps):
                          </span>
                          <ul className="space-y-1 pl-1">
                            {item.details.map((detail, idx) => (
                              <li key={idx} className="text-xs text-slate-700 font-medium flex items-start gap-1.5 leading-snug">
                                <span className="text-emerald-600 font-bold shrink-0">•</span>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Selected Specific Tutorial Guide view if applicable */}
                  {selectedTutorial && (
                    <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-emerald-600" />
                          <span>Specific Module In-Depth Guide: {selectedTutorial.title}</span>
                        </h4>
                      </div>
                      <div className="prose prose-sm max-w-none text-slate-800 font-sans leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <div className="whitespace-pre-wrap font-medium">
                          {selectedTutorial.guideContent || selectedTutorial.description}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Admin Management & AI Maintainer Engine */}
              {activeTab === 'admin' && user?.isAdmin && (
                <div className="space-y-6">
                  {adminNotice && (
                    <div className="p-3 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-between shadow-md animate-in fade-in">
                      <span>{adminNotice}</span>
                      <button onClick={() => setAdminNotice(null)} className="text-slate-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Section 1: Generate AI Documentation Engine */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-2 border-emerald-300 shadow-xs space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">
                          1. AI Documentation Engine (Ongera Feature / Tutorial Nshya)
                        </h4>
                        <p className="text-xs text-slate-600 font-medium">
                          Andika izina ry'icyiciro cyangwa feature nshya, AI yandike documentation yose (Guide, Video Script, FAQs, PDF summary, Version).
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleGenerateAiTutorial} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Izina ry'isomo / Feature Title:
                        </label>
                        <input
                          type="text"
                          value={aiGenTitle}
                          onChange={(e) => setAiGenTitle(e.target.value)}
                          placeholder="e.g. Nursery Lesson Plan Generator"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Igice cya System (Module):
                        </label>
                        <select
                          value={aiGenModule}
                          onChange={(e) => setAiGenModule(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                        >
                          <option value="system_structure">System Architecture & Modules</option>
                          <option value="lesson_plans">Lesson Plans</option>
                          <option value="remedial">Remedial RLP</option>
                          <option value="exercises">Exercises & Quizzes</option>
                          <option value="worksheets">Worksheets</option>
                          <option value="slides">Presentation Slides</option>
                          <option value="class_diary">Class Diary</option>
                          <option value="certificates">AI Certificates</option>
                          <option value="subscription">MoMo Payment</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Ibisobanuro by'inyongezo ku buryo feature ikora (System Details):
                        </label>
                        <textarea
                          rows={2}
                          value={aiGenDescription}
                          onChange={(e) => setAiGenDescription(e.target.value)}
                          placeholder="Sobanura muri make uko iyi feature ikora kugira ngo AI iyandikire guide n'script binoze..."
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <button
                          type="submit"
                          disabled={isGeneratingAiDoc}
                          className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
                        >
                          {isGeneratingAiDoc ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                              <span>AI Yandika Documentation Engine...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-amber-300" />
                              <span>Generate Complete Tutorial Package with AI 🚀</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Section 2: AI Feature Update & Version Bump Maintainer */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-white border-2 border-amber-300 shadow-xs space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">
                          2. AI Feature Update & Version Bumper (Kuvugurura Tutorial igihe System yahindutse)
                        </h4>
                        <p className="text-xs text-slate-600 font-medium">
                          Igihe uhinduye feature muri system, shyiramo ibisobanuro bishya, AI izahita ivugurura documentation yose (Script, Guide, FAQs) kandi izamure version (e.g. v1.0 -&gt; v1.1).
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleUpdateFeatureWithAi} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Hitamo Tutorial Ushaka Kuvugurura:
                        </label>
                        <select
                          value={selectedTutorialForUpdate}
                          onChange={(e) => setSelectedTutorialForUpdate(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                          required
                        >
                          <option value="">-- Hitamo Tutorial --</option>
                          {tutorials.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.title} ({t.version}) - [{t.module}]
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Sobanura ibyo wahinduye muri system (New Feature Changes):
                        </label>
                        <textarea
                          rows={3}
                          value={featureUpdateText}
                          onChange={(e) => setFeatureUpdateText(e.target.value)}
                          placeholder="e.g. Twongereye abasinyishi 2 gusa kuri Certificate (Headteacher & Teacher) hamwe n'itangiriro ry'ifoto..."
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isUpdatingFeature}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-400 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
                      >
                        {isUpdatingFeature ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>AI Updating Documentation & Version Bump...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 fill-slate-950" />
                            <span>Update Tutorial with AI & Bump Version (e.g. v1.1) ⚡</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Section 3: Manage / Delete Existing Tutorials */}
                  {selectedTutorial && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-rose-950">
                          Siba Tutorial: "{selectedTutorial.title}"
                        </p>
                        <p className="text-[11px] text-rose-700 font-medium">
                          ID: {selectedTutorial.id} | Version: {selectedTutorial.version}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteTutorial(selectedTutorial.id)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Siba Tutorial</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* View Mode 5: Developer Codebase & AI Doc Helper */}
              {activeTab === 'dev_docs' && (
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                        <BookOpen className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white">
                          Automated Developer Codebase & Architecture Doc Helper
                        </h3>
                        <p className="text-xs text-slate-300 font-medium">
                          Generate live technical documentation, parity reports, or function explanations using Gemini AI.
                        </p>
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-2">
                      <span className="text-xs font-bold text-slate-400 self-center mr-1">Quick Presets:</span>
                      <button
                        onClick={() => {
                          setDevQueryType('codebase_summary');
                          setDevTargetQuery('Full High-Level System Architecture & Folder Structure');
                          handleGenerateDevDoc('Full High-Level System Architecture & Folder Structure', 'codebase_summary');
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-lg border border-slate-700 transition-all"
                      >
                        📊 Full System Architecture
                      </button>
                      <button
                        onClick={() => {
                          setDevQueryType('function_explanation');
                          setDevTargetQuery('callGeminiWithRetry & Gemini API Integration');
                          handleGenerateDevDoc('callGeminiWithRetry & Gemini API Integration', 'function_explanation');
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold rounded-lg border border-slate-700 transition-all"
                      >
                        🤖 Gemini AI Engine & Retry Logic
                      </button>
                      <button
                        onClick={() => {
                          setDevQueryType('function_explanation');
                          setDevTargetQuery('Certificate Generation & Dual Signatories Verification');
                          handleGenerateDevDoc('Certificate Generation & Dual Signatories Verification', 'function_explanation');
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-bold rounded-lg border border-slate-700 transition-all"
                      >
                        📜 School Certificates Subsystem
                      </button>
                      <button
                        onClick={() => {
                          setDevQueryType('parity_check');
                          setDevTargetQuery('REST API Endpoints vs Frontend Components');
                          handleGenerateDevDoc('REST API Endpoints vs Frontend Components', 'parity_check');
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold rounded-lg border border-slate-700 transition-all"
                      >
                        🔍 API Parity Check
                      </button>
                    </div>
                  </div>

                  {/* Form Controls */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                      Custom Documentation Query Request
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Query Type:
                        </label>
                        <select
                          value={devQueryType}
                          onChange={(e: any) => setDevQueryType(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                        >
                          <option value="codebase_summary">Codebase Summary & Overview</option>
                          <option value="function_explanation">Detailed Function / Subsystem Explanation</option>
                          <option value="parity_check">Documentation Parity & Health Check</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Target Function / Service / Subsystem:
                        </label>
                        <input
                          type="text"
                          value={devTargetQuery}
                          onChange={(e) => setDevTargetQuery(e.target.value)}
                          placeholder="e.g. LessonPlanView, seedFirestoreIfNeeded, MoMo payment flow"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Developer Context & Specific Notes (Optional):
                      </label>
                      <textarea
                        rows={2}
                        value={devContext}
                        onChange={(e) => setDevContext(e.target.value)}
                        placeholder="e.g. Include details on error handling, Firestore collections, or print layout constraints."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                      />
                    </div>

                    <button
                      onClick={() => handleGenerateDevDoc()}
                      disabled={isGeneratingDevDoc}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                    >
                      {isGeneratingDevDoc ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                          <span>AI Analyzing Codebase & Generating Developer Documentation...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span>Generate Developer Documentation with AI 🚀</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Output Documentation Markdown Viewer */}
                  {devDocResult && (
                    <div className="bg-slate-950 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <h4 className="text-sm font-black text-white">
                            Generated Developer Documentation
                          </h4>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(devDocResult);
                            alert("Documentation copied to clipboard!");
                          }}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-lg border border-slate-700 transition-all"
                        >
                          Copy Markdown
                        </button>
                      </div>

                      <div className="prose prose-invert max-w-none text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                        {devDocResult}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
