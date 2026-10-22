/**
 * Utility to manage Daily Lesson Plan Goals and Today's Generated Plans Tracking
 */

export interface DailyGoalData {
  generatedToday: number;
  dailyTarget: number;
  percentage: number;
  remaining: number;
  isGoalReached: boolean;
  breakdown: {
    cbc: number;
    remedial: number;
    nursery: number;
    manualLogged: number;
  };
}

export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getUserDailyTarget(userKey?: string): number {
  const safeUserKey = userKey ? userKey.replace(/[^a-zA-Z0-9_]/g, '_') : 'default';
  const storageKey = `nkorera_daily_plan_target_${safeUserKey}`;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > 0) return Math.min(50, Math.max(1, parsed));
    }
  } catch (e) {}
  return 3; // Standard recommended daily target: 3 lesson plans
}

export function setUserDailyTarget(target: number, userKey?: string): void {
  const safeUserKey = userKey ? userKey.replace(/[^a-zA-Z0-9_]/g, '_') : 'default';
  const storageKey = `nkorera_daily_plan_target_${safeUserKey}`;
  const validTarget = Math.max(1, Math.min(50, Math.round(target)));
  try {
    localStorage.setItem(storageKey, validTarget.toString());
    window.dispatchEvent(new CustomEvent('nkorera_daily_goal_updated'));
  } catch (e) {}
}

export function getDailyPlansCount(userKey?: string): DailyGoalData {
  const todayStr = getTodayKey();
  const safeUserKey = userKey ? userKey.replace(/[^a-zA-Z0-9_]/g, '_') : 'default';

  let cbcCount = 0;
  let remedialCount = 0;
  let nurseryCount = 0;

  // 1. Scan saved CBC plans
  try {
    const localCbc = localStorage.getItem('nkorera_local_saved_plans');
    if (localCbc) {
      const plans = JSON.parse(localCbc);
      if (Array.isArray(plans)) {
        for (let i = 0; i < plans.length; i++) {
          const d = plans[i]?.createdAt || plans[i]?.updatedAt;
          if (d && typeof d === 'string' && d.startsWith(todayStr)) {
            cbcCount++;
          }
        }
      }
    }
  } catch (e) {}

  // 2. Scan saved Remedial plans
  try {
    const localRemedial = localStorage.getItem('nkorera_local_saved_remedial_plans');
    if (localRemedial) {
      const plans = JSON.parse(localRemedial);
      if (Array.isArray(plans)) {
        for (let i = 0; i < plans.length; i++) {
          const d = plans[i]?.createdAt || plans[i]?.updatedAt;
          if (d && typeof d === 'string' && d.startsWith(todayStr)) {
            remedialCount++;
          }
        }
      }
    }
  } catch (e) {}

  // 3. Scan saved Nursery plans
  try {
    const localNursery = localStorage.getItem('nkorera_local_saved_nursery_plans');
    if (localNursery) {
      const plans = JSON.parse(localNursery);
      if (Array.isArray(plans)) {
        for (let i = 0; i < plans.length; i++) {
          const d = plans[i]?.createdAt || plans[i]?.updatedAt;
          if (d && typeof d === 'string' && d.startsWith(todayStr)) {
            nurseryCount++;
          }
        }
      }
    }
  } catch (e) {}

  // 4. Check manual / logged count for today
  let manualLogged = 0;
  const manualKey = `nkorera_daily_manual_plans_${safeUserKey}_${todayStr}`;
  try {
    const manualSaved = localStorage.getItem(manualKey);
    if (manualSaved) {
      const parsed = parseInt(manualSaved, 10);
      if (!isNaN(parsed) && parsed > 0) manualLogged = parsed;
    }
  } catch (e) {}

  const totalGenerated = cbcCount + remedialCount + nurseryCount + manualLogged;
  const dailyTarget = getUserDailyTarget(userKey);
  const percentage = dailyTarget > 0 ? Math.round((totalGenerated / dailyTarget) * 100) : 0;
  const remaining = Math.max(0, dailyTarget - totalGenerated);
  const isGoalReached = totalGenerated >= dailyTarget;

  return {
    generatedToday: totalGenerated,
    dailyTarget,
    percentage,
    remaining,
    isGoalReached,
    breakdown: {
      cbc: cbcCount,
      remedial: remedialCount,
      nursery: nurseryCount,
      manualLogged
    }
  };
}

export function adjustManualDailyPlanCount(delta: number, userKey?: string): number {
  const todayStr = getTodayKey();
  const safeUserKey = userKey ? userKey.replace(/[^a-zA-Z0-9_]/g, '_') : 'default';
  const manualKey = `nkorera_daily_manual_plans_${safeUserKey}_${todayStr}`;

  try {
    const current = parseInt(localStorage.getItem(manualKey) || '0', 10) || 0;
    const nextVal = Math.max(0, current + delta);
    localStorage.setItem(manualKey, nextVal.toString());
    window.dispatchEvent(new CustomEvent('nkorera_daily_goal_updated'));
    return nextVal;
  } catch (e) {
    return 0;
  }
}

export function recordLessonPlanGenerated(userKey?: string): number {
  return adjustManualDailyPlanCount(1, userKey);
}

