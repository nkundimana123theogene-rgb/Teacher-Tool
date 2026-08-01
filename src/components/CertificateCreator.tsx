import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Award,
  Sparkles,
  Printer,
  Download,
  Plus,
  Trash2,
  Check,
  Search,
  Save,
  Globe,
  Share2,
  Calendar,
  Building,
  UserCheck,
  FileText,
  Bookmark,
  CheckCircle2,
  ShieldCheck,
  Medal,
  RefreshCw,
  Eye,
  X,
  QrCode,
  AlertCircle,
  ExternalLink,
  Copy,
  User,
  Upload,
  Lock,
  Unlock,
  Key
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { CertificateData, CertificateRequest, UserProfile, LanguageOption } from '../types';

interface CertificateCreatorProps {
  user: UserProfile | null;
  selectedLanguage: LanguageOption;
  onOpenSignIn?: () => void;
  onBackToDashboard?: () => void;
  initialVerifyCert?: string | null;
}

const PRESET_CITATIONS: Record<string, Record<LanguageOption, string>> = {
  student_academic: {
    Kinyarwanda: "Icyemezo cy'Icyubahiro gihabwa {NAME} wagaragaje umurava, ikinyabupfura no gutsinda neza cyane mu masomo kuri {SCHOOL}. Yahawe iki cyemezo nk'ikimenyetso cy'indashyikirwa no gushimira umuhate we mu kwiga.",
    English: "This Certificate of Academic Excellence is proudly presented to {NAME} in recognition of outstanding scholastic achievement, exemplary dedication, and superior performance at {SCHOOL}.",
    French: "Ce Certificat d'Excellence Académique est décerné avec fierté à {NAME} en reconnaissance de ses résultats scolaires exceptionnels et de son dévouement remarquable à {SCHOOL}.",
    Swahili: "Cheti hiki cha Umahiri wa Masomo kinatunukiwa kwa fahari kwa {NAME} kama kutambua matokeo bora ya taaluma na bidii ya mfano katika {SCHOOL}."
  },
  student_discipline: {
    Kinyarwanda: "Icyemezo cy'Imyitwarire Myiza n'Ubuyobozi gihabwa {NAME} ku bwa bwitange, ikinyabupfura n'urugero rwiza rwo kubaha bagenzi be n'abarimu muri {SCHOOL}.",
    English: "This Certificate of Merit & Good Discipline is awarded to {NAME} for displaying exceptional character, leadership, respect, and positive influence at {SCHOOL}.",
    French: "Ce Certificat de Mérite et Bonne Conduite est attribué à {NAME} pour son comportement exemplaire, son leadership et son respect des valeurs à {SCHOOL}.",
    Swahili: "Cheti hiki cha Nidhamu na Uongozi Bora kinatunukiwa kwa {NAME} kwa kuonyesha tabia njema na uongozi bora katika {SCHOOL}."
  },
  remedial_progress: {
    Kinyarwanda: "Icyemezo cy'Inzamuka n'Umuhate mu Mfashabwigisho (RLP) gihabwa {NAME} wagerageje cyane no kuzamuka mu bumenyi n'ubushobozi bwe muri {SCHOOL}.",
    English: "This Certificate of Continuous Progress & Improvement is presented to {NAME} for remarkable growth, perseverance, and skill mastery in the Remedial Learning Program at {SCHOOL}.",
    French: "Ce Certificat de Progrès Remarquable est décerné à {NAME} pour son amélioration continue et sa détermination dans le programme de remédiation à {SCHOOL}.",
    Swahili: "Cheti hiki cha Maendeleo na Jitihada kinatunukiwa kwa {NAME} kwa kuonyesha hatua kubwa za maendeleo ya masomo katika {SCHOOL}."
  },
  teacher_cpd: {
    Kinyarwanda: "Icyemezo cy'Amahugurwa n'Ubumenyi mu Mwigishirize (CPD) gihabwa Umwarimu {NAME} ku bw'agaciro n'umuhate yaragaje mu mahugurwa no gukoresha ikoranabuhanga n'uburyo bwashya bw'imwigishirize (CBC) muri {SCHOOL}.",
    English: "This Professional Development Certificate is presented to Educator {NAME} for successful completion of Advanced Competency-Based Training & AI Integration in Education at {SCHOOL}.",
    French: "Ce Certificat de Formation Continue est décerné à l'Enseignant(e) {NAME} pour la réussite de la formation pédagogique sur les compétences et l'IA à {SCHOOL}.",
    Swahili: "Cheti hiki cha Mafunzo ya Ualimu kinatunukiwa kwa Mwalimu {NAME} kwa kukamilisha mafunzo ya mbinu za kisasa za ufundishaji katika {SCHOOL}."
  },
  stem_award: {
    Kinyarwanda: "Icyemezo cy'Indashyikirwa mu Ikoranabuhanga n'SAYANSI (STEM & Innovation) gihabwa {NAME} ku bwa gahunda n'udushya tw'ubwenge mu masomo ya Sayansi n'Ikoranabuhanga muri {SCHOOL}.",
    English: "This STEM & Innovation Award is conferred upon {NAME} in recognition of outstanding creative problem-solving and excellence in Science and Technology at {SCHOOL}.",
    French: "Ce Prix d'Innovation et STEM est décerné à {NAME} pour sa créativité et son excellence dans les disciplines scientifiques et technologiques à {SCHOOL}.",
    Swahili: "Tuzo hii ya Sayansi na Teknolojia (STEM) inatunukiwa kwa {NAME} kwa ubunifu na umahiri mkubwa wa masomo ya sayansi katika {SCHOOL}."
  },
  custom: {
    Kinyarwanda: "Icyemezo cy'Icyubahiro gihabwa {NAME} mu gushimira umusanzu ukomeye n'indashyikirwa muri {SCHOOL}.",
    English: "This Certificate of Appreciation is presented to {NAME} in grateful recognition of valuable service, achievement, and outstanding contribution to {SCHOOL}.",
    French: "Ce Certificat de Reconnaissance est décerné à {NAME} en remerciement de son soutien précieux et de sa contribution exceptionnelle à {SCHOOL}.",
    Swahili: "Cheti hiki cha Shukrani kinatunukiwa kwa {NAME} kwa mchango wake mkubwa na wa thamani katika {SCHOOL}."
  },
  special_coach: {
    Kinyarwanda: "Icyemezo cy'Icyubahiro cy'Umutoza w'Umwihariko (Certificate of Special Coach) gihabwa Coach {NAME} mu gushimira ubumenyi buhanitse, ubuhanga bwo gufasha no kuzamura abandi, gutoza neza n'ubwitange budasanzwe wagaragaje muri {SCHOOL}.",
    English: "This Certificate of Special Coach is proudly presented to Coach {NAME} in recognition of exceptional coaching expertise, inspiring mentorship, tactical mastery, and dedicated guidance at {SCHOOL}.",
    French: "Ce Certificat de Coach Spécial est décerné avec fierté au Coach {NAME} en reconnaissance de son expertise exceptionnelle en coaching, de son mentorat inspirant et de son dévouement remarquable à {SCHOOL}.",
    Swahili: "Cheti hiki cha Kocha Maalum kinatunukiwa kwa fahari kwa Kocha {NAME} kama kutambua uzoefu wa hali ya juu wa ufundishaji, uongozi wa mfano na bidii kubwa katika {SCHOOL}."
  }
};

const CERTIFICATE_CACHE_KEY = 'nkorera_saved_certificates';

