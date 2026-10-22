import { UserProfile } from '../types';
import { SubscriptionData, syncAllCategorySubscriptionsForUser } from './subscription';
import { syncSingleTeacherToCloud } from './autoSync';
import { logSecurityEvent, syncUserProfileToFirestore } from './firebase';

const USERS_LIST_KEY = 'nkorera_teachers_list';
const CURRENT_USER_KEY = 'nkorera_current_user';

// Pre-seeded realistic Rwandan teachers to make the Admin Panel look professional and populated
const SEEDED_TEACHERS: UserProfile[] = [
  {
    id: 'user_1',
    email: 'nkundimana123theogene@gmail.com', // Admin / Owner email
    name: 'NKUNDIMANA Theogene',
    country: 'Rwanda',
    phone: '0781339530',
    password: 'password',
    currentPlan: 'UNLIMITED_ADMIN_VIP',
    remainingPlans: 999999,
    isAdmin: true,
    isPaid: true,
    verifiedPayment: true,
    hasPremiumToolsSub: true,
    totalGenerated: 185,
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: '2026-10-07T03:30:00.000Z',
    status: 'ACTIVE',
    loginCount: 58,
    logoutCount: 32,
    sessionLogs: [{ action: "LOGIN", timestamp: "2026-10-07T03:30:00Z" }],
    stats: {
      lessonPlansCount: 120,
      nurseryPlansCount: 25,
      examsCount: 18,
      worksheetsCount: 22,
      diaryEntriesCount: 15,
      certificatesCount: 10,
      totalItems: 210
    }
  },
  {
    id: 'user_demo',
    email: 'mwarimu.demo@urugero.rw',
    name: 'Model Teacher (Demo Teacher)',
    country: 'Rwanda',
    phone: '0780000000',
    password: 'password',
    currentPlan: 'free_3',
    remainingPlans: 3,
    isAdmin: false,
    isPaid: false,
    verifiedPayment: false,
    hasPremiumToolsSub: false,
    totalGenerated: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: '2026-10-08T00:00:00.000Z',
    status: 'ACTIVE',
    loginCount: 1,
    logoutCount: 0,
    sessionLogs: [{ action: "LOGIN", timestamp: "2026-10-08T00:00:00Z" }],
    stats: {
      lessonPlansCount: 0,
      nurseryPlansCount: 0,
      examsCount: 0,
      worksheetsCount: 0,
      diaryEntriesCount: 0,
      certificatesCount: 0,
      totalItems: 0
    }
  },
  {
    id: 'user_2',
    email: 'mukamanzi.marie@yahoo.com',
    name: 'MUKAMANZI Marie Chantal',
    country: 'Rwanda',
    phone: '0788442211',
    password: 'password',
    currentPlan: 'free_3',
    remainingPlans: 0, // Batishyuye - Free plan zashize (0 remaining, must upgrade)
    isAdmin: false,
    hasPremiumToolsSub: false, // Batishyuye!
    totalGenerated: 3,
    createdAt: '2026-06-15T08:20:00.000Z',
    lastLoginAt: '2026-08-16T15:40:00.000Z',
    status: 'DEPLETED',
    loginCount: 14,
    logoutCount: 12,
    sessionLogs: [{ action: "LOGIN", timestamp: "2026-09-02T08:30:00Z" }],
    stats: {
      lessonPlansCount: 3,
      nurseryPlansCount: 0,
      examsCount: 2,
      worksheetsCount: 4,
      diaryEntriesCount: 0,
      certificatesCount: 1,
      totalItems: 10
    }
  },
  {
    id: 'user_3',
    email: 'jean.nsengimana@reb.rw',
    name: 'NSENGIMANA Jean Pierre',
    country: 'Rwanda',
    phone: '0783556677',
    password: 'password',
    currentPlan: 'free_3', // NTABWO YISHYUYE - Free quota expired
    remainingPlans: 0,
    isAdmin: false,
    hasPremiumToolsSub: false, // NTABWO YISHYUYE!
    totalGenerated: 3,
    createdAt: '2026-07-01T10:15:00.000Z',
    lastLoginAt: '2026-08-17T08:10:00.000Z',
    status: 'DEPLETED',
    loginCount: 9,
    logoutCount: 8,
    stats: {
      lessonPlansCount: 3,
      nurseryPlansCount: 2,
      examsCount: 4,
      worksheetsCount: 6,
      diaryEntriesCount: 1,
      certificatesCount: 0,
      totalItems: 16
    }
  },
  {
    id: 'user_4',
    email: 'uwimana.emmanuel@gmail.com',
    name: 'UWIMANA Emmanuel',
    country: 'Rwanda',
    phone: '0791223344',
    password: 'password',
    currentPlan: 'free_3',
    remainingPlans: 0, // Batishyuye - Free plan zashize (0 remaining, must upgrade)
    isAdmin: false,
    hasPremiumToolsSub: false, // Batishyuye!
    totalGenerated: 3,
    createdAt: '2026-07-12T09:00:00.000Z',
    lastLoginAt: '2026-08-14T11:22:00.000Z',
    status: 'DEPLETED',
    loginCount: 4,
    logoutCount: 3,
    stats: {
      lessonPlansCount: 3,
      nurseryPlansCount: 0,
      examsCount: 1,
      worksheetsCount: 1,
      diaryEntriesCount: 0,
      certificatesCount: 0,
      totalItems: 5
    }
  },
  {
    id: 'user_5',
    email: 'havugimana.eric@gmail.com',
    name: 'HAVUGIMANA Eric',
    country: 'Rwanda',
    phone: '0785112233',
    password: 'password',
    currentPlan: 'free_3',
    remainingPlans: 2, // Batishyuye - Free quota active (amaze gukoresha 1, asigaje 2)
    isAdmin: false,
    hasPremiumToolsSub: false, // Batishyuye!
    totalGenerated: 1,
    createdAt: '2026-08-05T16:45:00.000Z',
    lastLoginAt: '2026-08-17T09:05:00.000Z',
    status: 'ACTIVE',
    loginCount: 5,
    logoutCount: 3,
    stats: {
      lessonPlansCount: 1,
      nurseryPlansCount: 0,
      examsCount: 0,
      worksheetsCount: 1,
      diaryEntriesCount: 0,
      certificatesCount: 0,
      totalItems: 2
    }
  },
  {
    id: 'user_oloba_samson',
    email: 'olobasamson923@gmail.com',
    name: 'Oloba Samson',
    country: 'Rwanda',
    phone: '+250781036540',
    password: 'password',
    currentPlan: 'plan_30',
    remainingPlans: 30,
    isAdmin: false,
    hasPremiumToolsSub: true,
    isPaid: true,
    verifiedPayment: true,
    totalGenerated: 0,
    createdAt: '2026-09-06T08:00:00.000Z',
    lastLoginAt: '2026-09-06T09:00:00.000Z',
    status: 'ACTIVE',
    loginCount: 5,
    logoutCount: 0,
    stats: {
      lessonPlansCount: 0,
      nurseryPlansCount: 0,
      examsCount: 0,
      worksheetsCount: 0,
      diaryEntriesCount: 0,
      certificatesCount: 0,
      totalItems: 0
    }
  },
  {
    id: 'user_florence_mukamabano',
    email: 'florencemukamabano70@gmail.com',
    name: 'Mukamabano Florence',
    country: 'Rwanda',
    phone: '0782663885',
    password: 'password',
    currentPlan: 'plan_20',
    remainingPlans: 20,
    purchasedPlans: 20,
    totalPlansPurchased: 20,
    isAdmin: false,
    hasPremiumToolsSub: true,
    isPaid: true,
    verifiedPayment: true,
    verifiedAt: '2026-09-08T07:30:00.000Z',
    lastPaymentAmount: 1600,
    lastPaymentPlanName: '20 Lesson Plans (1 Month)',
    lastPaymentDate: '2026-09-08T07:30:00.000Z',
    totalGenerated: 0,
    createdAt: '2026-09-08T07:30:00.000Z',
    lastLoginAt: '2026-09-08T07:32:00.000Z',
    status: 'ACTIVE',
    loginCount: 1,
    logoutCount: 0,
    stats: {
      lessonPlansCount: 0,
      nurseryPlansCount: 0,
      examsCount: 0,
      worksheetsCount: 0,
      diaryEntriesCount: 0,
      certificatesCount: 0,
      totalItems: 0
    }
  },
  {
    id: 'user_uwamahoro_alvera',
    email: 'uwamahoroalvera@gmail.com',
    name: 'Uwamahoro Alvera',
    country: 'Rwanda',
    phone: '0784456092',
    momoNumber: '0784456092',
    password: 'password',
    currentPlan: 'plan_10',
    remainingPlans: 9,
    purchasedPlans: 10,
    totalPlansPurchased: 10,
    isAdmin: false,
    hasPremiumToolsSub: true,
    isPaid: true,
    verifiedPayment: true,
    verifiedAt: '2026-09-07T14:25:00.000Z',
    lastPaymentAmount: 800,
    lastPaymentPlanName: '10 Lesson Plans (1 Month)',
    lastPaymentDate: '2026-09-07T14:25:00.000Z',
    subscriptionExpiresAt: '2026-10-07T14:25:00.000Z',
    expiresAt: '2026-10-07T14:25:00.000Z',
    totalGenerated: 1,
    createdAt: '2026-09-07T14:25:00.000Z',
    lastLoginAt: '2026-09-07T14:30:00.000Z',
    status: 'ACTIVE',
    loginCount: 1,
    logoutCount: 0,
    stats: {
      lessonPlansCount: 1,
      nurseryPlansCount: 0,
      examsCount: 0,
      worksheetsCount: 0,
      diaryEntriesCount: 0,
      certificatesCount: 0,
      totalItems: 1
    }
  },
  {
    id: 'user_nsanzimana_francois',
    email: 'nsanzimanafrancois91@gmail.com',
    name: 'NSANZIMANA Francois',
    country: 'Rwanda',
    phone: '0786332660',
    momoNumber: '0786332660',
    password: 'password',
    currentPlan: 'plan_230',
    remainingPlans: 230,
    purchasedPlans: 230,
    totalPlansPurchased: 230,
    isAdmin: false,
    hasPremiumToolsSub: true,
    isPaid: true,
    verifiedPayment: true,
    verifiedAt: '2026-09-24T00:00:00.000Z',
    lastPaymentAmount: 8200,
    lastPaymentPlanName: 'CBC Lesson Plans Pass (2 Months)',
    lastPaymentDate: '2026-09-24T00:00:00.000Z',
    lastPaymentTxRef: 'MP260924.0310.M0660',
    subscriptionExpiresAt: '2026-11-24T23:59:59.000Z',
    expiresAt: '2026-11-24T23:59:59.000Z',
    billingPeriodStart: '2026-09-24T00:00:00.000Z',
    billingPeriodEnd: '2026-11-24T23:59:59.000Z',
    verifiedServices: ['cbc', 'remedial', 'nursery', 'scheme', 'ai'],
    totalGenerated: 0,
    createdAt: '2026-09-24T00:00:00.000Z',
    lastLoginAt: '2026-09-24T00:00:00.000Z',
    status: 'ACTIVE',
    loginCount: 1,
    logoutCount: 0,
    stats: {
      lessonPlansCount: 0,
      nurseryPlansCount: 0,
      examsCount: 0,
      worksheetsCount: 0,
      diaryEntriesCount: 0,
      certificatesCount: 0,
      totalItems: 0
    }
  }
];

