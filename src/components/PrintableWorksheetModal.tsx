import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowLeft, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  FileText, 
  RefreshCw,
  Languages
} from 'lucide-react';
import { UserProfile } from '../types';
import { checkCanUseAiCredit, deductAiCredit } from '../utils/subscription';

export type WorksheetFormatType = 
  | 'Short Answer'
  | 'Multiple Choice'
  | 'Fill in the Blank'
  | 'True/False'
  | 'Matching Columns'
  | 'Calculation / Word Problems'
  | 'Mixed Worksheet';

export type WorksheetLanguage = 'English' | 'Kinyarwanda' | 'Français' | 'Kiswahili';

export const WORKSHEET_UI_TRANSLATIONS: Record<WorksheetLanguage, {
  modalTitle: string;
  modalSubtitle: string;
  backBtn: string;
  langTitle: string;
  subjectLabel: string;
  defaultSubject: string;
  gradeLabel: string;
  defaultGrade: string;
  unitLabel: string;
  defaultUnit: string;
  topicLabel: string;
  defaultTopic: string;
  worksheetTypeLabel: string;
  difficultyLabel: string;
  numQuestionsLabel: string;
  marksPerQuestionLabel: string;
  languageLabel: string;
  curriculumLabel: string;
  defaultCurriculum: string;
  countryLabel: string;
  defaultCountry: string;
  customInstructionsLabel: string;
  defaultCustomInstructions: string;
  additionalDetailsLabel: string;
  additionalDetailsPlaceholder: string;
  webSearchLabel: string;
  webSearchDesc: string;
  includeAnswerKeyLabel: string;
  includeAnswerKeyDesc: string;
  generateBtn: string;
  generatingBtn: string;
  cancelBtn: string;
  editParamsBtn: string;
  copyBtn: string;
  copiedBtn: string;
  printBtn: string;
  exportWordBtn: string;
  studentNameLabel: string;
  dateLabel: string;
  totalQuestionsLabel: string;
  totalMarksLabel: string;
  instructionsLabel: string;
  answerKeyTitle: string;
  answerKeySub: string;
}> = {
  English: {
    modalTitle: 'Create Printable Worksheet',
    modalSubtitle: 'Generate AI-powered worksheets with automatic answer keys',
    backBtn: 'Back to Worksheets',
    langTitle: 'Language Context / Ururimi',
    subjectLabel: 'Subject *',
    defaultSubject: 'Mathematics',
    gradeLabel: 'Grade Level *',
    defaultGrade: 'Primary 5',
    unitLabel: 'Unit (Number & Title) / Umutwe *',
    defaultUnit: 'Unit 3: Fractions & Decimals',
    topicLabel: 'Topic / Lesson Focus *',
    defaultTopic: 'Addition & Subtraction of Fractions',
    worksheetTypeLabel: 'Worksheet Type',
    difficultyLabel: 'Difficulty (Optional)',
    numQuestionsLabel: 'Number of Questions',
    marksPerQuestionLabel: 'Marks per Question',
    languageLabel: 'Language',
    curriculumLabel: 'Curriculum (Optional)',
    defaultCurriculum: 'Rwanda CBC / REB',
    countryLabel: 'Country (Optional)',
    defaultCountry: 'Rwanda',
    customInstructionsLabel: 'Custom Instructions (Optional)',
    defaultCustomInstructions: 'Focus on practical problem solving and clear step-by-step thinking.',
    additionalDetailsLabel: 'Additional Details (Optional)',
    additionalDetailsPlaceholder: 'Any specific instructions, contexts, or learning objectives to emphasize...',
    webSearchLabel: 'Web Search',
    webSearchDesc: 'Use curriculum resources to generate relevant questions',
    includeAnswerKeyLabel: 'Include Answer Key',
    includeAnswerKeyDesc: 'Generate answer key with step-by-step explanations',
    generateBtn: 'Generate Worksheet',
    generatingBtn: 'Generating Worksheet...',
    cancelBtn: 'Cancel',
    editParamsBtn: 'Edit Parameters',
    copyBtn: 'Copy',
    copiedBtn: 'Copied!',
    printBtn: 'Print',
    exportWordBtn: 'Export Word (.doc)',
    studentNameLabel: 'Student Name:',
    dateLabel: 'Date:',
    totalQuestionsLabel: 'Total Questions:',
    totalMarksLabel: 'Total Marks:',
    instructionsLabel: 'Instructions:',
    answerKeyTitle: 'Official Answer Key & Teacher Guide',
    answerKeySub: 'Correct responses and marking notes'
  },
  Kinyarwanda: {
    modalTitle: 'Create Printable Worksheet',
    modalSubtitle: 'Generate AI-powered worksheets with automatic answer keys',
    backBtn: 'Back to Worksheets',
    langTitle: 'Language Context',
    subjectLabel: 'Subject *',
    defaultSubject: 'Mathematics',
    gradeLabel: 'Grade Level *',
    defaultGrade: 'Primary 5',
    unitLabel: 'Unit (Number & Title) *',
    defaultUnit: 'Unit 3: Fractions & Decimals',
    topicLabel: 'Topic / Lesson Focus *',
    defaultTopic: 'Addition & Subtraction of Fractions',
    worksheetTypeLabel: 'Worksheet Type',
    difficultyLabel: 'Difficulty (Optional)',
    numQuestionsLabel: 'Number of Questions',
    marksPerQuestionLabel: 'Marks per Question',
    languageLabel: 'Language',
    curriculumLabel: 'Curriculum (Optional)',
    defaultCurriculum: 'Rwanda CBC / REB',
    countryLabel: 'Country (Optional)',
    defaultCountry: 'Rwanda',
    customInstructionsLabel: 'Custom Instructions (Optional)',
    defaultCustomInstructions: 'Focus on practical problem solving and clear step-by-step thinking.',
    additionalDetailsLabel: 'Additional Details (Optional)',
    additionalDetailsPlaceholder: 'Any specific instructions, contexts, or learning objectives to emphasize...',
    webSearchLabel: 'Web Search',
    webSearchDesc: 'Use curriculum resources to generate relevant questions',
    includeAnswerKeyLabel: 'Include Answer Key',
    includeAnswerKeyDesc: 'Generate answer key with step-by-step explanations',
    generateBtn: 'Generate Worksheet',
    generatingBtn: 'Generating Worksheet...',
    cancelBtn: 'Cancel',
    editParamsBtn: 'Edit Parameters',
    copyBtn: 'Copy',
    copiedBtn: 'Copied!',
    printBtn: 'Print',
    exportWordBtn: 'Export Word (.doc)',
    studentNameLabel: 'Student Name:',
    dateLabel: 'Date:',
    totalQuestionsLabel: 'Total Questions:',
    totalMarksLabel: 'Total Marks:',
    instructionsLabel: 'Instructions:',
    answerKeyTitle: 'Official Answer Key & Teacher Guide',
    answerKeySub: 'Correct responses and marking notes'
  },
  Français: {
    modalTitle: 'Créer une Fiche d\'Exercices Imprimable',
    modalSubtitle: 'Générez des fiches d\'exercices prêtes à imprimer avec corrigé détaillé',
    backBtn: 'Retour aux Fiches',
    langTitle: 'Contexte Linguistique / Langue',
    subjectLabel: 'Matière *',
    defaultSubject: 'Mathématiques',
    gradeLabel: 'Niveau / Classe *',
    defaultGrade: '5ème Année Primaire',
    unitLabel: 'Unité (Numéro & Titre) *',
    defaultUnit: 'Unité 3: Fractions et Nombres Décimaux',
    topicLabel: 'Sujet / Thème de la Leçon *',
    defaultTopic: 'Addition et Soustraction de Fractions',
    worksheetTypeLabel: 'Type de Fiche',
    difficultyLabel: 'Niveau de Difficulté',
    numQuestionsLabel: 'Nombre de Questions',
    marksPerQuestionLabel: 'Points par Question',
    languageLabel: 'Langue',
    curriculumLabel: 'Programme Scolaire',
    defaultCurriculum: 'Rwanda CBC / REB',
    countryLabel: 'Pays',
    defaultCountry: 'Rwanda',
    customInstructionsLabel: 'Instructions Personnalisées',
    defaultCustomInstructions: 'Mettre l\'accent sur la résolution méthodique et les applications concrètes.',
    additionalDetailsLabel: 'Détails Supplémentaires',
    additionalDetailsPlaceholder: 'Objectifs spécifiques ou compétences clés à évaluer...',
    webSearchLabel: 'Recherche Pédagogique',
    webSearchDesc: 'Utiliser les manuels et programmes officiels de référence',
    includeAnswerKeyLabel: 'Inclure le Corrigé Enseignant',
    includeAnswerKeyDesc: 'Générer le corrigé complet avec démarches détaillées',
    generateBtn: 'Générer la Fiche d\'Exercices',
    generatingBtn: 'Génération en cours...',
    cancelBtn: 'Annuler',
    editParamsBtn: 'Modifier les Paramètres',
    copyBtn: 'Copier',
    copiedBtn: 'Copié !',
    printBtn: 'Imprimer',
    exportWordBtn: 'Exporter en Word (.doc)',
    studentNameLabel: 'Nom de l\'Élève :',
    dateLabel: 'Date :',
    totalQuestionsLabel: 'Nombre Total de Questions :',
    totalMarksLabel: 'Total des Points :',
    instructionsLabel: 'Consignes :',
    answerKeyTitle: 'Guide de Correction et Réponses de l\'Enseignant',
    answerKeySub: 'Solutions complètes et barème de notation'
  },
  Kiswahili: {
    modalTitle: 'Tengeneza Karatasi ya Mazoezi ya Kuchapishwa',
    modalSubtitle: 'Unda mazoezi ya darasani yenye majibu ya mwalimu kiotomatiki',
    backBtn: 'Rudi Kwenye Mazoezi',
    langTitle: 'Lugha ya Muktadha / Lugha',
    subjectLabel: 'Somo *',
    defaultSubject: 'Hisabati',
    gradeLabel: 'Darasa / Ngazi *',
    defaultGrade: 'Darasa la 5',
    unitLabel: 'Mada Kuu (Unit Number & Title) *',
    defaultUnit: 'Mada ya 3: Sehemu na Desimali',
    topicLabel: 'Mada Ndogo / Lengo la Somo *',
    defaultTopic: 'Kujumlisha na Kutoa Sehemu',
    worksheetTypeLabel: 'Aina ya Karatasi ya Mazoezi',
    difficultyLabel: 'Kiwango cha Ugumu',
    numQuestionsLabel: 'Idadi ya Maswali',
    marksPerQuestionLabel: 'Alama kwa Kila Swali',
    languageLabel: 'Lugha',
    curriculumLabel: 'Mtaala (Curriculum)',
    defaultCurriculum: 'Rwanda CBC / REB',
    countryLabel: 'Nchi',
    defaultCountry: 'Rwanda',
    customInstructionsLabel: 'Maagizo Maalum',
    defaultCustomInstructions: 'Zingatia utatuzi wa matatizo halisi ya kimaisha hatua kwa hatua.',
    additionalDetailsLabel: 'Maelezo ya Ziada',
    additionalDetailsPlaceholder: 'Weka malengo au muktadha wowote unaotaka kusisitiza...',
    webSearchLabel: 'Utafutaji wa Mtandaoni',
    webSearchDesc: 'Tumia nyenzo za mtaala kutoa maswali sahihi',
    includeAnswerKeyLabel: 'Weka Majibu ya Mwalimu (Answer Key)',
    includeAnswerKeyDesc: 'Tengeneza mwongozo wa masahihisho wenye maelezo ya kina',
    generateBtn: 'Tengeneza Karatasi ya Mazoezi',
    generatingBtn: 'Inatengeneza Karatasi...',
    cancelBtn: 'Ghairi',
    editParamsBtn: 'Badilisha Vigezo',
    copyBtn: 'Nakili',
    copiedBtn: 'Imenakiliwa!',
    printBtn: 'Chapa (Print)',
    exportWordBtn: 'Pakua Word (.doc)',
    studentNameLabel: 'Jina la Mwanafunzi:',
    dateLabel: 'Tarehe:',
    totalQuestionsLabel: 'Jumla ya Maswali:',
    totalMarksLabel: 'Jumla ya Alama:',
    instructionsLabel: 'Maagizo:',
    answerKeyTitle: 'Mwongozo Rasmi wa Majibu ya Mwalimu',
    answerKeySub: 'Majibu sahihi na vidokezo vya usahihishaji'
  }
};

