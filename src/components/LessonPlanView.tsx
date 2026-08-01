import React, { useRef, useState, useEffect } from 'react';
import {
  Printer,
  Copy,
  Download,
  Share2,
  Check,
  Sparkles,
  BookOpen,
  ArrowLeft,
  FileText,
  FileCode,
  Edit3,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Send,
  CheckCircle2,
  Users,
  UserCheck,
  Zap,
  Layers,
  HeartHandshake,
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Star
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LessonPlanData, LessonPlanStep, LessonStep } from '../types';
import { OWNER_INFO } from '../data/plans';
import { getLessonPlanLabels } from '../data/translations';

function getRemedialValues(header: any, language?: string) {
  const isKiny = language === 'Kinyarwanda';
  const topic = header?.lessonTitle || 'THIS LESSON';

  return {
    group1Objective: header?.group1Objective || (isKiny
      ? `Gusobanura no gukoresha ubumenyi bw'ibanze bwa ${topic} ku kigero cya 75%.`
      : `Explain and apply core concepts of ${topic} with at least 75% accuracy.`),
    
    group2Objective: header?.group2Objective || (isKiny
      ? `Gukoresha neza amategeko n'amabwiriza ya ${topic} mu gukemura ibibazo.`
      : `Apply appropriate strategies and rules for ${topic} problem solving.`),
    
    group3Objective: header?.group3Objective || (isKiny
      ? `Gukoresha ubumenyi bwagutse bwa ${topic} no gufasha bagenzi babo.`
      : `Master advanced ${topic} applications and assist peers.`),

    identifiedProblems: header?.identifiedProblems || header?.specificChallenges || (isKiny
      ? `• Kugorwa no kwumva ingingo z'ibanze za ${topic}.\n• Kubura imyitozo ihagije mu gukemura ibibazo.`
      : `• Difficulty in understanding core concepts of ${topic}.\n• Insufficient practice in problem solving.`),

    remedialActivitiesGroup1: header?.remedialActivitiesGroup1 || (isKiny
      ? `• Tsinda 1: Imyitozo y'ibanze ifashijwe na mwarimu akoresheje ingero zifatika.`
      : `• Group 1: Guided practice on foundational concepts using visual aids.`),

    remedialActivitiesGroup2: header?.remedialActivitiesGroup2 || (isKiny
      ? `• Tsinda 2: Imyitozo yo gukomeza ubumenyi mu matsinda na babiri babiri.`
      : `• Group 2: Paired exercise worksheets for step-by-step problem solving.`),

    remedialActivitiesGroup3: header?.remedialActivitiesGroup3 || (isKiny
      ? `• Tsinda 3: Imyitozo yisumbuye yo gukaza ubumenyi no gufasha bagenzi babo.`
      : `• Group 3: Advanced application tasks and peer tutoring.`),

    usedStepsAssessment: header?.usedStepsAssessment || (isKiny
      ? `• Gukurikirana abanyeshuri mu myitozo ihagarariwe na mwarimu.\n• Isuzuma rito ryo ku mpapuro n'iryo mu kanwa (Exit tickets).`
      : `• Direct observation during guided practice with immediate feedback.\n• Formative exit tickets to verify concept mastery.`),

    remedialAids: header?.remedialAids || header?.teachingLearningAids || (isKiny
      ? `• Amacharts, amapaji y'imyitozo, ibikoresho bifatika, flashcards`
      : `• Charts, exercise worksheets, concrete objects, flashcards`),

    consolidationCategory: header?.consolidationCategory || (isKiny
      ? `Abanyeshuri bafite ubumenyi bwo hagati (${header?.consolidationCount || '5'} learners)`
      : `Students with moderate understanding (${header?.consolidationCount || '5'} learners)`),

    consolidationActivities: header?.consolidationActivities || (isKiny
      ? `• Kwitabira peer teaching no gukorera hamwe ku ngingo za ${topic}.\n• Imyitozo inyuranye y'ibibazo n'ubuzima bwa buri munsi.`
      : `• Peer teaching and group exercises on ${topic}.\n• Mixed practice sets connecting to practical scenarios.`),

    consolidationMethodology: header?.consolidationMethodology || (isKiny
      ? `Uburyo bwo kwigira hamwe (collaborative learning) no gukorera mu matsinda.`
      : `Collaborative learning in pairs or small groups.`),

    consolidationAids: header?.consolidationAids || (isKiny
      ? `• Amapaji y'imyitozo, amacharts, gupima ibisubizo.`
      : `• Practice worksheets, charts, answer keys.`),

    extensionCategory: header?.extensionCategory || (isKiny
      ? `Abanyeshuri bafite ubumenyi bwisumbuye / Abihuta (${header?.extensionCount || '4'} learners)`
      : `Students needing extended activities (${header?.extensionCount || '4'} learners)`),

    extensionActivities: header?.extensionActivities || (isKiny
      ? `• Imyitozo yisumbuye yagutse ku giti cyabo ku ngingo za ${topic}.\n• Guhimba ibibazo bitoroshye no guhuza ${topic} n'ibindi bice.`
      : `• Independent research and advanced exercises on ${topic}.\n• Complex problem solving and cross-topic application.`),

    extensionMethodology: header?.extensionMethodology || (isKiny
      ? `Uburyo bw'ubushakashatsi (inquiry-driven) no kwigira ku giti cyabo.`
      : `Project-based and inquiry-driven independent learning.`),

    extensionAids: header?.extensionAids || (isKiny
      ? `• Amapaji y'imyitozo yisumbuye, ibitabo n'ubushakashatsi.`
      : `• Advanced problem sets, research resources, textbooks.`),
  };
}

interface LessonPlanViewProps {
  plan: LessonPlanData;
  onBack?: () => void;
}

