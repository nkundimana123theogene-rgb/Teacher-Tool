import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  MessageSquare, 
  Phone, 
  RefreshCw, 
  Sparkles, 
  Volume2, 
  X, 
  Zap,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  Copy
} from 'lucide-react';
import { PaymentNotification, UserProfile } from '../types';
import { 
  fetchNotificationsApi, 
  markNotificationReadApi, 
  playPaymentChimeSound, 
  simulateTestNotificationApi 
} from '../utils/notifications';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onOpenPaymentHistory?: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenPaymentHistory
}) => {
  const [notifications, setNotifications] = useState<PaymentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'received' | 'sent'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const isAdmin = currentUser?.email === 'nkundimana123theogene@gmail.com' || Boolean(currentUser?.isAdmin);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await fetchNotificationsApi(
        currentUser?.email,
        currentUser?.phone || currentUser?.momoNumber,
        isAdmin ? 'admin' : 'user'
      );
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, currentUser?.email]);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationReadApi(id, false, currentUser?.email, isAdmin ? 'admin' : 'user');
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    await markNotificationReadApi(undefined, true, currentUser?.email, isAdmin ? 'admin' : 'user');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    playPaymentChimeSound();
    try {
      await simulateTestNotificationApi({
        phone: '0786332660',
        name: 'NSANZIMANA Francois',
        email: 'nsanzimanafrancois91@gmail.com',
        amount: 5000,
        plans: 60
      });
      await loadNotifications();
    } catch (e) {
    } finally {
      setIsSimulating(false);
    }
  };

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'unread') return !notif.read;
    if (activeTab === 'received') return notif.type === 'PAYMENT_RECEIVED';
    if (activeTab === 'sent') return notif.type === 'PAYMENT_SENT_PLANS_UNLOCKED';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl text-white flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER */}
        <div className="bg-slate-950 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 relative">
              <Bell className="w-5 h-5 fill-current" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>Payment Notifications & Alerts</span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  {isAdmin ? 'Admin Alert Feed' : 'My Notifications'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {isAdmin 
                  ? "Incoming payment alerts received on MoMo (0781339530) and unlocked teacher plans"
                  : "Payment receipts and instant lesson plan unlocking confirmations"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={playPaymentChimeSound}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors cursor-pointer"
              title="Test Chime Sound"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={loadNotifications}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh Notifications"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CONTROLS & FILTER TABS */}
        <div className="bg-slate-950/60 p-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>All ({notifications.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'unread'
                  ? 'bg-rose-500 text-white font-black shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Unread ({unreadCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('received')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'received'
                  ? 'bg-emerald-600 text-white font-black shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Received</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sent')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'sent'
                  ? 'bg-teal-600 text-white font-black shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Sent</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 border border-slate-700 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mark All Read</span>
              </button>
            )}

            {isAdmin && (
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isSimulating}
                className="px-2.5 py-1 text-[11px] font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all flex items-center gap-1 shadow-md cursor-pointer disabled:opacity-50"
                title="Simulate incoming MoMo payment alert (5,000 RWF)"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{isSimulating ? 'Processing...' : 'Test MoMo Alert'}</span>
              </button>
            )}
          </div>
        </div>

        {/* NOTIFICATIONS LIST */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-400">No notifications found in this category</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When a payment is processed via Mobile Money or Webhook, instant alert notifications appear here.
              </p>
            </div>
          ) : (
            filteredNotifications.map(notif => {
              const isReceived = notif.type === 'PAYMENT_RECEIVED';
              const isUnread = !notif.read;

              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-2xl border transition-all space-y-2.5 relative ${
                    isUnread
                      ? isReceived
                        ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                        : 'bg-teal-950/40 border-teal-500/60 shadow-lg'
                      : 'bg-slate-950/70 border-slate-800/90'
                  }`}
                >
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-xl text-slate-950 font-black shrink-0 ${
                        isReceived ? 'bg-emerald-400' : 'bg-teal-400'
                      }`}>
                        {isReceived ? <ArrowDownLeft className="w-4 h-4 stroke-[3]" /> : <ArrowUpRight className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-black text-white">
                            {notif.title}
                          </h4>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{notif.displayTime || new Date(notif.createdAt).toLocaleString('en-GB')}</span>
                          <span>&bull;</span>
                          <span className="text-emerald-400 font-bold">{notif.paymentMethod || 'Mobile Money'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                        +{Number(notif.amount || 0).toLocaleString()} RWF
                      </span>
                    </div>
                  </div>

                  {/* Main Message Body */}
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">
                    {notif.message}
                  </p>

                  {/* Phone & Recipient Info Tag */}
                  <div className="flex flex-wrap items-center gap-2 text-[10.5px]">
                    {notif.phone && (
                      <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg text-slate-300 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        {notif.phone} {notif.senderName ? `(${notif.senderName})` : ''}
                      </span>
                    )}

                    {notif.plansGranted > 0 && (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        +{notif.plansGranted} CBC Lesson Plans Unlocked
                      </span>
                    )}

                    <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg text-slate-400 font-mono text-[9.5px]">
                      TxID: {notif.txRef || 'MTN-REF'}
                    </span>
                  </div>

                  {/* SMS PREVIEW BUBBLE */}
                  {notif.smsPreview && (
                    <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-2.5 text-[11px] font-mono leading-relaxed text-amber-200 relative group">
                      <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-800 text-[9.5px] uppercase font-bold text-amber-400">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-amber-400" />
                          Official SMS Message Text:
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(notif.smsPreview!, notif.id)}
                          className="text-slate-400 hover:text-emerald-300 flex items-center gap-0.5 transition-colors cursor-pointer"
                        >
                          {copiedId === notif.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === notif.id ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="select-all">&ldquo;{notif.smsPreview}&rdquo;</p>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-850 text-[10px]">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Plans Unlocked & Server Verified
                    </span>

                    <div className="flex items-center gap-2">
                      {isUnread && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-slate-400 hover:text-emerald-300 flex items-center gap-1 font-bold cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark as Read</span>
                        </button>
                      )}

                      {onOpenPaymentHistory && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenPaymentHistory();
                          }}
                          className="text-emerald-400 hover:underline font-bold"
                        >
                          View Receipt &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-950 p-3 sm:p-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono text-[11px]">
            System: <span className="text-emerald-400 font-bold">100% Automated Instant MoMo Alerts</span>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl cursor-pointer transition-all shadow-md active:scale-95"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
