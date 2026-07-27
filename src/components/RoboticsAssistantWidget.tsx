import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, Phone, ExternalLink, HelpCircle, ShieldCheck, Zap } from 'lucide-react';
import { OWNER_INFO } from '../data/plans';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  options?: { label: string; action: () => void }[];
  whatsappLink?: boolean;
}

export const RoboticsAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: "Muraho! Ndi Teacher Tool AI Assistant 🤖. Mfite ubumenyi bwo kugufasha ku birebana n'imikoreshereze ya Teacher Tool, kwishyura no gukora Lesson Plans.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

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
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userText = input.trim();
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: userText, time };
    setMessages((prev) => [...prev, userMsg]);

    // Simple AI bot rule-based routing for instant, accurate customer responses
      setTimeout(() => {
        let botResponse = `Urakoze ku kibazo cyawe! Teacher Tool AI Assistant ifite amakuru arambuye ku rwego rwa Mwarimu. Twagufasha kuri MoMo Code (${OWNER_INFO.momoCode}), gukora Lesson Plan, cyangwa ukadusanga mu muryango wa WhatsApp Group kuri ${OWNER_INFO.whatsapp}.`;
        let showWhatsapp = false;

        const lower = userText.toLowerCase();

        if (lower.includes('momo') || lower.includes('kwishyura') || lower.includes('pay') || lower.includes('igiciro') || lower.includes('code')) {
          botResponse = `Kwishyura biroroshye cyane!\n\n1. Kanda Code ya Mobile Money: ${OWNER_INFO.momoCode}\n2. Shyiramo amafaranga y'ifatabuguzi wahisemo (Single Plan: 1,000 RWF, Teacher Monthly: 5,000 RWF, Unlimited: 15,000 RWF).\n3. Izina rizazaho: ${OWNER_INFO.accountHolder}.\n4. Umaze kwishyura, kanda kuri 'Admin Panel' cyangwa ukoreshe WhatsApp ${OWNER_INFO.whatsapp} kugira ngo bakwegukane konti yawe!`;
        } else if (lower.includes('free') || lower.includes('ubuntu') || lower.includes(' quota')) {
          botResponse = `Buri mwarimu n'umukiriya ahabwa LESSON PLANS 3 Z'UBUNTU buri ntangiriro z'ukwezi! Umaze kuzirangiza, ushobora kugura ifatabuguzi ry'ukwezi gukomeza gukora amasomo ahanitse.`;
        } else if (lower.includes('whatsapp') || lower.includes('group') || lower.includes('kwinjira') || lower.includes('ubufasha') || lower.includes('phone') || lower.includes('nimero')) {
          botResponse = `Ushobora kwinjira mu muryango wacu wa WhatsApp no kubona ubufasha bw'ako kanya kuri nimero ${OWNER_INFO.whatsapp} (${OWNER_INFO.accountHolder}).`;
          showWhatsapp = true;
        } else if (lower.includes('lesson plan') || lower.includes('reb') || lower.includes('gukora') || lower.includes('generate')) {
          botResponse = `Kugira ngo ukore Lesson Plan nshya:\n1. Kanda 'Generate Lesson Plan'\n2. Uzuza ibintu by'isomo ry icyigwa (Subject, Grade, Lesson Title, Unit, Learning Materials)\n3. AI izaguha Instructional Objective yakozwe neza n'imigendekere yose y'isomo mu rurimi wahisemo!`;
        }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botResponse,
        time,
        whatsappLink: showWhatsapp,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 400);
  };

  return (
    <>
      {/* Floating Robot Badge Button */}
      <div className="fixed bottom-5 right-5 z-50 print:hidden">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:shadow-emerald-900/40 hover:scale-105 transition-all duration-300 border-2 border-emerald-400/60"
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
                <span>Ubufasha bwa Robot & WhatsApp</span>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Robotics Chat Widget Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[92vw] sm:w-[400px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 print:hidden">
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
                  Ubufasha Bwihuse • WhatsApp 0781339530
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full text-emerald-200 hover:text-white transition-colors"
              title="Funga / Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="bg-slate-50 p-2.5 border-b border-slate-200 overflow-x-auto flex items-center gap-2 text-xs shrink-0 no-scrollbar">
            <button
              onClick={() =>
                handleSendQuickQuery(
                  "Nkoza nte kwishyura kuri MoMo Code?",
                  `Kanda Code ya MoMo: ${OWNER_INFO.momoCode} (Izina: ${OWNER_INFO.accountHolder}). Shyiramo amafaranga y'ifatabuguzi ryawe, hanyuma wuzuze kwishyura!`
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
                  "Ese Lesson Plans 3 z'ubuntu zikora zite?",
                  `Buri mwarimu n'umukiriya wese ahabwa Lesson Plans 3 z'UBUNTU buri ntangiriro z'ukwezi! Zikoreshe gukora n'isesengura ry'amasomo yawe.`
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
                  "Nshaka kwinjira mu muryango wa WhatsApp!",
                  `Ushobora kwinjira mu muryango wa WhatsApp ukoresheje nimero 0781339530 cyangwa ukanda buto y'icyobere yo kwinjira kumpapuro!`,
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
            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Baza Robotic cyangwa wandike ikibazo..."
              className="flex-1 px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl shadow-xs transition-all flex items-center justify-center shrink-0"
              title="Ohereza / Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
