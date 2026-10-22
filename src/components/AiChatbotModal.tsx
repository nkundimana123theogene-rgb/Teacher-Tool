import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { subscribeToAppConfig } from '../utils/realtime';
import { AppConfig } from '../types';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  MessageSquare, 
  HelpCircle,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Palette,
  Globe,
  Flame
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface AiChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}


type ThemeColor = 'emerald' | 'purple' | 'amber' | 'cyan' | 'rose';

interface ThemeConfig {
  id: ThemeColor;
  name: string;
  badge: string;
  gradientBorder: string;
  glowColor: string;
  headerGrad: string;
  botAvatarGrad: string;
  userBubbleGrad: string;
  accentBg: string;
  accentText: string;
  btnGrad: string;
  chipGrad: string;
}

const THEMES: Record<ThemeColor, ThemeConfig> = {
  emerald: {
    id: 'emerald',
    name: 'Emerald Aurora',
    badge: 'from-emerald-400 to-teal-300',
    gradientBorder: 'border-emerald-500/50 hover:border-emerald-400',
    glowColor: 'rgba(16,185,129,0.35)',
    headerGrad: 'from-emerald-950/80 via-slate-900/90 to-slate-950',
    botAvatarGrad: 'from-emerald-500 via-teal-400 to-cyan-400',
    userBubbleGrad: 'from-emerald-600 via-teal-600 to-cyan-600',
    accentBg: 'bg-emerald-500/20',
    accentText: 'text-emerald-400',
    btnGrad: 'from-emerald-500 via-teal-500 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950',
    chipGrad: 'hover:border-emerald-400 text-emerald-300 bg-emerald-950/40 border-emerald-500/30'
  },
  purple: {
    id: 'purple',
    name: 'Cosmic Violet',
    badge: 'from-purple-400 to-pink-300',
    gradientBorder: 'border-purple-500/50 hover:border-purple-400',
    glowColor: 'rgba(168,85,247,0.35)',
    headerGrad: 'from-purple-950/80 via-slate-900/90 to-slate-950',
    botAvatarGrad: 'from-purple-500 via-pink-500 to-rose-400',
    userBubbleGrad: 'from-purple-600 via-pink-600 to-rose-600',
    accentBg: 'bg-purple-500/20',
    accentText: 'text-purple-400',
    btnGrad: 'from-purple-500 via-pink-500 to-rose-400 hover:from-purple-400 hover:to-rose-300 text-white',
    chipGrad: 'hover:border-purple-400 text-purple-300 bg-purple-950/40 border-purple-500/30'
  },
  amber: {
    id: 'amber',
    name: 'Solar Flame',
    badge: 'from-amber-400 to-orange-300',
    gradientBorder: 'border-amber-500/50 hover:border-amber-400',
    glowColor: 'rgba(245,158,11,0.35)',
    headerGrad: 'from-amber-950/80 via-slate-900/90 to-slate-950',
    botAvatarGrad: 'from-amber-500 via-orange-500 to-yellow-400',
    userBubbleGrad: 'from-amber-600 via-orange-600 to-yellow-600',
    accentBg: 'bg-amber-500/20',
    accentText: 'text-amber-400',
    btnGrad: 'from-amber-500 via-orange-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950',
    chipGrad: 'hover:border-amber-400 text-amber-300 bg-amber-950/40 border-amber-500/30'
  },
  cyan: {
    id: 'cyan',
    name: 'Electric Blue',
    badge: 'from-cyan-400 to-blue-300',
    gradientBorder: 'border-cyan-500/50 hover:border-cyan-400',
    glowColor: 'rgba(6,182,212,0.35)',
    headerGrad: 'from-cyan-950/80 via-slate-900/90 to-slate-950',
    botAvatarGrad: 'from-cyan-500 via-sky-400 to-blue-500',
    userBubbleGrad: 'from-cyan-600 via-sky-600 to-blue-600',
    accentBg: 'bg-cyan-500/20',
    accentText: 'text-cyan-400',
    btnGrad: 'from-cyan-500 via-sky-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950',
    chipGrad: 'hover:border-cyan-400 text-cyan-300 bg-cyan-950/40 border-cyan-500/30'
  },
  rose: {
    id: 'rose',
    name: 'Ruby Glow',
    badge: 'from-rose-400 to-red-300',
    gradientBorder: 'border-rose-500/50 hover:border-rose-400',
    glowColor: 'rgba(244,63,94,0.35)',
    headerGrad: 'from-rose-950/80 via-slate-900/90 to-slate-950',
    botAvatarGrad: 'from-rose-500 via-red-500 to-orange-400',
    userBubbleGrad: 'from-rose-600 via-red-600 to-pink-600',
    accentBg: 'bg-rose-500/20',
    accentText: 'text-rose-400',
    btnGrad: 'from-rose-500 via-red-500 to-orange-400 hover:from-rose-400 hover:to-orange-300 text-white',
    chipGrad: 'hover:border-rose-400 text-rose-300 bg-rose-950/40 border-rose-500/30'
  }
};

