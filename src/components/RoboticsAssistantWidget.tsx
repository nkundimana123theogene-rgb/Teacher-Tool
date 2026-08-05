import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  MessageSquare, 
  Phone, 
  ExternalLink, 
  HelpCircle, 
  ShieldCheck, 
  Zap,
  History,
  Trash2,
  Copy,
  Check,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { OWNER_INFO } from '../data/plans';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  options?: { label: string; action: () => void }[];
  whatsappLink?: boolean;
}

interface HistoryItem {
  id: string;
  question: string;
  answer: string;
  time: string;
}

export const RoboticsAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load chat messages from sessionStorage or fall back to default greeting
  const [messages, setMessages] = useState<Message[]>(() => {
    const defaultGreeting: Message = {
      id: '1',
      sender: 'bot',
      text: "Hello! I am Teacher Tool AI Assistant 🤖. I am here to help you navigate Teacher Tool, manage subscriptions, and generate lesson plans.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    try {
      const saved = sessionStorage.getItem('robotics_chat_messages');
      return saved ? JSON.parse(saved) : [defaultGreeting];
    } catch {
      return [defaultGreeting];
    }
  });

  // Load history list from sessionStorage
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(() => {
    try {
      const saved = sessionStorage.getItem('robotics_chat_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist chat messages
  useEffect(() => {
    try {
      sessionStorage.setItem('robotics_chat_messages', JSON.stringify(messages));
    } catch (err) {
      console.warn('Could not save chat messages:', err);
    }
  }, [messages]);

  // Persist history list
  useEffect(() => {
    try {
      sessionStorage.setItem('robotics_chat_history', JSON.stringify(historyItems));
    } catch (err) {
      console.warn('Could not save chat history:', err);
    }
  }, [historyItems]);

  // Listen for custom event or global method to open robotic assistant immediately
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-robotics-assistant', handleOpen);
    (window as any).openRoboticsAssistant = handleOpen;
    return () => {
      window.removeEventListener('open-robotics-assistant', handleOpen);
      delete (window as any).openRoboticsAssistant;
    };
  }, []);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleClearHistory = () => {
    if (window.confirm('Do you want to clear your conversation history?')) {
      setHistoryItems([]);
      const defaultGreeting: Message = {
        id: '1',
        sender: 'bot',
        text: "Hello! I am Teacher Tool's AI Assistant 🤖. How can I assist you today with lesson planning, subscriptions, or app navigation?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([defaultGreeting]);
    }
  };

  const handleSendQuickQuery = (question: string, botAnswer: string, showWhatsapp = false) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: question, time };
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'bot',
      text: botAnswer,
      time,
      whatsappLink: showWhatsapp,
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);

    // Add to session history
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      question,
      answer: botAnswer,
      time,
    };
    setHistoryItems((prev) => [newItem, ...prev]);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userText = input.trim();
    setInput('');
    setIsLoading(true);

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: userText, time };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    try {
      const response = await fetch('/api/chat-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.slice(-12).map(msg => ({
            sender: msg.sender,
            text: msg.text
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const botResponse = data.reply;
      const lowerReply = botResponse.toLowerCase();
      const showWhatsapp = lowerReply.includes('whatsapp') || lowerReply.includes('0781339530');

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botResponse,
        time,
        whatsappLink: showWhatsapp,
      };

      setMessages((prev) => [...prev, botMsg]);

      // Add to session history
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        question: userText,
        answer: botResponse,
        time,
      };
      setHistoryItems((prev) => [newItem, ...prev]);
    } catch (err) {
      console.error('Error fetching AI response, falling back to local system:', err);
      
      // Simple local fallback in case of connection failure or server error
      let botResponse = `Thank you for your question! Teacher Tool AI Assistant is ready to help you. You can make payments using MoMo Code (${OWNER_INFO.momoCode}), generate lesson plans on our platform, or reach support on WhatsApp at ${OWNER_INFO.whatsapp}.`;
      let showWhatsapp = false;

      const lower = userText.toLowerCase();

      if (lower.includes('link') || lower.includes('website') || lower.includes('site') || lower.includes('url') || lower.includes('web')) {
        botResponse = `Our platform is accessible at: https://teacherlessonplans.ai.studio - Here you can create and download lesson plans, schemes of work, worksheets, and more!`;
      } else if (lower.includes('momo') || lower.includes('pay') || lower.includes('price') || lower.includes('code') || lower.includes('cost')) {
        botResponse = `Payment is simple!\n\n1. Dial MoMo Code: ${OWNER_INFO.momoCode}\n2. Enter the amount for your chosen plan (Single Plan: 1,000 RWF, Monthly: 5,000 RWF, Unlimited: 15,000 RWF).\n3. Account name: ${OWNER_INFO.accountHolder}.\n4. Once paid, click 'Admin Panel' or contact WhatsApp ${OWNER_INFO.whatsapp} to activate your account!`;
      } else if (lower.includes('free') || lower.includes('quota')) {
        botResponse = `Every teacher receives 3 FREE Lesson Plans every month at https://teacherlessonplans.ai.studio! Once used, you can upgrade to a monthly plan for unlimited access.`;
      } else if (lower.includes('whatsapp') || lower.includes('group') || lower.includes('help') || lower.includes('phone') || lower.includes('support')) {
        botResponse = `You can join our WhatsApp support group and get direct assistance at ${OWNER_INFO.whatsapp} (${OWNER_INFO.accountHolder}). Our web platform is https://teacherlessonplans.ai.studio`;
        showWhatsapp = true;
      } else if (lower.includes('lesson plan') || lower.includes('reb') || lower.includes('generate')) {
        botResponse = `To generate a new Lesson Plan:\n1. Click 'Generate Lesson Plan'\n2. Fill in subject, grade, title, unit, and learning materials\n3. Select your preferred lesson language and AI will generate a complete CBC plan in seconds!`;
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botResponse,
        time,
        whatsappLink: showWhatsapp,
      };
      
      setMessages((prev) => [...prev, botMsg]);

      // Add to session history
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        question: userText,
        answer: botResponse,
        time,
      };
      setHistoryItems((prev) => [newItem, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter history items by search query
  const filteredHistoryItems = historyItems.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Floating Buttons: WhatsApp on top, Robotics AI Chat on bottom */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2.5 print:hidden">
        {!isOpen && (
          <>
            {/* WhatsApp Floating Button */}
            <a
              href={OWNER_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 hover:from-emerald-700 hover:to-green-800 text-white p-3 sm:px-4 sm:py-2.5 rounded-full shadow-2xl hover:shadow-emerald-900/40 hover:scale-105 transition-all duration-300 border-2 border-emerald-300"
              id="floating-whatsapp-btn"
              title="Vugana na Support kuri WhatsApp (0781339530)"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-emerald-400/30 flex items-center justify-center animate-ping absolute inset-0" />
                <div className="w-8 h-8 rounded-full bg-emerald-500 border border-emerald-200 flex items-center justify-center text-white relative z-10 shadow-sm">
                  <MessageSquare className="w-4 h-4 text-white fill-white" />
                </div>
              </div>
              <div className="text-left hidden sm:block pr-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-emerald-100 flex items-center gap-1">
                  <span>WHATSAPP SUPPORT</span>
                </div>
                <div className="text-xs font-black text-white">
                  <span>0781339530</span>
                </div>
              </div>
            </a>

            {/* Robotics AI Chat Floating Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="group relative flex items-center gap-3 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:shadow-emerald-900/40 hover:scale-105 transition-all duration-300 border-2 border-emerald-400/60"
              id="robotics-assistant-badge-btn"
            >
              {/* Pulsing Robot Icon Badge */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-500/30 flex items-center justify-center animate-ping absolute inset-0" />
                <div className="w-10 h-10 rounded-full bg-emerald-600 border border-emerald-300 flex items-center justify-center text-amber-300 relative z-10 shadow-inner">
                  <Bot className="w-6 h-6 animate-bounce" />
                </div>
              </div>

              <div className="text-left hidden sm:block pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200">
                    ROBOTICS AI ASSISTANT
                  </span>
                </div>
                <div className="text-xs font-black text-white flex items-center gap-1">
                  <span>Robotics AI Assistant</span>
                </div>
              </div>
            </button>
          </>
        )}
      </div>

      {/* Robotics Chat Widget Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[92vw] sm:w-[400px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 print:hidden" id="robotics-assistant-panel">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-4 text-white flex items-center justify-between shrink-0 border-b border-emerald-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/80 border border-emerald-400/60 flex items-center justify-center text-amber-300 shadow-sm">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white">Teacher Tool AI Assistant</h3>
                  <span className="bg-emerald-500/30 text-emerald-200 text-[9px] font-bold px-1.5 py-0.2 rounded border border-emerald-400/30">
                    ONLINE 24/7
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200">
                  Instant Support • WhatsApp 0781339530
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full text-emerald-200 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* DUAL NAVIGATION TABS */}
          <div className="flex bg-slate-100 border-b border-slate-200 shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2.5 text-xs font-black transition-all flex items-center justify-center gap-2 border-b-2 ${
                activeTab === 'chat'
                  ? 'border-emerald-600 text-emerald-800 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat Bot 💬</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2.5 text-xs font-black transition-all flex items-center justify-center gap-2 border-b-2 relative ${
                activeTab === 'history'
                  ? 'border-emerald-600 text-emerald-800 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Session History 📜</span>
              {historyItems.length > 0 && (
                <span className="absolute right-4 top-2.5 px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-black rounded-full leading-none">
                  {historyItems.length}
                </span>
              )}
            </button>
          </div>

          {/* CHAT TAB VIEW */}
          {activeTab === 'chat' && (
            <>
              {/* Quick Shortcuts Bar */}
              <div className="bg-slate-50 p-2.5 border-b border-slate-200 overflow-x-auto flex items-center gap-2 text-xs shrink-0 no-scrollbar">
                <button
                  onClick={() =>
                    handleSendQuickQuery(
                      "How do I pay using MoMo Code?",
                      `Dial MoMo Code: ${OWNER_INFO.momoCode} (Account: ${OWNER_INFO.accountHolder}). Enter your plan amount to complete payment!`
                    )
                  }
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg border border-slate-200 text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>MoMo Code ({OWNER_INFO.momoCode})</span>
                </button>
                <button
                  onClick={() =>
                    handleSendQuickQuery(
                      "How do the 3 free monthly plans work?",
                      `Every teacher receives 3 FREE Lesson Plans at the start of each month! Use them to generate comprehensive lesson plans.`
                    )
                  }
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg border border-slate-200 text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>3 Free Plans/Month</span>
                </button>
                <button
                  onClick={() =>
                    handleSendQuickQuery(
                      "How do I join the WhatsApp Support Group?",
                      `You can join our WhatsApp community for instant support at 0781339530 or by clicking the WhatsApp group link in the app!`,
                      true
                    )
                  }
                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Phone className="w-3 h-3 text-amber-300" />
                  <span>WhatsApp Group (0781339530)</span>
                </button>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-emerald-700 text-white rounded-tr-none font-medium shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>

                      {msg.whatsappLink && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100">
                          <a
                            href={OWNER_INFO.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-lg shadow-xs transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Kwinjira mu WhatsApp Group (0781339530)</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex flex-col items-start animate-pulse">
                    <div className="bg-white text-slate-500 border border-slate-200 rounded-2xl rounded-tl-none p-3 text-xs flex items-center gap-1.5 shadow-xs">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-[10px] font-semibold text-slate-400 ml-1">AI Assistant is typing a response...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Footer */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  placeholder={isLoading ? "Waiting for response..." : "Ask AI Assistant any question..."}
                  className="flex-1 px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl shadow-xs transition-all flex items-center justify-center shrink-0"
                  title="Ohereza / Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

          {/* SESSION HISTORY TAB VIEW */}
          {activeTab === 'history' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
              {/* Live Filter Search Input */}
              <div className="p-3 bg-white border-b border-slate-200 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search history / Shakisha ibyahise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Empty state when no history exists */}
              {filteredHistoryItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-slate-200">
                    📜
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-xs text-slate-700">Nta mateka y'ibibazo arahari</h4>
                    <p className="text-[11px] text-slate-500 leading-normal max-w-[240px] mx-auto font-medium">
                      Ibibazo byose ubaza robot cyangwa AI suggestions uhabwa birabikwa hano muri iyi session ngo uze kubyibuka neza.
                    </p>
                  </div>
                </div>
              ) : (
                /* History List */
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
                  <div className="flex items-center justify-between px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                    <span>{filteredHistoryItems.length} Q&A Items</span>
                    <button
                      onClick={handleClearHistory}
                      className="text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1 font-black"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Siba byose (Clear)</span>
                    </button>
                  </div>

                  {filteredHistoryItems.map((item) => {
                    const isExpanded = expandedItemId === item.id;
                    return (
                      <div 
                        key={item.id}
                        className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2 hover:border-emerald-500/40 transition-all shadow-xs text-left"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div 
                            onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                            className="flex-1 cursor-pointer"
                          >
                            <span className="text-[9px] text-slate-400 font-extrabold block mb-0.5">{item.time}</span>
                            <h4 className="font-extrabold text-xs text-slate-800 line-clamp-2 leading-snug">
                              ❓ {item.question}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleCopyText(item.question, item.id + '-q')}
                              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-emerald-700 rounded-lg transition-colors"
                              title="Copy Question"
                            >
                              {copiedId === item.id + '-q' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-emerald-700 rounded-lg transition-colors"
                              title={isExpanded ? "Collapse" : "Expand"}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Collapsed teaser */}
                        {!isExpanded && (
                          <div 
                            onClick={() => setExpandedItemId(item.id)}
                            className="text-[11px] text-slate-500 line-clamp-1 font-semibold bg-slate-50/80 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100"
                          >
                            🤖 {item.answer}
                          </div>
                        )}

                        {/* Expanded detail card */}
                        {isExpanded && (
                          <div className="space-y-3 pt-2.5 border-t border-slate-100 animate-in fade-in duration-150">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <span className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wide">
                                AI Assistant Reply:
                              </span>
                              <p className="text-[11.5px] text-slate-700 leading-relaxed font-bold whitespace-pre-line">
                                🤖 {item.answer}
                              </p>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                              <button
                                onClick={() => handleCopyText(item.answer, item.id + '-a')}
                                className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-extrabold"
                              >
                                {copiedId === item.id + '-a' ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Response 📋</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  setActiveTab('chat');
                                }}
                                className="text-slate-500 hover:text-slate-800 font-black flex items-center gap-1"
                              >
                                <span>Open in Chat 💬</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