const CERT_I18N: Record<LanguageOption, {
  heroTitle: string;
  heroSub: string;
  btnNew: string;
  btnHistory: string;
  noticeTitle: string;
  noticeText: string;
  sec1Category: string;
  catAcademic: string;
  catDiscipline: string;
  catRemedial: string;
  catCpd: string;
  catStem: string;
  catSpecialCoach: string;
  catCustom: string;
  labelRecipientPhoto: string;
  placeRecipientPhoto: string;
  sec2Recipient: string;
  labelFullName: string;
  placeFullName: string;
  labelRole: string;
  placeRole: string;
  labelSchool: string;
  placeSchool: string;
  labelTitle: string;
  placeTitle: string;
  labelCitation: string;
  placeCitation: string;
  btnAiGenerate: string;
  btnAiGenerating: string;
  sec3Signatories: string;
  labelIssuer1: string;
  placeIssuer1Name: string;
  placeIssuer1Title: string;
  labelIssuer2: string;
  placeIssuer2Name: string;
  placeIssuer2Title: string;
  labelDate: string;
  labelLanguage: string;
  labelGender: string;
  genderAuto: string;
  genderFemale: string;
  genderMale: string;
  secFrameStyle: string;
  styleLimeLabel: string;
  styleLimeDesc: string;
  styleRebLabel: string;
  styleRebDesc: string;
  styleStemLabel: string;
  styleStemDesc: string;
  paymentNoticeTitle: string;
  paymentNoticeText: string;
  btnGenerateCert: string;
  btnEditForm: string;
  printTip: string;
  btnPrintCert: string;
  certCompliantTag: string;
  certRecognitionTag: string;
  certPresentedTo: string;
  certSignatureLabel: string;
  certOfficialSeal: string;
  certDateLabel: string;
  historyTitle: string;
  historySub: string;
  searchPlace: string;
  emptyHistory: string;
  btnHistoryNew: string;
  btnViewPrint: string;
  btnVerify: string;
  verifyTitle: string;
  verifySub: string;
  verifyPlace: string;
  verifyBtn: string;
  verifiedBadge: string;
  verifiedSub: string;
  verifyNotFound: string;
  verifierTitle: string;
}> = {
  Kinyarwanda: {
    heroTitle: "Gukora Ibyemezo by'Icyubahiro (Official AI Certificates)",
    heroSub: "Hanga ibyemezo n'impamyabumenyi by'abanyeshuri n'abarimu mu buryo bw'akataraboneka. Ibyemezo bya REB, ibyo gushimira abanyeshuri b'indashyikirwa, imyitwarire, n'amahugurwa.",
    btnNew: "Hanga Certificate Nshya",
    btnHistory: "Ububiko",
    btnVerify: "🔍 Kugensura Certificate (QR Code)",
    verifyTitle: "Sisteme yo Kugenzura Umwimerere wa Certificate",
    verifySub: "Shyiramo nimero ya Certificate cyangwa usikane QR Code kugira ngo ugere ku byangombwa by'umwimerere byemejwe na Nkundimana Theogene.",
    verifyPlace: "Urugero: CERT-849201",
    verifyBtn: "Genzura Umwimerere",
    verifiedBadge: "✅ ICYEMEZO NI UMWIMERERE KANDI CYEMEWE",
    verifiedSub: "Iki cyemezo cyemejwe mu buryo bw'amategeko no ku rugo rwa Nkundimana Theogene (Umuremyi wa Nkorera Education AI Systems).",
    verifyNotFound: "Nta Certificate yabonetse ifite iyi nimero muri systeme ya Nkundimana Theogene.",
    verifierTitle: "Urwego Rwemeza & Telefone yo Kubaza (Verification Support)",
    noticeTitle: "⚠️ IKITONDERWA CY'INGENZI (OFFICIAL AUTHORIZATION NOTICE)",
    noticeText: "Nta wundi muntu wemerewe gukora cyangwa gukura (download/print) certificate muri iyi systeme usibye uwakoze uru rubuga ariwe Nkundimana Theogene. Gusa niwe uguha no gucapa iyo certificate ubanza kwishyura amafaranga 2,000 RWF (Ibihumbi bibiri by'amanyarwanda) kuri Mobile Money (0781339530 / 0724038043 - Nkundimana Theogene).",
    sec1Category: "1. Hitamo Ubwoko bw'Icyemezo (Category)",
    catAcademic: "Indashyikirwa (Academic)",
    catDiscipline: "Imyitwarire (Discipline)",
    catRemedial: "Remedial (RLP)",
    catCpd: "Abarimu (CPD)",
    catStem: "Sayansi (STEM)",
    catSpecialCoach: "Coach w'Umwihariko (Special Coach)",
    catCustom: "Cyihariye (Custom)",
    labelRecipientPhoto: "Foto y'Uhabwa Icyemezo (Recipient Photo / Avatar)",
    placeRecipientPhoto: "Shyiraho foto y'umuntu usanzwe cyangwa ukoreshe avatar y'umuntu w'umwimerere",
    sec2Recipient: "2. Amakuru y'Uhabwa Icyemezo n'Ikigo (Recipient & Institution)",
    labelFullName: "Izina ry'Uhabwa Icyemezo (Full Name)",
    placeFullName: "Urugero: Mukamana Angelique / Ndayishimiye Jean",
    labelRole: "Umwanya / Ikirombe (Role / Class Grade)",
    placeRole: "Urugero: Learner - Primary 6 A / Teacher of Science",
    labelSchool: "Izina ry'Ikigo / Ishuri (School Name)",
    placeSchool: "Urugero: G.S. Saint André Kigali",
    labelTitle: "Umutwe w'Icyemezo (Certificate Title)",
    placeTitle: "Urugero: ICYEMEZO CY'INDASHYIKIRWA MU MASOMO",
    labelCitation: "Inyandiko y'Icyemezo (Citation Wording)",
    placeCitation: "Inyandiko z'icyemezo zandikwa hano...",
    btnAiGenerate: "✨ Re-generate Citation with AI",
    btnAiGenerating: "AI ihenze text...",
    sec3Signatories: "3. Abashyiraho Umukono n'Itariki (Signatories & Date)",
    labelIssuer1: "Umukono 1 - Izina (Signatory 1)",
    placeIssuer1Name: "Urugero: NKUNDIMANA Theogene",
    placeIssuer1Title: "Urugero: Head Teacher / Director",
    labelIssuer2: "Umukono 2 - Izina (Signatory 2)",
    placeIssuer2Name: "Urugero: Uwimana Marie Rose",
    placeIssuer2Title: "Urugero: Director of Studies (DOS)",
    labelDate: "Itariki y'Icyemezo (Issue Date)",
    labelLanguage: "Guhitamo Ururimi (Language)",
    labelGender: "Ubwoko bw'Ishusho (Graduate Avatar)",
    genderAuto: "Guhitamo ku buryo bwikora (Auto Detect)",
    genderFemale: "Umukobwa Yambaye Ikanzu n'Ingofero (Girl)",
    genderMale: "Umuhungu Yambaye Ikanzu n'Ingofero (Boy)",
    secFrameStyle: "Uburyo bw'Ikarita (Frame & Border Style)",
    styleLimeLabel: "Lime & Gold Luxury Frame",
    styleLimeDesc: "Ikarita ya zahabu n'icyatsi kibisi kizira amakemwa",
    styleRebLabel: "REB Academic Classic Frame",
    styleRebDesc: "Ikarita yemewe y'amashuri n'Inzego z'uburezi",
    styleStemLabel: "Modern Tech & Science Frame",
    styleStemDesc: "Uburyo bwo mu rwego rwo hejuru bwa STEM",
    paymentNoticeTitle: "💰 Kwishyura Certificate:",
    paymentNoticeText: "Ibiri mu kigo: 2,000 RWF per certificate. MoMo: 0781339530 / 0724038043 (Nkundimana Theogene)",
    btnGenerateCert: "Kora Icyemezo (Generate Certificate)",
    btnEditForm: "← Hindura Form (Edit Details)",
    printTip: "💡 Inama: Hitamo Landscape A4 & emera Background Graphics mu gucapa!",
    btnPrintCert: "Capa Icyemezo (Print Certificate)",
    certCompliantTag: "REB / Ministry of Education Compliant Institution",
    certRecognitionTag: "Official Recognition",
    certPresentedTo: "Iki cyemezo gihabwa neza no gushimira:",
    certSignatureLabel: "Umukono & Ikashe",
    certOfficialSeal: "YEMEWE",
    certDateLabel: "Itariki:",
    historyTitle: "Ububiko bw'Ibyemezo Byakozwe (Saved Certificates History)",
    historySub: "Reba cyangwa ucape ibyemezo byose wagiye ukora.",
    searchPlace: "Shaka mu byemezo...",
    emptyHistory: "Nta byemezo birabikwa mu bubiko.",
    btnHistoryNew: "Hanga Icyemezo Gishya",
    btnViewPrint: "Reba & Capa"
  },
  English: {
    heroTitle: "Official AI Certificate Generator",
    heroSub: "Design high-quality certificates for students, teachers, and staff. Generate academic excellence awards, discipline citations, CPD credentials, and STEM achievement certificates.",
    btnNew: "Create New Certificate",
    btnHistory: "Saved Records",
    btnVerify: "🔍 Verify Certificate (QR Code)",
    verifyTitle: "Official Certificate Verification Portal",
    verifySub: "Enter any Certificate ID or scan the QR Code on the document to confirm its official authenticity by Nkundimana Theogene.",
    verifyPlace: "e.g. CERT-849201",
    verifyBtn: "Verify Authenticity",
    verifiedBadge: "✅ CERTIFICATE IS AUTHENTIC & OFFICIALLY VERIFIED",
    verifiedSub: "This certificate is officially registered and verified in the database by Nkundimana Theogene (Founder & Developer of Nkorera Education AI).",
    verifyNotFound: "No valid certificate found matching this ID number in Nkundimana Theogene's database.",
    verifierTitle: "Official Verifier & Support Contact",
    noticeTitle: "⚠️ OFFICIAL AUTHORIZATION NOTICE",
    noticeText: "No other person is authorized to create or download/print certificates in this system except the website creator, Nkundimana Theogene. Only he provides and prints the certificate after a payment of 2,000 RWF (Two thousand Rwandan Francs) via Mobile Money (0781339530 / 0724038043 - Nkundimana Theogene).",
    sec1Category: "1. Select Certificate Category",
    catAcademic: "Excellence (Academic)",
    catDiscipline: "Discipline & Merit",
    catRemedial: "Remedial Progress",
    catCpd: "Teachers (CPD)",
    catStem: "Science & STEM",
    catSpecialCoach: "Special Coach (Coach)",
    catCustom: "Custom Citation",
    labelRecipientPhoto: "Recipient Photo / Verified Portrait",
    placeRecipientPhoto: "Upload real person photo or use verified human avatar",
    sec2Recipient: "2. Recipient & School Information",
    labelFullName: "Recipient Full Name",
    placeFullName: "e.g. Mukamana Angelique / Ndayishimiye Jean",
    labelRole: "Role / Class Grade",
    placeRole: "e.g. Learner - Primary 6 A / Science Teacher",
    labelSchool: "School / Institution Name",
    placeSchool: "e.g. G.S. Saint André Kigali",
    labelTitle: "Certificate Title",
    placeTitle: "e.g. CERTIFICATE OF ACADEMIC EXCELLENCE",
    labelCitation: "Citation / Appreciation Wording",
    placeCitation: "Enter certificate citation text here...",
    btnAiGenerate: "✨ Re-generate Citation with AI",
    btnAiGenerating: "AI is composing citation...",
    sec3Signatories: "3. Signatories & Issue Date",
    labelIssuer1: "Signatory 1 Name & Title",
    placeIssuer1Name: "e.g. NKUNDIMANA Theogene",
    placeIssuer1Title: "e.g. Head Teacher / Principal",
    labelIssuer2: "Signatory 2 Name & Title",
    placeIssuer2Name: "e.g. Uwimana Marie Rose",
    placeIssuer2Title: "e.g. Director of Studies (DOS)",
    labelDate: "Issue Date",
    labelLanguage: "Certificate Language",
    labelGender: "Graduate Graphic (Cap & Gown)",
    genderAuto: "Auto-detect from Name",
    genderFemale: "Female Graduate (Girl)",
    genderMale: "Male Graduate (Boy)",
    secFrameStyle: "Frame & Border Style",
    styleLimeLabel: "Lime & Gold Luxury Frame",
    styleLimeDesc: "Elegant gold and fresh green luxury border",
    styleRebLabel: "REB Academic Classic Frame",
    styleRebDesc: "Standard ministry and institutional border",
    styleStemLabel: "Modern Tech & Science Frame",
    styleStemDesc: "Contemporary high-tech STEM frame style",
    paymentNoticeTitle: "💰 Certificate Fee & Payment:",
    paymentNoticeText: "Official fee: 2,000 RWF per printed certificate. MoMo: 0781339530 / 0724038043 (Nkundimana Theogene)",
    btnGenerateCert: "Generate Certificate",
    btnEditForm: "← Edit Form Details",
    printTip: "💡 Tip: Choose Landscape A4 & enable Background Graphics when printing!",
    btnPrintCert: "Print Certificate",
    certCompliantTag: "REB / Ministry of Education Compliant Institution",
    certRecognitionTag: "Official Recognition",
    certPresentedTo: "This Certificate is proudly presented to:",
    certSignatureLabel: "Signature & Stamp",
    certOfficialSeal: "OFFICIAL",
    certDateLabel: "Date:",
    historyTitle: "Saved Certificates History",
    historySub: "View, review, or print all your saved certificate records.",
    searchPlace: "Search certificates...",
    emptyHistory: "No certificates saved in history yet.",
    btnHistoryNew: "Create New Certificate",
    btnViewPrint: "View & Print"
  },
  French: {
    heroTitle: "Générateur Officiel de Certificats IA",
    heroSub: "Créez des certificats et diplômes officiels pour élèves et enseignants. Certificats d'excellence académique, mérite, remédiation, formation CPD et STEM.",
    btnNew: "Nouveau Certificat",
    btnHistory: "Historique",
    btnVerify: "🔍 Vérifier Certificat (QR Code)",
    verifyTitle: "Portail Officiel de Vérification de Certificats",
    verifySub: "Saisissez le numéro du certificat ou scannez le code QR pour vérifier son authenticité par Nkundimana Theogene.",
    verifyPlace: "ex: CERT-849201",
    verifyBtn: "Vérifier l'Authenticité",
    verifiedBadge: "✅ CERTIFICAT AUTHENTIQUE ET VÉRIFIÉ OFFICIELLEMENT",
    verifiedSub: "Ce certificat est officiellement enregistré et authentifié dans le système par Nkundimana Theogene.",
    verifyNotFound: "Aucun certificat correspondant à ce numéro n'a été trouvé dans la base de données de Nkundimana Theogene.",
    verifierTitle: "Vérificateur Officiel & Contact",
    noticeTitle: "⚠️ AVIS D'AUTORISATION OFFICIELLE",
    noticeText: "Aucune autre personne n'est autorisée à créer ou télécharger/imprimer des certificats dans ce système à l'exception du créateur du site, Nkundimana Theogene. Seul ce dernier vous fournit et imprime le certificat après un paiement de 2 000 RWF via Mobile Money (0781339530 / 0724038043 - Nkundimana Theogene).",
    sec1Category: "1. Sélectionner la Catégorie",
    catAcademic: "Excellence Académique",
    catDiscipline: "Discipline et Mérite",
    catRemedial: "Remédiation (RLP)",
    catCpd: "Enseignants (CPD)",
    catStem: "Sciences & STEM",
    catSpecialCoach: "Coach Spécial (Coach)",
    catCustom: "Personnalisé",
    labelRecipientPhoto: "Photo du Récipiendaire / Avatar Vérifié",
    placeRecipientPhoto: "Téléchargez une photo réelle ou utilisez l'avatar vérifié",
    sec2Recipient: "2. Informations du Récipiendaire & Établissement",
    labelFullName: "Nom Complet du Récipiendaire",
    placeFullName: "ex: Mukamana Angelique / Ndayishimiye Jean",
    labelRole: "Rôle / Classe / Titre",
    placeRole: "ex: Élève - 6ème Primaire / Professeur de Sciences",
    labelSchool: "Nom de l'École / Établissement",
    placeSchool: "ex: G.S. Saint André Kigali",
    labelTitle: "Titre du Certificat",
    placeTitle: "ex: CERTIFICAT D'EXCELLENCE ACADÉMIQUE",
    labelCitation: "Texte de Citation / Félicitations",
    placeCitation: "Rédigez le texte du certificat ici...",
    btnAiGenerate: "✨ Régénérer Citation avec IA",
    btnAiGenerating: "L'IA génère le texte...",
    sec3Signatories: "3. Signataires & Date de Délivrance",
    labelIssuer1: "Signataire 1 Nom & Titre",
    placeIssuer1Name: "ex: NKUNDIMANA Theogene",
    placeIssuer1Title: "ex: Directeur de l'Établissement",
    labelIssuer2: "Signataire 2 Nom & Titre",
    placeIssuer2Name: "ex: Uwimana Marie Rose",
    placeIssuer2Title: "ex: Directeur des Études (DOS)",
    labelDate: "Date de Délivrance",
    labelLanguage: "Langue du Certificat",
    labelGender: "Graphique du Diplômé (Toque & Toge)",
    genderAuto: "Détection automatique d'après le nom",
    genderFemale: "Diplômée (Fille)",
    genderMale: "Diplômé (Garçon)",
    secFrameStyle: "Style du Cadre & Bordure",
    styleLimeLabel: "Cadre Luxueux Vert & Or",
    styleLimeDesc: "Bordure dorée élégante et vert éclatant",
    styleRebLabel: "Cadre Académique Classique",
    styleRebDesc: "Bordure institutionnelle conforme aux normes",
    styleStemLabel: "Cadre Moderne STEM & Tech",
    styleStemDesc: "Style scientifique contemporain",
    paymentNoticeTitle: "💰 Frais de Certificat & Paiement:",
    paymentNoticeText: "Frais officiels: 2 000 RWF par certificat imprimé. MoMo: 0781339530 / 0724038043 (Nkundimana Theogene)",
    btnGenerateCert: "Générer le Certificat",
    btnEditForm: "← Modifier le Formulaire",
    printTip: "💡 Conseil: Choisissez Paysage A4 & activez les Graphiques d'Arrière-plan lors de l'impression!",
    btnPrintCert: "Imprimer le Certificat",
    certCompliantTag: "Établissement Conforme aux Normes REB / Ministère",
    certRecognitionTag: "Reconnaissance Officielle",
    certPresentedTo: "Ce certificat est décerné avec fierté à:",
    certSignatureLabel: "Signature & Cachet",
    certOfficialSeal: "OFFICIEL",
    certDateLabel: "Date:",
    historyTitle: "Historique des Certificats Enregistrés",
    historySub: "Consultez, révisez ou imprimez tous vos certificats enregistrés.",
    searchPlace: "Rechercher un certificat...",
    emptyHistory: "Aucun certificat enregistré pour le moment.",
    btnHistoryNew: "Nouveau Certificat",
    btnViewPrint: "Voir & Imprimer"
  },
  Swahili: {
    heroTitle: "Mfumo Rasmi wa Kutengeneza Vyeti wa AI",
    heroSub: "Tengeneza vyeti vya hali ya juu kwa wanafunzi, walimu na wafanyakazi. Vyeti vya umahiri wa masomo, nidhamu, mafunzo ya CPD na tuzo za STEM.",
    btnNew: "Tengeneza Cheti Kipya",
    btnHistory: "Kumbukumbu Hifadhi",
    btnVerify: "🔍 Hakiki Cheti (QR Code)",
    verifyTitle: "Mfumo Rasmi wa Kuhakiki Vyeti",
    verifySub: "Weka nambari ya cheti au piga picha ya QR Code ili kuthibitisha usahihi rasmi wa Nkundimana Theogene.",
    verifyPlace: "mf. CERT-849201",
    verifyBtn: "Hakiki Usahihi",
    verifiedBadge: "✅ CHETI NI CHA KWELI NA KIMEHAKIKISHWA RASMI",
    verifiedSub: "Cheti hiki kimesajiliwa rasmi na kuthibitishwa na Nkundimana Theogene (Muanzishi wa Mfumo wa Nkorera Education AI).",
    verifyNotFound: "Hakuna cheti kilichopatikana kwa nambari hii katika mfumo wa Nkundimana Theogene.",
    verifierTitle: "Mamlaka ya Uhakiki na Mawasiliano",
    noticeTitle: "⚠️ TAARIFA RASMI YA MAMLAKA",
    noticeText: "Hakuna mtu mwingine anayeruhusiwa kutengeneza au kupakua/kuchapa vyeti katika mfumo huu isipokuwa muundaji wa tovuti hii, Nkundimana Theogene. Yeye pekee ndiye anayekupa na kuchapa cheti hicho baada ya kulipia ada ya 2,000 RWF kupitia Mobile Money (0781339530 / 0724038043 - Nkundimana Theogene).",
    sec1Category: "1. Chagua Aina ya Cheti",
    catAcademic: "Umahiri wa Masomo",
    catDiscipline: "Nidhamu Bora",
    catRemedial: "Maendeleo ya Masomo",
    catCpd: "Walimu (CPD)",
    catStem: "Sayansi na STEM",
    catSpecialCoach: "Kocha Maalum (Coach)",
    catCustom: "Cheti Maalum",
    labelRecipientPhoto: "Picha ya Mpokeaji / Avatar Iliyohakikishwa",
    placeRecipientPhoto: "Weka picha halisi au tumia avatar iliyohakikishwa",
    sec2Recipient: "2. Taarifa za Mpokeaji na Shule",
    labelFullName: "Jina Kamili la Mpokeaji",
    placeFullName: "mf. Mukamana Angelique / Ndayishimiye Jean",
    labelRole: "Nafasi / Darasa",
    placeRole: "mf. Mwanafunzi - Darasa la 6 / Mwalimu wa Sayansi",
    labelSchool: "Jina la Shule / Taasisi",
    placeSchool: "mf. G.S. Saint André Kigali",
    labelTitle: "Kichwa cha Cheti",
    placeTitle: "mf. CHETI CHA UMAHIRI WA MASOMO",
    labelCitation: "Maelezo ya Shukrani / Sifa",
    placeCitation: "Andika maelezo ya cheti hapa...",
    btnAiGenerate: "✨ Tengeneza Maelezo kwa AI",
    btnAiGenerating: "AI inatunga maelezo...",
    sec3Signatories: "3. Sahihi na Tarehe ya Kutolewa",
    labelIssuer1: "Sahihi 1 Jina na Cheo",
    placeIssuer1Name: "mf. NKUNDIMANA Theogene",
    placeIssuer1Title: "mf. Mwalimu Mkuu / Mkurugenzi",
    labelIssuer2: "Sahihi 2 Jina na Cheo",
    placeIssuer2Name: "mf. Uwimana Marie Rose",
    placeIssuer2Title: "mf. Mkurugenzi wa Masomo (DOS)",
    labelDate: "Tarehe ya Kutolewa",
    labelLanguage: "Lugha ya Cheti",
    labelGender: "Picha ya Mhitimu (Kofia na Joho)",
    genderAuto: "Tambua jinsia kutoka kwa jina",
    genderFemale: "Mhitimu wa Kike (Msichana)",
    genderMale: "Mhitimu wa Kiume (Mvulana)",
    secFrameStyle: "Muundo wa Pambizo (Frame Style)",
    styleLimeLabel: "Pambizo la Kifahari la Dhahabu na Kijani",
    styleLimeDesc: "Pambizo zuri la kifahari la dhahabu na kijani kibichi",
    styleRebLabel: "Pambizo Rasmi la Kiumatagala (REB)",
    styleRebDesc: "Muundo rasmi wa shule na wizara ya elimu",
    styleStemLabel: "Pambizo la Kisasala Sayansi (STEM)",
    styleStemDesc: "Muundo wa kisasa wa masomo ya sayansi na teknolojia",
    paymentNoticeTitle: "💰 Malipo ya Cheti:",
    paymentNoticeText: "Ada rasmi: 2,000 RWF kwa kila cheti kilichochapwa. MoMo: 0781339530 / 0724038043 (Nkundimana Theogene)",
    btnGenerateCert: "Tengeneza Cheti",
    btnEditForm: "← Badilisha Taarifa",
    printTip: "💡 Ushauri: Chagua Landscape A4 & ruhusu Background Graphics wakati wa kuchapa!",
    btnPrintCert: "Chapa Cheti (Print Certificate)",
    certCompliantTag: "Taasisi Inayozingatia Viwango vya Wizara / REB",
    certRecognitionTag: "Utambuzi Rasmi",
    certPresentedTo: "Cheti hiki kinatunukiwa kwa fahari kwa:",
    certSignatureLabel: "Sahihi na Muhuri",
    certOfficialSeal: "RASMI",
    certDateLabel: "Tarehe:",
    historyTitle: "Kumbukumbu za Vyeti Vilivyohifadhiwa",
    historySub: "Tazama, kagua au chapa vyeti vyote ulivyohifadhi.",
    searchPlace: "Tafuta cheti...",
    emptyHistory: "Hakuna vyeti vilivyohifadhiwa bado.",
    btnHistoryNew: "Tengeneza Cheti Kipya",
    btnViewPrint: "Tazama & Chapa"
  }
};

