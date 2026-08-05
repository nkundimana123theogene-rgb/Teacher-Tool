import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Award, 
  Building, 
  User, 
  Calendar, 
  Globe, 
  Phone, 
  ExternalLink, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  CornerUpLeft, 
  Sparkles,
  QrCode
} from 'lucide-react';
import { FemaleGraduateSvg, MaleGraduateSvg, detectGenderFromName } from './CertificateCreator';
import { LanguageOption } from '../types';

interface CertificateVerificationProps {
  certificateId: string;
  selectedLanguage: LanguageOption;
  onBackToDashboard: () => void;
}

const VERIFY_I18N = {
  English: {
    portalTitle: "Official Certificate Verification Portal",
    verifiedBadge: "✓ OFFICIALLY VERIFIED BY NKUNDIMANA THEOGENE",
    verifiedStatus: "Verified by Nkundimana Theogene",
    verifiedSub: "This certificate is officially registered, authentic, and has been approved in the database by Nkundimana Theogene, Founder & Developer of Nkorera Education AI.",
    recipientName: "Recipient Full Name",
    role: "Class Grade / Role",
    school: "School / Institution",
    title: "Certificate Title",
    date: "Date of Issue",
    number: "Certificate Number",
    citation: "Citation / Achievement",
    backBtn: "Back to Dashboard",
    printBtn: "Print Verification Report",
    loading: "Verifying certificate authenticity against secure database...",
    notFound: "Certificate was not found or is not registered in our database.",
    errorOccurred: "An error occurred while connecting to the verification server. Please try again.",
    tryAgain: "Try Again",
    verifiedAt: "Verified At",
    officialSupport: "Official Support & Inquiries",
    phoneText: "0781339530 / 0724038043 (Nkundimana Theogene)",
    categoryLabel: "Category"
  },
  Kinyarwanda: {
    portalTitle: "Sisteme yo Kugenzura Umwimerere wa Certificate",
    verifiedBadge: "✓ ICYEMEZO CYEMEWE NA NKUNDIMANA THEOGENE",
    verifiedStatus: "Byemejwe na Nkundimana Theogene",
    verifiedSub: "Iki cyemezo cyemejwe mu buryo bw'amategeko kandi cyanditswe mu bubiko na Nkundimana Theogene, Umuremyi n'Umuhanga w'ikoranabuhanga rya Nkorera Education AI.",
    recipientName: "Izina ry'Uhabwa Icyemezo",
    role: "Urwego / Umwanya / Ishuri",
    school: "Ikigo cy'Ishuri",
    title: "Umutwe w'Icyemezo",
    date: "Itariki cyatangiweho",
    number: "Nimero ya Certificate",
    citation: "Inyandiko y'Icyemezo",
    backBtn: "Subira kuri Dashboard",
    printBtn: "Capa Iki Cyemezo",
    loading: "Kugenzura umwimerere w'icyemezo mu bubiko...",
    notFound: "Nta Certificate yabonetse ifite iyi ID mu bubiko bwa Nkundimana Theogene.",
    errorOccurred: "Habonetse ikibazo mu guhuza na server. Ongera ugerageze.",
    tryAgain: "Ongera ugerageze",
    verifiedAt: "Byagenzuwe Kuri",
    officialSupport: "Ubufasha n'Ibibazo",
    phoneText: "0781339530 / 0724038043 (Nkundimana Theogene)",
    categoryLabel: "Ubwoko"
  },
  French: {
    portalTitle: "Portail Officiel de Vérification de Certificats",
    verifiedBadge: "✓ OFFICIELLEMENT VÉRIFIÉ PAR NKUNDIMANA THEOGENE",
    verifiedStatus: "Vérifié par Nkundimana Theogene",
    verifiedSub: "Ce certificat est officiellement enregistré, authentique et a été approuvé dans la base de données par Nkundimana Theogene, Fondateur et Développeur de Nkorera Education AI.",
    recipientName: "Nom Complet du Récipiendaire",
    role: "Rôle / Classe / Titre",
    school: "École / Établissement",
    title: "Titre du Certificat",
    date: "Date de Délivrance",
    number: "Numéro de Certificat",
    citation: "Citation / Félicitations",
    backBtn: "Retour au Tableau de Bord",
    printBtn: "Imprimer le Rapport",
    loading: "Vérification de l'authenticité du certificat en cours...",
    notFound: "Le certificat n'a pas été trouvé ou n'est pas enregistré dans notre base de données.",
    errorOccurred: "Une erreur est survenue lors de la connexion au serveur. Veuillez réessayer.",
    tryAgain: "Réessayer",
    verifiedAt: "Vérifié le",
    officialSupport: "Assistance Officielle",
    phoneText: "0781339530 / 0724038043 (Nkundimana Theogene)",
    categoryLabel: "Catégorie"
  },
  Swahili: {
    portalTitle: "Mfumo Rasmi wa Kuhakiki Vyeti",
    verifiedBadge: "✓ CHETI KIMEHAKIKISHWA RASMI NA NKUNDIMANA THEOGENE",
    verifiedStatus: "Kimehakikiishwa na Nkundimana Theogene",
    verifiedSub: "Cheti hiki kimesajiliwa rasmi, ni cha kweli na kimeidhinishwa katika hifadhidata na Nkundimana Theogene, Mwanzilishi na Msanidi wa Nkorera Education AI.",
    recipientName: "Jina Kamili la Mpokeaji",
    role: "Nafasi / Darasa",
    school: "Shule / Taasisi",
    title: "Kichwa cha Cheti",
    date: "Tarehe ya Kutolewa",
    number: "Nambari ya Cheti",
    citation: "Maelezo / Shukrani",
    backBtn: "Rudi kwenye Dashboard",
    printBtn: "Chapa Ripoti ya Uhakiki",
    loading: "Kuthibitisha ukweli wa cheti dhidi ya hifadhidata...",
    notFound: "Cheti hakikupatikana au hakijasajiliwa katika hifadhidata yetu.",
    errorOccurred: "Hitilafu imetokea wakati wa kuunganisha kwenye seva. Tafadhali jaribu tena.",
    tryAgain: "Jaribu Tena",
    verifiedAt: "Kimehakikiwa Tarehe",
    officialSupport: "Msaada Rasmi",
    phoneText: "0781339530 / 0724038043 (Nkundimana Theogene)",
    categoryLabel: "Aina"
  }
};

