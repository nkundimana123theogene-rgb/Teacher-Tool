import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  DollarSign,
  Users,
  FileText,
  RefreshCw,
  Phone,
  Mail,
  Zap,
  UserCheck,
  Ban,
  Plus,
  ShieldCheck,
  Activity,
  UserX,
  BookOpen,
  Sparkles,
  Calendar,
  GraduationCap,
  Globe,
  Eye,
  X,
  Lock,
  Unlock,
  MessageSquare,
  Star,
  Lightbulb,
  Bug,
  Send,
  MessageCircle,
  Trash2,
  HeartHandshake,
  HelpCircle,
  Check
} from 'lucide-react';
import { PaymentSubmission, UserProfile, LessonPlanLog, UserFeedback } from '../types';
import { OWNER_INFO } from '../data/plans';

interface AdminPanelProps {
  user: UserProfile | null;
  onPaymentApproved?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, onPaymentApproved }) => {
  const [activeSubTab, setActiveSubTab] = useState<'payments' | 'users' | 'plans' | 'feedback' | 'seo'>('payments');

  // Payments State
  const [payments, setPayments] = useState<PaymentSubmission[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [paymentSearch, setPaymentSearch] = useState('');

  // Users State
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userFilterProvider, setUserFilterProvider] = useState<'all' | 'google' | 'email'>('all');

  // Lesson Plans Logs State
  const [planLogs, setPlanLogs] = useState<LessonPlanLog[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [planSearch, setPlanSearch] = useState('');
  const [planLanguageFilter, setPlanLanguageFilter] = useState<string>('all');
  const [selectedLogModal, setSelectedLogModal] = useState<LessonPlanLog | null>(null);

  // Feedbacks State
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<string>('all');
  const [replyInputMap, setReplyInputMap] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);

  // SEO Diagnostics State
  const [seoRobotsStatus, setSeoRobotsStatus] = useState<'checking' | 'found' | 'missing'>('checking');
  const [seoSitemapStatus, setSeoSitemapStatus] = useState<'checking' | 'found' | 'missing'>('checking');
  const [robotsContent, setRobotsContent] = useState<string>('');
  const [sitemapContent, setSitemapContent] = useState<string>('');
  const [urlChecks, setUrlChecks] = useState<Array<{ url: string; label: string; status: 'checking' | 'online' | 'offline'; code?: number }>>([]);
  const [htmlMetaTags, setHtmlMetaTags] = useState<Array<{ nameOrProperty: string; value: string; exists: boolean }>>([]);

  const [error, setError] = useState<string | null>(null);

  const runSeoDiagnostics = async () => {
    setSeoRobotsStatus('checking');
    setSeoSitemapStatus('checking');
    
    // Check Robots.txt
    try {
      const res = await fetch('/robots.txt');
      if (res.ok) {
        setSeoRobotsStatus('found');
        const text = await res.text();
        setRobotsContent(text.slice(0, 1000));
      } else {
        setSeoRobotsStatus('missing');
        setRobotsContent('');
      }
    } catch {
      setSeoRobotsStatus('missing');
      setRobotsContent('');
    }

    // Check Sitemap.xml
    try {
      const res = await fetch('/sitemap.xml');
      if (res.ok) {
        setSeoSitemapStatus('found');
        const text = await res.text();
        setSitemapContent(text.slice(0, 1000));
      } else {
        setSeoSitemapStatus('missing');
        setSitemapContent('');
      }
    } catch {
      setSeoSitemapStatus('missing');
      setSitemapContent('');
    }

    // Verify Critical Files Status
    const filesToCheck = [
      { path: '/', label: 'Home Page (/)', url: window.location.origin + '/' },
      { path: '/robots.txt', label: 'Robots.txt File', url: window.location.origin + '/robots.txt' },
      { path: '/sitemap.xml', label: 'Sitemap.xml File', url: window.location.origin + '/sitemap.xml' },
      { path: '/manifest.json', label: 'PWA Manifest File', url: window.location.origin + '/manifest.json' },
      { path: '/sw.js', label: 'PWA Service Worker File', url: window.location.origin + '/sw.js' },
      { path: '/pwa-192x192.png', label: 'PWA App Icon (192px)', url: window.location.origin + '/pwa-192x192.png' }
    ];

    setUrlChecks(filesToCheck.map(f => ({ url: f.url, label: f.label, status: 'checking' })));

    for (let i = 0; i < filesToCheck.length; i++) {
      const item = filesToCheck[i];
      try {
        const res = await fetch(item.path, { method: 'HEAD' }).catch(() => fetch(item.path)); // Fallback to GET if HEAD blocked
        if (res.ok) {
          setUrlChecks(prev => prev.map(u => u.url === item.url ? { ...u, status: 'online', code: res.status } : u));
        } else {
          setUrlChecks(prev => prev.map(u => u.url === item.url ? { ...u, status: 'offline', code: res.status } : u));
        }
      } catch {
        setUrlChecks(prev => prev.map(u => u.url === item.url ? { ...u, status: 'offline', code: 500 } : u));
      }
    }

    // Inspect real page metadata tags
    const checkedTags = [
      { nameOrProperty: 'description', value: document.querySelector('meta[name="description"]')?.getAttribute('content') || '' },
      { nameOrProperty: 'keywords', value: document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '' },
      { nameOrProperty: 'author', value: document.querySelector('meta[name="author"]')?.getAttribute('content') || '' },
      { nameOrProperty: 'robots', value: document.querySelector('meta[name="robots"]')?.getAttribute('content') || '' },
      { nameOrProperty: 'og:title', value: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '' },
      { nameOrProperty: 'og:description', value: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '' },
      { nameOrProperty: 'og:image', value: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '' },
      { nameOrProperty: 'google-site-verification', value: document.querySelector('meta[name="google-site-verification"]')?.getAttribute('content') || '' },
      { nameOrProperty: 'Schema.org JSON-LD', value: document.querySelector('script[type="application/ld+json"]')?.textContent ? 'Configured (Detected Structured Data JSON-LD)' : '' }
    ];

    setHtmlMetaTags(checkedTags.map(t => ({
      nameOrProperty: t.nameOrProperty,
      value: t.value,
      exists: !!t.value
    })));
  };

  useEffect(() => {
    if (activeSubTab === 'seo') {
      runSeoDiagnostics();
    }
  }, [activeSubTab]);

  const fetchPayments = async (retries = 2) => {
    setLoadingPayments(true);
    setError(null);
    try {
      const token = localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token');
      const res = await fetch('/api/admin/payments', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        }
      });
      if (res.ok) {
        const data = await res.json().catch(() => []);
        setPayments(data);
      } else if (res.status === 401 || res.status === 403) {
        console.warn(`Admin access not authenticated (status ${res.status}).`);
        setError('Ntabwo wemerewe kubona aya makuru (Unauthorized / Session expired).');
      } else {
        throw new Error(`Server returned ${res.status}`);
      }
    } catch (err: any) {
      console.warn('Failed to load admin payments:', err.message || err);
      if (retries > 0) {
        setTimeout(() => fetchPayments(retries - 1), 1000);
      } else {
        setError('Failed to load payments from server. Click refresh to try again.');
      }
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token');
      const res = await fetch('/api/admin/users', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        }
      });
      if (res.ok) {
        const data = await res.json().catch(() => []);
        setUsersList(data);
      } else if (res.status === 401 || res.status === 403) {
        console.warn(`Admin access not authenticated for users (status ${res.status}).`);
      } else {
        throw new Error(`Server returned ${res.status}`);
      }
    } catch (err: any) {
      console.warn('Failed to load admin users:', err.message || err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchPlanLogs = async () => {
    setLoadingPlans(true);
    try {
      const token = localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token');
      const res = await fetch('/api/admin/plan-logs', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        }
      });
      if (res.ok) {
        const data = await res.json().catch(() => []);
        setPlanLogs(data);
      } else if (res.status === 401 || res.status === 403) {
        console.warn(`Admin access not authenticated for logs (status ${res.status}).`);
      } else {
        throw new Error(`Server returned ${res.status}`);
      }
    } catch (err: any) {
      console.warn('Failed to load plan logs:', err.message || err);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchUsers();
    fetchPlanLogs();
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const token = localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token');
      const res = await fetch('/api/admin/feedbacks', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        }
      });
      if (res.ok) {
        const data = await res.json().catch(() => []);
        setFeedbacks(data);
      }
    } catch (err) {
      console.warn('Failed to load feedbacks:', err);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  const handleUpdateFeedback = async (id: string, action?: 'delete', status?: 'pending' | 'reviewed' | 'resolved', reply?: string) => {
    try {
      const token = localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token');
      const res = await fetch('/api/admin/update-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id, action, status, adminReply: reply })
      });
      if (res.ok) {
        fetchFeedbacks();
        setReplyingId(null);
      }
    } catch (err) {
      console.error('Error updating feedback:', err);
    }
  };

  const handleUpdateStatus = async (paymentId: string, status: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token');
      const res = await fetch('/api/admin/update-payment-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ paymentId, status }),
      });
      if (res.ok) {
        fetchPayments();
        fetchUsers();
        if (onPaymentApproved) onPaymentApproved();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUserAction = async (email: string, action: string, value?: any) => {
    try {
      const token = localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token');
      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email, action, value }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesQuery =
      p.userName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      p.userEmail.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      p.momoTxRef.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      p.userPhone.includes(paymentSearch);
    return matchesStatus && matchesQuery;
  });

  const filteredUsers = usersList.filter((u) => {
    const matchesProvider =
      userFilterProvider === 'all' || u.authProvider === userFilterProvider;
    const matchesQuery =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearch));
    return matchesProvider && matchesQuery;
  });

  const filteredPlanLogs = planLogs.filter((log) => {
    const logLang = log.language.toLowerCase();
    const matchesLang =
      planLanguageFilter === 'all' ||
      logLang === planLanguageFilter.toLowerCase() ||
      (planLanguageFilter === 'kiswahili' && (logLang === 'kiswahili' || logLang === 'swahili'));
    const query = planSearch.toLowerCase();
    const matchesQuery =
      log.userName.toLowerCase().includes(query) ||
      log.userEmail.toLowerCase().includes(query) ||
      log.subject.toLowerCase().includes(query) ||
      log.lessonTitle.toLowerCase().includes(query) ||
      log.unitTitle.toLowerCase().includes(query) ||
      log.classGrade.toLowerCase().includes(query);
    return matchesLang && matchesQuery;
  });

  const filteredFeedbacks = feedbacks.filter((f) => {
    const matchesStatus = feedbackStatusFilter === 'all' || f.status === feedbackStatusFilter;
    const matchesCategory = feedbackCategoryFilter === 'all' || f.category === feedbackCategoryFilter;
    const query = feedbackSearch.toLowerCase();
    const matchesQuery =
      f.userName.toLowerCase().includes(query) ||
      f.userEmail.toLowerCase().includes(query) ||
      (f.userPhone && f.userPhone.includes(query)) ||
      (f.subject && f.subject.toLowerCase().includes(query)) ||
      f.message.toLowerCase().includes(query);
    return matchesStatus && matchesCategory && matchesQuery;
  });

  const totalRevenue = payments
    .filter((p) => p.status === 'approved')
    .reduce((sum, p) => sum + (p.amountFrw || 0), 0);

  const pendingCount = payments.filter((p) => p.status === 'pending').length;
  const activeLoginsToday = usersList.filter((u) => u.status !== 'blocked').length;
  const pendingFeedbacksCount = feedbacks.filter((f) => f.status === 'pending').length;
  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + (f.rating || 5), 0) / feedbacks.length).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/30 text-purple-200 border border-purple-400/30 rounded-full text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5 text-purple-300" />
            <span>Owner Admin Dashboard • {OWNER_INFO.name}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">System Control & Usage Monitor</h1>
          <p className="text-xs text-purple-200 mt-1">
            Gucunga abakiriya, kureba abinjiriye kuri Google/Email, n'ibarura ry'abakoresheje Lesson Plans.
          </p>
        </div>

        <button
          onClick={() => {
            fetchPayments();
            fetchUsers();
            fetchPlanLogs();
            fetchFeedbacks();
          }}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-white/10 transition-colors shrink-0"
          id="admin-refresh-all-btn"
        >
          <RefreshCw className={`w-4 h-4 ${loadingPayments || loadingUsers || loadingPlans || loadingFeedbacks ? 'animate-spin' : ''}`} />
          <span>Refresh All Data</span>
        </button>
      </div>

      {/* Main Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('payments')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'payments'
              ? 'bg-purple-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>1. Subscriptions & MoMo ({pendingCount} Pending)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'users'
              ? 'bg-purple-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4 text-amber-400" />
          <span>2. Users & Logins ({usersList.length} Accounts)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('plans')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'plans'
              ? 'bg-purple-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>3. Abakoresheje Lesson Plans ({planLogs.length} Generated)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('feedback')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'feedback'
              ? 'bg-purple-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span>4. Ibitekerezo ({pendingFeedbacksCount} Pending)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('seo')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'seo'
              ? 'bg-purple-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4 text-teal-400" />
          <span>5. SEO & Indexing Diagnostics</span>
        </button>
      </div>

      {activeSubTab === 'payments' && (
        <div className="space-y-6">
          {/* Analytics Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <span>Total Approved Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-slate-900 mt-2">
                {totalRevenue.toLocaleString()} Frw
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <span>Automatically Saved Paid</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-600 mt-2">
                {payments.filter((p) => p.status === 'approved').length} (Automatically Saved)
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <span>Pending Payment Proofs</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-black text-amber-600 mt-2">
                {pendingCount} Pending
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <span>Total Submissions</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-xl font-black text-slate-900 mt-2">
                {payments.length} Transactions
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold w-full md:w-auto">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                All ({payments.length})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'pending' ? 'bg-amber-500 text-white shadow-xs font-bold' : 'text-amber-800'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'approved' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-emerald-800'
                }`}
              >
                Approved
              </button>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search TxRef, email, phone..."
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Payment Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Teacher / User</th>
                    <th className="px-4 py-3">Plan Selected</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">MoMo TxRef</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium">
                        No payment submissions found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{p.userName}</div>
                          <div className="text-[11px] text-slate-500">{p.userEmail}</div>
                          <div className="text-[11px] text-emerald-700 font-medium">📞 {p.userPhone}</div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-800">{p.planLabel}</span>
                          <div className="text-[10px] text-slate-400">+{p.plansCount} plans</div>
                        </td>

                        <td className="px-4 py-3 font-extrabold text-emerald-800">
                          {p.amountFrw.toLocaleString()} Frw
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-mono bg-slate-100 px-2 py-1 rounded-md text-slate-800 font-bold text-[11px]">
                            {p.momoTxRef}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(p.timestamp).toLocaleString()}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {p.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Approved • (Automatically Saved)
                            </span>
                          )}
                          {p.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                              <Clock className="w-3.5 h-3.5" />
                              Pending Review
                            </span>
                          )}
                          {p.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                              <XCircle className="w-3.5 h-3.5" />
                              Rejected
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {p.status === 'pending' ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleUpdateStatus(p.id, 'approved')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs flex items-center gap-1 transition-colors"
                                id={`approve-payment-${p.id}`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Confirm Payment</span>
                              </button>

                              <button
                                onClick={() => handleUpdateStatus(p.id, 'rejected')}
                                className="px-2 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] rounded-lg transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'users' && (
        <div className="space-y-6">
          {/* User Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Total Registered</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {usersList.length} Accounts
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Active Logins</span>
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600 mt-2">
                {activeLoginsToday} Users
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Google Logins</span>
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-600 mt-2">
                {usersList.filter((u) => u.authProvider === 'google').length}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Blocked Accounts</span>
                <UserX className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-600 mt-2">
                {usersList.filter((u) => u.status === 'blocked').length}
              </div>
            </div>
          </div>

          {/* User Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold w-full md:w-auto">
              <button
                onClick={() => setUserFilterProvider('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  userFilterProvider === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                All Users ({usersList.length})
              </button>
              <button
                onClick={() => setUserFilterProvider('google')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  userFilterProvider === 'google' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-blue-800'
                }`}
              >
                Google Auth
              </button>
              <button
                onClick={() => setUserFilterProvider('email')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  userFilterProvider === 'email' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-emerald-800'
                }`}
              >
                Custom Email
              </button>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search teacher name, email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Teacher / User</th>
                    <th className="px-4 py-3">Auth & Status</th>
                    <th className="px-4 py-3">Last Login</th>
                    <th className="px-4 py-3">Subscription Plan</th>
                    <th className="px-4 py-3">Remaining Plans</th>
                    <th className="px-4 py-3">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium">
                        No registered users found matching search.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.email} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.isAdmin && (
                              <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.2 rounded-md font-extrabold">
                                OWNER
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{u.email}</div>
                          {u.phone && <div className="text-[11px] text-emerald-700 font-medium">📞 {u.phone}</div>}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 w-max">
                              {u.authProvider === 'google' ? '🔵 Google Sign-In' : '✉️ Email / Custom'}
                            </span>
                            {u.status === 'blocked' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 w-max">
                                🚫 Blocked
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 w-max">
                                🟢 Active
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">
                            {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Hafi ubu'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Logins: {u.loginCount || 1} times
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-slate-800">{u.currentPlan}</span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              (Automatically Saved)
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Total generated: {u.totalGenerated || 0}</div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-extrabold text-emerald-800 text-sm">
                            {u.isAdmin ? '♾️ Unlimited' : `${u.remainingPlans} plans`}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleUserAction(u.email, 'add_plans', 10)}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
                              title="Add 10 free lesson plan credits"
                            >
                              <Plus className="w-3 h-3" />
                              <span>+10 Plans</span>
                            </button>

                            {!u.isAdmin && (
                              <button
                                onClick={() => handleUserAction(u.email, 'toggle_cert_download')}
                                className={`px-2.5 py-1 font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 ${
                                  u.canDownloadCertificate
                                    ? 'bg-lime-400 text-slate-950 hover:bg-lime-300 font-extrabold border border-lime-500'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                                }`}
                                title={u.canDownloadCertificate ? "Kura uburenganzira bwo gukura certificate" : "Muhe uburenganzira bwo gukura Certificate"}
                              >
                                {u.canDownloadCertificate ? (
                                  <>
                                    <Unlock className="w-3 h-3 text-slate-950" />
                                    <span>Cert Allowed 🔓</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3 h-3 text-slate-600" />
                                    <span>Cert Locked 🔒</span>
                                  </>
                                )}
                              </button>
                            )}

                            {!u.isAdmin && (
                              <button
                                onClick={() => handleUserAction(u.email, 'grant_unlimited')}
                                className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold text-[10px] rounded-lg border border-amber-200 transition-colors flex items-center gap-1"
                              >
                                <Zap className="w-3 h-3 text-amber-600 fill-amber-300" />
                                <span>VIP Unlimited</span>
                              </button>
                            )}

                            {!u.isAdmin && (
                              <button
                                onClick={() => handleUserAction(u.email, 'toggle_status')}
                                className={`px-2.5 py-1 font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 ${
                                  u.status === 'blocked'
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                }`}
                              >
                                {u.status === 'blocked' ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Unblock Login</span>
                                  </>
                                ) : (
                                  <>
                                    <Ban className="w-3 h-3" />
                                    <span>Block Login</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'plans' && (
        <div className="space-y-6">
          {/* Plan Log Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <span>Total Plans</span>
                <BookOpen className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="text-xl font-black text-slate-900 mt-2">
                {planLogs.length} Plans
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <span>Unique Teachers</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-xl font-black text-purple-600 mt-2">
                {new Set(planLogs.map((l) => l.userEmail)).size} Educators
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <span>Kinyarwanda</span>
                <Globe className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-600 mt-2">
                {planLogs.filter((l) => l.language.toLowerCase() === 'kinyarwanda').length}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <span>English</span>
                <Globe className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-xl font-black text-blue-600 mt-2">
                {planLogs.filter((l) => l.language.toLowerCase() === 'english').length}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <span>Kiswahili</span>
                <Globe className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl font-black text-amber-600 mt-2">
                {planLogs.filter((l) => l.language.toLowerCase() === 'kiswahili' || l.language.toLowerCase() === 'swahili').length}
              </div>
            </div>
          </div>

          {/* Search & Language Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold w-full md:w-auto overflow-x-auto">
              <button
                onClick={() => setPlanLanguageFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                  planLanguageFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                All Languages (4)
              </button>
              <button
                onClick={() => setPlanLanguageFilter('kinyarwanda')}
                className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                  planLanguageFilter === 'kinyarwanda' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-emerald-800'
                }`}
              >
                🇷🇼 Kinyarwanda
              </button>
              <button
                onClick={() => setPlanLanguageFilter('english')}
                className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                  planLanguageFilter === 'english' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-blue-800'
                }`}
              >
                🇬🇧 English
              </button>
              <button
                onClick={() => setPlanLanguageFilter('french')}
                className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                  planLanguageFilter === 'french' ? 'bg-purple-600 text-white shadow-xs font-bold' : 'text-purple-800'
                }`}
              >
                🇫🇷 French
              </button>
              <button
                onClick={() => setPlanLanguageFilter('kiswahili')}
                className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                  planLanguageFilter === 'kiswahili' || planLanguageFilter === 'swahili' ? 'bg-amber-600 text-white shadow-xs font-bold' : 'text-amber-800'
                }`}
              >
                🇹🇿 Kiswahili
              </button>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search subject, teacher, topic..."
                value={planSearch}
                onChange={(e) => setPlanSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Lesson Plans Log Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Teacher / Educator</th>
                    <th className="px-4 py-3">Subject & Class</th>
                    <th className="px-4 py-3">Lesson Topic / Unit</th>
                    <th className="px-4 py-3">Language & Format</th>
                    <th className="px-4 py-3">Generated Date</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPlanLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium">
                        No generated lesson plan logs found.
                      </td>
                    </tr>
                  ) : (
                    filteredPlanLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{log.userName}</div>
                          <div className="text-[11px] text-slate-500">{log.userEmail}</div>
                          {log.schoolName && (
                            <div className="text-[10px] text-emerald-700 font-medium">🏫 {log.schoolName}</div>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-extrabold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                            {log.subject}
                          </span>
                          <div className="text-[11px] text-slate-600 font-semibold mt-1">
                            🎓 {log.classGrade}
                          </div>
                        </td>

                        <td className="px-4 py-3 max-w-xs">
                          <div className="font-bold text-slate-900 line-clamp-1">{log.lessonTitle}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">Unit: {log.unitTitle}</div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 w-max">
                              🌐 {log.language}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 w-max">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              (Automatically Saved)
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {log.format === 'reb_grid' ? 'REB CBC Grid' : 'Open Format'}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedLogModal(log)}
                            className="px-3 py-1.5 bg-purple-50 text-purple-800 hover:bg-purple-100 font-bold text-[11px] rounded-lg border border-purple-200 transition-colors flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-600" />
                            <span>Reba Ibirimo</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* activeSubTab === 'feedback' */}
      {activeSubTab === 'feedback' && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <span>Ibitekerezo Byose</span>
                <MessageSquare className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-xl font-black text-slate-900 mt-2">
                {feedbacks.length}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Ibitekerezo byakiriwe bivuye ku bakiriya</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <span>Ibitegereje Isuzuma</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-black text-amber-600 mt-2">
                {pendingFeedbacksCount}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Bitarasuzumwa cyangwa gutangwa reponse</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <span>Satisfaction Score</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <div className="text-xl font-black text-slate-900 mt-2 flex items-center gap-1">
                <span>{avgRating}</span>
                <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Ukwezi k'ukunyurwa kw'abarimu</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <span>Ibyasojwe (Resolved)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-600 mt-2">
                {feedbacks.filter(f => f.status === 'resolved' || f.status === 'reviewed').length}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Ibyamaze gusubizwa no gukorwa</p>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={feedbackSearch}
                  onChange={(e) => setFeedbackSearch(e.target.value)}
                  placeholder="Shakisha mu bitekerezo (Izina, email, telefone, ubutumwa)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                {(['all', 'pending', 'reviewed', 'resolved'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFeedbackStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                      feedbackStatusFilter === st
                        ? 'bg-purple-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all' ? 'Yose (All)' : st === 'pending' ? '📌 Pending' : st === 'reviewed' ? '👀 Reviewed' : '✅ Resolved'}
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 shrink-0">Category:</span>
                <select
                  value={feedbackCategoryFilter}
                  onChange={(e) => setFeedbackCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">Ibyiciro Byose</option>
                  <option value="suggestion">💡 Igitekerezo (Suggestion)</option>
                  <option value="bug">🐛 Ikibazo / Error (Bug)</option>
                  <option value="praise">⭐ Gushima (Praise)</option>
                  <option value="help">❓ Ubufasha (Help)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feedback Cards List */}
          <div className="space-y-4">
            {loadingFeedbacks ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-bold">Iri gukura ibitekerezo by'abakiriya...</p>
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">Nta gitekerezo kiringaniza gihari</p>
                <p className="text-xs text-slate-400 mt-1">Abakiriya nibamara kwohereza ibitekerezo bihita bigaragara hano.</p>
              </div>
            ) : (
              filteredFeedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-xs space-y-4 ${
                    fb.status === 'pending'
                      ? 'border-amber-300 ring-2 ring-amber-400/20'
                      : fb.status === 'resolved'
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                        fb.category === 'suggestion'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : fb.category === 'bug'
                          ? 'bg-rose-100 text-rose-900 border border-rose-200'
                          : fb.category === 'praise'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : 'bg-cyan-100 text-cyan-900 border border-cyan-200'
                      }`}>
                        {fb.category === 'suggestion' ? <Lightbulb className="w-3 h-3 text-amber-600" /> : fb.category === 'bug' ? <Bug className="w-3 h-3 text-rose-600" /> : fb.category === 'praise' ? <HeartHandshake className="w-3 h-3 text-emerald-600" /> : <HelpCircle className="w-3 h-3 text-cyan-600" />}
                        <span>{fb.category}</span>
                      </span>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        {[1, 2, 3, 4, 5].map((st) => (
                          <Star
                            key={st}
                            className={`w-3 h-3 ${st <= (fb.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>

                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(fb.timestamp).toLocaleString()}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      fb.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : fb.status === 'reviewed'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {fb.status === 'pending' ? '📌 Pending Review' : fb.status === 'reviewed' ? '👀 Reviewed' : '✅ Resolved'}
                    </span>
                  </div>

                  {/* Customer Info & Message Body */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                      <div className="font-black text-slate-900 text-sm">{fb.userName}</div>
                      <div className="text-slate-600 flex items-center gap-1 text-[11px]">
                        <Mail className="w-3 h-3 text-purple-600 shrink-0" />
                        <a href={`mailto:${fb.userEmail}`} className="hover:underline truncate">{fb.userEmail}</a>
                      </div>
                      {fb.userPhone && (
                        <div className="text-slate-600 flex items-center gap-1 text-[11px]">
                          <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                          <a href={`https://wa.me/${fb.userPhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="hover:underline text-emerald-700 font-bold">
                            {fb.userPhone} (WhatsApp)
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-3 space-y-2">
                      {fb.subject && (
                        <h4 className="font-extrabold text-sm text-purple-950">
                          {fb.subject}
                        </h4>
                      )}
                      <p className="text-xs text-slate-800 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed italic">
                        "{fb.message}"
                      </p>

                      {/* Existing Admin Reply */}
                      {fb.adminReply && (
                        <div className="mt-3 bg-purple-50 p-3.5 rounded-xl border border-purple-200 text-xs text-purple-950 space-y-1">
                          <div className="font-extrabold flex items-center gap-1 text-purple-900">
                            <ShieldCheck className="w-4 h-4 text-purple-700" />
                            <span>Igisubizo cya Admin (Admin Reply):</span>
                          </div>
                          <p className="text-slate-800 leading-relaxed">{fb.adminReply}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reply Input or Actions Bar */}
                  {replyingId === fb.id ? (
                    <div className="mt-3 bg-slate-900 text-white p-4 rounded-xl space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                        <span className="flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4 text-amber-400" />
                          <span>Andika Igisubizo kuri {fb.userName}:</span>
                        </span>
                        <button
                          onClick={() => setReplyingId(null)}
                          className="text-slate-400 hover:text-white text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                      <textarea
                        value={replyInputMap[fb.id] || ''}
                        onChange={(e) => setReplyInputMap({ ...replyInputMap, [fb.id]: e.target.value })}
                        rows={2}
                        placeholder="Andika igisubizo hano..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            const reply = replyInputMap[fb.id];
                            if (reply) {
                              handleUpdateFeedback(fb.id, undefined, 'resolved', reply);
                            }
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-amber-400 to-lime-400 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1.5 hover:scale-105 transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Ohereza Igisubizo & Mark Resolved</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2">
                        {fb.status !== 'reviewed' && (
                          <button
                            onClick={() => handleUpdateFeedback(fb.id, undefined, 'reviewed')}
                            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs rounded-lg border border-purple-200 transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-600" />
                            <span>Mark Reviewed</span>
                          </button>
                        )}

                        {fb.status !== 'resolved' && (
                          <button
                            onClick={() => handleUpdateFeedback(fb.id, undefined, 'resolved')}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Mark Resolved</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setReplyingId(fb.id);
                            if (!replyInputMap[fb.id] && fb.adminReply) {
                              setReplyInputMap({ ...replyInputMap, [fb.id]: fb.adminReply });
                            }
                          }}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-lg border border-amber-200 transition-colors flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>{fb.adminReply ? 'Hindura Igisubizo (Edit Reply)' : 'Subiza (Reply)'}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm('Urimo gusiba iki gitekerezo. Urabyemeza?')) {
                            handleUpdateFeedback(fb.id, 'delete');
                          }
                        }}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg border border-rose-200 transition-colors flex items-center gap-1 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Siba (Delete)</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'seo' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Diagnostic Info Banner */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-5 border border-emerald-800 shadow-md">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-xl shrink-0">
                <Globe className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-base font-bold">SEO & Google Search Console Indexing Diagnostics</h3>
                <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                  The website <strong>nkorera.education</strong> has been optimized with standard search engine tags (Metadata, Sitemap, Robots.txt, and JSON-LD Structured Data) to enable Google's search crawlers to scan and index our pages. Use this diagnostic panel to verify the availability of crawl assets or manually trigger indexing in Google Search Console.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={runSeoDiagnostics}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm font-sans"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Run Live Check Now</span>
                  </button>
                  <a
                    href="https://search.google.com/search-console?resource_id=sc-domain:nkorera.education"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-50 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm font-sans"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Open Google Search Console (GSC)</span>
                  </a>
                  <a
                    href="https://www.google.com/search?q=site:nkorera.education"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-slate-950/40 text-emerald-300 hover:bg-slate-950/60 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all border border-emerald-700/50 font-sans"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Verify Live Index on Google (site:query)</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Grid check */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Box: Live File System Accessibility */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">1. Search Engine Crawler Files</h4>
                <p className="text-slate-500 text-[11px] mt-0.5">Standard robots.txt and sitemap.xml are configured to guide Google crawlers through the platform.</p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-slate-800">Robots.txt Location</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">https://nkorera.education/robots.txt</p>
                  </div>
                  {seoRobotsStatus === 'checking' ? (
                    <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-[9px] font-bold">Checking...</span>
                  ) : seoRobotsStatus === 'found' ? (
                    <span className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-[9px] font-black">200 OK - Found</span>
                  ) : (
                    <span className="px-2 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded text-[9px] font-black">404 - Missing</span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-slate-800">Sitemap.xml Location</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">https://nkorera.education/sitemap.xml</p>
                  </div>
                  {seoSitemapStatus === 'checking' ? (
                    <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-[9px] font-bold">Checking...</span>
                  ) : seoSitemapStatus === 'found' ? (
                    <span className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-[9px] font-black">200 OK - Found</span>
                  ) : (
                    <span className="px-2 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded text-[9px] font-black">404 - Missing</span>
                  )}
                </div>
              </div>

              {/* Robots.txt content preview */}
              {robotsContent && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Robots.txt Content Preview</span>
                  <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[10px] rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
                    {robotsContent}
                  </pre>
                </div>
              )}

              {/* Sitemap.xml content preview */}
              {sitemapContent && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Sitemap.xml Content Preview</span>
                  <pre className="p-3 bg-slate-950 text-cyan-400 font-mono text-[10px] rounded-xl overflow-x-auto leading-relaxed border border-slate-800 max-h-32 overflow-y-auto">
                    {sitemapContent}
                  </pre>
                </div>
              )}
            </div>

            {/* Right Box: Critical Pages Accessibility */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">2. Critical Pages & Assets Ping Checker</h4>
                <p className="text-slate-500 text-[11px] mt-0.5">Ensure the following files are online and readable so Google's crawlers can run unobstructed.</p>
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {urlChecks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Please run the diagnostics check to inspect live urls.</p>
                ) : (
                  urlChecks.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors text-xs">
                      <div className="min-w-0 pr-3">
                        <span className="font-extrabold text-slate-800 block truncate">{item.label}</span>
                        <a href={item.url} target="_blank" rel="noreferrer" className="text-[9px] text-purple-600 hover:underline truncate block">
                          {item.url}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 font-sans">
                        {item.status === 'checking' ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 animate-pulse"></span>
                        ) : item.status === 'online' ? (
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-[10px] font-extrabold text-emerald-600">Online ({item.code})</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            <span className="text-[10px] font-extrabold text-rose-600">Failed</span>
                          </div>
                        )}
                        <a
                          href={`https://search.google.com/search-console/inspect?resource_id=sc-domain:nkorera.education&url=${encodeURIComponent(item.url)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title="Inspect URL on Google Search Console"
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Bottom box: Live Meta tag Audit */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">3. Live HTML Head Metadata Tag Audit</h4>
              <p className="text-slate-500 text-[11px] mt-0.5">Inspect key head elements scanned by browsers or Googlebot during an indexing run.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px]">
                    <th className="pb-2 w-1/4">Metadata Tag / Property</th>
                    <th className="pb-2 w-1/2">Current Value</th>
                    <th className="pb-2 w-1/4 text-right">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {htmlMetaTags.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-400 italic">Please run the diagnostics check to audit head metadata elements.</td>
                    </tr>
                  ) : (
                    htmlMetaTags.map((tag, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-mono text-[10px] text-purple-800">{tag.nameOrProperty}</td>
                        <td className="py-3 pr-4">
                          <p className="text-slate-700 max-w-xl truncate text-[11px]" title={tag.value}>
                            {tag.value || <span className="text-rose-500 font-semibold italic">Missing / Empty</span>}
                          </p>
                        </td>
                        <td className="py-3 text-right">
                          {tag.exists ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 font-extrabold rounded border border-emerald-100 text-[9px]">
                              <Check className="w-2.5 h-2.5" /> Configured
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 font-bold rounded border border-amber-100 text-[9px]">
                              ⚠️ Warning / Missing
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick GSC URL Inspector Guide Card */}
          <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-black text-xs">1</span>
              <h5 className="font-bold text-xs text-white">Manual Request on GSC</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Click the <Zap className="inline w-3 h-3 text-amber-400" /> icon to open the Google Search Console URL Inspector for each of the checked paths.
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-black text-xs">2</span>
              <h5 className="font-bold text-xs text-white">Test Live URL</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Click <strong>"Test Live URL"</strong> inside Search Console to verify Google can fetch and render your page without errors.
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-black text-xs">3</span>
              <h5 className="font-bold text-xs text-white">Request Indexing</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Click <strong>"Request Indexing"</strong>. This schedules a priority visit from Googlebots to index your page in minutes rather than weeks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Lesson Plan Log Detail Modal */}
      {selectedLogModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden relative">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-sm">Details y'Isomo Lyakoreshejwe / Plan Log</span>
              </div>
              <button
                onClick={() => setSelectedLogModal(null)}
                className="text-purple-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs text-slate-800">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Uwarimu / Educator:</span>
                  <p className="font-black text-slate-900 text-sm">{selectedLogModal.userName}</p>
                  <p className="text-slate-500">{selectedLogModal.userEmail}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Ishuri & Itariki:</span>
                  <p className="font-bold text-slate-800">{selectedLogModal.schoolName || 'Standard School'}</p>
                  <p className="text-slate-500">{new Date(selectedLogModal.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-100 text-purple-900 font-extrabold px-2.5 py-1 rounded-lg">
                    {selectedLogModal.subject}
                  </span>
                  <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-lg">
                    {selectedLogModal.classGrade}
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg">
                    🌐 {selectedLogModal.language}
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Unit Title:</label>
                  <p className="font-bold text-slate-800">{selectedLogModal.unitTitle}</p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Title of Lesson:</label>
                  <p className="font-black text-slate-900 text-sm bg-purple-50 p-3 rounded-xl border border-purple-100">
                    {selectedLogModal.lessonTitle}
                  </p>
                </div>

                {selectedLogModal.instructionalObjective && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Instructional Objective (Intego y'Isomo):</label>
                    <p className="bg-emerald-50 text-emerald-950 p-3 rounded-xl border border-emerald-200 font-medium leading-relaxed italic">
                      "{selectedLogModal.instructionalObjective}"
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedLogModal(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs"
                >
                  Funga (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

