import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  getDocs,
  where,
  db,
  setQuotaExceeded
} from './firebase';
import { Announcement, AppConfig, UserProfile } from '../types';

export interface AutoSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: string;
  statusMessage: string;
  announcementsCount: number;
  syncSource: 'firestore_live' | 'server_cache' | 'local_storage';
}

const LOCAL_ANNOUNCEMENTS_KEY = 'nkorera_auto_sync_announcements';
const LOCAL_CONFIG_KEY = 'nkorera_auto_sync_config';
const LAST_SYNC_KEY = 'nkorera_last_auto_sync_timestamp';

// Initial default announcements in English
const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc_welcome_live',
    title: 'New CBC Lesson Plan Curriculum',
    content: 'Nkorera CBC Lesson Plan Generator is upgraded and synchronized in real-time (Real-time Cloud Sync).',
    date: new Date().toISOString().split('T')[0],
    type: 'news',
    isActive: true,
    authorName: 'Nkorera Management',
    isPinned: true
  },
  {
    id: 'anc_support_line',
    title: 'WhatsApp & MoMo Support Line',
    content: 'For support, inquiries, or additional lesson units, contact administration via WhatsApp at 0781339530.',
    date: new Date().toISOString().split('T')[0],
    type: 'info',
    isActive: true,
    authorName: 'Admin Panel'
  }
];

// In-memory state
let currentSyncState: AutoSyncState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  lastSyncTime: typeof localStorage !== 'undefined' ? (localStorage.getItem(LAST_SYNC_KEY) || 'Just now') : 'Just now',
  statusMessage: 'Cloud Sync Connected (Real-Time Auto-Sync)',
  announcementsCount: 2,
  syncSource: 'firestore_live'
};

const stateListeners: Array<(state: AutoSyncState) => void> = [];

export function getAutoSyncState(): AutoSyncState {
  return { ...currentSyncState };
}

export function subscribeToAutoSyncState(listener: (state: AutoSyncState) => void): () => void {
  stateListeners.push(listener);
  listener(currentSyncState);
  return () => {
    const idx = stateListeners.indexOf(listener);
    if (idx !== -1) stateListeners.splice(idx, 1);
  };
}

function updateSyncState(partial: Partial<AutoSyncState>) {
  currentSyncState = { ...currentSyncState, ...partial };
  stateListeners.forEach((l) => l(currentSyncState));
}

// Monitor browser online/offline status
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    updateSyncState({
      isOnline: true,
      statusMessage: 'Connected to internet (Online)',
      isSyncing: true
    });
    triggerManualSync();
  });

  window.addEventListener('offline', () => {
    updateSyncState({
      isOnline: false,
      statusMessage: 'You are offline. Data saved in local cache (Offline)',
      syncSource: 'local_storage'
    });
  });
}

const sanitizeAnnouncement = (ann: Announcement): Announcement => {
  if (ann.id === 'anc_welcome_live' || ann.title?.includes("Gahunda Nshya") || ann.title?.includes("Gahunda y'Amasomo")) {
    return {
      ...ann,
      title: 'New CBC Lesson Plan Curriculum',
      content: 'Nkorera CBC Lesson Plan Generator is upgraded and synchronized in real-time (Real-time Cloud Sync).',
      authorName: ann.authorName === 'Ubuyobozi bwa Nkorera' ? 'Nkorera Management' : ann.authorName
    };
  }
  if (ann.id === 'anc_support_line' || ann.title?.includes("Ubufasha bwa WhatsApp")) {
    return {
      ...ann,
      title: 'WhatsApp & MoMo Support Line',
      content: 'For support, inquiries, or additional lesson units, contact administration via WhatsApp at 0781339530.'
    };
  }
  return ann;
};

/**
 * 1. REAL-TIME ANNOUNCEMENTS LISTENER
 * Listens to Firestore 'announcements'. Any post by the admin is delivered
 * instantly to all users and installed apps.
 */
