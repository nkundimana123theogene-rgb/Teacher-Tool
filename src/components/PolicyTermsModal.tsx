import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, CreditCard, HelpCircle, CheckCircle2, Globe } from 'lucide-react';
import { OWNER_INFO } from '../data/plans';

type LanguageKey = 'rw' | 'en' | 'fr' | 'sw';

interface PolicyTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PolicyTermsModal({ isOpen, onClose }: PolicyTermsModalProps) {
  const [activeSection, setActiveSection] = useState<'terms' | 'privacy' | 'payments' | 'copyright' | 'faq'>('terms');
  const [selectedLang, setSelectedLang] = useState<LanguageKey>('en');

  if (!isOpen) return null;

  const content = {
    rw: {
      modalTitle: "Amabwiriza, Amategeko & FAQ",
      subtitle: "Amabwiriza, Amategeko, Ibibanga & Ibibazo Bikunze Kubazwa (FAQ) - Teachers Quickly Tools",
      tabTerms: "1. Amabwiriza (Terms)",
      tabPrivacy: "2. Ibibanga (Privacy)",
      tabPayments: "3. Kwishyura (Payments)",
      tabCopyright: "4. Uburenganzira (Copyright)",
      tabFaq: "5. FAQ (Ibibazo Bikunze Kubazwa)",
      termsSummaryTitle: "📌 Incamake y'Amabwiriza (Terms Summary)",
      termsSummaryText: "Gukoresha Teachers Quickly Tools Platform biba bishingiye ku kubahiriza amategeko n'amabwiriza agenga gukora lesson plans z'uburezi mu Rwanda na mpuzamahanga.",
      termsTitle: "1. Amabwiriza yo Gukoresha Urubuga (Terms of Service)",
      termsItems: [
        { label: "1.1. Kwiyandikisha n'Imyirondoro", text: "Buri mwarimu abazwa ukuri k'imyirondoro atanga (Izina, Nimero ya terefone, Email, n'Amasomo yigisha). Ntabwo bwemewe guhererekanya konti mu buryo bunyuranyije n'amategeko." },
        { label: "1.2. Inshingano z'Umukiriya", text: "Umwarimu agomba gukoresha platform mu bikorwa by'uburezi gusa. Birahembuwe kwanduza cyangwa gukoresha ibipimo bitari byo mu kwitiranya AI Generator." },
        { label: "1.3. Imikoreshereze ya AI Generator", text: "Platform yacu ikoresha AI mu gufasha mwarimu gutegura Lesson Plans ku buryo bwihuse n'amasegonda macye hashingiwe ku nteganyanyigisho ya REB Competence-Based Curriculum (CBC). Mwarimu asabwa gusuzuma Lesson Plan no kuyigira iye mbere yo kuyikoresha mu ishuri." },
        { label: "1.4. Ingaruka zo Kurenga ku Mabwiriza", text: "Buri mukoresha ugaragayeho imywarire yo gukoresha nabi platform arashobora guhagarikwa konti ye burundu nta burimiro." },
        { label: "1.5. Service Iboneka Ibihe Byose (24/7/365 Availability)", text: "Teachers Quickly Tools Platform ikora kandi iboneka amasaha 24/24 n'iminsi 7/7 mu mwaka wose (24/7/365). Mwarimu arashobora gukora no kubika Lesson Plans igihe cyose abishakiye haba ku manywa, nimugoroba cyangwa n'ijoro." }
      ],
      privacySummaryTitle: "🔒 Politiki y'Ibibanga (Privacy & Protection)",
      privacySummaryText: "Imyirondoro n'amateka ya Lesson plans zawe bibikwa mu buryo bwizewe bw'ikoranabuhanga (Automatically Saved) kandi ntituyisangiza abandi.",
      privacyTitle: "2. Politiki y'Ibibanga no Kurinda Imyirondoro (Privacy Policy)",
      privacyItems: [
        { label: "2.1. Amakuru Tubika", text: "Tubika gusa izina ryawe, email, nimero ya terefone, igihugu, n'amateka ya Lesson Plans wagezeho kugira ngo uzibone igihe cyose ubiyfuje." },
        { label: "2.2. Uburinzi bw'Amakuru (Data Security)", text: "Amakuru yose yawe n'inyandiko za Lesson plans zirabikwa neza kandi mu buryo bwa (Automatically Saved). Ntabwo tugurisha cyangwa ngo tuguze amakuru y'abakiriya b'uburezi." },
        { label: "2.3. Uburenganzira bwa Mwarimu", text: "Ushobora gusiba Lesson plans zawe mu ruhande rwa History igihe cyose ubifyuje." }
      ],
      paymentsSummaryTitle: "💳 Kwishyura n'Ifatabuguzi (Subscription Rules)",
      paymentsSummaryText: "Kwishyura biba binyuze kuri Mobile Money (MoMo). Kwishyura biba ku mugaragaro kandi amakuru yose yawe yo kwishyura arabikwa (Automatically Saved).",
      paymentsTitle: "3. Kwishyura, Subscriptions & Politiki y'Amafaranga",
      paymentsItems: [
        { label: "3.1. Ibiciro n'Amagano y'Ukwezi", text: "Ibiciro bya Lesson plans n'ifatabuguzi byerekanywe mu gice cya Subscription. Igihe Lesson plans z'ukwezi cyangwa izo waguze zarangiye, ubwirwa ko zarangiye ugateguzwa kugura izindi zishya kugira ngo ukomeze igikorwa." },
        { label: "3.2. Nimero Bikirizwaho Kwishyura", text: "Kwishyura biba kuri MTN Mobile Money: 0781339530 (NKUNDIMANA Theogene) cyangwa Airtel Money: 0724038043." },
        { label: "3.3. Gusubizwa Amafaranga (Refund Policy)", text: "Amafaranga yamaze kwishyurwa no kwemezwa ntiyasubizwa (Non-refundable) kuko account ihita ifungurwa cyangwa Lesson plans zikongerwa hejuru burundu." },
        { label: "3.4. (Automatically Saved) System", text: "Ibimenyetso byose byo kwishyura (Payment Proofs) na transaction references byandikwa no kubikwa ki buryo bwa automatike mu buyobozi (Admin) bw'urubuga." }
      ],
      copyrightSummaryTitle: "📚 Uburenganzira bw'Inyandiko n'Uburezi",
      copyrightSummaryText: "Lesson Plans zikoreshwa mu mashuri y'uburezi yaba aya Leta n'abikenga mu Rwanda no mu karere.",
      copyrightTitle: "4. Uburenganzira n'Imikoreshereze mu Uburezi",
      copyrightItems: [
        { label: "4.1. REB CBC Curriculum Compliance", text: "Lesson plans zose ziba zikoze mu buryo bwa Rwanda Basic Education Board (REB) Competence-Based Curriculum hazingiwe ku ntego z'uburezi." },
        { label: "4.2. Uburenganzira bwa Nyir'urubuga", text: `System n'ikoranabuhanga rya Teachers Quickly Tools Platform biyoborwa kandi ni umutungo wa ${OWNER_INFO.name} (Telephone: 0781339530 / 0724038043).` },
        { label: "4.3. Support & Ubufasha", text: "Niba ufite ikibazo cyangwa ukeneye ubufasha, hamagara cyangwa wandikire kuri WhatsApp: 0781339530." }
      ],
      closeBtn: "Sohoka (I Have Read & Accept)"
    },
    en: {
      modalTitle: "Policy, Terms & Conditions",
      subtitle: "Terms of Service, Privacy Policy & Guidelines for Teachers Quickly Tools Platform",
      tabTerms: "1. Terms of Service",
      tabPrivacy: "2. Privacy Policy",
      tabPayments: "3. Payments & Billing",
      tabCopyright: "4. Copyright & Usage",
      termsSummaryTitle: "📌 Terms & Conditions Summary",
      termsSummaryText: "Using Teachers Quickly Tools Platform is subject to full compliance with educational guidelines, terms of service, and local and international curriculum standards.",
      termsTitle: "1. Terms of Service & User Conduct",
      termsItems: [
        { label: "1.1. User Registration & Profile Accuracy", text: "Teachers are responsible for providing truthful profile information (Name, Phone Number, Email, and Teaching Subjects). Sharing user accounts inappropriately is strictly prohibited." },
        { label: "1.2. Responsible Platform Usage", text: "Teachers must use the platform exclusively for educational purposes. Any attempt to exploit, spam, or corrupt the AI generator is strictly forbidden." },
        { label: "1.3. AI Lesson Plan Generation", text: "Our platform leverages AI to assist teachers in generating comprehensive lesson plans aligned with REB Competence-Based Curriculum (CBC) in seconds. Teachers must review and personalize lesson plans before classroom implementation." },
        { label: "1.4. Violation Consequences", text: "Any account engaging in fraudulent activities or abusing system resources will face immediate suspension without prior notice." },
        { label: "1.5. 24/7/365 Continuous Service Availability", text: "Teachers Quickly Tools Platform operates 24 hours a day, 7 days a week, 365 days a year (24/7/365). Teachers can generate, access, and automatically save lesson plans anytime day or night." }
      ],
      privacySummaryTitle: "🔒 Privacy & Data Protection Policy",
      privacySummaryText: "Your profile information and generated lesson plan histories are securely saved (Automatically Saved) and protected. We never sell or share your data.",
      privacyTitle: "2. Privacy Policy & Data Security",
      privacyItems: [
        { label: "2.1. Information We Collect", text: "We collect basic credentials including your name, email, phone number, country, and lesson plan history so you can access your saved records anytime." },
        { label: "2.2. Data Protection & Security", text: "All lesson plans and transaction records are encrypted and stored via (Automatically Saved) system architecture. We strictly refrain from selling user data." },
        { label: "2.3. Teacher Control & History Deletion", text: "Teachers retain full rights to delete individual lesson plans from their History tab at any given time." }
      ],
      paymentsSummaryTitle: "💳 Payment & Subscription Policies",
      paymentsSummaryText: "All payments are processed conveniently via Mobile Money (MoMo). Transactions and approvals are recorded and (Automatically Saved) in our secure system.",
      paymentsTitle: "3. Payments, Subscriptions & Billing",
      paymentsItems: [
        { label: "3.1. Subscriptions & Monthly Plan Quotas", text: "Pricing and plan quotas are detailed in the Subscription tab. Once monthly or purchased lesson plan allocations expire, users are prompted to buy additional plans to continue generating content seamlessly." },
        { label: "3.2. Approved Payment Channels", text: "Payments should be directed to MTN Mobile Money: 0781339530 (NKUNDIMANA Theogene) or Airtel Money: 0724038043." },
        { label: "3.3. Refund Policy", text: "All completed payments are non-refundable once accounts are activated or additional lesson plan quotas are granted." },
        { label: "3.4. Automatically Saved Auditing", text: "Payment proofs and transaction reference IDs are instantly logged and (Automatically Saved) in the administrative portal." }
      ],
      copyrightSummaryTitle: "📚 Educational Copyright & Content Usage",
      copyrightSummaryText: "Lesson plans generated on our platform are designed for public, private, and international educational institutions.",
      copyrightTitle: "4. Intellectual Property & Educational Standards",
      copyrightItems: [
        { label: "4.1. REB CBC Curriculum Standards", text: "All lesson plans conform strictly to Rwanda Basic Education Board (REB) Competence-Based Curriculum frameworks and pedagogical outcomes." },
        { label: "4.2. Ownership & Platform Rights", text: `The Teachers Quickly Tools Platform and its underlying technology are managed and owned by ${OWNER_INFO.name} (Phone: 0781339530 / 0724038043).` },
        { label: "4.3. Customer Support & Assistance", text: "For technical help or account inquiries, contact support directly via WhatsApp or Phone: 0781339530." }
      ],
      closeBtn: "Close (I Accept All Terms)"
    },
    fr: {
      modalTitle: "Politique, Conditions Générales et Règles",
      subtitle: "Conditions d'utilisation, politique de confidentialité de la plateforme Teachers Quickly Tools",
      tabTerms: "1. Conditions (Terms)",
      tabPrivacy: "2. Confidentialité",
      tabPayments: "3. Paiements",
      tabCopyright: "4. Droits d'Auteur",
      termsSummaryTitle: "📌 Résumé des Conditions Générales",
      termsSummaryText: "L'utilisation de la plateforme Teachers Quickly Tools est soumise au respect des règles éducatives et des normes de cours locales et internationales.",
      termsTitle: "1. Conditions Générales d'Utilisation",
      termsItems: [
        { label: "1.1. Inscription et Exactitude du Profil", text: "Chaque enseignant est tenu de fournir des informations exactes (Nom, Téléphone, Email, Matières). Le partage abusif de compte est strictement interdit." },
        { label: "1.2. Utilisation Responsable", text: "L'enseignant doit utiliser la plateforme exclusivement à des fins éducatives. Toute tentative d'envoi de spam ou de manipulation de l'IA est sanctionnée." },
        { label: "1.3. Génération de Fiches de Cours par IA", text: "Notre plateforme utilise l'IA pour générer en quelques secondes des lesson plans complets selon le programme REB (CBC). L'enseignant doit réviser la fiche avant d'enseigner." },
        { label: "1.4. Conséquences des Violations", text: "Tout compte impliqué dans des fraudes ou des abus sera immédiatement suspendu." }
      ],
      privacySummaryTitle: "🔒 Politique de Confidentialité & Protection des Données",
      privacySummaryText: "Vos données et l'historique de vos lesson plans sont sauvegardés en toute sécurité (Sauvegarde Automatique) et ne sont jamais partagés.",
      privacyTitle: "2. Politique de Confidentialité",
      privacyItems: [
        { label: "2.1. Données Collectées", text: "Nous collectons uniquement votre nom, e-mail, numéro de téléphone, pays et l'historique des lesson plans générés." },
        { label: "2.2. Sécurité des Données", text: "Toutes les données sont chiffrées et enregistrées dans un système sécurisé. Nous ne vendons pas les données des enseignants." },
        { label: "2.3. Droit de Suppression", text: "L'enseignant peut supprimer ses fiches de cours depuis l'onglet Historique à tout moment." }
      ],
      paymentsSummaryTitle: "💳 Conditions de Paiement et Abonnements",
      paymentsSummaryText: "Les paiements sont traités via Mobile Money (MoMo). Les transactions sont enregistrées et sauvegardées automatiquement.",
      paymentsTitle: "3. Paiements et Abonnements",
      paymentsItems: [
        { label: "3.1. Quotas et Échéances Mensuelles", text: "Lorsque le quota de lesson plans du mois ou acheté est épuisé, l'utilisateur est invité à acheter de nouvelles fiches pour continuer." },
        { label: "3.2. Numéros de Paiement Officiels", text: "Les paiements doivent être effectués vers MTN Mobile Money: 0781339530 (NKUNDIMANA Theogene) ou Airtel Money: 0724038043." },
        { label: "3.3. Politique de Remboursement", text: "Les paiements confirmés ne sont pas remboursables une fois le compte crédité ou réactivé." },
        { label: "3.4. Sauvegarde Automatique des Preuves", text: "Les preuves de paiement sont instantanément enregistrées dans le panneau d'administration." }
      ],
      copyrightSummaryTitle: "📚 Normes Éducatives et Droits d'Auteur",
      copyrightSummaryText: "Les fiches de cours sont conçues pour être utilisées dans les écoles publiques, privées et internationales.",
      copyrightTitle: "4. Propriété Intellectuelle et Conduite Éducative",
      copyrightItems: [
        { label: "4.1. Conformité au Programme REB CBC", text: "Toutes les fiches de cours sont conformes au programme orienté compétences de REB au Rwanda." },
        { label: "4.2. Droits de Propriété", text: `La plateforme Teachers Quickly Tools est gérée et appartient à ${OWNER_INFO.name} (Tél: 0781339530 / 0724038043).` },
        { label: "4.3. Support Client", text: "Pour toute assistance, contactez le support via WhatsApp ou téléphone au 0781339530." }
      ],
      closeBtn: "Fermer (J'accepte toutes les conditions)"
    },
    sw: {
      modalTitle: "Sheria, Masharti na Siasa ya Faragha",
      subtitle: "Masharti ya Matumizi, Haki Miliki na Hifadhi ya Data katika Teachers Quickly Tools Platform",
      tabTerms: "1. Masharti (Terms)",
      tabPrivacy: "2. Faragha (Privacy)",
      tabPayments: "3. Malipo (Payments)",
      tabCopyright: "4. Haki Miliki (Copyright)",
      termsSummaryTitle: "📌 Muhtasari wa Masharti na Vigezo",
      termsSummaryText: "Matumizi ya Teachers Quickly Tools Platform yanategemea kuzingatia kikamilifu sheria za elimu na masharti ya huduma.",
      termsTitle: "1. Masharti na Vigezo vya Matumizi",
      termsItems: [
        { label: "1.1. Usajili na Usahihi wa Taarifa", text: "Kila mwalimu anawajibika kutoa taarifa sahihi (Jina, Namba ya simu, Barua pepe na Masomo). Ni marufuku kushiriki akaunti kinyume cha sheria." },
        { label: "1.2. Matumizi Sahihi ya Jukwaa", text: "Mwalimu anapaswa kutumia jukwaa kwa madhumuni ya kielimu pekee. Ni marufuku kujaribu kuharibu mfumo wa AI." },
        { label: "1.3. Matumizi ya Mfumo wa AI Lesson Plans", text: "Mfumo wetu unatumia AI kumsaidia mwalimu kuandaa Lesson Plans kwa sekunde chache kulingana na mtaala wa REB Competence-Based Curriculum (CBC). Mwalimu lazima apitie na kuhakiki Lesson Plan kabla ya kufundishia." },
        { label: "1.4. Matokeo ya Kukiuka Sheria", text: "Akaunti yoyote itakayobainika kukiuka sheria itafungwa mara moja bila taarifa." }
      ],
      privacySummaryTitle: "🔒 Siasa ya Faragha na Ulinzi wa Data",
      privacySummaryText: "Taarifa zako na historia ya Lesson plans zimehifadhiwa kwa usalama (Automatically Saved) na hazitatolewa kwa mtu yeyote.",
      privacyTitle: "2. Siasa ya Faragha na Ulinzi wa Taarifa",
      privacyItems: [
        { label: "2.1. Taarifa Tunazohifadhi", text: "Tunahifadhi jina lako, barua pepe, namba ya simu, nchi, na historia ya Lesson plans ulizoandaa ili uzipate wakati wowote." },
        { label: "2.2. Ulinzi wa Data", text: "Taarifa zako zote zimehifadhiwa vyema kupitia mfumo wa (Automatically Saved). Hatuuzi wala kugawana data za walimu." },
        { label: "2.3. Haki ya Mwalimu", text: "Mwalimu ana haki ya kufuta Lesson plan yoyote katika sehemu ya History wakati wowote anapotaka." }
      ],
      paymentsSummaryTitle: "💳 Sheria za Malipo na Usajili wa Kifurushi",
      paymentsSummaryText: "Malipo yote yanafanyika kwa urahisi kupitia Mobile Money (MoMo). Kumbukumbu za malipo zinahifadhiwa mara moja (Automatically Saved).",
      paymentsTitle: "3. Malipo na Vifurushi vya Usajili",
      paymentsItems: [
        { label: "3.1. Idadi ya Lesson Plans na Mwisho wa Mwezi", text: "Wakati idadi ya Lesson plans za mwezi au ulizonunua inapoisha, mfumo utakuarifu kuwa zimeisha na kukuomba ununue zingine ili kuendelea." },
        { label: "3.2. Namba Rasmi za Malipo", text: "Malipo yafanyike kupitia MTN Mobile Money: 0781339530 (NKUNDIMANA Theogene) au Airtel Money: 0724038043." },
        { label: "3.3. Mfumo wa Kurudisha Pesa", text: "Pesa zilizolipwa na kuthibitishwa hazitarudishwa pindi akaunti inapofunguliwa au kuongezewa Lesson plans." },
        { label: "3.4. Mfumo wa Automatically Saved", text: "Ushahidi wote wa malipo unarekodiwa na kuhifadhiwa kiotomatiki kwenye jopo la usimamizi (Admin)." }
      ],
      copyrightSummaryTitle: "📚 Viwango vya Elimu na Haki Miliki",
      copyrightSummaryText: "Lesson plans zilizoandaliwa zimeundwa kutumika katika shule za serikali na za binafsi nchini Rwanda na ukanda wa Afrika Mashariki.",
      copyrightTitle: "4. Haki Miliki na Matumizi ya Kielimu",
      copyrightItems: [
        { label: "4.1. Kuzingatia Mtaala wa REB CBC", text: "Lesson plans zote zinafuata mtaala wa Rwanda Basic Education Board (REB) Competence-Based Curriculum." },
        { label: "4.2. Umiliki wa Mfumo", text: `Jukwaa la Teachers Quickly Tools na teknolojia yake ni mali ya ${OWNER_INFO.name} (Simu: 0781339530 / 0724038043).` },
        { label: "4.3. Huduma kwa Wateja", text: "Kwa msaada zaidi au maswali, wasiliana nasi kupitia WhatsApp au Simu: 0781339530." }
      ],
      closeBtn: "Funga (Nimesoma na Kukubali Masharti)"
    }
  };

