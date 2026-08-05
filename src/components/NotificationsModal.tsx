import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  BellRing, 
  Trash2, 
  Check, 
  CheckCircle2, 
  Megaphone, 
  CreditCard, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  Award
} from 'lucide-react';
import { NotificationItem } from './Header';
import { LanguageOption } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onNotificationsChange: (notifs: NotificationItem[]) => void;
  selectedLanguage: LanguageOption;
  onNavigateTab: (tab: any) => void;
  onOpenHelpCenter: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onNotificationsChange,
  selectedLanguage,
  onNavigateTab,
  onOpenHelpCenter
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'feature' | 'subscription' | 'maintenance'>('all');

  if (!isOpen) return null;

  const isKiny = selectedLanguage === 'Kinyarwanda';

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleNotifRead = (id: string) => {
    onNotificationsChange(
      notifications.map(n => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const markAllAsRead = () => {
    onNotificationsChange(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    onNotificationsChange([]);
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onNotificationsChange(notifications.filter(n => n.id !== id));
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.category === filter;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'feature':
        return <Sparkles className="w-4 h-4 text-emerald-500" />;
      case 'subscription':
        return <CreditCard className="w-4 h-4 text-amber-500" />;
      case 'maintenance':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Megaphone className="w-4 h-4 text-purple-500" />;
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    // Mark as read
    if (!item.read) {
      toggleNotifRead(item.id);
    }
    
    // Perform action if specified
    if (item.actionTab) {
      onNavigateTab(item.actionTab);
      onClose();
    } else if (item.actionHelpCenter) {
      onOpenHelpCenter();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl">
              <BellRing className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-slate-900">
                {isKiny ? 'Amakuru n\'Amavugurura' : 'System Notifications & Updates'}
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {isKiny 
                  ? `Ufite ubutumwa ${unreadCount} butarasomwa`
                  : `You have ${unreadCount} unread update(s)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Filter tabs */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'unread', 'feature', 'subscription', 'maintenance'] as const).map((tab) => {
              const label = {
                all: isKiny ? 'Byose' : 'All',
                unread: isKiny ? 'Bitarasomwa' : 'Unread',
                feature: isKiny ? 'Ibishya' : 'Features',
                subscription: isKiny ? 'Ibyishyuwe' : 'Payments',
                maintenance: isKiny ? 'Ububiko' : 'System'
              }[tab];

              const count = tab === 'all' 
                ? notifications.length 
                : tab === 'unread' 
                  ? unreadCount 
                  : notifications.filter(n => n.category === tab).length;

              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                    filter === tab 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-black text-emerald-700 hover:text-emerald-950 hover:underline px-2.5 py-1 rounded-lg"
              >
                {isKiny ? 'Soma Byose' : 'Mark all as read'}
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs font-black text-rose-600 hover:text-rose-800 flex items-center gap-1 px-2.5 py-1 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isKiny ? 'Siba Byose' : 'Clear All'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredNotifs.length === 0 ? (
            <div className="py-16 text-center max-w-sm mx-auto space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {isKiny ? 'Nta butumwa buhari' : 'No notifications found'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {isKiny 
                    ? 'Nta butumwa buhuye n\'iki kiciro wahisemo.'
                    : 'There are no updates matching your current filter.'}
                </p>
              </div>
            </div>
          ) : (
            filteredNotifs.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`group p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                  item.read 
                    ? 'bg-white border-slate-100 hover:bg-slate-50/50' 
                    : 'bg-emerald-50/20 border-emerald-100 hover:bg-emerald-50/35 ring-1 ring-emerald-500/5'
                }`}
              >
                <div className="flex gap-3 items-start">
                  <div className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${
                    item.read ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {getCategoryIcon(item.category)}
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-black truncate ${
                        item.read ? 'text-slate-700' : 'text-slate-950 font-black'
                      }`}>
                        {isKiny ? item.titleKiny : item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {item.timestamp}
                      </span>
                    </div>

                    <p className={`text-xs leading-relaxed ${
                      item.read ? 'text-slate-500' : 'text-slate-800 font-medium'
                    }`}>
                      {isKiny ? item.messageKiny : item.message}
                    </p>

                    {(item.actionTab || item.actionHelpCenter) && (
                      <div className="pt-1.5 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <span>{isKiny ? 'KANDA HANO UKORE IYI TAB' : 'Action Required'}</span>
                          <span>➜</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNotifRead(item.id);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      title={item.read ? 'Mark as unread' : 'Mark as read'}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${item.read ? 'text-slate-300' : 'text-emerald-500 fill-emerald-100'}`} />
                    </button>

                    <button
                      onClick={(e) => deleteNotification(item.id, e)}
                      className="p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <p className="flex items-center gap-1 font-medium">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nkorera Education Verified Updates</span>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl transition-all"
          >
            {isKiny ? 'Funga' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