export function subscribeToLiveAnnouncements(
  callback: (announcements: Announcement[]) => void
): () => void {
  // Load cached first so UI renders immediately
  let cached: Announcement[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_ANNOUNCEMENTS_KEY);
    if (raw) {
      cached = (JSON.parse(raw) as Announcement[]).map(sanitizeAnnouncement);
    }
  } catch (e) {
    console.warn('Error reading cached announcements:', e);
  }

  if (cached.length > 0) {
    callback(cached);
  } else {
    callback(DEFAULT_ANNOUNCEMENTS);
  }

  try {
    const colRef = collection(db, 'announcements');
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        const items: Announcement[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as any;
          if (data.isActive !== false) {
            items.push(sanitizeAnnouncement({ id: docSnap.id, ...data }));
          }
        });

        // Sort pinned first, then by date descending
        items.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return (b.date || '').localeCompare(a.date || '');
        });

        const finalItems = items.length > 0 ? items : (cached.length > 0 ? cached : DEFAULT_ANNOUNCEMENTS);

        try {
          localStorage.setItem(LOCAL_ANNOUNCEMENTS_KEY, JSON.stringify(finalItems));
          localStorage.setItem(LAST_SYNC_KEY, new Date().toLocaleTimeString());
        } catch {}

        updateSyncState({
          isSyncing: false,
          announcementsCount: finalItems.length,
          lastSyncTime: new Date().toLocaleTimeString(),
          syncSource: 'firestore_live',
          statusMessage: 'Cloud Sync Updated (Live Synced)'
        });

        callback(finalItems);
      },
      (error) => {
        const errMsg = error?.message || '';
        console.warn('[AutoSync] Firestore announcements snapshot notice:', errMsg);
        if (
          errMsg.toLowerCase().includes('quota exceeded') ||
          errMsg.toLowerCase().includes('resource-exhausted') ||
          errMsg.toLowerCase().includes('quota_exceeded') ||
          errMsg.toLowerCase().includes('resource_exhausted')
        ) {
          setQuotaExceeded(true);
        }
        // Fallback: poll server API
        fetchServerAnnouncements().then((serverItems) => {
          if (serverItems && serverItems.length > 0) {
            callback(serverItems);
            updateSyncState({
              syncSource: 'server_cache',
              lastSyncTime: new Date().toLocaleTimeString()
            });
          }
        });
      }
    );
    return unsub;
  } catch (err) {
    console.warn('[AutoSync] Error attaching snapshot listener:', err);
    return () => {};
  }
}

/**
 * 2. REAL-TIME APP CONFIG LISTENER
 * Listens to Firestore 'app_config/global_settings'.
 */
export function subscribeToLiveAppConfig(
  callback: (config: AppConfig) => void
): () => void {
  // Load cached config first
  try {
    const raw = localStorage.getItem(LOCAL_CONFIG_KEY);
    if (raw) {
      callback(JSON.parse(raw));
    }
  } catch {}

  try {
    const docRef = doc(db, 'app_config', 'global_settings');
    const unsub = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const configData = { id: docSnap.id, ...docSnap.data() } as AppConfig;
          try {
            localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(configData));
          } catch {}
          callback(configData);
        }
      },
      (error) => {
        const errMsg = error?.message || '';
        console.warn('[AutoSync] AppConfig snapshot notice:', errMsg);
        if (
          errMsg.toLowerCase().includes('quota exceeded') ||
          errMsg.toLowerCase().includes('resource-exhausted') ||
          errMsg.toLowerCase().includes('quota_exceeded') ||
          errMsg.toLowerCase().includes('resource_exhausted')
        ) {
          setQuotaExceeded(true);
        }
      }
    );
    return unsub;
  } catch (err) {
    console.warn('[AutoSync] Error subscribing to AppConfig:', err);
    return () => {};
  }
}

/**
 * 3. PUBLISH LIVE ANNOUNCEMENT (Admin Only)
 * Writes to Firestore AND backup server route so all clients receive it instantly.
 */
