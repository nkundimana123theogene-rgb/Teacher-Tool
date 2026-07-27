import React, { useState } from 'react';
import {
  BookOpen,
  Globe,
  MoreVertical,
  User,
  Shield,
  Zap,
  LogOut,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Award
} from 'lucide-react';
import { UserProfile, LanguageOption } from '../types';
import { OWNER_INFO } from '../data/plans';
import { getLessonPlanLabels } from '../data/translations';
import { getTimeBasedGreeting } from '../utils/greeting';

interface HeaderProps {
  user: UserProfile | null;
  selectedLanguage: LanguageOption;
  onLanguageChange: (lang: LanguageOption) => void;
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  onOpenSignIn: () => void;
  onOpenSubscription: () => void;
  onOpenAdmin: () => void;
  onOpenPolicy?: () => void;
  onSignOut: () => void;
  activeTab: 'dashboard' | 'generator' | 'history' | 'subscription' | 'admin' | 'founder';
  onTabChange: (tab: 'dashboard' | 'generator' | 'history' | 'subscription' | 'admin' | 'founder') => void;
}

const COUNTRIES = [
  { code: 'Rwanda', flag: '🇷🇼', label: 'Rwanda (REB / CBC)' },
  { code: 'Uganda', flag: '🇺🇬', label: 'Uganda' },
  { code: 'Kenya', flag: '🇰🇪', label: 'Kenya' },
  { code: 'Tanzania', flag: '🇹🇿', label: 'Tanzania' },
  { code: 'Burundi', flag: '🇧🇮', label: 'Burundi' },
  { code: 'DRC', flag: '🇨🇩', label: 'DR Congo' },
  { code: 'Global', flag: '🌍', label: 'International / Global' },
];

const LANGUAGES: LanguageOption[] = ['Kinyarwanda', 'English', 'French', 'Swahili'];

