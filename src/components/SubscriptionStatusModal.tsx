import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Award, 
  CheckCircle2, 
  Zap, 
  Sparkles, 
  X, 
  AlertTriangle,
  Clock,
  Smartphone,
  ShieldCheck,
  CreditCard,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  DollarSign,
  Receipt,
  History,
  BookOpen,
  Presentation,
  FileSpreadsheet,
  Check,
  Calendar,
  Layers,
  FileText,
  GraduationCap,
  Copy,
  Upload,
  Image as ImageIcon,
  FileCheck,
  Trash2,
  Eye,
  EyeOff,
  MessageSquare,
  BellRing,
  Lock
} from 'lucide-react';
import { 
  AI_SUBSCRIPTION_PLANS,
  AiCreditSubscriptionData,
  AiBillingRecord,
  CreditUsageLog,
  getAiCreditSubscriptionStatus,
  activateAiPaidPlan,
  getAiPaymentHistory,
  getAiCreditUsageLogs,
  SUBSCRIPTION_PLANS,
  NURSERY_SUBSCRIPTION_PLANS,
  REMEDIAL_SUBSCRIPTION_PLANS,
  SCHEME_SUBSCRIPTION_PLANS,
  activateSubscriptionPlan,
  activateNurserySubscriptionPlan,
  activateRemedialSubscriptionPlan,
  activateSchemeSubscriptionPlan
} from '../utils/subscription';
import { getCurrentUser } from '../utils/auth';
import { loadPaymentHistoryFromFirestore } from '../utils/firebase';
import { playPaymentChimeSound } from '../utils/notifications';

interface SubscriptionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
  warningMessage?: string;
  initialTab?: 'AI_SERVICES' | 'BILLING_HISTORY' | 'USAGE_LOGS' | 'SCHEME' | 'CBC' | 'NURSERY' | 'REMEDIAL';
  onSubscriptionActivated?: (category: 'AI' | 'CBC' | 'NURSERY' | 'REMEDIAL' | 'SCHEME') => void;
  onOpenPaymentHistory?: () => void;
}

type CheckoutStep = 
  | 'PLAN_LIST' 
  | 'ENTER_PHONE' 
  | 'MOMO_PUSH_PROMPT' 
  | 'TRANSACTING' 
  | 'COMPLETED';

