import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, Mail, Phone, Lock, ShieldCheck, AlertTriangle, Key, RefreshCw, UserCheck } from 'lucide-react';
import { OWNER_INFO } from '../data/plans';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInSuccess: (userData: { email: string; name: string; phone?: string; sessionToken?: string }) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose, onSignInSuccess }) => {
  const [step, setStep] = useState<'options' | 'google_emails' | 'email_form' | 'forgot_password' | 'reset_password'>('options');
  const [isRegister, setIsRegister] = useState(true); // Toggle between Login (false) and Register (true)
  
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  
  // Forgot password flow states
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [receivedCode, setReceivedCode] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Preset Google accounts for instant demo & real email selection
  const googleAccounts = [
    { email: 'nkundimana123theogene@gmail.com', name: 'NKUNDIMANA Theogene', avatar: 'NT', badge: '👑 Website Owner & Educator' },
  ];

  // Continue with google or simulated auth bypass
  const processGoogleSignIn = async (email: string, name: string) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          provider: 'google',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Guconnekita byataye igihe. Ongera ugerageze.');
      }

      const data = await res.json();
      onSignInSuccess({
        email: data.user.email,
        name: data.user.name,
        phone: data.user.phone,
        sessionToken: data.user.sessionToken,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Kwinjira muri konti ntibyakunze. Ongera ugerageze.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Register/Login with custom credentials
  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customPassword) return;

    setIsSubmitting(true);
    setAuthError(null);
    setSuccessMessage(null);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister 
      ? { email: customEmail, name: customName || customEmail.split('@')[0], phone: customPhone, password: customPassword }
      : { email: customEmail, password: customPassword };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ikibazo cyavuka mu gukora iyi operation. Kora refresh ugerageze.');
      }

      setSuccessMessage(isRegister ? 'Konti yaremwe neza!' : 'Kwinjira byagenze neza!');
      
      // Auto success login trigger
      setTimeout(() => {
        onSignInSuccess({
          email: data.user.email,
          name: data.user.name,
          phone: data.user.phone,
          sessionToken: data.user.sessionToken,
        });
        onClose();
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Ntabwo bikunze. Reba imyirondoro yawe neza.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Forgot password step 1: Request code
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setIsSubmitting(true);
    setAuthError(null);
    setReceivedCode(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Adiresi ya email ntibonetse muri system.');
      }

      // Store the simulated generated code in state so the user can easily see and copy it
      setReceivedCode(data.code);
      setStep('reset_password');
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Ntibyakunze kureba email. Ongera ugerageze.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Forgot password step 2: Apply code and new password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !resetCode || !newPassword) return;

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          code: resetCode,
          newPassword: newPassword
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Kode wanditse siyo cyangwa yarangiye.');
      }

      setSuccessMessage('✓ Ijambo ry\'ibanga ryahindutse! Winjire ukoresheje ijambo rishya.');
      setReceivedCode(null);
      
      // Reset inputs & toggle to login screen
      setCustomEmail(forgotEmail);
      setCustomPassword(newPassword);
      setIsRegister(false);
      setStep('email_form');
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Guhindura ijambo ry\'ibanga ntibyakunze.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 px-6 py-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-100 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            id="sign-in-modal-close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>🔐 Secure Teacher Authentication</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {step === 'forgot_password' || step === 'reset_password' 
              ? 'Kwibagirwa password' 
              : isRegister ? 'Kwiyandikisha (Register)' : 'Kwinjira (Login)'}
          </h2>
          <p className="text-emerald-100 text-xs mt-1">
            {step === 'forgot_password' || step === 'reset_password'
              ? 'Tegura rishya utarinze guhagarara.'
              : 'Guhanga konti cyangwa kwinjira mu ruzinduko rw\'abarimu bose.'}
          </p>
        </div>

        <div className="p-6">
          {/* Success message banner */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
              <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Auth error message banner */}
          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-950">Ikibazo / Error:</p>
                <p>{authError}</p>
              </div>
            </div>
          )}

          {/* SIMULATED SMS / EMAIL NOTIFICATION POPUP */}
          {receivedCode && (
            <div className="mb-4 p-3.5 bg-amber-50 border-2 border-dashed border-amber-400 rounded-xl text-amber-900 text-xs space-y-1 animate-pulse">
              <p className="font-black flex items-center gap-1.5 text-amber-950">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Simulated Reset Code Notification</span>
              </p>
              <p className="text-slate-800">
                A 6-digit password reset verification code generated for <strong>{forgotEmail}</strong> is:
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-3 py-1 bg-white font-black text-sm tracking-wider text-amber-950 border border-amber-300 rounded-lg">
                  {receivedCode}
                </span>
                <span className="text-[10px] text-slate-500 font-bold">(Koporora iyi code uyishyire mu ruziga rukurikira)</span>
              </div>
            </div>
          )}

          {/* STEP: OPTIONS (Google or traditional form) */}
          {step === 'options' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-3.5 text-xs text-emerald-900 font-medium leading-relaxed space-y-1">
                <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Icyitonderwa / Information:</span>
                </p>
                <p className="text-slate-700">
                  Guhanga konti no kwinjira bikurinda ko hari undi muntu wakoresha cg yasoma amasomo yawe bwite (Lesson Plans).
                </p>
              </div>

              {/* Continue with Google button */}
              <button
                onClick={() => setStep('google_emails')}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-white border-2 border-slate-200 hover:border-emerald-500 rounded-xl font-bold text-slate-800 text-sm flex items-center justify-center gap-3 transition-all hover:bg-slate-50 shadow-xs group disabled:opacity-50"
                id="continue-with-google-btn"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="group-hover:text-emerald-700 uppercase">
                  {isSubmitting ? 'Bitegereze...' : 'CONTINUE WITH GOOGLE'}
                </span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="shrink-0 mx-3 text-slate-400 text-[10px] uppercase font-bold tracking-wider">CYANGWA / OR</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Email register/login options */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsRegister(false);
                    setStep('email_form');
                  }}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 text-xs flex items-center justify-center gap-1.5 transition-colors"
                  id="sign-in-email-phone-btn-login"
                >
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>Kwinjira</span>
                </button>

                <button
                  onClick={() => {
                    setIsRegister(true);
                    setStep('email_form');
                  }}
                  className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
                  id="sign-in-email-phone-btn-register"
                >
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span>Kwiyandikisha</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP: GOOGLE EMAILS */}
          {step === 'google_emails' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>➡️ Hitamo Google Account Yawe:</span>
                <button
                  onClick={() => setStep('options')}
                  className="text-emerald-600 hover:underline text-[11px]"
                >
                  Subira Inyuma
                </button>
              </p>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {googleAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => processGoogleSignIn(acc.email, acc.name)}
                    disabled={isSubmitting}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center justify-between transition-all group text-left disabled:opacity-50"
                    id={`select-email-${acc.email}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                        {acc.avatar}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 flex items-center gap-1.5">
                          {acc.name}
                          {acc.badge && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-normal px-1.5 py-0.5 rounded-xs">
                              {acc.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{acc.email}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => {
                    setIsRegister(true);
                    setStep('email_form');
                  }}
                  className="text-xs text-emerald-700 font-semibold hover:underline"
                >
                  Koresha arindi aderesi ya email (Use another email)
                </button>
              </div>
            </div>
          )}

          {/* STEP: REGISTER / LOGIN FORM */}
          {step === 'email_form' && (
            <form onSubmit={handleCredentialSubmit} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  {isRegister ? 'Kwiyandikisha (Hanga Konti)' : 'Kwinjira muri Konti yawe'}
                </label>
                <button
                  type="button"
                  onClick={() => setStep('options')}
                  className="text-emerald-600 hover:underline text-[11px]"
                >
                  Subira Inyuma
                </button>
              </div>

              {/* Register exclusive fields */}
              {isRegister && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Izina Ryose (Full Name)</label>
                  <input
                    type="text"
                    required={isRegister}
                    placeholder="e.g. Mukamana Angelique"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="teacher@school.rw"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Register exclusive phone */}
              {isRegister && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Telefone (Mobile Money)</label>
                  <input
                    type="tel"
                    placeholder="0788000000"
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-medium text-slate-600">Ijambo ry'ibanga (Password)</label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => setStep('forgot_password')}
                      className="text-[10px] text-amber-600 font-extrabold hover:underline"
                    >
                      Kwibagirwa password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                id="custom-get-started-btn"
              >
                <span>
                  {isSubmitting 
                    ? 'Bitegereze...' 
                    : isRegister ? '✓ Kwiyandikisha (Hanga Konti)' : '✓ Kwinjira mu rubuga'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Toggle Login/Register footer link */}
              <div className="pt-2 text-center text-xs">
                {isRegister ? (
                  <p className="text-slate-500">
                    Ufite konti isanzwe?{' '}
                    <button
                      type="button"
                      onClick={() => setIsRegister(false)}
                      className="text-emerald-700 font-black hover:underline"
                    >
                      Kwinjira hano
                    </button>
                  </p>
                ) : (
                  <p className="text-slate-500">
                    Ntabwo ufite konti?{' '}
                    <button
                      type="button"
                      onClick={() => setIsRegister(true)}
                      className="text-emerald-700 font-black hover:underline"
                    >
                      Kwiyandikisha
                    </button>
                  </p>
                )}
              </div>
            </form>
          )}

          {/* STEP: FORGOT PASSWORD REQUEST CODE */}
          {step === 'forgot_password' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Key className="w-4.5 h-4.5 text-amber-500" />
                  <span>Kwibagirwa password?</span>
                </label>
                <button
                  type="button"
                  onClick={() => setStep('email_form')}
                  className="text-emerald-600 hover:underline text-[11px] font-bold"
                >
                  Subira Inyuma
                </button>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                Andika adiresi ya email ukoresha maze tuguryoheze kode (Verification Code) yo guhindura ijambo ry'ibanga.
              </p>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="teacher@school.rw"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !forgotEmail}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                <span>{isSubmitting ? 'Tegereza...' : 'Boherereza Kode yo Gukoporora'}</span>
              </button>
            </form>
          )}

          {/* STEP: RESET PASSWORD FORM */}
          {step === 'reset_password' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-4.5 h-4.5 text-amber-500" />
                  <span>Shyiramo Kode & Ijambo Rishya</span>
                </label>
                <button
                  type="button"
                  onClick={() => setStep('forgot_password')}
                  className="text-emerald-600 hover:underline text-[11px] font-bold"
                >
                  Subira Inyuma
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Verification Code (Kode y'imibare 6)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123456"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono tracking-widest text-center text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Ijambo ry'ibanga Rishya (New Password)</label>
                <input
                  type="password"
                  required
                  placeholder="Andika ijambo rishya ry'ibanga"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !resetCode || !newPassword}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4 text-emerald-100" />
                <span>{isSubmitting ? 'Tegereza...' : '✓ Guhindura Ijambo ry\'ibanga'}</span>
              </button>
            </form>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            Website Owner: <span className="font-bold text-slate-800">{OWNER_INFO.name}</span>
            <br />
            MoMo Payments & WhatsApp: <span className="text-emerald-700 font-semibold">{OWNER_INFO.whatsapp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
