import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Users, 
  Search, 
  Shield, 
  Award, 
  Edit, 
  RefreshCw, 
  BookOpen, 
  UserPlus,
  Trash2,
  History,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  CreditCard,
  Sparkles,
  AlertTriangle,
  Radio,
  DollarSign,
  Receipt,
  Calendar,
  Clock,
  Image as ImageIcon,
  Download,
  ZoomIn,
  Zap,
  Copy,
  Check,
  Smartphone,
  Lock,
  Bell
} from 'lucide-react';
import { UserProfile, PaymentNotification } from '../types';
import { getAllTeachers, saveTeachers, adminTopUpTeacherQuota } from '../utils/auth';
import { ALL_AVAILABLE_PLANS_CATEGORIZED, syncAllCategorySubscriptionsForUser } from '../utils/subscription';
import { collection, query, orderBy, limit, getDocs, onSnapshot, db, syncUserProfileToFirestore, savePaymentToFirestore, loadPaymentHistoryFromFirestore } from '../utils/firebase';
import { AiBillingRecord } from '../types';
import { AdminCertificateManagementView } from './AdminCertificateManagementView';
import { AdminAutoSyncManagementView } from './AdminAutoSyncManagementView';
import { syncAllTeachersToCloud, fetchAllTeachersFromCloud } from '../utils/autoSync';
import { fetchNotificationsApi, playPaymentChimeSound } from '../utils/notifications';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminEmail: string;
}

interface SecurityLog {
  id: string;
  userId?: string;
  userEmail?: string;
  eventType?: string;
  details?: string;
  timestamp?: string;
  userAgent?: string;
}

interface PaymentReceiptModalData {
  id: string;
  teacherName?: string;
  teacherEmail?: string;
  phone?: string;
  planName?: string;
  plansPurchased?: number;
  amountFormatted?: string;
  date?: string;
  method?: string;
  ref?: string;
  expiryDate?: string;
  daysLeft?: number;
  receiptScreenshot?: string;
}

// SAFE UTILITIES TO PREVENT BLANK SCREEN CRASHES
const safeNormalizeTimestamp = (val: any): string => {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return new Date(val).toISOString();
  if (typeof val === 'object') {
    if (typeof val.toDate === 'function') {
      try { return val.toDate().toISOString(); } catch { return new Date().toISOString(); }
    }
    if (typeof val.seconds === 'number') {
      return new Date(val.seconds * 1000).toISOString();
    }
    if (val instanceof Date) {
      return isNaN(val.getTime()) ? new Date().toISOString() : val.toISOString();
    }
  }
  return new Date().toISOString();
};

const safeFormatDate = (val: any, fallback = 'Recently'): string => {
  if (!val) return fallback;
  try {
    const d = new Date(typeof val === 'object' && val.seconds ? val.seconds * 1000 : val);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return fallback;
  }
};