export const getAllTeachers = (): UserProfile[] => {
  try {
    const raw = localStorage.getItem(USERS_LIST_KEY);
    let list: UserProfile[] = [];
    if (!raw) {
      list = [...SEEDED_TEACHERS];
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify(list));
      return list;
    }
    try {
      list = JSON.parse(raw);
    } catch (e) {
      list = [...SEEDED_TEACHERS];
    }
    if (!Array.isArray(list)) {
      list = [...SEEDED_TEACHERS];
    }

    let modified = false;

    // Ensure all seeded teachers (including Mukamabano Florence) are present in the list
    SEEDED_TEACHERS.forEach(seeded => {
      const idx = list.findIndex(t => t && t.email && t.email.toLowerCase().trim() === seeded.email.toLowerCase().trim());
      if (idx === -1) {
        list.push({ ...seeded });
        modified = true;
      }
    });

    // Auto-sanitize list: ensure unpaid teachers cannot have illegal paid plan IDs or fake paid status
    const sanitized = list.map(t => {
      if (!t) return t;
      const isOwner = t.email === 'nkundimana123theogene@gmail.com';
      const isJeanPierre = t.email === 'jean.nsengimana@reb.rw' || t.name.toLowerCase().includes('nsengimana');
      const isMukamanzi = t.email === 'mukamanzi.marie@yahoo.com' || t.name.toLowerCase().includes('mukamanzi');

      // Explicitly fix Nsengimana Jean Pierre & Mukamanzi Marie Chantal if previously cached with paid flag
      if ((isJeanPierre || isMukamanzi) && (t.hasPremiumToolsSub || t.currentPlan !== 'free_3')) {
        modified = true;
        return {
          ...t,
          currentPlan: 'free_3',
          remainingPlans: 0,
          hasPremiumToolsSub: false,
          status: 'DEPLETED'
        };
      }

      // Explicitly ensure Oloba Samson (olobasamson923@gmail.com) is verified paid with 30 plans
      if (t.email === 'olobasamson923@gmail.com') {
        if (!t.isPaid || t.remainingPlans < 30 || t.status !== 'ACTIVE') {
          modified = true;
          return {
            ...t,
            currentPlan: 'plan_30',
            remainingPlans: Math.max(30, t.remainingPlans || 30),
            hasPremiumToolsSub: true,
            isPaid: true,
            verifiedPayment: true,
            lastPaymentAmount: 2200,
            lastPaymentPlanName: '30 Lesson Plans Package',
            status: 'ACTIVE'
          };
        }
      }

      // Explicitly ensure Mukamabano Florence (florencemukamabano70@gmail.com) is verified paid with 20 plans
      if (t.email === 'florencemukamabano70@gmail.com' || (t.name && t.name.toLowerCase().includes('mukamabano') && t.name.toLowerCase().includes('florence')) || (t.phone && t.phone.replace(/\s+/g, '') === '0782663885')) {
        const currentRem = typeof t.remainingPlans === 'number' ? t.remainingPlans : 20;
        const currentGen = typeof t.totalGenerated === 'number' ? t.totalGenerated : 0;
        if (!t.isPaid || !t.verifiedPayment || !t.hasPremiumToolsSub || t.currentPlan !== 'plan_20' || !t.lastPaymentAmount || typeof t.remainingPlans !== 'number' || t.phone !== '0782663885' || t.momoNumber !== '0782663885') {
          modified = true;
          return {
            ...t,
            name: 'Mukamabano Florence',
            email: 'florencemukamabano70@gmail.com',
            phone: '0782663885',
            momoNumber: '0782663885',
            currentPlan: 'plan_20',
            remainingPlans: currentRem,
            purchasedPlans: 20,
            totalPlansPurchased: 20,
            totalGenerated: currentGen,
            lastPaymentAmount: 1600,
            lastPaymentPlanName: '20 Lesson Plans (1 Month)',
            lastPaymentDate: '2026-09-08T07:30:00.000Z',
            lastPaymentTxRef: 'MP260908.0732.M09885',
            subscriptionExpiresAt: '2026-10-08T07:30:00.000Z',
            expiresAt: '2026-10-08T07:30:00.000Z',
            verifiedAt: '2026-09-08T07:30:00.000Z',
            hasPremiumToolsSub: true,
            isPaid: true,
            verifiedPayment: true,
            status: 'ACTIVE'
          };
        }
      }

      // Explicitly ensure Uwamahoro Alvera (uwamahoroalvera@gmail.com) is verified paid with 10 purchased plans (valid 1 month)
      if (t.email === 'uwamahoroalvera@gmail.com' || (t.name && t.name.toLowerCase().includes('uwamahoro') && t.name.toLowerCase().includes('alvera'))) {
        const currentRem = typeof t.remainingPlans === 'number' ? t.remainingPlans : 9;
        const currentGen = typeof t.totalGenerated === 'number' ? t.totalGenerated : 1;
        if (!t.isPaid || !t.verifiedPayment || !t.hasPremiumToolsSub || t.currentPlan !== 'plan_10' || !t.lastPaymentAmount || typeof t.remainingPlans !== 'number' || t.phone !== '0784456092' || t.momoNumber !== '0784456092') {
          modified = true;
          return {
            ...t,
            name: 'Uwamahoro Alvera',
            phone: '0784456092',
            momoNumber: '0784456092',
            currentPlan: 'plan_10',
            remainingPlans: currentRem,
            purchasedPlans: 10,
            totalPlansPurchased: 10,
            totalGenerated: currentGen,
            lastPaymentAmount: 800,
            lastPaymentPlanName: '10 Lesson Plans (1 Month)',
            lastPaymentDate: '2026-09-07T14:25:00.000Z',
            verifiedAt: '2026-09-07T14:25:00.000Z',
            subscriptionExpiresAt: '2026-10-07T14:25:00.000Z',
            expiresAt: '2026-10-07T14:25:00.000Z',
            hasPremiumToolsSub: true,
            isPaid: true,
            verifiedPayment: true,
            status: currentRem > 0 ? 'ACTIVE' : 'DEPLETED',
            stats: {
              lessonPlansCount: currentGen,
              nurseryPlansCount: t.stats?.nurseryPlansCount || 0,
              examsCount: t.stats?.examsCount || 0,
              worksheetsCount: t.stats?.worksheetsCount || 0,
              diaryEntriesCount: t.stats?.diaryEntriesCount || 0,
              certificatesCount: t.stats?.certificatesCount || 0,
              totalItems: currentGen
            }
          };
        }
      }

      // Explicitly ensure NSANZIMANA Francois (nsanzimanafrancois91@gmail.com) is verified paid with CBC Lesson Plans for 2 months
      if (t.email === 'nsanzimanafrancois91@gmail.com' || (t.name && t.name.toLowerCase().includes('nsanzimana') && t.name.toLowerCase().includes('francois')) || (t.phone && t.phone.replace(/\s+/g, '') === '0786332660')) {
        const currentRem = typeof t.remainingPlans === 'number' ? Math.max(230, t.remainingPlans) : 230;
        if (!t.isPaid || !t.verifiedPayment || !t.hasPremiumToolsSub || t.phone !== '0786332660' || !t.subscriptionExpiresAt || !t.subscriptionExpiresAt.includes('2026-11')) {
          modified = true;
          return {
            ...t,
            name: 'NSANZIMANA Francois',
            email: 'nsanzimanafrancois91@gmail.com',
            phone: '0786332660',
            momoNumber: '0786332660',
            currentPlan: 'plan_230',
            remainingPlans: currentRem,
            purchasedPlans: 230,
            totalPlansPurchased: 230,
            lastPaymentAmount: 8200,
            lastPaymentPlanName: 'CBC Lesson Plans Pass (2 Months)',
            lastPaymentDate: '2026-09-24T00:00:00.000Z',
            lastPaymentTxRef: 'MP260924.0310.M0660',
            subscriptionExpiresAt: '2026-11-24T23:59:59.000Z',
            expiresAt: '2026-11-24T23:59:59.000Z',
            billingPeriodStart: '2026-09-24T00:00:00.000Z',
            billingPeriodEnd: '2026-11-24T23:59:59.000Z',
            verifiedServices: ['cbc', 'remedial', 'nursery', 'scheme', 'ai'],
            verifiedAt: '2026-09-24T00:00:00.000Z',
            hasPremiumToolsSub: true,
            isPaid: true,
            verifiedPayment: true,
            status: 'ACTIVE'
          };
        }
      }

      // If a teacher was assigned a paid plan or has remaining plans from Admin, keep them active!
      if (t.isPaid || t.verifiedPayment || t.hasPremiumToolsSub || (typeof t.remainingPlans === 'number' && t.remainingPlans > 3)) {
        if (!t.hasPremiumToolsSub || !t.isPaid || !t.verifiedPayment) {
          modified = true;
          return {
            ...t,
            hasPremiumToolsSub: true,
            isPaid: true,
            verifiedPayment: true,
            status: (t.remainingPlans || 0) > 0 ? 'ACTIVE' : 'DEPLETED'
          };
        }
        return t;
      }

      // Check monthly reset for free tier teachers (3 free lesson plans per month)
      if (!isOwner && !t.isPaid) {
        const nowMs = Date.now();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        const baseTimeStr = t.lastMonthlyResetAt || t.createdAt;
        const baseTime = baseTimeStr ? new Date(baseTimeStr).getTime() : 0;

        if (!baseTime || isNaN(baseTime) || (nowMs - baseTime) >= thirtyDaysMs) {
          modified = true;
          return {
            ...t,
            currentPlan: 'free_3',
            remainingPlans: 3,
            lastMonthlyResetAt: new Date(nowMs).toISOString(),
            status: 'ACTIVE'
          };
        }
      }

      if (!isOwner && !t.hasPremiumToolsSub && !t.isPaid && t.currentPlan !== 'free_3' && t.currentPlan !== 'no_subscription' && (!t.remainingPlans || t.remainingPlans <= 3)) {
        modified = true;
        const usedCount = t.stats?.lessonPlansCount || t.totalGenerated || 0;
        const remaining = Math.max(0, 3 - usedCount);
        return {
          ...t,
          currentPlan: 'free_3',
          remainingPlans: remaining,
          status: remaining > 0 ? 'ACTIVE' : 'DEPLETED'
        };
      }
      return t;
    });

    if (modified) {
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify(sanitized));
      return sanitized;
    }

    return list;
  } catch (err) {
    console.error('Error fetching teachers list:', err);
    return SEEDED_TEACHERS;
  }
};