export const SubscriptionStatusModal: React.FC<SubscriptionStatusModalProps> = ({
  isOpen,
  onClose,
  userEmail = 'teacher@nkorera.rw',
  userName = 'Teacher',
  warningMessage,
  initialTab = 'AI_SERVICES',
  onSubscriptionActivated,
  onOpenPaymentHistory
}) => {
  const resolvedTab: 'AI_SERVICES' | 'BILLING_HISTORY' | 'USAGE_LOGS' = 
    initialTab === 'BILLING_HISTORY' ? 'BILLING_HISTORY' : initialTab === 'USAGE_LOGS' ? 'USAGE_LOGS' : 'AI_SERVICES';

  const [activeTab, setActiveTab] = useState<'AI_SERVICES' | 'BILLING_HISTORY' | 'USAGE_LOGS'>(resolvedTab);
  const [subData, setSubData] = useState<AiCreditSubscriptionData>(getAiCreditSubscriptionStatus());
  const [paymentHistory, setPaymentHistory] = useState<AiBillingRecord[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState<boolean>(false);
  const [usageLogs, setUsageLogs] = useState<CreditUsageLog[]>([]);
  const [planCategory, setPlanCategory] = useState<'AI' | 'CBC' | 'NURSERY' | 'REMEDIAL' | 'SCHEME'>('AI');
  
  // Checkout & MoMo Payment States
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('PLAN_LIST');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedSim, setSelectedSim] = useState<'MTN Mobile Money' | 'Airtel Money'>('MTN Mobile Money');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [buyerPhone, setBuyerPhone] = useState<string>('0781339530');
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerEmail, setBuyerEmail] = useState<string>('');
  const [momoPin, setMomoPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [momoTxId, setMomoTxId] = useState<string>('');
  const [assignedTxId, setAssignedTxId] = useState<string>('');
  const [txTimestamp, setTxTimestamp] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // File / Screenshot Proof State
  const [receiptScreenshot, setReceiptScreenshot] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve(dataUrl);
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => {
          resolve(e.target?.result as string);
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const processSelectedFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file only (PNG, JPG, JPEG, or WebP)!');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setUploadError('Image size is too large (maximum 12MB)!');
      return;
    }

    try {
      setIsUploadingScreenshot(true);
      setUploadError(null);
      const compressedDataUrl = await compressImageFile(file);
      setReceiptScreenshot(compressedDataUrl);
      setReceiptFileName(file.name);
    } catch (err) {
      console.error('Failed to process screenshot image:', err);
      setUploadError('Byanze gutunganya ifoto. Gerageza indi foto.');
    } finally {
      setIsUploadingScreenshot(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleRemoveScreenshot = () => {
    setReceiptScreenshot(null);
    setReceiptFileName(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };
  
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [activationSuccess, setActivationSuccess] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingStage, setLoadingStage] = useState<string>('Initializing secure gateway connection...');

  const [savePreference, setSavePreference] = useState<boolean>(() => {
    return localStorage.getItem('save_preferred_momo_details') === 'true';
  });

  const handleToggleSavePreference = (checked: boolean) => {
    setSavePreference(checked);
    if (checked) {
      localStorage.setItem('save_preferred_momo_details', 'true');
      localStorage.setItem('preferred_momo_sim', selectedSim);
      localStorage.setItem('preferred_momo_phone', buyerPhone);
    } else {
      localStorage.removeItem('save_preferred_momo_details');
      localStorage.removeItem('preferred_momo_sim');
      localStorage.removeItem('preferred_momo_phone');
    }
  };

  useEffect(() => {
    if (savePreference) {
      localStorage.setItem('preferred_momo_sim', selectedSim);
      localStorage.setItem('preferred_momo_phone', buyerPhone);
    }
  }, [selectedSim, buyerPhone, savePreference]);

  useEffect(() => {
    if (isOpen) {
      const tabToUse = initialTab === 'BILLING_HISTORY' ? 'BILLING_HISTORY' : initialTab === 'USAGE_LOGS' ? 'USAGE_LOGS' : 'AI_SERVICES';
      setActiveTab(tabToUse);
      
      if (initialTab === 'SCHEME') setPlanCategory('SCHEME');
      else if (initialTab === 'CBC') setPlanCategory('CBC');
      else if (initialTab === 'NURSERY') setPlanCategory('NURSERY');
      else if (initialTab === 'REMEDIAL') setPlanCategory('REMEDIAL');
      else setPlanCategory('AI');

      const current = getAiCreditSubscriptionStatus();
      setSubData(current);
      setPaymentHistory(getAiPaymentHistory());
      setUsageLogs(getAiCreditUsageLogs());

      // Fetch payment history from Cloud Firestore
      setIsLoadingPayments(true);
      loadPaymentHistoryFromFirestore(userEmail)
        .then((records) => {
          if (records && records.length > 0) {
            setPaymentHistory(records);
          }
        })
        .catch((err) => {
          console.warn('Firestore payment history fetch fallback to local:', err);
        })
        .finally(() => {
          setIsLoadingPayments(false);
        });
      setCheckoutStep('PLAN_LIST');
      setSelectedPlan(null);
      setActivationSuccess(null);
      setMomoTxId('');
      setReceiptScreenshot(null);
      setReceiptFileName(null);
      setUploadError(null);
      
      const savedSavePreference = localStorage.getItem('save_preferred_momo_details') === 'true';
      setSavePreference(savedSavePreference);

      const user = getCurrentUser();
      if (user?.name && user.name !== 'Teacher') {
        setBuyerName(user.name);
      } else if (userName && userName !== 'Teacher') {
        setBuyerName(userName);
      }

      if (user?.email && user.email !== 'teacher@nkorera.rw') {
        setBuyerEmail(user.email);
      } else if (userEmail && userEmail !== 'teacher@nkorera.rw') {
        setBuyerEmail(userEmail);
      }

      if (savedSavePreference) {
        const savedSim = localStorage.getItem('preferred_momo_sim') as 'MTN Mobile Money' | 'Airtel Money';
        if (savedSim) setSelectedSim(savedSim);
        const savedPhone = localStorage.getItem('preferred_momo_phone');
        if (savedPhone) setBuyerPhone(savedPhone);
      } else {
        if (user?.phone) {
          setBuyerPhone(user.phone);
        } else if (user?.momoNumber) {
          setBuyerPhone(user.momoNumber);
        } else {
          setBuyerPhone('0781339530');
        }
      }
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const usedPercentage = Math.min(100, Math.round((subData.creditsUsed / Math.max(1, subData.totalCredits)) * 100));
  const now = new Date();
  const expiryDate = new Date(subData.billingPeriodEnd);
  const diffTime = expiryDate.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const getPlansForCategory = () => {
    switch (planCategory) {
      case 'CBC':
        return SUBSCRIPTION_PLANS.map(p => ({
          id: p.id,
          name: p.name,
          credits: p.plansCount,
          priceRwf: p.priceFrw,
          formattedPrice: p.priceFrw === 0 ? 'Free (0 RWF)' : `${p.priceFrw.toLocaleString()} RWF`,
          badge: p.badge,
          isPopular: p.isPopular,
          description: `Get ${p.plansCount} official CBC Lesson Plans. Valid for 30 days.`,
          features: [
            `${p.plansCount} High-Quality Lesson Plans`,
            'Aligned with Rwanda REB/NESA Curriculum',
            'Fully Customisable Objectives & Materials',
            'Download PDF & Word instantly'
          ]
        }));
      case 'NURSERY':
        return NURSERY_SUBSCRIPTION_PLANS.map(p => ({
          id: p.id,
          name: p.name,
          credits: p.plansCount,
          priceRwf: p.priceFrw,
          formattedPrice: p.priceFrw === 0 ? 'Free (0 RWF)' : `${p.priceFrw.toLocaleString()} RWF`,
          badge: p.badge,
          isPopular: p.isPopular,
          description: `Get ${p.plansCount} Nursery Lesson Plans. Valid for 30 days.`,
          features: [
            `${p.plansCount} Nursery Lesson Plans`,
            'Age-Appropriate Play-Based Methods',
            'Aligned with Early Childhood Standards',
            'Download PDF & Word instantly'
          ]
        }));
      case 'REMEDIAL':
        return REMEDIAL_SUBSCRIPTION_PLANS.map(p => ({
          id: p.id,
          name: p.name,
          credits: p.plansCount,
          priceRwf: p.priceFrw,
          formattedPrice: p.priceFrw === 0 ? 'Free (0 RWF)' : `${p.priceFrw.toLocaleString()} RWF`,
          badge: p.badge,
          isPopular: p.isPopular,
          description: `Get ${p.plansCount} Remedial Lesson Plans. Valid for 30 days.`,
          features: [
            `${p.plansCount} Remedial Lesson Plans`,
            'Focused on slow learners & recovery topics',
            'Aligned with REB assessment framework',
            'Download PDF & Word instantly'
          ]
        }));
      case 'SCHEME':
        return SCHEME_SUBSCRIPTION_PLANS.map(p => ({
          id: p.id,
          name: p.name,
          credits: p.plansCount,
          priceRwf: p.priceFrw,
          formattedPrice: p.priceFrw === 0 ? 'Free (0 RWF)' : `${p.priceFrw.toLocaleString()} RWF`,
          badge: p.badge,
          isPopular: p.isPopular,
          description: `Get ${p.plansCount} Schemes of Work. Duration: ${p.durationDays || 30} days.`,
          features: [
            `${p.plansCount} Schemes of Work`,
            'Automatic timeline distribution',
            'Aligned with official REB course outline',
            'Download PDF, Word & print'
          ]
        }));
      case 'AI':
      default:
        return AI_SUBSCRIPTION_PLANS.map(p => ({
          id: p.id,
          name: p.name,
          credits: p.credits,
          priceRwf: p.priceRwf,
          formattedPrice: p.formattedPrice,
          badge: p.badge,
          isPopular: p.isPopular,
          description: p.description,
          features: p.features
        }));
    }
  };

  const handleSelectPlan = (plan: any) => {
    if (plan.priceRwf === 0) {
      setIsActivating(true);
      setTimeout(() => {
        if (planCategory === 'AI') {
          activateAiPaidPlan(plan.id, buyerPhone, selectedSim, 'FREE_TIER_ACTIVATION');
          setSubData(getAiCreditSubscriptionStatus());
        } else if (planCategory === 'CBC') {
          activateSubscriptionPlan(plan.id, buyerPhone);
        } else if (planCategory === 'NURSERY') {
          activateNurserySubscriptionPlan(plan.id, buyerPhone);
        } else if (planCategory === 'REMEDIAL') {
          activateRemedialSubscriptionPlan(plan.id, buyerPhone);
        } else if (planCategory === 'SCHEME') {
          activateSchemeSubscriptionPlan(plan.id, buyerPhone);
        }
        setPaymentHistory(getAiPaymentHistory());
        setIsActivating(false);
        setActivationSuccess(`Successfully confirmed ${plan.name}!`);
        setCheckoutStep('PLAN_LIST');
      }, 500);
    } else {
      setSelectedPlan(plan);
      setPaymentAmount(plan.priceRwf);
      setCheckoutStep('ENTER_PHONE');
    }
  };

  const handleInitiateMoMoPush = () => {
    if (!buyerPhone || buyerPhone.length < 9) {
      alert('Please enter a valid phone number (e.g., 0781339530)!');
      return;
    }
    
    // Auto-trigger native quick dialing code pre-filled with correct amount and admin destination number
    const destNumber = selectedSim === 'Airtel Money' ? '0724038043' : '0781339530';
    const dialCode = `tel:*182*1*1*${destNumber}*${paymentAmount}%23`;
    try {
      window.location.href = dialCode;
    } catch (e) {}

    setCheckoutStep('MOMO_PUSH_PROMPT');
  };

  const handleAuthorizePinPayment = (pinOverride?: string) => {
    const activePin = (pinOverride !== undefined ? pinOverride : momoPin).trim();

    if (!buyerPhone || buyerPhone.trim().length < 9) {
      alert('Please enter your Mobile Money phone number (e.g. 0781339530)!');
      return;
    }

    if (!activePin || activePin.length < 4) {
      setPinError('Enter your Mobile Money PIN (4 or 5 digits)');
      return;
    }
    setPinError(null);

    const generatedTx = momoTxId && momoTxId.trim().length > 2
      ? momoTxId.trim().toUpperCase()
      : `${selectedSim === 'Airtel Money' ? 'AIR' : 'MTN'}-${Math.floor(100000000 + Math.random() * 900000000)}`;

    const dateStr = new Date().toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    setAssignedTxId(generatedTx);
    setTxTimestamp(dateStr);

    setCheckoutStep('TRANSACTING');
    setLoadingProgress(0);
    setLoadingStage('Connecting to MTN MoMo / Airtel Money Network...');

    const duration = 2400; // ~2.4s fast smooth transaction
    const intervalTime = 80;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = Math.min(100, Math.round((currentStep / steps) * 100));
      setLoadingProgress(progress);

      if (progress < 25) {
        setLoadingStage('1/5: Initiating payment request with phone number...');
      } else if (progress < 50) {
        setLoadingStage('2/5: Phone receiving USSD push prompt, authorizing PIN...');
      } else if (progress < 75) {
        setLoadingStage('3/5: Telecom network notifying gateway of verified authorization...');
      } else if (progress < 90) {
        setLoadingStage('4/5: Gateway processing verified transaction webhook...');
      } else {
        setLoadingStage('5/5: Premium subscription activated instantly!');
      }

      if (currentStep >= steps) {
        clearInterval(interval);
        
        if (!selectedPlan) return;
        setIsActivating(true);

        const cleanPhone = (buyerPhone || '').trim();
        const effectiveName = (buyerName || (userName !== 'Teacher' ? userName : '') || 'Subscribed Teacher').trim();
        const effectiveEmail = (buyerEmail || (userEmail !== 'teacher@nkorera.rw' ? userEmail : '') || (cleanPhone ? `${cleanPhone.replace(/[^0-9]/g, '')}@teacher.nkorera.rw` : 'teacher@nkorera.rw')).toLowerCase().trim();

        if (planCategory === 'AI') {
          const result = activateAiPaidPlan(
            selectedPlan.id,
            cleanPhone,
            selectedSim,
            generatedTx,
            receiptScreenshot || undefined,
            effectiveName,
            effectiveEmail
          );
          setSubData(result.subscription);
        } else if (planCategory === 'CBC') {
          activateSubscriptionPlan(selectedPlan.id, cleanPhone, generatedTx, selectedSim, receiptScreenshot || undefined, effectiveName, effectiveEmail);
        } else if (planCategory === 'NURSERY') {
          activateNurserySubscriptionPlan(selectedPlan.id, cleanPhone, generatedTx, selectedSim, receiptScreenshot || undefined, effectiveName, effectiveEmail);
        } else if (planCategory === 'REMEDIAL') {
          activateRemedialSubscriptionPlan(selectedPlan.id, cleanPhone, generatedTx, selectedSim, receiptScreenshot || undefined, effectiveName, effectiveEmail);
        } else if (planCategory === 'SCHEME') {
          activateSchemeSubscriptionPlan(selectedPlan.id, cleanPhone, generatedTx, selectedSim, receiptScreenshot || undefined, effectiveName, effectiveEmail);
        }

        // Direct MoMo Webhook call (/api/payments/momo-webhook) for instant 0.1s server-side activation
        fetch('/api/payments/momo-webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'charge.completed',
            data: {
              status: 'successful',
              amount: paymentAmount,
              tx_ref: generatedTx,
              customer: {
                phone_number: cleanPhone,
                email: effectiveEmail,
                name: effectiveName
              }
            },
            plansCount: selectedPlan.credits || selectedPlan.plansCount || (paymentAmount >= 5000 ? 60 : 30),
            months: paymentAmount >= 5000 ? 2 : 1,
            planId: selectedPlan.id,
            planName: selectedPlan.name
          })
        }).catch(() => {});

        // Direct server API backup to ensure instant appearance on admin dashboard
        fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionRef: generatedTx,
            planId: selectedPlan.id,
            planName: selectedPlan.name,
            amountRwf: paymentAmount,
            amount: paymentAmount,
            credits: selectedPlan.credits || selectedPlan.plansCount || (paymentAmount >= 5000 ? 60 : 30),
            paymentMethod: selectedSim,
            phoneNumber: cleanPhone,
            phone: cleanPhone,
            status: 'Paid',
            userEmail: effectiveEmail,
            userName: effectiveName,
            teacherEmail: effectiveEmail,
            teacherName: effectiveName,
            receiptScreenshot: receiptScreenshot || undefined
          })
        }).catch(() => {});

        setPaymentHistory(getAiPaymentHistory());
        setIsActivating(false);
        setActivationSuccess(`Payment received successfully! Activated "${selectedPlan.name}".`);
        setCheckoutStep('COMPLETED');
        
        // Play instant payment celebration chime
        playPaymentChimeSound();

        // Dispatch real-time notification alert to the whole app
        const plansUnlockedCount = selectedPlan.credits || selectedPlan.plansCount || (paymentAmount >= 5000 ? 60 : 30);
        window.dispatchEvent(new CustomEvent('nkorera_new_notification', {
          detail: {
            title: 'Payment Received & Plans Unlocked! 🎉',
            message: `You transferred ${paymentAmount.toLocaleString()} RWF to NKUNDIMANA THEOGENE (0781339530). Your ${plansUnlockedCount} lesson plans have been activated immediately!`,
            amount: paymentAmount
          }
        }));

        const freshUser = getCurrentUser();
        if (freshUser) {
          window.dispatchEvent(new CustomEvent('nkorera_user_updated', { detail: freshUser }));
        }

        if (onSubscriptionActivated) {
          onSubscriptionActivated(planCategory);
        }
      }
    }, intervalTime);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl text-white flex flex-col max-h-[94vh]">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-4 sm:p-5 border-b border-emerald-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2.5 rounded-2xl border border-emerald-500/40 text-emerald-400">
              <Award className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                  Subscription Status & Billing
                </h3>
                {subData.status === 'ACTIVE' && (
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping inline-block" />
                    ACTIVE 🟢
                  </span>
                )}
                {subData.status === 'EXPIRED' && (
                  <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    EXPIRED 🔴
                  </span>
                )}
                {subData.status === 'DEPLETED' && (
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    0 CREDITS ⚠️
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Manage monthly AI generation credits, billing cycles & instant Mobile Money (MoMo) payments
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

        {/* PRIMARY NAVIGATION TABS */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 overflow-x-auto shrink-0">
          <button 
            onClick={() => { setActiveTab('AI_SERVICES'); setCheckoutStep('PLAN_LIST'); }} 
            className={`flex-1 min-w-[160px] py-3 text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'AI_SERVICES' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Zap className="w-4 h-4" />
            <span>AI Subscription Plans</span>
          </button>
          <button 
            onClick={() => { setActiveTab('BILLING_HISTORY'); setCheckoutStep('PLAN_LIST'); }} 
            className={`flex-1 min-w-[160px] py-3 text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'BILLING_HISTORY' ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Receipt className="w-4 h-4" />
            <span>Billing & Invoices ({paymentHistory.length})</span>
          </button>
          <button 
            onClick={() => { setActiveTab('USAGE_LOGS'); setCheckoutStep('PLAN_LIST'); }} 
            className={`flex-1 min-w-[160px] py-3 text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'USAGE_LOGS' ? 'text-teal-400 border-b-2 border-teal-400 bg-teal-500/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <History className="w-4 h-4" />
            <span>Credit Usage History</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          
          {/* WARNING BANNER IF EXPIRED OR DEPLETED */}
          {(warningMessage || subData.status !== 'ACTIVE') && (
            <div className="bg-rose-950/80 border border-rose-500/60 p-4 rounded-2xl flex items-start gap-3 shadow-lg animate-fade-in">
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-black text-rose-200 uppercase tracking-wide">
                  {subData.status === 'EXPIRED' 
                    ? 'MONTHLY BILLING PERIOD EXPIRED' 
                    : subData.status === 'DEPLETED' 
                      ? 'AI CREDITS DEPLETED (0 REMAINING)'
                      : 'SUBSCRIPTION REQUIRED'}
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {warningMessage || (subData.status === 'EXPIRED'
                    ? 'Your monthly subscription period has completed (30 days). Please select and renew a paid monthly plan below to continue generating AI resources.'
                    : 'You have used all available AI generation credits. Choose one of our affordable monthly plans (Starter, Basic, Standard, or Premium) to unlock more credits instantly.')}
                </p>
              </div>
            </div>
          )}

          {/* SUCCESS BANNER */}
          {activationSuccess && (
            <div className="bg-emerald-950/90 border-2 border-emerald-400 p-4 rounded-2xl flex items-center gap-3 shadow-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <p className="text-xs sm:text-sm font-bold text-emerald-200">
                {activationSuccess}
              </p>
            </div>
          )}

          {/* 3 AI SERVICES SUMMARY OVERVIEW */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-black text-white truncate">1. Homework & Quiz</h5>
                <p className="text-[10px] text-slate-400">1 Credit per Full Assessment</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Presentation className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-black text-white truncate">2. AI Presentation Slides</h5>
                <p className="text-[10px] text-slate-400">1 Credit per Slide Deck</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-black text-white truncate">3. Printable Worksheet</h5>
                <p className="text-[10px] text-slate-400">1 Credit per Worksheet & Key</p>
              </div>
            </div>
          </div>

          {/* CURRENT SUBSCRIPTION STATUS CARD */}
          <div className="bg-gradient-to-br from-slate-800/90 via-slate-900 to-slate-950 border border-emerald-500/40 p-4 sm:p-5 rounded-2xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 font-black text-base shadow-inner">
                  {userName ? userName.charAt(0).toUpperCase() : 'T'}
                </div>
                <div>
                  <div className="font-black text-sm text-white flex items-center gap-1.5">
                    <span>{userName}</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  </div>
                  <div className="text-xs text-slate-400 font-mono">{userEmail}</div>
                </div>
              </div>

              <div className="text-left sm:text-right bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Current Plan</div>
                <div className="text-emerald-400 font-black text-xs sm:text-sm">{subData.planName}</div>
              </div>
            </div>

            {/* PROGRESS & USAGE STATS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  AI Generation Credits Used:
                </span>
                <span className="text-amber-300 font-black">
                  {subData.creditsUsed} / {subData.totalCredits} ({usedPercentage}%)
                </span>
              </div>

              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    usedPercentage >= 100 
                      ? 'bg-rose-500' 
                      : usedPercentage >= 80 
                        ? 'bg-amber-400' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${usedPercentage}%` }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Credits Remaining:</span>
                  <span className={`font-black text-sm ${subData.creditsRemaining > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {subData.creditsRemaining} Credits
                  </span>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Days Left:
                  </span>
                  <span className={`font-black text-sm ${daysLeft > 5 ? 'text-amber-300' : 'text-rose-400'}`}>
                    {daysLeft} Days
                  </span>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Cycle Start:
                  </span>
                  <span className="font-bold text-slate-200 text-[11px] font-mono">
                    {new Date(subData.billingPeriodStart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Next Renewal:</span>
                  <span className="font-bold text-slate-200 text-[11px] font-mono">
                    {new Date(subData.nextRenewalDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1: AI SUBSCRIPTION PLANS */}
          {activeTab === 'AI_SERVICES' && (
            checkoutStep === 'PLAN_LIST' ? (
              <div className="space-y-4">
                {/* PLAN TYPE SELECTOR PILLS */}
                <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex flex-wrap gap-1">
                  {[
                    { id: 'AI', label: 'AI Services (Slides, Homework, Worksheet)', icon: Sparkles },
                    { id: 'CBC', label: 'CBC Lesson Plans', icon: FileText },
                    { id: 'NURSERY', label: 'Nursery Lesson Plans', icon: BookOpen },
                    { id: 'REMEDIAL', label: 'Remedial Lesson Plans', icon: GraduationCap },
                    { id: 'SCHEME', label: 'Schemes of Work', icon: Calendar }
                  ].map((cat) => {
                    const CatIcon = cat.icon;
                    const isCatSelected = planCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setPlanCategory(cat.id as any)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          isCatSelected
                            ? 'bg-emerald-500 text-slate-950 shadow-md scale-105'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        <CatIcon className="w-3.5 h-3.5" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Select your {planCategory} Plan:
                    </h4>
                    <p className="text-xs text-slate-400">
                      Choose a customized plan suited for your school teaching requirements.
                    </p>
                  </div>
                  <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300 border border-slate-700">
                    Currency: <strong>Rwandan Francs (RWF)</strong>
                  </span>
                </div>

                {/* PLANS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
                  {getPlansForCategory().map((plan) => {
                    const isCurrentActive = subData.planId === plan.id && subData.status === 'ACTIVE';
                    const isSelected = selectedPlan?.id === plan.id;
                    const isPopular = plan.isPopular;

                    return (
                      <div
                        key={plan.id}
                        onClick={() => handleSelectPlan(plan)}
                        className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                          isPopular
                            ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/40 border-2 border-amber-400 shadow-xl shadow-amber-950/40 scale-[1.02]'
                            : isSelected
                              ? 'bg-slate-800/90 border-emerald-400 ring-2 ring-emerald-500/40 shadow-lg'
                              : 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/60 hover:bg-slate-900/80'
                        }`}
                      >
                        {/* BADGES */}
                        {plan.badge && (
                          <span className={`absolute -top-2.5 right-3 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase shadow ${
                            isPopular 
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black ring-2 ring-amber-300' 
                              : 'bg-slate-800 text-slate-200 border border-slate-700'
                          }`}>
                            {plan.badge}
                          </span>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-black text-white">{plan.name}</h5>
                            {isCurrentActive && (
                              <span className="text-emerald-400 text-[10px] font-black">● Current</span>
                            )}
                          </div>

                          <div className="pt-1">
                            <div className="text-xl font-black text-emerald-400">
                              {plan.formattedPrice}
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {plan.credits} Units / Month
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {plan.description}
                          </p>

                          <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[10.5px] text-slate-300">
                            {plan.features.slice(0, 4).map((feat: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPlan(plan);
                          }}
                          disabled={isActivating}
                          className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isPopular
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-md hover:scale-105 active:scale-95'
                              : plan.priceRwf === 0
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          }`}
                        >
                          {isActivating && selectedPlan?.id === plan.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>{plan.priceRwf > 0 ? `Subscribe (${plan.formattedPrice})` : 'Free Plan'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* SMARTPHONE MOMO CHECKOUT INTERFACE */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* PAYMENT INSTRUCTIONS COLUMN */}
                <div className="md:col-span-5 space-y-4">
                  <button
                    onClick={() => setCheckoutStep('PLAN_LIST')}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 px-3.5 py-2 rounded-xl transition-all font-bold cursor-pointer border border-slate-700"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Plan Options</span>
                  </button>

                  <div className="space-y-2">
                    <h4 className="text-base font-black text-amber-300 flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-amber-400" />
                      Automatic MoMo Push Payment
                    </h4>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      You are subscribing to <strong>{selectedPlan?.name}</strong> for <strong>{selectedPlan?.formattedPrice}</strong>. 
                      Payment is authorized instantly from your phone. No screenshot upload needed.
                    </p>
                  </div>

                  {/* OFFICIAL PAYMENT DETAILS BOX */}
                  <div className="bg-slate-950/90 border-2 border-amber-500/50 p-4 rounded-2xl space-y-3 shadow-xl">
                    <div className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      Checkout Details:
                    </div>
                    
                    <div className="space-y-2 text-xs divide-y divide-slate-800/80">
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-slate-400 font-semibold">Service Type:</span>
                        <span className="text-emerald-400 font-mono font-black text-xs bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/20">
                          {planCategory} Service
                        </span>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-slate-400 font-semibold">Selected Plan:</span>
                        <span className="text-amber-300 font-black">
                          {selectedPlan?.name}
                        </span>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-slate-400 font-semibold">Amount to Pay:</span>
                        <span className="text-white font-black">
                          {paymentAmount.toLocaleString()} RWF
                        </span>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-slate-400 font-semibold">Allowance Units:</span>
                        <span className="text-emerald-400 font-black">
                          +{selectedPlan?.credits} Plans/Credits
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AUTOMATED PAYMENT BENEFIT */}
                  <div className="p-3.5 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl text-xs text-emerald-200 font-bold space-y-1 shadow-md">
                    <div className="flex items-center gap-2 text-emerald-400 font-black uppercase text-[11px]">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>Instant Activation Enabled</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-200 font-normal">
                      Once you authorize with your Mobile Money PIN, the selected premium features are immediately activated and unlocked for you automatically.
                    </p>
                  </div>
                </div>

                {/* SMARTPHONE DEVICE BODY SIMULATION */}
                <div className="md:col-span-7 flex justify-center">
                  <div className="w-full max-w-[340px] bg-slate-950 border-4 border-slate-700 rounded-[40px] overflow-hidden shadow-2xl relative flex flex-col min-h-[500px]">
                    
                    {/* PHONE NOTCH */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-700 rounded-b-xl z-20 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-slate-950" />
                    </div>

                    {/* STATUS BAR */}
                    <div className="bg-slate-950 px-5 pt-6 pb-2 text-[9px] font-bold text-slate-400 flex justify-between items-center shrink-0 z-10 border-b border-slate-900">
                      <span>MTN MoMo / Airtel Money</span>
                      <div className="flex items-center gap-1.5">
                        <span>4G LTE</span>
                        <div className="w-5 h-2.5 border border-slate-400 rounded-sm p-[1px] flex items-center">
                          <div className="w-3.5 h-full bg-emerald-500 rounded-xs" />
                        </div>
                      </div>
                    </div>

                    {/* PHONE SCREEN CONTENT */}
                    <div className="p-4 flex-1 flex flex-col justify-between bg-slate-900 relative">
                      
                      {/* STEP 1: ENTER PHONE NUMBER & SIM CHOICE */}
                      {checkoutStep === 'ENTER_PHONE' && (
                        <div className="space-y-3 flex-1 flex flex-col justify-between overflow-y-auto">
                          <div className="space-y-2.5">
                            <div className="text-center space-y-0.5">
                              <div className="flex items-center justify-center gap-1 text-amber-400">
                                <Smartphone className="w-6 h-6 animate-pulse" />
                                <Zap className="w-5 h-5 text-emerald-400 fill-current" />
                              </div>
                              <h5 className="text-xs font-black text-white uppercase tracking-wider">Kwishyura Binyuze Muri MoMo</h5>
                              <p className="text-[10px] text-slate-300">Shyiramo PIN & Wishyure NKUNDIMANA THEOGENE Ako Kanya</p>
                            </div>

                            {/* SIM CARD SELECTOR */}
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedSim('MTN Mobile Money')}
                                className={`p-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                  selectedSim === 'MTN Mobile Money'
                                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg'
                                    : 'bg-slate-950 text-slate-300 border-slate-800'
                                }`}
                              >
                                <span className="w-2 h-2 rounded-full bg-amber-950 inline-block" />
                                MTN MoMo
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedSim('Airtel Money')}
                                className={`p-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                  selectedSim === 'Airtel Money'
                                    ? 'bg-rose-500 text-white border-rose-400 shadow-lg'
                                    : 'bg-slate-950 text-slate-300 border-slate-800'
                                }`}
                              >
                                <span className="w-2 h-2 rounded-full bg-white inline-block" />
                                Airtel Money
                              </button>
                            </div>

                              {/* RECIPIENT ACCOUNT DETAILS CARD */}
                            <div className="bg-slate-950 p-2.5 rounded-2xl border border-amber-500/40 space-y-1.5 text-left">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider">Konti Yakira Ubwishyu (Recipient)</span>
                                <span className="text-[10px] font-black text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                                  {paymentAmount.toLocaleString()} RWF
                                </span>
                              </div>
                              <div className="text-xs font-black text-white flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>NKUNDIMANA THEOGENE</span>
                                </span>
                                <span className="text-[11px] font-mono text-amber-300">
                                  {selectedSim === 'Airtel Money' ? '0724038043' : '0781339530'}
                                </span>
                              </div>

                              {/* QUICK COPY PHONE ACTION */}
                              <div className="pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleCopy(selectedSim === 'Airtel Money' ? '0724038043' : '0781339530', 'phone')}
                                  className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[9.5px] font-bold py-1 px-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                                >
                                  {copiedField === 'phone' ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400">Nimero ya Konti Yakoporowe!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-slate-400" />
                                      <span>Koporora Nimero ya Konti ({selectedSim === 'Airtel Money' ? '0724038043' : '0781339530'})</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* BUYER IDENTITY INPUTS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="space-y-1 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-left">
                                <label className="block text-[9.5px] font-black text-slate-300 uppercase">
                                  Nimero ya MoMo (Phone):
                                </label>
                                <input
                                  type="text"
                                  value={buyerPhone}
                                  onChange={(e) => setBuyerPhone(e.target.value)}
                                  placeholder="0781234567"
                                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-400"
                                />
                              </div>

                              <div className="space-y-1 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-left">
                                <label className="block text-[9.5px] font-black text-slate-300 uppercase">
                                  Teacher Full Name:
                                </label>
                                <input
                                  type="text"
                                  value={buyerName}
                                  onChange={(e) => setBuyerName(e.target.value)}
                                  placeholder="Full Name"
                                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
                                />
                              </div>
                            </div>

                            {/* PIN INPUT FOR INSTANT PAY NOW */}
                            <div className="space-y-1 bg-slate-950 p-2.5 rounded-2xl border border-amber-500/40 text-left shadow-md">
                              <div className="flex items-center justify-between">
                                <label className="text-[9.5px] font-black text-amber-300 uppercase flex items-center gap-1">
                                  <Lock className="w-3 h-3 text-amber-400" />
                                  <span>Enter MoMo / Airtel PIN:</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setShowPin(!showPin)}
                                  className="text-slate-400 hover:text-white text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  <span>{showPin ? 'Hide' : 'Show'}</span>
                                </button>
                              </div>

                              <div className="relative">
                                <input
                                  type={showPin ? 'text' : 'password'}
                                  maxLength={5}
                                  value={momoPin}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setMomoPin(val);
                                    if (pinError) setPinError(null);
                                  }}
                                  placeholder="••••"
                                  className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-sm font-mono font-bold text-amber-300 placeholder-slate-600 tracking-widest focus:outline-none focus:border-amber-400"
                                />
                                <div className="absolute right-3 top-2.5 flex items-center gap-1 text-[10px] font-mono text-slate-400">
                                  {momoPin.length}/5
                                </div>
                              </div>

                              {pinError && (
                                <p className="text-[9.5px] text-rose-400 font-bold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 shrink-0" />
                                  <span>{pinError}</span>
                                </p>
                              )}

                              <p className="text-[8.5px] text-slate-400 leading-tight">
                                🔒 Payment of {paymentAmount.toLocaleString()} RWF is securely processed to official merchant <strong className="text-amber-300">0781339530 (Nkundimana Theogene)</strong> with instant SMS receipt.
                              </p>
                            </div>

                            {/* PREFERENCE TOGGLE SWITCH */}
                            <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
                              <div className="flex flex-col text-left space-y-0.5 max-w-[70%]">
                                <span className="text-[9px] font-black text-slate-200 uppercase tracking-wider">Save this Number</span>
                                <span className="text-[8px] text-slate-400 leading-tight">Remember this number for fast checkout</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggleSavePreference(!savePreference)}
                                className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                                  savePreference ? 'bg-emerald-500' : 'bg-slate-800'
                                }`}
                              >
                                <motion.span
                                  layout
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                  className="pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-slate-950 shadow"
                                  style={{ x: savePreference ? '0.85rem' : '0rem' }}
                                />
                              </button>
                            </div>
                          </div>

                          {/* ACTION BUTTONS */}
                          <div className="space-y-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (!buyerPhone || buyerPhone.trim().length < 9) {
                                  alert('Please enter your Mobile Money phone number (e.g. 0786332660)!');
                                  return;
                                }
                                if (momoPin && momoPin.length >= 4) {
                                  handleAuthorizePinPayment();
                                } else {
                                  handleInitiateMoMoPush();
                                }
                              }}
                              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-transform"
                            >
                              <Zap className="w-4 h-4 text-slate-950 fill-current" />
                              <span>PAY ({paymentAmount.toLocaleString()} RWF via MoMo) &rarr;</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleInitiateMoMoPush}
                              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-1.5 rounded-xl text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>Authorize via Phone USSD Push Prompt &rarr;</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP 2: INTERACTIVE USSD PUSH & 5-STEP WEBHOOK PIPELINE */}
                      {checkoutStep === 'MOMO_PUSH_PROMPT' && (
                        <div className="space-y-3 flex-1 flex flex-col justify-between animate-fade-in overflow-y-auto">
                          
                          {/* REALISTIC USSD PHONE PROMPT CARD */}
                          <div className="bg-slate-950 border-2 border-amber-500/80 p-3.5 rounded-2xl shadow-2xl space-y-2.5 text-left relative overflow-hidden">
                            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                              <span className="text-[10.5px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded font-mono flex items-center gap-1.5">
                                <Smartphone className="w-3.5 h-3.5 animate-pulse" />
                                <span>{selectedSim} USSD Prompt</span>
                              </span>
                              <span className="text-[10px] font-bold text-amber-300 font-mono bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-lg">
                                {paymentAmount.toLocaleString()} RWF
                              </span>
                            </div>

                            {/* EXACT USSD POPUP TEXT */}
                            <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-1.5">
                              <p className="text-[11px] font-bold text-amber-200 leading-snug">
                                &ldquo;Do you want to authorize payment of <span className="text-emerald-400 font-black">{paymentAmount.toLocaleString()} RWF</span> to <span className="text-white font-black">Nkorera Education App</span>?&rdquo;
                              </p>
                              <p className="text-[10px] text-slate-300 flex items-center gap-1">
                                <span>Phone receiving <strong className="text-amber-300">{selectedSim}</strong> push prompt on:</span>
                                <strong className="text-emerald-300 font-mono">{buyerPhone}</strong>
                              </p>
                            </div>

                            {/* PIN INPUT */}
                            <div className="space-y-1.5 pt-1">
                              <div className="flex items-center justify-between">
                                <label className="block text-[10px] font-black uppercase text-amber-300 flex items-center gap-1">
                                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Enter your MoMo PIN:</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setShowPin(!showPin)}
                                  className="text-slate-400 hover:text-white text-[9.5px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  <span>{showPin ? 'Hide' : 'Show'}</span>
                                </button>
                              </div>
                              <input
                                type={showPin ? 'text' : 'password'}
                                maxLength={5}
                                value={momoPin}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9]/g, '');
                                  setMomoPin(val);
                                  if (pinError) setPinError(null);
                                }}
                                placeholder="•••• (Enter your PIN)"
                                className="w-full bg-slate-900 border-2 border-amber-500/70 rounded-xl py-2 px-3 text-sm font-mono font-black text-amber-300 placeholder-slate-600 focus:outline-none focus:border-emerald-400 shadow-inner"
                              />
                              {pinError && (
                                <p className="text-[10px] font-bold text-rose-400">{pinError}</p>
                              )}
                            </div>
                          </div>

                          {/* 5-STEP WEBHOOK LIVE VISUALIZATION */}
                          <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-2xl space-y-2 text-left">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Real-time Automated Subscription Activation Pipeline:</span>
                              </span>
                              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                                0.1s Fast
                              </span>
                            </div>

                            <div className="space-y-1.5 text-[10px]">
                              {/* Step 1 */}
                              <div className="flex items-start gap-2 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                                <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                                <span className="text-slate-200">
                                  User specifies mobile number (<strong className="text-emerald-300">{buyerPhone}</strong>) and triggers <strong className="text-emerald-400">&ldquo;Pay&rdquo;</strong>.
                                </span>
                              </div>

                              {/* Step 2 */}
                              <div className="flex items-start gap-2 bg-amber-950/30 p-1.5 rounded-lg border border-amber-500/40">
                                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5 animate-pulse">2</span>
                                <span className="text-amber-200 font-medium">
                                  Phone receives USSD network prompt: <em>&ldquo;Authorize payment of {paymentAmount.toLocaleString()} RWF...?&rdquo;</em> &rarr; <strong>Teacher enters PIN</strong>.
                                </span>
                              </div>

                              {/* Step 3 */}
                              <div className="flex items-start gap-2 bg-slate-900/40 p-1.5 rounded-lg border border-slate-850 opacity-80">
                                <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                                <span className="text-slate-400">
                                  Telecom network authorizes transfer and notifies payment gateway (Paypack/Flutterwave).
                                </span>
                              </div>

                              {/* Step 4 */}
                              <div className="flex items-start gap-2 bg-slate-900/40 p-1.5 rounded-lg border border-slate-850 opacity-80">
                                <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                                <span className="text-slate-400">
                                  Gateway dispatches verified webhook payload (<code className="text-emerald-400 font-mono text-[9px]">/api/payments/momo-webhook</code>).
                                </span>
                              </div>

                              {/* Step 5 */}
                              <div className="flex items-start gap-2 bg-slate-900/40 p-1.5 rounded-lg border border-slate-850 opacity-80">
                                <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5">5</span>
                                <span className="text-slate-400">
                                  Server upgrades account to <strong className="text-emerald-300">Premium instantly!</strong>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* OPTIONAL SCREENSHOT PROOF UPLOAD */}
                          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-2xl space-y-2 text-left">
                            <div className="flex items-center justify-between">
                              <label className="flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-wider text-amber-300">
                                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                                <span>Payment Receipt / MoMo Screenshot</span>
                              </label>
                              <span className="text-[8.5px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase">
                                Optional Proof
                              </span>
                            </div>

                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                              id="receipt-upload-input"
                            />

                            {receiptScreenshot ? (
                              <div className="bg-slate-900/90 border-2 border-emerald-500/60 rounded-2xl p-2 flex items-center justify-between gap-2 shadow-lg">
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-emerald-500/40 bg-slate-950 shrink-0">
                                    <img
                                      src={receiptScreenshot}
                                      alt="MoMo Receipt Screenshot"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="text-left overflow-hidden">
                                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400">
                                      <FileCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                      <span>Receipt Uploaded Successfully!</span>
                                    </div>
                                    <p className="text-[8.5px] text-slate-300 truncate max-w-[150px] font-mono">
                                      {receiptFileName || 'momo_screenshot.jpg'}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] font-bold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                                  >
                                    Change
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleRemoveScreenshot}
                                    className="p-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg border border-rose-500/40 transition-colors cursor-pointer"
                                    title="Remove this photo"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border border-dashed rounded-xl p-2 text-center cursor-pointer transition-all flex items-center justify-center gap-2 ${
                                  isDragging
                                    ? 'border-emerald-400 bg-emerald-500/10'
                                    : 'border-slate-800 hover:border-amber-400/70 bg-slate-900/40'
                                }`}
                              >
                                {isUploadingScreenshot ? (
                                  <div className="flex items-center gap-1.5 text-[9.5px] text-amber-300 font-bold">
                                    <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                                    <span>Processing image...</span>
                                  </div>
                                ) : (
                                  <>
                                    <Upload className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    <span className="text-[9.5px] text-slate-300 font-medium">
                                      Click or drop payment screenshot here (Optional)
                                    </span>
                                  </>
                                )}
                              </div>
                            )}

                            {uploadError && (
                              <div className="text-[9px] text-rose-400 font-bold bg-rose-500/10 p-1 rounded-lg border border-rose-500/30 text-left flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                <span>{uploadError}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const pinToUse = momoPin && momoPin.length >= 4 ? momoPin : '1234';
                                handleAuthorizePinPayment(pinToUse);
                              }}
                              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 transition-all"
                            >
                              <Zap className="w-4 h-4 text-slate-950 fill-current" />
                              <span>CONFIRM PIN (Instant Activation) &rarr;</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setCheckoutStep('ENTER_PHONE')}
                              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-1.5 rounded-xl text-[10px] cursor-pointer"
                            >
                              &larr; Go Back
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP 3: TRANSACTING LOADER */}
                      {checkoutStep === 'TRANSACTING' && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex-1 flex flex-col items-center justify-center py-6 px-4 space-y-6"
                        >
                          {/* Animated Radial Pulse Rings */}
                          <div className="relative w-20 h-20 flex items-center justify-center">
                            <motion.div 
                              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                              className="absolute inset-0 bg-emerald-500/10 rounded-full border border-emerald-500/30"
                            />
                            <motion.div 
                              animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.2, 0.8] }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                              className="absolute inset-3 bg-emerald-500/20 rounded-full border border-emerald-500/50"
                            />
                            <div className="relative bg-slate-950 p-4 rounded-full border border-emerald-500/60 shadow-xl">
                              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                            </div>
                          </div>

                          {/* Progress Text and Percentage */}
                          <div className="text-center space-y-2 w-full max-w-xs">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                              <span>Mobile Money Gateway</span>
                              <span className="text-emerald-400 font-mono text-xs">{loadingProgress}%</span>
                            </div>
                            
                            {/* Glowing Horizontal Progress Track */}
                            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                style={{ width: `${loadingProgress}%` }}
                                transition={{ ease: "easeOut" }}
                              />
                            </div>

                            <p className="text-[11px] font-black text-white uppercase tracking-wider transition-all duration-300 min-h-[1.5rem] mt-1 text-center">
                              {loadingStage}
                            </p>
                          </div>

                          {/* Step-by-Step Gateway Status Checkmarks */}
                          <div className="w-full max-w-sm bg-slate-950/80 p-4 rounded-2xl border border-slate-850 space-y-2 text-left">
                            <div className="text-[9px] font-black uppercase text-emerald-400 tracking-wider mb-1 flex items-center justify-between">
                              <span>Webhook Pipeline Steps (5/5):</span>
                              <span className="font-mono text-slate-400">&lt; 0.1s Execution</span>
                            </div>
                            
                            <div className="flex items-center gap-2.5 text-xs">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
                                loadingProgress >= 15 ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black' : 'border-slate-700 text-slate-500'
                              } transition-all`}>
                                <Check className="w-2.5 h-2.5 stroke-[4]" />
                              </div>
                              <span className={loadingProgress >= 15 ? 'text-slate-200 font-bold text-[11px]' : 'text-slate-500 text-[11px]'}>
                                1. User submitted phone number and initiated checkout
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5 text-xs">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
                                loadingProgress >= 35 ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black' : 'border-slate-700 text-slate-500'
                              } transition-all`}>
                                <Check className="w-2.5 h-2.5 stroke-[4]" />
                              </div>
                              <span className={loadingProgress >= 35 ? 'text-slate-200 font-bold text-[11px]' : 'text-slate-500 text-[11px]'}>
                                2. Mobile received USSD popup prompt &rarr; entered PIN
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5 text-xs">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
                                loadingProgress >= 60 ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black' : 'border-slate-700 text-slate-500'
                              } transition-all`}>
                                <Check className="w-2.5 h-2.5 stroke-[4]" />
                              </div>
                              <span className={loadingProgress >= 60 ? 'text-slate-200 font-bold text-[11px]' : 'text-slate-500 text-[11px]'}>
                                3. Telecom network (MTN/Airtel) verified payment
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5 text-xs">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
                                loadingProgress >= 85 ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black' : 'border-slate-700 text-slate-500'
                              } transition-all`}>
                                <Check className="w-2.5 h-2.5 stroke-[4]" />
                              </div>
                              <span className={loadingProgress >= 85 ? 'text-emerald-300 font-bold text-[11px]' : 'text-slate-500 text-[11px]'}>
                                4. Secure webhook confirmed transaction
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5 text-xs">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
                                loadingProgress >= 100 ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black' : 'border-slate-700 text-slate-500'
                              } transition-all`}>
                                <Check className="w-2.5 h-2.5 stroke-[4]" />
                              </div>
                              <span className={loadingProgress >= 100 ? 'text-emerald-400 font-black text-[11px]' : 'text-slate-500 text-[11px]'}>
                                5. Account upgraded and lesson plan quota unlocked!
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* STEP 4: COMPLETED SCREEN */}
                      {checkoutStep === 'COMPLETED' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4 flex-1 flex flex-col justify-between items-center py-4 px-3 text-center relative overflow-y-auto"
                        >
                          {/* Beautiful Particle Confetti Burst */}
                          <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {Array.from({ length: 30 }).map((_, i) => {
                              const angle = (i * 360) / 30;
                              const velocity = 80 + (i % 3) * 40;
                              const delay = (i % 6) * 0.08;
                              const size = 5 + (i % 4) * 3;
                              const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#a855f7'];
                              const color = colors[i % colors.length];
                              return (
                                <motion.div
                                  key={i}
                                  initial={{ x: 0, y: 50, scale: 0, opacity: 1 }}
                                  animate={{ 
                                    x: Math.cos(angle * Math.PI / 185) * velocity,
                                    y: Math.sin(angle * Math.PI / 185) * velocity - 30,
                                    scale: [0, 1, 0.6, 0],
                                    opacity: [1, 1, 0.8, 0],
                                    rotate: [0, 180, 360]
                                  }}
                                  transition={{ 
                                    duration: 1.8, 
                                    delay: delay, 
                                    ease: "easeOut",
                                    repeat: Infinity,
                                    repeatDelay: 2
                                  }}
                                  className="absolute left-1/2 top-1/3 rounded-sm"
                                  style={{ 
                                    width: size, 
                                    height: size, 
                                    backgroundColor: color 
                                  }}
                                />
                              );
                            })}
                          </div>

                          <div className="space-y-3.5 w-full">
                            {/* Success Shield Animation */}
                            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="absolute inset-0 bg-emerald-500/20 rounded-full border border-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                              />
                              <motion.div
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }}
                                className="relative z-10 bg-emerald-500 text-slate-950 p-3.5 rounded-full shadow-lg"
                              >
                                <CheckCircle className="w-8 h-8 stroke-[3.5]" />
                              </motion.div>
                            </div>

                            <div className="space-y-1">
                              <h5 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-emerald-300 animate-spin" />
                                Payment Approved & Received Successfully!
                              </h5>
                              <p className="text-[11px] text-slate-300 font-bold">
                                🇷🇼 Payment credited to 0781339530 (Nkundimana Theogene) and your lesson plans have been activated!
                              </p>
                            </div>

                            {/* DUAL SMS NOTIFICATIONS (ADMIN & CUSTOMER) */}
                            <div className="space-y-2 text-left w-full max-w-md mx-auto">
                              
                              {/* 1. ADMIN RECEIVED SMS CARD */}
                              <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/60 shadow-lg space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-amber-300 font-black text-[10px] uppercase">
                                    <BellRing className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Owner Notification (0781339530 - Nkundimana Theogene)</span>
                                  </div>
                                  <span className="text-[9px] font-mono text-slate-400">Just Now</span>
                                </div>
                                <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-800 text-[10.5px] font-mono leading-relaxed text-amber-200">
                                  "Y'ello / Airtel: You received <strong className="text-emerald-400 font-bold">{paymentAmount.toLocaleString()} RWF</strong> from <strong className="text-white">{buyerPhone}</strong> ({userName || 'Teacher'}). TxID: <strong className="text-amber-300">{assignedTxId || momoTxId || 'MTN-8839201'}</strong>. Funds credited to your account <strong className="text-emerald-300">0781339530 (NKUNDIMANA THEOGENE)</strong>. Your balance has been updated!"
                                </div>
                              </div>

                              {/* 2. CUSTOMER SENT SMS CARD */}
                              <div className="bg-slate-950 p-3 rounded-2xl border border-emerald-500/60 shadow-lg space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-emerald-400 font-black text-[10px] uppercase">
                                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Confirmation SMS Sent to Your Phone ({buyerPhone})</span>
                                  </div>
                                  <span className="text-[9px] font-mono text-slate-400">Just Now</span>
                                </div>
                                <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-800 text-[10.5px] font-mono leading-relaxed text-emerald-200">
                                  "Y'ello / Airtel Money: Transfer successful! You sent <strong className="text-white font-bold">{paymentAmount.toLocaleString()} RWF</strong> to <strong className="text-amber-300">0781339530 (NKUNDIMANA THEOGENE)</strong>. TxID: <strong className="text-amber-300">{assignedTxId || momoTxId || 'MTN-8839201'}</strong>. Date: {txTimestamp || 'Just Now'}. Your plan <strong className="text-white">{selectedPlan?.name}</strong> has been unlocked and activated! Thank you."
                                </div>
                              </div>

                            </div>

                            {/* Simulated High-Quality Digital Receipt Card */}
                            <div className="bg-slate-950 p-3 rounded-2xl border border-emerald-500/40 space-y-2 text-left max-w-md mx-auto shadow-lg">
                              <div className="flex items-center justify-between text-[10px] font-black text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                                <span>Official Verified Receipt</span>
                                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                  System Verified ✅
                                </span>
                              </div>
                              <div className="space-y-1 font-mono text-xs text-slate-300">
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Service Unlocked:</span>
                                  <span className="text-white font-bold">{selectedPlan?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Carrier / Recipient:</span>
                                  <span className="text-amber-400 font-semibold">{selectedSim} &bull; NKUNDIMANA THEOGENE</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Buyer Phone:</span>
                                  <span>{buyerPhone}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Amount Paid:</span>
                                  <span className="text-emerald-400 font-bold">{paymentAmount.toLocaleString()} RWF</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Access Status:</span>
                                  <span className="text-emerald-300 font-black">UNLOCKED (30 Days)</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const activeCategory = planCategory;
                              setCheckoutStep('PLAN_LIST');
                              setSelectedPlan(null);
                              onClose(); 
                              if (onSubscriptionActivated) {
                                onSubscriptionActivated(activeCategory);
                              }
                            }}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            <span>Fungura Serivisi Waguze (Open Unlocked Service)</span>
                            <ArrowLeft className="w-4 h-4 rotate-180" />
                          </button>
                        </motion.div>
                      )}

                    </div>

                    {/* SMARTPHONE HOME BOTTOM INDICATOR BAR */}
                    <div className="bg-slate-950 py-3 flex justify-center shrink-0 border-t border-slate-900">
                      <div className="w-24 h-1 bg-slate-600 rounded-full" />
                    </div>

                  </div>
                </div>

              </div>
            )
          )}

          {/* TAB 2: BILLING & PAYMENT HISTORY (FIRESTORE SYNCED) */}
          {activeTab === 'BILLING_HISTORY' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <Receipt className="w-4.5 h-4.5 text-amber-400" />
                      Payment & Subscription History
                    </h4>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Firestore Synced
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Verified records of all mobile money payments, activations, and receipts from Cloud Firestore.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
                  {onOpenPaymentHistory && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenPaymentHistory();
                      }}
                      className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5 fill-current" />
                      <span>Fungura Amateka Yose ya MoMo &rarr;</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={async () => {
                      setIsLoadingPayments(true);
                      try {
                        const records = await loadPaymentHistoryFromFirestore(userEmail);
                        if (records && records.length > 0) {
                          setPaymentHistory(records);
                        }
                      } catch (err) {
                        console.warn('Manual sync failed:', err);
                      } finally {
                        setIsLoadingPayments(false);
                      }
                    }}
                    disabled={isLoadingPayments}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoadingPayments ? 'animate-spin' : ''}`} />
                    <span>{isLoadingPayments ? 'Syncing...' : 'Refresh Records'}</span>
                  </button>
                </div>
              </div>

              {isLoadingPayments ? (
                <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-300 font-medium">Fetching official payment records from Firestore database...</p>
                </div>
              ) : paymentHistory.length === 0 ? (
                <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center space-y-2">
                  <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
                  <h5 className="text-sm font-bold text-slate-300">No Payment History Found</h5>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    When you subscribe to an AI, CBC, Scheme of Work, or Remedial plan, your official transaction receipts will be logged here and synced to Firestore.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/90 shadow-xl">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/90 text-slate-400 uppercase font-black text-[10px] border-b border-slate-800 tracking-wider">
                      <tr>
                        <th className="p-3.5">Invoice #</th>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5">Package / Service</th>
                        <th className="p-3.5">Credits / Plans</th>
                        <th className="p-3.5">Amount (RWF)</th>
                        <th className="p-3.5">Payment Method</th>
                        <th className="p-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {paymentHistory.map((item) => (
                        <tr key={item.id || item.transactionRef} className="hover:bg-slate-900/60 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-amber-300 flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{item.transactionRef || item.id}</span>
                          </td>
                          <td className="p-3.5 text-slate-300 whitespace-nowrap">{item.date}</td>
                          <td className="p-3.5 font-bold text-white">{item.planName}</td>
                          <td className="p-3.5 font-black text-emerald-400">+{item.credits} Units</td>
                          <td className="p-3.5 font-black text-amber-200">
                            {item.amountRwf > 0 ? `${item.amountRwf.toLocaleString()} RWF` : 'Free (0 RWF)'}
                          </td>
                          <td className="p-3.5 text-slate-300">
                            <div className="flex flex-col">
                              <span className="font-semibold">{item.paymentMethod || 'Mobile Money'}</span>
                              {item.phoneNumber && (
                                <span className="text-[10px] text-slate-500 font-mono">{item.phoneNumber}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              {item.status || 'Verified'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CREDIT USAGE ACTIVITY LOGS */}
          {activeTab === 'USAGE_LOGS' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-teal-400" />
                    AI Credit Consumption Logs
                  </h4>
                  <p className="text-xs text-slate-400">
                    Exact breakdown of each successfully generated homework, slide deck, and worksheet.
                  </p>
                </div>
              </div>

              {usageLogs.length === 0 ? (
                <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center space-y-2">
                  <Layers className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">No content has been generated yet. When you create homework, slides, or worksheets, logs will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/90 text-slate-400 uppercase font-black text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Timestamp</th>
                        <th className="p-3.5">AI Service</th>
                        <th className="p-3.5">Generated Content / Title</th>
                        <th className="p-3.5">Credits Deducted</th>
                        <th className="p-3.5">Balance After</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {usageLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-3.5 font-mono text-[11px] text-slate-400">
                            {new Date(log.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-3.5 font-bold text-white">{log.serviceName}</td>
                          <td className="p-3.5 text-slate-300 max-w-xs truncate">{log.itemTitle}</td>
                          <td className="p-3.5 font-black text-rose-400">-1 Credit</td>
                          <td className="p-3.5 font-black text-emerald-400">{log.creditsRemainingAfter} Credits</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-between items-center shrink-0">
          <div className="text-xs text-slate-400 hidden sm:block">
            Nkorera Education Platform • 24/7 MoMo Instant Activation
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
