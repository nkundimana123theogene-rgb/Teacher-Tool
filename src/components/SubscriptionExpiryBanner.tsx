import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ArrowRight, X, Sparkles } from 'lucide-react';
import { checkSubscriptionExpiringSoon, SubscriptionExpiryAlert } from '../utils/subscription';

interface SubscriptionExpiryBannerProps {
  onOpenSubscription: () => void;
}

export const SubscriptionExpiryBanner: React.FC<SubscriptionExpiryBannerProps> = ({ onOpenSubscription }) => {
  const [alertInfo, setAlertInfo] = useState<SubscriptionExpiryAlert | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    const alert = checkSubscriptionExpiringSoon();
    if (alert && alert.isExpiringSoon) {
      const dismissed = sessionStorage.getItem(`nkorera_dismissed_expiry_${alert.serviceName}`);
      if (!dismissed) {
        setAlertInfo(alert);
      }
    }
  }, []);

  if (!alertInfo || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(`nkorera_dismissed_expiry_${alertInfo.serviceName}`, 'true');
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-amber-950/90 via-slate-950 to-amber-950/90 border border-amber-500/40 rounded-2xl p-4 text-slate-200 shadow-xl backdrop-blur-md relative overflow-hidden transition-all animate-fade-in">
      <div className="absolute -right-8 -top-8 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl shrink-0 text-amber-400 mt-0.5 sm:mt-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Subscription Expiring Soon
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30">
                {alertInfo.daysRemaining === 1 ? 'Expires Tomorrow' : `${alertInfo.daysRemaining} Days Left`}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Your <strong className="text-white">{alertInfo.serviceName}</strong> ({alertInfo.planName}) subscription is scheduled to expire on <strong className="text-amber-300 font-mono">{alertInfo.expiryDateStr}</strong>. Renew early to maintain seamless access.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pt-2 sm:pt-0">
          <button
            type="button"
            onClick={onOpenSubscription}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Renew Subscription</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            title="Dismiss notification"
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-700/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