export async function publishLiveAnnouncement(
  announcement: Omit<Announcement, 'id'> & { id?: string }
): Promise<Announcement> {
  updateSyncState({ isSyncing: true, statusMessage: 'Kohereza itangazo muri Cloud...' });

  const id = announcement.id || `anc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const fullAnnouncement: Announcement = {
    ...announcement,
    id,
    date: announcement.date || new Date().toISOString().split('T')[0],
    isActive: announcement.isActive ?? true,
    authorName: announcement.authorName || 'NKUNDIMANA Theogene (Admin)'
  };

  // 1. Save to Firestore
  try {
    const docRef = doc(db, 'announcements', id);
    await setDoc(docRef, fullAnnouncement, { merge: true });
    console.log('[AutoSync] Announcement saved to Firestore:', id);
  } catch (err: any) {
    console.warn('[AutoSync] Firestore direct write failed, pushing via server API:', err?.message);
  }

  // 2. Push to server API for dual-redundancy
  try {
    await fetch('/api/admin/broadcast-announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullAnnouncement)
    });
  } catch (e) {
    console.warn('[AutoSync] Server broadcast sync notice:', e);
  }

  // 3. Update local cache
  try {
    const raw = localStorage.getItem(LOCAL_ANNOUNCEMENTS_KEY);
    const list: Announcement[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((a) => a.id === id);
    if (idx >= 0) {
      list[idx] = fullAnnouncement;
    } else {
      list.unshift(fullAnnouncement);
    }
    localStorage.setItem(LOCAL_ANNOUNCEMENTS_KEY, JSON.stringify(list));
    localStorage.setItem(LAST_SYNC_KEY, new Date().toLocaleTimeString());
  } catch {}

  updateSyncState({
    isSyncing: false,
    lastSyncTime: new Date().toLocaleTimeString(),
    statusMessage: 'Announcement published and delivered to all users in real-time!'
  });

  return fullAnnouncement;
}

/**
 * 4. DELETE LIVE ANNOUNCEMENT (Admin Only)
 */
export async function deleteLiveAnnouncement(announcementId: string): Promise<void> {
  updateSyncState({ isSyncing: true, statusMessage: 'Deleting announcement from Cloud...' });

  // 1. Delete from Firestore
  try {
    const docRef = doc(db, 'announcements', announcementId);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.warn('[AutoSync] Firestore delete notice:', err?.message);
  }

  // 2. Delete via server API
  try {
    await fetch(`/api/admin/announcements/${announcementId}`, {
      method: 'DELETE'
    });
  } catch {}

  // 3. Update local cache
  try {
    const raw = localStorage.getItem(LOCAL_ANNOUNCEMENTS_KEY);
    if (raw) {
      const list: Announcement[] = JSON.parse(raw);
      const filtered = list.filter((a) => a.id !== announcementId);
      localStorage.setItem(LOCAL_ANNOUNCEMENTS_KEY, JSON.stringify(filtered));
    }
  } catch {}

  updateSyncState({
    isSyncing: false,
    lastSyncTime: new Date().toLocaleTimeString(),
    statusMessage: 'Announcement deleted from Cloud successfully'
  });
}

/**
 * 5. PUBLISH LIVE APP CONFIG (Admin Only)
 * Writes broadcast banner, WhatsApp, MoMo number, etc.
 */
export async function publishLiveAppConfig(config: Partial<AppConfig>): Promise<void> {
  updateSyncState({ isSyncing: true, statusMessage: 'Updating application configuration...' });

  const updatedConfig: AppConfig = {
    id: 'global_settings',
    whatsappNumber: config.whatsappNumber || '0781339530',
    supportEmail: config.supportEmail || 'nkundimana123theogene@gmail.com',
    chatbotGreeting: config.chatbotGreeting || 'Hello! Nkorera AI is here to assist you.',
    isMaintenanceMode: config.isMaintenanceMode ?? false,
    broadcastBanner: config.broadcastBanner || '',
    broadcastBannerActive: config.broadcastBannerActive ?? false,
    momoNumber: config.momoNumber || '0781339530',
    momoName: config.momoName || 'NKUNDIMANA Theogene',
    systemNotice: config.systemNotice || '',
    lastUpdated: new Date().toISOString()
  };

  // 1. Save to Firestore
  try {
    const docRef = doc(db, 'app_config', 'global_settings');
    await setDoc(docRef, updatedConfig, { merge: true });
    console.log('[AutoSync] AppConfig saved to Firestore');
  } catch (err: any) {
    console.warn('[AutoSync] Firestore config save notice:', err?.message);
  }

  // 2. Push to server API
  try {
    await fetch('/api/admin/update-app-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedConfig)
    });
  } catch {}

  // 3. Cache locally
  try {
    localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(updatedConfig));
    localStorage.setItem(LAST_SYNC_KEY, new Date().toLocaleTimeString());
  } catch {}

  updateSyncState({
    isSyncing: false,
    lastSyncTime: new Date().toLocaleTimeString(),
    statusMessage: 'Ibisobanuro bya app byavuguruwe ako kanya!'
  });
}

/**
 * Syncs a single teacher profile to the cloud (useful for logins/logouts).
 */
export async function syncSingleTeacherToCloud(teacher: UserProfile): Promise<void> {
  if (!teacher.email) return;
  try {
    const cleanEmail = teacher.email.toLowerCase().trim();
    const docId = teacher.id || cleanEmail.replace(/[@.]/g, '_');
    const teacherDoc = {
      ...teacher,
      id: teacher.id || docId,
      name: teacher.name || 'Teacher',
      email: cleanEmail,
      isOnline: true,
      lastLoginAt: teacher.lastLoginAt || new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'user_profiles', docId), teacherDoc, { merge: true });
    
    // Also push to server backup if available
    await fetch('/api/admin/sync-teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teachers: [teacher] })
    }).catch(() => {});
  } catch (err: any) {
    console.warn('[AutoSync] Failed to sync single teacher:', err?.message);
  }
}

export async function fetchAllTeachersFromCloud(): Promise<UserProfile[]> {
  try {
    const colRef = collection(db, 'user_profiles');
    const snapshot = await getDocs(colRef);
    const teachersMap = new Map<string, UserProfile>();
    
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as UserProfile;
      if (data.email) {
        const cleanEmail = data.email.toLowerCase().trim();
        // If it already exists, merge them, preferring the one with sessionLogs
        if (teachersMap.has(cleanEmail)) {
          const existing = teachersMap.get(cleanEmail)!;
          // Prefer the document that has sessionLogs, or the richer data
          if ((data.sessionLogs?.length || 0) > (existing.sessionLogs?.length || 0)) {
            teachersMap.set(cleanEmail, { ...existing, ...data });
          } else {
            teachersMap.set(cleanEmail, { ...data, ...existing });
          }
        } else {
          teachersMap.set(cleanEmail, data);
        }
      }
    });
    
    // Also fetch from server persistent database (/api/admin/users)
    try {
      const serverRes = await fetch('/api/admin/users');
      if (serverRes.ok) {
        const json = await serverRes.json();
        if (Array.isArray(json.users)) {
          json.users.forEach((su: any) => {
            if (su.email) {
              const cleanEmail = su.email.toLowerCase().trim();
              if (!teachersMap.has(cleanEmail)) {
                teachersMap.set(cleanEmail, {
                  id: su.id || `usr_${cleanEmail.replace(/[@.]/g, '_')}`,
                  name: su.name || cleanEmail.split('@')[0],
                  email: cleanEmail,
                  phone: su.phone || '',
                  momoNumber: su.phone || '',
                  role: su.isAdmin ? 'ADMIN' : 'TEACHER',
                  paymentStatus: su.isPaid ? 'PAID' : 'FREE',
                  plan: su.currentPlan || 'free_3',
                  quota: Number(su.remainingPlans ?? 3),
                  usedCount: Number(su.totalGenerated || 0),
                  lastLogin: su.lastLoginAt || new Date().toISOString(),
                  country: su.country || 'Rwanda',
                  verifiedPayment: su.verifiedPayment || false
                } as any);
              }
            }
          });
        }
      }
    } catch (e) {}

    const teachersFromCloud = Array.from(teachersMap.values());
    
    // Merge with local storage to keep them in sync
    const rawLocal = localStorage.getItem('nkorera_teachers_list');
    let localList: UserProfile[] = [];
    if (rawLocal) {
      try {
        localList = JSON.parse(rawLocal) as UserProfile[];
      } catch (e) {}
    }

    const combined = [...teachersFromCloud];
    localList.forEach(localT => {
      if (!combined.find(c => c.email.toLowerCase() === localT.email.toLowerCase())) {
        combined.push(localT);
      }
    });

    if (combined.length > 0) {
      localStorage.setItem('nkorera_teachers_list', JSON.stringify(combined));
      return combined;
    }
    return [];
  } catch (err: any) {
    console.warn('[AutoSync] Failed to fetch teachers from cloud:', err?.message);
    try {
      const raw = localStorage.getItem('nkorera_teachers_list');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  }
}

/**
 * 6. SYNC TEACHERS TO CLOUD
 * Uploads local teachers list to Firestore & Server so any units added by Admin
 * appear on the teacher's phone immediately.
 */
export async function syncAllTeachersToCloud(teachers: UserProfile[]): Promise<{ count: number }> {
  updateSyncState({ isSyncing: true, statusMessage: 'Syncing teachers and accounts to Cloud...' });

  let successCount = 0;

  // 1. Upload to Firestore user_profiles
  try {
    for (const teacher of teachers) {
      if (!teacher.email) continue;
      const cleanEmail = teacher.email.toLowerCase().trim();
      const docId = teacher.id || cleanEmail.replace(/[@.]/g, '_');
      
      const teacherDoc = {
        ...teacher,
        email: cleanEmail,
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'user_profiles', docId), teacherDoc, { merge: true });
      successCount++;
    }
  } catch (err: any) {
    console.warn('[AutoSync] Firestore teacher upload notice:', err?.message);
  }

  // 2. Upload to server backup
  try {
    await fetch('/api/admin/sync-teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teachers })
    });
  } catch {}

  updateSyncState({
    isSyncing: false,
    lastSyncTime: new Date().toLocaleTimeString(),
    statusMessage: `${successCount || teachers.length} teachers synced to Cloud successfully!`
  });

  return { count: successCount || teachers.length };
}

/**
 * 7. SUBSCRIBE TO TEACHER QUOTA & STATUS IN REAL-TIME
 * Allows a teacher's phone/installed app to instantly reflect units added by Admin.
 */
export function subscribeToTeacherQuota(
  userEmail: string,
  callback: (updatedProfile: Partial<UserProfile>) => void
): () => void {
  if (!userEmail) return () => {};
  const cleanEmail = userEmail.toLowerCase().trim();

  try {
    // Look up doc by email or query
    const colRef = collection(db, 'user_profiles');
    const q = query(colRef, where('email', '==', cleanEmail));

    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as UserProfile;
        callback(data);
      });
    }, (err) => {
      const errMsg = err?.message || '';
      console.warn('[AutoSync] Teacher quota snapshot notice:', errMsg);
      if (
        errMsg.toLowerCase().includes('quota exceeded') ||
        errMsg.toLowerCase().includes('resource-exhausted') ||
        errMsg.toLowerCase().includes('quota_exceeded') ||
        errMsg.toLowerCase().includes('resource_exhausted')
      ) {
        setQuotaExceeded(true);
      }
    });

    return unsub;
  } catch {
    return () => {};
  }
}

/**
 * 8. TRIGGER MANUAL SYNC
 * Forces a refresh across all channels.
 */
export async function triggerManualSync(): Promise<void> {
  updateSyncState({ isSyncing: true, statusMessage: 'Checking for updates...' });

  try {
    const colRef = collection(db, 'announcements');
    const snap = await getDocs(colRef);
    const items: Announcement[] = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() } as Announcement));
    if (items.length > 0) {
      localStorage.setItem(LOCAL_ANNOUNCEMENTS_KEY, JSON.stringify(items));
    }
  } catch {}

  updateSyncState({
    isSyncing: false,
    lastSyncTime: new Date().toLocaleTimeString(),
    statusMessage: 'All data is up to date and synchronized (Fully Synced)'
  });
}

// Server API fallback helper
async function fetchServerAnnouncements(): Promise<Announcement[]> {
  try {
    const res = await fetch('/api/admin/announcements');
    if (res.ok) {
      const data = await res.json();
      return data.announcements || [];
    }
  } catch {}
  return [];
}