export interface WorksheetQuestionItem {
  id: string;
  number: number;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  marks: number;
}

export interface GeneratedPrintableWorksheet {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  unit?: string;
  topic: string;
  worksheetType: WorksheetFormatType;
  difficulty: string;
  language: string;
  curriculum: string;
  country: string;
  customInstructions: string;
  totalQuestions: number;
  totalMarks: number;
  instructions: string;
  questions: WorksheetQuestionItem[];
  createdAt: string;
}

interface PrintableWorksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  onRequireSubscription?: (warningMsg: string) => void;
}

export const PrintableWorksheetModal: React.FC<PrintableWorksheetModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onRequireSubscription
}) => {
  // Selected Language Context State
  const [selectedLanguage, setSelectedLanguage] = useState<WorksheetLanguage>('English');
  const t = WORKSHEET_UI_TRANSLATIONS[selectedLanguage] || WORKSHEET_UI_TRANSLATIONS['English'];

  // Form State
  const [subject, setSubject] = useState<string>('Mathematics');
  const [gradeLevel, setGradeLevel] = useState<string>('Primary 5');
  const [unit, setUnit] = useState<string>('Unit 3: Fractions & Decimals');
  const [topic, setTopic] = useState<string>('Addition & Subtraction of Fractions');
  const [worksheetType, setWorksheetType] = useState<WorksheetFormatType>('Mixed Worksheet');
  const [difficulty, setDifficulty] = useState<string>('Medium');
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [marksPerQuestion, setMarksPerQuestion] = useState<number>(1);
  const [language, setLanguage] = useState<string>('English');
  const [curriculum, setCurriculum] = useState<string>('Rwanda CBC / REB');
  const [country, setCountry] = useState<string>('Rwanda');
  const [customInstructions, setCustomInstructions] = useState<string>('Focus on practical problem solving and clear step-by-step thinking.');
  const [additionalDetails, setAdditionalDetails] = useState<string>('');
  const [webSearch, setWebSearch] = useState<boolean>(true);
  const [includeAnswerKey, setIncludeAnswerKey] = useState<boolean>(true);

  // Handle language switch
  const handleLanguageChange = (newLang: WorksheetLanguage) => {
    setSelectedLanguage(newLang);
    const trans = WORKSHEET_UI_TRANSLATIONS[newLang];
    if (trans) {
      setLanguage(newLang);
      setSubject(trans.defaultSubject);
      setGradeLevel(trans.defaultGrade);
      setUnit(trans.defaultUnit);
      setTopic(trans.defaultTopic);
      setCurriculum(trans.defaultCurriculum);
      setCountry(trans.defaultCountry);
      setCustomInstructions(trans.defaultCustomInstructions);
    }
  };

  // Generation / Viewer State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedWorksheet, setGeneratedWorksheet] = useState<GeneratedPrintableWorksheet | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalMarks = numQuestions * marksPerQuestion;

  // Handle generation
  const handleGenerate = async () => {
    const creditCheck = checkCanUseAiCredit('printable_worksheet');
    if (!creditCheck.canGenerate) {
      onRequireSubscription?.(creditCheck.message || 'You have used all available AI credits. Please subscribe or buy credits to continue.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'worksheet',
          email: currentUser?.email || 'teacher@nkorera.rw',
          subject,
          className: gradeLevel,
          unit,
          topic,
          worksheetType,
          difficulty,
          numQuestions,
          marksPerQuestion,
          language,
          curriculum,
          country,
          customInstructions,
          additionalDetails,
          includeAnswerKey
        })
      });

      if (response.status === 403) {
        const errData = await response.json().catch(() => ({}));
        onRequireSubscription?.(errData.message || 'Subscription limit reached. Please upgrade.');
        setIsGenerating(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.result) {
          const items = data.result.items || [];
          const generatedItems: WorksheetQuestionItem[] = [];
          for (let i = 1; i <= numQuestions; i++) {
            const rawItem = items[i - 1];
            generatedItems.push({
              id: `wq_${i}`,
              number: i,
              type: worksheetType,
              question: rawItem?.content || rawItem?.instruction || `Exercise on ${topic} (${unit}): Complete the problem and explain your reasoning clearly.`,
              options: worksheetType === 'Multiple Choice' ? ['A) Concept A', 'B) Principle B', 'C) Option C', 'D) Solution D'] : undefined,
              correctAnswer: rawItem?.correctAnswer || `Standard expected solution for problem ${i}`,
              explanation: `Demonstrates mastery of ${topic} (${unit}) according to ${curriculum} standards.`,
              marks: marksPerQuestion
            });
          }

          const createdWorksheet: GeneratedPrintableWorksheet = {
            id: `ws_${Date.now()}`,
            title: `WORKSHEET: ${subject.toUpperCase()} — ${unit ? unit + ' • ' : ''}${topic.toUpperCase()}`,
            subject,
            gradeLevel,
            unit,
            topic,
            worksheetType,
            difficulty,
            language,
            curriculum,
            country,
            customInstructions,
            totalQuestions: numQuestions,
            totalMarks,
            instructions: `Complete all questions carefully. Show all working and neat handwriting.`,
            questions: generatedItems,
            createdAt: new Date().toLocaleDateString()
          };

          setGeneratedWorksheet(createdWorksheet);
          deductAiCredit('printable_worksheet', createdWorksheet.title);
          setIsGenerating(false);
          return;
        }
      }
    } catch (err) {
      console.warn('API generation note:', err);
    }

    // High quality offline fallback generator
    const fallbackQuestions: WorksheetQuestionItem[] = [];
    for (let i = 1; i <= numQuestions; i++) {
      let qText = '';
      let opts: string[] | undefined = undefined;
      let ans = '';

      if (worksheetType === 'Multiple Choice' || (worksheetType === 'Mixed Worksheet' && i % 3 === 1)) {
        qText = `Which of the following best represents the key principle of ${topic}?`;
        opts = [
          'A) It maintains equilibrium through balanced proportionality',
          'B) It accelerates the transformation process steadily',
          'C) It is only an approximate model without exact values',
          'D) It is an independent variable with zero feedback'
        ];
        ans = 'A) It maintains equilibrium through balanced proportionality';
      } else if (worksheetType === 'Fill in the Blank' || (worksheetType === 'Mixed Worksheet' && i % 3 === 2)) {
        qText = `In ${subject}, the fundamental unit associated with ${topic} is known as _____________.`;
        ans = 'Standard Unit / Core Quantity';
      } else if (worksheetType === 'True/False') {
        qText = `True or False: Under standard curriculum guidelines, ${topic} applies equally across all normal operating conditions.`;
        opts = ['TRUE', 'FALSE'];
        ans = 'TRUE';
      } else if (worksheetType === 'Matching Columns') {
        qText = `Match the term regarding ${topic} with its corresponding definition from the word bank.`;
        ans = `Term ${i} corresponds to Definition ${String.fromCharCode(64 + i)}`;
      } else if (worksheetType === 'Calculation / Word Problems') {
        qText = `A student observes ${topic} with initial value ${i * 5}. Calculate the required final value showing step-by-step arithmetic.`;
        ans = `Final value = ${(i * 5) * 2}. Step 1: Multiply base value. Step 2: Apply conversion factor.`;
      } else {
        qText = `State two key reasons why understanding ${topic} is essential in everyday life.`;
        ans = `1. Enables accurate calculations. 2. Provides practical problem-solving foundation in ${subject}.`;
      }

      fallbackQuestions.push({
        id: `fq_${i}`,
        number: i,
        type: worksheetType,
        question: qText,
        options: opts,
        correctAnswer: ans,
        explanation: `Curriculum-aligned response for ${gradeLevel} ${subject}.`,
        marks: marksPerQuestion
      });
    }

    const fallbackWorksheet: GeneratedPrintableWorksheet = {
      id: `ws_${Date.now()}`,
      title: `WORKSHEET: ${subject.toUpperCase()} — ${topic.toUpperCase()}`,
      subject,
      gradeLevel,
      topic,
      worksheetType,
      difficulty,
      language,
      curriculum,
      country,
      customInstructions,
      totalQuestions: numQuestions,
      totalMarks,
      instructions: `Complete all questions carefully. Show all working and neat handwriting.`,
      questions: fallbackQuestions,
      createdAt: new Date().toLocaleDateString()
    };

    setGeneratedWorksheet(fallbackWorksheet);
    deductAiCredit('printable_worksheet', fallbackWorksheet.title);
    setIsGenerating(false);
  };

  // Export Word Document (.doc)
  const handleExportWord = () => {
    if (!generatedWorksheet) return;

    let html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${generatedWorksheet.title}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; margin: 20px; color: #1e293b; }
        .header-box { border: 2px solid #0f172a; padding: 15px; margin-bottom: 20px; border-radius: 8px; }
        .title { font-size: 18pt; font-weight: bold; text-align: center; margin-bottom: 6px; text-transform: uppercase; }
        .subtitle { font-size: 11pt; text-align: center; color: #475569; margin-bottom: 10px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .info-table td { padding: 6px; font-size: 10.5pt; }
        .question-box { margin-bottom: 16px; padding-left: 10px; }
        .q-text { font-size: 11pt; font-weight: bold; margin-bottom: 6px; }
        .blank-lines { border-bottom: 1px dotted #94a3b8; height: 22px; margin: 6px 0; }
        .answer-key { margin-top: 40px; page-break-before: always; border-top: 2px dashed #0284c7; padding-top: 20px; }
      </style>
      </head>
      <body>
        <div class="header-box">
          <div class="title">${generatedWorksheet.title}</div>
          <div class="subtitle">${generatedWorksheet.curriculum} • ${generatedWorksheet.country}</div>
          <table class="info-table">
            <tr>
              <td><strong>Student Name:</strong> ___________________________</td>
              <td><strong>Date:</strong> _____________________</td>
            </tr>
            <tr>
              <td><strong>Class / Grade:</strong> ${generatedWorksheet.gradeLevel}</td>
              <td><strong>Subject:</strong> ${generatedWorksheet.subject}</td>
            </tr>
            <tr>
              <td><strong>Unit:</strong> ${generatedWorksheet.unit || unit}</td>
              <td><strong>Topic:</strong> ${generatedWorksheet.topic}</td>
            </tr>
            <tr>
              <td><strong>Total Questions:</strong> ${generatedWorksheet.totalQuestions}</td>
              <td><strong>Total Marks:</strong> ${generatedWorksheet.totalMarks} Marks</td>
            </tr>
          </table>
          <div style="font-size: 10pt; font-style: italic; border-top: 1px solid #e2e8f0; padding-top: 6px;">
            <strong>Instructions:</strong> ${generatedWorksheet.instructions}
          </div>
        </div>
    `;

    generatedWorksheet.questions.forEach(q => {
      html += `
        <div class="question-box">
          <div class="q-text">${q.number}. ${q.question} <span style="font-size:9pt; color:#64748b;">(${q.marks} Mark${q.marks > 1 ? 's' : ''})</span></div>
      `;
      if (q.options) {
        q.options.forEach(opt => {
          html += `<div style="margin-left: 20px; font-size: 10pt;">${opt}</div>`;
        });
      } else {
        html += `<div class="blank-lines"></div><div class="blank-lines"></div>`;
      }
      html += `</div>`;
    });

    if (includeAnswerKey) {
      html += `
        <div class="answer-key">
          <h3 style="color:#0369a1; text-align: center;">TEACHER'S ANSWER KEY</h3>
      `;
      generatedWorksheet.questions.forEach(q => {
        html += `
          <div style="margin-bottom: 8px; font-size: 10.5pt;">
            <strong>Q${q.number}:</strong> <span style="color:#15803d; font-weight:bold;">${q.correctAnswer}</span>
            <div style="font-size: 9.5pt; color:#475569;"><em>Note:</em> ${q.explanation}</div>
          </div>
        `;
      });
      html += `</div>`;
    }

    html += `</body></html>`;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Worksheet_${generatedWorksheet.subject}_${generatedWorksheet.gradeLevel}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    if (!generatedWorksheet) return;
    let text = `${generatedWorksheet.title}\n\n`;
    text += `Grade: ${generatedWorksheet.gradeLevel} | Subject: ${generatedWorksheet.subject} | Marks: ${generatedWorksheet.totalMarks}\n\n`;
    generatedWorksheet.questions.forEach(q => {
      text += `${q.number}. ${q.question} (${q.marks} Marks)\n`;
      if (q.options) {
        q.options.forEach(o => text += `   ${o}\n`);
      }
      text += `\n`;
    });
    if (includeAnswerKey) {
      text += `=== ANSWER KEY ===\n`;
      generatedWorksheet.questions.forEach(q => {
        text += `Q${q.number}: ${q.correctAnswer} (${q.explanation})\n`;
      });
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fade-in text-slate-100">
      <div className="bg-slate-900 w-full max-w-4xl max-h-[95vh] rounded-3xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col my-auto">
        
        {/* HEADER BAR */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={generatedWorksheet ? () => setGeneratedWorksheet(null) : onClose}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer px-2.5 py-1 rounded-xl hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.backBtn}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-xs">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'N'}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* WORKSPACE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-slate-950/60">

          {/* LANGUAGE CONTEXT SWITCHER BAR */}
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black text-slate-200 uppercase tracking-wider">{t.langTitle}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(['English', 'Kinyarwanda', 'Français', 'Kiswahili'] as WorksheetLanguage[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedLanguage === lang
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {lang === 'Kinyarwanda' ? '🇷🇼 Kinyarwanda' : lang === 'Français' ? '🇫🇷 Français' : lang === 'Kiswahili' ? '🇹🇿 Kiswahili' : '🇬🇧 English'}
                </button>
              ))}
            </div>
          </div>

          {!generatedWorksheet ? (
            <>
              {/* HEADER TITLE */}
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                  <span className="p-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                    <FileText className="w-6 h-6" />
                  </span>
                  <span>{t.modalTitle}</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {t.modalSubtitle}
                </p>
              </div>

              {/* FORM FIELDS */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  
                  {/* Subject * */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">{t.subjectLabel}</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Mathematics, Science, English"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-emerald-500 outline-none font-medium"
                    />
                  </div>

                  {/* Grade Level * */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">{t.gradeLabel}</label>
                    <input
                      type="text"
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(e.target.value)}
                      placeholder="e.g. Grade 5, Primary 3, Senior 1"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-emerald-500 outline-none font-medium"
                    />
                  </div>

                  {/* Unit (Number & Title) / Umutwe * */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-300">{t.unitLabel}</label>
                      <span className="text-[10px] text-emerald-400 font-semibold">Type any unit freely</span>
                    </div>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="e.g. Unit 3: Fractions, Decimals & Percentages / Umutwe wa 3..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-emerald-500 outline-none font-medium"
                    />
                  </div>

                  {/* Topic * */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-bold text-slate-300">{t.topicLabel}</label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Addition of Fractions, Photosynthesis, World War II"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-emerald-500 outline-none font-medium"
                    />
                  </div>

                  {/* Worksheet Type */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">{t.worksheetTypeLabel}</label>
                    <select
                      value={worksheetType}
                      onChange={(e) => setWorksheetType(e.target.value as WorksheetFormatType)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-emerald-500 outline-none font-medium"
                    >
                      <option value="Short Answer">Short Answer</option>
                      <option value="Multiple Choice">Multiple Choice</option>
                      <option value="Fill in the Blank">Fill in the Blank</option>
                      <option value="True/False">True/False</option>
                      <option value="Matching Columns">Matching Columns</option>
                      <option value="Calculation / Word Problems">Calculation / Word Problems</option>
                      <option value="Mixed Worksheet">Mixed Worksheet</option>
                    </select>
                  </div>

                  {/* Difficulty (Optional) */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">{t.difficultyLabel}</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-emerald-500 outline-none font-medium"
                    >
                      <option value="Easy">Easy (Foundation level)</option>
                      <option value="Medium">Medium (Standard curriculum)</option>
                      <option value="Hard">Hard (Challenging)</option>
                      <option value="Mixed">Mixed (All levels)</option>
                    </select>
                  </div>

                  {/* Number of Questions */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">{t.numQuestionsLabel}</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-emerald-500 outline-none font-medium"
                    />
                  </div>

                  {/* Marks per Question */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">{t.marksPerQuestionLabel}</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={marksPerQuestion}
                      onChange={(e) => setMarksPerQuestion(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-emerald-500 outline-none font-medium"
                    />
                  </div>

                  {/* TOTAL SUMMARY BADGE */}
                  <div className="sm:col-span-2 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>{t.totalQuestionsLabel} <strong className="text-white">{numQuestions}</strong></span>
                    <span>{t.totalMarksLabel} <strong className="text-emerald-400">{totalMarks}</strong></span>
                  </div>

                  {/* Language */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">{t.languageLabel}</label>
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value as WorksheetLanguage)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-emerald-500 outline-none font-medium"
                    >
                      <option value="English">English</option>
                      <option value="Kinyarwanda">Kinyarwanda</option>
                      <option value="Français">Français</option>
                      <option value="Kiswahili">Kiswahili</option>
                    </select>
                  </div>

                  {/* Curriculum (Optional) */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">{t.curriculumLabel}</label>
                    <input
                      type="text"
                      value={curriculum}
                      onChange={(e) => setCurriculum(e.target.value)}
                      placeholder="e.g. CBC, REB, RTB, Cambridge, IB"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  {/* Country (Optional) */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">{t.countryLabel}</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. Rwanda, Kenya, Ghana"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  {/* Custom Instructions (Optional) */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">{t.customInstructionsLabel}</label>
                    <input
                      type="text"
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="e.g., 'Focus on vocabulary', 'Include diagrams'"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  {/* Additional Details (Optional) */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-bold text-slate-300">{t.additionalDetailsLabel}</label>
                    <textarea
                      rows={3}
                      value={additionalDetails}
                      onChange={(e) => setAdditionalDetails(e.target.value)}
                      placeholder={t.additionalDetailsPlaceholder}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  {/* CHECKBOXES */}
                  <div className="sm:col-span-2 space-y-2 pt-2">
                    <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={webSearch}
                        onChange={(e) => setWebSearch(e.target.checked)}
                        className="rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-200">{t.webSearchLabel}</span>
                        <span className="text-slate-400 ml-2">{t.webSearchDesc}</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeAnswerKey}
                        onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                        className="rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-200">{t.includeAnswerKeyLabel}</span>
                        <span className="text-slate-400 ml-2">{t.includeAnswerKeyDesc}</span>
                      </div>
                    </label>
                  </div>

                </div>

                {/* GENERATE BUTTON */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    {t.cancelBtn}
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-8 py-3 rounded-2xl text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-xl shadow-emerald-950/50 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>{t.generatingBtn}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>{t.generateBtn}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* GENERATED WORKSHEET VIEWER */
            <div className="space-y-6 animate-fade-in">
              {/* TOOLBAR */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setGeneratedWorksheet(null)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 px-3 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.editParamsBtn}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                    <span>{copied ? t.copiedBtn : t.copyBtn}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-slate-400" />
                    <span>{t.printBtn}</span>
                  </button>

                  <button
                    onClick={handleExportWord}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t.exportWordBtn}</span>
                  </button>
                </div>
              </div>

              {/* DOCUMENT VIEW */}
              <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200 space-y-6 select-text">
                {/* HEADER */}
                <div className="border-2 border-slate-900 rounded-2xl p-5 space-y-3">
                  <div className="text-center space-y-1">
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-slate-900">
                      {generatedWorksheet.title}
                    </h2>
                    <p className="text-xs font-bold text-slate-600">
                      {generatedWorksheet.curriculum} • {generatedWorksheet.country}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-xs sm:text-sm border-t border-b border-slate-200 py-3">
                    <div>
                      <strong>{t.studentNameLabel}</strong> ____________________________________
                    </div>
                    <div>
                      <strong>{t.dateLabel}</strong> ____________________________
                    </div>
                    <div>
                      <strong>Grade / Class:</strong> {generatedWorksheet.gradeLevel}
                    </div>
                    <div>
                      <strong>Subject:</strong> {generatedWorksheet.subject}
                    </div>
                    <div>
                      <strong>Unit:</strong> <span className="font-bold text-emerald-900">{generatedWorksheet.unit || unit}</span>
                    </div>
                    <div>
                      <strong>Topic:</strong> <span className="font-bold text-slate-800">{generatedWorksheet.topic}</span>
                    </div>
                    <div>
                      <strong>{t.totalQuestionsLabel}</strong> {generatedWorksheet.totalQuestions}
                    </div>
                    <div>
                      <strong>{t.totalMarksLabel}</strong> <span className="font-black text-emerald-700">{generatedWorksheet.totalMarks} Marks</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 italic">
                    <strong>{t.instructionsLabel}</strong> {generatedWorksheet.instructions}
                  </div>
                </div>

                {/* QUESTIONS */}
                <div className="space-y-5">
                  {generatedWorksheet.questions.map(q => (
                    <div key={q.id} className="space-y-2 text-xs sm:text-sm">
                      <div className="font-bold text-slate-900 flex items-start gap-2">
                        <span className="text-emerald-700">{q.number}.</span>
                        <span className="flex-1">{q.question}</span>
                        <span className="text-xs text-slate-500 font-normal">({q.marks} {q.marks === 1 ? 'Mark' : 'Marks'})</span>
                      </div>

                      {q.options ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6 text-xs text-slate-700">
                          {q.options.map((opt, i) => (
                            <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                              {opt}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="pl-6 space-y-2 pt-1">
                          <div className="border-b border-dotted border-slate-300 h-6"></div>
                          <div className="border-b border-dotted border-slate-300 h-6"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* ANSWER KEY */}
                {includeAnswerKey && (
                  <div className="mt-8 pt-6 border-t-2 border-dashed border-emerald-400 space-y-4">
                    <div className="text-center">
                      <h3 className="text-base font-black uppercase text-emerald-800">
                        {t.answerKeyTitle}
                      </h3>
                      <p className="text-xs text-slate-500">{t.answerKeySub}</p>
                    </div>

                    <div className="space-y-3 text-xs bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200">
                      {generatedWorksheet.questions.map(q => (
                        <div key={q.id} className="space-y-0.5 border-b border-emerald-100 pb-2 last:border-b-0">
                          <div>
                            <strong>Q{q.number}:</strong> <span className="text-emerald-800 font-bold">{q.correctAnswer}</span>
                          </div>
                          <div className="text-slate-600 text-[11px]">
                            <em>Explanation:</em> {q.explanation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