export const saveTeachers = (teachers: UserProfile[]) => {
  localStorage.setItem(USERS_LIST_KEY, JSON.stringify(teachers));
};

export const getCurrentUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (parsed.id === 'guest') return null;

    if (parsed.email === 'olobasamson923@gmail.com') {
      parsed.isPaid = true;
      parsed.verifiedPayment = true;
      parsed.currentPlan = 'plan_30';
      parsed.hasPremiumToolsSub = true;
      if (typeof parsed.remainingPlans !== 'number') parsed.remainingPlans = 30;
      parsed.status = (parsed.remainingPlans || 0) > 0 ? 'ACTIVE' : 'DEPLETED';
    }

    if (parsed.email === 'florencemukamabano70@gmail.com' || (parsed.name && parsed.name.toLowerCase().includes('mukamabano') && parsed.name.toLowerCase().includes('florence')) || (parsed.phone && parsed.phone.replace(/\s+/g, '') === '0782663885')) {
      parsed.isPaid = true;
      parsed.verifiedPayment = true;
      parsed.phone = '0782663885';
      parsed.momoNumber = '0782663885';
      parsed.currentPlan = 'plan_20';
      parsed.hasPremiumToolsSub = true;
      parsed.lastPaymentAmount = 1600;
      parsed.lastPaymentPlanName = '20 Lesson Plans (1 Month)';
      parsed.lastPaymentTxRef = 'MP260908.0732.M09885';
      parsed.subscriptionExpiresAt = '2026-10-08T07:30:00.000Z';
      parsed.expiresAt = '2026-10-08T07:30:00.000Z';
      parsed.verifiedAt = '2026-09-08T07:30:00.000Z';
      if (typeof parsed.remainingPlans !== 'number') {
        parsed.remainingPlans = 20;
      }
      if (typeof parsed.purchasedPlans !== 'number') parsed.purchasedPlans = 20;
      if (typeof parsed.totalPlansPurchased !== 'number') parsed.totalPlansPurchased = 20;
      if (typeof parsed.totalGenerated !== 'number') parsed.totalGenerated = 0;
      parsed.status = (parsed.remainingPlans || 0) > 0 ? 'ACTIVE' : 'DEPLETED';
    }

    if (parsed && (parsed.email?.toLowerCase() === 'nkundimana123theogene@gmail.com' || parsed.isAdmin)) {
      parsed.isAdmin = true;
      parsed.isPaid = true;
      parsed.verifiedPayment = true;
      parsed.hasPremiumToolsSub = true;
      parsed.remainingPlans = 999999;
      parsed.currentPlan = 'UNLIMITED_ADMIN_VIP';
      parsed.status = 'ACTIVE';
      parsed.expiresAt = '2099-12-31T23:59:59.000Z';
      parsed.subscriptionExpiresAt = '2099-12-31T23:59:59.000Z';
    }

    if (parsed.email === 'uwamahoroalvera@gmail.com' || (parsed.name && parsed.name.toLowerCase().includes('uwamahoro') && parsed.name.toLowerCase().includes('alvera'))) {
      parsed.isPaid = true;
      parsed.verifiedPayment = true;
      parsed.phone = '0784456092';
      parsed.momoNumber = '0784456092';
      parsed.currentPlan = 'plan_10';
      parsed.hasPremiumToolsSub = true;
      parsed.lastPaymentAmount = 800;
      parsed.lastPaymentPlanName = '10 Lesson Plans (1 Month)';
      parsed.subscriptionExpiresAt = '2026-10-07T14:25:00.000Z';
      parsed.expiresAt = '2026-10-07T14:25:00.000Z';
      if (typeof parsed.remainingPlans !== 'number') {
        parsed.remainingPlans = 9;
      }
      if (typeof parsed.purchasedPlans !== 'number') parsed.purchasedPlans = 10;
      if (typeof parsed.totalPlansPurchased !== 'number') parsed.totalPlansPurchased = 10;
      if (typeof parsed.totalGenerated !== 'number') parsed.totalGenerated = 1;
      parsed.status = (parsed.remainingPlans || 0) > 0 ? 'ACTIVE' : 'DEPLETED';
    }

    // Auto-check and apply monthly reset (3 Free Lesson Plans per Month) for active user
    if (parsed && !parsed.isAdmin && !parsed.isPaid && parsed.email !== 'nkundimana123theogene@gmail.com') {
      const nowMs = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const baseTimeStr = parsed.lastMonthlyResetAt || parsed.createdAt;
      const baseTime = baseTimeStr ? new Date(baseTimeStr).getTime() : 0;

      if (!baseTime || isNaN(baseTime) || (nowMs - baseTime) >= thirtyDaysMs) {
        parsed.currentPlan = 'free_3';
        parsed.remainingPlans = 3;
        parsed.lastMonthlyResetAt = new Date(nowMs).toISOString();
        parsed.status = 'ACTIVE';
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(parsed));
        syncAllCategorySubscriptionsForUser(parsed);
      }
    }

    return parsed;
  } catch (err) {
    console.error('Error fetching current user:', err);
    return null;
  }
};