export const LessonPlanView: React.FC<LessonPlanViewProps> = ({ plan, onBack }) => {
  const [editedPlan, setEditedPlan] = useState<LessonPlanData>(plan);
  const labels = getLessonPlanLabels(editedPlan.language);
  const remVals = getRemedialValues(editedPlan.header, editedPlan.language);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isOnePageFit, setIsOnePageFit] = useState<boolean>(true);
  const [show40MinHelp, setShow40MinHelp] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Sharing State
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showWhatsAppShareModal, setShowWhatsAppShareModal] = useState(false);
  const [whatsappCopiedText, setWhatsappCopiedText] = useState(false);
  const [whatsappCopiedLink, setWhatsappCopiedLink] = useState(false);

  const shareTitle = editedPlan.header.lessonTitle || 'Lesson Plan';
  const shareText = `Check out this lesson plan: ${shareTitle} (${editedPlan.header.subject} - ${editedPlan.header.classGrade}). Created via Teacher Tool.`;
  const shareUrl = window.location.href;

  const formatPlanToWhatsAppText = (p: LessonPlanData) => {
    const divider = "━━━━━━━━━━━━━━━━━━━━\n";
    let t = `📝 *SOMO / LESSON PLAN* 📝\n`;
    t += divider;
    t += `🏫 *School:* ${p.header.schoolName || 'N/A'}\n`;
    t += `👨‍🏫 *Teacher:* ${p.header.teacherName || 'N/A'}\n`;
    t += `📚 *Subject:* ${p.header.subject || 'N/A'} (${p.header.classGrade || 'N/A'})\n`;
    t += `📅 *Date:* ${p.header.date || 'N/A'} | *Term:* ${p.header.term || 'N/A'}\n`;
    t += `⏱️ *Duration:* ${p.header.duration || 'N/A'} | *Class Size:* ${p.header.classSize || 'N/A'}\n`;
    t += `🔑 *Unit Title:* ${p.header.unitTitle || 'N/A'} (${p.header.unitNo ? `Unit ${p.header.unitNo}` : 'N/A'})\n`;
    t += `🎯 *Objective:* ${p.header.instructionalObjective || 'N/A'}\n`;
    t += divider;
    t += `🎯 *Key Competency:* ${p.header.keyUnitCompetence || 'N/A'}\n`;
    t += `📖 *Materials:* ${p.header.learningMaterials || 'N/A'}\n`;
    t += `📚 *References:* ${p.header.references || 'N/A'}\n`;
    t += divider;
    t += `📈 *LESSON STEPS & TIMING:*\n\n`;

    p.steps.forEach((step, idx) => {
      t += `*Step ${idx + 1}: ${step.stepName}* (${step.timing})\n`;
      t += `• *Teacher:* ${step.teacherActivities}\n`;
      t += `• *Learner:* ${step.learnerActivities}\n`;
      if (step.competencesAndCrossCutting) {
        t += `• *Competence:* ${step.competencesAndCrossCutting}\n`;
      }
      t += `\n`;
    });

    t += divider;
    t += `🆔 *Plan ID:* ${p.id}\n`;
    t += `🔗 *Open Link:* ${window.location.origin}${window.location.pathname}?planId=${p.id}\n`;
    t += divider;
    t += `Generated via *Teacher Tool* by *Nkundimana Theogene* 🇷🇼`;
    return t;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setShowShareModal(true);
        }
      }
    } else {
      setShowShareModal(true);
    }
  };

  const getShareLabels = () => {
    const lang = editedPlan.language;
    if (lang === 'Kinyarwanda') {
      return {
        title: "Sangiza Iri Somo",
        subtitle: "Hitamo uburyo wifuza gusangizamo iri somo n'abandi barimu.",
        whatsapp: "Sangiza kuri WhatsApp",
        email: "Ohereza kuri Email",
        copy: "Kora Kopi y'Ibyanditse",
        copied: "Kopi Yakozwe!",
        close: "Funga",
        success: "Byakopijwe neza muri Clipboard!"
      };
    } else if (lang === 'French') {
      return {
        title: "Partager la Fiche de Leçon",
        subtitle: "Choisissez comment vous souhaitez partager ce plan de cours avec d'autres enseignants.",
        whatsapp: "Partager via WhatsApp",
        email: "Partager par Email",
        copy: "Copier le texte de partage",
        copied: "Copié !",
        close: "Fermer",
        success: "Texte copié dans le presse-papiers !"
      };
    } else {
      return {
        title: "Share Lesson Plan",
        subtitle: "Choose how you want to share this lesson plan with other teachers.",
        whatsapp: "Share via WhatsApp",
        email: "Share via Email",
        copy: "Copy Share Text",
        copied: "Copied!",
        close: "Close",
        success: "Copied share text to clipboard!"
      };
    }
  };

  // Feedback & Rating State
  const [feedbackVote, setFeedbackVote] = useState<'up' | 'down' | null>(null);
  const [starRating, setStarRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  useEffect(() => {
    setEditedPlan(plan);
    setFeedbackVote(null);
    setStarRating(0);
    setHoverRating(0);
    setSelectedTags([]);
    setFeedbackComment('');
    setFeedbackSubmitted(false);
  }, [plan]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleRateSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (starRating === 0 && !feedbackVote && selectedTags.length === 0 && !feedbackComment.trim()) return;
    setFeedbackSubmitted(true);
    saveFeedbackToStorage(feedbackVote || (starRating >= 4 ? 'up' : 'down'), feedbackComment);
  };

  const handleVote = (type: 'up' | 'down') => {
    setFeedbackVote(type);
    if (type === 'up' && starRating === 0) {
      setStarRating(5);
    } else if (type === 'down' && starRating === 0) {
      setStarRating(2);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRateSubmit(e);
  };

  const saveFeedbackToStorage = (type: 'up' | 'down', comment: string) => {
    try {
      const stored = JSON.parse(localStorage.getItem('teacher_plan_feedback') || '[]');
      stored.push({
        id: editedPlan.id || Date.now(),
        lessonTitle: editedPlan.header.lessonTitle,
        subject: editedPlan.header.subject,
        classGrade: editedPlan.header.classGrade,
        starRating,
        selectedTags,
        vote: type,
        comment,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('teacher_plan_feedback', JSON.stringify(stored));
    } catch (err) {
      console.warn('Feedback storage write error:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleHeaderChange = (field: keyof LessonPlanData['header'], value: string) => {
    setEditedPlan((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        [field]: value,
      },
    }));
  };

  const handleStepChange = (index: number, field: keyof LessonStep, value: string) => {
    setEditedPlan((prev) => {
      const updatedSteps = [...prev.steps];
      updatedSteps[index] = {
        ...updatedSteps[index],
        [field]: value,
      };
      return {
        ...prev,
        steps: updatedSteps,
      };
    });
  };

  const handleAddStep = () => {
    setEditedPlan((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          stepName: 'New Step',
          timing: '5 min',
          teacherActivities: 'Teacher explains...',
          learnerActivities: 'Learners listen and respond...',
          competencesAndCrossCutting: 'Critical thinking',
        },
      ],
    }));
  };

  const handleRemoveStep = (index: number) => {
    if (editedPlan.steps.length <= 1) return;
    setEditedPlan((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const handleResetEdits = () => {
    setEditedPlan(plan);
  };

  const handleExportPdf = async () => {
    if (!printRef.current) return;
    setIsExportingPdf(true);

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
            result = before + 'rgb(255, 255, 255)' + after;
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
      const element = printRef.current;
      element.classList.add('one-page-pdf-fit');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const styleTags = Array.from(clonedDoc.querySelectorAll('style'));
          styleTags.forEach((style) => {
            if (style.textContent && /(oklch|oklab|color-mix|light-dark|color\()/i.test(style.textContent)) {
              style.textContent = replaceNestedParens(style.textContent);
            }
          });

          // Override styles on printable elements in the clone to guarantee crisp white & light grey background
          const printEl = clonedDoc.querySelector('.printable-document') as HTMLElement;
          if (printEl) {
            printEl.style.backgroundColor = '#ffffff';
            printEl.style.color = '#000000';
            printEl.classList.add('one-page-pdf-fit');

            const allCells = printEl.querySelectorAll('td, th, div, span, p, input, textarea');
            allCells.forEach((el) => {
              const htmlEl = el as HTMLElement;
              htmlEl.style.color = '#000000';
              if (htmlEl.tagName === 'TD' || htmlEl.tagName === 'TH') {
                htmlEl.style.borderColor = '#000000';
                if (htmlEl.classList.contains('bg-slate-100') || htmlEl.classList.contains('bg-slate-50')) {
                  htmlEl.style.backgroundColor = '#f1f5f9';
                } else {
                  htmlEl.style.backgroundColor = '#ffffff';
                }
              }
            });
          }
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Fit strictly on 1 single page with 4mm margin
      const ratio = Math.min(pdfWidth / imgWidth, (pdfHeight - 8) / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 4; // top margin in mm

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      const filename = `${editedPlan.header.subject}_${editedPlan.header.classGrade}_${(editedPlan.header.lessonTitle || 'LessonPlan').replace(/[^a-zA-Z0-9]/g, '_')}_1Page.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('jsPDF export error, falling back to window.print():', err);
      window.print();
    } finally {
      for (const [style, originalText] of originalStyles.entries()) {
        style.textContent = originalText;
      }
      setIsExportingPdf(false);
    }
  };

  const handleDownloadWord = () => {
    const filename = `${editedPlan.header.subject}_${editedPlan.header.classGrade}_${(editedPlan.header.lessonTitle || 'LessonPlan').replace(/[^a-zA-Z0-9]/g, '_')}_1Page.doc`;
    
    let docBody = '';

    if (isRemedial) {
      docBody = `
        <h1 style="text-align: center; font-size: 12pt; color: #1e1b4b; text-transform: uppercase; margin-bottom: 2pt;">REMEDIAL LEARNING LESSON PLAN</h1>
        <p style='text-align: center; font-size: 8.5pt; color: #4338ca; font-weight: bold; margin-bottom: 4pt;'>REB Competence-Based Curriculum (CBC) Remedial Program Compliant</p>
        
        <h2>A. GENERAL INFORMATION / Amakuru Rusange</h2>
        <table>
          <tr>
            <td width="25%"><span class="header-label">School Name:</span></td>
            <td width="25%">${editedPlan.header.schoolName || 'N/A'}</td>
            <td width="25%"><span class="header-label">District:</span></td>
            <td width="25%">${editedPlan.header.district || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">Class:</span></td>
            <td>${editedPlan.header.classGrade || 'N/A'}</td>
            <td><span class="header-label">Period (minutes):</span></td>
            <td>${editedPlan.header.duration || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">Lesson Topic:</span></td>
            <td><strong>${editedPlan.header.lessonTitle || 'N/A'}</strong></td>
            <td><span class="header-label">Date:</span></td>
            <td>${editedPlan.header.date || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">Teacher Name:</span></td>
            <td colspan="3">${editedPlan.header.teacherName || 'N/A'}</td>
          </tr>
          <tr>
            <td style="background-color: #fff1f2;"><strong>Number of learners needing remediation:</strong></td>
            <td colSpan="3"><strong>${editedPlan.header.remedialCount || '5'} students</strong></td>
          </tr>
          <tr>
            <td style="background-color: #e0e7ff;"><strong>Number of students needing consolidation:</strong></td>
            <td colSpan="3"><strong>${editedPlan.header.consolidationCount || '5'} students</strong></td>
          </tr>
          <tr>
            <td style="background-color: #ecfdf5;"><strong>Number of students needing extension:</strong></td>
            <td colSpan="3"><strong>${editedPlan.header.extensionCount || '4'} students</strong></td>
          </tr>
        </table>

        <h2>B. IDENTIFIED GROUPS OF STRUGGLING LEARNERS / Intego za buri kiciro</h2>
        <table>
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th width="50%">Categories of learners needing remedial activities</th>
              <th width="50%">Objectives per categories identified</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Group 1:</strong> ${editedPlan.header.remedialGroup1Category || `Learners with problems related to understanding fundamental concepts of ${editedPlan.header.lessonTitle || 'this topic'}.`}</td>
              <td><strong>Group 1 Objective:</strong> ${(remVals.group1Objective || '').replace(/\n/g, '<br/>')}</td>
            </tr>
            <tr>
              <td><strong>Group 2:</strong> ${editedPlan.header.remedialGroup2Category || `Learners struggling with consistent application of ${editedPlan.header.lessonTitle || 'this topic'} methods.`}</td>
              <td><strong>Group 2 Objective:</strong> ${(remVals.group2Objective || '').replace(/\n/g, '<br/>')}</td>
            </tr>
            <tr>
              <td><strong>Group 3:</strong> ${editedPlan.header.remedialGroup3Category || `Learners requiring comprehensive support across multiple aspects of ${editedPlan.header.lessonTitle || 'this topic'}.`}</td>
              <td><strong>Group 3 Objective:</strong> ${(remVals.group3Objective || '').replace(/\n/g, '<br/>')}</td>
            </tr>
          </tbody>
        </table>

        <h2>C. IDENTIFIED PROBLEMS, REMEDIAL ACTIVITIES AND LEARNING AIDS / Imyitozo n'Imfashanyigisho</h2>
        <table>
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th width="22%">Identified problems</th>
              <th width="32%">Remedial activities</th>
              <th width="26%">Used steps including assessment</th>
              <th width="20%">Teaching and learning aids</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${(remVals.identifiedProblems || '').replace(/\n/g, '<br/>')}</td>
              <td>
                <p><strong>Group 1:</strong> ${(remVals.remedialActivitiesGroup1 || '').replace(/\n/g, '<br/>')}</p>
                <hr/>
                <p><strong>Group 2:</strong> ${(remVals.remedialActivitiesGroup2 || '').replace(/\n/g, '<br/>')}</p>
                <hr/>
                <p><strong>Group 3:</strong> ${(remVals.remedialActivitiesGroup3 || '').replace(/\n/g, '<br/>')}</p>
              </td>
              <td>${(remVals.usedStepsAssessment || '').replace(/\n/g, '<br/>')}</td>
              <td>${(remVals.remedialAids || '').replace(/\n/g, '<br/>')}</td>
            </tr>
          </tbody>
        </table>

        <h2>D. CONSOLIDATION AND EXTENDED ACTIVITIES / Imyitozo yo gukomeza ubumenyi n'yisumbuye</h2>
        <table>
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th width="22%">Category of learners</th>
              <th width="32%">Activities</th>
              <th width="26%">Methodology used</th>
              <th width="20%">Learning aids</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${remVals.consolidationCategory}</strong></td>
              <td>${(remVals.consolidationActivities || '').replace(/\n/g, '<br/>')}</td>
              <td>${(remVals.consolidationMethodology || '').replace(/\n/g, '<br/>')}</td>
              <td>${(remVals.consolidationAids || '').replace(/\n/g, '<br/>')}</td>
            </tr>
            <tr>
              <td><strong>EXTENDED ACTIVITIES</strong><br/>${remVals.extensionCategory}</td>
              <td>${(remVals.extensionActivities || '').replace(/\n/g, '<br/>')}</td>
              <td>${(remVals.extensionMethodology || '').replace(/\n/g, '<br/>')}</td>
              <td>${(remVals.extensionAids || '').replace(/\n/g, '<br/>')}</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 10px; border: 1.5px solid #1e1b4b; padding: 8px; font-size: 8.5pt;">
          <strong>TEACHER'S SELF-EVALUATION / ISUZUMA-BUMENYI BWA MWARIMU:</strong><br/>
          ${(editedPlan.selfEvaluation || 'Teacher self-evaluation to be filled after class instruction.').replace(/\n/g, '<br/>')}
        </div>
      `;
    } else {
      docBody = `
        <h1 style="text-align: center; font-size: 12pt; color: #0d9488; text-transform: uppercase; margin-bottom: 2pt;">TEACHER TOOL - LESSON PLAN</h1>
        <p style='text-align: center; font-size: 8.5pt; color: #0d9488; font-weight: bold; margin-bottom: 4pt;'>REB Competence-Based Curriculum (CBC) Compliant</p>
        
        <h2>1. LESSON PLAN IDENTIFICATION / IMYIRONDORO</h2>
        <table>
          <tr>
            <td width="25%"><span class="header-label">School Name:</span></td>
            <td width="25%">${editedPlan.header.schoolName || 'N/A'}</td>
            <td width="25%"><span class="header-label">District:</span></td>
            <td width="25%">${editedPlan.header.district || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">Teacher's Name:</span></td>
            <td>${editedPlan.header.teacherName || 'N/A'}</td>
            <td><span class="header-label">Subject:</span></td>
            <td>${editedPlan.header.subject || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">Class / Grade:</span></td>
            <td>${editedPlan.header.classGrade || 'N/A'}</td>
            <td><span class="header-label">Term:</span></td>
            <td>${editedPlan.header.term || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">Date:</span></td>
            <td>${editedPlan.header.date || 'N/A'}</td>
            <td><span class="header-label">Unit Number:</span></td>
            <td>${editedPlan.header.unitNo || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">Lesson Number:</span></td>
            <td>${editedPlan.header.lessonNo || 'N/A'}</td>
            <td><span class="header-label">Duration:</span></td>
            <td>${editedPlan.header.duration || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">Class Size:</span></td>
            <td>${editedPlan.header.classSize || 'N/A'}</td>
            <td><span class="header-label">Location:</span></td>
            <td>${editedPlan.header.location || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">Special Needs:</span></td>
            <td colspan="3">${editedPlan.header.specialNeeds || 'None'}</td>
          </tr>
        </table>

        <h2>2. LESSON SPECIFICATIONS</h2>
        <table>
          <tr>
            <td width="30%"><span class="header-label">Unit Title:</span></td>
            <td>${editedPlan.header.unitTitle || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">Key Unit Competence:</span></td>
            <td>${editedPlan.header.keyUnitCompetence || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">Title of Lesson:</span></td>
            <td>${editedPlan.header.lessonTitle || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">Instructional Objective:</span></td>
            <td><strong>${editedPlan.header.instructionalObjective || 'N/A'}</strong></td>
          </tr>
          <tr>
            <td><span class="header-label">Learning Materials:</span></td>
            <td>${editedPlan.header.learningMaterials || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">References:</span></td>
            <td>${editedPlan.header.references || 'N/A'}</td>
          </tr>
        </table>

        <h2>3. LESSON DEVELOPMENT STEPS / INYIGISHO NYIRIZINA</h2>
        <table>
          <thead>
            <tr>
              <th width="15%">Step & Timing</th>
              <th width="35%">Teacher's Activities</th>
              <th width="35%">Learner's Activities</th>
              <th width="15%">Competences & Cross-Cutting</th>
            </tr>
          </thead>
          <tbody>
            ${editedPlan.steps.map((step, idx) => `
              <tr>
                <td><strong>Step ${idx + 1}: ${step.stepName}</strong><br/><span style='color: #64748b;'>(${step.timing})</span></td>
                <td>${(step.teacherActivities || '').replace(/\n/g, '<br/>')}</td>
                <td>${(step.learnerActivities || '').replace(/\n/g, '<br/>')}</td>
                <td>${(step.competencesAndCrossCutting || '').replace(/\n/g, '<br/>')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>4. TEACHER'S SELF-EVALUATION / ISUZUMA-BUMENYI BWA MWARIMU</h2>
        <table>
          <tr>
            <td style="padding: 8pt; font-size: 8.5pt;">
              ${(editedPlan.selfEvaluation || 'Teacher self-evaluation to be filled after class instruction.').replace(/\n/g, '<br/>')}
            </td>
          </tr>
        </table>
      `;
    }

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${editedPlan.header.lessonTitle || 'Lesson Plan'}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 0.3in 0.3in 0.3in 0.3in;
          }
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8.5pt; line-height: 1.15; color: #1e293b; margin: 0; padding: 0; }
          h1 { color: #1e1b4b; font-size: 11pt; text-align: center; margin-top: 0; margin-bottom: 2pt; font-weight: bold; text-transform: uppercase; }
          p { margin: 1pt 0; font-size: 8.5pt; }
          h2 { color: #1e1b4b; font-size: 9pt; margin-top: 5pt; margin-bottom: 2pt; border-bottom: 1.5px solid #1e1b4b; padding-bottom: 1pt; font-weight: bold; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-top: 2pt; margin-bottom: 3pt; table-layout: fixed; }
          th, td { border: 1px solid #475569; padding: 2.5pt 3.5pt; text-align: left; font-size: 8.5pt; vertical-align: top; word-wrap: break-word; }
          th { background-color: #f1f5f9; color: #0f172a; font-weight: bold; }
          .header-label { font-weight: bold; color: #1e293b; }
          .footer-note { text-align: center; font-size: 7.5pt; color: #64748b; margin-top: 4pt; border-top: 1px solid #cbd5e1; padding-top: 2pt; }
          hr { border: none; border-top: 1px solid #cbd5e1; margin: 1.5pt 0; }
        </style>
      </head>
      <body>
        ${docBody}

        <div class="footer-note">
          <p>Generated via <strong>Teacher Tool Platform</strong> • Developer & Support: Nkundimana Theogene (0781339530)</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    let plainText = `SCHOOL NAME: ${editedPlan.header.schoolName}\nTEACHER'S NAME: ${editedPlan.header.teacherName}\n\n`;
    plainText += `Subject: ${editedPlan.header.subject} | Class: ${editedPlan.header.classGrade} | Term: ${editedPlan.header.term} | Date: ${editedPlan.header.date}\n`;
    plainText += `Unit N°: ${editedPlan.header.unitNo} | Lesson N°: ${editedPlan.header.lessonNo} | Duration: ${editedPlan.header.duration} | Class Size: ${editedPlan.header.classSize}\n`;
    plainText += `Special Educational Needs: ${editedPlan.header.specialNeeds}\n`;
    plainText += `Unit Title: ${editedPlan.header.unitTitle}\n`;
    plainText += `Key Unit Competence: ${editedPlan.header.keyUnitCompetence}\n`;
    plainText += `Title of Lesson: ${editedPlan.header.lessonTitle}\n`;
    plainText += `Instructional Objective: ${editedPlan.header.instructionalObjective}\n`;
    plainText += `Location: ${editedPlan.header.location}\n`;
    plainText += `Learning Materials: ${editedPlan.header.learningMaterials}\n`;
    plainText += `References: ${editedPlan.header.references}\n\n`;

    plainText += `--- LESSON DEVELOPMENT STEPS ---\n`;
    editedPlan.steps.forEach((step, idx) => {
      plainText += `\nStep ${idx + 1}: ${step.stepName} (${step.timing})\n`;
      plainText += `Teacher's Activities:\n${step.teacherActivities}\n`;
      plainText += `Learner's Activities:\n${step.learnerActivities}\n`;
      plainText += `Competences & Cross-Cutting:\n${step.competencesAndCrossCutting}\n`;
    });

    plainText += `\nTEACHER SELF-EVALUATION:\n${editedPlan.selfEvaluation || ''}\n`;

    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRemedial = editedPlan.format === 'remedial_grid';
  const isRebGrid = editedPlan.format === 'reb_grid' || isRemedial;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Controls Bar (Hidden during print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Back to Form"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{editedPlan.header.lessonTitle || 'Generated Lesson Plan'}</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
                {editedPlan.language}
              </span>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                isRemedial
                  ? 'bg-indigo-100 text-indigo-950 border border-indigo-300 font-extrabold flex items-center gap-1 shadow-2xs'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {isRemedial && <Sparkles className="w-3.5 h-3.5 text-indigo-700 fill-indigo-200" />}
                {isRemedial ? 'Remedial Program (RLP)' : isRebGrid ? 'REB / CBC Format' : 'Open Format'}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              {editedPlan.header.subject} • {editedPlan.header.classGrade} • Printable PDF
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Live Edit Mode */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-1.5 px-3 py-2 font-bold text-xs rounded-xl shadow-xs transition-all ${
              isEditMode
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 ring-2 ring-amber-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
            }`}
            title="Toggle Live Edit Mode (Guhindura ibikubiyemo)"
          >
            {isEditMode ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4 text-amber-600" />}
            <span>{isEditMode ? '✓ Finish Editing' : '✏️ Guhindura (Edit)'}</span>
          </button>

          {isEditMode && (
            <button
              onClick={handleResetEdits}
              className="flex items-center gap-1 px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-xs rounded-xl transition-colors"
              title="Reset changes back to original"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Download label */}
          <span className="text-xs text-slate-600 font-extrabold bg-slate-50 px-2.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
            Download PDF cyangwa Word:
          </span>

          {/* jsPDF + html2canvas Direct PDF Download Button */}
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-60"
            id="download-jspdf-btn"
            title="Export as PDF using jsPDF and html2canvas"
          >
            {isExportingPdf ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Download className="w-4 h-4 text-amber-300" />
            )}
            <span>{isExportingPdf ? 'Saving PDF...' : 'Download PDF'}</span>
          </button>

          {/* Download MS Word Document (.doc) */}
          <button
            onClick={handleDownloadWord}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            id="download-word-btn"
            title="Download Lesson Plan as Microsoft Word document (.doc)"
          >
            <FileText className="w-4 h-4 text-blue-200" />
            <span>Download Word</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            id="share-lesson-plan-btn"
            title="Share Lesson Plan via WhatsApp, Email, or Web Share"
          >
            <Share2 className="w-4 h-4 text-purple-200" />
            <span>Share</span>
          </button>

          {/* WhatsApp Share Button */}
          <button
            onClick={() => setShowWhatsAppShareModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all hover:scale-105 border border-emerald-500/20"
            id="whatsapp-share-btn"
            title="Share Lesson Plan directly on WhatsApp"
          >
            <svg className="w-4 h-4 text-emerald-100 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.859 0c3.166.001 6.141 1.233 8.375 3.469 2.235 2.235 3.465 5.212 3.466 8.377-.003 6.534-5.329 11.858-11.86 11.858-2.007-.001-3.98-.511-5.733-1.48L0 24zm6.54-4.847c1.684.997 3.328 1.521 5.304 1.522 5.378 0 9.755-4.374 9.758-9.753.001-2.607-1.013-5.059-2.859-6.904C16.905 2.173 14.45 1.157 11.852 1.157c-5.38 0-9.757 4.374-9.76 9.753-.001 1.884.49 3.73 1.419 5.337l-1.011 3.691 3.784-.992c1.6.873 3.36 1.332 5.304 1.333l.023-.012zm11.367-7.37c-.312-.156-1.848-.912-2.128-1.014-.28-.103-.483-.156-.688.156-.204.311-.79.99-.969 1.196-.18.206-.361.233-.673.078-1.112-.558-2.01-.986-2.793-2.332-.206-.356.206-.33.591-1.096.064-.13.032-.244-.016-.34-.048-.097-.483-1.163-.661-1.593-.175-.42-.369-.362-.505-.369-.13-.006-.28-.008-.43-.008-.15 0-.395.056-.602.28-.206.225-.79.771-.79 1.882 0 1.111.808 2.186.921 2.342.113.156 1.59 2.428 3.853 3.404.538.232.957.371 1.285.476.54.172 1.03.148 1.418.09.432-.064 1.848-.756 2.11-.1.263-.102.263-.448.263-.448-.156.03-.312.016-.468zm0 0" />
            </svg>
            <span>WhatsApp</span>
          </button>

          {/* Copy Plain Text */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
            id="copy-lesson-plan-btn"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          {/* Print / System Browser PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            id="print-export-pdf-btn"
          >
            <Printer className="w-4 h-4" />
            <span>Print (A4)</span>
          </button>
        </div>
      </div>

      {/* 1-Page PDF Layout Status Banner */}
      <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-xs text-emerald-950 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div className="flex items-center gap-2 font-medium">
          <span className="text-base">📄</span>
          <span>
            {editedPlan.language === 'Kinyarwanda'
              ? 'Tekinoroji ya 1-Page PDF irakora: Isomo ryose ribumbatiye kuri page 1 gusa y\'A4 ifite ibipimo bya REB.'
              : editedPlan.language === 'French'
              ? 'Format 1-Page PDF actif: Votre fiche de leçon est optimisée pour tenir sur une seule page A4.'
              : '1-Page PDF Format Active: Your lesson plan is automatically styled to fit on exactly 1 single printable A4 page.'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsOnePageFit(!isOnePageFit)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-black tracking-wider uppercase transition-all ${
            isOnePageFit
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          {isOnePageFit ? '✓ 1-Page Fit Active' : 'Enable 1-Page Fit'}
        </button>
      </div>

      {/* Toggleable 40-Minute Lesson Structure Help Section */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-teal-50 border border-blue-200 rounded-2xl p-4 shadow-xs print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
                <span>
                  {editedPlan.language === 'Kinyarwanda'
                    ? "Inama zo kugabana ibice by'isomo ry'iminota 40 (40-Minute Lesson Breakdown)"
                    : editedPlan.language === 'French'
                    ? "Guide de répartition d'une leçon de 40 minutes"
                    : "40-Minute Lesson Structure & Phase Breakdown Tips"}
                </span>
                <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                  Max 40 Min
                </span>
              </h3>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                {editedPlan.language === 'Kinyarwanda'
                  ? 'Kanda hano urebe uko uduce 3 tw\'isomo (Introduction, Body, Conclusion) tugabanywa mu minota 40.'
                  : editedPlan.language === 'French'
                  ? 'Cliquez pour voir la répartition idéale des 3 phases d\'un cours de 40 minutes.'
                  : 'Click to view recommended time allocations for Introduction, Development, and Conclusion.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShow40MinHelp(!show40MinHelp)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-blue-900 border border-blue-300 font-extrabold text-xs rounded-xl shadow-2xs transition-all shrink-0"
          >
            <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-300" />
            <span>{show40MinHelp ? 'Hisha Inama (Hide Tips)' : 'Fungura Inama (View 40-Min Tips)'}</span>
            {show40MinHelp ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>
        </div>

        {show40MinHelp && (
          <div className="mt-4 pt-4 border-t border-blue-200/80 grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Phase 1: Introduction */}
            <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-950 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  1. Introduction (Imfashanyigisho)
                </span>
                <span className="text-[11px] font-black px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  5 - 8 Min
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {editedPlan.language === 'Kinyarwanda'
                  ? 'Gusubira mu byatambutse (Review prior knowledge), kumenyesha abanyeshuri icyo bari bwige (Objectives), n\'ikibazo cyo kubakangura (Hook/Warming activity).'
                  : editedPlan.language === 'French'
                  ? 'Rappel des prérequis, annonce des objectifs d\'apprentissage et activité d\'accroche/sensibilisation.'
                  : 'Review prerequisites, state clear learning objectives, and engage students with a quick hook question.'}
              </p>
            </div>

            {/* Phase 2: Development / Body */}
            <div className="bg-white p-3.5 rounded-xl border border-indigo-200 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-950 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  2. Development (Igice Nyirizina)
                </span>
                <span className="text-[11px] font-black px-2 py-0.5 rounded bg-indigo-100 text-indigo-900">
                  25 - 28 Min
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {editedPlan.language === 'Kinyarwanda'
                  ? 'Sobanura ingingo nshya, koresha amagroup (Group work/CBC activities), abanyeshuri bakore imyitozo, barimo gukora (Active learning & competence building).'
                  : editedPlan.language === 'French'
                  ? 'Présentation des concepts, travaux de groupe, activités guidées et exercices pratiques axés sur les compétences.'
                  : 'Teacher explanation, active student group work, guided problem solving, and hands-on competence building.'}
              </p>
            </div>

            {/* Phase 3: Conclusion & Assessment */}
            <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  3. Conclusion & Evaluation
                </span>
                <span className="text-[11px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-950">
                  5 - 7 Min
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {editedPlan.language === 'Kinyarwanda'
                  ? 'Gukora umwanzuro w\'isomo (Summary of key takeaways), ikibazo kigufi cyo gusuzuma (Evaluation/Exit ticket), n\'umukoro wo murugo (Homework/Self-study).'
                  : editedPlan.language === 'French'
                  ? 'Synthèse de la leçon, évaluation rapide des acquis (quiz/questions) et attribution des devoirs à domicile.'
                  : 'Synthesize core takeaways, conduct brief exit assessment or quiz, and assign homework or self-study.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {isEditMode && (
        <div className="bg-amber-500/10 border-2 border-amber-400 p-4 rounded-2xl text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <span className="p-1.5 bg-amber-400 text-slate-950 rounded-lg shadow-2xs font-black">✏️</span>
            <div>
              <p className="font-extrabold text-sm text-amber-950">
                {editedPlan.language === 'Kinyarwanda'
                  ? 'Ubushobozi bwo Guhindura Isomo (Live Edit Mode Active)'
                  : editedPlan.language === 'French'
                  ? 'Mode Édition En Direct Actif'
                  : 'Live Edit Mode Active'}
              </p>
              <p className="text-xs font-medium text-amber-800">
                {editedPlan.language === 'Kinyarwanda'
                  ? 'Kanda kuri buri gace cyangwa agasanduku wandikemo ibyo wifuza gukosora no kongeramo mbere yo gucapa (print) cyangwa kubika PDF.'
                  : editedPlan.language === 'French'
                  ? 'Cliquez sur n\'importe quelle zone de texte pour la modifier directement avant l\'impression ou le téléchargement.'
                  : 'Click into any text field or table cell below to manually tweak or rewrite specific parts before printing or saving.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={handleAddStep}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{editedPlan.language === 'Kinyarwanda' ? 'Ongeramo Ingingo (Add Step)' : 'Add Step'}</span>
            </button>
            <button
              onClick={() => setIsEditMode(false)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{editedPlan.language === 'Kinyarwanda' ? 'Bika Ibiahinduwe (Save)' : 'Save & Exit'}</span>
            </button>
          </div>
        </div>
      )}

      {/* PRINT STYLES SPECIFICALLY FOR CLEAN A4 SINGLE-PAGE PRINT OUTPUT */}
      <style>{`
        .one-page-pdf-fit {
          font-size: 9.5px !important;
          line-height: 1.18 !important;
          padding: 12px !important;
        }
        .one-page-pdf-fit table {
          margin-top: 2px !important;
          margin-bottom: 3px !important;
        }
        .one-page-pdf-fit table td,
        .one-page-pdf-fit table th {
          padding: 2px 3.5px !important;
          font-size: 9.5px !important;
          line-height: 1.15 !important;
        }
        .one-page-pdf-fit textarea {
          font-size: 9.5px !important;
          padding: 1px !important;
          line-height: 1.15 !important;
        }
        .one-page-pdf-fit input {
          font-size: 9.5px !important;
          padding: 1px !important;
        }
        .one-page-pdf-fit h1, .one-page-pdf-fit h2, .one-page-pdf-fit h3 {
          margin-top: 2px !important;
          margin-bottom: 2px !important;
          font-size: 11px !important;
        }
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 9pt !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden, button {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 4mm 4mm 4mm 4mm;
          }
          .printable-document {
            box-shadow: none !important;
            border: none !important;
            padding: 2mm !important;
            margin: 0 !important;
            width: 100% !important;
            max-height: 288mm !important;
            overflow: hidden !important;
          }
          table {
            page-break-inside: avoid !important;
            width: 100% !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
          input, textarea {
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            outline: none !important;
            padding: 0 !important;
            resize: none !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* Document Container */}
      <div
        ref={printRef}
        className={`printable-document bg-white p-4 sm:p-6 rounded-2xl border border-slate-300 shadow-md max-w-5xl mx-auto text-slate-900 font-serif leading-tight ${
          isOnePageFit ? 'one-page-pdf-fit' : ''
        }`}
        style={{ color: '#000' }}
      >
        {isRebGrid ? (
          /* EXACT REB / CBC GRID FORMAT */
          <div className="space-y-2">
            {isRemedial && (
              <div className="print:hidden bg-gradient-to-r from-indigo-950 via-indigo-900 to-violet-950 text-white p-3 rounded-xl border-2 border-indigo-900 mb-2 font-sans shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-400 text-slate-950 rounded-lg shadow-2xs font-black">
                    <Sparkles className="w-4 h-4 fill-amber-100 text-slate-950" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-amber-300">
                      {labels.remedialProgramTitle || 'REMEDIAL LEARNING PROGRAM (RLP) LESSON PLAN'}
                    </h2>
                    <p className="text-[10px] text-indigo-200 font-medium mt-0.5">
                      Gahunda y'Isomo ryo Kungoza no Kuzahura Abanyeshuri bafite inyunganira zitandukanye
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-block px-2.5 py-0.5 bg-indigo-800 text-amber-300 border border-indigo-700 rounded-full text-[10px] font-extrabold shadow-2xs">
                  RLP Differentiation
                </span>
              </div>
            )}

            {/* Header Line */}
            {!isRemedial && (
              <div className="flex justify-between items-center text-xs font-sans font-bold border-b border-slate-800 pb-1 mb-1.5">
                <div className="flex items-center gap-1">
                  {labels.schoolNameLabel}{' '}
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editedPlan.header.schoolName}
                      onChange={(e) => handleHeaderChange('schoolName', e.target.value)}
                      className="font-semibold underline uppercase border border-amber-400 bg-amber-50/50 px-1.5 py-0.5 rounded text-xs ml-1"
                    />
                  ) : (
                    <span className="font-semibold underline uppercase ml-1">{editedPlan.header.schoolName}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {labels.teacherNameLabel}{' '}
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editedPlan.header.teacherName}
                      onChange={(e) => handleHeaderChange('teacherName', e.target.value)}
                      className="font-semibold underline uppercase border border-amber-400 bg-amber-50/50 px-1.5 py-0.5 rounded text-xs ml-1"
                    />
                  ) : (
                    <span className="font-semibold underline uppercase ml-1">{editedPlan.header.teacherName}</span>
                  )}
                </div>
              </div>
            )}

            {/* Remedial Group Differentiation Cards Layout */}
            {isRemedial && (
              <div className="print:hidden my-2 p-2.5 rounded-xl bg-indigo-50/90 border border-indigo-300 space-y-1.5 font-sans">
                <div className="flex items-center justify-between border-b border-indigo-200/80 pb-1">
                  <div className="flex items-center gap-1.5 text-indigo-950 font-black text-xs uppercase tracking-wide">
                    <Users className="w-3.5 h-3.5 text-indigo-700" />
                    <span>Amatsinda y'Abanyeshuri (RLP Learner Differentiation Groups)</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-300">
                    Category Breakdown
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {/* Remediation Group Card */}
                  <div className="bg-white p-2 rounded-lg border-l-4 border-l-rose-500 border border-slate-200 shadow-2xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-rose-950 text-[10px] flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-rose-600" />
                        Group 1: Remediation
                      </span>
                      <span className="px-1.5 py-0.5 bg-rose-100 text-rose-900 font-black rounded-full text-[9px]">
                        {editedPlan.header.remedialCount || '8'} Learners
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-700 font-medium leading-tight">
                      {editedPlan.header.remedialGroup1Category || 'Abakeneye inyunganira yihariye no gufashwa ku ntego z\'isomo'}
                    </p>
                  </div>

                  {/* Consolidation Group Card */}
                  <div className="bg-white p-2 rounded-lg border-l-4 border-l-indigo-600 border border-slate-200 shadow-2xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-indigo-950 text-[10px] flex items-center gap-1">
                        <Users className="w-3 h-3 text-indigo-600" />
                        Group 2: Consolidation
                      </span>
                      <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-900 font-black rounded-full text-[9px]">
                        {editedPlan.header.consolidationCount || '22'} Learners
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-700 font-medium leading-tight">
                      {editedPlan.header.remedialGroup2Category || 'Abageze ku ntego bakeneye imyitozo yo gukomeza ubumenyi'}
                    </p>
                  </div>

                  {/* Extension Group Card */}
                  <div className="bg-white p-2 rounded-lg border-l-4 border-l-emerald-600 border border-slate-200 shadow-2xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-emerald-950 text-[10px] flex items-center gap-1">
                        <Zap className="w-3 h-3 text-emerald-600" />
                        Group 3: Extension
                      </span>
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-900 font-black rounded-full text-[9px]">
                        {editedPlan.header.extensionCount || '10'} Learners
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-700 font-medium leading-tight">
                      {editedPlan.header.remedialGroup3Category || 'Abihuta bakeneye ibibazo bitoroshye no gukaza ubumenyi'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isRemedial ? (
              <div className="space-y-1.5 font-sans text-xs">
                {/* REMEDIAL TITLE */}
                <div className="text-center border-b-2 border-indigo-950 pb-0.5 mb-0.5">
                  <h1 className="text-sm sm:text-base font-black text-indigo-950 uppercase tracking-wide">
                    REMEDIAL LEARNING LESSON PLAN
                  </h1>
                </div>

                {/* SECTION A: GENERAL INFORMATION */}
                <div>
                  <h3 className="text-xs font-black text-indigo-950 uppercase border-b border-indigo-950 pb-0.5 mb-1 flex items-center justify-between">
                    <span>A. GENERAL INFORMATION</span>
                    <span className="text-[10px] text-indigo-700 font-bold lowercase italic">Amakuru Rusange</span>
                  </h3>
                  <table className="w-full border-collapse border border-slate-900 text-xs">
                    <tbody>
                      <tr>
                        <td className="border border-slate-900 p-1 font-bold bg-slate-100 w-1/4 text-slate-900">School Name:</td>
                        <td className="border border-slate-900 p-1 w-1/4 font-medium">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editedPlan.header.schoolName}
                              onChange={(e) => handleHeaderChange('schoolName', e.target.value)}
                              className="w-full border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs font-semibold"
                            />
                          ) : (
                            editedPlan.header.schoolName || 'N/A'
                          )}
                        </td>
                        <td className="border border-slate-900 p-1 font-bold bg-slate-100 w-1/4 text-slate-900">District:</td>
                        <td className="border border-slate-900 p-1 w-1/4 font-medium">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editedPlan.header.district || ''}
                              onChange={(e) => handleHeaderChange('district', e.target.value)}
                              className="w-full border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs font-semibold"
                            />
                          ) : (
                            editedPlan.header.district || 'N/A'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-900 p-1 font-bold bg-slate-100 text-slate-900">Class:</td>
                        <td className="border border-slate-900 p-1 font-medium">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editedPlan.header.classGrade}
                              onChange={(e) => handleHeaderChange('classGrade', e.target.value)}
                              className="w-full border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs font-semibold"
                            />
                          ) : (
                            editedPlan.header.classGrade || 'N/A'
                          )}
                        </td>
                        <td className="border border-slate-900 p-1 font-bold bg-slate-100 text-slate-900">Period (minutes):</td>
                        <td className="border border-slate-900 p-1 font-medium">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editedPlan.header.duration}
                              onChange={(e) => handleHeaderChange('duration', e.target.value)}
                              className="w-full border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs font-semibold"
                            />
                          ) : (
                            editedPlan.header.duration || 'N/A'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-900 p-1 font-bold bg-slate-100 text-slate-900">Lesson Topic:</td>
                        <td className="border border-slate-900 p-1 font-bold text-indigo-950">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editedPlan.header.lessonTitle}
                              onChange={(e) => handleHeaderChange('lessonTitle', e.target.value)}
                              className="w-full border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs font-bold text-indigo-950"
                            />
                          ) : (
                            editedPlan.header.lessonTitle || 'N/A'
                          )}
                        </td>
                        <td className="border border-slate-900 p-1 font-bold bg-slate-100 text-slate-900">Date:</td>
                        <td className="border border-slate-900 p-1 font-medium">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editedPlan.header.date}
                              onChange={(e) => handleHeaderChange('date', e.target.value)}
                              className="w-full border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs font-semibold"
                            />
                          ) : (
                            editedPlan.header.date || 'N/A'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-900 p-1 font-bold bg-slate-100 text-slate-900">Teacher Name:</td>
                        <td colSpan={3} className="border border-slate-900 p-1 font-semibold">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editedPlan.header.teacherName}
                              onChange={(e) => handleHeaderChange('teacherName', e.target.value)}
                              className="w-full border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs font-semibold"
                            />
                          ) : (
                            editedPlan.header.teacherName || 'N/A'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-900 p-1 font-bold bg-rose-50 text-rose-950">
                          Number of learners who need remediation activities:
                        </td>
                        <td colSpan={3} className="border border-slate-900 p-1 font-bold text-rose-900">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editedPlan.header.remedialCount || ''}
                              onChange={(e) => handleHeaderChange('remedialCount', e.target.value)}
                              className="w-24 border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs font-bold"
                            />
                          ) : (
                            editedPlan.header.remedialCount || '5'
                          )}{' '}
                          students
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-900 p-1 font-bold bg-indigo-50 text-indigo-950">
                          Number of students who need consolidation activities:
                        </td>
                        <td colSpan={3} className="border border-slate-900 p-1 font-bold text-indigo-900">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editedPlan.header.consolidationCount || ''}
                              onChange={(e) => handleHeaderChange('consolidationCount', e.target.value)}
                              className="w-24 border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs font-bold"
                            />
                          ) : (
                            editedPlan.header.consolidationCount || '5'
                          )}{' '}
                          students
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-900 p-1 font-bold bg-emerald-50 text-emerald-950">
                          Number of students who need extended activities:
                        </td>
                        <td colSpan={3} className="border border-slate-900 p-1 font-bold text-emerald-900">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editedPlan.header.extensionCount || ''}
                              onChange={(e) => handleHeaderChange('extensionCount', e.target.value)}
                              className="w-24 border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs font-bold"
                            />
                          ) : (
                            editedPlan.header.extensionCount || '4'
                          )}{' '}
                          students
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* SECTION B: IDENTIFIED GROUPS OF STRUGGLING LEARNERS */}
                <div>
                  <h3 className="text-xs font-black text-indigo-950 uppercase border-b border-indigo-950 pb-0.5 mb-1 flex items-center justify-between">
                    <span>B. IDENTIFIED GROUPS OF STRUGGLING LEARNERS</span>
                    <span className="text-[10px] text-indigo-700 font-bold lowercase italic">Intego za buri kiciro</span>
                  </h3>
                  <table className="w-full border-collapse border border-slate-900 text-xs">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-slate-900">
                        <th className="border border-slate-900 p-1 w-1/2 text-left">
                          Categories of learners who need the remedial activities
                        </th>
                        <th className="border border-slate-900 p-1 w-1/2 text-left">
                          Objectives per categories identified
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Group 1 */}
                      <tr className="align-top">
                        <td className="border border-slate-900 p-1 font-medium">
                          <span className="font-bold text-rose-900">Group 1:</span>{' '}
                          {isEditMode ? (
                            <textarea
                              value={editedPlan.header.remedialGroup1Category || ''}
                              onChange={(e) => handleHeaderChange('remedialGroup1Category', e.target.value)}
                              rows={2}
                              className="w-full border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs mt-0.5"
                            />
                          ) : (
                            editedPlan.header.remedialGroup1Category ||
                            `Learners with problems related to understanding fundamental concepts of ${editedPlan.header.lessonTitle || 'this topic'}.`
                          )}
                        </td>
                        <td className="border border-slate-900 p-1">
                          <span className="font-bold text-rose-900">Group 1 Objective:</span>{' '}
                          {isEditMode ? (
                            <textarea
                              value={remVals.group1Objective}
                              onChange={(e) => handleHeaderChange('group1Objective', e.target.value)}
                              rows={2}
                              className="w-full border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs mt-0.5"
                            />
                          ) : (
                            remVals.group1Objective
                          )}
                        </td>
                      </tr>
                      {/* Group 2 */}
                      <tr className="align-top">
                        <td className="border border-slate-900 p-1 font-medium">
                          <span className="font-bold text-indigo-900">Group 2:</span>{' '}
                          {isEditMode ? (
                            <textarea
                              value={editedPlan.header.remedialGroup2Category || ''}
                              onChange={(e) => handleHeaderChange('remedialGroup2Category', e.target.value)}
                              rows={2}
                              className="w-full border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs mt-0.5"
                            />
                          ) : (
                            editedPlan.header.remedialGroup2Category ||
                            `Learners struggling with consistent application of ${editedPlan.header.lessonTitle || 'this topic'} methods across different problem types.`
                          )}
                        </td>
                        <td className="border border-slate-900 p-1">
                          <span className="font-bold text-indigo-900">Group 2 Objective:</span>{' '}
                          {isEditMode ? (
                            <textarea
                              value={remVals.group2Objective}
                              onChange={(e) => handleHeaderChange('group2Objective', e.target.value)}
                              rows={2}
                              className="w-full border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs mt-0.5"
                            />
                          ) : (
                            remVals.group2Objective
                          )}
                        </td>
                      </tr>
                      {/* Group 3 */}
                      <tr className="align-top">
                        <td className="border border-slate-900 p-1 font-medium">
                          <span className="font-bold text-emerald-900">Group 3:</span>{' '}
                          {isEditMode ? (
                            <textarea
                              value={editedPlan.header.remedialGroup3Category || ''}
                              onChange={(e) => handleHeaderChange('remedialGroup3Category', e.target.value)}
                              rows={2}
                              className="w-full border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs mt-0.5"
                            />
                          ) : (
                            editedPlan.header.remedialGroup3Category ||
                            `Learners requiring comprehensive support across multiple aspects of ${editedPlan.header.lessonTitle || 'this topic'}.`
                          )}
                        </td>
                        <td className="border border-slate-900 p-1">
                          <span className="font-bold text-emerald-900">Group 3 Objective:</span>{' '}
                          {isEditMode ? (
                            <textarea
                              value={remVals.group3Objective}
                              onChange={(e) => handleHeaderChange('group3Objective', e.target.value)}
                              rows={2}
                              className="w-full border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs mt-0.5"
                            />
                          ) : (
                            remVals.group3Objective
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* SECTION C: IDENTIFIED PROBLEMS, REMEDIAL ACTIVITIES AND LEARNING AIDS */}
                <div>
                  <h3 className="text-xs font-black text-indigo-950 uppercase border-b border-indigo-950 pb-0.5 mb-1 flex items-center justify-between">
                    <span>C. IDENTIFIED PROBLEMS, REMEDIAL ACTIVITIES AND LEARNING AIDS</span>
                    <span className="text-[10px] text-indigo-700 font-bold lowercase italic">Imyitozo n'Imfashanyigisho</span>
                  </h3>
                  <table className="w-full border-collapse border border-slate-900 text-xs">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-slate-900 text-left">
                        <th className="border border-slate-900 p-1 w-[22%]">Identified problems</th>
                        <th className="border border-slate-900 p-1 w-[32%]">Remedial activities</th>
                        <th className="border border-slate-900 p-1 w-[26%]">Used steps including assessment</th>
                        <th className="border border-slate-900 p-1 w-[20%]">Teaching and learning aids</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="align-top">
                        {/* Identified Problems */}
                        <td className="border border-slate-900 p-1 whitespace-pre-line font-medium leading-snug">
                          {isEditMode ? (
                            <textarea
                              value={remVals.identifiedProblems}
                              onChange={(e) => handleHeaderChange('identifiedProblems', e.target.value)}
                              rows={4}
                              className="w-full border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs leading-snug"
                            />
                          ) : (
                            remVals.identifiedProblems
                          )}
                        </td>

                        {/* Remedial Activities */}
                        <td className="border border-slate-900 p-1 space-y-1 whitespace-pre-line leading-snug">
                          {isEditMode ? (
                            <div className="space-y-1">
                              <div>
                                <label className="font-bold text-rose-900 text-[10px] uppercase">Group 1 Activities:</label>
                                <textarea
                                  value={remVals.remedialActivitiesGroup1}
                                  onChange={(e) => handleHeaderChange('remedialActivitiesGroup1', e.target.value)}
                                  rows={2}
                                  className="w-full border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs leading-snug"
                                />
                              </div>
                              <div>
                                <label className="font-bold text-indigo-900 text-[10px] uppercase">Group 2 Activities:</label>
                                <textarea
                                  value={remVals.remedialActivitiesGroup2}
                                  onChange={(e) => handleHeaderChange('remedialActivitiesGroup2', e.target.value)}
                                  rows={2}
                                  className="w-full border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs leading-snug"
                                />
                              </div>
                              <div>
                                <label className="font-bold text-emerald-900 text-[10px] uppercase">Group 3 Activities:</label>
                                <textarea
                                  value={remVals.remedialActivitiesGroup3}
                                  onChange={(e) => handleHeaderChange('remedialActivitiesGroup3', e.target.value)}
                                  rows={2}
                                  className="w-full border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs leading-snug"
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="text-slate-900 font-medium">
                                {remVals.remedialActivitiesGroup1}
                              </div>
                              <div className="text-slate-900 font-medium pt-1 border-t border-slate-200">
                                {remVals.remedialActivitiesGroup2}
                              </div>
                              <div className="text-slate-900 font-medium pt-1 border-t border-slate-200">
                                {remVals.remedialActivitiesGroup3}
                              </div>
                            </>
                          )}
                        </td>

                        {/* Used Steps & Assessment */}
                        <td className="border border-slate-900 p-1 whitespace-pre-line font-medium leading-snug">
                          {isEditMode ? (
                            <textarea
                              value={remVals.usedStepsAssessment}
                              onChange={(e) => handleHeaderChange('usedStepsAssessment', e.target.value)}
                              rows={4}
                              className="w-full border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs leading-snug"
                            />
                          ) : (
                            remVals.usedStepsAssessment
                          )}
                        </td>

                        {/* Teaching & Learning Aids */}
                        <td className="border border-slate-900 p-1 whitespace-pre-line font-medium leading-snug">
                          {isEditMode ? (
                            <textarea
                              value={remVals.remedialAids}
                              onChange={(e) => handleHeaderChange('remedialAids', e.target.value)}
                              rows={4}
                              className="w-full border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs leading-snug"
                            />
                          ) : (
                            remVals.remedialAids
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* SECTION D: CONSOLIDATION AND EXTENDED ACTIVITIES FOR OTHER LEARNERS */}
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-indigo-950 uppercase border-b-2 border-indigo-950 pb-1 mb-2 flex items-center justify-between">
                    <span>D. CONSOLIDATION AND EXTENDED ACTIVITIES FOR OTHER LEARNERS</span>
                    <span className="text-[10px] text-indigo-700 font-bold lowercase italic">Imyitozo yo gukomeza ubumenyi n'yisumbuye</span>
                  </h3>
                  <table className="w-full border-collapse border border-slate-900 text-xs">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-slate-900 text-left">
                        <th className="border border-slate-900 p-2 w-[22%]">Category of learners</th>
                        <th className="border border-slate-900 p-2 w-[32%]">Activities</th>
                        <th className="border border-slate-900 p-2 w-[26%]">Methodology used</th>
                        <th className="border border-slate-900 p-2 w-[20%]">Learning aids</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Consolidation Row */}
                      <tr className="align-top">
                        <td className="border border-slate-900 p-2 font-bold text-indigo-950 bg-indigo-50/40">
                          {isEditMode ? (
                            <textarea
                              value={remVals.consolidationCategory}
                              onChange={(e) => handleHeaderChange('consolidationCategory', e.target.value)}
                              rows={3}
                              className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs font-bold"
                            />
                          ) : (
                            remVals.consolidationCategory
                          )}
                        </td>
                        <td className="border border-slate-900 p-2 whitespace-pre-line leading-relaxed font-medium">
                          {isEditMode ? (
                            <textarea
                              value={remVals.consolidationActivities}
                              onChange={(e) => handleHeaderChange('consolidationActivities', e.target.value)}
                              rows={5}
                              className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs leading-relaxed"
                            />
                          ) : (
                            remVals.consolidationActivities
                          )}
                        </td>
                        <td className="border border-slate-900 p-2 whitespace-pre-line leading-relaxed font-medium">
                          {isEditMode ? (
                            <textarea
                              value={remVals.consolidationMethodology}
                              onChange={(e) => handleHeaderChange('consolidationMethodology', e.target.value)}
                              rows={5}
                              className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs leading-relaxed"
                            />
                          ) : (
                            remVals.consolidationMethodology
                          )}
                        </td>
                        <td className="border border-slate-900 p-2 whitespace-pre-line leading-relaxed font-medium">
                          {isEditMode ? (
                            <textarea
                              value={remVals.consolidationAids}
                              onChange={(e) => handleHeaderChange('consolidationAids', e.target.value)}
                              rows={5}
                              className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs leading-relaxed"
                            />
                          ) : (
                            remVals.consolidationAids
                          )}
                        </td>
                      </tr>

                      {/* Extended Activities Row */}
                      <tr className="align-top">
                        <td className="border border-slate-900 p-2 font-bold text-emerald-950 bg-emerald-50/40">
                          <div className="text-[10px] uppercase font-black tracking-wider text-emerald-800 mb-0.5">EXTENDED ACTIVITIES</div>
                          {isEditMode ? (
                            <textarea
                              value={remVals.extensionCategory}
                              onChange={(e) => handleHeaderChange('extensionCategory', e.target.value)}
                              rows={3}
                              className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs font-bold"
                            />
                          ) : (
                            remVals.extensionCategory
                          )}
                        </td>
                        <td className="border border-slate-900 p-2 whitespace-pre-line leading-relaxed font-medium">
                          {isEditMode ? (
                            <textarea
                              value={remVals.extensionActivities}
                              onChange={(e) => handleHeaderChange('extensionActivities', e.target.value)}
                              rows={5}
                              className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs leading-relaxed"
                            />
                          ) : (
                            remVals.extensionActivities
                          )}
                        </td>
                        <td className="border border-slate-900 p-2 whitespace-pre-line leading-relaxed font-medium">
                          {isEditMode ? (
                            <textarea
                              value={remVals.extensionMethodology}
                              onChange={(e) => handleHeaderChange('extensionMethodology', e.target.value)}
                              rows={5}
                              className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs leading-relaxed"
                            />
                          ) : (
                            remVals.extensionMethodology
                          )}
                        </td>
                        <td className="border border-slate-900 p-2 whitespace-pre-line leading-relaxed font-medium">
                          {isEditMode ? (
                            <textarea
                              value={remVals.extensionAids}
                              onChange={(e) => handleHeaderChange('extensionAids', e.target.value)}
                              rows={5}
                              className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs leading-relaxed"
                            />
                          ) : (
                            remVals.extensionAids
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Teacher's Self-Evaluation joined directly to Section D */}
                  <div className="mt-3 p-3 bg-indigo-50/20 border border-slate-900 rounded-sm space-y-2">
                    <div className="text-[11px] font-black uppercase tracking-wider text-indigo-950">
                      {editedPlan.language === 'Kinyarwanda' ? 'ISUZUMA-BUMENYI BWA MWARIMU (Self-Evaluation)' : "Teacher's Self-Evaluation"}
                    </div>
                    {isEditMode ? (
                      <textarea
                        value={editedPlan.selfEvaluation || ''}
                        onChange={(e) => setEditedPlan(prev => ({ ...prev, selfEvaluation: e.target.value }))}
                        rows={3}
                        placeholder={
                          editedPlan.language === 'Kinyarwanda'
                            ? "Andika isuzuma-bumenyi ryawe hano nka mwarimu nyuma yo kwigisha isomo..."
                            : "Write your self-evaluation here as a teacher after delivering the lesson..."
                        }
                        className="w-full border border-amber-300 bg-amber-50/40 p-2 rounded text-xs leading-relaxed font-sans"
                      />
                    ) : (
                      <p className="whitespace-pre-line leading-relaxed text-slate-900 font-medium min-h-[45px]">
                        {editedPlan.selfEvaluation || (
                          <span className="text-slate-400 italic text-[11px]">
                            {editedPlan.language === 'Kinyarwanda'
                              ? "Isuzuma-bumenyi rya mwarimu (Rijuzwa n'umwarimu nyuma yo kwigisha isomo / To be filled by teacher after lesson execution)."
                              : "Teacher's Self-Evaluation (To be filled by teacher after lesson execution)."}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              /* Table 1: Lesson Metadata */
              <table className="w-full border-collapse border border-slate-900 text-xs font-sans">
                <tbody>
                  {/* Row 1: Headers */}
                  <tr className={isRemedial ? "bg-indigo-900 text-white text-center font-bold" : "bg-slate-100/90 text-center font-bold"}>
                    <td className="border border-slate-900 p-1 w-[10%]">{labels.term}</td>
                    <td className="border border-slate-900 p-1 w-[12%]">{labels.date}</td>
                    <td className="border border-slate-900 p-1 w-[18%]">{labels.subject}</td>
                    <td className="border border-slate-900 p-1 w-[12%]">{labels.classGrade}</td>
                    <td className="border border-slate-900 p-1 w-[10%]">{labels.unitNo}</td>
                    <td className="border border-slate-900 p-1 w-[13%]">{labels.lessonNo}</td>
                    <td className="border border-slate-900 p-1 w-[12.5%]">{labels.duration}</td>
                    <td className="border border-slate-900 p-1 w-[12.5%]">{labels.classSize}</td>
                  </tr>
                  {/* Row 1: Values */}
                  <tr className="text-center font-medium">
                    <td className="border border-slate-900 p-1">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editedPlan.header.term}
                          onChange={(e) => handleHeaderChange('term', e.target.value)}
                          className="w-full text-center border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs"
                        />
                      ) : (
                        editedPlan.header.term
                      )}
                    </td>
                    <td className="border border-slate-900 p-1">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editedPlan.header.date}
                          onChange={(e) => handleHeaderChange('date', e.target.value)}
                          className="w-full text-center border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs"
                        />
                      ) : (
                        editedPlan.header.date
                      )}
                    </td>
                    <td className="border border-slate-900 p-1 font-semibold">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editedPlan.header.subject}
                          onChange={(e) => handleHeaderChange('subject', e.target.value)}
                          className="w-full text-center border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs font-semibold"
                        />
                      ) : (
                        editedPlan.header.subject
                      )}
                    </td>
                    <td className="border border-slate-900 p-1">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editedPlan.header.classGrade}
                          onChange={(e) => handleHeaderChange('classGrade', e.target.value)}
                          className="w-full text-center border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs"
                        />
                      ) : (
                        editedPlan.header.classGrade
                      )}
                    </td>
                    <td className="border border-slate-900 p-1">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editedPlan.header.unitNo}
                          onChange={(e) => handleHeaderChange('unitNo', e.target.value)}
                          className="w-full text-center border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs"
                        />
                      ) : (
                        editedPlan.header.unitNo
                      )}
                    </td>
                    <td className="border border-slate-900 p-1">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editedPlan.header.lessonNo}
                          onChange={(e) => handleHeaderChange('lessonNo', e.target.value)}
                          className="w-full text-center border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs"
                        />
                      ) : (
                        editedPlan.header.lessonNo
                      )}
                    </td>
                    <td className="border border-slate-900 p-1">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editedPlan.header.duration}
                          onChange={(e) => handleHeaderChange('duration', e.target.value)}
                          className="w-full text-center border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs"
                        />
                      ) : (
                        editedPlan.header.duration
                      )}
                    </td>
                    <td className="border border-slate-900 p-1">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editedPlan.header.classSize}
                          onChange={(e) => handleHeaderChange('classSize', e.target.value)}
                          className="w-full text-center border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs"
                        />
                      ) : (
                        editedPlan.header.classSize
                      )}
                    </td>
                  </tr>

                  {/* Row 2: Special Educational Needs */}
                  <tr>
                    <td colSpan={2} className="border border-slate-900 p-1.5 font-bold bg-slate-50 text-[11px]">
                      {labels.specialNeeds}
                    </td>
                    <td colSpan={6} className="border border-slate-900 p-1.5 text-xs">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editedPlan.header.specialNeeds}
                          onChange={(e) => handleHeaderChange('specialNeeds', e.target.value)}
                          className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs"
                        />
                      ) : (
                        editedPlan.header.specialNeeds
                      )}
                    </td>
                  </tr>

                  {/* Row 3: Unit Title */}
                  <tr>
                    <td colSpan={2} className="border border-slate-900 p-1.5 font-bold bg-slate-50 text-[11px]">
                      {labels.unitTitle}
                    </td>
                    <td colSpan={6} className="border border-slate-900 p-1.5 text-xs font-semibold">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editedPlan.header.unitTitle}
                          onChange={(e) => handleHeaderChange('unitTitle', e.target.value)}
                          className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs font-semibold"
                        />
                      ) : (
                        editedPlan.header.unitTitle
                      )}
                    </td>
                  </tr>

                  {/* Row 4: Key Unit Competence */}
                  <tr>
                    <td colSpan={2} className="border border-slate-900 p-1.5 font-bold bg-slate-50 text-[11px]">
                      {labels.keyUnitCompetence}
                    </td>
                    <td colSpan={6} className="border border-slate-900 p-1.5 text-xs">
                      {isEditMode ? (
                        <textarea
                          value={editedPlan.header.keyUnitCompetence}
                          onChange={(e) => handleHeaderChange('keyUnitCompetence', e.target.value)}
                          rows={2}
                          className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs"
                        />
                      ) : (
                        editedPlan.header.keyUnitCompetence
                      )}
                    </td>
                  </tr>

                  {/* Row 5: Title of the lesson */}
                  <tr>
                    <td colSpan={2} className="border border-slate-900 p-1.5 font-bold bg-slate-50 text-[11px]">
                      {labels.lessonTitle}
                    </td>
                    <td colSpan={6} className="border border-slate-900 p-1.5 text-xs font-bold text-emerald-900">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editedPlan.header.lessonTitle}
                          onChange={(e) => handleHeaderChange('lessonTitle', e.target.value)}
                          className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs font-bold text-emerald-900"
                        />
                      ) : (
                        editedPlan.header.lessonTitle
                      )}
                    </td>
                  </tr>

                  {/* Row 6: Instructional Objective */}
                  <tr>
                    <td colSpan={2} className="border border-slate-900 p-1.5 font-bold bg-slate-50 text-[11px]">
                      {labels.instructionalObjective}
                    </td>
                    <td colSpan={6} className="border border-slate-900 p-1.5 text-xs">
                      {isEditMode ? (
                        <textarea
                          value={editedPlan.header.instructionalObjective}
                          onChange={(e) => handleHeaderChange('instructionalObjective', e.target.value)}
                          rows={2}
                          className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs"
                        />
                      ) : (
                        editedPlan.header.instructionalObjective
                      )}
                    </td>
                  </tr>

                  {/* Row 7: Plan for this Class */}
                  <tr>
                    <td colSpan={2} className="border border-slate-900 p-1.5 font-bold bg-slate-50 text-[11px]">
                      {labels.planForClass}<br />
                      <span className="font-normal italic">{labels.planLocationNote}</span>
                    </td>
                    <td colSpan={6} className="border border-slate-900 p-1.5 text-xs">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editedPlan.header.location}
                          onChange={(e) => handleHeaderChange('location', e.target.value)}
                          className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs"
                        />
                      ) : (
                        editedPlan.header.location
                      )}
                    </td>
                  </tr>

                  {/* Row 8: Learning Materials */}
                  <tr>
                    <td colSpan={2} className="border border-slate-900 p-1.5 font-bold bg-slate-50 text-[11px]">
                      {labels.learningMaterials}<br />
                      <span className="font-normal italic">{labels.learningMaterialsNote}</span>
                    </td>
                    <td colSpan={6} className="border border-slate-900 p-1.5 text-xs">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editedPlan.header.learningMaterials}
                          onChange={(e) => handleHeaderChange('learningMaterials', e.target.value)}
                          className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs"
                        />
                      ) : (
                        editedPlan.header.learningMaterials
                      )}
                    </td>
                  </tr>

                  {/* Row 9: References */}
                  <tr>
                    <td colSpan={2} className="border border-slate-900 p-1.5 font-bold bg-slate-50 text-[11px]">
                      {labels.references}
                    </td>
                    <td colSpan={6} className="border border-slate-900 p-1.5 text-xs">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editedPlan.header.references}
                          onChange={(e) => handleHeaderChange('references', e.target.value)}
                          className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs"
                        />
                      ) : (
                        editedPlan.header.references
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}

            {!isRemedial && (
              <div className="space-y-3">
                {/* Table 2: Lesson Steps */}
                <table className="w-full border-collapse border border-slate-900 text-xs font-sans mt-3">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th rowSpan={2} className="border border-slate-900 p-2 w-[18%] align-middle">
                      {labels.timingHeading}
                    </th>
                    <th colSpan={2} className="border border-slate-900 p-1.5">
                      {labels.descriptionHeading}
                    </th>
                    <th rowSpan={2} className="border border-slate-900 p-2 w-[32%] align-middle text-left leading-snug">
                      {labels.competencesHeading}
                    </th>
                  </tr>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th className="border border-slate-900 p-1.5 w-[25%]">{labels.teacherActivitiesHeading}</th>
                    <th className="border border-slate-900 p-1.5 w-[25%]">{labels.learnerActivitiesHeading}</th>
                  </tr>
                </thead>
                <tbody>
                  {editedPlan.steps.map((step, idx) => (
                    <tr key={idx} className="align-top">
                      <td className="border border-slate-900 p-2 font-bold bg-slate-50 relative group">
                        {isEditMode ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={step.stepName}
                              onChange={(e) => handleStepChange(idx, 'stepName', e.target.value)}
                              className="w-full font-bold border border-amber-300 bg-amber-50/40 p-1 rounded text-xs"
                              placeholder="Step name"
                            />
                            <input
                              type="text"
                              value={step.timing}
                              onChange={(e) => handleStepChange(idx, 'timing', e.target.value)}
                              className="w-full border border-amber-300 bg-amber-50/40 p-0.5 rounded text-[11px] text-slate-700 font-normal"
                              placeholder="Timing (e.g. 5 min)"
                            />
                            {editedPlan.steps.length > 1 && (
                              <button
                                onClick={() => handleRemoveStep(idx)}
                                className="text-red-600 hover:text-red-800 text-[10px] font-medium flex items-center gap-0.5 mt-1 print:hidden"
                                title="Delete this step"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <>
                            <div>{step.stepName}</div>
                            <div className="text-[11px] text-slate-600 font-normal mt-0.5">({step.timing})</div>
                          </>
                        )}
                      </td>
                      <td className="border border-slate-900 p-2 whitespace-pre-line leading-snug text-justify">
                        {isEditMode ? (
                          <textarea
                            value={step.teacherActivities}
                            onChange={(e) => handleStepChange(idx, 'teacherActivities', e.target.value)}
                            rows={4}
                            className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs font-sans leading-snug"
                          />
                        ) : (
                          step.teacherActivities
                        )}
                      </td>
                      <td className="border border-slate-900 p-2 whitespace-pre-line leading-snug text-justify">
                        {isEditMode ? (
                          <textarea
                            value={step.learnerActivities}
                            onChange={(e) => handleStepChange(idx, 'learnerActivities', e.target.value)}
                            rows={4}
                            className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs font-sans leading-snug"
                          />
                        ) : (
                          step.learnerActivities
                        )}
                      </td>
                      <td className="border border-slate-900 p-2 whitespace-pre-line leading-snug">
                        {isEditMode ? (
                          <textarea
                            value={step.competencesAndCrossCutting}
                            onChange={(e) => handleStepChange(idx, 'competencesAndCrossCutting', e.target.value)}
                            rows={4}
                            className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs font-sans leading-snug"
                          />
                        ) : (
                          step.competencesAndCrossCutting
                        )}
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>

              {/* SECTION 4: TEACHER'S SELF-EVALUATION */}
              <div className="mt-4">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase border-b border-slate-900 pb-1 mb-2 flex items-center justify-between">
                  <span>{`${labels.selfEvaluation || "Teacher's Self-Evaluation"} / ISUZUMA-BUMENYI BWA MWARIMU`}</span>
                </h3>
                <div className="border border-slate-900 p-3 bg-slate-50/50 text-xs rounded-sm">
                  {isEditMode ? (
                    <textarea
                      value={editedPlan.selfEvaluation || ''}
                      onChange={(e) => setEditedPlan(prev => ({ ...prev, selfEvaluation: e.target.value }))}
                      rows={3}
                      placeholder={
                        editedPlan.language === 'Kinyarwanda'
                          ? "Andika isuzuma-bumenyi ryawe hano nka mwarimu nyuma yo kwigisha isomo..."
                          : "Type your self-evaluation here as a teacher after delivering the lesson..."
                      }
                      className="w-full border border-amber-300 bg-amber-50/40 p-2 rounded text-xs leading-relaxed font-sans"
                    />
                  ) : (
                    <p className="whitespace-pre-line leading-relaxed text-slate-900 font-medium min-h-[40px]">
                      {editedPlan.selfEvaluation || (
                        <span className="text-slate-400 italic">
                          {editedPlan.language === 'Kinyarwanda'
                            ? "Isuzuma-bumenyi rya mwarimu (Rijuzwa n'umwarimu nyuma yo kwigisha isomo / To be filled by teacher after lesson execution)."
                            : "Teacher's Self-Evaluation (To be filled by teacher after lesson execution)."}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
            )}
          </div>
        ) : (
          /* OPEN FORMAT VIEW */
          <div className="space-y-4 font-sans">
            <div className="border-b-2 border-emerald-600 pb-3">
              {isEditMode ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editedPlan.header.lessonTitle}
                    onChange={(e) => handleHeaderChange('lessonTitle', e.target.value)}
                    className="w-full text-xl font-bold text-slate-900 border border-amber-300 bg-amber-50/40 p-1 rounded"
                    placeholder="Lesson Title"
                  />
                  <div className="flex flex-wrap gap-2 text-xs">
                    <input
                      type="text"
                      value={editedPlan.header.schoolName}
                      onChange={(e) => handleHeaderChange('schoolName', e.target.value)}
                      className="border border-amber-300 bg-amber-50/40 p-1 rounded text-xs"
                      placeholder="School Name"
                    />
                    <input
                      type="text"
                      value={editedPlan.header.teacherName}
                      onChange={(e) => handleHeaderChange('teacherName', e.target.value)}
                      className="border border-amber-300 bg-amber-50/40 p-1 rounded text-xs"
                      placeholder="Teacher Name"
                    />
                    <input
                      type="text"
                      value={editedPlan.header.subject}
                      onChange={(e) => handleHeaderChange('subject', e.target.value)}
                      className="border border-amber-300 bg-amber-50/40 p-1 rounded text-xs"
                      placeholder="Subject"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-slate-900">{editedPlan.header.lessonTitle}</h1>
                  <p className="text-xs text-slate-600 mt-1">
                    {editedPlan.header.schoolName} | Teacher: {editedPlan.header.teacherName} | {editedPlan.header.subject} ({editedPlan.header.classGrade})
                  </p>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold">{labels.term}:</span>{' '}
                {isEditMode ? (
                  <input
                    type="text"
                    value={editedPlan.header.term}
                    onChange={(e) => handleHeaderChange('term', e.target.value)}
                    className="border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs"
                  />
                ) : (
                  editedPlan.header.term
                )}
              </div>
              <div>
                <span className="font-bold">{labels.date}:</span>{' '}
                {isEditMode ? (
                  <input
                    type="text"
                    value={editedPlan.header.date}
                    onChange={(e) => handleHeaderChange('date', e.target.value)}
                    className="border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs"
                  />
                ) : (
                  editedPlan.header.date
                )}
              </div>
              <div>
                <span className="font-bold">{labels.unitTitle}:</span>{' '}
                {isEditMode ? (
                  <input
                    type="text"
                    value={editedPlan.header.unitTitle}
                    onChange={(e) => handleHeaderChange('unitTitle', e.target.value)}
                    className="border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs"
                  />
                ) : (
                  editedPlan.header.unitTitle
                )}
              </div>
              <div>
                <span className="font-bold">{labels.duration}:</span>{' '}
                {isEditMode ? (
                  <input
                    type="text"
                    value={editedPlan.header.duration}
                    onChange={(e) => handleHeaderChange('duration', e.target.value)}
                    className="border border-amber-300 bg-amber-50/40 p-0.5 rounded text-xs"
                  />
                ) : (
                  editedPlan.header.duration
                )}
              </div>
              <div className="col-span-2">
                <span className="font-bold">{labels.keyUnitCompetence}:</span>{' '}
                {isEditMode ? (
                  <textarea
                    value={editedPlan.header.keyUnitCompetence}
                    onChange={(e) => handleHeaderChange('keyUnitCompetence', e.target.value)}
                    rows={2}
                    className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs mt-1"
                  />
                ) : (
                  editedPlan.header.keyUnitCompetence
                )}
              </div>
              <div className="col-span-2">
                <span className="font-bold">{labels.instructionalObjective}:</span>{' '}
                {isEditMode ? (
                  <textarea
                    value={editedPlan.header.instructionalObjective}
                    onChange={(e) => handleHeaderChange('instructionalObjective', e.target.value)}
                    rows={2}
                    className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs mt-1"
                  />
                ) : (
                  editedPlan.header.instructionalObjective
                )}
              </div>
            </div>

            {editedPlan.openFormatContent ? (
              isEditMode ? (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Open Format Lesson Plan Text:</label>
                  <textarea
                    value={editedPlan.openFormatContent}
                    onChange={(e) =>
                      setEditedPlan((prev) => ({
                        ...prev,
                        openFormatContent: e.target.value,
                      }))
                    }
                    rows={12}
                    className="w-full border-2 border-amber-400 bg-amber-50/40 p-3 rounded-xl text-xs font-sans leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-xs leading-relaxed whitespace-pre-line">
                  {editedPlan.openFormatContent}
                </div>
              )
            ) : (
              <div className="space-y-4">
                {editedPlan.steps.map((step, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-3 bg-white">
                    {isEditMode ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={step.stepName}
                            onChange={(e) => handleStepChange(idx, 'stepName', e.target.value)}
                            className="font-bold border border-amber-300 bg-amber-50/40 p-1 rounded text-xs flex-1"
                            placeholder="Step name"
                          />
                          <input
                            type="text"
                            value={step.timing}
                            onChange={(e) => handleStepChange(idx, 'timing', e.target.value)}
                            className="border border-amber-300 bg-amber-50/40 p-1 rounded text-xs w-28"
                            placeholder="Timing"
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="font-semibold text-slate-700 block text-[11px] mb-1">{labels.teacherActivitiesHeading}:</label>
                            <textarea
                              value={step.teacherActivities}
                              onChange={(e) => handleStepChange(idx, 'teacherActivities', e.target.value)}
                              rows={3}
                              className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs"
                            />
                          </div>
                          <div>
                            <label className="font-semibold text-slate-700 block text-[11px] mb-1">{labels.learnerActivitiesHeading}:</label>
                            <textarea
                              value={step.learnerActivities}
                              onChange={(e) => handleStepChange(idx, 'learnerActivities', e.target.value)}
                              rows={3}
                              className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-bold text-emerald-800 text-sm mb-1">{step.stepName} ({step.timing})</h3>
                        <div className="grid md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="font-semibold text-slate-700 border-b pb-1">{labels.teacherActivitiesHeading}:</p>
                            <p className="mt-1 whitespace-pre-line">{step.teacherActivities}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700 border-b pb-1">{labels.learnerActivitiesHeading}:</p>
                            <p className="mt-1 whitespace-pre-line">{step.learnerActivities}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RATE THIS LESSON FEEDBACK COMPONENT (Screen only) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 max-w-5xl mx-auto space-y-5 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Star className="w-5 h-5 fill-amber-400 stroke-amber-400" />
              </div>
              <div>
                <h3 className="font-black text-base text-white flex items-center gap-2">
                  <span>
                    {editedPlan.language === 'Kinyarwanda'
                      ? 'Pima Iri Somo (Rate this Lesson)'
                      : editedPlan.language === 'French'
                      ? 'Évaluer cette Fiche de Leçon'
                      : 'Rate this Lesson Plan'}
                  </span>
                  <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {editedPlan.header.subject || 'Subject AI Learning'}
                  </span>
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {editedPlan.language === 'Kinyarwanda'
                ? `Bihe igipimo cy'uburyo ryateguwe mu somo rya ${editedPlan.header.subject || 'masomo'} kugira ngo AI izajye igutegurira neza kurushaho.`
                : editedPlan.language === 'French'
                ? `Donnez votre avis pédagogique pour améliorer les prochains cours de ${editedPlan.header.subject || 'cette matière'}.`
                : `Rate the quality so our AI refines future lesson plans specifically for ${editedPlan.header.subject || 'your subject'}.`}
            </p>
          </div>

          {/* Interactive 5-Star Rating & Quick Votes */}
          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-2xl border border-slate-800">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hoverRating || starRating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setStarRating(star);
                      if (star >= 4) setFeedbackVote('up');
                      else setFeedbackVote('down');
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 rounded-lg hover:scale-110 transition-all focus:outline-hidden"
                    title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        active
                          ? 'fill-amber-400 stroke-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                          : 'fill-slate-800 stroke-slate-600 text-slate-600 hover:stroke-slate-400'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            {starRating > 0 && (
              <span className="text-[11px] font-bold text-amber-300 animate-in fade-in">
                {starRating === 5
                  ? '⭐⭐⭐⭐⭐ Excellent Quality!'
                  : starRating === 4
                  ? '⭐⭐⭐⭐ Very Good Lesson'
                  : starRating === 3
                  ? '⭐⭐⭐ Good / Average'
                  : '⭐⭐ Needs Subject Refinement'}
              </span>
            )}
          </div>
        </div>

        {!feedbackSubmitted ? (
          <form onSubmit={handleRateSubmit} className="space-y-4 animate-in fade-in duration-200">
            {/* Quick Tag Chips */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {editedPlan.language === 'Kinyarwanda'
                  ? "Hitamo ibintu by'umwihariko (Quick Expertise Tags):"
                  : editedPlan.language === 'French'
                  ? 'Critères clés d\'évaluation :'
                  : 'Select Subject Expertise Attributes:'}
              </label>
              <div className="flex flex-wrap gap-2">
                {(editedPlan.language === 'Kinyarwanda'
                  ? [
                      'Ibikorwa bisobanutse',
                      'Gukoresha Igihe neza (40min)',
                      'Ubumenyi buhagije (CBC)',
                      'Imyitozo myiza',
                      'Gusobanura neza',
                      'Ibyongerwamo (Remedial/Extension)',
                    ]
                  : editedPlan.language === 'French'
                  ? [
                      'Activités claires',
                      'Gestion du temps (40min)',
                      'Compétences CBC',
                      'Exercices pratiques',
                      'Support didactique',
                      'Différenciation pédagogique',
                    ]
                  : [
                      'Clear CBC Activities',
                      'Accurate 40-Min Timing',
                      'Great Competences',
                      'Good Differentiation',
                      'Rich Teaching Aids',
                      'Needs More Exercises',
                    ]
                ).map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-2xs'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment input & submit */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {editedPlan.language === 'Kinyarwanda'
                  ? 'Andika inama cyangwa ibitekerezo byawe nk\'umwarimu:'
                  : editedPlan.language === 'French'
                  ? 'Vos remarques pédagogiques :'
                  : 'Teacher Feedback & Subject Notes:'}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder={
                    editedPlan.language === 'Kinyarwanda'
                      ? 'Andika ibitekerezo cyangwa inama ku gutunganya isomo...'
                      : editedPlan.language === 'French'
                      ? 'Ajoutez vos remarques pour adapter la leçon...'
                      : 'E.g. Excellent activities for S2 Math, clear steps for 40 mins...'
                  }
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={starRating === 0 && selectedTags.length === 0 && !feedbackComment.trim()}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-xs rounded-xl shadow-md transition-all shrink-0"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    {editedPlan.language === 'Kinyarwanda'
                      ? 'Ohereza Igipimo (Submit Rating)'
                      : editedPlan.language === 'French'
                      ? 'Envoyer l\'Évaluation'
                      : 'Submit Lesson Rating'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Submission Confirmation Message */
          <div className="bg-emerald-950/80 border border-emerald-500/40 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-200 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-base shrink-0">
                ✓
              </div>
              <div>
                <p className="font-black text-white text-sm">
                  {editedPlan.language === 'Kinyarwanda'
                    ? 'Murakoze cyane! Igipimo cyanyu cyakiriwe neza.'
                    : editedPlan.language === 'French'
                    ? 'Merci beaucoup ! Votre évaluation a bien été enregistrée.'
                    : 'Thank you! Your rating has been submitted successfully.'}
                </p>
                <p className="text-emerald-300 text-[11px] mt-0.5 font-medium">
                  {editedPlan.language === 'Kinyarwanda'
                    ? 'AI yacu yize ku bitekerezo byanyu mu kumenya ibya ' + (editedPlan.header.subject || 'masomo') + '.'
                    : 'Our AI engine will use your input to refine future ' + (editedPlan.header.subject || 'subject') + ' lesson outputs.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setFeedbackSubmitted(false);
              }}
              className="px-3 py-1.5 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/30 text-[11px] font-bold rounded-xl transition-all shrink-0"
            >
              {editedPlan.language === 'Kinyarwanda' ? 'Hindura Igipimo (Edit Rating)' : 'Edit Rating'}
            </button>
          </div>
        )}
      </div>

      {/* SHARE MODAL FALLBACK */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 print:hidden">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-6 relative animate-in zoom-in-95 duration-200 text-left">
            {/* Close Button */}
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              title={getShareLabels().close}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Share2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {getShareLabels().title}
              </h3>
              <p className="text-slate-500 text-xs font-medium leading-relaxed">
                {getShareLabels().subtitle}
              </p>
            </div>

            {/* Sharing list */}
            <div className="space-y-3">
              {/* WhatsApp Option */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowShareModal(false)}
                className="flex items-center gap-3 w-full p-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl transition-all font-bold text-xs text-emerald-950 shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.859 0c3.166.001 6.141 1.233 8.375 3.469 2.235 2.235 3.465 5.212 3.466 8.377-.003 6.534-5.329 11.858-11.86 11.858-2.007-.001-3.98-.511-5.733-1.48L0 24zm6.54-4.847c1.684.997 3.328 1.521 5.304 1.522 5.378 0 9.755-4.374 9.758-9.753.001-2.607-1.013-5.059-2.859-6.904C16.905 2.173 14.45 1.157 11.852 1.157c-5.38 0-9.757 4.374-9.76 9.753-.001 1.884.49 3.73 1.419 5.337l-1.011 3.691 3.784-.992c1.6.873 3.36 1.332 5.304 1.333l.023-.012zm11.367-7.37c-.312-.156-1.848-.912-2.128-1.014-.28-.103-.483-.156-.688.156-.204.311-.79.99-.969 1.196-.18.206-.361.233-.673.078-1.112-.558-2.01-.986-2.793-2.332-.206-.356.206-.33.591-1.096.064-.13.032-.244-.016-.34-.048-.097-.483-1.163-.661-1.593-.175-.42-.369-.362-.505-.369-.13-.006-.28-.008-.43-.008-.15 0-.395.056-.602.28-.206.225-.79.771-.79 1.882 0 1.111.808 2.186.921 2.342.113.156 1.59 2.428 3.853 3.404.538.232.957.371 1.285.476.54.172 1.03.148 1.418.09.432-.064 1.848-.756 2.11-.1.263-.102.263-.448.263-.448-.156.03-.312.016-.468zm0 0" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <span className="block font-black text-emerald-950">{getShareLabels().whatsapp}</span>
                  <span className="block text-[10px] text-emerald-800/80 font-medium">Send text and link to contacts</span>
                </div>
              </a>

              {/* Email Option */}
              <a
                href={`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`}
                onClick={() => setShowShareModal(false)}
                className="flex items-center gap-3 w-full p-3.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl transition-all font-bold text-xs text-blue-950 shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <span className="block font-black text-blue-950">{getShareLabels().email}</span>
                  <span className="block text-[10px] text-blue-800/80 font-medium">Share via mail application</span>
                </div>
              </a>

              {/* Copy Share Text Option */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareText + '\n' + shareUrl);
                  setShareCopied(true);
                  setTimeout(() => {
                    setShareCopied(false);
                    setShowShareModal(false);
                  }, 1500);
                }}
                className="flex items-center gap-3 w-full p-3.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-2xl transition-all font-bold text-xs text-purple-950 shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                  {shareCopied ? (
                    <Check className="w-4 h-4 stroke-[2.5]" stroke="#fff" />
                  ) : (
                    <Copy className="w-4 h-4 stroke-[2.5]" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <span className="block font-black text-purple-950">
                    {shareCopied ? getShareLabels().copied : getShareLabels().copy}
                  </span>
                  <span className="block text-[10px] text-purple-800/80 font-medium">
                    {shareCopied ? getShareLabels().success : "Copy text and link to clipboard"}
                  </span>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-xl transition-all"
            >
              {getShareLabels().close}
            </button>
          </div>
        </div>
      )}

      {/* WHATSAPP EXCLUSIVE SHARE MODAL */}
      {showWhatsAppShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 print:hidden">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden p-6 space-y-6 relative animate-in zoom-in-95 duration-200 text-left">
            {/* Close Button */}
            <button
              onClick={() => setShowWhatsAppShareModal(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.859 0c3.166.001 6.141 1.233 8.375 3.469 2.235 2.235 3.465 5.212 3.466 8.377-.003 6.534-5.329 11.858-11.86 11.858-2.007-.001-3.98-.511-5.733-1.48L0 24zm6.54-4.847c1.684.997 3.328 1.521 5.304 1.522 5.378 0 9.755-4.374 9.758-9.753.001-2.607-1.013-5.059-2.859-6.904C16.905 2.173 14.45 1.157 11.852 1.157c-5.38 0-9.757 4.374-9.76 9.753-.001 1.884.49 3.73 1.419 5.337l-1.011 3.691 3.784-.992c1.6.873 3.36 1.332 5.304 1.333l.023-.012zm11.367-7.37c-.312-.156-1.848-.912-2.128-1.014-.28-.103-.483-.156-.688.156-.204.311-.79.99-.969 1.196-.18.206-.361.233-.673.078-1.112-.558-2.01-.986-2.793-2.332-.206-.356.206-.33.591-1.096.064-.13.032-.244-.016-.34-.048-.097-.483-1.163-.661-1.593-.175-.42-.369-.362-.505-.369-.13-.006-.28-.008-.43-.008-.15 0-.395.056-.602.28-.206.225-.79.771-.79 1.882 0 1.111.808 2.186.921 2.342.113.156 1.59 2.428 3.853 3.404.538.232.957.371 1.285.476.54.172 1.03.148 1.418.09.432-.064 1.848-.756 2.11-.1.263-.102.263-.448.263-.448-.156.03-.312.016-.468zm0 0" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {editedPlan.language === 'Kinyarwanda' ? 'Sangiza kuri WhatsApp' : 'Share via WhatsApp'}
              </h3>
              <p className="text-slate-500 text-xs font-medium leading-relaxed">
                {editedPlan.language === 'Kinyarwanda' 
                  ? 'Genzura isomo ryose rishobora gukopishwa rikanasangizwa, cyangwa ukore kopi y\'agahagararo n\'agahagararo.' 
                  : 'Send a formatted lesson summary directly, or copy the complete lesson text/link to paste in groups.'}
              </p>
            </div>

            <div className="space-y-4">
              {/* Option 1: Copy formatted full text block */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Copy className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <span className="block font-black text-emerald-950 text-xs">
                    {editedPlan.language === 'Kinyarwanda' ? '1. Kora Kopi y\'Isomo ryose (WhatsApp block)' : '1. Copy Formatted Lesson Text'}
                  </span>
                  <span className="block text-[10px] text-emerald-800/80 font-medium mb-2.5">
                    {editedPlan.language === 'Kinyarwanda' ? 'Ibi birasobanutse cyane kuri WhatsApp mu buryo bunoze.' : 'Copies the entire lesson structure including sections & steps.'}
                  </span>
                  <button
                    onClick={() => {
                      const fullText = formatPlanToWhatsAppText(editedPlan);
                      navigator.clipboard.writeText(fullText);
                      setWhatsappCopiedText(true);
                      setTimeout(() => setWhatsappCopiedText(false), 2000);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                      whatsappCopiedText ? 'bg-emerald-600 text-white' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    }`}
                  >
                    {whatsappCopiedText ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{editedPlan.language === 'Kinyarwanda' ? 'Byakopijwe!' : 'Copied Full Text!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{editedPlan.language === 'Kinyarwanda' ? 'Kora Kopi' : 'Copy Full Text'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Option 2: Copy Link only */}
              <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <span className="block font-black text-purple-950 text-xs">
                    {editedPlan.language === 'Kinyarwanda' ? '2. Kora Kopi y\'Ihuza ritaziguye (Direct Link)' : '2. Copy Unique ID & Link'}
                  </span>
                  <span className="block text-[10px] text-purple-800/80 font-medium mb-2.5">
                    {editedPlan.language === 'Kinyarwanda' ? `Ihuza rigufi ry\'isomo: ${editedPlan.id}` : `Short direct link matching Lesson ID: ${editedPlan.id}`}
                  </span>
                  <button
                    onClick={() => {
                      const directUrl = `${window.location.origin}${window.location.pathname}?planId=${editedPlan.id}`;
                      navigator.clipboard.writeText(directUrl);
                      setWhatsappCopiedLink(true);
                      setTimeout(() => setWhatsappCopiedLink(false), 2000);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                      whatsappCopiedLink ? 'bg-purple-600 text-white' : 'bg-purple-500 hover:bg-purple-400 text-slate-950'
                    }`}
                  >
                    {whatsappCopiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{editedPlan.language === 'Kinyarwanda' ? 'Ihuza ritaziguye ryakopijwe!' : 'Copied Link!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{editedPlan.language === 'Kinyarwanda' ? 'Kora Kopi y\'Ihuza' : 'Copy Direct Link'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Option 3: Send Directly to WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `📚 *${editedPlan.header.lessonTitle || 'Lesson Plan'}* (${editedPlan.header.subject || 'Subject'} - Grade ${editedPlan.header.classGrade || 'N/A'})\n` +
                  `🏫 School: ${editedPlan.header.schoolName || 'N/A'}\n` +
                  `⏱️ Duration: ${editedPlan.header.duration || 'N/A'}\n` +
                  `🔗 Direct Link: ${window.location.origin}${window.location.pathname}?planId=${editedPlan.id}\n\n` +
                  `Open now via Teacher Tool!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowWhatsAppShareModal(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/10 transition-all hover:scale-[1.02]"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.859 0c3.166.001 6.141 1.233 8.375 3.469 2.235 2.235 3.465 5.212 3.466 8.377-.003 6.534-5.329 11.858-11.86 11.858-2.007-.001-3.98-.511-5.733-1.48L0 24zm6.54-4.847c1.684.997 3.328 1.521 5.304 1.522 5.378 0 9.755-4.374 9.758-9.753.001-2.607-1.013-5.059-2.859-6.904C16.905 2.173 14.45 1.157 11.852 1.157c-5.38 0-9.757 4.374-9.76 9.753-.001 1.884.49 3.73 1.419 5.337l-1.011 3.691 3.784-.992c1.6.873 3.36 1.332 5.304 1.333l.023-.012zm11.367-7.37c-.312-.156-1.848-.912-2.128-1.014-.28-.103-.483-.156-.688.156-.204.311-.79.99-.969 1.196-.18.206-.361.233-.673.078-1.112-.558-2.01-.986-2.793-2.332-.206-.356.206-.33.591-1.096.064-.13.032-.244-.016-.34-.048-.097-.483-1.163-.661-1.593-.175-.42-.369-.362-.505-.369-.13-.006-.28-.008-.43-.008-.15 0-.395.056-.602.28-.206.225-.79.771-.79 1.882 0 1.111.808 2.186.921 2.342.113.156 1.59 2.428 3.853 3.404.538.232.957.371 1.285.476.54.172 1.03.148 1.418.09.432-.064 1.848-.756 2.11-.1.263-.102.263-.448.263-.448-.156.03-.312.016-.468zm0 0" />
                </svg>
                <span>{editedPlan.language === 'Kinyarwanda' ? 'Ohereza kuri WhatsApp Nonaha' : 'Send Directly to WhatsApp'}</span>
              </a>

              {/* Preview Box */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                  {editedPlan.language === 'Kinyarwanda' ? 'Ibyo Ohereza / WhatsApp Copy Preview:' : 'WhatsApp Copy Preview:'}
                </span>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-[11px] font-mono text-slate-700 max-h-40 overflow-y-auto leading-relaxed whitespace-pre-wrap select-all">
                  {formatPlanToWhatsAppText(editedPlan)}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowWhatsAppShareModal(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-xl transition-all"
            >
              {editedPlan.language === 'Kinyarwanda' ? 'Funga' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