export const CertificateVerification: React.FC<CertificateVerificationProps> = ({
  certificateId,
  selectedLanguage,
  onBackToDashboard
}) => {
  const [lang, setLang] = useState<LanguageOption>(selectedLanguage || 'English');
  const [isVerifying, setIsVerifying] = useState(true);
  const [certData, setCertData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = VERIFY_I18N[lang] || VERIFY_I18N.English;

  const fetchCertificate = async () => {
    setIsVerifying(true);
    setErrorMsg(null);
    setCertData(null);

    const cleanId = certificateId.trim().toUpperCase();
    try {
      const res = await fetch(`/api/certificates/verify/${encodeURIComponent(cleanId)}`);
      if (res.ok) {
        const data = await res.json();
        setCertData(data.certificate || data);
      } else {
        // Fallback to check local storage
        const stored = localStorage.getItem('nkorera_saved_certificates');
        if (stored) {
          const locals = JSON.parse(stored);
          const localMatch = locals.find(
            (c: any) => 
              (c.certificateNumber && c.certificateNumber.toUpperCase() === cleanId) || 
              (c.id && c.id.toUpperCase() === cleanId)
          );
          if (localMatch) {
            setCertData(localMatch);
            setIsVerifying(false);
            return;
          }
        }

        setErrorMsg(t.notFound);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setErrorMsg(t.errorOccurred);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (certificateId) {
      fetchCertificate();
    }
  }, [certificateId, lang]);

  const handlePrint = () => {
    window.print();
  };

  const getCleanCategory = (cat: string) => {
    if (!cat) return "";
    return cat.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 select-none print:bg-white print:p-0">
      {/* Top Floating Language Selector */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs transition-all"
          id="back-to-dashboard-verification"
        >
          <CornerUpLeft className="w-3.5 h-3.5" />
          <span>{t.backBtn}</span>
        </button>

        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          {(['English', 'Kinyarwanda', 'French', 'Swahili'] as LanguageOption[]).map((langOpt) => (
            <button
              key={langOpt}
              onClick={() => setLang(langOpt)}
              className={`text-[10px] font-black px-2 py-1 rounded-lg transition-all ${
                lang === langOpt
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {langOpt}
            </button>
          ))}
        </div>
      </div>

      {/* Main content container */}
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative print:border-none print:shadow-none print:bg-white">
        {/* Verification Ribbon Border */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-lime-400 print:hidden" />

        <div className="p-6 sm:p-8 md:p-10 space-y-6">
          {/* Loading state */}
          {isVerifying && (
            <div className="py-16 text-center space-y-4">
              <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600 animate-pulse">
                {t.loading}
              </p>
            </div>
          )}

          {/* Error / Not Found state */}
          {!isVerifying && errorMsg && (
            <div className="py-12 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto shadow-md">
                <AlertCircle className="w-8 h-8 text-rose-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-black text-slate-900">
                  Verification Failed
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  {errorMsg}
                </p>
              </div>
              <div className="flex justify-center gap-3 print:hidden">
                <button
                  onClick={fetchCertificate}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t.tryAgain}</span>
                </button>
                <button
                  onClick={onBackToDashboard}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  {t.backBtn}
                </button>
              </div>
            </div>
          )}

          {/* Verification Successful State */}
          {!isVerifying && certData && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Shield & Verification status */}
              <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-slate-100">
                <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-white shadow-xl flex items-center justify-center text-emerald-600 relative">
                  <ShieldCheck className="w-12 h-12 stroke-[2]" />
                  <span className="absolute -bottom-1 px-2.5 py-0.5 bg-emerald-600 text-white text-[8px] font-black rounded-full tracking-wider shadow-xs">
                    ACTIVE
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-sm font-black text-emerald-700 tracking-wider bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 inline-block">
                    {t.verifiedBadge}
                  </h2>
                  <p className="text-xs font-medium text-slate-500 max-w-lg leading-relaxed pt-2">
                    {t.verifiedSub}
                  </p>
                </div>
              </div>

              {/* Graduate graphic preview */}
              <div className="flex justify-center -mt-2">
                {(() => {
                  const selectedGender = certData.gender || 'auto';
                  const activeGender = selectedGender === 'auto'
                    ? detectGenderFromName(certData.recipientName)
                    : selectedGender;
                  
                  return activeGender === 'female'
                    ? <FemaleGraduateSvg className="w-24 h-24 drop-shadow-md" />
                    : <MaleGraduateSvg className="w-24 h-24 drop-shadow-md" />;
                })()}
              </div>

              {/* Certificate official information table */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-5 print:bg-white print:border-slate-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                  {/* Recipient */}
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                      {t.recipientName}
                    </span>
                    <span className="text-sm font-black text-slate-900 block">
                      {certData.recipientName}
                    </span>
                  </div>

                  {/* Role */}
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                      {t.role}
                    </span>
                    <span className="text-sm font-bold text-slate-800 block">
                      {certData.recipientRole || "Learner / Teacher"}
                    </span>
                  </div>

                  {/* School */}
                  <div className="col-span-1 sm:col-span-2 space-y-1 border-t border-slate-100 pt-3">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                      {t.school}
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 block flex items-center gap-2">
                      {certData.schoolLogo ? (
                        <img
                          src={certData.schoolLogo}
                          alt={certData.schoolName}
                          className="w-6 h-6 rounded-full object-cover border border-amber-300"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Building className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span>{certData.schoolName}</span>
                    </span>
                  </div>

                  {/* Course Completed */}
                  {certData.courseName && (
                    <div className="col-span-1 sm:col-span-2 space-y-1 border-t border-slate-100 pt-3">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                        {lang === 'Kinyarwanda' ? "Izina ry'amahugurwa / Gahunda yarangije" : "Completed Course / Training Program"}
                      </span>
                      <span className="text-sm font-black text-emerald-900 block flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="bg-gradient-to-r from-lime-50 to-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold">
                          {certData.courseName}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Certificate Title */}
                  <div className="col-span-1 sm:col-span-2 space-y-1 border-t border-slate-100 pt-3">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                      {t.title}
                    </span>
                    <span className="text-sm font-black text-emerald-800 block uppercase flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{certData.certificateTitle}</span>
                    </span>
                  </div>

                  {/* Issue Date */}
                  <div className="space-y-1 border-t border-slate-100 pt-3">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                      {t.date}
                    </span>
                    <span className="text-sm font-bold text-slate-800 block flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{certData.issueDate}</span>
                    </span>
                  </div>

                  {/* Serial Code */}
                  <div className="space-y-1 border-t border-slate-100 pt-3">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                      {t.number}
                    </span>
                    <span className="text-sm font-mono font-black text-slate-950 block">
                      {certData.certificateNumber || certData.id}
                    </span>
                  </div>

                  {/* Category */}
                  {certData.category && (
                    <div className="space-y-1 border-t border-slate-100 pt-3 col-span-1 sm:col-span-2">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                        {t.categoryLabel}
                      </span>
                      <span className="text-xs font-bold text-slate-600 bg-slate-200/60 px-2 py-1 rounded-md inline-block">
                        {getCleanCategory(certData.category)}
                      </span>
                    </div>
                  )}

                  {/* Citation text */}
                  {certData.citationText && (
                    <div className="col-span-1 sm:col-span-2 space-y-1.5 border-t border-slate-100 pt-3">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                        {t.citation}
                      </span>
                      <blockquote className="text-xs text-slate-700 italic border-l-2 border-emerald-500 pl-3 leading-relaxed font-serif bg-emerald-50/20 p-2.5 rounded-r-xl">
                        "{certData.citationText}"
                      </blockquote>
                    </div>
                  )}
                </div>
              </div>

              {/* Digital seal & support section */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-slate-400 font-extrabold block text-[9px] uppercase tracking-wider">
                    {t.officialSupport}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-800 font-black justify-center sm:justify-start">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{t.phoneText}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{t.printBtn}</span>
                  </button>
                  <button
                    onClick={onBackToDashboard}
                    className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all"
                  >
                    {t.backBtn}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security footer disclaimer */}
      <div className="mt-6 text-center max-w-sm text-[10px] text-slate-400 font-medium leading-relaxed print:hidden">
        This is a secured, cryptographic proof of educational achievement issued by Nkorera Education. Any tampering of this report renders the verification void.
      </div>
    </div>
  );
};
