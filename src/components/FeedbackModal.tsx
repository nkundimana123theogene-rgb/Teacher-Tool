import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Star, 
  Lightbulb, 
  Bug, 
  HeartHandshake, 
  HelpCircle, 
  User, 
  Mail, 
  Phone,
  MessageCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Search
} from 'lucide-react';
import { UserProfile, UserFeedback } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, user }) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'replies'>('submit');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [category, setCategory] = useState<'suggestion' | 'bug' | 'praise' | 'help' | 'general'>('suggestion');
  const [rating, setRating] = useState<number>(5);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // My Feedbacks State
  const [myFeedbacks, setMyFeedbacks] = useState<UserFeedback[]>([]);
  const [loadingMyFeedbacks, setLoadingMyFeedbacks] = useState(false);
  const [searchFilter, setSearchFilter] = useState(user?.email || user?.phone || user?.name || '');

  const fetchMyFeedbacks = async (contactQuery?: string) => {
    setLoadingMyFeedbacks(true);
    try {
      const q = contactQuery || searchFilter || user?.email || user?.phone || user?.name || '';
      const res = await fetch(`/api/my-feedbacks?contact=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json().catch(() => []);
        setMyFeedbacks(data);
      }
    } catch (err) {
      console.warn('Failed to fetch my feedbacks:', err);
    } finally {
      setLoadingMyFeedbacks(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'replies') {
      fetchMyFeedbacks();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Nyamuneka andika ubutumwa cyangwa igitekerezo cyawe.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        userName: name || user?.name || 'Inzobere / Umwarimu',
        userEmail: email || user?.email || 'Nta Email',
        userPhone: phone || user?.phone || '',
        category,
        rating,
        subject: subject.trim() || undefined,
        message: message.trim(),
        timestamp: new Date().toISOString()
      };

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess(true);
        setMessage('');
        setSubject('');
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Ntabwo igitekerezo gishoboye kwoherezwa.');
      }
    } catch (err: any) {
      setError(err.message || 'Harabaye ikosa mu kwohereza igitekerezo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full text-white shadow-2xl overflow-hidden relative my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-900 p-6 border-b border-slate-800 relative flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20">
              <MessageSquare className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-[10px] font-bold mb-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Direct Admin Communication</span>
              </div>
              <h3 className="text-lg md:text-xl font-black text-white leading-tight">
                Ibitekerezo & Igisubizo cya Admin
              </h3>
              <p className="text-xs text-purple-200 mt-0.5">
                Ohereza ubutumwa cyangwa urebe igisubizo Admin yaguhesheje.
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="bg-slate-950/60 p-2 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === 'submit'
                ? 'bg-gradient-to-r from-amber-400 to-lime-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>1. Submit Feedback</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('replies');
              fetchMyFeedbacks();
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === 'replies'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-amber-300" />
            <span>2. View Admin Replies 💬</span>
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-5">
          {activeTab === 'submit' ? (
            success ? (
              <div className="text-center py-8 space-y-4 animate-fadeIn">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-black text-white">Thank You! 🎉</h4>
                  <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    Your feedback has been successfully sent to Admin. We appreciate your feedback to continuously improve Teacher Tool!
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setActiveTab('replies');
                      fetchMyFeedbacks();
                    }}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow-lg transition-all"
                  >
                    Reba Igisubizo (View Replies) 💬
                  </button>
                  <button
                    onClick={handleResetAndClose}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all"
                  >
                    Funga (Close)
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                {/* User info row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-purple-400" />
                      <span>Izina ryawe (Name)</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="E.g. NKUNDIMANA Theogene"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-purple-400" />
                      <span>Email cyangwa Telefone</span>
                    </label>
                    <input
                      type="text"
                      value={email || phone}
                      onChange={(e) => {
                        if (e.target.value.includes('@')) {
                          setEmail(e.target.value);
                        } else {
                          setPhone(e.target.value);
                        }
                      }}
                      placeholder="E.g. 0781339530 cyangwa email"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Category Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Feedback Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setCategory('suggestion')}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                        category === 'suggestion'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-xs">Suggestion</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCategory('bug')}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                        category === 'bug'
                          ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Bug className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="text-xs">Ikibazo / Error</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCategory('praise')}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                        category === 'praise'
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <HeartHandshake className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs">Gushima</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCategory('help')}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                        category === 'help'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-xs">Help & Support</span>
                    </button>
                  </div>
                </div>

                {/* Star Rating */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Satisfaction Score
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-400 ml-2">
                      {rating === 5 ? '⭐ 5/5 (Excellent!)' : rating === 4 ? '👍 4/5 (Very Good)' : `${rating}/5`}
                    </span>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Subject / Topic
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="E.g., Feature request or feedback regarding schemes..."
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Your Feedback / Message <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    required
                    placeholder="Describe your feedback, suggestion, or any issue you encountered..."
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
                  >
                    Reka (Cancel)
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-lime-400 hover:from-amber-300 hover:to-lime-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-400/20 flex items-center gap-2 transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                  >
                    <Send className={`w-4 h-4 ${isSubmitting ? 'animate-bounce' : ''}`} />
                    <span>{isSubmitting ? 'Irikwoherezwa...' : 'Ohereza kuri Admin 🚀'}</span>
                  </button>
                </div>
              </form>
            )
          ) : (
            /* activeTab === 'replies' */
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Shakisha ukoresheje Email, Telefone cyangwa Izina..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
                <button
                  onClick={() => fetchMyFeedbacks(searchFilter)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingMyFeedbacks ? 'animate-spin' : ''}`} />
                  <span>Shakisha</span>
                </button>
              </div>

              {/* Feedbacks List */}
              {loadingMyFeedbacks ? (
                <div className="text-center py-10 space-y-2">
                  <RefreshCw className="w-7 h-7 text-amber-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 font-bold">Iri gukura igisubizo cya Admin...</p>
                </div>
              ) : myFeedbacks.length === 0 ? (
                <div className="text-center py-10 bg-slate-950/40 rounded-2xl border border-slate-800 p-4 space-y-2">
                  <MessageCircle className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-300">Nta gitekerezo gihuye n'iyi filter kibonetse</p>
                  <p className="text-[11px] text-slate-500">Andika email cyangwa telefone yawe hano hejuru ngo urebe ubutumwa wamaze kwohereza n'igisubizo cya Admin.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {myFeedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-md">
                            {fb.category}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {new Date(fb.timestamp).toLocaleDateString()}
                          </span>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          fb.adminReply
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {fb.adminReply ? '✅ YASUBIJWE (REPLIED)' : '📌 BITAHO (PENDING)'}
                        </span>
                      </div>

                      <div>
                        {fb.subject && (
                          <div className="font-extrabold text-xs text-amber-300 mb-1">{fb.subject}</div>
                        )}
                        <p className="text-xs text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-slate-800 italic">
                          "{fb.message}"
                        </p>
                      </div>

                      {/* Admin Reply Section */}
                      {fb.adminReply ? (
                        <div className="bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-purple-500/40 p-3.5 rounded-xl space-y-1.5 animate-fadeIn">
                          <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Igisubizo cya Admin / Ubuyobozi:</span>
                          </div>
                          <p className="text-xs text-purple-100 font-medium leading-relaxed">
                            {fb.adminReply}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>Admin ari kureba igitekerezo cyawe. Uragera ku igisubizo hano vuba!</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