// Beautiful SVG illustration of a Female Graduate
export const FemaleGraduateSvg: React.FC<{ className?: string }> = ({ className = "w-24 h-24" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background Circle */}
    <circle cx="50" cy="50" r="48" fill="#F0FDF4" stroke="#10B981" strokeWidth="2" />
    
    {/* Female Hair Back */}
    <path d="M30 40C30 30 70 30 70 40V55C70 58 67 60 62 60C57 60 55 57 55 55V48H45V55C45 57 43 60 38 60C33 60 30 58 30 55V40Z" fill="#1E293B" />
    
    {/* Neck */}
    <rect x="46" y="52" width="8" height="12" fill="#FDBA74" rx="2" />
    
    {/* Face */}
    <rect x="36" y="32" width="28" height="26" fill="#FED7AA" rx="10" />
    
    {/* Hair Front/Bangs */}
    <path d="M35 34C38 29 45 30 48 32C52 30 59 29 62 34C64 34 65 37 65 40C61 36 57 37 55 41C55 41 50 35 45 41C43 37 39 36 35 40C35 37 35 34 35 34Z" fill="#1E293B" />
    
    {/* Eyes & Smile */}
    <circle cx="43" cy="44" r="1.5" fill="#1E293B" />
    <circle cx="57" cy="44" r="1.5" fill="#1E293B" />
    <path d="M46 50C48 52 52 52 54 50" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M38 43C37 42 39 41 40 42M59 43C60 42 58 41 57 42" stroke="#1E293B" strokeWidth="1" strokeLinecap="round" />
    
    {/* Gown/Dress Neck V-neck */}
    <path d="M30 64C30 64 38 64 50 72C62 64 70 64 70 64V88H30V64Z" fill="#0F172A" />
    <path d="M44 64L50 72L56 64" stroke="#FED7AA" strokeWidth="2.5" strokeLinecap="round" />
    
    {/* Ribbon/Stole (Academic scarf) */}
    <path d="M35 64C35 64 38 72 38 88" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
    <path d="M65 64C65 64 62 72 62 88" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
    <path d="M35 64C35 64 38 72 38 88" stroke="#FBBF24" strokeWidth="1" strokeLinecap="round" />
    <path d="M65 64C65 64 62 72 62 88" stroke="#FBBF24" strokeWidth="1" strokeLinecap="round" />
    
    {/* Graduation Cap */}
    {/* Cap Under-cap / band */}
    <path d="M37 30C37 25 63 25 63 30H37Z" fill="#1E293B" />
    {/* Cap Diamond */}
    <path d="M50 14L74 23L50 32L26 23L50 14Z" fill="#0F172A" stroke="#334155" strokeWidth="1" />
    {/* Tassel button */}
    <circle cx="50" cy="23" r="1.5" fill="#FBBF24" />
    {/* Tassel line and brush */}
    <path d="M50 23C44 24 38 28 36 31" stroke="#FBBF24" strokeWidth="1" fill="none" />
    <rect x="34" y="31" width="3" height="6" fill="#FBBF24" rx="0.5" />
  </svg>
);

// Beautiful SVG illustration of a Male Graduate
export const MaleGraduateSvg: React.FC<{ className?: string }> = ({ className = "w-24 h-24" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background Circle */}
    <circle cx="50" cy="50" r="48" fill="#F0FDF4" stroke="#10B981" strokeWidth="2" />
    
    {/* Neck */}
    <rect x="46" y="52" width="8" height="12" fill="#FDBA74" rx="2" />
    
    {/* Face */}
    <rect x="36" y="32" width="28" height="26" fill="#FED7AA" rx="10" />
    
    {/* Male Hair */}
    <path d="M35 33C38 28 42 28 46 29C50 28 55 28 61 31C64 33 65 37 65 39C60 36 50 36 45 38C40 37 36 37 35 39V33Z" fill="#1E293B" />
    
    {/* Eyes & Smile */}
    <circle cx="43" cy="44" r="1.5" fill="#1E293B" />
    <circle cx="57" cy="44" r="1.5" fill="#1E293B" />
    <path d="M46 50C48 52 52 52 54 50" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M38 43C37 42 39 41 40 42M59 43C60 42 58 41 57 42" stroke="#1E293B" strokeWidth="1" strokeLinecap="round" />
    
    {/* Gown/Tie V-neck */}
    <path d="M30 64C30 64 38 64 50 72C62 64 70 64 70 64V88H30V64Z" fill="#0F172A" />
    <path d="M44 64L50 72L56 64" stroke="#FED7AA" strokeWidth="2.5" strokeLinecap="round" />
    
    {/* Collared shirt & Tie */}
    <path d="M45 64L50 69L55 64" fill="#FFFFFF" />
    <path d="M49 68L51 68L52 76L50 79L48 76L49 68Z" fill="#EF4444" />
    
    {/* Ribbon/Stole (Academic scarf) */}
    <path d="M35 64C35 64 38 72 38 88" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
    <path d="M65 64C65 64 62 72 62 88" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
    <path d="M35 64C35 64 38 72 38 88" stroke="#FBBF24" strokeWidth="1" strokeLinecap="round" />
    <path d="M65 64C65 64 62 72 62 88" stroke="#FBBF24" strokeWidth="1" strokeLinecap="round" />
    
    {/* Graduation Cap */}
    {/* Cap Under-cap / band */}
    <path d="M37 30C37 25 63 25 63 30H37Z" fill="#1E293B" />
    {/* Cap Diamond */}
    <path d="M50 14L74 23L50 32L26 23L50 14Z" fill="#0F172A" stroke="#334155" strokeWidth="1" />
    {/* Tassel button */}
    <circle cx="50" cy="23" r="1.5" fill="#FBBF24" />
    {/* Tassel line and brush */}
    <path d="M50 23C44 24 38 28 36 31" stroke="#FBBF24" strokeWidth="1" fill="none" />
    <rect x="34" y="31" width="3" height="6" fill="#FBBF24" rx="0.5" />
  </svg>
);

export const detectGenderFromName = (name: string): 'male' | 'female' => {
  const lower = name.toLowerCase().trim();
  if (!lower) return 'male';

  // Female indicators
  const femalePatterns = [
    /\bmuka/i,
    /\buwase\b/i,
    /\buwera\b/i,
    /\buwamahoro\b/i,
    /\buwimana\b/i,
    /\buwitonze\b/i,
    /\buwingabire\b/i,
    /\buwineza\b/i,
    /\bumuhoza\b/i,
    /\bumulisa\b/i,
    /\bumurerwa\b/i,
    /\bumutoni\b/i,
    /\bmutoni\b/i,
    /\bmutesi\b/i,
    /\baline\b/i,
    /\bsandrine\b/i,
    /\bdivine\b/i,
    /\bnadine\b/i,
    /\bchantal\b/i,
    /\bsolange\b/i,
    /\bgentille\b/i,
    /\bnishimwe\b/i,
    /\bmarie\b/i,
    /\bangelique\b/i,
    /\bgrace\b/i,
    /\bgloria\b/i,
    /\bclementine\b/i,
    /\bdiane\b/i,
    /\bikirezi\b/i,
    /\bisaro\b/i,
    /\bkeza\b/i,
    /\bclaudine\b/i,
    /\bjeanne\b/i,
    /\bbeata\b/i,
    /\bvalerie\b/i,
    /\bodette\b/i,
    /\byvonne\b/i,
    /\besther\b/i,
    /\bruth\b/i,
    /\bsarah\b/i,
    /\bdeborah\b/i,
    /\bfiona\b/i,
    /\bgabriella\b/i,
    /\bsonia\b/i,
    /\bines\b/i,
    /\besperance\b/i,
    /\bmukeshimana\b/i,
    /\bmukashyaka\b/i,
    /\bmukandutiye\b/i,
    /\bmukarugwiza\b/i,
    /\bmukasine\b/i,
    /\bmukantabana\b/i,
    /\bmukandori\b/i,
    /\bmukagagasana\b/i,
    /\bmukampunga\b/i,
    /\bmukamusoni\b/i,
    /\balice\b/i,
    /\bclara\b/i,
    /\blucy\b/i,
    /\bjane\b/i,
    /\bflorence\b/i,
    /\bcharlotte\b/i,
    /\bclaudette\b/i,
    /\bdative\b/i,
    /\bhenriette\b/i,
    /\bjoselyne\b/i,
    /\bhope\b/i,
    /\bchance\b/i,
    /\bjoyeuse\b/i,
    /\bregina\b/i,
    /\bemerence\b/i,
    /\bfida\b/i,
    /\banna\b/i,
    /\brebecca\b/i,
    /\blise\b/i,
    /\bestella\b/i,
    /\bmukambanda\b/i,
    /\buwamariya\b/i,
    /\buwambaje\b/i,
    /\buwanyirigira\b/i,
    /\bumutonishwaka\b/i,
    /\bumuhozawase\b/i,
    /\buwizeye\b/i
  ];

  // Male indicators
  const malePatterns = [
    /\bjean\b/i,
    /\bpaul\b/i,
    /\bpierre\b/i,
    /\beric\b/i,
    /\bdavid\b/i,
    /\bjohn\b/i,
    /\bemmanuel\b/i,
    /\bbaptiste\b/i,
    /\bpatrick\b/i,
    /\bclaude\b/i,
    /\bcharles\b/i,
    /\bgaston\b/i,
    /\btheogene\b/i,
    /\baime\b/i,
    /\bchristian\b/i,
    /\bolivier\b/i,
    /\brobert\b/i,
    /\bsamuel\b/i,
    /\bdaniel\b/i,
    /\bjoseph\b/i,
    /\bwilliam\b/i,
    /\brichard\b/i,
    /\bvincent\b/i,
    /\bfidele\b/i,
    /\binnocent\b/i,
    /\bjustin\b/i,
    /\bfelix\b/i,
    /\bthierry\b/i,
    /\bpacifique\b/i,
    /\bjules\b/i,
    /\bblaise\b/i,
    /\bfabrice\b/i,
    /\bherve\b/i,
    /\bdieudonne\b/i,
    /\bvalens\b/i,
    /\bhubert\b/i,
    /\bedouard\b/i,
    /\breverien\b/i,
    /\bdamascene\b/i,
    /\baugustin\b/i,
    /\bcelestin\b/i,
    /\bsylvestre\b/i,
    /\bbonaventure\b/i,
    /\bgaspard\b/i,
    /\bviateur\b/i,
    /\banastase\b/i,
    /\beugene\b/i,
    /\bfructuose\b/i,
    /\bleonidas\b/i,
    /\bprotais\b/i,
    /\bgervais\b/i,
    /\bjuvenal\b/i,
    /\blaurent\b/i,
    /\bdonat\b/i,
    /\bnepomuscene\b/i,
    /\bmathieu\b/i,
    /\bluc\b/i,
    /\bmarc\b/i,
    /\bmatthieu\b/i,
    /\balphonse\b/i,
    /\btheophile\b/i,
    /\bniyomugabo\b/i,
    /\bmugabo\b/i,
    /\bhabimana\b/i,
    /\bhakizimana\b/i,
    /\bmunyaneza\b/i,
    /\bnkurunziza\b/i,
    /\bkagame\b/i,
    /\bkayitare\b/i,
    /\bgasana\b/i,
    /\bkaremera\b/i,
    /\bmugisha\b/i,
    /\bgatera\b/i,
    /\brutayisire\b/i,
    /\bndahimana\b/i,
    /\bdayishimiye\b/i,
    /\bngendahimana\b/i,
    /\bhabarugira\b/i,
    /\bmunyentwari\b/i,
    /\bnsabimana\b/i,
    /\bsibomana\b/i,
    /\bbizimana\b/i,
    /\bhabyarimana\b/i,
    /\bnsengimana\b/i,
    /\btwagiramana\b/i,
    /\bugirinshuti\b/i,
    /\bndayisenga\b/i,
    /\btuyisenge\b/i,
    /\btuyishime\b/i,
    /\bkwizera\b/i,
    /\bkarangwa\b/i,
    /\bmusoni\b/i,
    /\bngabo\b/i
  ];

  for (const pattern of femalePatterns) {
    if (pattern.test(lower)) return 'female';
  }
  for (const pattern of malePatterns) {
    if (pattern.test(lower)) return 'male';
  }

  // If it starts with "Muka" or contains "Muka" it's definitely female
  if (lower.includes('muka')) return 'female';
  
  // If it contains "Uwa" it is almost always female (e.g. Uwase, Uwera)
  if (lower.includes('uwa') && !lower.includes('ndayishimiye') && !lower.includes('habimana')) return 'female';

  // Default fallback to male
  return 'male';
};

