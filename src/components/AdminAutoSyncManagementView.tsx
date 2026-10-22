import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  RefreshCw, 
  Send, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Wifi, 
  Bell, 
  Megaphone, 
  Smartphone, 
  Database, 
  Sparkles, 
  PhoneCall, 
  Pin,
  Bot,
  Volume2
} from 'lucide-react';
import { speakRobotOfflineAlert } from '../utils/robotVoice';
import { Announcement, AppConfig } from '../types';
import { 
  subscribeToLiveAnnouncements, 
  subscribeToLiveAppConfig, 
  publishLiveAnnouncement, 
  deleteLiveAnnouncement, 
  publishLiveAppConfig, 
  syncAllTeachersToCloud, 
  triggerManualSync, 
  getAutoSyncState, 
  subscribeToAutoSyncState,
  AutoSyncState 
} from '../utils/autoSync';
import { getAllTeachers } from '../utils/auth';

interface AdminAutoSyncManagementViewProps {
  adminEmail: string;
}

export const AdminAutoSyncManagementView: React.FC<AdminAutoSyncManagementViewProps> = ({ adminEmail }) => {
  const [syncState, setSyncState] = useState<AutoSyncState>(getAutoSyncState());
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [appConfig, setAppConfig] = useState<AppConfig>({
    id: 'global_settings',
    whatsappNumber: '0781339530',
    supportEmail: 'nkundimana123theogene@gmail.com',
    chatbotGreeting: 'Hello! Nkorera AI is here to assist you.',
    isMaintenanceMode: false,
    broadcastBanner: '',
    broadcastBannerActive: false,
    momoNumber: '0781339530',
    momoName: 'NKUNDIMANA Theogene'
  });

  // Announcement Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<'news' | 'update' | 'alert' | 'info'>('news');
  const [isPinned, setIsPinned] = useState(false);
  const [isPublishingAnnouncement, setIsPublishingAnnouncement] = useState(false);

  // App Config Form State
  const [broadcastBannerText, setBroadcastBannerText] = useState('');
  const [isBannerActive, setIsBannerActive] = useState(false);
  const [momoNumber, setMomoNumber] = useState('0781339530');
  const [momoName, setMomoName] = useState('NKUNDIMANA Theogene');
  const [whatsappNumber, setWhatsappNumber] = useState('0781339530');
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Teachers Sync State
  const [isSyncingTeachers, setIsSyncingTeachers] = useState(false);
  const [teachersCount, setTeachersCount] = useState(0);

  // Notification feedback
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const unsubState = subscribeToAutoSyncState(setSyncState);
    const unsubAnnouncements = subscribeToLiveAnnouncements(setAnnouncements);
    const unsubConfig = subscribeToLiveAppConfig((cfg) => {
      if (cfg) {
        setAppConfig(cfg);
        setBroadcastBannerText(cfg.broadcastBanner || '');
        setIsBannerActive(!!cfg.broadcastBannerActive);
        setMomoNumber(cfg.momoNumber || '0781339530');
        setMomoName(cfg.momoName || 'NKUNDIMANA Theogene');
        setWhatsappNumber(cfg.whatsappNumber || '0781339530');
      }
    });

    try {
      const teachers = getAllTeachers();
      setTeachersCount(teachers.length);
    } catch {}

    return () => {
      unsubState();
      unsubAnnouncements();
      unsubConfig();
    };
  }, []);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // 1. Handle Publishing Announcement
  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      showNotification('Please fill in both announcement title and details!', 'error');
      return;
    }

    setIsPublishingAnnouncement(true);
    try {
      await publishLiveAnnouncement({
        title: newTitle.trim(),
        content: newContent.trim(),
        type: newType,
        isPinned,
        isActive: true,
        authorName: 'NKUNDIMANA Theogene (Admin)',
        authorEmail: adminEmail,
        date: new Date().toISOString().split('T')[0]
      });

      setNewTitle('');
      setNewContent('');
      setIsPinned(false);
      showNotification('Announcement broadcasted to Cloud Firestore instantly! All users receive it immediately.');
    } catch (err: any) {
      showNotification('Failed to send announcement: ' + (err?.message || 'Try again'), 'error');
    } finally {
      setIsPublishingAnnouncement(false);
    }
  };

  // 2. Handle Deleting Announcement
  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement from Cloud for all users?')) {
      return;
    }

    try {
      await deleteLiveAnnouncement(id);
      showNotification('Announcement deleted from Cloud successfully.');
    } catch (err: any) {
      showNotification('Failed to delete: ' + (err?.message || 'Error'), 'error');
    }
  };

  // 3. Handle Saving App Config & Banner
  const handleSaveAppConfig = async () => {
    setIsSavingConfig(true);
    try {
      await publishLiveAppConfig({
        ...appConfig,
        broadcastBanner: broadcastBannerText.trim(),
        broadcastBannerActive: isBannerActive,
        momoNumber: momoNumber.trim(),
        momoName: momoName.trim(),
        whatsappNumber: whatsappNumber.trim()
      });
      showNotification('App configuration updated instantly! All web and app users receive changes immediately.');
    } catch (err: any) {
      showNotification('Failed to save config: ' + (err?.message || 'Error'), 'error');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // 4. Handle Syncing Teachers
  const handleSyncTeachers = async () => {
    setIsSyncingTeachers(true);
    try {
      const teachers = getAllTeachers();
      const res = await syncAllTeachersToCloud(teachers);
      showNotification(`Successfully synced all ${res.count} teachers and their quotas to Cloud Firestore!`);
    } catch (err: any) {
      showNotification('Teacher sync failed: ' + (err?.message || 'Error'), 'error');
    } finally {
      setIsSyncingTeachers(false);
    }
  };

  // 5. Handle Force Sync
  const handleForceSync = async () => {
    try {
      await triggerManualSync();
      showNotification('All portal data updated in Cloud successfully (Full Sync).');
    } catch (err: any) {
      showNotification('Sync failed: ' + (err?.message || 'Error'), 'error');
    }
  };

  return (
    <div className="space-y-6 text-slate-200">
      
      {/* FEEDBACK TOAST */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-3 border shadow-xl animate-fade-in ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50' 
            : 'bg-red-950/90 text-red-300 border-red-500/50'
        }`}>
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* CLOUD CONNECTION STATUS HERO */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/30 border border-emerald-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="relative mt-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-4 ring-slate-900 animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-4 ring-slate-900"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  Automatically Sync Data (Live Cloud Broadcast)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Real-time Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Any changes or updates you publish immediately reach all active users and downloaded app users in real-time, without requiring a manual app update!
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  DB: <span className="text-slate-200">ai-studio-nkoreraeducation</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  Status: <span className="text-emerald-300 font-bold">{syncState.isOnline ? 'Online (Connected)' : 'Offline'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  Last Synced: <span className="text-slate-200">{syncState.lastSyncTime}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
            <button
              onClick={() => speakRobotOfflineAlert()}
              className="w-full md:w-auto px-3.5 py-2.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-400/40 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              title="Test Robot Voice: No internet connection. Please search for internet connection."
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Test Robot Voice</span>
              <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
            </button>

            <button
              onClick={handleForceSync}
              disabled={syncState.isSyncing}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
              <span>{syncState.isSyncing ? 'Syncing...' : 'Run Sync Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: BROADCAST ANNOUNCEMENTS & LIVE APP CONFIG */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SECTION 1: CREATE LIVE ANNOUNCEMENT */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <Megaphone className="w-5 h-5" />
              <h4 className="text-sm font-black uppercase tracking-wider text-white">
                Send Instant Announcement (Live Broadcast)
              </h4>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">
              Delivered instantly to all teacher devices
            </span>
          </div>

          <form onSubmit={handlePublishAnnouncement} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Announcement Title:
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. New Schedule for Term 3 Lessons"
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Message Type:
                </label>
                <select
                  value={newType}
                  onChange={(e: any) => setNewType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all"
                >
                  <option value="news">Latest News</option>
                  <option value="update">System Update</option>
                  <option value="alert">Urgent Alert</option>
                  <option value="info">Important Information</option>
                </select>
              </div>

              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700 focus:ring-emerald-500"
                  />
                  <Pin className={`w-3.5 h-3.5 ${isPinned ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>Pin to Top (Priority)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Announcement Details / Content:
              </label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={3}
                placeholder="Type the message you want all teachers to receive instantly..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isPublishingAnnouncement}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
            >
              <Send className={`w-4 h-4 ${isPublishingAnnouncement ? 'animate-bounce' : ''}`} />
              <span>{isPublishingAnnouncement ? 'Publishing to Cloud...' : 'Send Live Broadcast'}</span>
            </button>
          </form>
        </div>

        {/* SECTION 2: LIVE APP CONFIGURATION & BROADCAST BANNER */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Bell className="w-5 h-5" />
                <h4 className="text-sm font-black uppercase tracking-wider text-white">
                  Broadcast Banner &amp; Application Settings
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">
                Live App Settings
              </span>
            </div>

            {/* BROADCAST BANNER */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300">
                  Top Notification Banner Message:
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-amber-300 font-bold select-none">
                  <input
                    type="checkbox"
                    checked={isBannerActive}
                    onChange={(e) => setIsBannerActive(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700 focus:ring-amber-500"
                  />
                  <span>Show Banner</span>
                </label>
              </div>
              <input
                type="text"
                value={broadcastBannerText}
                onChange={(e) => setBroadcastBannerText(e.target.value)}
                placeholder="e.g. Welcome teachers! New Term 3 teaching materials have been added."
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all"
              />
            </div>

            {/* MOMO PAYMENT NUMBER & WHATSAPP LINE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  MoMo Payment Number:
                </label>
                <input
                  type="text"
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  MoMo Account Name:
                </label>
                <input
                  type="text"
                  value={momoName}
                  onChange={(e) => setMomoName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  WhatsApp Support Line:
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveAppConfig}
            disabled={isSavingConfig}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-950/40 cursor-pointer disabled:opacity-50 mt-4"
          >
            <Sparkles className={`w-4 h-4 ${isSavingConfig ? 'animate-spin' : ''}`} />
            <span>{isSavingConfig ? 'Saving to Cloud...' : 'Save & Publish to All Instantly'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 3: CLOUD TEACHER QUOTAS SYNC */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Sync All Teachers &amp; Quotas to Cloud Firestore
            </h4>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            When you assign teacher quotas in <strong>Teachers &amp; Quotas</strong>, click here to push the updated quotas to Cloud Firestore immediately. Teachers will see their updated quota on their device instantly!
          </p>
          <div className="text-[11px] text-slate-500 font-mono">
            Teachers registered in system: <strong className="text-emerald-400">{teachersCount}</strong>
          </div>
        </div>

        <button
          onClick={handleSyncTeachers}
          disabled={isSyncingTeachers}
          className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-400 ${isSyncingTeachers ? 'animate-spin' : ''}`} />
          <span>{isSyncingTeachers ? 'Syncing...' : 'Sync All Teachers Now'}</span>
        </button>
      </div>

      {/* SECTION 4: ACTIVE ANNOUNCEMENTS LIVE LIST */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white">
            <Radio className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-black uppercase tracking-wider">
              Live Announcements &amp; News Active in App ({announcements.length})
            </h4>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Direct Cloud Feed
          </span>
        </div>

        {announcements.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs italic">
            No announcements published yet. Use the form above to broadcast your first announcement!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 space-y-2 relative transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      item.type === 'alert' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      item.type === 'update' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      item.type === 'info' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {item.type}
                    </span>
                    {item.isPinned && (
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        <Pin className="w-2.5 h-2.5" /> Pinned
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.date}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteAnnouncement(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Delete announcement from Cloud"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h5 className="text-xs font-black text-white leading-tight">
                  {item.title}
                </h5>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {item.content}
                </p>

                {item.authorName && (
                  <div className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-900">
                    By: {item.authorName}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