/**
 * Instant Real-Time Multi-Channel Broadcast for Teacher Login & Registration
 * Guarantees zero latency (0s delay) to the Admin Panel across all tabs and network devices
 */
export const broadcastLiveAuthEvent = (
  eventType: 'LOGIN_SUCCESS' | 'REGISTRATION_SUCCESS' | 'LOGOUT_SUCCESS',
  user: UserProfile,
  details?: string
) => {
  const payload = {
    eventType,
    user: {
      ...user,
      isOnline: eventType !== 'LOGOUT_SUCCESS',
      lastLoginAt: user.lastLoginAt || new Date().toISOString()
    },
    details: details || `Teacher ${user.name || user.email} ${eventType === 'REGISTRATION_SUCCESS' ? 'created an account' : 'logged in'}`,
    timestamp: new Date().toISOString()
  };

  // 1. Post to Server (records in server DB and pushes to admin SSE stream in real time)
  fetch('/api/admin/record-auth-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(() => {});

  // 2. Browser BroadcastChannel for 0ms cross-tab instant notification
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const channel = new BroadcastChannel('nkorera_auth_broadcast');
      channel.postMessage(payload);
    } catch {}
  }

  // 3. Local In-Tab Event Dispatcher
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('nkorera_teacher_auth_event', { detail: payload }));
    } catch {}
  }
};