export const AiChatbotModal: React.FC<AiChatbotModalProps> = ({ isOpen, onClose }) => {
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>('emerald');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const theme = THEMES[currentTheme];

  useEffect(() => {
    const unsub = subscribeToAppConfig(setAppConfig);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      const wa = appConfig?.whatsappNumber || '0781339530';
      const greeting = appConfig?.chatbotGreeting || `Hello! I am **Nkorera AI Assistant** 🤖✨ — Your Teaching Assistant in Rwanda.

I am ready to help you with all your needs:
✨ **Write CBC Lesson Plans** in Kinyarwanda or English
📅 **Create Scheme of Work** for the whole term
📝 **Prepare Quizzes, Homework & Exams** with Marking Scheme
📚 **Learn about REB books and Nkorera App resources**

You can call or message us on WhatsApp: **${wa}**!`;
      
      setMessages([
        {
          id: '1',
          role: 'model',
          text: greeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [appConfig]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking === id) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);
    setIsSpeaking(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleClearHistory = () => {
    const wa = appConfig?.whatsappNumber || '0781339530';
    setMessages([
      {
        id: Date.now().toString(),
        role: 'model',
        text: `Chat reset! Hello! I am Nkorera AI Assistant 🤖. What can I help you with today? (WhatsApp: ${wa})`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          history: messages.slice(-8).map(m => ({ role: m.role, text: m.text }))
        })
      });

      const data = await response.json();
      const replyText = data.reply || "Hello! Nkorera AI Assistant is here to help. You can call or message us on WhatsApp: 0781339530.";

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Failed to communicate with AI ChatBot:', err);
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Hello! You can reach our staff on WhatsApp: 0781339530 for quick assistance on the Nkorera Education App!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          boxShadow: `0 0 80px -15px ${theme.glowColor}, 0 25px 50px -12px rgba(0,0,0,0.8)`
        }}
        className={`bg-slate-950 border-2 ${theme.gradientBorder} rounded-[2.5rem] w-full max-w-2xl h-[92vh] max-h-[780px] flex flex-col overflow-hidden relative transition-all duration-500`}
      >
        {/* TOP GLOWING AMBIENT LIGHTS */}
        <div 
          className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-30 transition-all duration-700"
          style={{ background: theme.glowColor }}
        />
        <div 
          className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-30 transition-all duration-700"
          style={{ background: theme.glowColor }}
        />

        {/* HEADER */}
        <div className={`p-4 sm:p-5 bg-gradient-to-r ${theme.headerGrad} backdrop-blur-xl border-b border-slate-800/80 flex flex-col gap-3 relative z-10`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              {/* Dynamic glowing Avatar */}
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${theme.botAvatarGrad} p-[2px] shadow-lg relative overflow-hidden group`}>
                <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center relative overflow-hidden">
                  <Bot className="w-6 h-6 text-white relative z-10 group-hover:rotate-12 transition-transform" />
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <motion.span 
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950" 
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                    <span>Nkorera AI Assistant</span>
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  </h2>
                  <div className={`px-2 py-0.5 rounded-full text-[9px] font-black ${theme.accentBg} ${theme.accentText} border border-current flex items-center gap-1 shadow-sm uppercase tracking-wider`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    ONLINE
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Teaching Assistant & CBC Co-pilot (Rwanda)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button 
                onClick={handleClearHistory}
                title="Reset chat"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <a 
                href={`https://wa.me/${appConfig?.whatsappNumber || '250781339530'}?text=Mwaramutse%20Nkorera%20Education%20App`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/30 cursor-pointer border border-emerald-400/30 group active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-200 group-hover:scale-110 transition-transform" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* PALETTE THEME SELECTOR BAR */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold">
              <Palette className="w-3 h-3 text-amber-400" />
              <span>Select your favorite color:</span>
            </div>
            <div className="flex items-center gap-1.5">
              {(Object.keys(THEMES) as ThemeColor[]).map((thmKey) => (
                <button
                  key={thmKey}
                  onClick={() => setCurrentTheme(thmKey)}
                  title={THEMES[thmKey].name}
                  className={`px-2 py-0.5 rounded-lg text-[9px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                    currentTheme === thmKey 
                      ? `bg-white text-slate-950 shadow-md scale-105 ring-2 ring-white/50` 
                      : `bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800`
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${THEMES[thmKey].badge}`} />
                  <span>{THEMES[thmKey].name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CHAT MESSAGES BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950 custom-scrollbar relative">
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                layout
                className={`flex gap-3 max-w-[92%] sm:max-w-[88%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* AVATAR */}
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-lg ${
                  msg.role === 'user' 
                    ? `bg-gradient-to-tr ${theme.userBubbleGrad} text-white border border-white/20` 
                    : `bg-gradient-to-tr ${theme.botAvatarGrad} text-slate-950 border border-white/30`
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-slate-950 font-black" />}
                </div>

                {/* MESSAGE CARD */}
                <div className="space-y-1 group">
                  <div className={`p-4 rounded-3xl text-[13px] sm:text-[14px] leading-relaxed shadow-xl relative transition-all ${
                    msg.role === 'user'
                      ? `bg-gradient-to-r ${theme.userBubbleGrad} text-white rounded-tr-sm border border-white/20 font-medium`
                      : `bg-slate-900/95 border border-slate-700/80 text-slate-100 rounded-tl-sm whitespace-pre-wrap backdrop-blur-md hover:border-slate-600`
                  }`}>
                    {msg.text}

                    {/* ACTION BUTTONS ON MODEL REPLIES */}
                    {msg.role === 'model' && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[10px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedMsgId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-400" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleSpeak(msg.id, msg.text)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer ${
                              isSpeaking === msg.id ? 'text-amber-400 bg-amber-950/40' : 'hover:text-white'
                            }`}
                          >
                            {isSpeaking === msg.id ? (
                              <>
                                <VolumeX className="w-3 h-3 text-amber-400 animate-pulse" />
                                <span className="font-bold">Stop Speaking</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3 text-slate-400" />
                                <span>Read Aloud</span>
                              </>
                            )}
                          </button>
                        </div>

                        <span className="text-[9px] text-slate-500 font-mono">
                          {msg.timestamp}
                        </span>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <span className="text-[9px] font-bold text-slate-500 px-3 text-right block font-mono">
                      {msg.timestamp}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* TYPING INDICATOR */}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-[80%] mr-auto items-center"
            >
              <div className={`w-9 h-9 rounded-2xl bg-gradient-to-tr ${theme.botAvatarGrad} text-slate-950 flex items-center justify-center shadow-lg font-black`}>
                <Bot className="w-4 h-4 animate-bounce text-slate-950" />
              </div>
              <div className="p-3.5 px-4 rounded-3xl rounded-tl-sm bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-3 shadow-xl backdrop-blur-md">
                <div className="flex gap-1">
                  <span className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s] ${theme.accentBg} ${theme.accentText}`}></span>
                  <span className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s] ${theme.accentBg} ${theme.accentText}`}></span>
                  <span className={`w-2 h-2 rounded-full animate-bounce ${theme.accentBg} ${theme.accentText}`}></span>
                </div>
                <span className="text-slate-300">Nkorera AI is thinking...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* QUICK SUGGESTIONS PROMPTS - REMOVED */}
        {/* <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800/80 overflow-x-auto flex gap-2 no-scrollbar relative z-10">
          {QUICK_PROMPTS.map((prompt, index) => (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={index}
              onClick={() => handleSendMessage(prompt.text)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-2xl border text-[11px] font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer shadow-sm ${theme.chipGrad}`}
            >
              <span>{prompt.icon}</span>
              <span className="whitespace-nowrap">{prompt.text}</span>
            </motion.button>
          ))}
        </div> */}

        {/* WHATSAPP MOBILE BANNER */}
        <div className="sm:hidden px-4 py-2 bg-emerald-950/50 border-t border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-300 text-[10px] font-black uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>WhatsApp Support</span>
          </div>
          <a 
            href={`https://wa.me/${appConfig?.whatsappNumber || '250781339530'}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black shadow-md"
          >
            <MessageSquare className="w-3 h-3" />
            <span>{appConfig?.whatsappNumber || '0781339530'}</span>
          </a>
        </div>

        {/* INPUT FORM */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800/90 relative z-10">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2.5"
          >
            <div className="flex-1 relative group">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question or type your request to Nkorera AI..."
                className="w-full bg-slate-900 border-2 border-slate-700/80 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-all shadow-inner group-hover:border-slate-600 font-medium"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-500">
                <HelpCircle className="w-4 h-4 opacity-40 hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-tr ${theme.btnGrad} disabled:opacity-40 rounded-2xl font-black transition-all flex items-center justify-center cursor-pointer shadow-xl active:scale-95 group shrink-0`}
            >
              <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </form>

          <div className="flex items-center justify-between px-2 mt-2 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Flame className="w-2.5 h-2.5 text-amber-400" />
              Powered by Nkorera AI & CBC Engine
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-2.5 h-2.5 text-emerald-400" />
              English Ready
            </span>
          </div>
          
          <button
            onClick={onClose}
            className="w-full py-3 mt-4 bg-blue-800 hover:bg-blue-900/50 text-white border border-blue-700 rounded-2xl font-black text-xs transition-all hover:border-blue-500/50"
          >
            Close Chatbox
          </button>
        </div>

      </motion.div>
    </div>
  );
};

