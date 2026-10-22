import { syncUserProfileToFirestore, logSecurityEvent, savePaymentToFirestore, db, doc, setDoc } from './firebase';
import { syncSingleTeacherToCloud } from './autoSync';
import { AiBillingRecord } from '../types';
export type { AiBillingRecord };

export interface SubscriptionPlan {
  id: string;
  name: string;
  plansCount: number;
  priceFrw: number;
  badge?: string;
  isPopular?: boolean;
  durationDays?: number;
}

/**
 * Checks if a user has monthly free lesson plans access (3 free lesson plans per month).
 * Every teacher account is entitled to 3 free lesson plans per month.
 */
export const isUserInFreeTrialWindow = (user: any): boolean => {
  if (!user || user.id === 'guest') return false;
  // Free tier grants 3 free lesson plans per month to all teachers
  return true;
};

export const syncActivatedUserToCloud = (
  serviceKey: 'cbc' | 'remedial' | 'nursery' | 'scheme' | 'ai' | 'student_id' | 'worksheet' | 'certificate' | 'exam' | 'diary' | string,
  planId: string,
  plansOrCreditsCount: number,
  priceFrw: number,
  momoNumber?: string,
  customTransactionRef?: string,
  customPaymentMethod?: string,
  receiptScreenshot?: string,
  customBuyerName?: string,
  customBuyerEmail?: string
) => {
  try {
    let user: any = null;
    const rawUser = localStorage.getItem('nkorera_current_user');
    if (rawUser) {
      try {
        user = JSON.parse(rawUser);
      } catch (e) {}
    }

    const cleanPhone = (momoNumber || user?.phone || user?.momoNumber || '').trim();
    const effectiveName = (customBuyerName || (user?.name !== 'Teacher' ? user?.name : '') || user?.displayName || 'Paid Teacher').trim();
    const rawEmail = (customBuyerEmail || (user?.email !== 'teacher@nkorera.rw' ? user?.email : '') || '').toLowerCase().trim();
    const effectiveEmail = rawEmail && rawEmail !== 'teacher@nkorera.rw'
      ? rawEmail
      : (cleanPhone ? `${cleanPhone.replace(/[^0-9]/g, '')}@teacher.nkorera.rw` : 'teacher@nkorera.rw');

    if (!user) {
      user = {
        id: 'usr_' + (cleanPhone ? cleanPhone.replace(/[^0-9]/g, '') : Date.now()),
        name: effectiveName,
        email: effectiveEmail,
        phone: cleanPhone || '0781339530',
        momoNumber: cleanPhone || '0781339530',
        role: 'TEACHER',
        createdAt: new Date().toISOString()
      };
    } else {
      user.name = effectiveName || user.name;
      user.email = effectiveEmail || user.email;
      if (cleanPhone) {
        user.phone = cleanPhone;
        user.momoNumber = cleanPhone;
      }
    }

    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days validity
    const assignedTxRef = customTransactionRef && customTransactionRef.trim().length > 2 
      ? customTransactionRef.trim().toUpperCase() 
      : `MTN-${Math.floor(100000000 + Math.random() * 900000000)}`;

    const paymentMethodFinal = customPaymentMethod || (cleanPhone.startsWith('072') || cleanPhone.startsWith('073') ? 'Airtel Money' : 'MTN Mobile Money');

    user.currentPlan = planId;
    user.remainingPlans = (user.remainingPlans || 0) + plansOrCreditsCount;
    user.totalPlansPurchased = (user.totalPlansPurchased || 0) + plansOrCreditsCount;
    user.purchasedPlans = (user.purchasedPlans || 0) + plansOrCreditsCount;
    user.status = 'ACTIVE';
    user.isPaid = true;
    user.verifiedPayment = true;
    user.verifiedAt = now.toISOString();
    user.lastPaymentAmount = priceFrw;
    user.lastPaymentDate = now.toISOString();
    user.lastPaymentPlanName = `${serviceKey.toUpperCase()} Package (${plansOrCreditsCount} Plans)`;
    user.lastPaymentTxRef = assignedTxRef;
    user.expiresAt = expires.toISOString();
    user.subscriptionExpiresAt = expires.toISOString();
    if (cleanPhone) user.momoNumber = cleanPhone;

    if (!Array.isArray(user.verifiedServices)) user.verifiedServices = [];
    if (!user.verifiedServices.includes(serviceKey)) {
      user.verifiedServices.push(serviceKey);
    }

    // Save updated current user to localStorage
    localStorage.setItem('nkorera_current_user', JSON.stringify(user));

    // Update master teacher list in localStorage
    const rawList = localStorage.getItem('nkorera_teachers_list');
    let list: any[] = rawList ? JSON.parse(rawList) : [];
    const idx = list.findIndex((t: any) => 
      (t.id && t.id === user.id) || 
      (t.email && t.email.toLowerCase() === user.email.toLowerCase()) ||
      (cleanPhone && t.phone && t.phone.replace(/[^0-9]/g, '') === cleanPhone.replace(/[^0-9]/g, ''))
    );
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...user };
    } else {
      list.unshift(user);
    }
    localStorage.setItem('nkorera_teachers_list', JSON.stringify(list));

    // Push to Firestore live so Admin Panel sees green tick ("imuvivura") immediately!
    syncUserProfileToFirestore(user).catch(() => {});
    syncSingleTeacherToCloud(user).catch(() => {});

    // Sync to server database
    fetch('/api/admin/sync-teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teachers: [user] })
    }).catch(() => {});

    // Record payment in Firestore
    const paymentRecord: AiBillingRecord = {
      id: `bill_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      transactionRef: assignedTxRef,
      date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      planId,
      planName: `${serviceKey.toUpperCase()} Package (${plansOrCreditsCount} Plans/Credits)`,
      amountRwf: priceFrw,
      amount: priceFrw,
      credits: plansOrCreditsCount,
      plansGranted: plansOrCreditsCount,
      plansPurchased: plansOrCreditsCount,
      paymentMethod: paymentMethodFinal,
      method: paymentMethodFinal,
      phoneNumber: cleanPhone || '0781339530',
      phone: cleanPhone || '0781339530',
      status: 'Paid',
      userEmail: user.email,
      teacherEmail: user.email,
      userName: user.name || effectiveName,
      teacherName: user.name || effectiveName,
      expiresAt: expires.toISOString(),
      expiryDate: expires.toISOString(),
      usedPlans: user.stats?.lessonPlansCount || user.totalGenerated || 0,
      remainingPlans: user.remainingPlans,
      transactionProof: assignedTxRef,
      receiptScreenshot: receiptScreenshot || undefined,
      screenshotUrl: receiptScreenshot || undefined,
      createdAt: now.toISOString()
    };
    savePaymentToFirestore(paymentRecord, user.email).catch(() => {});

    logSecurityEvent(
      'PAYMENT_VERIFIED_SERVICE_UNLOCKED',
      `Payment verified & service unlocked for ${user.email}: ${serviceKey.toUpperCase()} (${plansOrCreditsCount} plans/credits, ${priceFrw} RWF) via ${paymentMethodFinal} (Ref: ${assignedTxRef})`,
      user.email,
      user.name
    ).catch(() => {});

    // Dispatch custom update event for immediate UI refresh across all open modals
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nkorera_user_updated', { detail: user }));
      window.dispatchEvent(new CustomEvent('nkorera_payment_recorded', { detail: paymentRecord }));
    }
    return user;
  } catch (err) {
    console.error('Error in syncActivatedUserToCloud:', err);
  }
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: 'free_3', name: '3 Free Lesson Plans per Month', plansCount: 3, priceFrw: 0, badge: 'Free Tier', durationDays: 30 },
  { id: 'plan_10', name: '10 Lesson Plans', plansCount: 10, priceFrw: 800 },
  { id: 'plan_20', name: '20 Lesson Plans', plansCount: 20, priceFrw: 1600 },
  { id: 'plan_30', name: '30 Lesson Plans', plansCount: 30, priceFrw: 2200, isPopular: true },
  { id: 'plan_40', name: '40 Lesson Plans', plansCount: 40, priceFrw: 3200 },
  { id: 'plan_60', name: '60 Lesson Plans', plansCount: 60, priceFrw: 4200, isPopular: true },
  { id: 'plan_80', name: '80 Lesson Plans', plansCount: 80, priceFrw: 5200 },
  { id: 'plan_100', name: '100 Lesson Plans', plansCount: 100, priceFrw: 6100, isPopular: true },
  { id: 'plan_150', name: '150 Lesson Plans', plansCount: 150, priceFrw: 7100 },
  { id: 'plan_230', name: '230 Lesson Plans', plansCount: 230, priceFrw: 8200, badge: 'Best Value' }
];

// Exact 10 Nursery Lesson Plan Subscription Packages as requested
export const NURSERY_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: 'nursery_free_3', name: '3 Free Lesson Plans per Month', plansCount: 3, priceFrw: 0, badge: 'Free Tier', durationDays: 30 },
  { id: 'nursery_plan_10', name: '10 lesson plans for 800 frw per month', plansCount: 10, priceFrw: 800 },
  { id: 'nursery_plan_20', name: '20 lesson plans for 1600 frw per month', plansCount: 20, priceFrw: 1600 },
  { id: 'nursery_plan_30', name: '30 lesson plans for 2200 frw per month', plansCount: 30, priceFrw: 2200, isPopular: true },
  { id: 'nursery_plan_40', name: '40 lesson plans for 3200 frw per month', plansCount: 40, priceFrw: 3200 },
  { id: 'nursery_plan_60', name: '60 lesson plans for 4200 frw per month', plansCount: 60, priceFrw: 4200, isPopular: true },
  { id: 'nursery_plan_80', name: '80 lesson plans for 5200 frw per month', plansCount: 80, priceFrw: 5200 },
  { id: 'nursery_plan_100', name: '100 lesson plans for 6100 frw per month', plansCount: 100, priceFrw: 6100, isPopular: true },
  { id: 'nursery_plan_150', name: '150 lesson plans for 7100 frw per month', plansCount: 150, priceFrw: 7100 },
  { id: 'nursery_plan_230', name: '230 lesson plans for 8200 frw per month', plansCount: 230, priceFrw: 8200, badge: 'Best Value' }
];

export interface CategorizedPlanGroup {
  categoryName: string;
  plans: { id: string; name: string; quota: number; price: number; badge?: string }[];
}

export const ALL_AVAILABLE_PLANS_CATEGORIZED: CategorizedPlanGroup[] = [
  {
    categoryName: '📘 CBC Primary & Secondary Lesson Plans',
    plans: [
      { id: 'free_3', name: '3 Free Lesson Plans / Month', quota: 3, price: 0, badge: 'Free' },
      { id: 'plan_10', name: '10 CBC Lesson Plans (800 RWF)', quota: 10, price: 800 },
      { id: 'plan_20', name: '20 CBC Lesson Plans (1,600 RWF)', quota: 20, price: 1600 },
      { id: 'plan_30', name: '30 CBC Lesson Plans (2,200 RWF)', quota: 30, price: 2200, badge: 'Popular' },
      { id: 'plan_40', name: '40 CBC Lesson Plans (3,200 RWF)', quota: 40, price: 3200 },
      { id: 'plan_60', name: '60 CBC Lesson Plans (4,200 RWF)', quota: 60, price: 4200, badge: 'Popular' },
      { id: 'plan_80', name: '80 CBC Lesson Plans (5,200 RWF)', quota: 80, price: 5200 },
      { id: 'plan_100', name: '100 CBC Lesson Plans (6,100 RWF)', quota: 100, price: 6100 },
      { id: 'plan_150', name: '150 CBC Lesson Plans (7,100 RWF)', quota: 150, price: 7100 },
      { id: 'plan_230', name: '230 CBC Lesson Plans (8,200 RWF)', quota: 230, price: 8200, badge: 'Best Value' },
      { id: 'plan_unlimited', name: 'VIP Unlimited Monthly Access', quota: 999, price: 10000, badge: 'VIP' }
    ]
  },
  {
    categoryName: '👶 Nursery & Early Childhood Plans',
    plans: [
      { id: 'nursery_free_3', name: '3 Free Nursery Plans / Month', quota: 3, price: 0, badge: 'Free' },
      { id: 'nursery_plan_10', name: '10 Nursery Plans (800 RWF)', quota: 10, price: 800 },
      { id: 'nursery_plan_20', name: '20 Nursery Plans (1,600 RWF)', quota: 20, price: 1600 },
      { id: 'nursery_plan_30', name: '30 Nursery Plans (2,200 RWF)', quota: 30, price: 2200, badge: 'Popular' },
      { id: 'nursery_plan_40', name: '40 Nursery Plans (3,200 RWF)', quota: 40, price: 3200 },
      { id: 'nursery_plan_60', name: '60 Nursery Plans (4,200 RWF)', quota: 60, price: 4200 },
      { id: 'nursery_plan_80', name: '80 Nursery Plans (5,200 RWF)', quota: 80, price: 5200 },
      { id: 'nursery_plan_100', name: '100 Nursery Plans (6,100 RWF)', quota: 100, price: 6100 },
      { id: 'nursery_plan_150', name: '150 Nursery Plans (7,100 RWF)', quota: 150, price: 7100 },
      { id: 'nursery_plan_230', name: '230 Nursery Plans (8,200 RWF)', quota: 230, price: 8200, badge: 'Best Value' }
    ]
  },
  {
    categoryName: '🆘 Remedial Lesson Plans',
    plans: [
      { id: 'rem_free_3', name: '3 Free Remedial Plans / Month', quota: 3, price: 0, badge: 'Free' },
      { id: 'rem_plan_10', name: '10 Remedial Plans (800 RWF)', quota: 10, price: 800 },
      { id: 'rem_plan_25', name: '25 Remedial Plans (2,000 RWF)', quota: 25, price: 2000, badge: 'Popular' },
      { id: 'rem_plan_40', name: '40 Remedial Plans (3,200 RWF)', quota: 40, price: 3200 },
      { id: 'rem_plan_50', name: '50 Remedial Plans (4,000 RWF)', quota: 50, price: 4000 },
      { id: 'rem_plan_120', name: '120 Remedial Plans (8,800 RWF)', quota: 120, price: 8800, badge: 'Best Value' }
    ]
  },
  {
    categoryName: '📑 Schemes of Work Plans',
    plans: [
      { id: 'scheme_free_1', name: '1 Free Scheme of Work / Month', quota: 1, price: 0, badge: 'Free' },
      { id: 'scheme_plan_3', name: '3 Schemes of Work (2,500 RWF)', quota: 3, price: 2500 },
      { id: 'scheme_plan_5', name: '5 Schemes of Work (3,500 RWF)', quota: 5, price: 3500, badge: 'Popular' },
      { id: 'scheme_plan_7', name: '7 Schemes of Work Annual (4,500 RWF)', quota: 7, price: 4500, badge: 'Annual' },
      { id: 'scheme_plan_10', name: '10 Schemes of Work (6,000 RWF)', quota: 10, price: 6000 },
      { id: 'scheme_plan_25', name: '25 Schemes of Work Termly (8,500 RWF)', quota: 25, price: 8500, badge: 'Termly' }
    ]
  },
  {
    categoryName: '✨ AI Content Generation Credits',
    plans: [
      { id: 'free_tier', name: '2 Free AI Credits / Month', quota: 2, price: 0, badge: 'Free' },
      { id: 'starter_plan', name: 'Starter AI Credits (1,500 RWF / Month)', quota: 15, price: 1500 },
      { id: 'basic_plan', name: 'Basic AI Credits (3,000 RWF / Month)', quota: 35, price: 3000 },
      { id: 'standard_plan', name: 'Standard AI Credits (6,000 RWF / Month)', quota: 80, price: 6000, badge: 'Popular' },
      { id: 'premium_plan', name: 'Premium AI Credits (12,000 RWF / Month)', quota: 200, price: 12000, badge: 'Pro' }
    ]
  },
  {
    categoryName: '🪪 School Identification of Students Form',
    plans: [
      { id: 'id_free_2', name: '2 Free Student ID Forms / Month', quota: 2, price: 0, badge: 'Free' },
      { id: 'id_plan_20', name: '20 Student ID Forms (1,000 RWF)', quota: 20, price: 1000 },
      { id: 'id_plan_50', name: '50 Student ID Forms (2,200 RWF)', quota: 50, price: 2200, badge: 'Popular' },
      { id: 'id_plan_100', name: '100 Student ID Forms (4,000 RWF)', quota: 100, price: 4000 },
      { id: 'id_plan_250', name: '250 Student ID Forms (8,500 RWF)', quota: 250, price: 8500 },
      { id: 'id_plan_500', name: '500 Student ID Forms (15,000 RWF)', quota: 500, price: 15000, badge: 'Best Value' }
    ]
  },
  {
    categoryName: '📄 Printable Worksheets & Exercises',
    plans: [
      { id: 'ws_free_3', name: '3 Free Printable Worksheets / Month', quota: 3, price: 0, badge: 'Free' },
      { id: 'ws_plan_10', name: '10 Printable Worksheets (800 RWF)', quota: 10, price: 800 },
      { id: 'ws_plan_25', name: '25 Printable Worksheets (1,800 RWF)', quota: 25, price: 1800, badge: 'Popular' },
      { id: 'ws_plan_50', name: '50 Printable Worksheets (3,200 RWF)', quota: 50, price: 3200 },
      { id: 'ws_plan_100', name: '100 Printable Worksheets (5,800 RWF)', quota: 100, price: 5800, badge: 'Best Value' }
    ]
  },
  {
    categoryName: '📜 AI Certificate Generator',
    plans: [
      { id: 'cert_free_1', name: '1 Free AI Certificate / Month', quota: 1, price: 0, badge: 'Free' },
      { id: 'cert_plan_5', name: '5 AI Certificates (1,500 RWF)', quota: 5, price: 1500 },
      { id: 'cert_plan_15', name: '15 AI Certificates (3,500 RWF)', quota: 15, price: 3500, badge: 'Popular' },
      { id: 'cert_plan_30', name: '30 AI Certificates (6,000 RWF)', quota: 30, price: 6000 },
      { id: 'cert_plan_100', name: '100 AI Certificates (12,000 RWF)', quota: 100, price: 12000, badge: 'Best Value' }
    ]
  },
  {
    categoryName: '📝 Exams & Assessment Tests',
    plans: [
      { id: 'exam_free_2', name: '2 Free Assessment Exams / Month', quota: 2, price: 0, badge: 'Free' },
      { id: 'exam_plan_10', name: '10 Exams & Tests (1,200 RWF)', quota: 10, price: 1200 },
      { id: 'exam_plan_25', name: '25 Exams & Tests (2,800 RWF)', quota: 25, price: 2800, badge: 'Popular' },
      { id: 'exam_plan_50', name: '50 Exams & Tests (5,000 RWF)', quota: 50, price: 5000, badge: 'Best Value' }
    ]
  },
  {
    categoryName: '📔 Classroom Diary & Attendance Registers',
    plans: [
      { id: 'diary_free_1', name: '1 Term Classroom Diary (0 RWF)', quota: 1, price: 0, badge: 'Free' },
      { id: 'diary_annual', name: 'Full Annual Classroom Diary & Register (3,000 RWF)', quota: 12, price: 3000, badge: 'Annual' }
    ]
  }
];

export interface SubscriptionData {
  planId: string;
  planName: string;
  totalPlansAllowed: number;
  usedPlansCount: number;
  activatedAt: string; // ISO String
  expiresAt: string;   // ISO String (30 days from activatedAt)
  momoNumber?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'DEPLETED';
}

const STORAGE_KEY = 'nkorera_subscription_status';

/**
 * Checks and automatically resets monthly free lesson plans (3 free lesson plans per month)
 * for teachers on the free tier.
 */
export const checkAndApplyMonthlyFreePlansReset = (user: any): { user: any; didReset: boolean } => {
  if (!user || user.id === 'guest') return { user, didReset: false };
  if (user.isAdmin || (user.email && user.email.toLowerCase() === 'nkundimana123theogene@gmail.com')) {
    return { user, didReset: false };
  }
  // Only apply to free tier users (not paid)
  if (user.isPaid) return { user, didReset: false };

  const nowMs = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const baseTimeStr = user.lastMonthlyResetAt || user.createdAt;
  const baseTime = baseTimeStr ? new Date(baseTimeStr).getTime() : 0;

  // If no base time or 30 days have elapsed since last reset/creation:
  if (!baseTime || isNaN(baseTime) || (nowMs - baseTime) >= thirtyDaysMs) {
    user.remainingPlans = 3;
    user.currentPlan = 'free_3';
    user.lastMonthlyResetAt = new Date(nowMs).toISOString();
    user.status = 'ACTIVE';
    return { user, didReset: true };
  }

  return { user, didReset: false };
};

// Default initial subscription state (3 Free Lesson Plans per Month)
export const getDefaultSubscription = (): SubscriptionData => {
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
  return {
    planId: 'free_3',
    planName: '3 Free Lesson Plans per Month',
    totalPlansAllowed: 3,
    usedPlansCount: 0,
    activatedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    status: 'ACTIVE'
  };
};

export const syncAllCategorySubscriptionsForUser = (user: any) => {
  if (!user) return;
  const isOwner = user.isAdmin || (user.email && user.email.toLowerCase() === 'nkundimana123theogene@gmail.com');
  const userPlans = typeof user.remainingPlans === 'number' ? user.remainingPlans : 0;
  const rem = isOwner ? 99999 : Math.max(0, userPlans);
  const now = new Date().toISOString();
  const expiresAt = user.subscriptionExpiresAt || user.expiresAt || (user.lastMonthlyResetAt
    ? new Date(new Date(user.lastMonthlyResetAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
    : (user.createdAt
      ? new Date(new Date(user.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()));
  const status = (isOwner || rem > 0) ? 'ACTIVE' : 'DEPLETED';

  // 1. CBC Lesson Plans
  const cbcSub: SubscriptionData = {
    planId: isOwner ? 'plan_230' : (user.isPaid ? (user.currentPlan || 'plan_10') : 'free_3'),
    planName: isOwner
      ? 'VIP Owner Access (Unlimited)'
      : (user.isPaid
          ? `${rem} CBC Lesson Plans Available`
          : `${rem} Free Lesson Plans (3 per Month)`),
    totalPlansAllowed: isOwner ? 99999 : (user.isPaid ? rem + (user.stats?.lessonPlansCount || 0) : 3),
    usedPlansCount: isOwner ? 0 : (user.isPaid ? user.stats?.lessonPlansCount || 0 : Math.max(0, 3 - rem)),
    activatedAt: user.createdAt || now,
    expiresAt,
    status
  };
  localStorage.setItem('nkorera_subscription_status', JSON.stringify(cbcSub));

  // 2. Nursery Plans
  const nurserySub: SubscriptionData = {
    planId: isOwner ? 'plan_230' : (user.isPaid ? (user.currentPlan?.startsWith('nursery') ? user.currentPlan : 'nursery_plan_auto') : 'nursery_free_3'),
    planName: isOwner
      ? 'VIP Owner Access'
      : (user.isPaid
          ? `${rem} Nursery Plans Available`
          : `${rem} Free Nursery Plans (3 per Month)`),
    totalPlansAllowed: isOwner ? 99999 : (user.isPaid ? rem + (user.stats?.nurseryPlansCount || 0) : 3),
    usedPlansCount: isOwner ? 0 : (user.isPaid ? user.stats?.nurseryPlansCount || 0 : Math.max(0, 3 - rem)),
    activatedAt: user.createdAt || now,
    expiresAt,
    status
  };
  localStorage.setItem('nkorera_nursery_subscription_status', JSON.stringify(nurserySub));

  // 3. Remedial Plans
  const remedialSub: SubscriptionData = {
    planId: isOwner ? 'plan_230' : (user.isPaid ? (user.currentPlan?.startsWith('rem') ? user.currentPlan : 'rem_plan_auto') : 'rem_free_3'),
    planName: isOwner
      ? 'VIP Owner Access'
      : (user.isPaid
          ? `${rem} Remedial Plans Available`
          : `${rem} Free Remedial Plans (3 per Month)`),
    totalPlansAllowed: isOwner ? 99999 : (user.isPaid ? rem : 3),
    usedPlansCount: isOwner ? 0 : (user.isPaid ? 0 : Math.max(0, 3 - rem)),
    activatedAt: user.createdAt || now,
    expiresAt,
    status
  };
  localStorage.setItem('nkorera_remedial_subscription_status', JSON.stringify(remedialSub));

  // 4. Scheme of Work Plans
  const schemeSub: SubscriptionData = {
    planId: isOwner ? 'plan_230' : (user.currentPlan?.startsWith('scheme') ? user.currentPlan : 'scheme_plan_auto'),
    planName: isOwner ? 'VIP Owner Access' : `${rem} Schemes of Work Available`,
    totalPlansAllowed: isOwner ? 99999 : rem,
    usedPlansCount: 0,
    activatedAt: user.createdAt || now,
    expiresAt,
    status
  };
  localStorage.setItem('nkorera_scheme_subscription_status', JSON.stringify(schemeSub));

  // 5. AI Credits
  const aiSub = {
    planId: isOwner ? 'plan_unlimited' : (user.currentPlan?.includes('ai') ? user.currentPlan : 'standard_plan'),
    planName: isOwner ? 'VIP Unlimited AI Credits' : `${rem} AI Generation Credits`,
    totalCreditsAllowed: isOwner ? 99999 : rem,
    usedCreditsCount: 0,
    activatedAt: user.createdAt || now,
    expiresAt,
    status: (isOwner || rem > 0) ? 'ACTIVE' : 'DEPLETED'
  };
  localStorage.setItem('nkorera_ai_credit_status', JSON.stringify(aiSub));
};

export const getSubscriptionStatus = (): SubscriptionData => {
  try {
    // Check current logged-in user in localStorage
    const rawCurrentUser = localStorage.getItem('nkorera_current_user');
    if (rawCurrentUser) {
      let user = JSON.parse(rawCurrentUser);
      if (user) {
        if (user.isAdmin || (user.email && user.email.toLowerCase() === 'nkundimana123theogene@gmail.com')) {
          return {
            planId: 'plan_230',
            planName: 'VIP Owner Access (Unlimited)',
            totalPlansAllowed: 99999,
            usedPlansCount: user.stats?.lessonPlansCount || 0,
            activatedAt: user.createdAt || new Date().toISOString(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'ACTIVE'
          };
        }

        const resetResult = checkAndApplyMonthlyFreePlansReset(user);
        if (resetResult.didReset) {
          user = resetResult.user;
          localStorage.setItem('nkorera_current_user', JSON.stringify(user));
          syncAllCategorySubscriptionsForUser(user);
        }

        if (typeof user.remainingPlans === 'number') {
          const used = user.stats?.lessonPlansCount || user.totalGenerated || 0;
          const rem = Math.max(0, user.remainingPlans);
          const total = user.isPaid ? rem + used : 3;
          const status = rem > 0 ? 'ACTIVE' : 'DEPLETED';
          const planTitle = user.isPaid
            ? `${rem} Lesson Plans Available`
            : `${rem} Free Lesson Plans (3 per Month)`;
          return {
            planId: user.currentPlan || 'free_3',
            planName: planTitle,
            totalPlansAllowed: total,
            usedPlansCount: user.isPaid ? used : Math.max(0, 3 - rem),
            activatedAt: user.createdAt || new Date().toISOString(),
            expiresAt: user.subscriptionExpiresAt || user.expiresAt || (user.lastMonthlyResetAt
              ? new Date(new Date(user.lastMonthlyResetAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
              : (user.createdAt
                ? new Date(new Date(user.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())),
            status
          };
        }
      }
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultSubscription();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }

    const data: SubscriptionData = JSON.parse(raw);
    const now = new Date();
    const expiry = new Date(data.expiresAt);

    let updated = false;

    // Check time expiration (30 days)
    const remaining = Math.max(0, data.totalPlansAllowed - data.usedPlansCount);
    if (now > expiry) {
      if (data.planId === 'free_3' || data.planId === 'free_trial_30d' || data.planId === 'no_subscription' || data.totalPlansAllowed <= 3) {
        // Auto-renew 3 free lesson plans for the new month!
        data.planId = 'free_3';
        data.planName = '3 Free Lesson Plans per Month';
        data.totalPlansAllowed = 3;
        data.usedPlansCount = 0;
        data.expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        data.status = 'ACTIVE';
        updated = true;
      } else if (remaining > 0) {
        data.expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        data.status = 'ACTIVE';
        updated = true;
      } else {
        // Expired paid plan falls back to 3 Free Lesson Plans for the new month!
        data.planId = 'free_3';
        data.planName = '3 Free Lesson Plans per Month';
        data.totalPlansAllowed = 3;
        data.usedPlansCount = 0;
        data.expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        data.status = 'ACTIVE';
        updated = true;
      }
    } else {
      if (remaining <= 0 && data.status !== 'DEPLETED') {
        data.status = 'DEPLETED';
        updated = true;
      } else if (remaining > 0 && data.status !== 'ACTIVE') {
        data.status = 'ACTIVE';
        updated = true;
      }
    }

    if (updated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    return data;
  } catch (err) {
    console.error('Error reading subscription status:', err);
    return getDefaultSubscription();
  }
};

export const checkCanCreateLessonPlan = (): {
  canCreate: boolean;
  remainingPlans: number;
  status: 'ACTIVE' | 'EXPIRED' | 'DEPLETED';
  message?: string;
} => {
  // Check if current logged-in user is Owner/Admin or has remaining plans assigned by admin
  try {
    const raw = localStorage.getItem('nkorera_current_user');
    if (raw) {
      let user = JSON.parse(raw);
      if (user) {
        if (user.isAdmin || (user.email && user.email.toLowerCase() === 'nkundimana123theogene@gmail.com')) {
          return {
            canCreate: true,
            remainingPlans: 99999,
            status: 'ACTIVE'
          };
        }

        // Apply monthly reset for free tier user if 30 days have elapsed
        const resetResult = checkAndApplyMonthlyFreePlansReset(user);
        if (resetResult.didReset) {
          user = resetResult.user;
          localStorage.setItem('nkorera_current_user', JSON.stringify(user));
          syncAllCategorySubscriptionsForUser(user);
        }

        const rem = typeof user.remainingPlans === 'number' ? Math.max(0, user.remainingPlans) : 0;
        if (rem > 0) {
          return {
            canCreate: true,
            remainingPlans: rem,
            status: 'ACTIVE'
          };
        } else {
          return {
            canCreate: false,
            remainingPlans: 0,
            status: 'DEPLETED',
            message: 'You have used all 3 free lesson plans for this month (0 remaining). Please upgrade to a subscription plan or wait for your next monthly renewal.'
          };
        }
      }
    }
  } catch (e) {}

  const current = getSubscriptionStatus();
  const remainingPlans = Math.max(0, current.totalPlansAllowed - current.usedPlansCount);

  if (remainingPlans > 0) {
    return {
      canCreate: true,
      remainingPlans,
      status: 'ACTIVE'
    };
  }

  return {
    canCreate: false,
    remainingPlans: 0,
    status: 'DEPLETED',
    message: 'You have used all 3 free lesson plans for this month (0 remaining). Please purchase a subscription plan or wait for your next monthly renewal.'
  };
};

/**
 * Deducts 1 plan/credit from the active teacher account across all storage layers:
 * 1. LocalStorage current user
 * 2. LocalStorage teachers list
 * 3. LocalStorage & Cloud Firestore payment_history records
 * 4. Cloud Firestore user_profiles collection
 * 5. Server backend (/api/users/deduct-plan)
 * 6. Broadcasts window events so open Admin Panel / Dashboard updates immediately
 */
export const deductTeacherPlan = (serviceType: 'cbc' | 'remedial' | 'nursery' | 'scheme' = 'cbc'): any => {
  try {
    const rawCurrentUser = localStorage.getItem('nkorera_current_user');
    let user = rawCurrentUser ? JSON.parse(rawCurrentUser) : null;
    if (!user || user.id === 'guest') return null;

    const isOwner = user.email === 'nkundimana123theogene@gmail.com';
    if (isOwner) {
      if (!user.stats) {
        user.stats = {
          lessonPlansCount: 0,
          nurseryPlansCount: 0,
          examsCount: 0,
          worksheetsCount: 0,
          diaryEntriesCount: 0,
          certificatesCount: 0,
          totalItems: 0
        };
      }
      if (serviceType === 'nursery') {
        user.stats.nurseryPlansCount = (user.stats.nurseryPlansCount || 0) + 1;
      } else {
        user.stats.lessonPlansCount = (user.stats.lessonPlansCount || 0) + 1;
      }
      user.stats.totalItems = (user.stats.totalItems || 0) + 1;
      user.totalGenerated = (user.totalGenerated || 0) + 1;
      localStorage.setItem('nkorera_current_user', JSON.stringify(user));
      return user;
    }

    // Determine current remaining plans
    const currentRemaining = typeof user.remainingPlans === 'number' ? user.remainingPlans : 0;
    const newRemaining = Math.max(0, currentRemaining - 1);
    const newUsed = (user.totalGenerated || user.stats?.lessonPlansCount || 0) + 1;

    user.remainingPlans = newRemaining;
    user.totalGenerated = newUsed;
    if (!user.stats) {
      user.stats = {
        lessonPlansCount: 0,
        nurseryPlansCount: 0,
        examsCount: 0,
        worksheetsCount: 0,
        diaryEntriesCount: 0,
        certificatesCount: 0,
        totalItems: 0
      };
    }
    if (serviceType === 'nursery') {
      user.stats.nurseryPlansCount = (user.stats.nurseryPlansCount || 0) + 1;
    } else {
      user.stats.lessonPlansCount = (user.stats.lessonPlansCount || 0) + 1;
    }
    user.stats.totalItems = (user.stats.totalItems || 0) + 1;
    user.status = newRemaining > 0 ? 'ACTIVE' : 'DEPLETED';

    // 1. Update localStorage current user
    localStorage.setItem('nkorera_current_user', JSON.stringify(user));

    // 2. Update local teacher list in localStorage
    const rawList = localStorage.getItem('nkorera_teachers_list');
    if (rawList) {
      try {
        const list = JSON.parse(rawList);
        const idx = list.findIndex((t: any) => 
          (t.id && t.id === user.id) || 
          (t.email && t.email.toLowerCase() === user.email.toLowerCase()) ||
          (user.phone && t.phone && t.phone.replace(/[^0-9]/g, '') === user.phone.replace(/[^0-9]/g, ''))
        );
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...user };
          localStorage.setItem('nkorera_teachers_list', JSON.stringify(list));
        }
      } catch (e) {}
    }

    // 3. Update payment history in localStorage and cloud
    const rawPayments = localStorage.getItem('nkorera_ai_payment_history');
    if (rawPayments) {
      try {
        const payments = JSON.parse(rawPayments);
        const pIdx = payments.findIndex((p: any) => 
          (p.userEmail && p.userEmail.toLowerCase() === user.email.toLowerCase()) ||
          (p.teacherEmail && p.teacherEmail.toLowerCase() === user.email.toLowerCase())
        );
        if (pIdx !== -1) {
          payments[pIdx].usedPlans = (payments[pIdx].usedPlans || 0) + 1;
          payments[pIdx].remainingPlans = newRemaining;
          localStorage.setItem('nkorera_ai_payment_history', JSON.stringify(payments));

          // If payment doc has an ID, update it in Firestore
          if (payments[pIdx].id && db) {
            setDoc(doc(db, 'payment_history', payments[pIdx].id), {
              usedPlans: payments[pIdx].usedPlans,
              remainingPlans: newRemaining,
              updatedAt: new Date().toISOString()
            }, { merge: true }).catch(() => {});
          }
        }
      } catch (e) {}
    }

    // 4. Update Firestore user_profiles live
    syncUserProfileToFirestore(user).catch(() => {});
    syncSingleTeacherToCloud(user).catch(() => {});

    // 5. Post to server backend
    fetch('/api/users/deduct-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        phone: user.phone || user.momoNumber,
        serviceType
      })
    }).catch(() => {});

    // Sync all categories in local storage
    syncAllCategorySubscriptionsForUser(user);

    // 6. Broadcast event so open UI immediately updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nkorera_plan_consumed', { 
        detail: { 
          email: user.email, 
          remainingPlans: newRemaining, 
          usedPlans: newUsed,
          serviceType 
        } 
      }));
      window.dispatchEvent(new CustomEvent('nkorera_user_updated', { detail: user }));
    }

    return user;
  } catch (err) {
    console.error('Error in deductTeacherPlan:', err);
    return null;
  }
};

export const consumeLessonPlan = (): SubscriptionData => {
  const current = getSubscriptionStatus();
  current.usedPlansCount += 1;
  
  // Deduct from teacher's unified quota across all stores
  const updatedUser = deductTeacherPlan('cbc');
  if (updatedUser && typeof updatedUser.remainingPlans === 'number') {
    current.totalPlansAllowed = Math.max(current.totalPlansAllowed, (updatedUser.purchasedPlans || updatedUser.totalPlansPurchased || 10));
    current.status = updatedUser.status;
  } else {
    const remaining = Math.max(0, current.totalPlansAllowed - current.usedPlansCount);
    if (remaining <= 0) {
      current.status = 'DEPLETED';
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  return current;
};

export const activateSubscriptionPlan = (
  planId: string, 
  momoNumber?: string, 
  customTxRef?: string, 
  customPaymentMethod?: string, 
  receiptScreenshot?: string,
  buyerName?: string,
  buyerEmail?: string
): SubscriptionData => {
  const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === planId) || SUBSCRIPTION_PLANS[0];
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days validity

  const newSub: SubscriptionData = {
    planId: selectedPlan.id,
    planName: `${selectedPlan.plansCount} Lesson Plans for ${selectedPlan.priceFrw > 0 ? selectedPlan.priceFrw.toLocaleString() + ' frw' : 'Free'} per month`,
    totalPlansAllowed: selectedPlan.plansCount,
    usedPlansCount: 0,
    activatedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    momoNumber: momoNumber || '',
    status: 'ACTIVE'
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newSub));

  syncActivatedUserToCloud(
    'cbc', 
    selectedPlan.id, 
    selectedPlan.plansCount, 
    selectedPlan.priceFrw, 
    momoNumber, 
    customTxRef, 
    customPaymentMethod, 
    receiptScreenshot,
    buyerName,
    buyerEmail
  );

  return newSub;
};


export const REMEDIAL_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: 'rem_free_3', name: '3 Free Lesson Plans per Month', plansCount: 3, priceFrw: 0, badge: 'Free Tier', durationDays: 30 },
  { id: 'rem_plan_10', name: '10 Lesson Plans', plansCount: 10, priceFrw: 800 },
  { id: 'rem_plan_15', name: '15 Lesson Plans', plansCount: 15, priceFrw: 1200 },
  { id: 'rem_plan_18', name: '18 Lesson Plans', plansCount: 18, priceFrw: 1440 },
  { id: 'rem_plan_25', name: '25 Lesson Plans', plansCount: 25, priceFrw: 2000, isPopular: true },
  { id: 'rem_plan_28', name: '28 Lesson Plans', plansCount: 28, priceFrw: 2240 },
  { id: 'rem_plan_30', name: '30 Lesson Plans', plansCount: 30, priceFrw: 2400 },
  { id: 'rem_plan_35', name: '35 Lesson Plans', plansCount: 35, priceFrw: 2800 },
  { id: 'rem_plan_38', name: '38 Lesson Plans', plansCount: 38, priceFrw: 3040 },
  { id: 'rem_plan_40', name: '40 Lesson Plans', plansCount: 40, priceFrw: 3200, isPopular: true },
  { id: 'rem_plan_45', name: '45 Lesson Plans', plansCount: 45, priceFrw: 3600 },
  { id: 'rem_plan_48', name: '48 Lesson Plans', plansCount: 48, priceFrw: 3840 },
  { id: 'rem_plan_50', name: '50 Lesson Plans', plansCount: 50, priceFrw: 4000, isPopular: true },
  { id: 'rem_plan_85', name: '85 Lesson Plans', plansCount: 85, priceFrw: 6000 },
  { id: 'rem_plan_120', name: '120 Lesson Plans', plansCount: 120, priceFrw: 8800, badge: 'Best Value' },
  { id: 'rem_plan_150', name: '150 Lesson Plans', plansCount: 150, priceFrw: 11200 }
];

const REMEDIAL_STORAGE_KEY = 'nkorera_remedial_subscription_status';

export const getDefaultRemedialSubscription = (): SubscriptionData => {
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
  return {
    planId: 'rem_free_3',
    planName: '3 Free Lesson Plans per Month',
    totalPlansAllowed: 3,
    usedPlansCount: 0,
    activatedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    status: 'ACTIVE'
  };
};

export const getRemedialSubscriptionStatus = (): SubscriptionData => {
  try {
    const raw = localStorage.getItem(REMEDIAL_STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultRemedialSubscription();
      localStorage.setItem(REMEDIAL_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }

    const data: SubscriptionData = JSON.parse(raw);
    const now = new Date();
    const expiry = new Date(data.expiresAt);

    let updated = false;

    const remaining = Math.max(0, data.totalPlansAllowed - data.usedPlansCount);
    if (now > expiry) {
      if (data.planId === 'rem_free_3' || data.planId === 'rem_free_2' || data.totalPlansAllowed <= 3) {
        data.planId = 'rem_free_3';
        data.planName = '3 Free Lesson Plans per Month';
        data.totalPlansAllowed = 3;
        data.usedPlansCount = 0;
        data.expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        data.status = 'ACTIVE';
        updated = true;
      } else if (remaining > 0) {
        data.expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        data.status = 'ACTIVE';
        updated = true;
      } else {
        data.planId = 'rem_free_3';
        data.planName = '3 Free Lesson Plans per Month';
        data.totalPlansAllowed = 3;
        data.usedPlansCount = 0;
        data.expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        data.status = 'ACTIVE';
        updated = true;
      }
    } else {
      if (remaining <= 0 && data.status !== 'DEPLETED') {
        data.status = 'DEPLETED';
        updated = true;
      } else if (remaining > 0 && data.status !== 'ACTIVE') {
        data.status = 'ACTIVE';
        updated = true;
      }
    }

    if (updated) {
      localStorage.setItem(REMEDIAL_STORAGE_KEY, JSON.stringify(data));
    }

    return data;
  } catch (err) {
    console.error('Error reading remedial subscription status:', err);
    return getDefaultRemedialSubscription();
  }
};

export const checkCanCreateRemedialLessonPlan = (): {
  canCreate: boolean;
  remainingPlans: number;
  status: 'ACTIVE' | 'EXPIRED' | 'DEPLETED';
  message?: string;
} => {
  try {
    const raw = localStorage.getItem('nkorera_current_user');
    if (raw) {
      let user = JSON.parse(raw);
      if (user) {
        if (user.isAdmin || (user.email && user.email.toLowerCase() === 'nkundimana123theogene@gmail.com')) {
          return { canCreate: true, remainingPlans: 99999, status: 'ACTIVE' };
        }

        const resetResult = checkAndApplyMonthlyFreePlansReset(user);
        if (resetResult.didReset) {
          user = resetResult.user;
          localStorage.setItem('nkorera_current_user', JSON.stringify(user));
          syncAllCategorySubscriptionsForUser(user);
        }

        const rem = typeof user.remainingPlans === 'number' ? Math.max(0, user.remainingPlans) : 0;
        if (rem > 0) {
          return { canCreate: true, remainingPlans: rem, status: 'ACTIVE' };
        } else {
          return {
            canCreate: false,
            remainingPlans: 0,
            status: 'DEPLETED',
            message: 'You have used all 3 free lesson plans for this month (0 remaining). Please upgrade to a subscription plan or wait for your next monthly renewal.'
          };
        }
      }
    }
  } catch (e) {}

  const current = getRemedialSubscriptionStatus();
  const remainingPlans = Math.max(0, current.totalPlansAllowed - current.usedPlansCount);

  if (remainingPlans > 0) {
    return {
      canCreate: true,
      remainingPlans,
      status: 'ACTIVE'
    };
  }

  return {
    canCreate: false,
    remainingPlans: 0,
    status: 'DEPLETED',
    message: 'You have used all 3 free lesson plans for this month (0 remaining). Please purchase a subscription plan or wait for your next monthly renewal.'
  };
};

export const consumeRemedialLessonPlan = (): SubscriptionData => {
  const current = getRemedialSubscriptionStatus();
  current.usedPlansCount += 1;
  
  const updatedUser = deductTeacherPlan('remedial');
  if (updatedUser && typeof updatedUser.remainingPlans === 'number') {
    current.status = updatedUser.status;
  } else {
    const remaining = Math.max(0, current.totalPlansAllowed - current.usedPlansCount);
    if (remaining <= 0) {
      current.status = 'DEPLETED';
    }
  }

  localStorage.setItem(REMEDIAL_STORAGE_KEY, JSON.stringify(current));
  return current;
};

export const activateRemedialSubscriptionPlan = (
  planId: string, 
  momoNumber?: string, 
  customTxRef?: string, 
  customPaymentMethod?: string, 
  receiptScreenshot?: string,
  buyerName?: string,
  buyerEmail?: string
): SubscriptionData => {
  const plan = REMEDIAL_SUBSCRIPTION_PLANS.find(p => p.id === planId);
  if (!plan) throw new Error("Plan not found");

  const current = getRemedialSubscriptionStatus();
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  let newTotal = plan.plansCount;
  if (current.status === 'ACTIVE' && now <= new Date(current.expiresAt)) {
    const remaining = Math.max(0, current.totalPlansAllowed - current.usedPlansCount);
    newTotal += remaining;
  }

  const newSub: SubscriptionData = {
    planId: plan.id,
    planName: plan.name,
    totalPlansAllowed: newTotal,
    usedPlansCount: 0,
    activatedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    momoNumber: momoNumber || current.momoNumber,
    status: 'ACTIVE'
  };

  localStorage.setItem(REMEDIAL_STORAGE_KEY, JSON.stringify(newSub));
  syncActivatedUserToCloud(
    'remedial', 
    plan.id, 
    plan.plansCount, 
    plan.priceFrw, 
    momoNumber, 
    customTxRef, 
    customPaymentMethod, 
    receiptScreenshot,
    buyerName,
    buyerEmail
  );
  return newSub;
};

// ==========================================
// NURSERY LESSON PLAN SUBSCRIPTION ENGINE
// ==========================================

const NURSERY_STORAGE_KEY = 'nkorera_nursery_subscription_status';

export const getDefaultNurserySubscription = (): SubscriptionData => {
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
  return {
    planId: 'nursery_free_3',
    planName: '3 Free Lesson Plans per Month',
    totalPlansAllowed: 3,
    usedPlansCount: 0,
    activatedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    status: 'ACTIVE'
  };
};

export const getNurserySubscriptionStatus = (): SubscriptionData => {
  try {
    const raw = localStorage.getItem(NURSERY_STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultNurserySubscription();
      localStorage.setItem(NURSERY_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }

    const data: SubscriptionData = JSON.parse(raw);
    const now = new Date();
    const expiry = new Date(data.expiresAt);

    let updated = false;

    const remaining = Math.max(0, data.totalPlansAllowed - data.usedPlansCount);
    if (now > expiry) {
      if (data.planId === 'nursery_free_3' || data.totalPlansAllowed <= 3) {
        data.planId = 'nursery_free_3';
        data.planName = '3 Free Lesson Plans per Month';
        data.totalPlansAllowed = 3;
        data.usedPlansCount = 0;
        data.expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        data.status = 'ACTIVE';
        updated = true;
      } else if (remaining > 0) {
        data.expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        data.status = 'ACTIVE';
        updated = true;
      } else {
        data.planId = 'nursery_free_3';
        data.planName = '3 Free Lesson Plans per Month';
        data.totalPlansAllowed = 3;
        data.usedPlansCount = 0;
        data.expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        data.status = 'ACTIVE';
        updated = true;
      }
    } else {
      if (remaining <= 0 && data.status !== 'DEPLETED') {
        data.status = 'DEPLETED';
        updated = true;
      } else if (remaining > 0 && data.status !== 'ACTIVE') {
        data.status = 'ACTIVE';
        updated = true;
      }
    }

    if (updated) {
      localStorage.setItem(NURSERY_STORAGE_KEY, JSON.stringify(data));
    }

    return data;
  } catch (err) {
    console.error('Error reading nursery subscription status:', err);
    return getDefaultNurserySubscription();
  }
};

export const checkCanCreateNurseryLessonPlan = (): {
  canCreate: boolean;
  remainingPlans: number;
  status: 'ACTIVE' | 'EXPIRED' | 'DEPLETED';
  message?: string;
} => {
  try {
    const raw = localStorage.getItem('nkorera_current_user');
    if (raw) {
      let user = JSON.parse(raw);
      if (user) {
        if (user.isAdmin || (user.email && user.email.toLowerCase() === 'nkundimana123theogene@gmail.com')) {
          return { canCreate: true, remainingPlans: 99999, status: 'ACTIVE' };
        }

        const resetResult = checkAndApplyMonthlyFreePlansReset(user);
        if (resetResult.didReset) {
          user = resetResult.user;
          localStorage.setItem('nkorera_current_user', JSON.stringify(user));
          syncAllCategorySubscriptionsForUser(user);
        }

        const rem = typeof user.remainingPlans === 'number' ? Math.max(0, user.remainingPlans) : 0;
        if (rem > 0) {
          return { canCreate: true, remainingPlans: rem, status: 'ACTIVE' };
        } else {
          return {
            canCreate: false,
            remainingPlans: 0,
            status: 'DEPLETED',
            message: 'You have used all 3 free lesson plans for this month (0 remaining). Please upgrade to a subscription plan or wait for your next monthly renewal.'
          };
        }
      }
    }
  } catch (e) {}

  const current = getNurserySubscriptionStatus();
  const remainingPlans = Math.max(0, current.totalPlansAllowed - current.usedPlansCount);

  if (remainingPlans > 0) {
    return {
      canCreate: true,
      remainingPlans,
      status: 'ACTIVE'
    };
  }

  return {
    canCreate: false,
    remainingPlans: 0,
    status: 'DEPLETED',
    message: 'You have used all 3 free lesson plans for this month (0 remaining). Please purchase a subscription plan or wait for your next monthly renewal.'
  };
};

export const consumeNurseryLessonPlan = (): SubscriptionData => {
  const current = getNurserySubscriptionStatus();
  current.usedPlansCount += 1;
  
  const updatedUser = deductTeacherPlan('nursery');
  if (updatedUser && typeof updatedUser.remainingPlans === 'number') {
    current.status = updatedUser.status;
  } else {
    const remaining = Math.max(0, current.totalPlansAllowed - current.usedPlansCount);
    if (remaining <= 0) {
      current.status = 'DEPLETED';
    }
  }

  localStorage.setItem(NURSERY_STORAGE_KEY, JSON.stringify(current));
  return current;
};

export const activateNurserySubscriptionPlan = (
  planId: string, 
  momoNumber?: string, 
  customTxRef?: string, 
  customPaymentMethod?: string, 
  receiptScreenshot?: string,
  buyerName?: string,
  buyerEmail?: string
): SubscriptionData => {
  const plan = NURSERY_SUBSCRIPTION_PLANS.find(p => p.id === planId) || NURSERY_SUBSCRIPTION_PLANS[0];
  const current = getNurserySubscriptionStatus();
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  let newTotal = plan.plansCount;
  if (current.status === 'ACTIVE' && now <= new Date(current.expiresAt)) {
    const remaining = Math.max(0, current.totalPlansAllowed - current.usedPlansCount);
    newTotal += remaining;
  }

  const newSub: SubscriptionData = {
    planId: plan.id,
    planName: plan.name,
    totalPlansAllowed: newTotal,
    usedPlansCount: 0,
    activatedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    momoNumber: momoNumber || current.momoNumber,
    status: 'ACTIVE'
  };

  localStorage.setItem(NURSERY_STORAGE_KEY, JSON.stringify(newSub));
  syncActivatedUserToCloud(
    'nursery', 
    plan.id, 
    plan.plansCount, 
    plan.priceFrw, 
    momoNumber, 
    customTxRef, 
    customPaymentMethod, 
    receiptScreenshot,
    buyerName,
    buyerEmail
  );
  return newSub;
};

// ==========================================
// SCHEME OF WORK SUBSCRIPTION ENGINE
// ==========================================

export const SCHEME_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: 'scheme_free_1', name: '1 Free tier scheme of work per month', plansCount: 1, priceFrw: 0, badge: 'Free Tier', durationDays: 30 },
  { id: 'scheme_plan_3', name: '3 scheme of work for 2500 frw per month', plansCount: 3, priceFrw: 2500, durationDays: 30 },
  { id: 'scheme_plan_5', name: '5 scheme of work for 3500 frw per month', plansCount: 5, priceFrw: 3500, isPopular: true, durationDays: 30 },
  { id: 'scheme_plan_7', name: '7 scheme of work for 4500 frw per year', plansCount: 7, priceFrw: 4500, badge: 'Annual Pack', durationDays: 365 },
  { id: 'scheme_plan_10', name: '10 scheme of work for 6000 frw per week', plansCount: 10, priceFrw: 6000, isPopular: true, durationDays: 7 },
  { id: 'scheme_plan_25', name: '25 scheme of work for 8500 frw per term (90 Days)', plansCount: 25, priceFrw: 8500, badge: 'Best Value', durationDays: 90 }
];

const SCHEME_STORAGE_KEY = 'nkorera_scheme_subscription_status';

export const getDefaultSchemeSubscription = (): SubscriptionData => {
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
  return {
    planId: 'scheme_free_1',
    planName: '1 Free tier scheme of work per month',
    totalPlansAllowed: 1,
    usedPlansCount: 0,
    activatedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    status: 'ACTIVE'
  };
};

export const getSchemeSubscriptionStatus = (): SubscriptionData => {
  try {
    const rawCurrentUser = localStorage.getItem('nkorera_current_user');
    if (rawCurrentUser) {
      const user = JSON.parse(rawCurrentUser);
      if (user && user.email && user.email.toLowerCase() === 'nkundimana123theogene@gmail.com') {
        return {
          planId: 'scheme_plan_unlimited',
          planName: 'VIP Owner Access (Unlimited)',
          totalPlansAllowed: 99999,
          usedPlansCount: 0,
          activatedAt: user.createdAt || new Date().toISOString(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'ACTIVE'
        };
      }
    }

    const raw = localStorage.getItem(SCHEME_STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultSchemeSubscription();
      localStorage.setItem(SCHEME_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }

    const data: SubscriptionData = JSON.parse(raw);
    const now = new Date();
    const expiry = new Date(data.expiresAt);

    let updated = false;

    const remaining = Math.max(0, data.totalPlansAllowed - data.usedPlansCount);
    if (now > expiry) {
      if (data.planId === 'scheme_free_1' || data.totalPlansAllowed <= 1 || remaining > 0) {
        data.expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        data.status = 'ACTIVE';
        updated = true;
      } else {
        data.status = 'EXPIRED';
        updated = true;
      }
    } else {
      if (remaining <= 0 && data.status !== 'DEPLETED') {
        data.status = 'DEPLETED';
        updated = true;
      } else if (remaining > 0 && data.status !== 'ACTIVE') {
        data.status = 'ACTIVE';
        updated = true;
      }
    }

    if (updated) {
      localStorage.setItem(SCHEME_STORAGE_KEY, JSON.stringify(data));
    }

    return data;
  } catch (err) {
    console.error('Error reading scheme subscription status:', err);
    return getDefaultSchemeSubscription();
  }
};

export const checkCanCreateSchemeOfWork = (): {
  canCreate: boolean;
  remainingPlans: number;
  status: 'ACTIVE' | 'EXPIRED' | 'DEPLETED';
  message?: string;
} => {
  try {
    const raw = localStorage.getItem('nkorera_current_user');
    if (raw) {
      const user = JSON.parse(raw);
      if (user) {
        if (user.isAdmin || (user.email && user.email.toLowerCase() === 'nkundimana123theogene@gmail.com')) {
          return {
            canCreate: true,
            remainingPlans: 99999,
            status: 'ACTIVE'
          };
        }
        if (user.isPaid === false || user.status === 'UNPAID') {
          return {
            canCreate: false,
            remainingPlans: 0,
            status: 'DEPLETED',
            message: 'Your account is unpaid. You cannot create lesson plans until payment is verified or approved by Admin.'
          };
        }
        if (user.isPaid || user.verifiedPayment || user.hasPremiumToolsSub || (typeof user.remainingPlans === 'number' && user.remainingPlans > 0)) {
          const rem = Math.max(0, user.remainingPlans || 0);
          if (rem > 0) {
            return {
              canCreate: true,
              remainingPlans: rem,
              status: 'ACTIVE'
            };
          }
        }
      }
    }
  } catch (e) {}

  const current = getSchemeSubscriptionStatus();
  const remainingPlans = Math.max(0, current.totalPlansAllowed - current.usedPlansCount);

  if (remainingPlans > 0) {
    return {
      canCreate: true,
      remainingPlans,
      status: 'ACTIVE'
    };
  }

  const now = new Date();
  const expiry = new Date(current.expiresAt);

  if (now > expiry) {
    return {
      canCreate: false,
      remainingPlans: 0,
      status: 'EXPIRED',
      message: 'Subscription period has expired. Please renew your subscription to create new Schemes of Work.'
    };
  }

  return {
    canCreate: false,
    remainingPlans: 0,
    status: 'DEPLETED',
    message: 'All purchased Schemes of Work credits have been used (0 remaining). Please purchase a new Scheme of Work package to continue.'
  };
};

export const consumeSchemeOfWork = (): SubscriptionData => {
  const current = getSchemeSubscriptionStatus();
  current.usedPlansCount += 1;
  
  const updatedUser = deductTeacherPlan('scheme');
  if (updatedUser && typeof updatedUser.remainingPlans === 'number') {
    current.status = updatedUser.status;
  } else {
    const remaining = Math.max(0, current.totalPlansAllowed - current.usedPlansCount);
    if (remaining <= 0) {
      current.status = 'DEPLETED';
    }
  }

  localStorage.setItem(SCHEME_STORAGE_KEY, JSON.stringify(current));
  return current;
};

export const activateSchemeSubscriptionPlan = (
  planId: string, 
  momoNumber?: string, 
  customTxRef?: string, 
  customPaymentMethod?: string, 
  receiptScreenshot?: string,
  buyerName?: string,
  buyerEmail?: string
): SubscriptionData => {
  const plan = SCHEME_SUBSCRIPTION_PLANS.find(p => p.id === planId) || SCHEME_SUBSCRIPTION_PLANS[0];
  const current = getSchemeSubscriptionStatus();
  const now = new Date();
  const days = plan.durationDays || 30;
  const expires = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  let newTotal = plan.plansCount;
  if (current.status === 'ACTIVE' && now <= new Date(current.expiresAt)) {
    const remaining = Math.max(0, current.totalPlansAllowed - current.usedPlansCount);
    newTotal += remaining;
  }

  const newSub: SubscriptionData = {
    planId: plan.id,
    planName: plan.name,
    totalPlansAllowed: newTotal,
    usedPlansCount: 0,
    activatedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    momoNumber: momoNumber || current.momoNumber,
    status: 'ACTIVE'
  };

  localStorage.setItem(SCHEME_STORAGE_KEY, JSON.stringify(newSub));
  syncActivatedUserToCloud(
    'scheme', 
    plan.id, 
    plan.plansCount, 
    plan.priceFrw, 
    momoNumber, 
    customTxRef, 
    customPaymentMethod, 
    receiptScreenshot,
    buyerName,
    buyerEmail
  );
  return newSub;
};

// =========================================================================
// AI SERVICES CREDIT & SUBSCRIPTION BILLING ENGINE
// Services: 
// 1. Create Homework, Classwork and Quiz
// 2. AI Presentation Slides
// 3. Printable Worksheet
// Rule: 2 Free credits per month. 1 credit consumed per successful generation.
// Deducted ONLY after successful generation.
// Plans: Free (2), Starter (25 / 500 RWF), Basic (40 / 1000 RWF), Standard (80 / 1500 RWF - Most Popular), Premium (120 / 2000 RWF)
// =========================================================================

export interface AiSubscriptionPlan {
  id: string;
  name: string;
  credits: number;
  priceRwf: number;
  formattedPrice: string;
  billingCycle: string;
  badge?: string;
  isPopular?: boolean;
  description: string;
  features: string[];
}

export const AI_SUBSCRIPTION_PLANS: AiSubscriptionPlan[] = [
  {
    id: 'free_tier',
    name: 'Free Plan',
    credits: 2,
    priceRwf: 0,
    formattedPrice: 'Free (0 RWF)',
    billingCycle: 'Per Month',
    badge: 'Free Tier',
    description: 'Every user receives 2 free credits per month to use across all 3 AI services.',
    features: [
      '2 Monthly Free Credits',
      'Create Homework, Classwork & Quiz',
      'AI Presentation Slides',
      'Printable Worksheet Generator',
      'Instant Download as PDF & Word'
    ]
  },
  {
    id: 'starter_plan',
    name: 'Starter Plan',
    credits: 25,
    priceRwf: 500,
    formattedPrice: '500 RWF',
    billingCycle: 'Per Month',
    badge: 'Starter',
    description: 'Ideal for individual teachers needing quick weekly homework and slide sets.',
    features: [
      '25 Credits per Month',
      'All 3 AI Generation Services',
      'Automatic Answer Keys & Rubrics',
      'Instant Mobile Money (MTN & Airtel) Activation',
      'Fast AI Processing Speed',
      'Export PDF, Word (.doc) & PPTX'
    ]
  },
  {
    id: 'basic_plan',
    name: 'Basic Plan',
    credits: 40,
    priceRwf: 1000,
    formattedPrice: '1,000 RWF',
    billingCycle: 'Per Month',
    badge: 'Basic',
    description: 'Perfect for full-time teachers managing regular classes and weekly assessments.',
    features: [
      '40 Credits per Month',
      'Create Homework, Classwork & Quiz',
      'AI Presentation Slides with Visual Themes',
      'Printable Worksheets with Multiple Formats',
      'Full REB / RTB Curriculum Alignment',
      'WhatsApp Teacher Support'
    ]
  },
  {
    id: 'standard_plan',
    name: 'Standard Plan',
    credits: 80,
    priceRwf: 1500,
    formattedPrice: '1,500 RWF',
    billingCycle: 'Per Month',
    badge: 'Most Popular ⭐',
    isPopular: true,
    description: 'Our most recommended plan for active teachers handling multiple subjects and grades.',
    features: [
      '80 Credits per Month',
      'All AI Services with Priority Processing',
      'Unlimited Re-edits & Custom Modifications',
      'Comprehensive Pedagogical Notes & Schemes',
      'Multi-Language Output (English, Kinyarwanda, French, Swahili)',
      'Priority Teacher Support'
    ]
  },
  {
    id: 'premium_plan',
    name: 'Premium Plan',
    credits: 120,
    priceRwf: 2000,
    formattedPrice: '2,000 RWF',
    billingCycle: 'Per Month',
    badge: 'Best Value 👑',
    description: 'Ultimate power plan for heavy teaching workloads, departments, and heads of studies.',
    features: [
      '120 Credits per Month',
      'Highest AI Generation Speed & High-Token Output',
      'Complete Homework, Slides & Worksheet Generation',
      'Customized School Header & Logo Integration',
      'Full Export Suite (PDF, Word, PPTX, Print)',
      'VIP Priority 24/7 Dedicated Support'
    ]
  }
];

export interface AiCreditSubscriptionData {
  planId: string;
  planName: string;
  totalCredits: number;
  creditsRemaining: number;
  creditsUsed: number;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  nextRenewalDate: string;
  status: 'ACTIVE' | 'DEPLETED' | 'EXPIRED';
  paymentMethod: string;
  momoNumber?: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
}

export interface CreditUsageLog {
  id: string;
  serviceType: 'homework_quiz' | 'presentation_slides' | 'printable_worksheet';
  serviceName: string;
  itemTitle: string;
  creditsDeducted: number;
  creditsRemainingAfter: number;
  timestamp: string;
}

const AI_CREDIT_SUB_STORAGE_KEY = 'nkorera_ai_credit_subscription';
const AI_PAYMENT_HISTORY_STORAGE_KEY = 'nkorera_ai_payment_history';
const AI_USAGE_LOGS_STORAGE_KEY = 'nkorera_ai_credit_usage_logs';

export const getDefaultAiCreditSubscription = (): AiCreditSubscriptionData => {
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return {
    planId: 'free_tier',
    planName: 'Free Plan (2 Free Monthly Credits)',
    totalCredits: 2,
    creditsRemaining: 2,
    creditsUsed: 0,
    billingPeriodStart: now.toISOString(),
    billingPeriodEnd: nextMonth.toISOString(),
    nextRenewalDate: nextMonth.toISOString(),
    status: 'ACTIVE',
    paymentMethod: 'Free Tier',
    lastPaymentDate: now.toISOString(),
    lastPaymentAmount: 0
  };
};

export const getAiCreditSubscriptionStatus = (): AiCreditSubscriptionData => {
  try {
    // Check if current user is owner/admin
    const rawCurrentUser = localStorage.getItem('nkorera_current_user');
    if (rawCurrentUser) {
      const user = JSON.parse(rawCurrentUser);
      if (user && user.email && user.email.toLowerCase() === 'nkundimana123theogene@gmail.com') {
        const now = new Date();
        const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        return {
          planId: 'premium_vip',
          planName: 'VIP Owner Access (Unlimited Credits)',
          totalCredits: 99999,
          creditsRemaining: 99999,
          creditsUsed: 0,
          billingPeriodStart: now.toISOString(),
          billingPeriodEnd: nextYear.toISOString(),
          nextRenewalDate: nextYear.toISOString(),
          status: 'ACTIVE',
          paymentMethod: 'VIP Owner',
          lastPaymentDate: now.toISOString(),
          lastPaymentAmount: 0
        };
      }
    }

    const raw = localStorage.getItem(AI_CREDIT_SUB_STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultAiCreditSubscription();
      localStorage.setItem(AI_CREDIT_SUB_STORAGE_KEY, JSON.stringify(initial));
      
      // Initialize free tier in payment history
      const initialPayment: AiBillingRecord = {
        id: `bill_${Date.now()}`,
        transactionRef: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        planId: 'free_tier',
        planName: 'Free Plan (2 Credits)',
        amountRwf: 0,
        credits: 2,
        paymentMethod: 'Free Tier',
        phoneNumber: '0781339530',
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(AI_PAYMENT_HISTORY_STORAGE_KEY, JSON.stringify([initialPayment]));
      return initial;
    }

    const data: AiCreditSubscriptionData = JSON.parse(raw);
    const now = new Date();
    const expiry = new Date(data.billingPeriodEnd);

    let updated = false;

    // Check if 30-day billing cycle ended
    if (now > expiry) {
      if (data.planId === 'free_tier') {
        // Automatically reset 2 free credits for the new month!
        const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        data.totalCredits = 2;
        data.creditsRemaining = 2;
        data.creditsUsed = 0;
        data.billingPeriodStart = now.toISOString();
        data.billingPeriodEnd = nextMonth.toISOString();
        data.nextRenewalDate = nextMonth.toISOString();
        data.status = 'ACTIVE';
        updated = true;
      } else {
        data.status = 'EXPIRED';
        updated = true;
      }
    } else {
      if (data.creditsRemaining <= 0) {
        if (data.status !== 'DEPLETED') {
          data.status = 'DEPLETED';
          updated = true;
        }
      } else {
        if (data.status !== 'ACTIVE') {
          data.status = 'ACTIVE';
          updated = true;
        }
      }
    }

    if (updated) {
      localStorage.setItem(AI_CREDIT_SUB_STORAGE_KEY, JSON.stringify(data));
      syncAiSubscriptionToUser(data);
    }

    return data;
  } catch (err) {
    console.error('Error reading AI credit subscription status:', err);
    return getDefaultAiCreditSubscription();
  }
};

export const checkCanUseAiCredit = (
  _serviceType?: 'homework_quiz' | 'presentation_slides' | 'printable_worksheet'
): {
  canGenerate: boolean;
  remainingCredits: number;
  status: 'ACTIVE' | 'EXPIRED' | 'DEPLETED';
  message?: string;
} => {
  // Check admin bypass & user remaining plans
  try {
    const rawCurrentUser = localStorage.getItem('nkorera_current_user');
    if (rawCurrentUser) {
      const user = JSON.parse(rawCurrentUser);
      if (user) {
        if (user.isAdmin || (user.email && user.email.toLowerCase() === 'nkundimana123theogene@gmail.com')) {
          return {
            canGenerate: true,
            remainingCredits: 99999,
            status: 'ACTIVE'
          };
        }
        if (user.isPaid === false || user.status === 'UNPAID') {
          return {
            canGenerate: false,
            remainingCredits: 0,
            status: 'DEPLETED',
            message: 'Your account is unpaid. You cannot use AI tools until payment is verified or approved by Admin.'
          };
        }
        if (typeof user.remainingPlans === 'number' && user.remainingPlans > 0) {
          return {
            canGenerate: true,
            remainingCredits: user.remainingPlans,
            status: 'ACTIVE'
          };
        }
      }
    }
  } catch (e) {}

  const current = getAiCreditSubscriptionStatus();
  if (current.creditsRemaining > 0) {
    return {
      canGenerate: true,
      remainingCredits: current.creditsRemaining,
      status: 'ACTIVE'
    };
  }

  const now = new Date();
  const expiry = new Date(current.billingPeriodEnd);

  if (now > expiry && current.planId !== 'free_tier') {
    return {
      canGenerate: false,
      remainingCredits: 0,
      status: 'EXPIRED',
      message: 'Your monthly subscription period has expired (30 days completed). Please renew your subscription to continue generating AI content.'
    };
  }

  return {
    canGenerate: false,
    remainingCredits: 0,
    status: 'DEPLETED',
    message: 'You have used all available AI credits (0 remaining). Please subscribe to a paid monthly plan (Starter, Basic, Standard, or Premium) or buy additional credits to continue.'
  };
};

/**
 * Deducts exactly 1 credit ONLY after successful content generation.
 */
export const deductAiCredit = (
  serviceType: 'homework_quiz' | 'presentation_slides' | 'printable_worksheet',
  itemTitle: string = 'Untitled Generated Content'
): AiCreditSubscriptionData => {
  const current = getAiCreditSubscriptionStatus();

  // Admin has unlimited
  const rawCurrentUser = localStorage.getItem('nkorera_current_user');
  if (rawCurrentUser) {
    try {
      const user = JSON.parse(rawCurrentUser);
      if (user && user.email && user.email.toLowerCase() === 'nkundimana123theogene@gmail.com') {
        return current;
      }
    } catch {}
  }

  current.creditsUsed += 1;
  current.creditsRemaining = Math.max(0, current.totalCredits - current.creditsUsed);

  if (current.creditsRemaining <= 0) {
    current.status = 'DEPLETED';
  }

  localStorage.setItem(AI_CREDIT_SUB_STORAGE_KEY, JSON.stringify(current));

  // Log usage record
  const serviceNameMap: Record<string, string> = {
    homework_quiz: 'Homework, Classwork and Quiz',
    presentation_slides: 'AI Presentation Slides',
    printable_worksheet: 'Printable Worksheet'
  };

  try {
    const rawLogs = localStorage.getItem(AI_USAGE_LOGS_STORAGE_KEY);
    const logs: CreditUsageLog[] = rawLogs ? JSON.parse(rawLogs) : [];
    logs.unshift({
      id: `usage_${Date.now()}`,
      serviceType,
      serviceName: serviceNameMap[serviceType] || 'AI Service',
      itemTitle,
      creditsDeducted: 1,
      creditsRemainingAfter: current.creditsRemaining,
      timestamp: new Date().toISOString()
    });
    // Keep last 100 usage logs
    localStorage.setItem(AI_USAGE_LOGS_STORAGE_KEY, JSON.stringify(logs.slice(0, 100)));
  } catch (err) {
    console.warn('Failed to save credit usage log:', err);
  }

  syncAiSubscriptionToUser(current, serviceType);
  return current;
};

export const activateAiPaidPlan = (
  planId: string,
  phoneNumber: string,
  paymentMethod: 'MTN Mobile Money' | 'Airtel Money' = 'MTN Mobile Money',
  transactionProof?: string,
  receiptScreenshot?: string,
  buyerName?: string,
  buyerEmail?: string
): { success: boolean; subscription: AiCreditSubscriptionData; invoice: AiBillingRecord } => {
  const plan = AI_SUBSCRIPTION_PLANS.find(p => p.id === planId) || AI_SUBSCRIPTION_PLANS[3]; // Default to Standard Plan
  const current = getAiCreditSubscriptionStatus();
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Rollover remaining credits if active
  let totalNewCredits = plan.credits;
  if (current.status === 'ACTIVE' && now <= new Date(current.billingPeriodEnd)) {
    totalNewCredits += current.creditsRemaining;
  }

  const updatedSub: AiCreditSubscriptionData = {
    planId: plan.id,
    planName: plan.name,
    totalCredits: totalNewCredits,
    creditsRemaining: totalNewCredits,
    creditsUsed: 0,
    billingPeriodStart: now.toISOString(),
    billingPeriodEnd: nextMonth.toISOString(),
    nextRenewalDate: nextMonth.toISOString(),
    status: 'ACTIVE',
    paymentMethod,
    momoNumber: phoneNumber,
    lastPaymentDate: now.toISOString(),
    lastPaymentAmount: plan.priceRwf
  };

  localStorage.setItem(AI_CREDIT_SUB_STORAGE_KEY, JSON.stringify(updatedSub));

  const cleanPhone = (phoneNumber || '').trim();
  let userEmail = buyerEmail || '';
  let userName = buyerName || '';
  try {
    const rawU = localStorage.getItem('nkorera_current_user');
    if (rawU) {
      const u = JSON.parse(rawU);
      if (!userEmail && u.email && u.email !== 'teacher@nkorera.rw') userEmail = u.email;
      if (!userName && u.name && u.name !== 'Teacher') userName = u.name;
    }
  } catch(e) {}

  if (!userName) userName = 'Paid Teacher';
  if (!userEmail || userEmail === 'teacher@nkorera.rw') {
    userEmail = cleanPhone ? `${cleanPhone.replace(/[^0-9]/g, '')}@teacher.nkorera.rw` : 'teacher@nkorera.rw';
  }

  const assignedTxRef = transactionProof && transactionProof.trim().length > 2
    ? transactionProof.trim().toUpperCase()
    : `INV-${Math.floor(100000 + Math.random() * 900000)}`;

  // Add billing record
  const invoiceRecord: AiBillingRecord = {
    id: `bill_${Date.now()}`,
    transactionRef: assignedTxRef,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    planId: plan.id,
    planName: `${plan.name} (${plan.credits} Credits)`,
    amountRwf: plan.priceRwf,
    amount: plan.priceRwf,
    credits: plan.credits,
    plansGranted: plan.credits,
    plansPurchased: plan.credits,
    paymentMethod,
    method: paymentMethod,
    phoneNumber: cleanPhone || '0781339530',
    phone: cleanPhone || '0781339530',
    status: 'Paid',
    userEmail,
    teacherEmail: userEmail,
    userName,
    teacherName: userName,
    expiresAt: nextMonth.toISOString(),
    expiryDate: nextMonth.toISOString(),
    usedPlans: 0,
    remainingPlans: totalNewCredits,
    transactionProof: assignedTxRef,
    receiptScreenshot: receiptScreenshot || undefined,
    screenshotUrl: receiptScreenshot || undefined,
    createdAt: now.toISOString()
  };

  try {
    const rawHistory = localStorage.getItem(AI_PAYMENT_HISTORY_STORAGE_KEY);
    const history: AiBillingRecord[] = rawHistory ? JSON.parse(rawHistory) : [];
    history.unshift(invoiceRecord);
    localStorage.setItem(AI_PAYMENT_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    console.warn('Failed to save payment history:', err);
  }

  savePaymentToFirestore(invoiceRecord, userEmail).catch(() => {});

  syncAiSubscriptionToUser(updatedSub);
  syncActivatedUserToCloud(
    'ai', 
    plan.id, 
    plan.credits, 
    plan.priceRwf, 
    cleanPhone, 
    assignedTxRef, 
    paymentMethod, 
    receiptScreenshot,
    userName,
    userEmail
  );

  return {
    success: true,
    subscription: updatedSub,
    invoice: invoiceRecord
  };
};

export const getAiPaymentHistory = (): AiBillingRecord[] => {
  try {
    const raw = localStorage.getItem(AI_PAYMENT_HISTORY_STORAGE_KEY);
    if (!raw) {
      const defaultRecord: AiBillingRecord = {
        id: `bill_${Date.now()}`,
        transactionRef: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        planId: 'free_tier',
        planName: 'Free Plan (2 Free Credits)',
        amountRwf: 0,
        credits: 2,
        paymentMethod: 'Free Tier',
        phoneNumber: '0781339530',
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(AI_PAYMENT_HISTORY_STORAGE_KEY, JSON.stringify([defaultRecord]));
      return [defaultRecord];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to get payment history:', err);
    return [];
  }
};

export const getAiCreditUsageLogs = (): CreditUsageLog[] => {
  try {
    const raw = localStorage.getItem(AI_USAGE_LOGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const syncAiSubscriptionToUser = (
  sub: AiCreditSubscriptionData,
  usedService?: 'homework_quiz' | 'presentation_slides' | 'printable_worksheet'
) => {
  try {
    const rawUser = localStorage.getItem('nkorera_current_user');
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user && user.id !== 'guest') {
        user.subscriptionPlan = sub.planName;
        user.creditsRemaining = sub.creditsRemaining;
        user.totalCreditsAllowed = sub.totalCredits;
        user.billingPeriodStart = sub.billingPeriodStart;
        user.billingPeriodEnd = sub.billingPeriodEnd;
        user.nextRenewalDate = sub.nextRenewalDate;
        
        if (!user.aiUsageStats) {
          user.aiUsageStats = {
            homeworkQuizCount: 0,
            presentationSlidesCount: 0,
            worksheetsCount: 0
          };
        }

        if (usedService === 'homework_quiz') {
          user.aiUsageStats.homeworkQuizCount = (user.aiUsageStats.homeworkQuizCount || 0) + 1;
        } else if (usedService === 'presentation_slides') {
          user.aiUsageStats.presentationSlidesCount = (user.aiUsageStats.presentationSlidesCount || 0) + 1;
        } else if (usedService === 'printable_worksheet') {
          user.aiUsageStats.worksheetsCount = (user.aiUsageStats.worksheetsCount || 0) + 1;
        }

        localStorage.setItem('nkorera_current_user', JSON.stringify(user));
      }
    }
  } catch (err) {
    console.warn('Error syncing AI subscription to user:', err);
  }
};

export const checkIsServicePaid = (_serviceKey?: 'cbc' | 'remedial' | 'nursery' | 'scheme' | 'ai'): boolean => {
  // Downloading generated documents is always unlocked and allowed for all users
  return true;
};

export interface SubscriptionExpiryAlert {
  isExpiringSoon: boolean;
  daysRemaining: number;
  serviceName: string;
  expiryDateStr: string;
  planName: string;
}

export const checkSubscriptionExpiringSoon = (): SubscriptionExpiryAlert | null => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 1. Check AI Credit Subscription
    const aiSub = getAiCreditSubscriptionStatus();
    if (aiSub && (aiSub.status === 'ACTIVE' || aiSub.creditsRemaining > 0) && (aiSub.nextRenewalDate || aiSub.billingPeriodEnd)) {
      const expDate = new Date(aiSub.nextRenewalDate || aiSub.billingPeriodEnd);
      if (expDate > now && expDate <= sevenDaysFromNow) {
        const diffMs = expDate.getTime() - now.getTime();
        const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        return {
          isExpiringSoon: true,
          daysRemaining: days,
          serviceName: 'AI Credits & Generation Tools',
          expiryDateStr: expDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          planName: aiSub.planName || 'AI Package'
        };
      }
    }

    // 2. Check CBC Subscription (excluding free tier which auto-renews every month)
    const cbcSub = getSubscriptionStatus();
    if (cbcSub && cbcSub.planId !== 'free_3' && (cbcSub.status === 'ACTIVE' || cbcSub.totalPlansAllowed > 0) && cbcSub.expiresAt) {
      const expDate = new Date(cbcSub.expiresAt);
      if (expDate > now && expDate <= sevenDaysFromNow) {
        const diffMs = expDate.getTime() - now.getTime();
        const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        return {
          isExpiringSoon: true,
          daysRemaining: days,
          serviceName: 'CBC Lesson Plans',
          expiryDateStr: expDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          planName: cbcSub.planName || 'CBC Package'
        };
      }
    }

    // 3. Check Scheme of Work Subscription
    const schemeSub = getSchemeSubscriptionStatus();
    if (schemeSub && schemeSub.planId !== 'scheme_free_1' && (schemeSub.status === 'ACTIVE' || schemeSub.totalPlansAllowed > 0) && schemeSub.expiresAt) {
      const expDate = new Date(schemeSub.expiresAt);
      if (expDate > now && expDate <= sevenDaysFromNow) {
        const diffMs = expDate.getTime() - now.getTime();
        const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        return {
          isExpiringSoon: true,
          daysRemaining: days,
          serviceName: 'Schemes of Work',
          expiryDateStr: expDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          planName: schemeSub.planName || 'Scheme Package'
        };
      }
    }

    // 4. Check Nursery Subscription (excluding free tier)
    const nurserySub = getNurserySubscriptionStatus();
    if (nurserySub && nurserySub.planId !== 'nursery_free_3' && (nurserySub.status === 'ACTIVE' || nurserySub.totalPlansAllowed > 0) && nurserySub.expiresAt) {
      const expDate = new Date(nurserySub.expiresAt);
      if (expDate > now && expDate <= sevenDaysFromNow) {
        const diffMs = expDate.getTime() - now.getTime();
        const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        return {
          isExpiringSoon: true,
          daysRemaining: days,
          serviceName: 'Nursery Lesson Plans',
          expiryDateStr: expDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          planName: nurserySub.planName || 'Nursery Package'
        };
      }
    }

    // 5. Check Remedial Subscription (excluding free tier)
    const remedialSub = getRemedialSubscriptionStatus();
    if (remedialSub && remedialSub.planId !== 'rem_free_3' && remedialSub.planId !== 'rem_free_2' && (remedialSub.status === 'ACTIVE' || remedialSub.totalPlansAllowed > 0) && remedialSub.expiresAt) {
      const expDate = new Date(remedialSub.expiresAt);
      if (expDate > now && expDate <= sevenDaysFromNow) {
        const diffMs = expDate.getTime() - now.getTime();
        const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        return {
          isExpiringSoon: true,
          daysRemaining: days,
          serviceName: 'Remedial Lesson Plans',
          expiryDateStr: expDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          planName: remedialSub.planName || 'Remedial Package'
        };
      }
    }
  } catch (err) {
    console.warn('Error checking subscription expiry:', err);
  }

  return null;
};

export const ensureOlobaSamsonSubscription = () => {
  try {
    const olobaEmail = 'olobasamson923@gmail.com';
    const olobaPhone = '+250781036540';

    // 1. Teachers list update
    const rawList = localStorage.getItem('nkorera_teachers_list');
    let list: any[] = rawList ? JSON.parse(rawList) : [];
    let existingIndex = list.findIndex(t => t && (t.email?.toLowerCase() === olobaEmail || t.phone?.includes('781036540')));

    const olobaUser = {
      id: existingIndex !== -1 ? list[existingIndex].id : 'user_oloba_samson',
      email: olobaEmail,
      name: 'Oloba Samson',
      country: 'Rwanda',
      phone: olobaPhone,
      password: 'password',
      currentPlan: 'plan_30',
      remainingPlans: 30,
      isAdmin: false,
      hasPremiumToolsSub: true,
      isPaid: true,
      verifiedPayment: true,
      status: 'ACTIVE',
      totalGenerated: 0,
      createdAt: '2026-09-06T08:00:00.000Z',
      lastLoginAt: new Date().toISOString(),
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
    };

    if (existingIndex !== -1) {
      list[existingIndex] = { ...list[existingIndex], ...olobaUser };
    } else {
      list.push(olobaUser);
    }
    localStorage.setItem('nkorera_teachers_list', JSON.stringify(list));

    // 2. If current user is Oloba Samson, update current user in localStorage
    const rawCurrent = localStorage.getItem('nkorera_current_user');
    if (rawCurrent) {
      const current = JSON.parse(rawCurrent);
      if (current && (current.email?.toLowerCase() === olobaEmail || current.phone?.includes('781036540'))) {
        localStorage.setItem('nkorera_current_user', JSON.stringify({ ...current, ...olobaUser }));
      }
    }

    // 3. Save CBC active subscription state (30 plans)
    const cbcSubData: SubscriptionData = {
      planId: 'plan_30',
      planName: '30 CBC Lesson Plans Package (Verified 2,000 RWF Payment)',
      totalPlansAllowed: 30,
      usedPlansCount: 0,
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ACTIVE'
    };
    
    // Only set if not already set or depleted
    const existingCbc = localStorage.getItem('nkorera_subscription_status');
    if (!existingCbc || JSON.parse(existingCbc).status !== 'ACTIVE') {
      localStorage.setItem('nkorera_subscription_status', JSON.stringify(cbcSubData));
    }

    // 4. Record 2,000 RWF Payment in Firestore payment history
    const olobaPaymentRecord: AiBillingRecord = {
      id: `bill_oloba_30_2000_verified`,
      transactionRef: `INV-MOMO-2000RWF-OLOBA`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      planId: 'plan_30',
      planName: 'CBC 30 Lesson Plans Package (Verified 2,000 RWF Payment)',
      amountRwf: 2000,
      credits: 30,
      paymentMethod: 'MTN Mobile Money',
      phoneNumber: olobaPhone,
      status: 'Paid',
      userEmail: olobaEmail,
      createdAt: new Date().toISOString()
    };

    savePaymentToFirestore(olobaPaymentRecord, olobaEmail).catch(() => {});
    syncUserProfileToFirestore(olobaUser as any).catch(() => {});
    syncSingleTeacherToCloud(olobaUser as any).catch(() => {});
  } catch (err) {
    console.warn('Error in ensureOlobaSamsonSubscription:', err);
  }
};

// Automatically execute on load to ensure Oloba Samson is hydrated and verified
if (typeof window !== 'undefined') {
  setTimeout(() => {
    ensureOlobaSamsonSubscription();
  }, 500);
}