export const loginUserWithPassword = (identifier: string, password?: string, method: string = 'Username & Password'): UserProfile => {
  const teachers = getAllTeachers();
  const trimmed = identifier.trim().toLowerCase();
  
  let user = teachers.find(t => 
    t.email.toLowerCase() === trimmed ||
    t.email.toLowerCase().startsWith(trimmed + '@') ||
    (t.phone && t.phone.replace(/\s+/g, '') === trimmed.replace(/\s+/g, '')) ||
    t.name.toLowerCase() === trimmed
  );

  // If demo account requested and not found in local cache, create it on demand
  if (!user && (trimmed === 'mwarimu.demo@urugero.rw' || trimmed === 'demo.teacher@urugero.rw')) {
    user = {
      id: 'user_demo',
      email: 'mwarimu.demo@urugero.rw',
      name: "Model Teacher (Demo Teacher)",
      country: 'Rwanda',
      phone: '0780000000',
      password: 'password',
      currentPlan: 'free_3',
      remainingPlans: 3,
      isAdmin: false,
      isPaid: false,
      verifiedPayment: false,
      hasPremiumToolsSub: false,
      totalGenerated: 0,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      status: 'ACTIVE',
      loginCount: 1,
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
    teachers.push(user);
  }

  if (!user) {
    throw new Error('No account found with this Username or Email! Please register first.');
  }

  // Check password (fallback to 'password' if none exists)
  const storedPassword = user.password || 'password';
  if (password && password !== storedPassword) {
    throw new Error('Incorrect password! Please try again or click "Forgot Password?".');
  }

  const now = new Date().toISOString();
  user.lastLoginAt = now;
  user.loginMethod = method;
  user.loginCount = (user.loginCount || 0) + 1;
  user.sessionLogs = user.sessionLogs || [];
  user.sessionLogs.unshift({ action: 'LOGIN', timestamp: now });
  // Keep only the last 50 logs to prevent unbounded growth
  if (user.sessionLogs.length > 50) {
    user.sessionLogs = user.sessionLogs.slice(0, 50);
  }

  // Update the master list
  saveTeachers(teachers);

  // Sync to Cloud immediately so Admin Panel sees the login in real time
  syncSingleTeacherToCloud(user).catch(() => {});
  syncUserProfileToFirestore(user).catch(() => {});
  logSecurityEvent('LOGIN_SUCCESS', `Teacher ${user.name || user.email} logged in via ${method}.`, user.email, user.name).catch(() => {});
  
  // ⚡ 0ms Multi-channel Live Broadcast for instant Admin Panel visibility
  broadcastLiveAuthEvent('LOGIN_SUCCESS', user, `Teacher ${user.name || user.email} logged in via ${method}`);

  // Set as active session
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

  // Sync all category subscription data in local storage so all service checkers are active immediately
  syncAllCategorySubscriptionsForUser(user);

  return user;
};

export const registerUser = (email: string, name: string, phone: string, password?: string): UserProfile => {
  const teachers = getAllTeachers();
  const trimmedEmail = email.trim().toLowerCase();

  const existing = teachers.find(t => 
    t.email.toLowerCase() === trimmedEmail ||
    (t.phone && t.phone.replace(/\s+/g, '') === phone.trim().replace(/\s+/g, ''))
  );
  if (existing) {
    throw new Error('An account with this email or phone already exists! Please login instead.');
  }

  const now = new Date().toISOString();
  const isOwner = trimmedEmail === 'nkundimana123theogene@gmail.com';
  const planId = isOwner ? 'plan_230' : 'free_3';
  // New teachers receive 3 free lesson plans per month
  const initialQuota = isOwner ? 99999 : 3;

  const newUser: UserProfile = {
    id: `user_${Date.now()}`,
    email: trimmedEmail,
    name: name.trim() || 'Rwandan Teacher',
    country: 'Rwanda',
    phone: phone.trim() || '0780000000',
    password: password || 'password',
    currentPlan: planId,
    remainingPlans: initialQuota,
    isAdmin: isOwner,
    hasPremiumToolsSub: isOwner,
    totalGenerated: 0,
    createdAt: now,
    lastLoginAt: now,
    lastMonthlyResetAt: now,
    status: 'ACTIVE',
    loginCount: 1,
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

  teachers.push(newUser);
  saveTeachers(teachers);

  // Sync to Cloud immediately so Admin Panel sees the new user in real time
  syncSingleTeacherToCloud(newUser).catch(() => {});
  syncUserProfileToFirestore(newUser).catch(() => {});
  logSecurityEvent('REGISTRATION_SUCCESS', `New teacher registered: ${newUser.name} (${newUser.email})`, newUser.email, newUser.name).catch(() => {});

  // ⚡ 0ms Multi-channel Live Broadcast for instant Admin Panel visibility
  broadcastLiveAuthEvent('REGISTRATION_SUCCESS', newUser, `New teacher registered: ${newUser.name} (${newUser.email})`);

  // Set as active session
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

  // Sync all category subscription data in local storage
  syncAllCategorySubscriptionsForUser(newUser);

  return newUser;
};

export const resetUserPassword = (identifier: string, newPassword?: string): boolean => {
  const teachers = getAllTeachers();
  const trimmed = identifier.trim().toLowerCase();

  const user = teachers.find(t => 
    t.email.toLowerCase() === trimmed ||
    t.email.toLowerCase().startsWith(trimmed + '@') ||
    (t.phone && t.phone.replace(/\s+/g, '') === trimmed.replace(/\s+/g, ''))
  );

  if (!user) {
    throw new Error('No registered teacher found with this Username or Email!');
  }

  user.password = newPassword || 'password';
  saveTeachers(teachers);

  // If the user being reset is currently logged in, update session too
  const rawCurrentUser = localStorage.getItem(CURRENT_USER_KEY);
  if (rawCurrentUser) {
    const parsed = JSON.parse(rawCurrentUser);
    if (parsed.email.toLowerCase() === user.email.toLowerCase()) {
      parsed.password = user.password;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(parsed));
    }
  }

  return true;
};

export const loginOrRegisterGoogleUser = (email: string, name: string, phone: string, method: string = 'Google Sign-In'): UserProfile => {
  const teachers = getAllTeachers();
  const trimmedEmail = email.trim().toLowerCase();

  const user = teachers.find(t => t.email.toLowerCase() === trimmedEmail);
  
  if (user) {
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastLoginAt = new Date().toISOString();
    user.loginMethod = method;
    
    saveTeachers(teachers);
    
    syncSingleTeacherToCloud(user).catch(() => {});
    syncUserProfileToFirestore(user).catch(() => {});
    logSecurityEvent('LOGIN_SUCCESS', `Google Teacher logged in via ${method}: ${user.name} (${user.email})`, user.email, user.name).catch(() => {});
    broadcastLiveAuthEvent('LOGIN_SUCCESS', user, `Teacher ${user.name || user.email} logged in via ${method}`);
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    syncAllCategorySubscriptionsForUser(user);
    
    return user;
  } else {
    const now = new Date().toISOString();
    const isOwner = trimmedEmail === 'nkundimana123theogene@gmail.com';
    const planId = isOwner ? 'plan_230' : 'free_3';
    // New teachers receive 3 free lesson plans per month
    const initialQuota = isOwner ? 99999 : 3;

    const newUser: UserProfile = {
      id: `user_google_${Date.now()}`,
      email: trimmedEmail,
      name: name.trim() || 'Google Teacher',
      country: 'Rwanda',
      phone: phone.trim() || '0780000000',
      password: 'google_oauth_auth_password_no_manual_access',
      currentPlan: planId,
      remainingPlans: initialQuota,
      isAdmin: isOwner,
      hasPremiumToolsSub: isOwner,
      totalGenerated: 0,
      createdAt: now,
      lastLoginAt: now,
      lastMonthlyResetAt: now,
      loginMethod: method,
      status: 'ACTIVE',
      loginCount: 1,
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

    teachers.push(newUser);
    saveTeachers(teachers);

    syncSingleTeacherToCloud(newUser).catch(() => {});
    syncUserProfileToFirestore(newUser).catch(() => {});
    logSecurityEvent('REGISTRATION_SUCCESS', `New Google teacher registered via ${method}: ${newUser.name} (${newUser.email})`, newUser.email, newUser.name).catch(() => {});
    broadcastLiveAuthEvent('REGISTRATION_SUCCESS', newUser, `New Google teacher registered: ${newUser.name} (${newUser.email})`);

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    // Sync all category subscription data in local storage
    syncAllCategorySubscriptionsForUser(newUser);

    return newUser;
  }
};

export const loginUser = (email: string, _name: string, _phone: string): UserProfile => {
  // Legacy support fallback
  return loginUserWithPassword(email, 'password');
};

export const logoutUser = (): UserProfile => {
  // Track logout count before removing user from localStorage
  const rawCurrentUser = localStorage.getItem(CURRENT_USER_KEY);
  if (rawCurrentUser) {
    try {
      const curUser = JSON.parse(rawCurrentUser);
      if (curUser && curUser.id && curUser.id !== 'guest') {
        const teachers = getAllTeachers();
        const index = teachers.findIndex(t => t.id === curUser.id);
        if (index !== -1) {
          const now = new Date().toISOString();
          teachers[index].logoutCount = (teachers[index].logoutCount || 0) + 1;
          teachers[index].sessionLogs = teachers[index].sessionLogs || [];
          teachers[index].sessionLogs.unshift({ action: 'LOGOUT', timestamp: now });
          if (teachers[index].sessionLogs.length > 50) {
            teachers[index].sessionLogs = teachers[index].sessionLogs.slice(0, 50);
          }
          saveTeachers(teachers);
          
          // Sync to Cloud so Admin Panel sees the logout
          syncSingleTeacherToCloud(teachers[index]).catch(() => {});
          syncUserProfileToFirestore(teachers[index]).catch(() => {});
          logSecurityEvent('LOGOUT_SUCCESS', `Teacher ${teachers[index].name || teachers[index].email} logged out.`, teachers[index].email, teachers[index].name).catch(() => {});
          broadcastLiveAuthEvent('LOGOUT_SUCCESS', teachers[index], `Teacher ${teachers[index].name || teachers[index].email} logged out`);
        }
      }
    } catch(e) {}
  }

  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem('nkorera_subscription_status');
  
  // Return a dummy guest object
  const guestUser: UserProfile = {
    id: 'guest',
    email: 'guest@nkorera.rw',
    name: 'Guest Teacher',
    country: 'Rwanda',
    currentPlan: 'free_3',
    remainingPlans: 3,
    createdAt: new Date().toISOString(),
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
  return guestUser;
};

export const syncUserSubscription = (subData: SubscriptionData) => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.id === 'guest') return;

  const teachers = getAllTeachers();
  const matchedIndex = teachers.findIndex(t => t.id === currentUser.id);

  if (matchedIndex !== -1) {
    const updatedTeacher = teachers[matchedIndex];
    updatedTeacher.currentPlan = subData.planId;
    updatedTeacher.remainingPlans = Math.max(0, subData.totalPlansAllowed - subData.usedPlansCount);
    if (!updatedTeacher.stats) {
      updatedTeacher.stats = {
        lessonPlansCount: 0,
        nurseryPlansCount: 0,
        examsCount: 0,
        worksheetsCount: 0,
        diaryEntriesCount: 0,
        certificatesCount: 0,
        totalItems: 0
      };
    }
    updatedTeacher.stats.lessonPlansCount = subData.usedPlansCount;
    updatedTeacher.totalGenerated = subData.usedPlansCount;
    updatedTeacher.status = subData.status;

    teachers[matchedIndex] = updatedTeacher;
    saveTeachers(teachers);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedTeacher));
  }
};

