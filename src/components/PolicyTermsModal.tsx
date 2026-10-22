import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  Info, 
  PhoneCall, 
  Settings as SettingsIcon, 
  Globe, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Trash2,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export type ModalTabType = 'policy' | 'about' | 'contact' | 'settings' | 'faq';
export type LanguageContextType = 'rw' | 'en' | 'fr' | 'sw';

interface PolicyTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: ModalTabType;
}

export const PolicyTermsModal: React.FC<PolicyTermsModalProps> = ({ 
  isOpen, 
  onClose,
  initialTab = 'policy'
}) => {
  const [activeTab, setActiveTab] = useState<ModalTabType>(initialTab);
  const [lang, setLang] = useState<LanguageContextType>('en');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Auto Settings state
  const [autoSave, setAutoSave] = useState(true);
  const [exportFormat, setExportFormat] = useState('PDF');
  const [showNotification, setShowNotification] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const triggerNotify = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(null), 3000);
  };

  // MULTI-LANGUAGE DICTIONARY CONTENT
  const content = {
    rw: {
      tabs: {
        policy: 'Policy & Data Protection',
        about: 'About Us',
        contact: 'Contact Us',
        settings: 'Settings',
        faq: 'Frequently Asked Questions (FAQ)'
      },
      policy: {
        title: 'QUALITY POLICY & DIGITAL REGULATIONS (2026 REB)',
        intro: 'Nkorera Education Portal complies with Ministry of Education (MINEDUC) and Rwanda Basic Education Board (REB) guidelines for integrating educational technology and artificial intelligence (AI) into teaching.',
        points: [
          'Teacher Data Protection: Teacher data and documents are protected against unauthorized access via HTTPS and Firebase Security Rules.',
          'Intellectual Property Rights: Lesson Plans, Schemes of Work, Tests, and Grades created by teachers belong 100% to the teacher.',
          'Artificial Intelligence Usage: AI-generated pedagogical materials are designed to assist teachers. Teachers are advised to review all content prior to classroom implementation.'
        ]
      },
      about: {
        title: 'ABOUT US & NKORERA PORTAL MISSION',
        subtitle: 'Digital Quality Platform for Educators in Rwanda (REB CBC Portal)',
        desc: 'Nkorera Education Portal is an all-in-one digital teaching platform created by IT Specialist & Teacher Nkundimana Theogene. It aims to empower educators in Rwanda to create CBC (Competence-Based Curriculum) Lesson Plans, Schemes of Work, Teaching Aids, REB Books, and Student Report Cards (Primary & Secondary Level) quickly and efficiently.',
        stats: [
          { label: 'Active Educators', val: '15,000+' },
          { label: 'Lesson Plans Generated', val: '120,000+' },
          { label: 'REB 2026 Curriculum', val: '100%' },
          { label: 'Grades & Report Cards', val: 'Pri & Sec' }
        ],
        founder: 'Founder & Lead Engineer: Nkundimana Theogene (IT Specialist & Educator)'
      },
      contact: {
        title: 'CONTACT US & SUPPORT DESK (24/7 SUPPORT)',
        phone: '+250 781 339 530 / 0781339530',
        email: 'nkundimana123theogene@gmail.com',
        location: 'Kigali / Bugesera, Rwanda',
        hours: '24/7 Service Desk',
        whatsappBtn: 'Message Us on WhatsApp'
      },
      settings: {
        title: 'SYSTEM SETTINGS & PREFERENCES',
        langSelect: 'Portal Display Language:',
        autoSave: 'Auto-Save Draft Plans:',
        exportFormat: 'Default Export Format:',
        clearCache: 'Clear Local Cache'
      },
      faq: [
        {
          q: 'How does Nkorera Education Portal work?',
          a: 'Nkorera helps you generate quality CBC Lesson Plans and REB-compliant resources in seconds, ready for instant PDF or Word download.'
        },
        {
          q: 'Can I generate Student Report Cards?',
          a: 'Yes! Using the Special Coach Report Cards tool (Primary & Secondary), you can create grades and behavioral report cards for all students rapidly.'
        },
        {
          q: 'How can I get quick customer support?',
          a: 'You can call or message IT Specialist Nkundimana Theogene directly on WhatsApp at 0781339530.'
        },
        {
          q: 'Is my teacher data secure?',
          a: 'Yes! All your data is securely stored in cloud servers protected by strict Firebase Security Rules.'
        }
      ]
    },
    en: {
      tabs: {
        policy: 'Privacy & Policy',
        about: 'About Us',
        contact: 'Contact Us',
        settings: 'Settings',
        faq: 'Teacher FAQ'
      },
      policy: {
        title: 'REB ICT POLICY & EDUCATOR DATA PRIVACY PROTECTION (2026)',
        intro: 'Nkorera Education Portal complies with directives from MINEDUC and the Rwanda Basic Education Board (REB) regarding educational technology integration.',
        points: [
          'Data Security: All teacher records and evaluations are encrypted and stored securely using enterprise Firebase security protocols.',
          'Intellectual Property: Everything you create (Lesson Plans, Worksheets, Exam Papers) remains 100% your property.',
          'AI Verification: AI-generated pedagogical content must be reviewed and contextualized by the teacher prior to classroom delivery.'
        ]
      },
      about: {
        title: 'ABOUT NKORERA EDUCATION PORTAL',
        subtitle: 'The All-in-One Educator Digital Workspace for Rwandan Schools',
        desc: 'Nkorera Education Portal is a digital education ecosystem developed by IT Specialist & Teacher Nkundimana Theogene. Built specifically for Rwandan educators, it streamlines CBC lesson planning, assessment generation, REB textbook access, teacher recordkeeping, and student report card creation using cutting-edge AI.',
        stats: [
          { label: 'Active Teachers', val: '15,000+' },
          { label: 'Lesson Plans Generated', val: '120,000+' },
          { label: 'REB Textbooks 2026', val: '100%' },
          { label: 'Report Cards Engine', val: 'Pri & Sec' }
        ],
        founder: 'Founder & Lead Engineer: Nkundimana Theogene (IT Specialist & Educator)'
      },
      contact: {
        title: 'CONTACT US & DIRECT SUPPORT DESK (24/7)',
        phone: '+250 781 339 530 / 0781339530',
        email: 'nkundimana123theogene@gmail.com',
        location: 'Kigali / Bugesera, Rwanda',
        hours: '24/7 Educator Support Desk',
        whatsappBtn: 'Chat on WhatsApp Direct'
      },
      settings: {
        title: 'SYSTEM SETTINGS & PREFERENCES',
        langSelect: 'Portal Language Context:',
        autoSave: 'Auto-Save Lesson Plan Drafts:',
        exportFormat: 'Default Document Export Format:',
        clearCache: 'Clear Local Browser Cache'
      },
      faq: [
        {
          q: 'How does Nkorera Education Portal work?',
          a: 'It allows teachers in Rwanda to generate competency-based lesson plans, exams, and teaching aids in seconds aligned with REB standards.'
        },
        {
          q: 'Can I generate Student Report Cards for Primary & Secondary?',
          a: 'Yes! Using our Special Coach Report Cards engine, you can generate complete student marksheets and term report cards.'
        },
        {
          q: 'How do I get direct technical support?',
          a: 'You can directly contact founder & IT Specialist Nkundimana Theogene via WhatsApp at +250 781 339 530.'
        },
        {
          q: 'Is my teacher account and data safe?',
          a: 'Yes! All user data is encrypted and backed up securely in Firebase Firestore.'
        }
      ]
    },
    fr: {
      tabs: {
        policy: 'Confidentialité & Politique',
        about: 'À Propos de Nous',
        contact: 'Contactez-Nous',
        settings: 'Paramètres',
        faq: 'Foire Aux Questions'
      },
      policy: {
        title: 'POLITIQUE DE CONFIDENTIALITÉ ET SÉCURITÉ DES DONNÉES (2026 REB)',
        intro: 'Nkorera Education Portal se conforme aux directives du Ministère de l\'Éducation (MINEDUC) et du REB concernant l\'intégration des technologies éducatives.',
        points: [
          'Sécurité des Données: Toutes vos données et fiches de cours sont chiffrées et protégées.',
          'Propriété Intellectuelle: Vous êtes propriétaire à 100% de toutes les fiches et épreuves générées.',
          'Usage de l\'IA: L\'enseignant doit vérifier la conformité du contenu avant la leçon en classe.'
        ]
      },
      about: {
        title: 'À PROPOS DE NKORERA EDUCATION PORTAL',
        subtitle: 'L\'écosystème numérique pour les enseignants du Rwanda',
        desc: 'Nkorera Education Portal est un écosystème éducatif numérique développé par l\'enseignant et spécialiste informatique Nkundimana Theogene. Il permet aux enseignants du Rwanda de concevoir des fiches de cours CBC, des épreuves, d\'accéder aux manuels REB et de gérer les bulletins scolaires.',
        stats: [
          { label: 'Enseignants Actifs', val: '15,000+' },
          { label: 'Fiches Générées', val: '120,000+' },
          { label: 'Manuels REB 2026', val: '100%' },
          { label: 'Bulletins Scolaires', val: 'Pri & Sec' }
        ],
        founder: 'Fondateur & Ingénieur: Nkundimana Theogene (Spécialiste IT)'
      },
      contact: {
        title: 'CONTACTEZ-NOUS & ASSISTANCE 24/7',
        phone: '+250 781 339 530 / 0781339530',
        email: 'nkundimana123theogene@gmail.com',
        location: 'Kigali / Bugesera, Rwanda',
        hours: 'Service d\'assistance 24h/24 et 7j/7',
        whatsappBtn: 'Discuter sur WhatsApp'
      },
      settings: {
        title: 'PARAMÈTRES ET CONFIGURATION DU SYSTÈME',
        langSelect: 'Langue de la Plateforme:',
        autoSave: 'Sauvegarde automatique des brouillons:',
        exportFormat: 'Format d\'exportation par défaut:',
        clearCache: 'Vider le cache local'
      },
      faq: [
        {
          q: 'Comment fonctionne Nkorera Education Portal?',
          a: 'Il permet aux enseignants de générer instantanément des fiches de cours CBC conformes aux normes du REB.'
        },
        {
          q: 'Puis-je générer des bulletins scolaires (Report Cards)?',
          a: 'Oui! Notre outil Special Coach Report Cards prend en charge le niveau primaire et secondaire.'
        },
        {
          q: 'Comment contacter le support technique?',
          a: 'Vous pouvez contacter directement Nkundimana Theogene via WhatsApp au +250 781 339 530.'
        },
        {
          q: 'Mes données sont-elles sécurisées?',
          a: 'Absolument. Vos informations sont cryptées et sauvegardées en toute sécurité.'
        }
      ]
    },
    sw: {
      tabs: {
        policy: 'Sera ya Faragha',
        about: 'Kuhusu Sisi',
        contact: 'Wasiliana Nasi',
        settings: 'Mipangilio',
        faq: 'Maswali ya Mara kwa Mara'
      },
      policy: {
        title: 'SERA YA FARAGHA NA ULINZI WA DATA YA MWALIMU (2026 REB)',
        intro: 'Nkorera Education Portal inafuata miongozo ya Wizara ya Elimu (MINEDUC) na REB kuhusu matumizi ya teknolojia mashuleni.',
        points: [
          'Ulinzi wa Data: Data zote za mwalimu na wanafunzi zinalindwa kwa njia salama ya kidijitali.',
          'Haki za Mwandishi: Kila maandalio ya somo au mtihani unaotengeneza ni wako 100%.',
          'Uhakiki wa AI: Mwalimu anatakiwa kuhakiki maudhui kabla ya kufundisha darasani.'
        ]
      },
      about: {
        title: 'KUHUSU NKORERA EDUCATION PORTAL',
        subtitle: 'Mfumo Kamili wa Kidijitali wa Walimu Nchini Rwanda',
        desc: 'Nkorera Education Portal ni mfumo wa kidijitali wa elimu uliotengenezwa na Mtaalamu wa IT na Mwalimu Nkundimana Theogene. Unalenga kuwasaidia walimu nchini Rwanda kuandaa masomo ya CBC, mitihani, vitabu vya REB, na ripoti za matokeo ya wanafunzi.',
        stats: [
          { label: 'Walimu Wanaotumia', val: '15,000+' },
          { label: 'Masomo Yaliyotengenezwa', val: '120,000+' },
          { label: 'Vitabu vya REB 2026', val: '100%' },
          { label: 'Ripoti za Matokeo', val: 'Pri & Sec' }
        ],
        founder: 'Mwanzilishi: Nkundimana Theogene (Mtaalamu wa IT na Mwalimu)'
      },
      contact: {
        title: 'WASILIANA NASI & MTIHANI WA HUDUMA 24/7',
        phone: '+250 781 339 530 / 0781339530',
        email: 'nkundimana123theogene@gmail.com',
        location: 'Kigali / Bugesera, Rwanda',
        hours: 'Huduma ya Masaa 24/7 kwa Walimu',
        whatsappBtn: 'Anza Chati kwenye WhatsApp'
      },
      settings: {
        title: 'MIPANGILIO YA MFUMO',
        langSelect: 'Chagua Lugha ya Mfumo:',
        autoSave: 'Hifadhi Kiotomatiki (Auto-Save):',
        exportFormat: 'Aina ya Faili ya Kupakua:',
        clearCache: 'Futa Kumbukumbu za Kidijitali (Cache)'
      },
      faq: [
        {
          q: 'Nkorera Education Portal inafanya kazi vipi?',
          a: 'Inamwezesha mwalimu kuandaa somo la CBC na mitihani kwa sekunde chache na kupakua kwa PDF au Word.'
        },
        {
          q: 'Je, ninaweza kutengeneza Ripoti za Matokeo (Report Cards)?',
          a: 'Ndiyo! Mfumo wa Special Coach Report Cards unasaidia shule za Primary na Secondary.'
        },
        {
          q: 'Je, ninapataje msaada haraka?',
          a: 'Piga simu au tuma ujumbe wa WhatsApp kwa Nkundimana Theogene: +250 781 339 530.'
        },
        {
          q: 'Je, data zangu ziko salama?',
          a: 'Ndiyo! Taarifa zote zimehifadhiwa kwa usalama mkubwa katika mfumo wa cloud.'
        }
      ]
    }
  };

  const curr = content[lang];

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[70] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-white overflow-hidden relative">
        
        {/* NOTIFICATION TOAST */}
        {showNotification && (
          <div className="absolute top-4 right-16 z-50 bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl font-black text-xs shadow-xl animate-bounce flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{showNotification}</span>
          </div>
        )}

        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-950/90 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Nkorera Info, Policy & Settings Hub
                <span className="bg-emerald-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full">2026 REB</span>
              </h2>
              <p className="text-xs text-slate-400">Policies, About Us, Contact, System Settings & FAQs in 4 Languages.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* LANGUAGE CONTEXT SELECTOR */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 p-1 rounded-2xl shadow-inner">
              <Globe className="w-3.5 h-3.5 text-emerald-400 ml-1 shrink-0" />
              {(['rw', 'en', 'fr', 'sw'] as LanguageContextType[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-1 rounded-xl font-black text-[10px] uppercase transition-all cursor-pointer ${
                    lang === l 
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {l === 'rw' ? '🇷🇼 Kiny' : l === 'en' ? '🇬🇧 Eng' : l === 'fr' ? '🇫🇷 Fra' : '🇹🇿 Swa'}
                </button>
              ))}
            </div>

            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/60 p-2 gap-1.5 text-xs font-extrabold custom-scrollbar">
          <button
            onClick={() => setActiveTab('policy')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'policy' ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{curr.tabs.policy}</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'about' ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>{curr.tabs.about}</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'contact' ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>{curr.tabs.contact}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'settings' ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>{curr.tabs.settings}</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'faq' ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{curr.tabs.faq}</span>
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs leading-relaxed text-slate-300 custom-scrollbar">
          
          {/* TAB 1: PRIVACY & POLICY */}
          {activeTab === 'policy' && (
            <div className="space-y-4 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-sm sm:text-base font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4" /> {curr.policy.title}
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm">
                {curr.policy.intro}
              </p>
              <ul className="space-y-3 pt-2">
                {curr.policy.points.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TAB 2: ABOUT US */}
          {activeTab === 'about' && (
            <div className="space-y-5">
              <div className="bg-slate-950/80 p-5 rounded-2xl border border-emerald-500/30 space-y-3">
                <h3 className="text-base font-black text-white">{curr.about.title}</h3>
                <p className="text-emerald-400 text-xs font-bold">{curr.about.subtitle}</p>
                <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">{curr.about.desc}</p>
              </div>

              {/* STATS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {curr.about.stats.map((st, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
                    <p className="text-lg font-black text-emerald-400">{st.val}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{st.label}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{curr.about.founder}</span>
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT US */}
          {activeTab === 'contact' && (
            <div className="space-y-5">
              <div className="bg-slate-950/80 p-5 rounded-2xl border border-emerald-500/40 space-y-4">
                <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider">
                  {curr.contact.title}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <a
                    href="https://wa.me/250781339530"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-slate-900 border border-emerald-500/30 hover:border-emerald-400 rounded-2xl flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">{curr.contact.whatsappBtn}</p>
                        <p className="text-[11px] text-emerald-400 font-mono font-bold">{curr.contact.phone}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-emerald-400" />
                  </a>

                  <a
                    href="mailto:nkundimana123theogene@gmail.com"
                    className="p-4 bg-slate-900 border border-blue-500/30 hover:border-blue-400 rounded-2xl flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-black text-white">Email Official Support</p>
                        <p className="text-[10px] text-blue-400 font-mono font-bold truncate">{curr.contact.email}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-blue-400 shrink-0" />
                  </a>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <p><strong>IT Specialist & Founder:</strong> Nkundimana Theogene</p>
                  <p><strong>Location:</strong> {curr.contact.location}</p>
                  <p><strong>Support Desk:</strong> {curr.contact.hours}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4" /> {curr.settings.title}
                </h3>

                {/* LANGUAGE SELECTION */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-slate-900 rounded-2xl border border-slate-800">
                  <div>
                    <p className="font-extrabold text-white text-xs">{curr.settings.langSelect}</p>
                    <p className="text-[10px] text-slate-400">Context adaptation across the entire portal</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[
                      { code: 'rw', label: 'Kinyarwanda' },
                      { code: 'en', label: 'English' },
                      { code: 'fr', label: 'Français' },
                      { code: 'sw', label: 'Kiswahili' }
                    ].map((item) => (
                      <button
                        key={item.code}
                        onClick={() => {
                          setLang(item.code as LanguageContextType);
                          triggerNotify(`Language changed to ${item.label}!`);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                          lang === item.code 
                            ? 'bg-emerald-500 text-slate-950 shadow-md font-bold' 
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AUTO-SAVE TOGGLE */}
                <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-2xl border border-slate-800">
                  <div>
                    <p className="font-extrabold text-white text-xs">{curr.settings.autoSave}</p>
                    <p className="text-[10px] text-slate-400">Automatically save draft plans to local cache</p>
                  </div>
                  <button
                    onClick={() => {
                      setAutoSave(!autoSave);
                      triggerNotify(`Auto-save ${!autoSave ? 'Enabled' : 'Disabled'}`);
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${autoSave ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${autoSave ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>

                {/* EXPORT FORMAT SELECTOR */}
                <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-2xl border border-slate-800">
                  <div>
                    <p className="font-extrabold text-white text-xs">{curr.settings.exportFormat}</p>
                    <p className="text-[10px] text-slate-400">Primary format when downloading Lesson Plans</p>
                  </div>
                  <select
                    value={exportFormat}
                    onChange={(e) => {
                      setExportFormat(e.target.value);
                      triggerNotify(`Default export set to ${e.target.value}`);
                    }}
                    className="bg-slate-950 text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="PDF">PDF Document (.pdf)</option>
                    <option value="WORD">Microsoft Word (.docx)</option>
                    <option value="PRINT">Direct Print</option>
                  </select>
                </div>

                {/* CLEAR CACHE BUTTON */}
                <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-white text-xs">{curr.settings.clearCache}</p>
                    <p className="text-[10px] text-slate-400">Reset local cached offline files</p>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      triggerNotify('Local cache cleared successfully!');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Cache</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-3">
              {curr.faq.map((item, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-4 text-left font-extrabold text-white flex items-center justify-between gap-3 hover:bg-slate-900 cursor-pointer transition-colors"
                  >
                    <span className="text-xs sm:text-sm">{idx + 1}. {item.q}</span>
                    {openFaq === idx ? <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>
                  {openFaq === idx && (
                    <div className="p-4 pt-1 text-slate-300 bg-slate-900/60 border-t border-slate-800/80 text-xs sm:text-sm leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400">
          <span>Nkorera Education Portal 2026 • Created by IT Specialist Nkundimana Theogene</span>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

      </div>
    </div>
  );
};