export const Header: React.FC<HeaderProps> = ({
  user,
  selectedLanguage,
  onLanguageChange,
  selectedCountry,
  onCountryChange,
  onOpenSignIn,
  onOpenSubscription,
  onOpenAdmin,
  onOpenPolicy,
  onSignOut,
  activeTab,
  onTabChange,
}) => {
  const labels = getLessonPlanLabels(selectedLanguage);
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-2.5 group text-left focus:outline-hidden"
              id="header-logo-button"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 group-hover:scale-105 transition-all ring-2 ring-emerald-400/40">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="font-black text-xl sm:text-2xl text-emerald-700 tracking-tight block leading-none drop-shadow-xs">
                  Teacher Tool
                </span>
                <span className="text-[11px] sm:text-xs text-emerald-600 font-bold flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span>AI Lesson Plans</span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-md border border-amber-500 shadow-xs">
                    <span>IT/Developer: Nkundimana Theogene</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-md border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>24/7 Active (Ibihe Byose)</span>
                  </span>
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-sm font-medium">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg transition-all font-black ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-600 text-white border border-cyan-700 shadow-sm scale-105'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-white border border-cyan-500 shadow-2xs'
              }`}
              id="nav-dashboard-btn"
            >
              <span className="font-black text-white">Dashboard</span>
            </button>
            <button
              onClick={() => onTabChange('generator')}
              className={`px-3.5 py-1.5 rounded-lg transition-all font-black text-slate-950 ${
                activeTab === 'generator'
                  ? 'bg-amber-400 text-slate-950 border border-amber-500 shadow-xs'
                  : 'bg-amber-100 hover:bg-amber-200 text-slate-950 border border-amber-300/80'
              }`}
              id="nav-lesson-plans-btn"
            >
              <span className="font-black text-slate-950">{labels.navLessonPlans}</span>
            </button>
            <button
              onClick={() => onTabChange('history')}
              className={`px-3.5 py-1.5 rounded-lg transition-all font-black ${
                activeTab === 'history'
                  ? 'bg-purple-600 text-white border border-purple-700 shadow-xs'
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-950 border border-purple-300/80'
              }`}
              id="nav-history-btn"
            >
              <span className={`font-black ${activeTab === 'history' ? 'text-white' : 'text-purple-950'}`}>{labels.navSavedPlans}</span>
            </button>
            <button
              onClick={() => onTabChange('subscription')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'subscription'
                  ? 'bg-amber-500 text-white font-semibold shadow-xs'
                  : 'text-amber-700 hover:bg-amber-50 font-medium'
              }`}
              id="nav-subscription-btn"
            >
              <Zap className="w-4 h-4 fill-amber-300 stroke-amber-800" />
              {labels.navSubscription}
            </button>

            <button
              onClick={() => onTabChange('founder')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'founder'
                  ? 'bg-emerald-800 text-white font-bold shadow-xs'
                  : 'text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 font-semibold border border-emerald-200/80'
              }`}
              id="nav-founder-btn"
            >
              <Award className="w-4 h-4 text-amber-500 fill-amber-300" />
              <span>{labels.navFounder}</span>
            </button>

            <button
              onClick={() => onOpenPolicy?.()}
              className="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 bg-slate-200/80 hover:bg-slate-300 text-slate-800 font-bold text-xs border border-slate-300/60"
              title="Policy, Terms, Conditions & FAQ"
              id="header-policy-btn"
            >
              <Shield className="w-3.5 h-3.5 text-slate-700" />
              <span>Policy, Terms & FAQ</span>
            </button>

            <a
              href={OWNER_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs border border-emerald-300/80"
              title="Robotics & AI WhatsApp Support"
              id="header-whatsapp-support-btn"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>WhatsApp Group (0781339530)</span>
            </a>

            <button
              onClick={() => onTabChange('admin')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-purple-700 text-white font-bold shadow-xs'
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold border border-purple-300/80'
              }`}
              id="nav-admin-btn"
              title="Analytics, Usage Statistics & Subscriber Payment Management"
            >
              <Shield className="w-4 h-4 text-purple-800" />
              <span>Admin Panel</span>
            </button>
          </nav>

          {/* Controls Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLangMenu(!showLangMenu);
                  setShowCountryMenu(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200/80 hover:bg-emerald-100/80 transition-colors"
                title="Select Language"
                id="language-selector-button"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>{selectedLanguage}</span>
                <ChevronDown className="w-3 h-3 text-emerald-600" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Language
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        onLanguageChange(lang);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-emerald-50 ${
                        selectedLanguage === lang ? 'font-bold text-emerald-700 bg-emerald-50/60' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang}</span>
                      {selectedLanguage === lang && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Three dots (⋮) Menu for Country selection */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowCountryMenu(!showCountryMenu);
                  setShowLangMenu(false);
                }}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                title="Country & Region Options"
                id="country-menu-three-dots"
              >
                <span className="text-sm">
                  {COUNTRIES.find((c) => c.code === selectedCountry)?.flag || '🇷🇼'}
                </span>
                <MoreVertical className="w-4 h-4 text-slate-600" />
              </button>

              {showCountryMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    ➡️ Select your Country
                  </div>
                  {COUNTRIES.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => {
                        onCountryChange(country.code);
                        setShowCountryMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 ${
                        selectedCountry === country.code
                          ? 'font-bold text-emerald-800 bg-emerald-50/60'
                          : 'text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.label}</span>
                      </span>
                      {selectedCountry === country.code && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile / Sign In */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  id="user-profile-button"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium">
                      {user.isAdmin ? '👑 Owner' : `${user.remainingPlans} plans left`}
                    </div>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden">
                    <div className="px-4 py-2 bg-emerald-50/80 border-b border-emerald-100">
                      <p className="text-xs font-black text-emerald-900">
                        {getTimeBasedGreeting(user.name, selectedLanguage).title}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-medium leading-tight mt-0.5">
                        {user.email}
                      </p>
                      <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-900 text-[10px] font-bold shadow-2xs">
                        <Zap className="w-3 h-3 text-amber-600 fill-amber-400" />
                        <span>{user.currentPlan}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onOpenSubscription();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-xs text-left text-slate-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2 font-medium"
                    >
                      <Zap className="w-4 h-4 text-amber-500" />
                      ⚡ Upgrade Subscription
                    </button>

                    <button
                      onClick={() => {
                        onOpenPolicy?.();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-xs text-left text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-2 font-medium"
                    >
                      <Shield className="w-4 h-4 text-emerald-600" />
                      📜 Policy, Terms & Conditions
                    </button>

                    {user.isAdmin && (
                      <button
                        onClick={() => {
                          onOpenAdmin();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-xs text-left text-slate-700 hover:bg-purple-50 hover:text-purple-900 flex items-center gap-2 font-medium"
                      >
                        <Shield className="w-4 h-4 text-purple-600" />
                        Admin Dashboard
                      </button>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          onSignOut();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-xs text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenSignIn}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all hover:shadow-emerald-600/20"
                id="sign-in-modal-open-btn"
              >
                <User className="w-4 h-4" />
                <span>🔐 Register / Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-100 py-2 text-xs font-semibold overflow-x-auto gap-1">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 font-black ${
              activeTab === 'dashboard'
                ? 'bg-cyan-600 text-white border border-cyan-700 shadow-sm'
                : 'bg-cyan-500 hover:bg-cyan-600 text-white border border-cyan-500 shadow-2xs'
            }`}
          >
            <span className="font-black text-white">Dashboard</span>
          </button>
          <button
            onClick={() => onTabChange('generator')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 font-black text-slate-950 ${
              activeTab === 'generator' ? 'bg-amber-400 text-slate-950 border border-amber-500' : 'bg-amber-100 text-slate-950 border border-amber-300'
            }`}
          >
            <span className="font-black text-slate-950">{labels.navLessonPlans}</span>
          </button>
          <button
            onClick={() => onTabChange('history')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 font-black ${
              activeTab === 'history' ? 'bg-purple-600 text-white border border-purple-700' : 'bg-purple-100 text-purple-950 border border-purple-300'
            }`}
          >
            <span className={`font-black ${activeTab === 'history' ? 'text-white' : 'text-purple-950'}`}>{labels.navSavedPlans}</span>
          </button>
          <button
            onClick={() => onTabChange('subscription')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
              activeTab === 'subscription' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-amber-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            {labels.navSubscription}
          </button>
          <button
            onClick={() => onTabChange('founder')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
              activeTab === 'founder' ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-800 bg-emerald-50 border border-emerald-200 font-semibold'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>{labels.navFounder}</span>
          </button>
          <button
            onClick={() => onOpenPolicy?.()}
            className="px-2.5 py-1.5 rounded-lg shrink-0 text-slate-700 bg-slate-100 flex items-center gap-1 font-bold"
          >
            <Shield className="w-3.5 h-3.5 text-slate-600" />
            <span>Policy</span>
          </button>
          <button
            onClick={() => onTabChange('admin')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 font-bold ${
              activeTab === 'admin'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-purple-100 text-purple-900 border border-purple-300'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-purple-700" />
            <span>Admin Panel</span>
          </button>
        </div>
      </div>
    </header>
  );
};