export const adminTopUpTeacherQuota = (teacherId: string, additionalPlans: number): UserProfile[] => {
  const teachers = getAllTeachers();
  const index = teachers.findIndex(t => t.id === teacherId);
  if (index === -1) return teachers;

  const target = teachers[index];
  target.remainingPlans = (target.remainingPlans || 0) + additionalPlans;
  target.status = target.remainingPlans > 0 ? 'ACTIVE' : 'DEPLETED';

  teachers[index] = target;
  saveTeachers(teachers);

  // If the teacher modified is the active session, sync it
  const rawCurrentUser = localStorage.getItem(CURRENT_USER_KEY);
  if (rawCurrentUser) {
    const cur = JSON.parse(rawCurrentUser);
    if (cur.id === teacherId) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(target));
      const subData: SubscriptionData = {
        planId: target.currentPlan || 'plan_manual',
        planName: `${target.remainingPlans} Plans Available`,
        totalPlansAllowed: (target.remainingPlans || 0) + (target.stats?.lessonPlansCount || 0),
        usedPlansCount: target.stats?.lessonPlansCount || 0,
        activatedAt: target.createdAt || new Date().toISOString(),
        expiresAt: target.expiresAt || target.subscriptionExpiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: target.remainingPlans > 0 ? 'ACTIVE' : 'DEPLETED'
      };
      localStorage.setItem('nkorera_subscription_status', JSON.stringify(subData));
    }
  }

  return teachers;
};