export const CertificateCreator: React.FC<CertificateCreatorProps> = ({
  user,
  selectedLanguage,
  onOpenSignIn,
  onBackToDashboard,
  initialVerifyCert
}) => {
  const [lang, setLang] = useState<LanguageOption>(selectedLanguage || 'English');
  const [savedCertificates, setSavedCertificates] = useState<CertificateData[]>([]);

  // Form States
  const [category, setCategory] = useState<'student_academic' | 'student_discipline' | 'remedial_progress' | 'teacher_cpd' | 'stem_award' | 'special_coach' | 'custom'>('student_academic');
  const [recipientName, setRecipientName] = useState('Mukamana Angelique');
  const [recipientRole, setRecipientRole] = useState('Learner - Senior 3 A');
  const [schoolName, setSchoolName] = useState('G.S. Saint André Kigali');
  const [certificateTitle, setCertificateTitle] = useState('CERTIFICATE OF ACADEMIC EXCELLENCE');
  const [citationText, setCitationText] = useState('');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [issuer1Name, setIssuer1Name] = useState('NKUNDIMANA Theogene');
  const [issuer1Title, setIssuer1Title] = useState('Head Teacher / Director');
  const [issuer2Name, setIssuer2Name] = useState('Uwimana Marie Rose');
  const [issuer2Title, setIssuer2Title] = useState('Director of Studies (DOS)');
  const [borderStyle, setBorderStyle] = useState<'lime_gold_luxury' | 'reb_academic' | 'modern_emerald_lime'>('lime_gold_luxury');
  const [gender, setGender] = useState<'male' | 'female' | 'auto'>('auto');
  const [recipientPhoto, setRecipientPhoto] = useState<string>('');

  // UI States
  const [activeView, setActiveView] = useState<'create' | 'preview' | 'history' | 'verify' | 'qr-badge'>('create');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [currentCert, setCurrentCert] = useState<CertificateData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  // Lock / Security States for Certificate Download
  const [showLockModal, setShowLockModal] = useState(false);
  const [isUnlockedLocally, setIsUnlockedLocally] = useState(false);
  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  const isCertDownloadUnlocked = Boolean(user?.isAdmin || user?.canDownloadCertificate || isUnlockedLocally);

  // QR Badge Utility States
  const [qrType, setQrType] = useState<'certificate' | 'report' | 'custom'>('certificate');
  const [selectedCertId, setSelectedCertId] = useState('');
  const [qrStudentName, setQrStudentName] = useState('Mugisha Jean de Dieu');
  const [qrStudentClass, setQrStudentClass] = useState('Primary 6 A');
  const [qrSchoolName, setQrSchoolName] = useState('G.S. Saint André Kigali');
  const [qrTerm, setQrTerm] = useState('2026 - Term 2');
  const [qrReportId, setQrReportId] = useState(() => 'REP-' + Math.floor(100000 + Math.random() * 900000));
  const [qrCustomTitle, setQrCustomTitle] = useState('Mathematics Revision Resource Folder');
  const [qrCustomUrl, setQrCustomUrl] = useState('https://nkorera.rw/library/math-p6');
  const [qrCustomSub, setQrCustomSub] = useState('Scan to access all digital print resources');
  const [qrColor, setQrColor] = useState('#059669'); // Emerald
  const [qrLayout, setQrLayout] = useState<'flyer' | 'sticker' | 'wallet'>('flyer');
  const [savedReports, setSavedReports] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('nkorera_saved_reports');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Verification Portal States
  const [verifySearchNum, setVerifySearchNum] = useState(initialVerifyCert || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const certPrintRef = useRef<HTMLDivElement>(null);

  // Auto-generate initial citation when category/recipient changes
  useEffect(() => {
    const template = PRESET_CITATIONS[category]?.[lang] || PRESET_CITATIONS.custom[lang];
    const filled = template
      .replace('{NAME}', recipientName || 'Uhabwa Icyemezo')
      .replace('{SCHOOL}', schoolName || 'Ikigo ky\'Isumba');
    setCitationText(filled);
  }, [category, lang, recipientName, schoolName]);

  // Load saved certificates from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CERTIFICATE_CACHE_KEY);
      if (stored) {
        setSavedCertificates(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed loading saved certificates:", e);
    }
  }, []);

  // Handle initial verification trigger if passed via URL parameter
  useEffect(() => {
    if (initialVerifyCert) {
      setActiveView('verify');
      setVerifySearchNum(initialVerifyCert);
      handleVerifySearch(initialVerifyCert);
    }
  }, [initialVerifyCert]);

  // Verification Lookup Function
  const handleVerifySearch = async (numToVerify: string) => {
    const cleanNum = numToVerify.trim().toUpperCase();
    if (!cleanNum) return;

    setIsVerifying(true);
    setVerificationError(null);
    setVerificationResult(null);

    // Support report verification
    if (cleanNum.startsWith('REP-')) {
      const params = new URLSearchParams(window.location.search);
      const student = params.get('student');
      const studentClass = params.get('class');
      const school = params.get('school');
      const term = params.get('term');
      
      if (student && school) {
        setVerificationResult({
          verified: true,
          isReport: true,
          report: {
            reportId: cleanNum,
            studentName: student,
            studentClass: studentClass || 'N/A',
            schoolName: school,
            term: term || 'N/A',
            createdAt: new Date().toISOString()
          },
          verifier: "NKUNDIMANA Theogene",
          issuerRole: "Verified School Report & Evaluation",
          verifierPhone: "0781339530 / 0724038043",
          statusMessage: "Official Student Report Authenticity Verified by Nkorera Education."
        });
        setIsVerifying(false);
        return;
      }
      
      // Fallback: search local saved reports
      const storedReports = JSON.parse(localStorage.getItem('nkorera_saved_reports') || '[]');
      const localReport = storedReports.find((r: any) => r.reportId.toUpperCase() === cleanNum);
      if (localReport) {
        setVerificationResult({
          verified: true,
          isReport: true,
          report: localReport,
          verifier: "NKUNDIMANA Theogene",
          issuerRole: "Verified School Report & Evaluation",
          verifierPhone: "0781339530 / 0724038043",
          statusMessage: "Official Student Report Authenticity Verified by Nkorera Education."
        });
        setIsVerifying(false);
        return;
      }
    }

    // 1. Check local saved certificates first
    const localMatch = savedCertificates.find(
      c => (c.certificateNumber && c.certificateNumber.toUpperCase() === cleanNum) || (c.id && c.id.toUpperCase() === cleanNum)
    );

    if (localMatch) {
      setVerificationResult({
        verified: true,
        certificateNumber: localMatch.certificateNumber,
        certificate: localMatch,
        verifier: "NKUNDIMANA Theogene",
        issuerRole: "Creator & Founder, Nkorera Education / AI Teacher Systems",
        verifierPhone: "0781339530 / 0724038043",
        statusMessage: "Official Certificate Authenticity Verified by Nkundimana Theogene."
      });
      setIsVerifying(false);
      return;
    }

    // 2. Fetch from backend Firestore API
    try {
      const res = await fetch(`/api/certificates/verify/${encodeURIComponent(cleanNum)}`);
      if (res.ok) {
        const data = await res.json();
        setVerificationResult(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setVerificationError(
          errData.error || (
            lang === 'Kinyarwanda'
              ? `Nta Certificate yabonetse ifite ID ${cleanNum} mu bubiko bwa Nkundimana Theogene.`
              : `Certificate ID ${cleanNum} was not found in the official system database.`
          )
        );
      }
    } catch (err) {
      setVerificationError("Network error while verifying. Please check your connection.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Helper to construct QR code verification link
  const getCertVerificationUrl = (certNum: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.host}/?verifyCert=${encodeURIComponent(certNum)}`;
    }
    return `https://nkorera.rw/?verifyCert=${encodeURIComponent(certNum)}`;
  };

  // Update certificate title according to category preset
  const handleCategorySelect = (cat: typeof category) => {
    setCategory(cat);
    if (cat === 'student_academic') {
      setCertificateTitle(
        lang === 'Kinyarwanda' ? "ICYEMEZO CY'INDASHYIKIRWA MU MASOMO" :
        lang === 'French' ? "CERTIFICAT D'EXCELLENCE ACADÉMIQUE" :
        lang === 'Swahili' ? "CHETI CHA UMAHIRI WA MASOMO" :
        "CERTIFICATE OF ACADEMIC EXCELLENCE"
      );
    } else if (cat === 'student_discipline') {
      setCertificateTitle(
        lang === 'Kinyarwanda' ? "ICYEMEZO CY'IMYITWARIRE MYIZA" :
        lang === 'French' ? "CERTIFICAT DE MÉRITE ET BONNE CONDUITE" :
        lang === 'Swahili' ? "CHETI CHA NIDHAMU NA UONGOZI BORA" :
        "CERTIFICATE OF MERIT & GOOD DISCIPLINE"
      );
    } else if (cat === 'remedial_progress') {
      setCertificateTitle(
        lang === 'Kinyarwanda' ? "ICYEMEZO CY'IMPASHA BWIGISHO (RLP)" :
        lang === 'French' ? "CERTIFICAT DE PROGRÈS EN REMÉDIATION" :
        lang === 'Swahili' ? "CHETI CHA MAENDELEO YA MASOMO" :
        "CERTIFICATE OF REMEDIAL PROGRESS"
      );
    } else if (cat === 'teacher_cpd') {
      setCertificateTitle(
        lang === 'Kinyarwanda' ? "ICYEMEZO CY'AMAHUGURWA Y'ABARIMU (CPD)" :
        lang === 'French' ? "CERTIFICAT DE FORMATION CONTINUE" :
        lang === 'Swahili' ? "CHETI CHA MAFUNZO YA UALIMU" :
        "PROFESSIONAL DEVELOPMENT CERTIFICATE"
      );
    } else if (cat === 'stem_award') {
      setCertificateTitle(
        lang === 'Kinyarwanda' ? "ICYEMEZO CY'UDUSHYA MURI SAYANSI (STEM)" :
        lang === 'French' ? "PRIX D'EXCELLENCE EN STEM ET INNOVATION" :
        lang === 'Swahili' ? "TUZO YA UMAHIRI WA SAYANSI NA TEKNOLOJIA" :
        "STEM & INNOVATION EXCELLENCE AWARD"
      );
    } else if (cat === 'special_coach') {
      setCertificateTitle(
        lang === 'Kinyarwanda' ? "ICYEMEZO CY'UMUTOZA W'UMWIHARIKO (SPECIAL COACH)" :
        lang === 'French' ? "CERTIFICAT DE COACH SPÉCIAL" :
        lang === 'Swahili' ? "CHETI CHA KOCHA MAALUM" :
        "CERTIFICATE OF SPECIAL COACH"
      );
    } else {
      setCertificateTitle(
        lang === 'Kinyarwanda' ? "ICYEMEZO CY'ICYUBAHIRO" :
        lang === 'French' ? "CERTIFICAT DE RECONNAISSANCE" :
        lang === 'Swahili' ? "CHETI CHA SHUKRANI" :
        "CERTIFICATE OF APPRECIATION"
      );
    }
  };

  // Translation accessor
  const t = CERT_I18N[lang] || CERT_I18N.Kinyarwanda;

  // AI Citation Enhancer
  const handleAiEnhanceCitation = async () => {
    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Write a formal, inspiring certificate citation text in ${lang} language for recipient "${recipientName}" (${recipientRole}) from "${schoolName}". 
Category: ${category}. Certificate Title: "${certificateTitle}".
Write 2-3 formal elegant sentences honoring their achievement. Output ONLY the citation text, nothing else.`
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          setCitationText(data.text.trim());
          setStatusNotice({ type: 'success', text: '✨ Citation generated successfully with AI!' });
          setTimeout(() => setStatusNotice(null), 3000);
          return;
        }
      }
    } catch (e) {
      console.warn("AI citation offline fallback:", e);
    } finally {
      setIsAiGenerating(false);
    }

    // Smart Client Fallback
    const fallbackTemplate = PRESET_CITATIONS[category]?.[lang] || PRESET_CITATIONS.custom[lang];
    const generatedFallback = `${fallbackTemplate.replace('{NAME}', recipientName).replace('{SCHOOL}', schoolName)}`;
    setCitationText(generatedFallback);
    setStatusNotice({ type: 'info', text: '✓ Refreshed citation template!' });
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // Generate / Preview Certificate
  const handleGenerateCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !schoolName.trim()) return;

    const certNum = 'CERT-' + Math.floor(100000 + Math.random() * 900000);

    const newCert: CertificateData = {
      id: 'cert_' + Date.now(),
      createdAt: new Date().toISOString(),
      certificateNumber: certNum,
      recipientName: recipientName.trim(),
      recipientRole: recipientRole.trim(),
      schoolName: schoolName.trim(),
      certificateTitle: certificateTitle.trim(),
      category,
      citationText: citationText.trim(),
      issueDate,
      issuer1Name: issuer1Name.trim(),
      issuer1Title: issuer1Title.trim(),
      issuer2Name: issuer2Name.trim(),
      issuer2Title: issuer2Title.trim(),
      borderStyle,
      language: lang,
      gender,
      recipientPhoto: recipientPhoto || undefined,
      userEmail: user?.email
    };

    setCurrentCert(newCert);

    // Save to history list
    const updated = [newCert, ...savedCertificates.filter(c => c.id !== newCert.id)];
    setSavedCertificates(updated);
    try {
      localStorage.setItem(CERTIFICATE_CACHE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn("Cache error:", err);
    }

    // Save to backend Firestore API asynchronously
    fetch('/api/certificates/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCert)
    }).catch(e => console.warn("Backend certificate save warning:", e));

    setActiveView('preview');
  };

  // Passcode unlock handler
  const handleUnlockPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = adminCodeInput.trim();
    if (['2026', 'NKUNDIMANA', '0781339530', '0724038043', '1234', '5555'].includes(cleanCode.toUpperCase())) {
      setIsUnlockedLocally(true);
      setShowLockModal(false);
      setPasscodeError(null);
      setAdminCodeInput('');
      setStatusNotice({
        type: 'success',
        text: 'Successful Sync byakunze neza! Certificate download permission successfully unlocked.'
      });
    } else {
      setPasscodeError('Passcode/Code unyuzemo si yo! Baza Admin Nkundimana Theogene (0781339530).');
    }
  };

  // PDF Export using html2canvas and jsPDF for guaranteed 1-page A4 landscape file download
  const handleDownloadPDF = async () => {
    if (!isCertDownloadUnlocked) {
      setShowLockModal(true);
      return;
    }
    if (!certPrintRef.current || !currentCert) return;
    setIsExportingPDF(true);

    const replaceNestedParens = (text: string): string => {
      const targets = ['oklch(', 'oklab(', 'color-mix(', 'light-dark(', 'color('];
      let result = text;
      
      for (const target of targets) {
        let index = result.toLowerCase().indexOf(target);
        while (index !== -1) {
          let parenCount = 1;
          let i = index + target.length;
          while (i < result.length && parenCount > 0) {
            if (result[i] === '(') {
              parenCount++;
            } else if (result[i] === ')') {
              parenCount--;
            }
            i++;
          }
          
          if (parenCount === 0) {
            const before = result.substring(0, index);
            const after = result.substring(i);
            result = before + 'rgb(15, 23, 42)' + after;
          } else {
            break;
          }
          index = result.toLowerCase().indexOf(target);
        }
      }
      return result;
    };

    const mainStyleTags = Array.from(document.querySelectorAll('style'));
    const originalStyles = new Map<HTMLStyleElement, string>();
    for (const style of mainStyleTags) {
      if (style.textContent && /(oklch|oklab|color-mix|light-dark|color\()/i.test(style.textContent)) {
        originalStyles.set(style, style.textContent);
        style.textContent = replaceNestedParens(style.textContent);
      }
    }

    try {
      const element = certPrintRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedFrame = clonedDoc.querySelector('.printable-certificate-frame') as HTMLElement;
          if (clonedFrame) {
            clonedFrame.style.width = '1000px';
            clonedFrame.style.height = '707px';
            clonedFrame.style.minWidth = '1000px';
            clonedFrame.style.minHeight = '707px';
            clonedFrame.style.maxWidth = '1000px';
            clonedFrame.style.maxHeight = '707px';
            clonedFrame.style.margin = '0 auto';
            clonedFrame.style.padding = '20px';
            clonedFrame.style.boxSizing = 'border-box';
            clonedFrame.style.overflow = 'hidden';
            clonedFrame.style.borderRadius = '0';
            clonedFrame.style.boxShadow = 'none';
          }

          const styleTags = clonedDoc.querySelectorAll('style');
          styleTags.forEach((styleTag) => {
            if (styleTag.textContent && /(oklch|oklab|color-mix|light-dark|color\()/i.test(styleTag.textContent)) {
              styleTag.textContent = replaceNestedParens(styleTag.textContent);
            }
          });

          const allElems = clonedDoc.querySelectorAll<HTMLElement>('*');
          allElems.forEach((el) => {
            const styleAttr = el.getAttribute('style');
            if (styleAttr && /(oklch|oklab|color-mix|light-dark|color\()/i.test(styleAttr)) {
              el.setAttribute('style', replaceNestedParens(styleAttr));
            }
          });
        },
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // Guaranteed exact A4 Landscape Dimensions: 297mm width by 210mm height on 1 single page
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210, undefined, 'FAST');
      const safeRecipient = (currentCert.recipientName || 'Certificate').replace(/[^a-zA-Z0-9]/g, '_');
      const safeCertNum = (currentCert.certificateNumber || 'Verified').replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`Certificate_${safeRecipient}_${safeCertNum}.pdf`);
    } catch (err) {
      console.error("PDF export error:", err);
      handlePrintCertificate();
    } finally {
      for (const [style, originalText] of originalStyles.entries()) {
        style.textContent = originalText;
      }
      setIsExportingPDF(false);
    }
  };

  // Print function
  const handlePrintCertificate = () => {
    if (!isCertDownloadUnlocked) {
      setShowLockModal(true);
      return;
    }
    document.body.classList.add('print-landscape');
    document.body.classList.remove('print-portrait');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('print-landscape', 'print-portrait');
      }, 1000);
    }, 150);
  };

  const handlePrintQrBadge = () => {
    const isLandscape = qrLayout === 'wallet';
    if (isLandscape) {
      document.body.classList.add('print-landscape');
      document.body.classList.remove('print-portrait');
    } else {
      document.body.classList.add('print-portrait');
      document.body.classList.remove('print-landscape');
    }
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-landscape', 'print-portrait');
    }, 1000);
  };

  // Filter saved certificates
  const filteredCertificates = savedCertificates.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.recipientName.toLowerCase().includes(q) ||
      c.schoolName.toLowerCase().includes(q) ||
      c.certificateTitle.toLowerCase().includes(q) ||
      c.certificateNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* LIME-THEMED HERO HEADER */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-lime-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-lime-500/40 relative overflow-hidden print:hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-lime-400 text-slate-950 rounded-full font-black text-xs shadow-lg shadow-lime-500/30 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Nkorera Education AI ({lang})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Award className="w-8 h-8 text-lime-400 shrink-0" />
              <span>{t.heroTitle}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              {t.heroSub}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveView('create')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeView === 'create'
                  ? 'bg-lime-400 text-slate-950 shadow-lg shadow-lime-500/30 scale-105'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{t.btnNew}</span>
            </button>
            <button
              onClick={() => setActiveView('history')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeView === 'history'
                  ? 'bg-lime-400 text-slate-950 shadow-lg shadow-lime-500/30 scale-105'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Bookmark className="w-4 h-4 text-lime-400" />
              <span>{t.btnHistory} ({savedCertificates.length})</span>
            </button>
            <button
              onClick={() => setActiveView('verify')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeView === 'verify'
                  ? 'bg-lime-400 text-slate-950 shadow-lg shadow-lime-500/30 scale-105'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <QrCode className="w-4 h-4 text-lime-400" />
              <span>{t.btnVerify}</span>
            </button>
            <button
              onClick={() => setActiveView('qr-badge')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeView === 'qr-badge'
                  ? 'bg-lime-400 text-slate-950 shadow-lg shadow-lime-500/30 scale-105'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <QrCode className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{lang === 'Kinyarwanda' ? 'Gukora QR Code 🏷️' : 'Secured QR Badge 🏷️'}</span>
            </button>
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="px-3 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700"
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      </div>

      {/* IMPORTANT NOTICE BANNER (IKITONDERWA) */}
      <div className="bg-gradient-to-r from-amber-500/15 via-red-500/10 to-amber-500/15 border-2 border-amber-500/60 rounded-3xl p-5 shadow-md text-slate-900 print:hidden space-y-2">
        <div className="flex items-center gap-2.5 text-amber-900 font-black text-sm uppercase tracking-wide">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 stroke-[2.5]" />
          <span>{t.noticeTitle}</span>
        </div>
        <p className="text-xs sm:text-sm font-extrabold text-slate-800 leading-relaxed">
          {t.noticeText}
        </p>
      </div>

      {statusNotice && (
        <div className="p-4 bg-lime-400/20 border-2 border-lime-400/60 rounded-2xl text-xs font-bold text-lime-950 flex items-center justify-between shadow-xs animate-in fade-in print:hidden">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-lime-600" />
            <span>{statusNotice.text}</span>
          </span>
          <button onClick={() => setStatusNotice(null)} className="p-1 hover:text-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CREATE CERTIFICATE FORM */}
      {activeView === 'create' && (
        <form onSubmit={handleGenerateCertificate} className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
          {/* Main Controls - Col 1 & 2 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Presets */}
            <div className="bg-white p-5 rounded-3xl border-2 border-lime-200 shadow-sm space-y-3">
              <label className="block text-xs font-extrabold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Medal className="w-4 h-4 text-lime-600" />
                  <span>{t.sec1Category}</span>
                </span>
                <span className="text-[11px] text-lime-700 font-bold bg-lime-100 px-2 py-0.5 rounded-md">Lime Certified</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'student_academic', label: t.catAcademic, icon: '🏆' },
                  { id: 'student_discipline', label: t.catDiscipline, icon: '⭐' },
                  { id: 'remedial_progress', label: t.catRemedial, icon: '📈' },
                  { id: 'teacher_cpd', label: t.catCpd, icon: '🎓' },
                  { id: 'stem_award', label: t.catStem, icon: '🧪' },
                  { id: 'special_coach', label: t.catSpecialCoach, icon: '🥇' },
                  { id: 'custom', label: t.catCustom, icon: '📜' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleCategorySelect(item.id as any)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-1.5 ${
                      category === item.id
                        ? 'bg-gradient-to-br from-lime-50 to-emerald-50 border-lime-500 shadow-md ring-2 ring-lime-400/40'
                        : 'bg-slate-50/80 border-slate-200 hover:border-lime-300'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-xs font-black text-slate-900">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient & School Information */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-lime-600" />
                <span>{t.sec2Recipient}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Photo Upload & Human Avatar Field */}
                <div className="sm:col-span-2 bg-gradient-to-r from-lime-50 to-emerald-50 p-3.5 rounded-2xl border border-lime-200 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-full border-2 border-lime-500 overflow-hidden bg-white shadow-sm flex items-center justify-center">
                      {recipientPhoto ? (
                        <img src={recipientPhoto} alt="Recipient" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-lime-700">
                          <User className="w-7 h-7" />
                          <span className="text-[9px] font-black uppercase">Human</span>
                        </div>
                      )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    <label className="block text-xs font-black text-slate-900 flex items-center justify-center sm:justify-start gap-1.5">
                      <span>{t.labelRecipientPhoto}</span>
                      <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">Verified Person</span>
                    </label>
                    <p className="text-[11px] text-slate-600 font-medium">
                      {t.placeRecipientPhoto}
                    </p>
                    <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-lime-600 hover:bg-lime-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo / Shaka Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 3 * 1024 * 1024) {
                                alert(lang === 'Kinyarwanda' ? 'Foto ntirenze 3MB!' : 'Photo must be under 3MB!');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setRecipientPhoto(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      {recipientPhoto && (
                        <button
                          type="button"
                          onClick={() => setRecipientPhoto('')}
                          className="px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl border border-red-200"
                        >
                          Siba Foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.labelFullName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder={t.placeFullName}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-lime-500 focus:outline-hidden bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.labelRole}
                  </label>
                  <input
                    type="text"
                    value={recipientRole}
                    onChange={(e) => setRecipientRole(e.target.value)}
                    placeholder={t.placeRole}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-lime-500 focus:outline-hidden bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.labelSchool} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder={t.placeSchool}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-lime-500 focus:outline-hidden bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.labelTitle}
                  </label>
                  <input
                    type="text"
                    required
                    value={certificateTitle}
                    onChange={(e) => setCertificateTitle(e.target.value)}
                    placeholder={t.placeTitle}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-black tracking-wide text-slate-900 uppercase focus:ring-2 focus:ring-lime-500 focus:outline-hidden bg-slate-50/50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.labelGender}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'auto', label: t.genderAuto },
                      { id: 'female', label: t.genderFemale },
                      { id: 'male', label: t.genderMale }
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGender(g.id as any)}
                        className={`py-2 px-3 border rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                          gender === g.id
                            ? 'bg-lime-500/10 border-lime-500 text-slate-900 ring-2 ring-lime-400/30'
                            : 'bg-slate-50/50 border-slate-300 text-slate-700 hover:border-lime-400/30'
                        }`}
                      >
                        {g.id === 'female' && <FemaleGraduateSvg className="w-5 h-5" />}
                        {g.id === 'male' && <MaleGraduateSvg className="w-5 h-5" />}
                        {g.id === 'auto' && <Sparkles className="w-3.5 h-3.5 text-lime-600 shrink-0" />}
                        <span>{g.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Citation Text */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {t.labelCitation}
                  </label>
                  <button
                    type="button"
                    onClick={handleAiEnhanceCitation}
                    disabled={isAiGenerating}
                    className="px-3 py-1 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-[11px] rounded-lg shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                    <span>{isAiGenerating ? t.btnAiGenerating : t.btnAiGenerate}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={citationText}
                  onChange={(e) => setCitationText(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium leading-relaxed text-slate-800 focus:ring-2 focus:ring-lime-500 focus:outline-hidden bg-slate-50/50"
                  placeholder={t.placeCitation}
                />
              </div>
            </div>

            {/* Issuers & Signatures */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-lime-600" />
                <span>{t.sec3Signatories}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.labelIssuer1}
                  </label>
                  <input
                    type="text"
                    value={issuer1Name}
                    onChange={(e) => setIssuer1Name(e.target.value)}
                    placeholder={t.placeIssuer1Name}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-lime-500"
                  />
                  <input
                    type="text"
                    value={issuer1Title}
                    onChange={(e) => setIssuer1Title(e.target.value)}
                    placeholder={t.placeIssuer1Title}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-600 mt-1 focus:ring-2 focus:ring-lime-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.labelIssuer2}
                  </label>
                  <input
                    type="text"
                    value={issuer2Name}
                    onChange={(e) => setIssuer2Name(e.target.value)}
                    placeholder={t.placeIssuer2Name}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-lime-500"
                  />
                  <input
                    type="text"
                    value={issuer2Title}
                    onChange={(e) => setIssuer2Title(e.target.value)}
                    placeholder={t.placeIssuer2Title}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-600 mt-1 focus:ring-2 focus:ring-lime-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.labelDate}
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-lime-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.labelLanguage}
                  </label>
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value as LanguageOption)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-lime-500"
                  >
                    <option value="Kinyarwanda">Kinyarwanda</option>
                    <option value="English">English</option>
                    <option value="French">Français</option>
                    <option value="Swahili">Kiswahili</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Design Settings & Action - Col 3 */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-lime-950 text-white p-5 rounded-3xl shadow-lg border border-lime-500/40 space-y-4">
              <h2 className="text-sm font-black text-lime-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-lime-400" />
                <span>{t.secFrameStyle}</span>
              </h2>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'lime_gold_luxury',
                    label: t.styleLimeLabel,
                    desc: t.styleLimeDesc
                  },
                  {
                    id: 'reb_academic',
                    label: t.styleRebLabel,
                    desc: t.styleRebDesc
                  },
                  {
                    id: 'modern_emerald_lime',
                    label: t.styleStemLabel,
                    desc: t.styleStemDesc
                  },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBorderStyle(b.id as any)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      borderStyle === b.id
                        ? 'bg-lime-400/20 border-lime-400 text-white ring-2 ring-lime-400/50'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-lime-400/50'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-lime-400 text-slate-950 font-black shrink-0">
                      <Check className={`w-3.5 h-3.5 ${borderStyle === b.id ? 'opacity-100' : 'opacity-20'}`} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">{b.label}</p>
                      <p className="text-[10px] text-slate-300 leading-tight mt-0.5">{b.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-700/80 space-y-3">
                <div className="p-3 bg-amber-400/20 border border-amber-400/50 rounded-xl text-[11px] font-bold text-amber-200">
                  <p className="font-black text-amber-300">{t.paymentNoticeTitle}</p>
                  <p className="mt-0.5 text-[10px] leading-snug">{t.paymentNoticeText}</p>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-lime-500/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                  id="generate-certificate-btn"
                >
                  <Award className="w-5 h-5 stroke-[2.5]" />
                  <span>{t.btnGenerateCert}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* PREVIEW & PRINT CERTIFICATE VIEW */}
      {activeView === 'preview' && currentCert && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
            <button
              onClick={() => setActiveView('create')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              {t.btnEditForm}
            </button>

            <div className="flex flex-wrap items-center gap-3">
              {!isCertDownloadUnlocked && (
                <span className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-800 text-[11px] font-extrabold rounded-xl flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ingufuri Irakaye (Download Locked)</span>
                </span>
              )}
              <span className="text-[11px] text-slate-500 font-medium hidden md:inline-block">
                {t.printTip}
              </span>
              <button
                onClick={handleDownloadPDF}
                disabled={isExportingPDF}
                className={`px-5 py-2.5 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 hover:scale-105 border disabled:opacity-50 ${
                  isCertDownloadUnlocked
                    ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-800 shadow-slate-950/20'
                    : 'bg-slate-800 hover:bg-slate-900 text-amber-300 border-amber-500/40 shadow-slate-950/20'
                }`}
                id="download-pdf-button"
              >
                {isExportingPDF ? (
                  <RefreshCw className="w-4 h-4 text-lime-400 animate-spin" />
                ) : !isCertDownloadUnlocked ? (
                  <Lock className="w-4 h-4 text-amber-400" />
                ) : (
                  <Download className="w-4 h-4 text-lime-400" />
                )}
                <span>
                  {isExportingPDF
                    ? (lang === 'Kinyarwanda' ? 'Irimo gukorwa PDF...' : 'Generating PDF...')
                    : !isCertDownloadUnlocked
                    ? (lang === 'Kinyarwanda' ? 'Bika nka PDF 🔒 (Yafunzwe)' : 'Download PDF 🔒 (Locked)')
                    : (lang === 'Kinyarwanda' ? 'Bika nka PDF 📥' : 'Download PDF / Save as PDF 📥')}
                </span>
              </button>
              <button
                onClick={handlePrintCertificate}
                className={`px-5 py-2.5 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 hover:scale-105 ${
                  isCertDownloadUnlocked
                    ? 'bg-lime-400 hover:bg-lime-300 text-slate-950'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500'
                }`}
                id="print-certificate-button"
              >
                {!isCertDownloadUnlocked ? (
                  <Lock className="w-4 h-4 text-slate-950" />
                ) : (
                  <Printer className="w-4 h-4" />
                )}
                <span>
                  {!isCertDownloadUnlocked
                    ? (lang === 'Kinyarwanda' ? 'Capa Certificate 🔒' : 'Print Certificate 🔒')
                    : t.btnPrintCert}
                </span>
              </button>
            </div>
          </div>

          {/* LOCK BANNER FOR CLIENT */}
          {!isCertDownloadUnlocked && (
            <div className="bg-slate-900 border-2 border-amber-500 p-4 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg print:hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xl shrink-0 shadow-md">
                  🔒
                </div>
                <div>
                  <h4 className="font-black text-amber-400 text-sm flex items-center gap-2">
                    <span>Ingufuri Irakaye: Download / Print ya Certificate irafunzwe</span>
                  </h4>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    Iyi Certificate yafunzwe n'ingufuri (🔒). Baza Admin (Nkundimana Theogene - 0781339530 / 0724038043) akweshereze cg aguhe Passcode yo kuyikuramo muri systeme!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLockModal(true)}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition-all shrink-0 flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <Key className="w-4 h-4 text-slate-950" />
                <span>Injiza Passcode / Fungura 🔓</span>
              </button>
            </div>
          )}

          {/* PRINTABLE CERTIFICATE CANVAS (A4 Landscape aspect) */}
          <div className="flex justify-center overflow-x-auto p-2">
            <div
              ref={certPrintRef}
              className={`printable-certificate-frame w-[1000px] h-[707px] min-h-[707px] max-h-[707px] bg-white text-slate-900 p-5 relative flex flex-col justify-between shadow-2xl rounded-xl border-[12px] overflow-hidden print:w-[297mm] print:h-[210mm] print:max-w-[297mm] print:max-h-[210mm] print:p-5 print:border-[10px] print:shadow-none print:rounded-none select-text ${
                currentCert.borderStyle === 'lime_gold_luxury'
                  ? 'border-lime-500 border-double ring-8 ring-amber-400/80'
                  : currentCert.borderStyle === 'reb_academic'
                  ? 'border-emerald-800 border-solid ring-8 ring-amber-300'
                  : 'border-slate-900 border-dashed ring-8 ring-lime-400'
              }`}
            >
              {/* Background Luxury Emblem Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <Award className="w-[400px] h-[400px] text-lime-700" />
              </div>

              {/* Decorative Corner Ornaments */}
              <div className="absolute top-3 left-3 w-10 h-10 border-t-4 border-l-4 border-lime-600"></div>
              <div className="absolute top-3 right-3 w-10 h-10 border-t-4 border-r-4 border-lime-600"></div>
              <div className="absolute bottom-3 left-3 w-10 h-10 border-b-4 border-l-4 border-lime-600"></div>
              <div className="absolute bottom-3 right-3 w-10 h-10 border-b-4 border-r-4 border-lime-600"></div>

              {/* Certificate Header */}
              <div className="text-center space-y-1 relative z-10 pt-1">
                <div className="flex items-center justify-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-lime-400 text-slate-950 font-black flex items-center justify-center text-lg shadow-md border-2 border-lime-600">
                    🇷🇼
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest leading-tight">
                      {currentCert.schoolName}
                    </h2>
                    <p className="text-[10px] text-slate-600 font-bold tracking-wider uppercase">
                      {(CERT_I18N[currentCert.language || lang] || t).certCompliantTag}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-800 bg-lime-100 px-3 py-0.5 rounded-full border border-lime-300">
                    {(CERT_I18N[currentCert.language || lang] || t).certRecognitionTag}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-wider mt-1.5 drop-shadow-2xs leading-tight">
                    {currentCert.certificateTitle}
                  </h1>
                </div>
              </div>

              {/* Recipient Citation Body */}
              <div className="text-center space-y-2 my-auto relative z-10 px-6">
                {/* Prominent Visible Human Person Avatar & Verified Badge */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative group inline-block">
                    <div className="w-20 h-20 rounded-full border-4 border-amber-400 p-0.5 bg-gradient-to-tr from-lime-100 via-white to-emerald-100 shadow-md flex items-center justify-center overflow-hidden">
                      {currentCert.recipientPhoto ? (
                        <img
                          src={currentCert.recipientPhoto}
                          alt={currentCert.recipientName}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        (() => {
                          const selectedGender = currentCert.gender || 'auto';
                          const activeGender = selectedGender === 'auto'
                            ? detectGenderFromName(currentCert.recipientName || '')
                            : selectedGender;
                          
                          return activeGender === 'female'
                            ? <FemaleGraduateSvg className="w-16 h-16 drop-shadow-md" />
                            : <MaleGraduateSvg className="w-16 h-16 drop-shadow-md" />;
                        })()
                      )}
                    </div>
                    {/* Official Verified Person Badge Icon */}
                    <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 border-2 border-white shadow-md flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full text-[9px] font-black uppercase tracking-wider shadow-2xs">
                    <UserCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>VERIFIED RECIPIENT • UMUNTU W'UMWIMERERE</span>
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-600 italic">
                  {(CERT_I18N[currentCert.language || lang] || t).certPresentedTo}
                </p>

                <div className="border-b-2 border-lime-500 pb-1 max-w-xl mx-auto">
                  <h3 className="text-2xl sm:text-3xl font-black text-emerald-950 font-serif tracking-tight leading-none">
                    {currentCert.recipientName || 'Mukamana Angelique'}
                  </h3>
                  {currentCert.recipientRole && (
                    <p className="text-[11px] font-bold text-lime-800 uppercase tracking-wide mt-1">
                      {currentCert.recipientRole}
                    </p>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-800 font-serif leading-relaxed max-w-2xl mx-auto italic px-2">
                  "{currentCert.citationText || 'For outstanding performance and dedication.'}"
                </p>
              </div>

              {/* Certificate Footer / Signatures & Seal */}
              <div className="grid grid-cols-4 items-end pt-3 border-t border-slate-200 relative z-10 gap-2">
                {/* Signatory 1 */}
                <div className="text-center space-y-0.5">
                  <div className="h-8 flex items-center justify-center">
                    <span className="font-serif italic text-slate-400 text-[11px]">
                      {(CERT_I18N[currentCert.language || lang] || t).certSignatureLabel}
                    </span>
                  </div>
                  <div className="border-t border-slate-400 pt-0.5 max-w-[170px] mx-auto">
                    <p className="text-xs font-black text-slate-900 leading-tight">{currentCert.issuer1Name || 'NKUNDIMANA Theogene'}</p>
                    <p className="text-[10px] text-slate-600 font-semibold leading-tight">{currentCert.issuer1Title || 'Head Teacher / Director'}</p>
                  </div>
                </div>

                {/* Central Gold & Lime Ribbon Seal */}
                <div className="flex flex-col items-center justify-center space-y-0.5">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-lime-400 via-amber-300 to-lime-500 border-2 border-white shadow-lg flex items-center justify-center text-slate-950 font-black relative">
                    <Award className="w-7 h-7 text-slate-950" />
                    <span className="absolute -bottom-1.5 px-2 py-0.5 bg-slate-900 text-lime-400 text-[7px] font-black rounded-md tracking-wider whitespace-nowrap">
                      {(CERT_I18N[currentCert.language || lang] || t).certOfficialSeal}
                    </span>
                  </div>
                </div>

                {/* Signatory 2 */}
                <div className="text-center space-y-0.5">
                  <div className="h-8 flex items-center justify-center">
                    <span className="font-serif italic text-slate-400 text-[11px]">
                      {(CERT_I18N[currentCert.language || lang] || t).certSignatureLabel}
                    </span>
                  </div>
                  <div className="border-t border-slate-400 pt-0.5 max-w-[170px] mx-auto">
                    <p className="text-xs font-black text-slate-900 leading-tight">{currentCert.issuer2Name || 'Uwimana Marie Rose'}</p>
                    <p className="text-[10px] text-slate-600 font-semibold leading-tight">{currentCert.issuer2Title || 'Director of Studies (DOS)'}</p>
                    <p className="text-[9px] text-slate-500 font-medium pt-0.5 leading-tight">
                      {(CERT_I18N[currentCert.language || lang] || t).certDateLabel} {currentCert.issueDate || new Date().toISOString().split('T')[0]}
                    </p>
                  </div>
                </div>

                {/* Secure Verification QR Code Column (Right Side) */}
                <div className="flex flex-col items-center justify-center space-y-0.5 text-center bg-slate-50/70 p-1.5 rounded-xl border border-slate-200/60 max-w-[150px] ml-auto">
                  <span className="text-[7px] font-black text-emerald-800 uppercase tracking-wider leading-none block">
                    Secured By
                  </span>
                  <span className="text-[8px] font-black text-slate-900 block leading-tight whitespace-nowrap">
                    Nkundimana Theogene
                  </span>
                  <div className="bg-white p-1 rounded-md border border-slate-200 shadow-2xs flex items-center justify-center">
                    <QRCodeSVG 
                      value={getCertVerificationUrl(currentCert.certificateNumber)} 
                      size={40} 
                      level="H"
                    />
                  </div>
                  <span className="text-[7px] font-black text-slate-600 uppercase tracking-wider leading-none block">
                    Scan to Verify
                  </span>
                  <p className="text-[7px] text-slate-500 font-mono leading-none block truncate max-w-full">
                    {currentCert.certificateNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SAVED CERTIFICATES HISTORY */}
      {activeView === 'history' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-lime-600" />
                <span>{t.historyTitle}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.historySub}
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder={t.searchPlace}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-lime-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {filteredCertificates.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Award className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-xs font-bold">{t.emptyHistory}</p>
              <button
                onClick={() => setActiveView('create')}
                className="px-4 py-2 bg-lime-400 text-slate-950 font-black text-xs rounded-xl shadow-xs"
              >
                {t.btnHistoryNew}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-lime-400 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-lime-100 text-lime-900 rounded-md">
                        {cert.certificateNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(cert.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                      {cert.recipientName}
                    </h3>
                    <p className="text-xs font-bold text-lime-800 uppercase">
                      {cert.certificateTitle}
                    </p>
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {cert.schoolName}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setCurrentCert(cert);
                        setActiveView('preview');
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-lime-500 hover:text-slate-950 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t.btnViewPrint}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VERIFICATION PORTAL VIEW */}
      {activeView === 'verify' && (
        <div className="bg-slate-950 text-white p-6 md:p-8 rounded-3xl border border-lime-500/30 shadow-2xl space-y-6 max-w-2xl mx-auto print:hidden">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-lime-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-lime-400/20">
              <QrCode className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-lime-400">{t.verifyTitle}</h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
                {t.verifySub}
              </p>
            </div>
          </div>

          <div className="space-y-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={t.verifyPlace}
                  value={verifySearchNum}
                  onChange={(e) => setVerifySearchNum(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 text-white border border-slate-700 rounded-xl text-sm font-black focus:ring-2 focus:ring-lime-400 focus:outline-hidden"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleVerifySearch(verifySearchNum);
                  }}
                />
              </div>
              <button
                onClick={() => handleVerifySearch(verifySearchNum)}
                disabled={isVerifying}
                className="px-5 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>{t.verifyBtn}</span>}
              </button>
            </div>

            {verificationError && (
              <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">{verificationError}</p>
              </div>
            )}

            {verificationResult && verificationResult.verified && (() => {
              const verificationUrl = verificationResult.isReport
                ? (typeof window !== 'undefined'
                  ? `${window.location.protocol}//${window.location.host}/?verifyCert=${verificationResult.report.reportId}&student=${encodeURIComponent(verificationResult.report.studentName)}&class=${encodeURIComponent(verificationResult.report.studentClass)}&school=${encodeURIComponent(verificationResult.report.schoolName)}&term=${encodeURIComponent(verificationResult.report.term)}&isReport=true`
                  : `https://nkorera.rw/?verifyCert=${verificationResult.report.reportId}`)
                : getCertVerificationUrl(verificationResult.certificate?.certificateNumber || verificationResult.certificateNumber);

              return (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  {verificationResult.isReport ? (
                    /* STUDENT REPORT RESULT */
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs">✓</div>
                          <span className="font-black text-emerald-300 tracking-wide uppercase">
                            {lang === 'Kinyarwanda' ? 'YEMEJE RAPORO Y\'AMASOMO' : 'VERIFIED STUDENT REPORT CARD'}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed font-serif italic">
                          {lang === 'Kinyarwanda'
                            ? 'Iyi raporo y\'amasomo y\'umunyeshuri yashyizweho umukono n\'umuyobozi w\'ishuri kandi iremewe mu buryo bw\'amategeko.'
                            : 'This academic report sheet has been digitally certified, signed and logged securely under Nkorera Education ledgers.'}
                        </p>
                      </div>

                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs border-b border-slate-800 pb-3">
                          <div>
                            <span className="text-slate-500 font-bold block text-[10px] uppercase">Report ID</span>
                            <span className="font-mono font-black text-amber-400">{verificationResult.report.reportId}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold block text-[10px] uppercase">Academic Term</span>
                            <span className="font-bold text-slate-200">{verificationResult.report.term}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold block text-[10px] uppercase">Student Name</span>
                            <span className="font-black text-white text-sm">{verificationResult.report.studentName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold block text-[10px] uppercase">Class / Grade</span>
                            <span className="font-bold text-slate-300">{verificationResult.report.studentClass}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-500 font-bold block text-[10px] uppercase">School Name</span>
                            <span className="font-black text-lime-400 uppercase">{verificationResult.report.schoolName}</span>
                          </div>
                        </div>

                        <div className="text-xs space-y-2">
                          <div>
                            <span className="text-slate-500 font-bold block text-[10px] uppercase">{t.verifierTitle}</span>
                            <p className="font-black text-slate-200">{verificationResult.verifier}</p>
                            <p className="text-[10px] text-slate-400">{verificationResult.issuerRole}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ORIGINAL CERTIFICATE RESULT */
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs">✓</div>
                          <span className="font-black text-emerald-300 tracking-wide">{t.verifiedBadge}</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed font-serif italic">
                          {t.verifiedSub}
                        </p>
                      </div>

                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs border-b border-slate-800 pb-3">
                          <div>
                            <span className="text-slate-500 font-bold block text-[10px] uppercase">Certificate Number</span>
                            <span className="font-mono font-black text-lime-400">{verificationResult.certificate?.certificateNumber || verificationResult.certificateNumber}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold block text-[10px] uppercase">Issue Date</span>
                            <span className="font-bold text-slate-200">{verificationResult.certificate?.issueDate}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold block text-[10px] uppercase">Recipient Name</span>
                            <span className="font-black text-white">{verificationResult.certificate?.recipientName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold block text-[10px] uppercase">School Name</span>
                            <span className="font-bold text-slate-300">{verificationResult.certificate?.schoolName}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-500 font-bold block text-[10px] uppercase">Certificate Title</span>
                            <span className="font-extrabold text-lime-400 uppercase">{verificationResult.certificate?.certificateTitle}</span>
                          </div>
                        </div>

                        <div className="text-xs space-y-2">
                          <div>
                            <span className="text-slate-500 font-bold block text-[10px] uppercase">{t.verifierTitle}</span>
                            <p className="font-black text-slate-200">{verificationResult.verifier}</p>
                            <p className="text-[10px] text-slate-400">{verificationResult.issuerRole}</p>
                          </div>
                          {verificationResult.certificate && (
                            <div className="flex items-center justify-between text-[11px] pt-1">
                              <span className="text-slate-400">Phone Support: <strong className="text-slate-200">{verificationResult.verifierPhone}</strong></span>
                              <button
                                onClick={() => {
                                  setCurrentCert(verificationResult.certificate);
                                  setActiveView('preview');
                                }}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-lime-400 font-black rounded-lg transition-all flex items-center gap-1 border border-slate-700"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Certificate</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* QR Code and verification links */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                    <div className="bg-white p-2 rounded-lg shrink-0">
                      <QRCodeSVG value={verificationUrl} size={80} />
                    </div>
                    <div className="space-y-2 text-center sm:text-left flex-1">
                      <p className="text-xs font-bold text-slate-300">Official Verification Link</p>
                      <p className="text-[10px] text-slate-500 font-mono break-all bg-slate-950 p-2 rounded-md border border-slate-800/60 max-w-md font-sans">
                        {verificationUrl}
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(verificationUrl);
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 2000);
                          }}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg flex items-center gap-1 border border-slate-700"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                        </button>
                        <a
                          href={verificationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-lime-400/20 hover:bg-lime-400/30 text-lime-400 text-[10px] font-bold rounded-lg flex items-center gap-1 border border-lime-400/30"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open Link</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {activeView === 'qr-badge' && (() => {
        // Compute active QR url based on qrType
        let badgeUrl = '';
        let badgeTitle = '';
        let badgeSubtitle = '';
        let badgeName = '';
        let badgeOrg = '';
        let badgeMetaLabel1 = '';
        let badgeMetaValue1 = '';
        let badgeMetaLabel2 = '';
        let badgeMetaValue2 = '';

        if (qrType === 'certificate') {
          const selectedCert = savedCertificates.find(c => c.id === selectedCertId) || savedCertificates[0];
          if (selectedCert) {
            badgeUrl = getCertVerificationUrl(selectedCert.certificateNumber);
            badgeTitle = selectedCert.certificateTitle;
            badgeSubtitle = lang === 'Kinyarwanda' ? 'Icyemezo Cyizewe mu buryo bw\'Ikoranabuhanga' : 'Digitally Verified Official Certificate';
            badgeName = selectedCert.recipientName;
            badgeOrg = selectedCert.schoolName;
            badgeMetaLabel1 = lang === 'Kinyarwanda' ? 'Nimero' : 'Cert ID';
            badgeMetaValue1 = selectedCert.certificateNumber;
            badgeMetaLabel2 = lang === 'Kinyarwanda' ? 'Itariki' : 'Date';
            badgeMetaValue2 = selectedCert.issueDate;
          } else {
            badgeTitle = lang === 'Kinyarwanda' ? 'Gukora QR Code ya Certificate' : 'Certificate QR Creator';
            badgeSubtitle = lang === 'Kinyarwanda' ? 'Nta certificate n\'imwe urabika.' : 'No saved certificates found.';
          }
        } else if (qrType === 'report') {
          badgeUrl = typeof window !== 'undefined'
            ? `${window.location.protocol}//${window.location.host}/?verifyCert=${qrReportId}&student=${encodeURIComponent(qrStudentName)}&class=${encodeURIComponent(qrStudentClass)}&school=${encodeURIComponent(qrSchoolName)}&term=${encodeURIComponent(qrTerm)}&isReport=true`
            : `https://nkorera.rw/?verifyCert=${qrReportId}&student=${encodeURIComponent(qrStudentName)}&class=${encodeURIComponent(qrStudentClass)}&school=${encodeURIComponent(qrSchoolName)}&term=${encodeURIComponent(qrTerm)}&isReport=true`;
          badgeTitle = lang === 'Kinyarwanda' ? 'RAPORO Y\'AMASOMO CYIZUWE' : 'VERIFIED STUDENT EVALUATION REPORT';
          badgeSubtitle = lang === 'Kinyarwanda' ? 'Scan kugira ngo ugenzure amanota n\'imyitwarire' : 'Scan to view certified grades and conduct logs';
          badgeName = qrStudentName;
          badgeOrg = qrSchoolName;
          badgeMetaLabel1 = lang === 'Kinyarwanda' ? 'Nimero ya Raporo' : 'Report ID';
          badgeMetaValue1 = qrReportId;
          badgeMetaLabel2 = lang === 'Kinyarwanda' ? 'Igihe/Igihembwe' : 'Term';
          badgeMetaValue2 = qrTerm;
        } else {
          badgeUrl = qrCustomUrl;
          badgeTitle = qrCustomTitle;
          badgeSubtitle = qrCustomSub;
          badgeName = lang === 'Kinyarwanda' ? 'Imfashanyigisho / Link ihuriweho' : 'Digital Class Resource / Directory';
          badgeOrg = qrSchoolName;
          badgeMetaLabel1 = 'Category';
          badgeMetaValue1 = lang === 'Kinyarwanda' ? 'Guhuza Isano' : 'Digital Media Sharing';
          badgeMetaLabel2 = 'Link Type';
          badgeMetaValue2 = 'Direct URL QR';
        }

        // Action handler to save student report QR codes locally so that parents can scan them 
        const handleSaveReportQr = () => {
          if (qrType === 'report') {
            const newReport = {
              reportId: qrReportId,
              studentName: qrStudentName.trim(),
              studentClass: qrStudentClass.trim(),
              schoolName: qrSchoolName.trim(),
              term: qrTerm.trim(),
              createdAt: new Date().toISOString()
            };
            
            const updated = [newReport, ...savedReports.filter(r => r.reportId !== qrReportId)];
            setSavedReports(updated);
            try {
              localStorage.setItem('nkorera_saved_reports', JSON.stringify(updated));
            } catch (err) {
              console.warn("localStorage error:", err);
            }
            
            setStatusNotice({ type: 'success', text: lang === 'Kinyarwanda' ? '✨ Raporo yoherejwe neza mu bubiko! Urashobora kuyigenzura.' : '✨ Student report saved to secure ledger!' });
            setTimeout(() => setStatusNotice(null), 3000);
          }
        };

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
            {/* LEFT CONFIGURATION PANEL - Hide during print */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 print:hidden">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-lime-600" />
                  <span>{lang === 'Kinyarwanda' ? 'Gutunganya QR Code n\'Inyandiko' : 'Printed QR Media Customizer'}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-medium">
                  {lang === 'Kinyarwanda' 
                    ? 'Hanga QR Code ku buryo bworoshye uyishyire kuri certificate, imfashanyigisho cg raporo zanditse'
                    : 'Customize, style, and generate printable high-security QR codes for student report cards or paper certificates.'}
                </p>
              </div>

              {/* SEGMENT TYPE SELECTOR */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  {lang === 'Kinyarwanda' ? '1. Hitamo Ubwoko bwa QR' : '1. Select Media Type'}
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  {[
                    { id: 'certificate', label: lang === 'Kinyarwanda' ? 'Certificate' : 'Certificate', icon: '🎓' },
                    { id: 'report', label: lang === 'Kinyarwanda' ? 'Raporo' : 'Report', icon: '📊' },
                    { id: 'custom', label: lang === 'Kinyarwanda' ? 'Cyihariye' : 'Custom', icon: '🔗' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setQrType(t.id as any)}
                      className={`py-2 px-1 rounded-lg text-[10px] font-black transition-all flex flex-col items-center gap-1 ${
                        qrType === t.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* DYNAMIC FORM ACCORDING TO TYPE */}
              {qrType === 'certificate' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {lang === 'Kinyarwanda' ? 'Hitamo Certificate mu bubiko' : 'Select From Saved Certificates'}
                    </label>
                    {savedCertificates.length === 0 ? (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 space-y-1.5">
                        <p>⚠️ Nta certificate urakora ngo uyibike.</p>
                        <button
                          type="button"
                          onClick={() => setActiveView('create')}
                          className="px-3 py-1 bg-slate-900 hover:bg-lime-500 hover:text-slate-950 text-white text-[10px] rounded-lg transition-all"
                        >
                          Hanga imwe mbere
                        </button>
                      </div>
                    ) : (
                      <select
                        value={selectedCertId}
                        onChange={(e) => setSelectedCertId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-lime-500 focus:outline-hidden"
                      >
                        <option value="">-- Hitamo imwe hano --</option>
                        {savedCertificates.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.recipientName} ({c.certificateNumber}) - {c.certificateTitle.slice(0, 20)}...
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}

              {qrType === 'report' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Izina ry'Umunyeshuri (Student Name)</label>
                      <input
                        type="text"
                        value={qrStudentName}
                        onChange={(e) => setQrStudentName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Igihembwe/Igihe (Term/Period)</label>
                      <input
                        type="text"
                        value={qrTerm}
                        onChange={(e) => setQrTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                        placeholder="2026 - Term 2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Ishuri (Class / Grade)</label>
                      <input
                        type="text"
                        value={qrStudentClass}
                        onChange={(e) => setQrStudentClass(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                        placeholder="Primary 6 A"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Raporo ID (Verify Code)</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={qrReportId}
                          onChange={(e) => setQrReportId(e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold uppercase font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setQrReportId('REP-' + Math.floor(100000 + Math.random() * 900000))}
                          className="px-2.5 bg-slate-100 border border-slate-300 rounded-xl hover:bg-slate-200"
                        >
                          🔄
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Izina ry'Ikigo (School Name)</label>
                    <input
                      type="text"
                      value={qrSchoolName}
                      onChange={(e) => setQrSchoolName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveReportQr}
                    className="w-full py-2 bg-slate-900 hover:bg-emerald-600 text-white hover:text-white font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'Kinyarwanda' ? 'Bika mu Masezerano ya Raporo' : 'Seal & Save Student Report QR'}</span>
                  </button>
                </div>
              )}

              {qrType === 'custom' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Custom Destination URL</label>
                    <input
                      type="url"
                      value={qrCustomUrl}
                      onChange={(e) => setQrCustomUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold font-mono text-lime-700"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Main Title / Purpose</label>
                    <input
                      type="text"
                      value={qrCustomTitle}
                      onChange={(e) => setQrCustomTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Secondary Instructions</label>
                    <input
                      type="text"
                      value={qrCustomSub}
                      onChange={(e) => setQrCustomSub(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600"
                    />
                  </div>
                </div>
              )}

              {/* AESTHETIC STYLING SECTIONS */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    {lang === 'Kinyarwanda' ? '2. Guhitamo Ibara rya Frame' : '2. Color Theme'}
                  </label>
                  <div className="flex gap-2">
                    {[
                      { hex: '#059669', name: 'Emerald', bg: 'bg-emerald-600' },
                      { hex: '#d97706', name: 'Luxury Gold', bg: 'bg-amber-600' },
                      { hex: '#2563eb', name: 'Royal Blue', bg: 'bg-blue-600' },
                      { hex: '#dc2626', name: 'Ruby Red', bg: 'bg-red-600' },
                      { hex: '#1e293b', name: 'Deep Slate', bg: 'bg-slate-800' }
                    ].map(c => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setQrColor(c.hex)}
                        title={c.name}
                        className={`w-8 h-8 rounded-full ${c.bg} transition-all border-2 ${
                          qrColor === c.hex ? 'scale-115 ring-2 ring-lime-400 ring-offset-2' : 'border-transparent hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    {lang === 'Kinyarwanda' ? '3. Imiterere y\'urupapuro' : '3. Print Layout Size'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'flyer', label: lang === 'Kinyarwanda' ? 'Inyandiko nini (Flyer)' : 'Flyer (4x6)', icon: '📄' },
                      { id: 'sticker', label: lang === 'Kinyarwanda' ? 'Sticker y\'Igitabo' : 'Sticker (3x3)', icon: '🏷️' },
                      { id: 'wallet', label: lang === 'Kinyarwanda' ? 'Agakarita gatoya' : 'Wallet Card', icon: '💳' }
                    ].map(lay => (
                      <button
                        key={lay.id}
                        type="button"
                        onClick={() => setQrLayout(lay.id as any)}
                        className={`p-2.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between gap-1 ${
                          qrLayout === lay.id
                            ? 'bg-slate-50 border-slate-900 shadow-xs'
                            : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-base">{lay.icon}</span>
                        <span className="text-[9px] font-black leading-tight text-slate-950">{lay.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="border-t border-slate-100 pt-4 flex gap-2.5">
                <button
                  type="button"
                  onClick={handlePrintQrBadge}
                  disabled={!badgeUrl}
                  className="flex-1 py-3 bg-lime-400 hover:bg-lime-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-lime-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Printer className="w-4 h-4 shrink-0 stroke-[2.5]" />
                  <span>{lang === 'Kinyarwanda' ? 'CAPA URUPAPURO' : 'PRINT QR MEDIA'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (badgeUrl) {
                      navigator.clipboard.writeText(badgeUrl);
                      setStatusNotice({ type: 'success', text: '✓ Verification URL copied to clipboard!' });
                      setTimeout(() => setStatusNotice(null), 3000);
                    }
                  }}
                  disabled={!badgeUrl}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Copy className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>

            {/* RIGHT PRINTABLE CANVAS PREVIEW */}
            <div className="lg:col-span-7 flex items-center justify-center bg-slate-100 p-4 sm:p-8 rounded-3xl border border-slate-200 min-h-[480px] print:p-0 print:bg-white print:border-none">
              {!badgeUrl ? (
                <div className="text-center text-slate-400 max-w-sm space-y-3 print:hidden">
                  <QrCode className="w-16 h-16 mx-auto stroke-[1.5] text-slate-300 animate-bounce" />
                  <p className="text-xs font-extrabold">
                    {lang === 'Kinyarwanda' 
                      ? 'Hitamo certificate cyangwa wuzure amakuru ya raporo kugira ngo ubone uko QR Code igaragara'
                      : 'Please configure report parameters or select a certificate from the left menu to load the secure verification canvas.'}
                  </p>
                </div>
              ) : (
                <div 
                  id="qr-print-frame"
                  style={{ borderColor: qrColor }}
                  className={`bg-white text-slate-900 border-[12px] flex flex-col justify-between shadow-xl transition-all font-sans relative select-text
                    ${qrLayout === 'flyer' ? 'w-[420px] h-[580px] p-8 rounded-3xl layout-flyer' : ''}
                    ${qrLayout === 'sticker' ? 'w-[320px] h-[320px] p-5 rounded-2xl border-[8px] layout-sticker' : ''}
                    ${qrLayout === 'wallet' ? 'w-[360px] h-[220px] p-4 rounded-xl border-[6px] layout-wallet' : ''}
                    print:w-full print:h-screen print:border-[16px] print:shadow-none print:rounded-none print:m-0 print:p-12
                  `}
                >
                  {/* Decorative Security Grids */}
                  <div className="absolute inset-0 bg-radial-gradient from-transparent to-slate-50/20 opacity-50 pointer-events-none rounded-inner"></div>

                  {/* FLYER LAYOUT */}
                  {qrLayout === 'flyer' && (
                    <>
                      {/* Header */}
                      <div className="text-center space-y-1.5 border-b pb-4 relative">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Official Verification Media
                        </span>
                        <h3 className="font-extrabold text-sm text-slate-900 leading-tight tracking-tight uppercase" style={{ color: qrColor }}>
                          {badgeOrg || 'NKORERA EDUCATION'}
                        </h3>
                        <p className="text-[11px] font-black text-slate-600 uppercase max-w-xs mx-auto">
                          {badgeTitle}
                        </p>
                        <div className="w-2.5 h-2.5 rounded-full absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-2 bg-white" style={{ borderColor: qrColor }}></div>
                      </div>

                      {/* Middle - Student Name & Details */}
                      <div className="text-center py-4 space-y-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Registered Recipient</span>
                          <h4 className="text-lg font-black text-slate-900 tracking-tight">{badgeName}</h4>
                        </div>

                        <div className="flex justify-center items-center gap-3">
                          <div className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-center">
                            <span className="text-[9px] text-slate-400 block font-bold leading-none">{badgeMetaLabel1}</span>
                            <span className="text-xs font-black text-slate-800 leading-normal font-mono">{badgeMetaValue1}</span>
                          </div>
                          <div className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-center">
                            <span className="text-[9px] text-slate-400 block font-bold leading-none">{badgeMetaLabel2}</span>
                            <span className="text-xs font-black text-slate-800 leading-normal">{badgeMetaValue2}</span>
                          </div>
                        </div>
                      </div>

                      {/* Main QR Code Block */}
                      <div className="flex flex-col items-center justify-center py-2 space-y-2 relative">
                        <div className="p-3 bg-white rounded-2xl border-2 shadow-sm relative" style={{ borderColor: qrColor }}>
                          <QRCodeSVG 
                            value={badgeUrl} 
                            size={120} 
                            level="H" 
                            fgColor="#0f172a" 
                            includeMargin={false}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          Scan with Mobile Camera to Verify
                        </span>
                      </div>

                      {/* Bottom Footer Details */}
                      <div className="border-t pt-4 text-center space-y-2">
                        <p className="text-[9px] text-slate-500 font-bold leading-normal italic">
                          "{badgeSubtitle}"
                        </p>
                        <div className="flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-wider">
                          <span>Nkundimana Theogene</span>
                          <span className="text-slate-300">|</span>
                          <span>Secure Ledger Signed</span>
                          <span className="text-slate-300">|</span>
                          <span>Nkorera AI</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* STICKER LAYOUT */}
                  {qrLayout === 'sticker' && (
                    <>
                      <div className="text-center space-y-1">
                        <h3 className="font-extrabold text-[11px] uppercase tracking-wider truncate" style={{ color: qrColor }}>
                          {badgeOrg || 'NKORERA EDUCATION'}
                        </h3>
                        <p className="text-[12px] font-black text-slate-900 truncate">
                          {badgeName}
                        </p>
                      </div>

                      <div className="flex flex-col items-center py-1">
                        <div className="p-2 bg-white rounded-xl border shadow-xs" style={{ borderColor: qrColor }}>
                          <QRCodeSVG value={badgeUrl} size={90} level="H" fgColor="#0f172a" />
                        </div>
                        <span className="text-[8px] text-slate-400 font-bold uppercase mt-1">
                          {badgeMetaLabel1}: {badgeMetaValue1}
                        </span>
                      </div>

                      <div className="text-center border-t pt-1.5 flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        <span>{badgeMetaValue2}</span>
                        <span className="px-1.5 py-0.5 rounded-sm text-white" style={{ backgroundColor: qrColor }}>VERIFIED REPORT</span>
                      </div>
                    </>
                  )}

                  {/* WALLET CARD LAYOUT */}
                  {qrLayout === 'wallet' && (
                    <div className="flex h-full gap-4 items-center">
                      <div className="flex-1 space-y-2 flex flex-col justify-between h-full">
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider leading-none block">
                            Academic Verification Pass
                          </span>
                          <h4 className="text-[13px] font-black text-slate-900 tracking-tight uppercase truncate" style={{ color: qrColor }}>
                            {badgeOrg || 'NKORERA EDUCATION'}
                          </h4>
                          <p className="text-[11px] font-bold text-slate-800 tracking-tight leading-tight line-clamp-1">
                            {badgeName}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-[8px]">
                          <div>
                            <span className="text-slate-400 font-bold block">{badgeMetaLabel1}</span>
                            <span className="font-black text-slate-800 font-mono truncate block">{badgeMetaValue1}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold block">{badgeMetaLabel2}</span>
                            <span className="font-black text-slate-800 block">{badgeMetaValue2}</span>
                          </div>
                        </div>

                        <div className="text-[7px] text-slate-400 font-extrabold uppercase tracking-widest">
                          Secured by Nkundimana Theogene
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-center justify-center space-y-1.5 border-l pl-4 h-full">
                        <div className="p-1.5 bg-white rounded-lg border" style={{ borderColor: qrColor }}>
                          <QRCodeSVG value={badgeUrl} size={70} level="H" fgColor="#0f172a" />
                        </div>
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-wider">SCAN TO INSPECT</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}
      {/* LOCK / PASSCODE UNLOCK MODAL */}
      {showLockModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-amber-500 text-white p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl relative space-y-6">
            <button
              onClick={() => {
                setShowLockModal(false);
                setPasscodeError(null);
              }}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-amber-500/20 border-2 border-amber-500 text-amber-400 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-lg shadow-amber-500/20">
                🔒
              </div>
              <h3 className="text-xl font-black text-white tracking-wide">
                Ingufuri Irakaye (Download Locked 🔒)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                Ntabwo wemerewe gukura (download/print) iyi Certificate muri systeme kuko yafungiwe n'ingufuri.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold">
                <ShieldCheck className="w-4 h-4" />
                <span>Icyitonderwa no kuza guhabwa uburenganzira:</span>
              </div>
              <p className="text-slate-300 leading-normal">
                Vugana na Admin w'urubuga <strong>Nkundimana Theogene</strong> akweshereze cyangwa aguhe uburenganzira bwo gukura (download) iyi certificate.
              </p>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700 font-black text-lime-400 space-y-1">
                <div>📞 Mobile Money / Phone: 0781339530 / 0724038043</div>
                <div className="text-[11px] text-slate-400 font-medium">Izina: Nkundimana Theogene</div>
              </div>
            </div>

            <form onSubmit={handleUnlockPasscode} className="space-y-3 pt-1">
              <label className="block text-xs font-bold text-slate-300">
                Niba Admin aguhaye Passcode / Code yo kuyifungura, yinjize hano:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={adminCodeInput}
                  onChange={(e) => setAdminCodeInput(e.target.value)}
                  placeholder="Injiza Passcode hano..."
                  className="flex-1 bg-slate-950 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md active:scale-95 shrink-0 flex items-center gap-1"
                >
                  <Key className="w-4 h-4 text-slate-950" />
                  <span>Fungura 🔓</span>
                </button>
              </div>
              {passcodeError && (
                <p className="text-xs font-bold text-rose-400 bg-rose-950/60 p-2 rounded-xl border border-rose-800">
                  {passcodeError}
                </p>
              )}
            </form>

            <div className="text-center pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setShowLockModal(false);
                  setPasscodeError(null);
                }}
                className="text-xs text-slate-400 hover:text-white font-bold"
              >
                Funga iki kiganza (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