const safeFormatNumber = (val: any, fallback = 0): string => {
  const num = Number(val);
  if (isNaN(num)) return fallback.toLocaleString();
  return num.toLocaleString();
};

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  adminEmail
}) => {
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [activeTab, setActiveTab] = useState<'teachers' | 'payments' | 'certificates' | 'logs' | 'sync'>('teachers');
  const [filterCategory, setFilterCategory] = useState<'all' | 'paid' | 'free' | 'depleted' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [logsSearchQuery, setLogsSearchQuery] = useState('');
  const [logsStartDate, setLogsStartDate] = useState('');
  const [logsEndDate, setLogsEndDate] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState<'all' | 'security' | 'session'>('all');
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<UserProfile | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [topUpSuccessMsg, setTopUpSuccessMsg] = useState<string | null>(null);
  const [liveAuthAlert, setLiveAuthAlert] = useState<{
    type: string;
    name: string;
    email: string;
    time: string;
  } | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Payments & Billing States
  const [paymentHistory, setPaymentHistory] = useState<AiBillingRecord[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceiptModalData | null>(null);
  const [previewScreenshotModal, setPreviewScreenshotModal] = useState<{
    url: string;
    teacherName?: string;
    teacherEmail?: string;
    phone?: string;
    planName?: string;
    amountFormatted?: string;
    date?: string;
    ref?: string;
    method?: string;
  } | null>(null);
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'other'>('all');

  // MoMo Webhook Management & Simulator States
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);
  const [webhookSimResult, setWebhookSimResult] = useState<string | null>(null);
  const [adminNotifications, setAdminNotifications] = useState<PaymentNotification[]>([]);

  const loadAdminNotifications = async () => {
    try {
      const data = await fetchNotificationsApi(adminEmail, undefined, 'admin');
      setAdminNotifications(data.notifications || []);
    } catch (e) {}
  };

  useEffect(() => {
    if (isOpen) {
      loadAdminNotifications();
    }
  }, [isOpen, adminEmail]);

  const handleCopyWebhookUrl = () => {
    const url = `${window.location.origin}/api/payments/momo-webhook`;
    navigator.clipboard.writeText(url);
    setCopiedWebhookUrl(true);
    setTimeout(() => setCopiedWebhookUrl(false), 2500);
  };

  const handleSimulateWebhook = async (customPhone?: string, customEmail?: string, customName?: string, customAmount: number = 5000) => {
    setIsSimulatingWebhook(true);
    setWebhookSimResult(null);
    try {
      const targetPhone = (customPhone || '0786332660').trim();
      const targetEmail = (customEmail || 'nsanzimanafrancois91@gmail.com').toLowerCase().trim();
      const targetName = customName || 'NSANZIMANA Francois';
      const plansCount = customAmount >= 5000 ? 60 : 30;
      const months = customAmount >= 5000 ? 2 : 1;

      const payload = {
        event: 'charge.completed',
        data: {
          status: 'successful',
          amount: customAmount,
          currency: 'RWF',
          tx_ref: `MOMO-SIM-${Date.now()}`,
          customer: {
            phone_number: targetPhone,
            email: targetEmail,
            name: targetName
          }
        },
        plansCount,
        months,
        planId: customAmount >= 5000 ? 'plan_60_2months' : 'plan_30',
        planName: customAmount >= 5000 ? '60 CBC Lesson Plans (2 Months Premium VIP)' : '30 CBC Lesson Plans Package'
      };

      const res = await fetch('/api/payments/momo-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        playPaymentChimeSound();
        setWebhookSimResult(`✅ Webhook yakiriwe muri 0.1s! ${data.details.name || targetName} (${data.details.phone}) yabaye Premium (Wahawe Plans ${data.details.plansGranted} z'amezi ${data.details.validityMonths})!`);
        // Refresh records & notifications
        fetchPaymentRecords();
        loadAdminNotifications();
        try {
          const updated = getAllTeachers();
          if (Array.isArray(updated)) setTeachers(updated);
        } catch (e) {}
      } else {
        setWebhookSimResult(`⚠️ Webhook error: ${data.message || 'Ntibyagenze neza'}`);
      }
    } catch (e: any) {
      setWebhookSimResult(`❌ Error connecting to webhook: ${e.message}`);
    } finally {
      setIsSimulatingWebhook(false);
    }
  };

  // New Teacher Form States
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPlan, setNewPlan] = useState('plan_30');
  const [newQuota, setNewQuota] = useState(30);
  const [newPaymentStatus, setNewPaymentStatus] = useState<'PAID' | 'UNPAID'>('PAID');

  // Edit Teacher Form States
  const [editPlan, setEditPlan] = useState('free_3');
  const [editQuota, setEditQuota] = useState(3);
  const [editUsedCount, setEditUsedCount] = useState(0);
  const [editPaymentStatus, setEditPaymentStatus] = useState<'PAID' | 'UNPAID'>('PAID');

  // Plan select helpers
  const handlePlanChangeSelect = (planId: string) => {
    setNewPlan(planId);
    const allFlat = ALL_AVAILABLE_PLANS_CATEGORIZED.flatMap(g => g.plans);
    const matched = allFlat.find(p => p.id === planId);
    if (matched) {
      setNewQuota(matched.quota);
    }
  };

  const handleEditPlanChangeSelect = (planId: string) => {
    setEditPlan(planId);
    const allFlat = ALL_AVAILABLE_PLANS_CATEGORIZED.flatMap(g => g.plans);
    const matched = allFlat.find(p => p.id === planId);
    if (matched) {
      setEditQuota(matched.quota);
    }
  };

  const fetchPaymentRecords = async () => {
    setIsLoadingPayments(true);
    try {
      const records = await loadPaymentHistoryFromFirestore(adminEmail);
      if (Array.isArray(records) && records.length > 0) {
        setPaymentHistory(records);
      }
    } catch (err) {
      console.warn("Failed to fetch payment records:", err);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    setRenderError(null);
    setIsAddingTeacher(false);
    setEditingTeacher(null);

    // 1. Initial fast local render
    try {
      const list = getAllTeachers();
      setTeachers(Array.isArray(list) ? list : []);
    } catch (err) {}

    // Load initial payment history
    fetchPaymentRecords();

    const handlePaymentEvent = (e: any) => {
      if (e?.detail) {
        setPaymentHistory(prev => {
          const exists = prev.some(p => p.id === e.detail.id);
          if (exists) return prev.map(p => p.id === e.detail.id ? e.detail : p);
          return [e.detail, ...prev];
        });
      }
    };
    const handlePlanConsumed = (e: any) => {
      if (e?.detail?.email) {
        const targetEmail = e.detail.email.toLowerCase().trim();
        const newRemaining = e.detail.remainingPlans;
        const newUsed = e.detail.usedPlans;
        setTeachers(prev => (prev || []).map(t => {
          if (t && t.email && t.email.toLowerCase().trim() === targetEmail) {
            return {
              ...t,
              remainingPlans: newRemaining,
              totalGenerated: newUsed,
              stats: {
                lessonPlansCount: newUsed,
                nurseryPlansCount: t.stats?.nurseryPlansCount ?? 0,
                examsCount: t.stats?.examsCount ?? 0,
                worksheetsCount: t.stats?.worksheetsCount ?? 0,
                diaryEntriesCount: t.stats?.diaryEntriesCount ?? 0,
                certificatesCount: t.stats?.certificatesCount ?? 0,
                totalItems: newUsed
              },
              status: newRemaining > 0 ? 'ACTIVE' : 'DEPLETED'
            } as UserProfile;
          }
          return t;
        }));
        setPaymentHistory(prev => (prev || []).map(p => {
          if ((p.userEmail && p.userEmail.toLowerCase().trim() === targetEmail) ||
              (p.teacherEmail && p.teacherEmail.toLowerCase().trim() === targetEmail)) {
            return {
              ...p,
              usedPlans: newUsed,
              remainingPlans: newRemaining
            };
          }
          return p;
        }));
      }
    };
    window.addEventListener('nkorera_payment_recorded', handlePaymentEvent);
    window.addEventListener('nkorera_plan_consumed', handlePlanConsumed);

    let unsubTeachers: (() => void) | null = null;
    let unsubLogs: (() => void) | null = null;
    let unsubPayments: (() => void) | null = null;
    let liveAlertTimer: NodeJS.Timeout;

    // Helper to process any live auth event immediately (0s delay)
    const handleIncomingLiveAuth = (payload: any) => {
      if (!payload || !payload.eventType) return;
      const { eventType, user, details, timestamp } = payload;
      const email = (user?.email || payload.userEmail || '').toLowerCase().trim();
      const name = user?.name || payload.userName || (email.includes('@') ? email.split('@')[0] : email) || 'Teacher';
      const eventTime = timestamp || new Date().toISOString();

      // 1. Show glowing live alert at the top of Admin Panel
      setLiveAuthAlert({
        type: eventType,
        name,
        email,
        time: eventTime
      });

      clearTimeout(liveAlertTimer);
      liveAlertTimer = setTimeout(() => {
        setLiveAuthAlert(null);
      }, 7000);

      // 2. Prepend / update teacher in Admin teachers state instantly
      if (email) {
        setTeachers(prev => {
          const list = [...(prev || [])];
          const idx = list.findIndex(t => t.email.toLowerCase().trim() === email);
          if (idx !== -1) {
            const updated: UserProfile = {
              ...list[idx],
              ...(user || {}),
              email,
              name: name || list[idx].name,
              lastLoginAt: eventTime,
              isOnline: eventType !== 'LOGOUT_SUCCESS',
              loginCount: (list[idx].loginCount || 0) + (eventType === 'LOGIN_SUCCESS' ? 1 : 0)
            };
            list.splice(idx, 1);
            list.unshift(updated);
          } else if (user) {
            list.unshift({
              ...user,
              email,
              name: name || user.name || 'Teacher',
              lastLoginAt: eventTime,
              isOnline: true,
              loginCount: 1
            });
          }
          try {
            localStorage.setItem('nkorera_teachers_list', JSON.stringify(list));
          } catch {}
          return list;
        });
      }

      // 3. Prepend security log instantly
      setSecurityLogs(prev => [
        {
          id: `live_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userEmail: email,
          userName: name,
          eventType,
          details: details || `Teacher ${name} ${eventType === 'REGISTRATION_SUCCESS' ? 'created an account' : 'logged in'}`,
          timestamp: eventTime
        },
        ...(prev || [])
      ]);
    };

    // Channel 1: Native BroadcastChannel (0ms in-browser cross-tab)
    let authChannel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        authChannel = new BroadcastChannel('nkorera_auth_broadcast');
        authChannel.onmessage = (e) => {
          handleIncomingLiveAuth(e.data);
        };
      } catch {}
    }

    // Channel 2: Local Window Custom Event
    const handleWindowAuth = (e: any) => {
      handleIncomingLiveAuth(e?.detail);
    };
    window.addEventListener('nkorera_teacher_auth_event', handleWindowAuth);

    // Channel 3: Server-Sent Events (SSE) Live Stream
    let sseSource: EventSource | null = null;
    try {
      sseSource = new EventSource('/api/admin/live-auth-stream');
      sseSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.type === 'AUTH_EVENT') {
            handleIncomingLiveAuth(payload);
          }
        } catch {}
      };
    } catch {}

    if (db) {
      try {
        // Channel 4: Real-time listener for user profiles in Firestore
        unsubTeachers = onSnapshot(collection(db, 'user_profiles'), (snapshot) => {
          const cloudMap = new Map<string, UserProfile>();
          snapshot.forEach(docSnap => {
            const data = docSnap.data() as UserProfile;
            if (data && data.email) {
              const cleanEmail = data.email.toLowerCase().trim();
              cloudMap.set(cleanEmail, {
                ...data,
                id: data.id || docSnap.id,
                email: cleanEmail
              });
            }
          });

          const cloudList = Array.from(cloudMap.values());
          if (cloudList.length > 0) {
            setTeachers(prev => {
              const mergedMap = new Map<string, UserProfile>();
              // Load baseline from getAllTeachers so all seeded users exist
              getAllTeachers().forEach(t => mergedMap.set(t.email.toLowerCase().trim(), t));
              (prev || []).forEach(p => mergedMap.set(p.email.toLowerCase().trim(), { ...(mergedMap.get(p.email.toLowerCase().trim()) || {}), ...p }));
              cloudList.forEach(c => {
                const existing = mergedMap.get(c.email.toLowerCase().trim()) || {};
                mergedMap.set(c.email.toLowerCase().trim(), { ...existing, ...c });
              });
              const merged = Array.from(mergedMap.values());
              try {
                localStorage.setItem('nkorera_teachers_list', JSON.stringify(merged));
              } catch(e) {}
              return merged;
            });
          }
        }, (err) => {
          console.warn("[AdminPanel] Live user_profiles sync warning:", err);
        });

        // Real-time listener for security & login logs
        setIsLoadingLogs(true);
        unsubLogs = onSnapshot(
          query(collection(db, 'security_logs'), orderBy('timestamp', 'desc'), limit(100)),
          (snapshot) => {
            const logs: SecurityLog[] = [];
            snapshot.forEach(docSnap => {
              const data = docSnap.data();
              if (data) {
                logs.push({ id: docSnap.id, ...data } as SecurityLog);
              }
            });
            setSecurityLogs(logs);
            setIsLoadingLogs(false);
          },
          (err) => {
            console.warn("[AdminPanel] Live security_logs sync warning:", err);
            setIsLoadingLogs(false);
          }
        );

        // Real-time listener for payment_history
        unsubPayments = onSnapshot(
          query(collection(db, 'payment_history'), orderBy('createdAt', 'desc'), limit(150)),
          (snapshot) => {
            const list: AiBillingRecord[] = [];
            snapshot.forEach(docSnap => {
              const data = docSnap.data();
              if (data) {
                list.push({ id: docSnap.id, ...data } as AiBillingRecord);
              }
            });
            // Merge with local payment history so records like Mukamabano Florence are always present
            const localRaw = localStorage.getItem('nkorera_ai_payment_history');
            let localList: AiBillingRecord[] = [];
            try {
              if (localRaw) localList = JSON.parse(localRaw);
            } catch(e) {}
            const mergedMap = new Map<string, AiBillingRecord>();
            localList.forEach(r => mergedMap.set(r.id || r.transactionRef, r));
            list.forEach(r => mergedMap.set(r.id || r.transactionRef, r));
            const merged = Array.from(mergedMap.values()).sort((a, b) => {
              const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return timeB - timeA;
            });
            setPaymentHistory(merged);
          },
          (err) => {
            console.warn("[AdminPanel] Live payment_history sync warning:", err);
          }
        );
      } catch (err) {
        console.warn("Error setting up real-time listeners:", err);
      }
    }

    return () => {
      if (unsubTeachers) unsubTeachers();
      if (unsubLogs) unsubLogs();
      if (unsubPayments) unsubPayments();
      if (authChannel) authChannel.close();
      if (sseSource) sseSource.close();
      window.removeEventListener('nkorera_teacher_auth_event', handleWindowAuth);
      window.removeEventListener('nkorera_payment_recorded', handlePaymentEvent);
      window.removeEventListener('nkorera_plan_consumed', handlePlanConsumed);
      clearTimeout(liveAlertTimer);
    };
  }, [isOpen]);

  const fetchSecurityLogs = async () => {
    setIsLoadingLogs(true);
    // Always pull the latest teachers when refreshing logs so session updates are seen
    try {
      const cloudList = await fetchAllTeachersFromCloud();
      if (cloudList && cloudList.length > 0) {
        setTeachers(cloudList);
      } else {
        const list = getAllTeachers();
        setTeachers(Array.isArray(list) ? list : []);
      }
    } catch(e) {}
    try {
      if (!db) {
        setSecurityLogs([]);
        return;
      }
      const q = query(
        collection(db, 'security_logs'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const logs: SecurityLog[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data) {
          logs.push({ id: doc.id, ...data } as SecurityLog);
        }
      });
      setSecurityLogs(logs);
    } catch (err) {
      console.error("Failed to fetch security logs:", err);
      setSecurityLogs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const combinedLogs = useMemo(() => {
    try {
      // 1. Convert teacher session logs to unified format
      const sessionLogs: any[] = [];
      (teachers || []).forEach(t => {
        if (t && t.sessionLogs && Array.isArray(t.sessionLogs)) {
          t.sessionLogs.forEach(log => {
            if (!log) return;
            const normTs = safeNormalizeTimestamp(log.timestamp);
            sessionLogs.push({
              id: `session_${t.id || 'id'}_${normTs}`,
              timestamp: normTs,
              eventType: log.action === 'LOGIN' ? 'SUCCESS_LOGIN' : 'SUCCESS_LOGOUT',
              userEmail: t.email || 'unknown@nkorera.rw',
              details: `User ${t.name || 'Teacher'} (${t.email || ''}) performed ${log.action} action.`,
              type: 'session'
            });
          });
        }
      });

      // 2. Combine and sort
      let allLogs = [
        ...(securityLogs || []).map(l => ({
          ...l,
          timestamp: safeNormalizeTimestamp(l?.timestamp),
          type: 'security'
        })),
        ...sessionLogs
      ];

      allLogs.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime() || 0;
        const timeB = new Date(b.timestamp).getTime() || 0;
        return timeB - timeA;
      });

      // 3. Apply Filters
      if (logTypeFilter !== 'all') {
        allLogs = allLogs.filter(l => l.type === logTypeFilter);
      }
      if (logsSearchQuery) {
        const q = logsSearchQuery.toLowerCase();
        allLogs = allLogs.filter(l => 
          (l.userEmail || '').toLowerCase().includes(q) || 
          (l.details || '').toLowerCase().includes(q) ||
          (l.eventType || '').toLowerCase().includes(q)
        );
      }
      if (logsStartDate) {
        const start = new Date(logsStartDate).getTime();
        if (!isNaN(start)) {
          allLogs = allLogs.filter(l => (new Date(l.timestamp).getTime() || 0) >= start);
        }
      }
      if (logsEndDate) {
        const end = new Date(logsEndDate).getTime() + 86400000; // Add 24h to include the entire end date
        if (!isNaN(end)) {
          allLogs = allLogs.filter(l => (new Date(l.timestamp).getTime() || 0) <= end);
        }
      }

      return allLogs;
    } catch (err) {
      console.warn('Error processing combinedLogs:', err);
      return [];
    }
  }, [securityLogs, teachers, logTypeFilter, logsSearchQuery, logsStartDate, logsEndDate]);

  const logsChartData = useMemo(() => {
    try {
      const grouped = new Map<string, { date: string, logins: number, logouts: number, security: number }>();
      
      // Process logs in chronological order for the chart (oldest to newest)
      const reversedLogs = [...combinedLogs].reverse();

      reversedLogs.forEach(log => {
        if (!log || !log.timestamp) return;
        const normTs = safeNormalizeTimestamp(log.timestamp);
        const dateStr = normTs.includes('T') ? normTs.split('T')[0] : normTs.substring(0, 10);
        if (!grouped.has(dateStr)) {
          grouped.set(dateStr, { date: dateStr, logins: 0, logouts: 0, security: 0 });
        }
        const entry = grouped.get(dateStr)!;
        if (log.eventType === 'SUCCESS_LOGIN') entry.logins++;
        else if (log.eventType === 'SUCCESS_LOGOUT') entry.logouts++;
        else entry.security++;
      });

      return Array.from(grouped.values());
    } catch (err) {
      console.warn('Error generating logsChartData:', err);
      return [];
    }
  }, [combinedLogs]);

  // --- CALCULATIONS FOR LESSON PLANS STATS ---
  const totalTeachers = (teachers || []).length;

  // 1. Paid Teachers & Lesson Plans generated by paid users
  const paidTeachersList = (teachers || []).filter(t => {
    if (!t) return false;
    const isOwner = t.email === 'nkundimana123theogene@gmail.com';
    return isOwner || (t.currentPlan !== 'free_3' && t.currentPlan !== 'no_subscription');
  });
  const paidTeachersCount = paidTeachersList.length;
  const paidPlansUsed = paidTeachersList.reduce((sum, t) => sum + (t?.stats?.lessonPlansCount || t?.totalGenerated || 0), 0);

  // 2. Free Users (logged in and active on 3 free plans)
  const freeTeachersList = (teachers || []).filter(t => {
    if (!t) return false;
    const isOwner = t.email === 'nkundimana123theogene@gmail.com';
    const isFreePlan = (t.currentPlan === 'free_3' || t.currentPlan === 'no_subscription' || !t.currentPlan);
    return !isOwner && isFreePlan && (t.remainingPlans !== undefined ? t.remainingPlans > 0 : true);
  });
  const freeTeachersCount = freeTeachersList.length;
  const freePlansUsed = freeTeachersList.reduce((sum, t) => sum + (t?.stats?.lessonPlansCount || t?.totalGenerated || 0), 0);

  // 3. Depleted Users (free plans or paid plans ran out, 0 remaining -> need to buy more)
  const depletedTeachersList = (teachers || []).filter(t => {
    if (!t) return false;
    const isOwner = t.email === 'nkundimana123theogene@gmail.com';
    return !isOwner && (t.remainingPlans || 0) <= 0;
  });
  const depletedTeachersCount = depletedTeachersList.length;

  // 4. Totals across all users
  const totalPlansUsed = (teachers || []).reduce((sum, t) => sum + (t?.stats?.lessonPlansCount || t?.totalGenerated || 0), 0);
  const totalPlansRemaining = (teachers || []).reduce((sum, t) => sum + (t?.remainingPlans || 0), 0);

  // Helper to compute expiration details for a teacher
  const getTeacherExpiry = (t: UserProfile, isPaid: boolean, isOwner: boolean) => {
    if (isOwner) {
      return { text: 'Unlimited VIP Access', daysLeft: 9999, isExpired: false };
    }
    if (!t) {
      return { text: 'No Active Plan', daysLeft: 0, isExpired: true };
    }
    
    // Check explicit expiration date
    const dateStr = t.expiresAt || t.subscriptionExpiresAt || t.nextRenewalDate;
    let exp: Date | null = null;
    
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) exp = d;
    }

    if (!exp && isPaid) {
      // If paid without explicit expiresAt, calculate from payment date or creation date
      const baseStr = t.lastPaymentDate || t.verifiedAt || t.createdAt;
      if (baseStr) {
        const base = new Date(baseStr);
        if (!isNaN(base.getTime())) {
          exp = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);
        }
      }
    }

    if (!exp) {
      return { text: isPaid ? 'Active (30 Days)' : 'Unpaid / Expired', daysLeft: isPaid ? 30 : 0, isExpired: !isPaid };
    }

    const now = Date.now();
    const diffMs = exp.getTime() - now;
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const isExpired = daysLeft <= 0;

    return {
      text: safeFormatDate(exp),
      daysLeft: Math.max(0, daysLeft),
      isExpired
    };
  };

  // Helper to compute payment details for a teacher
  const getTeacherPaymentDetails = (t: UserProfile, history: AiBillingRecord[], isOwner: boolean) => {
    if (isOwner) {
      return {
        amount: 0,
        formattedAmount: 'VIP Free',
        method: 'Owner Access',
        planName: 'VIP Unlimited',
        date: 'Permanent',
        status: 'PAID'
      };
    }
    if (!t) {
      return {
        amount: 0,
        formattedAmount: '0 RWF',
        method: 'None',
        planName: 'Unknown',
        date: 'N/A',
        status: 'UNPAID'
      };
    }

    // 1. Direct teacher profile info
    if (typeof t.lastPaymentAmount === 'number' && t.lastPaymentAmount > 0) {
      return {
        amount: t.lastPaymentAmount,
        formattedAmount: `${safeFormatNumber(t.lastPaymentAmount)} RWF`,
        method: t.phone ? `MoMo (${t.phone})` : 'MTN Mobile Money',
        planName: t.lastPaymentPlanName || '30 Lesson Plans Package',
        date: safeFormatDate(t.lastPaymentDate || t.verifiedAt, 'Recently'),
        status: 'PAID'
      };
    }

    // 2. Lookup in payment history by email
    const cleanEmail = (t.email || '').toLowerCase().trim();
    const match = (history || []).find(p => p && p.userEmail && p.userEmail.toLowerCase().trim() === cleanEmail);
    if (match) {
      const amt = Number(match.amountRwf ?? match.amount ?? 2200);
      return {
        amount: amt,
        formattedAmount: `${safeFormatNumber(amt)} RWF`,
        method: match.paymentMethod || 'MTN Mobile Money',
        planName: match.planName || 'Active Package',
        date: match.date || safeFormatDate(match.createdAt, 'Recently'),
        status: match.status === 'Paid' ? 'PAID' : 'PENDING'
      };
    }

    if (t.isPaid || t.verifiedPayment) {
      return {
        amount: 2200,
        formattedAmount: '2,200 RWF',
        method: 'MTN Mobile Money',
        planName: '30 Lesson Plans Package',
        date: safeFormatDate(t.verifiedAt, 'Active'),
        status: 'PAID'
      };
    }

    return {
      amount: 0,
      formattedAmount: '0 RWF',
      method: 'None',
      planName: 'Free Tier / Unpaid',
      date: 'N/A',
      status: 'UNPAID'
    };
  };

  // Helper to compute purchased plans count and name
  const getTeacherPlansInfo = (t: UserProfile, resolvedPlan: any, isOwner: boolean) => {
    if (isOwner) {
      return { purchased: 99999, name: 'VIP Unlimited Plans' };
    }
    if (!t) return { purchased: 0, name: '0 Lesson Plans' };
    const purchased = t.totalPlansPurchased || t.purchasedPlans || resolvedPlan?.quota || ((t.remainingPlans || 0) + (t.stats?.lessonPlansCount || t.totalGenerated || 0));
    const name = t.lastPaymentPlanName || resolvedPlan?.name || (t.currentPlan && t.currentPlan !== 'no_subscription' && t.currentPlan !== 'unpaid' ? `Plan ${t.currentPlan}` : `${purchased || 0} Lesson Plans`);
    return { purchased: Number(purchased) || 0, name };
  };

  // Revenue computations
  const totalRevenueCollected = useMemo(() => {
    try {
      let rev = 0;
      const recordedEmails = new Set<string>();
      
      (paymentHistory || []).forEach(p => {
        if (!p) return;
        const amt = Number(p.amountRwf ?? p.amount ?? 0);
        if (p.status === 'Paid' && amt > 0) {
          rev += amt;
          if (p.userEmail) recordedEmails.add(p.userEmail.toLowerCase().trim());
        }
      });

      (teachers || []).forEach(t => {
        if (t && t.email && t.email !== 'nkundimana123theogene@gmail.com') {
          const clean = t.email.toLowerCase().trim();
          if (!recordedEmails.has(clean)) {
            if (typeof t.lastPaymentAmount === 'number' && t.lastPaymentAmount > 0) {
              rev += t.lastPaymentAmount;
            } else if (t.isPaid || t.verifiedPayment) {
              rev += 2200;
            }
          }
        }
      });

      return rev;
    } catch {
      return 0;
    }
  }, [paymentHistory, teachers]);

  const totalPurchasedPlansCount = useMemo(() => {
    return (teachers || []).reduce((sum, t) => {
      if (!t || t.email === 'nkundimana123theogene@gmail.com') return sum;
      const purchased = t.totalPlansPurchased || t.purchasedPlans || (t.isPaid ? 30 : 0);
      return sum + purchased;
    }, 0);
  }, [teachers]);

  // Filtered payment records for the Billing tab
  const filteredPayments = useMemo(() => {
    return paymentHistory.filter(p => {
      const q = paymentSearch.toLowerCase().trim();
      const matchSearch = !q || 
        (p.userName && p.userName.toLowerCase().includes(q)) ||
        (p.userEmail && p.userEmail.toLowerCase().includes(q)) ||
        (p.phoneNumber && p.phoneNumber.toLowerCase().includes(q)) ||
        (p.transactionRef && p.transactionRef.toLowerCase().includes(q)) ||
        (p.planName && p.planName.toLowerCase().includes(q));

      const matchFilter = paymentFilter === 'all' || 
        (paymentFilter === 'paid' && p.status === 'Paid') ||
        (paymentFilter === 'other' && p.status !== 'Paid');

      return matchSearch && matchFilter;
    });
  }, [paymentHistory, paymentSearch, paymentFilter]);

  // Filter teachers list by search query AND category filter
  const filteredTeachers = (teachers || []).filter(t => {
    if (!t) return false;
    const nameStr = (t.name || '').toLowerCase();
    const emailStr = (t.email || '').toLowerCase();
    const phoneStr = (t.phone || '');
    const queryStr = (searchQuery || '').toLowerCase();
    const matchesQuery = nameStr.includes(queryStr) || emailStr.includes(queryStr) || phoneStr.includes(queryStr);

    if (!matchesQuery) return false;

    const isOwner = t.email === 'nkundimana123theogene@gmail.com';
    const isPaid = isOwner || ((t.isPaid || t.verifiedPayment) && t.status !== 'UNPAID');
    const isUnpaid = !isOwner && (t.status === 'UNPAID' || t.isPaid === false);
    const isFreeActive = !isOwner && !isUnpaid && (t.currentPlan === 'free_3' || t.currentPlan === 'no_subscription' || !t.currentPlan) && (t.remainingPlans || 0) > 0;
    const isDepleted = !isOwner && (t.remainingPlans || 0) <= 0;

    if (filterCategory === 'paid') return isPaid;
    if (filterCategory === 'free') return isFreeActive;
    if (filterCategory === 'depleted') return isDepleted;
    if (filterCategory === 'pending') return isUnpaid;

    return true;
  });

  const handleAddTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) {
      alert('Fill out all required fields!');
      return;
    }

    const emailLower = newEmail.trim().toLowerCase();
    if ((teachers || []).some(t => t?.email && t.email.toLowerCase() === emailLower)) {
      alert('A teacher with this email already exists!');
      return;
    }

    const now = new Date().toISOString();
    const isOwner = emailLower === 'nkundimana123theogene@gmail.com';
    const isPaid = isOwner || newPaymentStatus === 'PAID';
    const finalQuota = isOwner ? 99999 : (isPaid ? Math.max(1, newQuota) : 0);

    const newTeacher: UserProfile = {
      id: `user_${Date.now()}`,
      email: emailLower,
      name: newName.trim(),
      country: 'Rwanda',
      phone: newPhone.trim() || '0780000000',
      currentPlan: isPaid ? newPlan : 'unpaid',
      remainingPlans: finalQuota,
      isAdmin: isOwner,
      hasPremiumToolsSub: isPaid,
      isPaid: isPaid,
      verifiedPayment: isPaid,
      verifiedAt: isPaid ? now : undefined,
      createdAt: now,
      lastLoginAt: undefined,
      status: isPaid ? 'ACTIVE' : 'UNPAID',
      loginCount: 0,
      stats: {
        lessonPlansCount: 0,
        nurseryPlansCount: 0,
        examsCount: 0,
        worksheetsCount: 0,
        diaryEntriesCount: 0,
        certificatesCount: 0,
        totalItems: 0
      }
    };

    const updated = [...(teachers || []), newTeacher];
    setTeachers(updated);
    saveTeachers(updated);
    syncAllTeachersToCloud(updated).catch(() => {});
    syncUserProfileToFirestore(newTeacher).catch(() => {});

    // Save official payment invoice to Firestore if paid status selected
    if (isPaid) {
      const allFlat = ALL_AVAILABLE_PLANS_CATEGORIZED.flatMap(g => g.plans);
      const matchedPlan = allFlat.find(p => p.id === newPlan);
      const price = matchedPlan ? matchedPlan.price : 2200;
      savePaymentToFirestore({
        id: `bill_admin_add_${Date.now()}`,
        transactionRef: `INV-ADM-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        planId: newPlan,
        planName: matchedPlan ? matchedPlan.name : `${finalQuota} Monthly Plans`,
        amountRwf: price,
        credits: finalQuota,
        paymentMethod: 'Admin Approval',
        phoneNumber: newTeacher.phone || '0781339530',
        status: 'Paid',
        userEmail: newTeacher.email,
        createdAt: now
      }, newTeacher.email).catch(() => {});
    }

    // Update session if added user is currently logged in
    try {
      const rawCurrentUser = localStorage.getItem('nkorera_current_user');
      if (rawCurrentUser) {
        const cur = JSON.parse(rawCurrentUser);
        if (cur && cur.email.toLowerCase() === emailLower) {
          localStorage.setItem('nkorera_current_user', JSON.stringify(newTeacher));
          syncAllCategorySubscriptionsForUser(newTeacher);
          window.dispatchEvent(new CustomEvent('nkorera_user_updated', { detail: newTeacher }));
        }
      }
    } catch (e) {}

    // Reset Form
    setNewEmail('');
    setNewName('');
    setNewPhone('');
    setNewPlan('plan_30');
    setNewQuota(30);
    setNewPaymentStatus('PAID');
    setIsAddingTeacher(false);

    setTopUpSuccessMsg(
      isPaid 
        ? `✅ Teacher ${newTeacher.name} added as PAID! Allowed to create plans (${finalQuota} plans).`
        : `⚠️ Teacher ${newTeacher.name} added as UNPAID. Cannot create plans until payment is verified.`
    );
    setTimeout(() => setTopUpSuccessMsg(null), 5000);
  };

  const handleEditClick = (teacher: UserProfile) => {
    if (!teacher) return;
    setEditingTeacher(teacher);
    setEditPlan(teacher.currentPlan || 'free_3');
    setEditQuota(teacher.remainingPlans || 0);
    setEditUsedCount(teacher.stats?.lessonPlansCount || teacher.totalGenerated || 0);
    const isTeacherPaid = (teacher.isPaid || teacher.verifiedPayment) && teacher.status !== 'UNPAID';
    setEditPaymentStatus(isTeacherPaid ? 'PAID' : 'UNPAID');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    const now = new Date().toISOString();
    const isOwner = editingTeacher.email === 'nkundimana123theogene@gmail.com';
    const isPaid = isOwner || editPaymentStatus === 'PAID';
    const finalQuota = isOwner ? 99999 : (isPaid ? Math.max(1, editQuota) : 0);

    let modifiedTeacher: UserProfile | null = null;

    const updated = (teachers || []).map(t => {
      if (t && t.id === editingTeacher.id) {
        modifiedTeacher = {
          ...t,
          currentPlan: isPaid ? editPlan : 'unpaid',
          remainingPlans: finalQuota,
          isPaid: isPaid,
          verifiedPayment: isPaid,
          verifiedAt: isPaid ? (t.verifiedAt || now) : undefined,
          hasPremiumToolsSub: isPaid,
          stats: {
            ...(t.stats || {
              lessonPlansCount: 0,
              nurseryPlansCount: 0,
              examsCount: 0,
              worksheetsCount: 0,
              diaryEntriesCount: 0,
              certificatesCount: 0,
              totalItems: 0
            }),
            lessonPlansCount: editUsedCount,
            totalItems: Math.max(0, ((t.stats?.totalItems || 0) - (t.stats?.lessonPlansCount || 0)) + editUsedCount)
          },
          status: isPaid ? (finalQuota > 0 ? 'ACTIVE' : 'DEPLETED') : 'UNPAID'
        };
        return modifiedTeacher;
      }
      return t;
    });

    setTeachers(updated);
    saveTeachers(updated);
    syncAllTeachersToCloud(updated).catch(() => {});
    if (modifiedTeacher) {
      syncUserProfileToFirestore(modifiedTeacher).catch(() => {});
    }
    
    // Update current user session if editing logged-in teacher
    try {
      const rawCurrentUser = localStorage.getItem('nkorera_current_user');
      if (rawCurrentUser) {
        const cur = JSON.parse(rawCurrentUser);
        if (cur && (cur.id === editingTeacher.id || cur.email.toLowerCase() === editingTeacher.email.toLowerCase())) {
          const found = updated.find(u => u && (u.id === editingTeacher.id || u.email.toLowerCase() === editingTeacher.email.toLowerCase()));
          if (found) {
            localStorage.setItem('nkorera_current_user', JSON.stringify(found));
            syncAllCategorySubscriptionsForUser(found);
            window.dispatchEvent(new CustomEvent('nkorera_user_updated', { detail: found }));
          }
        }
      }
    } catch (e) {
      console.error('Error updating current user local storage:', e);
    }

    setEditingTeacher(null);
    setTopUpSuccessMsg(
      isPaid
        ? `✅ Updated: Teacher marked as PAID (${finalQuota} plans).`
        : `🛑 Updated: Teacher marked as UNPAID (Cannot create plans).`
    );
    setTimeout(() => setTopUpSuccessMsg(null), 5000);
  };

  const handleDeleteTeacher = (teacherId: string, teacherName: string) => {
    if (teacherId === 'user_1' || teacherName === 'NKUNDIMANA Theogene') {
      alert('Cannot delete the primary owner/admin account!');
      return;
    }
    if (window.confirm(`Are you sure you want to remove teacher "${teacherName}" from the Nkorera Portal?`)) {
      const updated = (teachers || []).filter(t => t && t.id !== teacherId);
      setTeachers(updated);
      saveTeachers(updated);
      syncAllTeachersToCloud(updated).catch(() => {});
    }
  };

  const handleResetDatabase = () => {
    if (window.confirm('Do you want to reset the portal teacher database and restore pre-seeded records?')) {
      localStorage.removeItem('nkorera_teachers_list');
      const resetList = getAllTeachers();
      setTeachers(resetList);
      syncAllTeachersToCloud(resetList).catch(() => {});
    }
  };

  const handleQuickTopUp = (teacher: UserProfile, additionalPlans: number) => {
    if (!teacher || !teacher.id) return;
    try {
      const updated = adminTopUpTeacherQuota(teacher.id, additionalPlans);
      setTeachers(updated);
      syncAllTeachersToCloud(updated).catch(() => {});
      setTopUpSuccessMsg(`✅ Successfully added +${additionalPlans} plans to ${teacher.name || 'teacher'}'s account!`);
      setTimeout(() => setTopUpSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to top up:', err);
    }
  };

  const handleApprovePaid = (teacher: UserProfile) => {
    if (!teacher || !teacher.id) return;
    try {
      const currentCount = teacher.remainingPlans || 0;
      const newQuota = currentCount > 0 ? currentCount + 30 : 30;
      const now = new Date();
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const usedPlans = teacher.stats?.lessonPlansCount || teacher.totalGenerated || 0;

      const updated = (teachers || []).map(t => {
        if (t && (t.id === teacher.id || (t.email && t.email.toLowerCase() === teacher.email.toLowerCase()))) {
          const prevPurchased = t.totalPlansPurchased || t.purchasedPlans || 0;
          return {
            ...t,
            isPaid: true,
            verifiedPayment: true,
            hasPremiumToolsSub: true,
            currentPlan: 'plan_30',
            remainingPlans: newQuota,
            totalPlansPurchased: prevPurchased > 0 ? prevPurchased + 30 : newQuota,
            purchasedPlans: prevPurchased > 0 ? prevPurchased + 30 : newQuota,
            lastPaymentAmount: 2200,
            lastPaymentDate: now.toISOString(),
            lastPaymentPlanName: '30 Lesson Plans Package (Approved Paid)',
            expiresAt: expires.toISOString(),
            subscriptionExpiresAt: expires.toISOString(),
            status: 'ACTIVE' as const,
            verifiedAt: now.toISOString()
          };
        }
        return t;
      });

      setTeachers(updated);
      saveTeachers(updated);
      syncAllTeachersToCloud(updated).catch(() => {});

      const targetTeacher = updated.find(t => t && t.id === teacher.id) || teacher;
      syncUserProfileToFirestore(targetTeacher).catch(() => {});

      if (teacher.email) {
        const approvedRecord: AiBillingRecord = {
          id: `pay_app_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
          transactionRef: `INV-APPROVED-${Math.floor(100000 + Math.random() * 900000)}`,
          date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          planId: 'plan_30',
          planName: '30 Lesson Plans (Approved Paid)',
          amountRwf: 2200,
          credits: 30,
          paymentMethod: 'MTN Mobile Money',
          phoneNumber: teacher.phone || '0781339530',
          status: 'Paid',
          userEmail: teacher.email,
          userName: teacher.name || 'Teacher',
          createdAt: now.toISOString(),
          expiresAt: expires.toISOString(),
          usedPlans: usedPlans,
          remainingPlans: newQuota
        };
        savePaymentToFirestore(approvedRecord, teacher.email).catch(() => {});
        setPaymentHistory(prev => [approvedRecord, ...prev.filter(p => p.id !== approvedRecord.id)]);
      }

      try {
        const rawCurrentUser = localStorage.getItem('nkorera_current_user');
        if (rawCurrentUser) {
          const cur = JSON.parse(rawCurrentUser);
          if (cur && (cur.id === teacher.id || (cur.email && cur.email.toLowerCase() === teacher.email.toLowerCase()))) {
            const updatedCur = {
              ...cur,
              isPaid: true,
              verifiedPayment: true,
              hasPremiumToolsSub: true,
              currentPlan: 'plan_30',
              remainingPlans: newQuota,
              totalPlansPurchased: (cur.totalPlansPurchased || 0) + 30,
              purchasedPlans: (cur.purchasedPlans || 0) + 30,
              lastPaymentAmount: 2200,
              lastPaymentDate: now.toISOString(),
              lastPaymentPlanName: '30 Lesson Plans Package (Approved Paid)',
              expiresAt: expires.toISOString(),
              subscriptionExpiresAt: expires.toISOString(),
              status: 'ACTIVE'
            };
            localStorage.setItem('nkorera_current_user', JSON.stringify(updatedCur));

            const activeSub = {
              planId: 'plan_30',
              planName: '30 Lesson Plans Package (Approved Paid)',
              totalPlansAllowed: newQuota + (cur.stats?.lessonPlansCount || 0),
              usedPlansCount: cur.stats?.lessonPlansCount || 0,
              activatedAt: now.toISOString(),
              expiresAt: expires.toISOString(),
              status: 'ACTIVE' as const
            };
            localStorage.setItem('nkorera_subscription_status', JSON.stringify(activeSub));
            syncAllCategorySubscriptionsForUser(updatedCur);

            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('nkorera_user_updated', { detail: updatedCur }));
            }
          }
        }
      } catch (e) {}

      setTopUpSuccessMsg(`✅ Approved payment for teacher ${teacher.name || teacher.email}! Account is now PAID & UNLOCKED.`);
      setTimeout(() => setTopUpSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Failed to approve paid status:', err);
    }
  };

  const handleSetUnpaid = (teacher: UserProfile) => {
    if (!teacher || !teacher.id) return;
    if (teacher.email === 'nkundimana123theogene@gmail.com') {
      alert('You cannot set the Super Admin / Owner to Unpaid!');
      return;
    }
    try {
      const updated = (teachers || []).map(t => {
        if (t && (t.id === teacher.id || (t.email && t.email.toLowerCase() === teacher.email.toLowerCase()))) {
          return {
            ...t,
            isPaid: false,
            verifiedPayment: false,
            hasPremiumToolsSub: false,
            remainingPlans: 0,
            status: 'UNPAID' as const
          };
        }
        return t;
      });

      setTeachers(updated);
      saveTeachers(updated);
      syncAllTeachersToCloud(updated).catch(() => {});

      const targetTeacher = updated.find(t => t && t.id === teacher.id) || teacher;
      syncUserProfileToFirestore({
        ...targetTeacher,
        isPaid: false,
        verifiedPayment: false,
        hasPremiumToolsSub: false,
        remainingPlans: 0,
        status: 'UNPAID'
      }).catch(() => {});

      try {
        const rawCurrentUser = localStorage.getItem('nkorera_current_user');
        if (rawCurrentUser) {
          const cur = JSON.parse(rawCurrentUser);
          if (cur && (cur.id === teacher.id || (cur.email && cur.email.toLowerCase() === teacher.email.toLowerCase()))) {
            const updatedCur = {
              ...cur,
              isPaid: false,
              verifiedPayment: false,
              hasPremiumToolsSub: false,
              remainingPlans: 0,
              status: 'UNPAID'
            };
            localStorage.setItem('nkorera_current_user', JSON.stringify(updatedCur));
            syncAllCategorySubscriptionsForUser(updatedCur);

            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('nkorera_user_updated', { detail: updatedCur }));
            }
          }
        }
      } catch (e) {}

      setTopUpSuccessMsg(`🛑 Teacher ${teacher.name || teacher.email} set to UNPAID! Not permitted to create plans.`);
      setTimeout(() => setTopUpSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Failed to set unpaid status:', err);
    }
  };

  if (!isOpen) return null;

  if (renderError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
        <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl p-6 max-w-lg w-full text-center space-y-4 shadow-2xl text-white">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black uppercase text-rose-400">Admin Dashboard Error Recovered</h3>
          <p className="text-xs text-slate-300">{renderError}</p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                localStorage.removeItem('nkorera_teachers_list');
                setTeachers(getAllTeachers());
                setRenderError(null);
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs cursor-pointer"
            >
              Reset Teachers Cache
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/95 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl w-full max-w-7xl overflow-hidden shadow-2xl text-white flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-4 sm:p-5 border-b border-emerald-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2.5 rounded-2xl border border-emerald-500/40 text-emerald-400">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-wide uppercase">
                  Nkorera Owner Dashboard & Admin Panel
                </h3>
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Owner Access
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Logged in as Portal Creator: <span className="text-amber-300 font-bold">{adminEmail || 'nkundimana123theogene@gmail.com'}</span> (Nkundimana Theogene)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOP-UP SUCCESS NOTIFICATION */}
        {topUpSuccessMsg && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-4 py-2 text-center text-xs font-bold text-emerald-300 animate-pulse flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{topUpSuccessMsg}</span>
          </div>
        )}

        {/* REAL-TIME LIVE LOGIN / REGISTRATION TOAST BANNER (0s LATENCY) */}
        {liveAuthAlert && (
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 py-2.5 text-xs font-black shadow-lg animate-in slide-in-from-top duration-300 flex items-center justify-between gap-3 border-b-2 border-emerald-300">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <span>
                ⚡ <strong>LIVE UPDATE (Real-time):</strong> {liveAuthAlert.type === 'REGISTRATION_SUCCESS' ? 'New Teacher Registered' : 'Teacher Logged In'}: <span className="underline decoration-white font-black">{liveAuthAlert.name}</span> ({liveAuthAlert.email}) &bull; {new Date(liveAuthAlert.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <button 
              onClick={() => setLiveAuthAlert(null)}
              className="p-1 hover:bg-black/20 rounded-lg text-white/80 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          
          {/* TAB SWITCHER */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('teachers')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'teachers' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Teachers & Quotas</span>
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'payments' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Payments & Billing</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded-full font-extrabold uppercase">
                {totalRevenueCollected.toLocaleString()} RWF
              </span>
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'certificates' 
                  ? 'bg-amber-500/10 text-amber-300 border-b-2 border-amber-500 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Certificates & Payment Lock</span>
              <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded-full font-extrabold uppercase">
                Admin Control
              </span>
            </button>
            <button
              onClick={() => setActiveTab('sync')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'sync' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Auto Sync Data</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded-full font-extrabold uppercase">
                Live Cloud
              </span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'logs' 
                  ? 'bg-teal-500/10 text-teal-400 border-b-2 border-teal-500' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Security Logs</span>
            </button>
          </div>

          {activeTab === 'sync' ? (
            <AdminAutoSyncManagementView adminEmail={adminEmail} />
          ) : activeTab === 'certificates' ? (
            <AdminCertificateManagementView adminEmail={adminEmail} />
          ) : activeTab === 'payments' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* PAYMENTS STATS OVERVIEW */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {/* CARD 1: TOTAL REVENUE */}
                <div className="p-3.5 rounded-2xl border bg-emerald-950/60 border-emerald-500/50 shadow-lg shadow-emerald-950/40 space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400">Total Revenue</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white">{totalRevenueCollected.toLocaleString()} <span className="text-xs font-bold text-emerald-400">RWF</span></div>
                  <p className="text-[9px] text-slate-400 font-medium">{paidTeachersCount} Verified Paid Accounts</p>
                </div>

                {/* CARD 2: PAID TEACHERS */}
                <div className="p-3.5 rounded-2xl border bg-slate-950/80 border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] uppercase font-black tracking-wider text-teal-400">Paid Teachers</span>
                    <Users className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white">{paidTeachersCount}</div>
                  <p className="text-[9px] text-slate-400 font-medium">Authorized to generate lesson plans</p>
                </div>

                {/* CARD 3: TOTAL PLANS PURCHASED */}
                <div className="p-3.5 rounded-2xl border bg-slate-950/80 border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] uppercase font-black tracking-wider text-cyan-400">Plans Purchased</span>
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white">{totalPurchasedPlansCount}</div>
                  <p className="text-[9px] text-slate-400 font-medium">Across all packages</p>
                </div>

                {/* CARD 4: PLANS USED */}
                <div className="p-3.5 rounded-2xl border bg-slate-950/80 border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-400">Plans Created</span>
                    <BookOpen className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white">{totalPlansUsed}</div>
                  <p className="text-[9px] text-slate-400 font-medium">Lesson plans generated</p>
                </div>

                {/* CARD 5: PLANS REMAINING */}
                <div className="p-3.5 rounded-2xl border bg-slate-950/80 border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] uppercase font-black tracking-wider text-emerald-300">Remaining Quota</span>
                    <Award className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">{totalPlansRemaining}</div>
                  <p className="text-[9px] text-slate-400 font-medium">Available balance to use</p>
                </div>
              </div>

              {/* MOMO WEBHOOK & INSTANT PAYMENT PIPELINE CARD */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/50 p-4 sm:p-5 rounded-3xl shadow-xl space-y-4 text-left relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400">
                      <Zap className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                        <span>MoMo Webhook & Instant Payment Pipeline</span>
                        <span className="text-[9px] font-mono bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                          Live &bull; &lt; 0.1s
                        </span>
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        Paypack &bull; Flutterwave &bull; MTN Mobile Money &bull; Airtel Money (100% Automated Instant Activation)
                      </p>
                    </div>
                  </div>

                  {/* WEBHOOK URL WITH COPY BUTTON */}
                  <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                    <span className="text-[9.5px] font-mono text-emerald-300 px-2 select-all truncate max-w-[200px] sm:max-w-[280px]">
                      {typeof window !== 'undefined' ? `${window.location.origin}/api/payments/momo-webhook` : '/api/payments/momo-webhook'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyWebhookUrl}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all shrink-0"
                    >
                      {copiedWebhookUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-emerald-400" />}
                      <span>{copiedWebhookUrl ? 'Copied!' : 'Copy URL'}</span>
                    </button>
                  </div>
                </div>

                {/* THE 5-STEP ARCHITECTURE PIPELINE */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-left">
                  {/* Step 1 */}
                  <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center">1</span>
                      <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div className="text-[10.5px] font-bold text-white">Enter Phone</div>
                    <p className="text-[9.5px] text-slate-400 leading-tight">
                      Teacher enters phone number and clicks "Pay Now".
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-slate-950/80 border border-amber-500/40 p-2.5 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center animate-pulse">2</span>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-[10.5px] font-bold text-amber-300">USSD Prompt & PIN</div>
                    <p className="text-[9.5px] text-slate-300 leading-tight">
                      Phone receives prompt: "Pay 5,000 RWF..." & user enters PIN.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-black text-[10px] flex items-center justify-center">3</span>
                      <Radio className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="text-[10.5px] font-bold text-white">Network &rarr; Gateway</div>
                    <p className="text-[9.5px] text-slate-400 leading-tight">
                      MTN/Airtel confirms debit to Paypack or Flutterwave.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-slate-950/80 border border-emerald-500/40 p-2.5 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center">4</span>
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-[10.5px] font-bold text-emerald-300">Webhook Dispatch</div>
                    <p className="text-[9.5px] text-slate-400 leading-tight">
                      Gateway hits <code className="text-emerald-400 font-mono text-[9px]">/api/payments/momo-webhook</code>.
                    </p>
                  </div>

                  {/* Step 5 */}
                  <div className="bg-slate-950/80 border border-emerald-500/70 p-2.5 rounded-2xl space-y-1 bg-emerald-950/20">
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] flex items-center justify-center">5</span>
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-[10.5px] font-black text-emerald-300">Instant VIP Upgrade</div>
                    <p className="text-[9.5px] text-emerald-200/80 leading-tight">
                      Server upgrades account to Premium in &lt; 0.1s!
                    </p>
                  </div>
                </div>

                {/* TEST SIMULATION BUTTONS & FEEDBACK */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-slate-800/60">
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      disabled={isSimulatingWebhook}
                      onClick={() => handleSimulateWebhook('0786332660', 'nsanzimanafrancois91@gmail.com', 'NSANZIMANA Francois', 5000)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10.5px] flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSimulatingWebhook ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-current" />}
                      <span>🧪 Test Webhook (5,000 RWF &bull; NSANZIMANA Francois: 0786332660)</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSimulatingWebhook}
                      onClick={() => handleSimulateWebhook('0781339530', 'mwarimu.test@gmail.com', 'Mwarimu Test', 2200)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10.5px] flex items-center gap-1.5 border border-slate-700 cursor-pointer disabled:opacity-50"
                    >
                      <span>🧪 Test Custom (2,200 RWF &bull; 0781339530)</span>
                    </button>
                  </div>

                  {webhookSimResult && (
                    <div className="text-[10px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-3 py-1 rounded-xl animate-fade-in text-left">
                      {webhookSimResult}
                    </div>
                  )}
                </div>
              </div>

              {/* INCOMING MOMO PAYMENT ALERTS & NOTIFICATIONS FEED (FOR NKUNDIMANA THEOGENE) */}
              <div className="bg-slate-950/90 border-2 border-amber-500/50 p-4 rounded-3xl space-y-3 text-left shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400">
                      <Bell className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-2">
                        <span>Payment Notifications & SMS Alerts Feed (0781339530)</span>
                        <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                          SMS & Push Alerts
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Real-time notifications sent to NKUNDIMANA THEOGENE and buyers with instant plan unlocking status.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={loadAdminNotifications}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Refresh Alerts</span>
                  </button>
                </div>

                {/* NOTIFICATIONS LIST CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto custom-scrollbar">
                  {adminNotifications.length === 0 ? (
                    <div className="col-span-full py-6 text-center text-slate-500 text-xs font-bold">
                      No payment notifications received yet. Click "Test Webhook" above to simulate an incoming alert!
                    </div>
                  ) : (
                    adminNotifications.slice(0, 6).map((notif) => (
                      <div 
                        key={notif.id}
                        className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-3 space-y-1.5 text-left text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-400 font-black flex items-center gap-1 font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            +{Number(notif.amount || 5000).toLocaleString()} RWF
                          </span>
                          <span className="text-[9.5px] text-slate-400 font-mono">{notif.displayTime || 'Just now'}</span>
                        </div>
                        <div className="text-white font-bold text-[11px] leading-tight">
                          {notif.title}
                        </div>
                        <div className="text-slate-300 text-[10.5px] leading-snug">
                          {notif.message}
                        </div>
                        {notif.smsPreview && (
                          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-[10px] font-mono text-amber-200">
                            &ldquo;{notif.smsPreview}&rdquo;
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[9.5px] text-slate-400 pt-1 border-t border-slate-800">
                          <span>Recipient: 0781339530 (NKUNDIMANA THEOGENE)</span>
                          <span className="text-emerald-400 font-bold">🟢 Plans Unlocked Instantly</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* PAYMENTS SEARCH & FILTER HEADER */}
              <div className="flex flex-col sm:flex-row gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 items-center justify-between">
                <div className="flex-1 w-full sm:w-auto relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by teacher name, email, phone or transaction ref #..."
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2 outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-[10px] font-black">
                    <button
                      onClick={() => setPaymentFilter('all')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${paymentFilter === 'all' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                      All ({paymentHistory.length})
                    </button>
                    <button
                      onClick={() => setPaymentFilter('paid')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${paymentFilter === 'paid' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                      Paid
                    </button>
                    <button
                      onClick={() => setPaymentFilter('other')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${paymentFilter === 'other' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                      Other
                    </button>
                  </div>
                  <button
                    onClick={fetchPaymentRecords}
                    disabled={isLoadingPayments}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
                    title="Refresh payment records"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPayments ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>
              </div>

              {/* DETAILED PAYMENTS TABLE */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Invoice (Ref & Date)</th>
                        <th className="p-3">Teacher Profile & Contact</th>
                        <th className="p-3">Amount Paid</th>
                        <th className="p-3">Package Purchased</th>
                        <th className="p-3">Validity & Expiration</th>
                        <th className="p-3 text-center bg-amber-500/5 text-amber-300">
                          <div className="flex items-center justify-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Plans Used</span>
                          </div>
                        </th>
                        <th className="p-3 text-center bg-emerald-500/5 text-emerald-300">
                          <div className="flex items-center justify-center gap-1">
                            <Award className="w-3.5 h-3.5" />
                            <span>Remaining</span>
                          </div>
                        </th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-center">Screenshot Proof</th>
                        <th className="p-3 text-center">Official Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 font-medium">
                      {filteredPayments.length > 0 ? (
                        filteredPayments.map((record) => {
                          const matchedTeacher = teachers.find(t => 
                            (record.userEmail && t.email?.toLowerCase() === record.userEmail.toLowerCase()) ||
                            (record.userId && t.id === record.userId)
                          );

                          const isOwner = record.userEmail === 'nkundimana123theogene@gmail.com';
                          const usedCount = matchedTeacher?.stats?.lessonPlansCount || matchedTeacher?.totalGenerated || 0;
                          const remainingCount = matchedTeacher?.remainingPlans !== undefined ? matchedTeacher.remainingPlans : (record.plansGranted || 30);
                          const expiryDateStr = record.expiryDate 
                            ? new Date(record.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                            : matchedTeacher?.subscriptionEndDate
                              ? new Date(matchedTeacher.subscriptionEndDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                              : '30 Days Validity';

                          const isExpired = record.expiryDate ? new Date(record.expiryDate).getTime() < Date.now() : false;
                          const daysRemaining = record.expiryDate 
                            ? Math.max(0, Math.ceil((new Date(record.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                            : 30;

                          const formattedAmount = `${record.amount?.toLocaleString() || '2,200'} RWF`;
                          const screenshotProof = record.receiptScreenshot || record.screenshotUrl;

                          return (
                            <tr key={record.id} className="hover:bg-slate-900/40 transition-colors">
                              {/* INVOICE REF & DATE */}
                              <td className="p-3 space-y-1 font-mono">
                                <div className="text-emerald-400 font-black text-xs flex items-center gap-1">
                                  <Receipt className="w-3.5 h-3.5 shrink-0" />
                                  <span>{record.id || record.transactionRef}</span>
                                </div>
                                <div className="text-slate-400 text-[10px] flex items-center gap-1 font-sans">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  <span>{record.date || (record.createdAt ? new Date(record.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently')}</span>
                                </div>
                              </td>

                              {/* TEACHER INFO */}
                              <td className="p-3">
                                <div className="space-y-0.5">
                                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                                    <span>{record.teacherName || record.userName || matchedTeacher?.name || 'Teacher'}</span>
                                    {isOwner && (
                                      <span className="bg-amber-500/20 text-amber-300 text-[8px] font-black px-1.5 py-0.2 rounded border border-amber-500/30 uppercase">
                                        Owner
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-slate-300 font-mono text-[11px]">{record.userEmail || record.teacherEmail}</div>
                                  <div className="text-slate-400 text-[10px]">{record.phone || record.phoneNumber || matchedTeacher?.phone || 'No phone'}</div>
                                </div>
                              </td>

                              {/* AMOUNT PAID */}
                              <td className="p-3">
                                <div className="space-y-0.5">
                                  <div className="text-sm font-black text-emerald-400 flex items-center gap-1">
                                    <DollarSign className="w-3.5 h-3.5" />
                                    <span>{formattedAmount}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {record.method || 'MTN MoMo'}
                                  </div>
                                </div>
                              </td>

                              {/* PLANS PURCHASED */}
                              <td className="p-3">
                                <div className="space-y-0.5">
                                  <div className="font-bold text-white text-xs">{record.planName}</div>
                                  <div className="text-emerald-400 font-black text-[11px]">
                                    {isOwner ? '∞ Unlimited Plans' : `Purchased: ${record.plansGranted || 30} Plans`}
                                  </div>
                                </div>
                              </td>

                              {/* EXPIRY DATE */}
                              <td className="p-3">
                                <div className="space-y-0.5">
                                  <div className="text-slate-200 text-xs font-bold flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>{expiryDateStr}</span>
                                  </div>
                                  {isOwner ? (
                                    <span className="inline-block bg-amber-500/10 text-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded border border-amber-500/30">
                                      Permanent
                                    </span>
                                  ) : !isExpired ? (
                                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-500/30">
                                      <Clock className="w-2.5 h-2.5" />
                                      {daysRemaining} Days Left
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 text-[9px] font-black px-1.5 py-0.5 rounded border border-rose-500/30">
                                      <AlertCircle className="w-2.5 h-2.5" />
                                      Expired
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* USED PLANS */}
                              <td className="p-3 text-center bg-amber-500/5">
                                <div className="inline-flex flex-col items-center">
                                  <span className="text-base font-black text-amber-300">
                                    {usedCount}
                                  </span>
                                  <span className="text-[9px] text-slate-500 uppercase font-bold">plans used</span>
                                </div>
                              </td>

                              {/* REMAINING PLANS */}
                              <td className="p-3 text-center bg-emerald-500/5">
                                <div className="inline-flex flex-col items-center">
                                  <span className={`text-base font-black px-2.5 py-0.5 rounded-xl border ${
                                    isOwner
                                      ? 'text-amber-300 bg-amber-500/10 border-amber-500/30'
                                      : remainingCount > 0 
                                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' 
                                        : 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                                  }`}>
                                    {isOwner ? '∞ Unlimited' : `${remainingCount} Plans`}
                                  </span>
                                  <span className="text-[9px] text-slate-500 uppercase font-bold mt-0.5">
                                    {remainingCount > 0 ? 'Remaining' : 'Depleted (0)'}
                                  </span>
                                </div>
                              </td>

                              {/* STATUS */}
                              <td className="p-3 text-center">
                                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 font-black text-[10px] px-2.5 py-1 rounded-lg border border-emerald-500/30">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  <span>PAID</span>
                                </span>
                              </td>

                              {/* SCREENSHOT PROOF */}
                              <td className="p-3 text-center">
                                {screenshotProof ? (
                                  <button
                                    onClick={() => setPreviewScreenshotModal({
                                      url: screenshotProof,
                                      teacherName: record.teacherName || record.userName || matchedTeacher?.name,
                                      teacherEmail: record.userEmail || record.teacherEmail,
                                      phone: record.phone || record.phoneNumber || matchedTeacher?.phone,
                                      planName: record.planName,
                                      amountFormatted: formattedAmount,
                                      date: record.date || (record.createdAt ? new Date(record.createdAt).toLocaleDateString('en-GB') : undefined),
                                      ref: record.id || record.transactionRef,
                                      method: record.method || 'MTN MoMo'
                                    })}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 rounded-xl border border-emerald-500/30 text-[10px] font-black transition-all cursor-pointer shadow-sm mx-auto"
                                    title="Click to view payment screenshot"
                                  >
                                    <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                                    <span>View Proof</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    No Image
                                  </span>
                                )}
                              </td>

                              {/* RECEIPT BUTTON */}
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => setSelectedReceipt({
                                    id: record.id,
                                    teacherName: record.teacherName,
                                    teacherEmail: record.userEmail,
                                    phone: record.phone || matchedTeacher?.phone,
                                    planName: record.planName,
                                    plansPurchased: record.plansGranted || 30,
                                    amountFormatted: formattedAmount,
                                    date: record.date,
                                    method: record.method || 'MTN Mobile Money',
                                    ref: record.id,
                                    expiryDate: expiryDateStr,
                                    daysLeft: daysRemaining,
                                    receiptScreenshot: screenshotProof
                                  })}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-500 text-slate-300 hover:text-slate-950 rounded-xl border border-slate-700 text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer mx-auto"
                                  title="Click to view full official receipt"
                                >
                                  <Receipt className="w-3 h-3" />
                                  <span>Receipt</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={10} className="p-12 text-center text-slate-500">
                            No payment or billing records found matching the current search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'logs' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/30 text-amber-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">System Audit & Security Logs</h4>
                    <p className="text-[10px] text-slate-500">Monitoring real-time "Strong Immunity" events to protect Nkorera Portal.</p>
                  </div>
                </div>
                <button
                  onClick={fetchSecurityLogs}
                  disabled={isLoadingLogs}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                  Refresh Logs
                </button>
              </div>

              {/* LOGS CHART */}
              {logsChartData.length > 0 && (
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60 h-64">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Activity Volume Over Time</h4>
                  <ResponsiveContainer width="100%" height="85%">
                    <LineChart data={logsChartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickMargin={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                      <Line type="monotone" dataKey="logins" name="Logins" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="logouts" name="Logouts" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="security" name="Security Events" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* LOGS FILTER BAR */}
              <div className="flex flex-col sm:flex-row gap-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by email, name, or event type..."
                      value={logsSearchQuery}
                      onChange={(e) => setLogsSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl px-2">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">From</span>
                    <input
                      type="date"
                      value={logsStartDate}
                      onChange={(e) => setLogsStartDate(e.target.value)}
                      className="bg-transparent text-slate-300 text-xs py-2 outline-none cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl px-2">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">To</span>
                    <input
                      type="date"
                      value={logsEndDate}
                      onChange={(e) => setLogsEndDate(e.target.value)}
                      className="bg-transparent text-slate-300 text-xs py-2 outline-none cursor-pointer"
                    />
                  </div>
                  <select
                    value={logTypeFilter}
                    onChange={(e) => setLogTypeFilter(e.target.value as 'all'|'security'|'session')}
                    className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 cursor-pointer"
                  >
                    <option value="all">All Logs</option>
                    <option value="session">Session (Login/Out)</option>
                    <option value="security">Security / Audit</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
                <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-[10px] border-collapse">
                    <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-500 font-black uppercase tracking-widest z-10">
                      <tr>
                        <th className="p-3 w-32">Date & Time</th>
                        <th className="p-3 w-40">Event Type</th>
                        <th className="p-3 w-48">User Identity</th>
                        <th className="p-3">Audit Details / Metadata</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {combinedLogs.length > 0 ? (
                        combinedLogs.map((log) => {
                          if (!log) return null;
                          let timeFormatted = 'Just now';
                          if (log.timestamp) {
                            try {
                              timeFormatted = new Date(log.timestamp).toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                            } catch {
                              timeFormatted = 'Just now';
                            }
                          }
                          const eventTypeStr = log.eventType || 'EVENT';
                          const emailStr = log.userEmail || 'unknown@nkorera.rw';
                          const detailsStr = log.details || 'No details recorded';

                          return (
                            <tr key={log.id || Math.random().toString()} className="hover:bg-slate-900/30 transition-colors">
                              <td className="p-3 font-mono text-slate-500">
                                {timeFormatted}
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full font-black border uppercase tracking-tighter ${
                                  eventTypeStr.includes('SUCCESS_LOGOUT')
                                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                    : eventTypeStr.includes('SUCCESS') 
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                  {eventTypeStr}
                                </span>
                              </td>
                              <td className="p-3 text-slate-300 font-bold">
                                {emailStr}
                              </td>
                              <td className="p-3 text-slate-400 italic">
                                {detailsStr}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-12 text-center text-slate-600 font-bold uppercase tracking-widest">
                            {isLoadingLogs ? "Reading secure logs from cloud Firestore..." : "No security events recorded yet."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="space-y-1">
                  <h5 className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Immunity Protocol Active</h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    All system actions are automatically audited and synced to a secure, immutable Firebase collection. 
                    Attempts to bypass authentication or manipulate document quotas are blocked by Zero-Trust Firestore Rules.
                    This system provides <span className="text-emerald-400 font-bold">Ironclad Immunity</span> against scammers.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* STATS OVERVIEW CARDS - CATEGORIZED LESSON PLANS METRICS */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {/* CARD 1: TOTAL TEACHERS */}
                <div 
                  onClick={() => setFilterCategory('all')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                    filterCategory === 'all' 
                      ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500' 
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                  title="Click to view all teachers"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] uppercase font-black tracking-wider">All Teachers</span>
                    <Users className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white">{totalTeachers}</div>
                  <p className="text-[9px] text-slate-400 font-medium">{paidTeachersCount} Paid • {freeTeachersCount} Free</p>
                </div>

                {/* CARD 2: PAID USERS LESSON PLANS */}
                <div 
                  onClick={() => setFilterCategory('paid')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                    filterCategory === 'paid' 
                      ? 'bg-emerald-950/60 border-emerald-400 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-400' 
                      : 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/50'
                  }`}
                  title="Click to view paid teachers and their usage"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400">Paid Teachers</span>
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-300">{paidPlansUsed} <span className="text-xs font-normal">Plans</span></div>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-slate-400">{paidTeachersCount} Teachers</span>
                    <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-black text-[8px] uppercase">Paid Sub</span>
                  </div>
                </div>

                {/* CARD 3: FREE LESSON PLANS */}
                <div 
                  onClick={() => setFilterCategory('free')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                    filterCategory === 'free' 
                      ? 'bg-blue-950/60 border-blue-400 shadow-lg shadow-blue-950/50 ring-1 ring-blue-400' 
                      : 'bg-slate-950/80 border-slate-800 hover:border-blue-500/50'
                  }`}
                  title="Click to view users active on free quota"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] uppercase font-black tracking-wider text-blue-400">Free Quota Users</span>
                    <Sparkles className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-blue-300">{freePlansUsed} <span className="text-xs font-normal">Plans</span></div>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-slate-400">{freeTeachersCount} Teachers</span>
                    <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-black text-[8px] uppercase">3 Free</span>
                  </div>
                </div>

                {/* CARD 4: DEPLETED / NEED TOP-UP */}
                <div 
                  onClick={() => setFilterCategory('depleted')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                    filterCategory === 'depleted' 
                      ? 'bg-rose-950/60 border-rose-500 shadow-lg shadow-rose-950/50 ring-1 ring-rose-500' 
                      : 'bg-slate-950/80 border-slate-800 hover:border-rose-500/50'
                  }`}
                  title="Click to view teachers with depleted plans who need top-ups"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] uppercase font-black tracking-wider text-rose-400">Depleted (0 Plans)</span>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-rose-300">{depletedTeachersCount} <span className="text-xs font-normal">Teachers</span></div>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-rose-400/80 font-bold">Needs Top-Up</span>
                    <span className="bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-black text-[8px] uppercase">Top-Up</span>
                  </div>
                </div>

                {/* CARD 5: TOTAL LESSON PLANS ALL */}
                <div 
                  onClick={() => setFilterCategory('all')}
                  className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1 cursor-pointer"
                  title="Total lesson plans created across all teachers"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-400">Total Lesson Plans</span>
                    <BookOpen className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-300">{totalPlansUsed} <span className="text-xs font-normal">Plans</span></div>
                  <p className="text-[9px] text-slate-400 font-medium">+ {totalPlansRemaining} remaining in pool</p>
                </div>
              </div>

              {/* FILTER PILLS & ACTION BUTTON BAR */}
              <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
                
                {/* FILTER PILLS */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase text-slate-500 px-1">Filter:</span>
                  <button
                    onClick={() => setFilterCategory('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      filterCategory === 'all'
                        ? 'bg-slate-800 text-white border border-slate-700 shadow'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    🌐 All ({totalTeachers})
                  </button>
                  <button
                    onClick={() => setFilterCategory('paid')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      filterCategory === 'paid'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow'
                        : 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/30'
                    }`}
                  >
                    ✓ Paid Users ({paidTeachersCount})
                  </button>
                  <button
                    onClick={() => setFilterCategory('free')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      filterCategory === 'free'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow'
                        : 'text-slate-400 hover:text-blue-300 hover:bg-blue-950/30'
                    }`}
                  >
                    🎁 Free Quota ({freeTeachersCount})
                  </button>
                  <button
                    onClick={() => setFilterCategory('depleted')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      filterCategory === 'depleted'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow'
                        : 'text-slate-400 hover:text-rose-300 hover:bg-rose-950/30'
                    }`}
                  >
                    🚨 Depleted ({depletedTeachersCount})
                  </button>
                  <button
                    onClick={() => setFilterCategory('pending')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      filterCategory === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                        : 'text-slate-400 hover:text-amber-300 hover:bg-amber-950/30'
                    }`}
                  >
                    ⚡ Approve Paid Requests ({teachers.filter(t => t && !t.isPaid && !t.verifiedPayment && t.email !== 'nkundimana123theogene@gmail.com').length})
                  </button>
                </div>

                {/* SEARCH & ADD TEACHER */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search teacher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-1.5 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500 font-medium"
                    />
                  </div>

                  <button
                    onClick={() => setIsAddingTeacher(true)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Teacher</span>
                  </button>

                  <button
                    onClick={handleResetDatabase}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer shrink-0"
                    title="Reset Database"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* ADD TEACHER FORM EXPANDABLE */}
              {isAddingTeacher && (
            <form onSubmit={handleAddTeacherSubmit} className="bg-slate-950/80 border border-emerald-500/30 p-4 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" /> Add New Teacher Profile
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingTeacher(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Teacher Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Jean Damascene"
                    className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl outline-none focus:border-emerald-500 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="teacher@example.com"
                    className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl outline-none focus:border-emerald-500 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Phone Number (MTN/Airtel)</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0781234567"
                    className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl outline-none focus:border-emerald-500 text-white"
                  />
                </div>
              </div>

              {/* PAID / UNPAID SELECTION BUTTONS */}
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-200 text-xs font-black">
                    Select Payment Status *
                  </label>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${newPaymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}`}>
                    {newPaymentStatus === 'PAID' ? '✓ Paid' : '✕ Unpaid'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setNewPaymentStatus('PAID');
                      if (newQuota === 0) {
                        const allFlat = ALL_AVAILABLE_PLANS_CATEGORIZED.flatMap(g => g.plans);
                        const matchedPlan = allFlat.find(p => p.id === newPlan);
                        setNewQuota(matchedPlan ? matchedPlan.quota : 30);
                      }
                    }}
                    className={`p-3 rounded-xl border text-xs font-black flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                      newPaymentStatus === 'PAID'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/50'
                        : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-emerald-500/40 hover:text-emerald-300'
                    }`}
                  >
                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${newPaymentStatus === 'PAID' ? 'text-slate-950' : 'text-emerald-400'}`} />
                    <div>
                      <div className="font-black text-[13px]">✓ PAID (Payment Verified)</div>
                      <div className={`text-[11px] font-semibold ${newPaymentStatus === 'PAID' ? 'text-slate-950' : 'text-slate-400'}`}>
                        Authorized to generate monthly lesson plans immediately
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewPaymentStatus('UNPAID');
                      setNewQuota(0);
                    }}
                    className={`p-3 rounded-xl border text-xs font-black flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                      newPaymentStatus === 'UNPAID'
                        ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-600/20 ring-2 ring-rose-400/50'
                        : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-rose-500/40 hover:text-rose-300'
                    }`}
                  >
                    <XCircle className={`w-5 h-5 shrink-0 ${newPaymentStatus === 'UNPAID' ? 'text-white' : 'text-rose-400'}`} />
                    <div>
                      <div className="font-black text-[13px]">✕ UNPAID (Payment Pending)</div>
                      <div className={`text-[11px] font-semibold ${newPaymentStatus === 'UNPAID' ? 'text-rose-100' : 'text-slate-400'}`}>
                        Cannot create plans until payment is verified
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Assign Subscription Plan</label>
                  <select
                    value={newPlan}
                    onChange={(e) => handlePlanChangeSelect(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl outline-none focus:border-emerald-500 text-white font-medium"
                  >
                    {ALL_AVAILABLE_PLANS_CATEGORIZED.map((group) => (
                      <optgroup key={group.categoryName} label={group.categoryName} className="bg-slate-900 text-emerald-400 font-bold">
                        {group.plans.map((plan) => (
                          <option key={plan.id} value={plan.id} className="bg-slate-900 text-white font-normal">
                            {plan.name} {plan.badge ? `[${plan.badge}]` : ''}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">
                    {newPaymentStatus === 'PAID' ? 'Plan Quota (Remaining Plans Allowed)' : 'Quota (Blocked - 0 Plans)'}
                  </label>
                  <input
                    type="number"
                    value={newQuota}
                    disabled={newPaymentStatus === 'UNPAID'}
                    onChange={(e) => setNewQuota(Math.max(0, parseInt(e.target.value) || 0))}
                    className={`w-full p-2.5 rounded-xl outline-none text-white ${
                      newPaymentStatus === 'UNPAID'
                        ? 'bg-slate-900/50 border border-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-900 border border-slate-800 focus:border-emerald-500'
                    }`}
                  />
                  {newPaymentStatus === 'UNPAID' && (
                    <p className="text-[11px] text-rose-400 font-semibold mt-1">
                      ⚠️ Teacher is UNPAID, cannot generate plans until payment is verified.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTeacher(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2 rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Create Teacher Account
                </button>
              </div>
            </form>
          )}

          {/* EDIT TEACHER SUBSCRIPTION INLINE FORM */}
          {editingTeacher && (
            <form onSubmit={handleEditSubmit} className="bg-slate-950/80 border border-amber-500/40 p-4 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Edit className="w-4 h-4" /> Edit Quota & Plans for: <span className="text-white font-bold">{editingTeacher.name || 'Teacher'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
              </div>

              {/* PAID / UNPAID TOGGLE BUTTONS IN EDIT */}
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-200 text-xs font-black">
                    Imimerere y'Ubwishyu (Payment Status) *
                  </label>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${editPaymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}`}>
                    {editPaymentStatus === 'PAID' ? '✓ Yishyuwe (Paid)' : '✕ Ntiyishyuye (Unpaid)'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditPaymentStatus('PAID');
                      if (editQuota === 0) {
                        const allFlat = ALL_AVAILABLE_PLANS_CATEGORIZED.flatMap(g => g.plans);
                        const matchedPlan = allFlat.find(p => p.id === editPlan);
                        setEditQuota(matchedPlan ? matchedPlan.quota : 30);
                      }
                    }}
                    className={`p-3 rounded-xl border text-xs font-black flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                      editPaymentStatus === 'PAID'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/50'
                        : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-emerald-500/40 hover:text-emerald-300'
                    }`}
                  >
                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${editPaymentStatus === 'PAID' ? 'text-slate-950' : 'text-emerald-400'}`} />
                    <div>
                      <div className="font-black text-[13px]">✓ PAID (Payment Verified)</div>
                      <div className={`text-[11px] font-semibold ${editPaymentStatus === 'PAID' ? 'text-slate-950' : 'text-slate-400'}`}>
                        Authorized to generate lesson plans
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditPaymentStatus('UNPAID');
                      setEditQuota(0);
                    }}
                    className={`p-3 rounded-xl border text-xs font-black flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                      editPaymentStatus === 'UNPAID'
                        ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-600/20 ring-2 ring-rose-400/50'
                        : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-rose-500/40 hover:text-rose-300'
                    }`}
                  >
                    <XCircle className={`w-5 h-5 shrink-0 ${editPaymentStatus === 'UNPAID' ? 'text-white' : 'text-rose-400'}`} />
                    <div>
                      <div className="font-black text-[13px]">✕ UNPAID (Payment Pending)</div>
                      <div className={`text-[11px] font-semibold ${editPaymentStatus === 'UNPAID' ? 'text-rose-100' : 'text-slate-400'}`}>
                        Cannot create lesson plans
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Select Active Subscription Plan</label>
                  <select
                    value={editPlan}
                    onChange={(e) => handleEditPlanChangeSelect(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl outline-none focus:border-emerald-500 text-white font-medium"
                  >
                    {ALL_AVAILABLE_PLANS_CATEGORIZED.map((group) => (
                      <optgroup key={group.categoryName} label={group.categoryName} className="bg-slate-900 text-emerald-400 font-bold">
                        {group.plans.map((plan) => (
                          <option key={plan.id} value={plan.id} className="bg-slate-900 text-white font-normal">
                            {plan.name} {plan.badge ? `[${plan.badge}]` : ''}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Set Remaining Lesson Plans (Remaining Quota)</label>
                  <input
                    type="number"
                    value={editQuota}
                    onChange={(e) => setEditQuota(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl outline-none focus:border-emerald-500 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Set Lesson Plans Used (Created Plans Count)</label>
                  <input
                    type="number"
                    value={editUsedCount}
                    onChange={(e) => setEditUsedCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl outline-none focus:border-emerald-500 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2 rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Save Plan Modifications (Approved Paid)
                </button>
              </div>
            </form>
          )}

          {/* IMMUNITY SECURITY BANNER */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 p-3.5 rounded-2xl border border-emerald-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-slate-300">
                This system provides <span className="text-emerald-400 font-bold">Strong Security Immunity</span> against unauthorized manipulation.
              </p>
            </div>
            <span className="bg-emerald-500/10 text-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-lg border border-emerald-500/30 shrink-0 uppercase tracking-wider">
              Protected Active
            </span>
          </div>

          {/* MASTER TEACHERS LIST TABLE */}
          <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-black">
                    <th className="p-3">Teacher Profile & Contact</th>
                    <th className="p-3">Amount Paid & Status</th>
                    <th className="p-3">Purchased Plans</th>
                    <th className="p-3">Expiration Date</th>
                    <th className="p-3 text-center bg-amber-500/5 text-amber-300">
                      <div className="flex items-center justify-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Used Plans</span>
                      </div>
                    </th>
                    <th className="p-3 text-center bg-emerald-500/5 text-emerald-300">
                      <div className="flex items-center justify-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>Remaining Plans</span>
                      </div>
                    </th>
                    <th className="p-3 text-center">⚡ Top-Up Plans</th>
                    <th className="p-3 text-center">Admin Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredTeachers.length > 0 ? (
                    filteredTeachers.map((t) => {
                      if (!t) return null;
                      const teacherName = t.name || 'Teacher';
                      const teacherEmail = t.email || 'no-email@nkorera.rw';
                      const allFlat = ALL_AVAILABLE_PLANS_CATEGORIZED.flatMap(g => g.plans);
                      const resolvedPlan = allFlat.find(p => p.id === t.currentPlan);
                      const isOwner = teacherEmail === 'nkundimana123theogene@gmail.com';
                      const usedCount = t.stats?.lessonPlansCount || t.totalGenerated || 0;
                      const remaining = t.remainingPlans !== undefined ? t.remainingPlans : 0;
                      const isGoogleAuth = teacherEmail.includes('gmail') || (t.id && t.id.includes('google'));
                      const isPaid = Boolean(isOwner || t.isPaid || t.verifiedPayment || (t.currentPlan && t.currentPlan !== 'no_subscription' && t.currentPlan !== 'free_3'));
                      const planDisplayName = isOwner
                        ? 'VIP Owner Access (Unlimited)'
                        : resolvedPlan
                          ? `${resolvedPlan.name}`
                          : t.currentPlan && t.currentPlan !== 'no_subscription'
                            ? `Active Plan: ${t.currentPlan}`
                            : 'No Active Monthly Plan';

                      const paymentInfo = getTeacherPaymentDetails(t, paymentHistory, isOwner);
                      const expiryInfo = getTeacherExpiry(t, isPaid, isOwner);
                      const plansInfo = getTeacherPlansInfo(t, resolvedPlan, isOwner);

                      return (
                        <tr key={t.id || Math.random().toString()} className="hover:bg-slate-900/40 transition-colors">
                          {/* TEACHER PROFILE & CONTACT */}
                          <td className="p-3">
                            <div className="flex items-start gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black shrink-0 mt-0.5">
                                {teacherName.charAt(0).toUpperCase()}
                              </div>
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-white text-xs">{teacherName}</span>
                                  {t.lastLoginAt && (Date.now() - new Date(t.lastLoginAt).getTime() < 30 * 60 * 1000) && (
                                    <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded-full border border-emerald-500/40 animate-pulse">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online
                                    </span>
                                  )}
                                  {isOwner && (
                                    <span className="inline-block bg-amber-500/20 text-amber-300 text-[8px] font-black px-1.5 py-0.5 rounded border border-amber-500/30 uppercase">
                                      Owner (VIP)
                                    </span>
                                  )}
                                </div>
                                
                                <div className="text-slate-300 font-mono text-[11px] truncate">{teacherEmail}</div>
                                <div className="text-slate-400 text-[10px] flex items-center gap-2">
                                  <span>{t.phone || 'No phone'}</span>
                                  {isGoogleAuth ? (
                                    <span className="inline-flex items-center gap-0.5 bg-blue-500/10 text-blue-300 text-[8px] font-black px-1.5 py-0.2 rounded border border-blue-500/20">
                                      Google
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-0.5 bg-slate-800 text-slate-400 text-[8px] font-black px-1.5 py-0.2 rounded border border-slate-700">
                                      Email
                                    </span>
                                  )}
                                </div>

                                {/* SESSION LOGS TOOLTIP */}
                                {t.sessionLogs && t.sessionLogs.length > 0 && (
                                  <div className="text-[9px] text-slate-500 relative group cursor-pointer">
                                    <span>Logins: <strong className="text-slate-300">{t.loginCount || 1}</strong> &bull; Logouts: <strong className="text-slate-300">{t.logoutCount || 0}</strong></span>
                                    <div className="absolute left-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                      <div className="text-[9px] uppercase font-black text-slate-400 mb-1.5 pb-1.5 border-b border-slate-800">
                                        Recent Session Activity
                                      </div>
                                      <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                                        {t.sessionLogs.slice(0, 5).map((log, i) => (
                                          <div key={i} className="flex flex-col text-[10px]">
                                            <span className={log.action === 'LOGIN' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                              {log.action}
                                            </span>
                                            <span className="text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* AMAFARANGA YISHYUYE & STATUS */}
                          <td className="p-3">
                            {t.status === 'UNPAID' || (t.isPaid === false && !isOwner) ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 font-black text-[10px] px-2 py-0.5 rounded-lg border border-rose-500/40">
                                  <XCircle className="w-3 h-3 text-rose-400" /> ✕ UNPAID
                                </span>
                                <div className="text-xs font-black text-rose-400">0 RWF</div>
                                <div className="text-[10px] text-rose-400 font-bold">
                                  Cannot create plans
                                </div>
                              </div>
                            ) : isPaid ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 font-black text-[10px] px-2 py-0.5 rounded-lg border border-emerald-500/30">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ✓ PAID & ACTIVE
                                </span>
                                <div className="text-xs font-black text-emerald-300 flex items-center gap-1">
                                  <DollarSign className="w-3 h-3 text-emerald-400" />
                                  <span>{paymentInfo.formattedAmount}</span>
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {paymentInfo.method} &bull; {paymentInfo.date}
                                </div>
                              </div>
                            ) : remaining > 0 ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 font-black text-[10px] px-2 py-0.5 rounded-lg border border-blue-500/30">
                                  🎁 FREE ({remaining} plans)
                                </span>
                                <div className="text-xs font-bold text-slate-400">0 RWF</div>
                                <div className="text-[10px] text-slate-400">{planDisplayName}</div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 font-black text-[10px] px-2 py-0.5 rounded-lg border border-rose-500/30">
                                  🚨 DEPLETED (0 Plans)
                                </span>
                                <div className="text-xs font-bold text-rose-400">0 RWF</div>
                                <div className="text-[10px] text-rose-400 font-bold">Requires top-up</div>
                              </div>
                            )}
                          </td>

                          {/* PLANS YAGUZE */}
                          <td className="p-3">
                            <div className="space-y-1">
                              <div className="font-bold text-white text-xs">{plansInfo.name}</div>
                              <div className="text-[11px] text-emerald-400 font-black">
                                {isOwner ? '∞ Unlimited Plans' : `Yaguze: ${plansInfo.purchased} Plans`}
                              </div>
                              {plansInfo.purchased > 0 && !isOwner && (
                                <div className="text-[9px] text-slate-500">
                                  Quota: {plansInfo.purchased} Plans
                                </div>
                              )}
                            </div>
                          </td>

                          {/* EXPIRATION DATE & DAYS LEFT */}
                          <td className="p-3">
                            <div className="space-y-1">
                              <div className="font-bold text-slate-200 text-xs flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{expiryInfo.text}</span>
                              </div>
                              {isOwner ? (
                                <span className="inline-block bg-amber-500/10 text-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded border border-amber-500/30">
                                  Unlimited
                                </span>
                              ) : !expiryInfo.isExpired ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-500/30">
                                  <Clock className="w-2.5 h-2.5" />
                                  {expiryInfo.daysLeft} Days Left
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 text-[9px] font-black px-1.5 py-0.5 rounded border border-rose-500/30">
                                  <AlertCircle className="w-2.5 h-2.5" />
                                  Expired
                                </span>
                              )}
                            </div>
                          </td>

                          {/* IZO YAKORESHEJE */}
                          <td className="p-3 text-center bg-amber-500/5">
                            <div className="inline-flex flex-col items-center">
                              <span className="text-base font-black text-amber-300">
                                {usedCount}
                              </span>
                              <span className="text-[9px] text-slate-500 uppercase font-bold">plans used</span>
                            </div>
                          </td>

                          {/* IZISIGAYE */}
                          <td className="p-3 text-center bg-emerald-500/5">
                            <div className="inline-flex flex-col items-center">
                              <span className={`text-base font-black px-2.5 py-0.5 rounded-xl border ${
                                isOwner
                                  ? 'text-amber-300 bg-amber-500/10 border-amber-500/30'
                                  : remaining > 0 
                                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' 
                                    : 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                              }`}>
                                {isOwner ? '∞ Unlimited' : `${remaining} Plans`}
                              </span>
                              <span className="text-[9px] text-slate-500 uppercase font-bold mt-0.5">
                                {remaining > 0 ? 'Remaining' : 'Depleted (0)'}
                              </span>
                            </div>
                          </td>

                          {/* QUICK TOP-UP BUTTONS */}
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleQuickTopUp(t, 10)}
                                className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-black rounded-lg border border-emerald-500/30 text-[10px] transition-all cursor-pointer shadow-sm flex items-center gap-0.5"
                                title="Top up +10 Plans instantly"
                              >
                                <Plus className="w-3 h-3" /> 10
                              </button>
                              <button
                                onClick={() => handleQuickTopUp(t, 30)}
                                className="px-2 py-1 bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-slate-950 font-black rounded-lg border border-teal-500/30 text-[10px] transition-all cursor-pointer shadow-sm flex items-center gap-0.5"
                                title="Top up +30 Plans instantly"
                              >
                                <Plus className="w-3 h-3" /> 30
                              </button>
                              <button
                                onClick={() => handleQuickTopUp(t, 50)}
                                className="px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 font-black rounded-lg border border-cyan-500/30 text-[10px] transition-all cursor-pointer shadow-sm flex items-center gap-0.5"
                                title="Top up +50 Plans instantly"
                              >
                                <Plus className="w-3 h-3" /> 50
                              </button>
                              <button
                                onClick={() => handleQuickTopUp(t, 100)}
                                className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-black rounded-lg border border-amber-500/30 text-[10px] transition-all cursor-pointer shadow-sm flex items-center gap-0.5"
                                title="Top up +100 Plans instantly"
                              >
                                <Plus className="w-3 h-3" /> 100
                              </button>
                            </div>
                          </td>

                          {/* ACTIONS */}
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* PAID BUTTON */}
                                <button
                                onClick={() => handleApprovePaid(t)}
                                className={`px-2.5 py-1.5 font-black rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer shadow-md shrink-0 ${
                                  isPaid
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 hover:scale-105 active:scale-95 animate-pulse'
                                }`}
                                title="Click to approve as PAID (Allowed to create lesson plans)"
                              >
                                <CheckCircle2 className={`w-3.5 h-3.5 ${isPaid ? 'text-emerald-400' : 'text-slate-950'}`} />
                                <span>{isPaid ? '✓ Paid' : 'Set Paid'}</span>
                              </button>

                              {/* UNPAID BUTTON */}
                              <button
                                onClick={() => handleSetUnpaid(t)}
                                disabled={isOwner}
                                className={`px-2.5 py-1.5 font-black rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer shadow-md shrink-0 ${
                                  t.status === 'UNPAID' || (t.isPaid === false && !isOwner)
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                                    : isOwner
                                      ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-700'
                                      : 'bg-slate-800 hover:bg-rose-600 hover:text-white text-rose-400 border border-slate-700/70 hover:border-rose-500/50'
                                }`}
                                title={isOwner ? "Admin / Owner cannot be set to unpaid" : "Click to set as UNPAID (Restricted from creating lesson plans)"}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>{t.status === 'UNPAID' || (t.isPaid === false && !isOwner) ? '✕ Unpaid' : 'Set Unpaid'}</span>
                              </button>

                              {/* EDIT BUTTON */}
                              <button
                                onClick={() => handleEditClick(t)}
                                className="p-2 bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 rounded-xl border border-slate-700/60 hover:border-amber-500/30 transition-all cursor-pointer flex items-center gap-1"
                                title="Edit plan or lesson limits"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold">Edit</span>
                              </button>
                              
                              {/* DELETE BUTTON */}
                              <button
                                onClick={() => handleDeleteTeacher(t.id, teacherName)}
                                className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-700/60 hover:border-rose-500/30 transition-all cursor-pointer"
                                title="Delete teacher"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500">
                        No teachers found matching this criteria or search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close Dashboard
          </button>
        </div>

      </div>

      {/* INVOICE & RECEIPT POPUP MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-white relative">
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* RECEIPT HEADER */}
            <div className="text-center space-y-1.5 pb-4 border-b border-slate-800">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-1">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black tracking-tight text-white">Inyemezabwishyu / Receipt</h3>
              <p className="text-xs text-emerald-400 font-bold tracking-widest uppercase">Nkorera Lesson Plans AI Portal</p>
              <div className="text-[10px] text-slate-400 font-mono">Ref: {selectedReceipt.ref}</div>
            </div>

            {/* RECEIPT DETAILS */}
            <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Teacher:</span>
                <span className="font-bold text-white text-right">{selectedReceipt.teacherName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Email:</span>
                <span className="font-mono text-slate-300 text-[11px]">{selectedReceipt.teacherEmail}</span>
              </div>
              {selectedReceipt.phone && (
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-mono text-slate-300">{selectedReceipt.phone}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Purchased Plan:</span>
                <span className="font-bold text-emerald-400">{selectedReceipt.planName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Granted Plans:</span>
                <span className="font-black text-white">{selectedReceipt.plansPurchased} Plans</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Expiration Date:</span>
                <span className="font-bold text-slate-200">{selectedReceipt.expiryDate}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Payment Method:</span>
                <span className="text-slate-300">{selectedReceipt.method}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-b border-slate-800/50 pb-2">
                <span className="text-slate-300 font-bold uppercase text-[11px]">Total Amount:</span>
                <span className="text-base font-black text-emerald-400">{selectedReceipt.amountFormatted}</span>
              </div>

              {/* ATTACHED SCREENSHOT PROOF IF EXISTS */}
              {selectedReceipt.receiptScreenshot && (
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-amber-300 flex items-center gap-1.5 uppercase">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>Payment Screenshot Proof</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewScreenshotModal({
                        url: selectedReceipt.receiptScreenshot!,
                        teacherName: selectedReceipt.teacherName,
                        teacherEmail: selectedReceipt.teacherEmail,
                        phone: selectedReceipt.phone,
                        planName: selectedReceipt.planName,
                        amountFormatted: selectedReceipt.amountFormatted,
                        date: selectedReceipt.date,
                        ref: selectedReceipt.ref,
                        method: selectedReceipt.method
                      })}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <ZoomIn className="w-3 h-3" />
                      <span>View Full Size</span>
                    </button>
                  </div>
                  <div 
                    onClick={() => setPreviewScreenshotModal({
                      url: selectedReceipt.receiptScreenshot!,
                      teacherName: selectedReceipt.teacherName,
                      teacherEmail: selectedReceipt.teacherEmail,
                      phone: selectedReceipt.phone,
                      planName: selectedReceipt.planName,
                      amountFormatted: selectedReceipt.amountFormatted,
                      date: selectedReceipt.date,
                      ref: selectedReceipt.ref,
                      method: selectedReceipt.method
                    })}
                    className="relative group rounded-xl overflow-hidden border border-amber-500/40 bg-slate-900 cursor-pointer max-h-48 flex items-center justify-center"
                  >
                    <img
                      src={selectedReceipt.receiptScreenshot}
                      alt="Payment Receipt Screenshot"
                      className="w-full object-contain group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="text-xs font-bold text-white bg-slate-900/90 px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5">
                        <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Click to Enlarge Photo</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STATUS BADGE & PRINT BUTTON */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>APPROVED (PAID)</span>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL SCREEN / ZOOM SCREENSHOT PREVIEW MODAL */}
      {previewScreenshotModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 text-white relative flex flex-col max-h-[92vh]">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>Proof of Payment (MoMo Screenshot)</span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Verified Upload
                    </span>
                  </h3>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                    <span>{previewScreenshotModal.teacherName || 'Teacher'}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{previewScreenshotModal.amountFormatted || 'MoMo Transfer'}</span>
                    {previewScreenshotModal.ref && (
                      <>
                        <span>•</span>
                        <span>Ref: {previewScreenshotModal.ref}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewScreenshotModal.url}
                  download={`receipt_${previewScreenshotModal.ref || 'screenshot'}.jpg`}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors cursor-pointer"
                  title="Download photo"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreviewScreenshotModal(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* IMAGE CONTAINER */}
            <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 p-2 overflow-auto flex items-center justify-center min-h-[300px]">
              <img
                src={previewScreenshotModal.url}
                alt="MoMo Transaction Screenshot"
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
              />
            </div>

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <div className="text-slate-400 text-[11px]">
                {previewScreenshotModal.teacherEmail && (
                  <span>Email: <strong className="text-slate-200 font-mono">{previewScreenshotModal.teacherEmail}</strong></span>
                )}
                {previewScreenshotModal.phone && (
                  <span className="ml-2">Phone: <strong className="text-amber-300 font-mono">{previewScreenshotModal.phone}</strong></span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewScreenshotModal(null)}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs cursor-pointer shadow-md transition-colors"
              >
                Close Photo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