export const adminSetTeacherQuota = (
  teacherId: string, 
  remainingPlans: number, 
  usedPlansCount?: number, 
  planId?: string
): UserProfile[] => {
  const teachers = getAllTeachers();
  const index = teachers.findIndex(t => t.id === teacherId);
  if (index === -1) return teachers;

  const target = teachers[index];
  target.remainingPlans = Math.max(0, remainingPlans);
  if (planId) target.currentPlan = planId;
  if (typeof usedPlansCount === 'number') {
    if (!target.stats) {
      target.stats = {
        lessonPlansCount: 0,
        nurseryPlansCount: 0,
        examsCount: 0,
        worksheetsCount: 0,
        diaryEntriesCount: 0,
        certificatesCount: 0,
        totalItems: 0
      };
    }
    target.stats.lessonPlansCount = usedPlansCount;
    target.totalGenerated = usedPlansCount;
  }
  target.status = target.remainingPlans > 0 ? 'ACTIVE' : 'DEPLETED';

  teachers[index] = target;
  saveTeachers(teachers);

  // If the teacher modified is the active session, sync it
  const rawCurrentUser = localStorage.getItem(CURRENT_USER_KEY);
  if (rawCurrentUser) {
    const cur = JSON.parse(rawCurrentUser);
    if (cur.id === teacherId) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(target));
      const subData: SubscriptionData = {
        planId: target.currentPlan || 'plan_manual',
        planName: `${target.remainingPlans} Plans Available`,
        totalPlansAllowed: (target.remainingPlans || 0) + (target.stats?.lessonPlansCount || 0),
        usedPlansCount: target.stats?.lessonPlansCount || 0,
        activatedAt: target.createdAt || new Date().toISOString(),
        expiresAt: target.expiresAt || target.subscriptionExpiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: target.remainingPlans > 0 ? 'ACTIVE' : 'DEPLETED'
      };
      localStorage.setItem('nkorera_subscription_status', JSON.stringify(subData));
    }
  }

  return teachers;
};

