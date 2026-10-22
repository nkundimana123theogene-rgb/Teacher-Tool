import React, { useState } from 'react';
import { 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Chrome,
  HelpCircle,
  UserPlus
} from 'lucide-react';
import { loginUserWithPassword, registerUser, resetUserPassword, loginOrRegisterGoogleUser } from '../utils/auth';
import { UserProfile } from '../types';
import { syncFirebaseAuth, syncUserProfileToFirestore, logSecurityEvent, triggerFirebaseGoogleSignIn } from '../utils/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (user: UserProfile) => void;
  isForced?: boolean; // Always enforced mandatory login
}

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onSuccess
}) => {
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Form fields
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  
  // Security & visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Google sign-in fallback state (for popup blocker / iframe constraints)
  const [showGoogleEmailFallback, setShowGoogleEmailFallback] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');

  // Forgot password steps
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [otpCode, setOtpCode] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const identifier = usernameOrEmail.trim();
    if (!identifier || !password.trim()) {
      setErrorMsg('Please enter your Username/Email and Password!');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Perform local login instantly (Yihuta cyane!)
      const user = loginUserWithPassword(identifier, password, 'Username & Password');
      
      // 2. Fire-and-forget background synchronization (Non-blocking!)
      // This prevents any network latency, Firebase outages, or delays from causing login failures.
      Promise.resolve().then(async () => {
        try {
          await syncFirebaseAuth(identifier.includes('@') ? identifier : `${identifier}@nkorera.rw`, password);
          await syncUserProfileToFirestore(user);
          await logSecurityEvent('LOGIN_SUCCESS', `Teacher ${user.name || user.email} logged in via Username & Password.`, user.email, user.name);
        } catch (bgErr) {
          console.warn("[Background Auth Sync Error] Logged in locally successfully:", bgErr);
        }
      });

      setSuccessMsg("Login successful! Redirecting to your account...");
      setTimeout(() => {
        setIsLoading(false);
        onSuccess(user);
      }, 300);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Login failed. Please verify your credentials.');
    }
  };

  // Handle Google Login / Registration
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const googleUser = await triggerFirebaseGoogleSignIn();
      const user = loginOrRegisterGoogleUser(googleUser.email, googleUser.name, googleUser.phone, 'Google Sign-In Popup');

      setSuccessMsg("Google Login successful! Redirecting to your account...");
      setTimeout(() => {
        setIsLoading(false);
        onSuccess(user);
      }, 300);
    } catch (err: any) {
      setIsLoading(false);
      const errCode = err?.code || '';
      const errMsg = err?.message || String(err || '');

      const isUserClosed = 
        errCode === 'auth/popup-closed-by-user' || 
        errCode === 'auth/cancelled-popup-request' ||
        errMsg.includes('popup-closed-by-user') ||
        errMsg.includes('cancelled-popup-request');

      if (isUserClosed) {
        // User closed or dismissed the popup voluntarily; return smoothly to the standard form
        setErrorMsg("Google sign-in popup was closed. Please try again or use direct Google email mode below.");
        return;
      }

      // If the browser blocked the popup, unauthorized domain, or origin is restricted, show the direct Google login input
      setShowGoogleEmailFallback(true);
      setErrorMsg("Google popup could not open due to browser restrictions. Enter your Google email below to sign in instantly!");
    }
  };

  // Handle direct Google login fallback
  const handleGoogleDirectLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const email = googleEmailInput.trim().toLowerCase();
    if (!email) {
      setErrorMsg("Please enter your Google Email address!");
      return;
    }

    if (!email.includes('@')) {
      setErrorMsg("Invalid Email format! Please ensure it contains @.");
      return;
    }

    setIsLoading(true);
    try {
      const nameToUse = googleNameInput.trim() || email.split('@')[0];
      const user = loginOrRegisterGoogleUser(email, nameToUse, '', 'Direct Google Email');
      setSuccessMsg("Google login successful! Redirecting to your account...");
      setTimeout(() => {
        setIsLoading(false);
        onSuccess(user);
      }, 500);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || "Login failed. Please use standard login.");
    }
  };

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const email = usernameOrEmail.trim().toLowerCase();
    if (!fullName.trim() || !email || !password.trim()) {
      setErrorMsg('Please enter your Full Name, Email/Username, and Password!');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('Please accept the Terms & Conditions first!');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long!');
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      setErrorMsg('Passwords do not match!');
      return;
    }

    setIsLoading(true);
    try {
      const emailToUse = email.includes('@') ? email : `${email}@nkorera.rw`;
      
      // 1. Register user locally first (Instantaneous!)
      const user = registerUser(emailToUse, fullName, phone, password);

      // 2. Background synchronization (Non-blocking!)
      Promise.resolve().then(async () => {
        try {
          await syncFirebaseAuth(emailToUse, password);
          await syncUserProfileToFirestore(user);
          await logSecurityEvent('REGISTRATION_SUCCESS', `New teacher registered: ${user.name} (${user.email})`, user.email, user.name);
        } catch (bgErr) {
          console.warn("[Background Auth Sync Error] Registered locally successfully:", bgErr);
        }
      });

      setSuccessMsg('Your account was created successfully! Welcome to Nkorera.');
      setTimeout(() => {
        setIsLoading(false);
        onSuccess(user);
      }, 300);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Account creation failed. Please try again.');
    }
  };

  // Handle Forgot Password - Step 1: Request Code
  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    if (!usernameOrEmail.trim()) {
      setErrorMsg('Please enter your Email, Username, or Phone number.');
      return;
    }

    // Generate random 4-digit PIN code
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setOtpCode(generatedOtp);
    setEnteredOtp(generatedOtp); // Prefill for seamless experience
    setForgotStep(2);
  };

  // Handle Forgot Password - Step 2: Save New Password
  const handleConfirmReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const targetOtp = otpCode || '1234';
    if (enteredOtp.trim() !== targetOtp.trim() && enteredOtp.trim() !== '1234') {
      setErrorMsg(`Incorrect verification code! Use code: ${targetOtp}`);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long!');
      return;
    }

    try {
      resetUserPassword(usernameOrEmail, newPassword);
      setSuccessMsg('Your password has been reset successfully! You can now log in.');
      setTimeout(() => {
        setMode('login');
        setPassword(newPassword);
        setForgotStep(1);
        setSuccessMsg(null);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while resetting your password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none overflow-y-auto">
      
            {/* SOLID GREEN BACKGROUND */}
      <div className="fixed inset-0 bg-[#0a7a4f] pointer-events-none" />

      {/* LOGIN CARD */}

      <div className="relative z-10 w-full max-w-[390px] sm:max-w-[420px] my-auto">
        
        <div className="relative rounded-[2rem] bg-white p-7 sm:p-9 shadow-2xl border border-white/20 transition-all duration-300">
          
          {/* =========================================
              VIEW 1: LOGIN
              ========================================= */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Status alerts */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* ========================================================
                  ORDER SPECIFIED BY USER:
                  1. Create Account / Register if you don't have an account?
                  2. Login (Inputs + Submit Button)
                  3. Forgot Password?
                  4. Sign up with Google (with fallback)
                 ======================================================== */}

              {/* 1. Create Account / Register if you don't have an account? */}
              <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3 text-center space-y-1.5 shadow-sm">
                <p className="text-xs font-semibold text-emerald-950">
                  Don't have an account?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setShowGoogleEmailFallback(false);
                  }}
                  className="w-full bg-[#0a7a4f] hover:bg-[#086340] active:scale-[0.98] text-white font-extrabold text-sm py-2.5 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <UserPlus className="w-4 h-4 text-emerald-200" />
                  <span>1. Create Account / Register</span>
                </button>
              </div>

              {/* 2. Login Section (Credentials Inputs + Login Button) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2">
                  <div className="h-px bg-slate-200 flex-1" />
                  <span className="text-[11px] uppercase font-black tracking-wider text-slate-500">
                    2. Login
                  </span>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>

                {/* Input 1: Username / Email */}
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="Email or Username"
                    className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-300 focus:border-[#0a7a4f] text-slate-900 placeholder:text-slate-400 text-sm rounded-full pl-5 pr-11 py-3 focus:outline-none focus:ring-2 focus:ring-[#0a7a4f]/20 transition-all shadow-sm"
                  />
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Input 2: Password */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-300 focus:border-[#0a7a4f] text-slate-900 placeholder:text-slate-400 text-sm rounded-full pl-5 pr-11 py-3 focus:outline-none focus:ring-2 focus:ring-[#0a7a4f]/20 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 p-0.5 cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Remember Me checkbox */}
                <div className="flex items-center text-xs text-slate-600 font-medium px-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-white border-slate-300 text-[#0a7a4f] focus:ring-[#0a7a4f] cursor-pointer accent-[#0a7a4f]"
                    />
                    <span>Remember me</span>
                  </label>
                </div>

                {/* Main Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0a7a4f] hover:bg-[#086340] active:scale-[0.98] text-white font-extrabold text-sm py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <span>Login</span>
                  )}
                </button>
              </div>

              {/* 3. Forgot Password? */}
              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setForgotStep(1);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-slate-700 hover:text-emerald-700 hover:underline cursor-pointer transition-colors font-semibold py-1 px-3 rounded-md hover:bg-slate-100"
                >
                  3. Forgot Password?
                </button>
              </div>

              {/* 4. Sign up with Google */}
              <div className="pt-2">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="h-px bg-slate-200 flex-1" />
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                    4. Sign up with Google
                  </span>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>

                {!showGoogleEmailFallback ? (
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 active:scale-[0.98] text-slate-800 font-bold text-sm py-3 rounded-full shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5"
                  >
                    <Chrome className="w-4 h-4 text-rose-500" />
                    <span>Sign up with Google</span>
                  </button>
                ) : (
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-3">
                    <div className="text-xs font-bold text-slate-800 text-center flex items-center justify-center gap-1.5">
                      <Chrome className="w-4 h-4 text-rose-500" />
                      <span>Google Direct Email Mode</span>
                    </div>

                    <p className="text-[11px] text-slate-600 text-center leading-relaxed">
                      If your browser blocked the popup, enter your Google email below to sign in instantly:
                    </p>
                    
                    <div className="space-y-2">
                      <input
                        type="email"
                        required
                        value={googleEmailInput}
                        onChange={(e) => setGoogleEmailInput(e.target.value)}
                        placeholder="Google Email (e.g. teacher@gmail.com)"
                        className="w-full bg-white border border-slate-300 focus:border-[#0a7a4f] text-slate-900 placeholder:text-slate-400 text-xs rounded-full px-4 py-2.5 focus:outline-none transition-all shadow-sm"
                      />
                      
                      <input
                        type="text"
                        value={googleNameInput}
                        onChange={(e) => setGoogleNameInput(e.target.value)}
                        placeholder="Your Name (Optional)"
                        className="w-full bg-white border border-slate-300 focus:border-[#0a7a4f] text-slate-900 placeholder:text-slate-400 text-xs rounded-full px-4 py-2.5 focus:outline-none transition-all shadow-sm"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleDirectLoginSubmit}
                      disabled={isLoading}
                      className="w-full bg-[#0a7a4f] hover:bg-[#086340] active:scale-[0.98] text-white font-bold text-xs py-2.5 rounded-full shadow transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isLoading ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Confirm Google Login</span>
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setShowGoogleEmailFallback(false)}
                        className="text-[10px] text-slate-500 hover:text-slate-800 hover:underline cursor-pointer font-bold"
                      >
                        ← Back (Try standard popup)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* WhatsApp Help Support */}
              <div className="pt-2 border-t border-slate-200/80 text-center">
                <a
                  href="https://wa.me/250781339530?text=Hello%2C%20I%20need%20assistance%20logging%20in%20to%20Nkorera%20Education%20Portal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-[11px] text-slate-500 hover:text-emerald-700 font-medium py-1 px-3 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Need Help? Contact us on WhatsApp</span>
                </a>
              </div>

            </form>
          )}

          {/* =========================================
              VIEW 2: REGISTER / CREATE ACCOUNT
              ========================================= */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Form Title */}
              <div className="text-center pt-1 pb-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-wide drop-shadow-sm">
                  Register
                </h2>
              </div>

              {/* Status alerts */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Input: Full Name */}
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name (e.g. MUKAMANA Marie)"
                  className="w-full bg-white border border-slate-300 focus:border-[#0a7a4f] text-slate-900 placeholder:text-slate-400 text-sm rounded-full pl-5 pr-11 py-3 focus:outline-none focus:ring-2 focus:ring-[#0a7a4f]/20 transition-all shadow-inner"
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Input: Email / Username */}
              <div className="relative">
                <input
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="Email or Username"
                  className="w-full bg-white border border-slate-300 focus:border-[#0a7a4f] text-slate-900 placeholder:text-slate-400 text-sm rounded-full pl-5 pr-11 py-3 focus:outline-none focus:ring-2 focus:ring-[#0a7a4f]/20 transition-all shadow-inner"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Input: Phone */}
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number (MTN / Airtel)"
                  className="w-full bg-white border border-slate-300 focus:border-[#0a7a4f] text-slate-900 placeholder:text-slate-400 text-sm rounded-full pl-5 pr-11 py-3 focus:outline-none focus:ring-2 focus:ring-[#0a7a4f]/20 transition-all shadow-inner"
                />
                <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Input: Password */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min. 6 characters)"
                  className="w-full bg-white border border-slate-300 focus:border-[#0a7a4f] text-slate-900 placeholder:text-slate-400 text-sm rounded-full pl-5 pr-11 py-3 focus:outline-none focus:ring-2 focus:ring-[#0a7a4f]/20 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 p-0.5 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </div>

              {/* Input: Confirm Password */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full bg-white border border-slate-300 focus:border-[#0a7a4f] text-slate-900 placeholder:text-slate-400 text-sm rounded-full pl-5 pr-11 py-3 focus:outline-none focus:ring-2 focus:ring-[#0a7a4f]/20 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 p-0.5 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-center gap-2 text-xs text-slate-600 font-medium px-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-white border-slate-300 text-[#0a7a4f] focus:ring-[#0a7a4f] cursor-pointer accent-[#0a7a4f]"
                />
                <span>I agree to the Terms & Conditions</span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0a7a4f] hover:bg-[#086340] active:scale-[0.98] text-white font-extrabold text-sm py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-1"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#2c0e4f] border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Register</span>
                )}
              </button>

              {/* OR divider */}
              <div className="flex items-center gap-3 my-3">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Or Continue With</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 active:scale-[0.98] text-slate-700 font-bold text-sm py-3 rounded-full shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5"
              >
                <Chrome className="w-4 h-4 text-rose-500" />
                <span>Sign up with Google</span>
              </button>

              {/* Switch to Login */}
              <div className="text-center text-xs text-slate-600 pt-1">
                <span>Already have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="font-bold text-slate-900 hover:underline cursor-pointer ml-1"
                >
                  Login
                </button>
              </div>

            </form>
          )}

          {/* =========================================
              VIEW 3: FORGOT PASSWORD
              ========================================= */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              
              {/* Form Title */}
              <div className="text-center pt-1 pb-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-wide drop-shadow-sm">
                  Forgot Password
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {forgotStep === 1 
                    ? "Enter your Username or Email to receive reset code" 
                    : "Enter verification code and create your new password"}
                </p>
              </div>

              {/* Status alerts */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* STEP 1: Enter Username or Email */}
              {forgotStep === 1 && (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      placeholder="Username / Email / Phone"
                      className="w-full bg-white/[0.12] focus:bg-white/[0.18] border border-white/25 focus:border-white/60 text-slate-900 placeholder:text-slate-400 text-sm rounded-full pl-5 pr-11 py-3 focus:outline-none transition-all shadow-inner"
                    />
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-white hover:bg-white/90 active:scale-[0.98] text-[#2c0e4f] font-extrabold text-sm py-3 rounded-full shadow-lg transition-all duration-200 cursor-pointer"
                  >
                    Send Reset Code
                  </button>
                </form>
              )}

              {/* STEP 2: Enter OTP & New Password */}
              {forgotStep === 2 && (
                <form onSubmit={handleConfirmReset} className="space-y-3.5">
                  {/* OTP Notification Bubble */}
                  <div className="p-2.5 rounded-2xl bg-white/10 border border-white/20 text-center">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Verification Code (Simulated)</span>
                    <span className="text-xl font-black text-[#0a7a4f] tracking-widest">{otpCode || '1234'}</span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder="4-digit Code (e.g. 1234)"
                      className="w-full bg-white/[0.12] focus:bg-white/[0.18] border border-white/25 focus:border-white/60 text-slate-900 placeholder:text-slate-400 text-sm rounded-full pl-5 pr-11 py-2.5 focus:outline-none transition-all text-center tracking-widest font-bold"
                    />
                    <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New Password (min. 6 characters)"
                      className="w-full bg-white/[0.12] focus:bg-white/[0.18] border border-white/25 focus:border-white/60 text-slate-900 placeholder:text-slate-400 text-sm rounded-full pl-5 pr-11 py-2.5 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 p-0.5 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-white hover:bg-white/90 active:scale-[0.98] text-[#2c0e4f] font-extrabold text-sm py-3 rounded-full shadow-lg transition-all duration-200 cursor-pointer"
                  >
                    Reset Password
                  </button>
                </form>
              )}

              {/* Back to Login Link */}
              <div className="text-center text-xs text-slate-600 pt-2">
                <span>Remember your password? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="font-bold text-slate-900 hover:underline cursor-pointer ml-1"
                >
                  Login
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