  const current = content[selectedLang];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                {current.modalTitle}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300">
                {current.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            title="Funga (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selector Bar */}
        <div className="bg-slate-800 p-2.5 px-4 flex items-center justify-between border-b border-slate-700 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Select Language / Hitamo Ururimi:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedLang('rw')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                selectedLang === 'rw'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <span>🇷🇼</span>
              <span>Kinyarwanda</span>
            </button>

            <button
              onClick={() => setSelectedLang('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                selectedLang === 'en'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>

            <button
              onClick={() => setSelectedLang('fr')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                selectedLang === 'fr'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <span>🇫🇷</span>
              <span>Français</span>
            </button>

            <button
              onClick={() => setSelectedLang('sw')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                selectedLang === 'sw'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <span>🇹🇿</span>
              <span>Kiswahili</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-2 gap-1 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveSection('terms')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeSection === 'terms'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{current.tabTerms}</span>
          </button>

          <button
            onClick={() => setActiveSection('privacy')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeSection === 'privacy'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{current.tabPrivacy}</span>
          </button>

          <button
            onClick={() => setActiveSection('payments')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeSection === 'payments'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{current.tabPayments}</span>
          </button>

          <button
            onClick={() => setActiveSection('copyright')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeSection === 'copyright'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{current.tabCopyright}</span>
          </button>

          <button
            onClick={() => setActiveSection('faq')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeSection === 'faq'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>{current.tabFaq || '5. FAQ'}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-700 text-sm leading-relaxed flex-1">
          {activeSection === 'terms' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs">
                <span className="font-extrabold uppercase tracking-wide block mb-1">
                  {current.termsSummaryTitle}
                </span>
                {current.termsSummaryText}
              </div>

              <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b pb-2">
                {current.termsTitle}
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                {current.termsItems.map((item, idx) => (
                  <p key={idx}>
                    <strong>{item.label}:</strong> {item.text}
                  </p>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-100 border border-slate-300 rounded-2xl text-slate-800 text-xs">
                <span className="font-extrabold uppercase tracking-wide block mb-1">
                  {current.privacySummaryTitle}
                </span>
                {current.privacySummaryText}
              </div>

              <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b pb-2">
                {current.privacyTitle}
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                {current.privacyItems.map((item, idx) => (
                  <p key={idx}>
                    <strong>{item.label}:</strong> {item.text}
                  </p>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'payments' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs">
                <span className="font-extrabold uppercase tracking-wide block mb-1">
                  {current.paymentsSummaryTitle}
                </span>
                {current.paymentsSummaryText}
              </div>

              <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b pb-2">
                {current.paymentsTitle}
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                {current.paymentsItems.map((item, idx) => (
                  <p key={idx}>
                    <strong>{item.label}:</strong> {item.text}
                  </p>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'copyright' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-100 border border-slate-300 rounded-2xl text-slate-800 text-xs">
                <span className="font-extrabold uppercase tracking-wide block mb-1">
                  {current.copyrightSummaryTitle}
                </span>
                {current.copyrightSummaryText}
              </div>

              <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b pb-2">
                {current.copyrightTitle}
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                {current.copyrightItems.map((item, idx) => (
                  <p key={idx}>
                    <strong>{item.label}:</strong> {item.text}
                  </p>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'faq' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950 text-xs">
                <span className="font-extrabold uppercase tracking-wide block mb-1">
                  ❓ Frequently Asked Questions (FAQ)
                </span>
                Common questions about Teacher Tool, subscriptions, features, and generating lesson plans.
              </div>

              <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b pb-2">
                5. Frequently Asked Questions (FAQ)
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <h4 className="font-black text-slate-900">Q1. How does the platform help teachers prepare lesson plans?</h4>
                  <p className="text-slate-700">A: Enter the subject, grade level, unit topic, and lesson objective. The AI engine automatically generates a full CBC REB-compliant lesson plan in seconds.</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <h4 className="font-black text-slate-900">Q2. How do I purchase or renew a subscription?</h4>
                  <p className="text-slate-700">A: Go to the **Subscription** tab in the top navigation, view the MoMo payment options (MTN: 0781339530 / NKUNDIMANA Theogene), submit your payment code, and your quota updates automatically.</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <h4 className="font-black text-slate-900">Q3. Can I save, download, or print my lesson plans?</h4>
                  <p className="text-slate-700">A: Yes! You can download your lesson plans as Word (.docx), PDF, or print them directly. All plans are also saved in your **Saved Plans** history.</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <h4 className="font-black text-slate-900">Q4. Who can I contact if I need support?</h4>
                  <p className="text-slate-700">A: You can reach the Developer **NKUNDIMANA Theogene** on WhatsApp: **0781339530** or use our built-in AI Support Assistant.</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <h4 className="font-black text-slate-900">Q5. What technology stack powers this platform?</h4>
                  <p className="text-slate-700">A: Built using a modern full-stack architecture: <strong>Frontend</strong> (React, TypeScript, Tailwind CSS), <strong>Backend</strong> (Node.js & Express API), <strong>Database</strong> (Firestore / Cloud persistence), and advanced <strong>AI Engines</strong> for educational content generation.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Multilingual Terms (2026 REB CBC)</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors ml-auto"
          >
            {current.closeBtn}
          </button>
        </div>

      </div>
    </div>
  );
}
