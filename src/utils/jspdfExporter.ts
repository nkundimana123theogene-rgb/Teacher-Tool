import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { 
  CbcLessonPlanData, 
  NurseryLessonPlanData, 
  RemedialLessonPlanData, 
  SchemeOfWorkData, 
  LessonPlan 
} from '../types';
import { CBC_SHEET_LABELS, CbcLanguage } from '../data/cbcSheetLabels';

/**
 * Professional jsPDF Exporter Engine for Nkorera Education App
 * Generates official, publication-quality, vector-based PDFs for:
 * 1. CBC 7-Step Lesson Plans (REB Standards)
 * 2. Scheme of Work (Landscape Multi-Week Matrix)
 * 3. Pre-Primary / Nursery Lesson Plans
 * 4. Remedial Lesson Plans (CBC Scaffolding & Differentiation)
 * 5. General Lesson Plans
 */

// Helper to sanitize text strings for PDF
const clean = (val: string | undefined | null): string => {
  if (!val) return '';
  return String(val).trim();
};

const cleanBullet = (val: string | undefined | null): string => {
  if (!val) return '';
  let str = String(val).trim();
  str = str.replace(/([^\n\r])\s*([•●*]|\b\d+\.)\s*/g, '$1\n\n• ');
  str = str.replace(/\r?\n\s*([•●*]|-)\s*/g, '\n\n• ');
  str = str.replace(/\r?\n\s*(\d+\.)\s*/g, '\n\n$1 ');
  str = str.replace(/;\s*([A-Z][a-zA-Za-z\s]+:)/g, '\n\n• $1');
  str = str.replace(/\n{3,}/g, '\n\n');
  if (!str.startsWith('•') && !/^\d+\./.test(str)) {
    str = `• ${str}`;
  }
  return str.trim();
};

const cleanGenericCompetence = (val: string | undefined | null): string => {
  if (!val) return '';
  let str = String(val).trim();
  str = str.replace(/([^\n\r])\s*([•●*]|\b\d+\.)\s*/g, '$1\n\n\n\n• ');
  str = str.replace(/\r?\n\s*([•●*]|-)\s*/g, '\n\n\n\n• ');
  str = str.replace(/\r?\n\s*(\d+\.)\s*/g, '\n\n\n\n$1 ');
  str = str.replace(/;\s*([A-Z][a-zA-Za-z\s]+:)/g, '\n\n\n\n• $1');
  str = str.replace(/\n{5,}/g, '\n\n\n\n');
  if (!str.startsWith('•') && !/^\d+\./.test(str)) {
    str = `• ${str}`;
  }
  return str.trim();
};

// Helper to add standard official header
const addOfficialHeader = (
  doc: jsPDF, 
  title: string, 
  subtitle: string = 'RWANDA BASIC EDUCATION BOARD (REB)',
  _isLandscape: boolean = false
) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Top decorative bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Emerald/Gold accent line
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 5, pageWidth, 2, 'F');

  // Header Titles
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85); // slate-700
  doc.text('REPUBLIC OF RWANDA', pageWidth / 2, 16, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(subtitle, pageWidth / 2, 21, { align: 'center' });

  // Main Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(title, pageWidth / 2, 28, { align: 'center' });

  // Underline
  const textWidth = doc.getTextWidth(title);
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.75);
  doc.line((pageWidth - textWidth) / 2 - 4, 30, (pageWidth + textWidth) / 2 + 4, 30);
};

// Helper to add standard footer with page numbering
const addPageFooters = (doc: jsPDF, label: string = 'Nkorera CBC Educational Engine • REB Standard') => {
  const pageCount = (doc as any).internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Bottom separator line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    // Footer Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(label, 14, pageHeight - 7);

    // Date stamp & Page Number
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const pageStr = `Page ${i} of ${pageCount} • Printed: ${dateStr}`;
    doc.text(pageStr, pageWidth - 14, pageHeight - 7, { align: 'right' });
  }
};

/**
 * 1. EXPORT CBC LESSON PLAN TO PDF (Official REB / NESA Template Format)
 * Strictly guarantees 1 single page in Landscape or Portrait.
 */
export const exportCbcLessonPlanToPdf = async (
  plan: CbcLessonPlanData, 
  _language: string = 'English',
  orientation: 'landscape' | 'portrait' = 'portrait'
): Promise<void> => {
  const isLandscape = orientation === 'landscape';
  const marginX = isLandscape ? 8 : 10;
  const pageWidth = isLandscape ? 297 : 210; // A4 width in mm
  const pageHeight = isLandscape ? 210 : 297; // A4 height in mm

  const langKey = (_language as CbcLanguage) in CBC_SHEET_LABELS 
    ? (_language as CbcLanguage) 
    : 'English';
  const labels = CBC_SHEET_LABELS[langKey] || CBC_SHEET_LABELS.English;

  const schoolText = `${labels.schoolName} ${clean(plan.schoolName) || ''}`;
  const teacherText = `${labels.teacherName} ${clean(plan.teacherName) || ''}`;

  // Teacher self-evaluation: filled by teacher based on how the lesson actually went.
  // Clean empty space without dotted lines as requested:
  const rawEval = (plan.teacherSelfEvaluation || (plan as any).selfEvaluation || '').trim();
  const defaultEvalText = clean(rawEval) || '';

  // 1. Metadata 8-Column Grid Header & Row (Localized to match screen exactly, with Gray -25% fill)
  const metaHead = [
    [
      { content: labels.term, styles: { halign: 'center' as const, fillColor: [229, 231, 235] as [number, number, number], textColor: [0, 0, 0] as [number, number, number] } },
      { content: labels.date, styles: { halign: 'center' as const, fillColor: [229, 231, 235] as [number, number, number], textColor: [0, 0, 0] as [number, number, number] } },
      { content: labels.subject, styles: { halign: 'center' as const, fillColor: [229, 231, 235] as [number, number, number], textColor: [0, 0, 0] as [number, number, number] } },
      { content: labels.classLevel, styles: { halign: 'center' as const, fillColor: [229, 231, 235] as [number, number, number], textColor: [0, 0, 0] as [number, number, number] } },
      { content: labels.unitNo, styles: { halign: 'center' as const, fillColor: [229, 231, 235] as [number, number, number], textColor: [0, 0, 0] as [number, number, number] } },
      { content: labels.lessonNo, styles: { halign: 'center' as const, fillColor: [229, 231, 235] as [number, number, number], textColor: [0, 0, 0] as [number, number, number] } },
      { content: labels.duration, styles: { halign: 'center' as const, fillColor: [229, 231, 235] as [number, number, number], textColor: [0, 0, 0] as [number, number, number] } },
      { content: labels.classSize, styles: { halign: 'center' as const, fillColor: [229, 231, 235] as [number, number, number], textColor: [0, 0, 0] as [number, number, number] } }
    ]
  ];

  const metaBody = [
    [
      { content: clean(plan.term) || 'I', styles: { halign: 'center' as const } },
      { content: clean(plan.date) || new Date().toISOString().split('T')[0], styles: { halign: 'center' as const } },
      { content: clean(plan.subject) || '', styles: { halign: 'center' as const, fontStyle: 'bold' as const } },
      { content: clean(plan.className) || '', styles: { halign: 'center' as const } },
      { content: clean(plan.unitNumber) || '', styles: { halign: 'center' as const } },
      { content: clean(plan.lessonNumber) || '', styles: { halign: 'center' as const } },
      { content: clean(plan.duration) || '40 min', styles: { halign: 'center' as const } },
      { content: clean(plan.classSize) || '45', styles: { halign: 'center' as const } }
    ]
  ];

  // 2. Full-Width Core Curriculum Fields (8 Rows as in Official REB Template)
  const pedagogicalBody = [
    [
      { content: labels.specialNeeds, styles: { fontStyle: 'bold' as const, fillColor: [229, 231, 235] as [number, number, number], textColor: [0, 0, 0] as [number, number, number] } },
      { content: clean(plan.specialNeeds) || (langKey === 'Kinyarwanda' ? 'Nta bibazo byihariye byagaragaye' : 'None identified') }
    ],
    [
      { content: labels.unitTitle, styles: { fontStyle: 'bold' as const, fillColor: [229, 231, 235] as [number, number, number], textColor: [0, 0, 0] as [number, number, number] } },
      { content: clean(plan.unitTitle), styles: { fontStyle: 'bold' as const } }
    ],
    [
      { content: labels.keyUnitCompetence, styles: { fontStyle: 'bold' as const, fillColor: [229, 231, 235] as [number, number, number], textColor: [0, 0, 0] as [number, number, number] } },
      { content: clean(plan.keyUnitCompetence) }
    ],
    [
      { content: labels.lessonTitle, styles: { fontStyle: 'bold' as const, fillColor: [229, 231, 235] as [number, number, number], textColor: [0, 0, 0] as [number, number, number] } },
      { content: clean(plan.lessonTitle), styles: { fontStyle: 'bold' as const } }
    ],
    [
      { content: labels.instructionalObjective, styles: { fontStyle: 'bold' as const, fillColor: [229, 231, 235] as [number, number, number], textColor: [0, 0, 0] as [number, number, number] } },
      { content: clean(plan.instructionalObjective) }
    ],
    [
      { content: labels.locationSub ? `${labels.planForClass}: ${labels.locationSub}` : labels.planForClass, styles: { fontStyle: 'bold' as const, fillColor: [229, 231, 235] as [number, number, number], textColor: [0, 0, 0] as [number, number, number] } },
      { content: (() => {
        let loc = clean(plan.classLocation) || '';
        loc = loc.replace(/\s*\([^)]*\)/g, '').trim();
        if (langKey === 'Kinyarwanda') {
          if (!loc || loc.includes('Inside the classroom') || loc.includes('Mu cyumba')) return "Mu cyumba cy'ishuri";
          if (loc.includes('Library') || loc.includes('isomero')) return "Mu isomero";
          if (loc.includes('ICT') || loc.includes('mudasobwa')) return "Muri salle ya mudasobwa";
          if (loc.includes('Laborat')) return "Muri Laboratwari";
          if (loc.includes('Outside') || loc.includes('Hanze')) return "Hanze y'icyumba cy'ishuri";
        } else if (langKey === 'Français') {
          if (!loc || loc.includes('Inside the classroom') || loc.includes('En classe')) return "En classe";
          if (loc.includes('Library') || loc.includes('bibliothèque')) return "Dans la bibliothèque";
          if (loc.includes('ICT') || loc.includes('informatique')) return "En salle informatique";
          if (loc.includes('Laborat')) return "En laboratoire";
          if (loc.includes('Outside') || loc.includes('Hors')) return "Hors de la classe";
        } else if (langKey === 'Kiswahili') {
          if (!loc || loc.includes('Inside the classroom') || loc.includes('Ndani ya darasa')) return "Ndani ya darasa";
          if (loc.includes('Library') || loc.includes('Maktabani')) return "Maktabani";
          if (loc.includes('ICT') || loc.includes('TEHAMA')) return "Chumba cha TEHAMA";
          if (loc.includes('Laborat') || loc.includes('Maabara')) return "Maabara";
          if (loc.includes('Outside') || loc.includes('Nje')) return "Nje ya darasa";
        }
        return loc || 'Inside the classroom';
      })() }
    ],
    [
      { content: labels.materialsSub ? `${labels.learningMaterials} ${labels.materialsSub}` : labels.learningMaterials, styles: { fontStyle: 'bold' as const, fillColor: [229, 231, 235] as [number, number, number], textColor: [0, 0, 0] as [number, number, number] } },
      { content: clean(plan.learningMaterials) }
    ],
    [
      { content: labels.references, styles: { fontStyle: 'bold' as const, fillColor: [229, 231, 235] as [number, number, number], textColor: [0, 0, 0] as [number, number, number] } },
      { content: clean(plan.references) }
    ]
  ];

  const teacherSub = "";
  const learnerSub = "";

  const defaultDescActivities = langKey === 'Kinyarwanda'
    ? "Ibikorwa bibandanda ku munyeshuri bizwiho gukoresha imfashanyigisho zifatika, gukorera mu matsinda, kwandika ku mbaho, no gukora isuzuma risoza isomo."
    : langKey === 'Français'
    ? "Activités interactives centrées sur l'apprenant combinant supports concrets, travail en équipe, exercices sur ardoises et évaluation formative."
    : langKey === 'Kiswahili'
    ? "Shughuli shirikishi zinazomlenga mwanafunzi zikitumia vifaa halisi, kazi za vikundi, mazoezi ya vibao na tathmini ya kuelewa somo."
    : "Interactive learner-centered activities using concrete manipulatives, pair work, slate practice, group problem solving, and diagnostic exit tickets.";

  // 3. Teaching and Learning Activities Matrix (4 Columns)
  const stepsHead = [
    [
      { content: labels.timing, rowSpan: 3, styles: { halign: 'center' as const, valign: 'middle' as const } },
      { content: labels.descActivities, colSpan: 2, styles: { halign: 'center' as const } },
      { content: labels.competencesAndCrossCutting, rowSpan: 3, styles: { halign: 'center' as const, valign: 'middle' as const } }
    ],
    [
      { 
        content: clean(plan.descActivities) || defaultDescActivities, 
        colSpan: 2, 
        styles: { 
          halign: 'left' as const, 
          fontSize: 7, 
          fontStyle: 'normal' as const,
          fillColor: [255, 255, 255] as [number, number, number],
          textColor: [0, 0, 0] as [number, number, number]
        } 
      }
    ],
    [
      { content: labels.teacherActivities + teacherSub, styles: { halign: 'center' as const, fontSize: 7 } },
      { content: labels.learnerActivities + learnerSub, styles: { halign: 'center' as const, fontSize: 7 } }
    ]
  ];

  interface LayoutConfig {
    fontSize: number;
    padding: number;
    evalMinHeight: number;
    devMinHeight: number;
    introMinHeight: number;
    conclMinHeight: number;
    pedMinHeight?: number;
  }

  // Helper to build document at a given scale to guarantee single page
  const buildDocument = (cfg: LayoutConfig): jsPDF => {
    const docInstance = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // 0. Top Header Banner with Gray -25% accent
    docInstance.setFillColor(229, 231, 235); // Gray -25% (Official REB standard fill)
    docInstance.setDrawColor(0, 0, 0);
    docInstance.setLineWidth(0.3);
    docInstance.rect(marginX, isLandscape ? 4 : 5, pageWidth - (2 * marginX), 7, 'FD');
    docInstance.setFont('helvetica', 'bold');
    docInstance.setFontSize(isLandscape ? 9.5 : 9);
    docInstance.setTextColor(0, 0, 0);
    docInstance.text(labels.docHeaderTitle, pageWidth / 2, isLandscape ? 8.4 : 9.4, { align: 'center' });
    docInstance.setLineWidth(0.4);
    docInstance.line(marginX, isLandscape ? 11.5 : 13, pageWidth - marginX, isLandscape ? 11.5 : 13);

    // Top header text: School name on left, Teacher's name on right
    docInstance.setFontSize(8);
    const startY = isLandscape ? 15 : 17.5;
    docInstance.text(schoolText, marginX, startY);
    docInstance.text(teacherText, pageWidth - marginX, startY, { align: 'right' });
    let currentY = startY + (isLandscape ? 2.5 : 3);

    // Table 1: Metadata Grid (8 columns)
    const colStyles1 = isLandscape ? {
      0: { cellWidth: 16 },
      1: { cellWidth: 28 },
      2: { cellWidth: 56 },
      3: { cellWidth: 26 },
      4: { cellWidth: 28 },
      5: { cellWidth: 32 },
      6: { cellWidth: 44 },
      7: { cellWidth: 51 }
    } : {
      0: { cellWidth: 16 },
      1: { cellWidth: 24 },
      2: { cellWidth: 36 },
      3: { cellWidth: 20 },
      4: { cellWidth: 18 },
      5: { cellWidth: 22 },
      6: { cellWidth: 26 },
      7: { cellWidth: 28 }
    };

    autoTable(docInstance, {
      startY: currentY,
      head: metaHead,
      body: metaBody,
      theme: 'grid',
      headStyles: {
        fillColor: [229, 231, 235],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: cfg.fontSize,
        cellPadding: cfg.padding,
        lineColor: [0, 0, 0],
        lineWidth: 0.3
      },
      styles: {
        fontSize: cfg.fontSize,
        cellPadding: cfg.padding,
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
        textColor: [0, 0, 0]
      },
      columnStyles: colStyles1,
      margin: { left: marginX, right: marginX, top: isLandscape ? 4 : 5, bottom: 4 }
    });

    currentY = (docInstance as any).lastAutoTable.finalY;

    // Table 2: Core Pedagogical Fields (2 columns)
    const colStyles2 = isLandscape ? {
      0: { cellWidth: 60, fontStyle: 'bold' as const, fillColor: [229, 231, 235] as [number, number, number], textColor: [0, 0, 0] as [number, number, number] },
      1: { cellWidth: 221 }
    } : {
      0: { cellWidth: 54, fontStyle: 'bold' as const, fillColor: [229, 231, 235] as [number, number, number], textColor: [0, 0, 0] as [number, number, number] },
      1: { cellWidth: 136 }
    };

    autoTable(docInstance, {
      startY: currentY,
      head: [],
      body: pedagogicalBody,
      theme: 'grid',
      styles: {
        fontSize: cfg.fontSize,
        cellPadding: cfg.padding,
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
        textColor: [0, 0, 0],
        minCellHeight: cfg.pedMinHeight || undefined
      },
      columnStyles: colStyles2,
      margin: { left: marginX, right: marginX, top: isLandscape ? 4 : 5, bottom: 4 }
    });

    currentY = (docInstance as any).lastAutoTable.finalY;

    // Table 3: Steps Matrix (4 columns)
    const colStyles3 = isLandscape ? {
      0: { cellWidth: 28 },
      1: { cellWidth: 94 },
      2: { cellWidth: 94 },
      3: { cellWidth: 65 }
    } : {
      0: { cellWidth: 22 },
      1: { cellWidth: 58 },
      2: { cellWidth: 58 },
      3: { cellWidth: 52 }
    };

    const dynamicStepsBody = [
      // Step 1: Introduction
      [
        { 
          content: `${labels.intro}\n\n(${clean(plan.timingIntro) || '10 min'})`, 
          styles: { fontStyle: 'bold' as const, halign: 'center' as const, valign: 'top' as const, fillColor: [229, 231, 235] as [number, number, number] } 
        },
        { content: cleanBullet(plan.teacherActivityIntro), styles: cfg.introMinHeight ? { minCellHeight: cfg.introMinHeight } : {} },
        { content: cleanBullet(plan.learnerActivityIntro), styles: cfg.introMinHeight ? { minCellHeight: cfg.introMinHeight } : {} },
        { content: cleanGenericCompetence(plan.genericCompetencesIntro), styles: cfg.introMinHeight ? { minCellHeight: cfg.introMinHeight } : {} }
      ],
      // Step 2: Development
      [
        { 
          content: `${labels.dev}\n\n(${clean(plan.timingDev) || '20 min'})`, 
          styles: { fontStyle: 'bold' as const, halign: 'center' as const, valign: 'top' as const, fillColor: [229, 231, 235] as [number, number, number] } 
        },
        { content: cleanBullet(plan.teacherActivityDev), styles: cfg.devMinHeight ? { minCellHeight: cfg.devMinHeight } : {} },
        { content: cleanBullet(plan.learnerActivityDev), styles: cfg.devMinHeight ? { minCellHeight: cfg.devMinHeight } : {} },
        { content: cleanGenericCompetence(plan.genericCompetencesDev), styles: cfg.devMinHeight ? { minCellHeight: cfg.devMinHeight } : {} }
      ],
      // Step 3: Conclusion
      [
        { 
          content: `${labels.concl}\n\n(${clean(plan.timingConcl) || '10 min'})`, 
          styles: { fontStyle: 'bold' as const, halign: 'center' as const, valign: 'top' as const, fillColor: [229, 231, 235] as [number, number, number] } 
        },
        { content: cleanBullet(plan.teacherActivityConcl), styles: cfg.conclMinHeight ? { minCellHeight: cfg.conclMinHeight } : {} },
        { content: cleanBullet(plan.learnerActivityConcl), styles: cfg.conclMinHeight ? { minCellHeight: cfg.conclMinHeight } : {} },
        { content: cleanGenericCompetence(plan.genericCompetencesConcl), styles: cfg.conclMinHeight ? { minCellHeight: cfg.conclMinHeight } : {} }
      ]
    ];

    autoTable(docInstance, {
      startY: currentY,
      head: stepsHead,
      body: dynamicStepsBody,
      theme: 'grid',
      styles: {
        fontSize: cfg.fontSize,
        cellPadding: cfg.padding,
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255]
      },
      headStyles: {
        fillColor: [229, 231, 235],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: cfg.fontSize,
        cellPadding: cfg.padding,
        lineColor: [0, 0, 0],
        lineWidth: 0.3
      },
      columnStyles: colStyles3,
      margin: { left: marginX, right: marginX, top: isLandscape ? 4 : 5, bottom: 4 }
    });

    currentY = (docInstance as any).lastAutoTable.finalY;

    // Table 4: Self-Evaluation (2-Column structure matching official REB template)
    const evalBody = [
      [
        {
          content: labels.teacherSelfEval,
          styles: {
            fontStyle: 'bold' as const,
            fillColor: [229, 231, 235] as [number, number, number],
            valign: 'middle' as const
          }
        },
        {
          content: defaultEvalText,
          styles: {
            fontStyle: 'normal' as const,
            valign: 'middle' as const,
            minCellHeight: Math.max(cfg.evalMinHeight, isLandscape ? 5 : 7)
          }
        }
      ]
    ];

    const colStyles4 = isLandscape ? {
      0: { cellWidth: 60 },
      1: { cellWidth: 221 }
    } : {
      0: { cellWidth: 54 },
      1: { cellWidth: 136 }
    };

    autoTable(docInstance, {
      startY: currentY,
      body: evalBody,
      theme: 'grid',
      styles: {
        fontSize: cfg.fontSize,
        cellPadding: cfg.padding,
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
        textColor: [0, 0, 0]
      },
      columnStyles: colStyles4,
      margin: { left: marginX, right: marginX, top: isLandscape ? 4 : 5, bottom: 4 }
    });

    return docInstance;
  };

  const isFullyOnSinglePage = (d: jsPDF): boolean => {
    const pageCount = typeof (d as any).getNumberOfPages === 'function' 
      ? (d as any).getNumberOfPages() 
      : (d as any).internal.getNumberOfPages();
    if (pageCount > 1) return false;
    const lastTable = (d as any).lastAutoTable;
    if (!lastTable) return true;
    if (lastTable.pageNumber && lastTable.pageNumber > 1) return false;
    const maxY = isLandscape ? 203 : 288;
    if (lastTable.finalY > maxY) return false;
    return true;
  };

  // Progressive auto-fitting scales from spacious down to compact
  const scaleSteps: LayoutConfig[] = isLandscape ? [
    { fontSize: 7.2, padding: 0.9, evalMinHeight: 6, devMinHeight: 18, introMinHeight: 10, conclMinHeight: 10 },
    { fontSize: 6.8, padding: 0.78, evalMinHeight: 5.5, devMinHeight: 15, introMinHeight: 9, conclMinHeight: 9 },
    { fontSize: 6.4, padding: 0.65, evalMinHeight: 5, devMinHeight: 13, introMinHeight: 8, conclMinHeight: 8 },
    { fontSize: 6.0, padding: 0.55, evalMinHeight: 5, devMinHeight: 11, introMinHeight: 7, conclMinHeight: 7 },
    { fontSize: 5.6, padding: 0.45, evalMinHeight: 4.5, devMinHeight: 9, introMinHeight: 6, conclMinHeight: 6 },
    { fontSize: 5.2, padding: 0.35, evalMinHeight: 4, devMinHeight: 8, introMinHeight: 5, conclMinHeight: 5 },
    { fontSize: 4.8, padding: 0.28, evalMinHeight: 4, devMinHeight: 6, introMinHeight: 4, conclMinHeight: 4 },
    { fontSize: 4.2, padding: 0.22, evalMinHeight: 3.5, devMinHeight: 5, introMinHeight: 3, conclMinHeight: 3 }
  ] : [
    // Stretched tall vertical (portrait) fitting A4 (297mm height)
    { fontSize: 7.8, padding: 1.4, evalMinHeight: 9, devMinHeight: 38, introMinHeight: 20, conclMinHeight: 20, pedMinHeight: 6.2 },
    { fontSize: 7.4, padding: 1.25, evalMinHeight: 8.5, devMinHeight: 34, introMinHeight: 18, conclMinHeight: 18, pedMinHeight: 5.8 },
    { fontSize: 7.0, padding: 1.1, evalMinHeight: 8, devMinHeight: 30, introMinHeight: 16, conclMinHeight: 16, pedMinHeight: 5.2 },
    { fontSize: 6.6, padding: 0.95, evalMinHeight: 7.5, devMinHeight: 25, introMinHeight: 14, conclMinHeight: 14, pedMinHeight: 4.8 },
    { fontSize: 6.2, padding: 0.8, evalMinHeight: 7, devMinHeight: 20, introMinHeight: 11, conclMinHeight: 11, pedMinHeight: 4.2 },
    { fontSize: 5.8, padding: 0.65, evalMinHeight: 6.5, devMinHeight: 16, introMinHeight: 9, conclMinHeight: 9 },
    { fontSize: 5.2, padding: 0.48, evalMinHeight: 6, devMinHeight: 12, introMinHeight: 7, conclMinHeight: 7 },
    { fontSize: 4.6, padding: 0.35, evalMinHeight: 5.5, devMinHeight: 9, introMinHeight: 6, conclMinHeight: 6 }
  ];

  const targetBottomY = isLandscape ? 196 : 282;

  // 1. Find best baseline configuration that fits strictly on 1 page without splitting
  let currentCfg = scaleSteps[0];
  let doc = buildDocument(currentCfg);
  for (let i = 0; i < scaleSteps.length; i++) {
    currentCfg = scaleSteps[i];
    doc = buildDocument(currentCfg);
    if (isFullyOnSinglePage(doc)) {
      break;
    }
  }

  // 2. Dynamic downward stretch: if the document fits safely on 1 page and has remaining space,
  // expand heights downwards to fill the page cleanly without exceeding 1 page or breaking into parts
  if (isFullyOnSinglePage(doc)) {
    const finalY = (doc as any).lastAutoTable?.finalY || 0;
    const availableExtra = targetBottomY - finalY;
    if (availableExtra > 5) {
      // Test descending fractions: the FIRST one that is 100% on a single page is adopted
      const factors = [0.85, 0.65, 0.45, 0.25];
      for (const factor of factors) {
        const extraToDistribute = availableExtra * factor;
        // Keep Self-Evaluation snug and tight directly under the label, distribute extra space to content (dev, intro, concl)
        const stretchEval = currentCfg.evalMinHeight + (extraToDistribute * 0.05);
        const stretchDev = currentCfg.devMinHeight + (extraToDistribute * (isLandscape ? 0.50 : 0.48));
        const stretchIntro = currentCfg.introMinHeight + (extraToDistribute * 0.22);
        const stretchConcl = currentCfg.conclMinHeight + (extraToDistribute * 0.22);
        const stretchPedRow = (currentCfg.pedMinHeight || 4.5) + (isLandscape ? 0 : Math.min(extraToDistribute * 0.008, 1.2));
        const stretchPadding = currentCfg.padding + (availableExtra > 30 ? 0.12 : 0.03);

        const candidateCfg: LayoutConfig = {
          fontSize: currentCfg.fontSize,
          padding: stretchPadding,
          evalMinHeight: stretchEval,
          devMinHeight: stretchDev,
          introMinHeight: stretchIntro,
          conclMinHeight: stretchConcl,
          pedMinHeight: stretchPedRow
        };

        const candidateDoc = buildDocument(candidateCfg);
        if (isFullyOnSinglePage(candidateDoc)) {
          doc = candidateDoc;
          break; // Successfully stretched down while strictly on 1 single page!
        }
      }
    }
  }

  // Absolute safety net: strictly ensure single page output
  const getPages = (d: jsPDF): number => {
    return typeof (d as any).getNumberOfPages === 'function' 
      ? (d as any).getNumberOfPages() 
      : (d as any).internal.getNumberOfPages();
  };
  while (getPages(doc) > 1) {
    doc.deletePage(getPages(doc));
  }

  // Add clean single-page footer line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(marginX, pageHeight - 6, pageWidth - marginX, pageHeight - 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`REB CBC Official Lesson Plan • ${clean(plan.subject)} (${clean(plan.className)})`, marginX, pageHeight - 3);

  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.text(`Official Format • Printed: ${dateStr}`, pageWidth - marginX, pageHeight - 3, { align: 'right' });

  // Download PDF file
  const safeSubject = (plan.subject || 'Subject').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeClass = (plan.className || 'Class').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeLesson = (plan.lessonTitle || 'Lesson').substring(0, 20).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `CBC_Lesson_Plan_${safeSubject}_${safeClass}_${safeLesson}.pdf`;

  doc.save(filename);
};

/**
 * 2. EXPORT SCHEME OF WORK TO PDF (A4 Landscape Multi-Column Matrix)
 */
export const exportSchemeOfWorkToPdf = async (
  scheme: SchemeOfWorkData,
  language: string = scheme.language || 'English'
): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const lang = (language || scheme.language || 'English').trim();

  // Multi-language Document Title and Subtitles
  let mainTitle = 'SCHEME OF WORK (REB CBC STANDARD)';
  let subTitle = 'RWANDA BASIC EDUCATION BOARD (REB) • CURRICULUM & PEDAGOGICAL MATERIALS';
  let lblAcademicYear = 'Academic Year';
  let lblTerm = 'Term';
  let lblSchool = 'School';
  let lblSubject = 'Subject';
  let lblTeacher = 'Teacher';
  let lblClass = 'Class & Combination';
  let lblPeriods = 'Periods Per Week';

  let col1 = 'Dates/weeks';
  let col2 = 'Lesson title/periods';
  let col3 = 'Learning objectives';
  let col4 = 'Content summary';
  let col5 = 'Teaching and learning activities and approaches';
  let col6 = 'Teaching and learning aids';
  let col7 = 'Assessment and observation';
  let col8 = 'References';
  let col9 = 'Weekly Remarks';

  if (lang === 'Kinyarwanda') {
    mainTitle = "SCHEME OF WORK (REB CBC)";
    subTitle = "RWANDA BASIC EDUCATION BOARD (REB) • CURRICULUM SYLLABUS";
    lblAcademicYear = "Academic Year";
    lblTerm = "Term";
    lblSchool = "School";
    lblSubject = "Subject";
    lblTeacher = "Teacher";
    lblClass = "Class / Combination";
    lblPeriods = "Periods / Week";
    col1 = "Dates / Weeks";
    col2 = "Unit Title & Key Unit Competence";
    col3 = "Lesson Title & Objectives";
    col4 = "Key Learning Points";
    col5 = "Teaching & Learning Activities";
    col6 = "Learning Aids & Equipment";
    col7 = "Assessment Method & Techniques";
    col8 = "References & Instructional Materials";
    col9 = "Weekly Evaluation & Observations";
  } else if (lang === 'Français') {
    mainTitle = 'PLAN DE TRAVAIL PÉDAGOGIQUE (SCHEME OF WORK - REB CBC)';
    subTitle = "CONSEIL DE L'ÉDUCATION DE BASE DU RWANDA (REB) • MATÉRIELS CURRICULAIRES";
    lblAcademicYear = 'Année scolaire';
    lblTerm = 'Trimestre';
    lblSchool = 'École';
    lblSubject = 'Matière';
    lblTeacher = 'Enseignant';
    lblClass = 'Classe & Section';
    lblPeriods = 'Périodes par semaine';
    col1 = 'Dates/Semaines';
    col2 = 'Titre de leçon/Périodes';
    col3 = "Objectifs d'apprentissage";
    col4 = 'Résumé du contenu';
    col5 = "Activités et approches d'enseignement-apprentissage";
    col6 = 'Supports didactiques';
    col7 = 'Évaluation et observation';
    col8 = 'Références';
    col9 = 'Remarques hebdomadaires';
  } else if (lang === 'Kiswahili') {
    mainTitle = 'MPANGO WA KAZI WA SOMO (SCHEME OF WORK - REB CBC)';
    subTitle = 'BODI YA ELIMU YA MSINGI YA RWANDA (REB) • NYENZO ZA MTAALA';
    lblAcademicYear = 'Mwaka wa masomo';
    lblTerm = 'Muhula';
    lblSchool = 'Shule';
    lblSubject = 'Somo';
    lblTeacher = 'Mwalimu';
    lblClass = 'Darasa na Mchepuo';
    lblPeriods = 'Vipindi kwa wiki';
    col1 = 'Tarehe/Wiki';
    col2 = 'Kichwa cha somo/Vipindi';
    col3 = 'Malengo ya kujifunza';
    col4 = 'Muhtasari wa maudhui';
    col5 = 'Shughuli na mbinu za kufundishia na kujifunzia';
    col6 = 'Zana za kujifunzia';
    col7 = 'Tathmini na uchunguzi';
    col8 = 'Marejeleo';
    col9 = 'Maoni ya wiki';
  }

  addOfficialHeader(
    doc, 
    mainTitle, 
    subTitle,
    true
  );

  // Metadata Grid
  const metaBody = [
    [
      { content: `${lblAcademicYear}: ${clean(scheme.academicYear) || '2025-2026'}`, styles: { fontStyle: 'bold' as const } },
      { content: `${lblTerm}: ${clean(scheme.term) || 'I'}`, styles: { fontStyle: 'bold' as const } },
      { content: `${lblSchool}: ${clean(scheme.schoolName)}`, styles: { fontStyle: 'bold' as const } }
    ],
    [
      { content: `${lblSubject}: ${clean(scheme.subject)}` },
      { content: `${lblTeacher}: ${clean(scheme.teacherName)}` },
      { content: `${lblClass}: ${clean(scheme.className)} ${clean(scheme.combination) ? `(${scheme.combination})` : ''}` }
    ],
    [
      { content: `${lblPeriods}: ${clean(scheme.periodsPerWeek) || '4'}`, colSpan: 3, styles: { fillColor: [248, 250, 252] as [number, number, number] } }
    ]
  ];

  autoTable(doc, {
    startY: 33,
    body: metaBody,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      textColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 90 },
      2: { cellWidth: 89 }
    },
    margin: { left: 14, right: 14 }
  });

  const startY = (doc as any).lastAutoTable.finalY + 3;

  // Scheme of Work 9-Column Table
  const tableHead = [
    [
      { content: col1, styles: { halign: 'center' as const } },
      { content: col2, styles: { halign: 'center' as const } },
      { content: col3, styles: { halign: 'center' as const } },
      { content: col4, styles: { halign: 'center' as const } },
      { content: col5, styles: { halign: 'center' as const } },
      { content: col6, styles: { halign: 'center' as const } },
      { content: col7, styles: { halign: 'center' as const } },
      { content: col8, styles: { halign: 'center' as const } },
      { content: col9, styles: { halign: 'center' as const } }
    ]
  ];

  const tableBody: any[] = [];
  let lastUnitTitle = '';

  (scheme.rows || []).forEach((row) => {
    const currentUnitKey = `${row.unitNumber || ''} - ${row.unitTitle || ''}`.trim();
    if (currentUnitKey !== lastUnitTitle) {
      lastUnitTitle = currentUnitKey;

      // Add Unit Row
      tableBody.push([
        { 
          content: lang === 'Kinyarwanda' ? "Umutwe w'isomo" : lang === 'Français' ? "Titre de l'unité" : lang === 'Kiswahili' ? "Jina la sura" : "Unit title",
          styles: { fontStyle: 'bold' as const, fillColor: [241, 245, 249] as [number, number, number], textColor: [180, 83, 9] as [number, number, number] } 
        },
        { 
          content: `${row.unitNumber ? row.unitNumber + ': ' : ''}${row.unitTitle}`.toUpperCase(), 
          colSpan: 7, 
          styles: { fontStyle: 'bold' as const, fillColor: [241, 245, 249] as [number, number, number], halign: 'center' as const } 
        },
        { 
          content: '', 
          styles: { fillColor: [241, 245, 249] as [number, number, number] } 
        }
      ]);

      // Add Key Unit Competence Row
      tableBody.push([
        { 
          content: lang === 'Kinyarwanda' ? "Ubushobozi bw'ingenzi" : lang === 'Français' ? "Compétence clé" : lang === 'Kiswahili' ? "Umahiri mkuu" : "Key competence", 
          styles: { fontStyle: 'italic' as const, fillColor: [254, 253, 250] as [number, number, number], textColor: [180, 83, 9] as [number, number, number] } 
        },
        { 
          content: row.keyUnitCompetence, 
          colSpan: 8, 
          styles: { fontStyle: 'italic' as const, fillColor: [254, 253, 250] as [number, number, number] } 
        }
      ]);
    }

    // Push Lesson Row (9 Columns)
    tableBody.push([
      { content: `${clean(row.dates)}\n(Wk ${row.weekNumber || 1})`, styles: { fontStyle: 'bold' as const, halign: 'center' as const } },
      { content: `• ${clean(row.lessonNumber)}: ${clean(row.lessonTitle)}` },
      { content: clean(row.learningObjectives) },
      { content: clean(row.contentSummary) || clean(row.evaluation) || 'Summary not provided' },
      { content: clean(row.teachingActivities) || clean(row.teachingMethods) || 'Activities not provided' },
      { content: clean(row.learningAids) || clean(row.resourcesAndReferences) || 'Learning aids not specified' },
      { content: clean(row.assessment) || clean(row.evaluation) || 'Oral check / Assessment' },
      { content: clean(row.references) || clean(row.resourcesAndReferences) || 'References' },
      { content: clean(row.weeklyRemarks) || '' }
    ]);
  });

  autoTable(doc, {
    startY,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
      cellPadding: 1.5
    },
    styles: {
      fontSize: 6.5,
      cellPadding: 1.5,
      lineColor: [0, 0, 0],
      lineWidth: 0.25,
      textColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 22 }, // Dates
      1: { cellWidth: 34 }, // Lesson
      2: { cellWidth: 33 }, // Learning objectives
      3: { cellWidth: 32 }, // Content summary
      4: { cellWidth: 42 }, // Teaching activities
      5: { cellWidth: 26 }, // Learning aids
      6: { cellWidth: 26 }, // Assessment
      7: { cellWidth: 30 }, // References
      8: { cellWidth: 24 }  // Weekly remarks
    },
    margin: { left: 14, right: 14 }
  });

  addPageFooters(doc, `REB Scheme of Work • ${scheme.subject || 'Subject'} (${scheme.className || 'Class'}) • ${lang}`);

  const safeSubject = (scheme.subject || 'Subject').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeClass = (scheme.className || 'Class').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Scheme_of_Work_${safeSubject}_${safeClass}_${lang}.pdf`;

  doc.save(filename);
};

/**
 * 3. EXPORT NURSERY / PRE-PRIMARY LESSON PLAN TO PDF (A4 Portrait)
 */
export const exportNurseryLessonPlanToPdf = async (
  plan: NurseryLessonPlanData,
  _language: string = 'English'
): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  addOfficialHeader(
    doc, 
    'PRE-PRIMARY / NURSERY LESSON PLAN (REB ECE)', 
    'EARLY CHILDHOOD EDUCATION & PRE-PRIMARY CURRICULUM'
  );

  let startY = 34;

  // Metadata Table
  const metaBody = [
    [
      { content: `School: ${clean(plan.schoolName)}`, styles: { fontStyle: 'bold' as const } },
      { content: `Teacher: ${clean(plan.teacherName)}`, styles: { fontStyle: 'bold' as const } },
      { content: `Date: ${clean(plan.date) || new Date().toISOString().split('T')[0]}`, styles: { fontStyle: 'bold' as const } }
    ],
    [
      { content: `Class Level: ${clean(plan.classLevel) || 'Baby Class'}` },
      { content: `Subject: ${clean(plan.subject) || 'Discovery of the World'}` },
      { content: `Duration: ${clean(plan.duration) || '30 min'}` }
    ],
    [
      { content: `Class Size: ${clean(plan.classSize) || '35 children'}` },
      { content: `Language: ${clean(plan.language) || 'Kinyarwanda / English'}`, colSpan: 2 }
    ],
    [
      { content: `Lesson Name: ${clean(plan.lessonName)}`, colSpan: 3, styles: { fontStyle: 'bold' as const, fillColor: [248, 250, 252] as [number, number, number] } }
    ]
  ];

  autoTable(doc, {
    startY,
    body: metaBody,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      textColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 72 },
      2: { cellWidth: 50 }
    },
    margin: { left: 14, right: 14 }
  });

  startY = (doc as any).lastAutoTable.finalY + 3;

  // Competence & Objective Table
  const compBody = [
    [
      { content: 'Competence Focus:', styles: { fontStyle: 'bold' as const, cellWidth: 42, fillColor: [248, 250, 252] as [number, number, number] } },
      { content: clean(plan.competenceFocus) || 'N/A' }
    ],
    [
      { content: 'Instructional Objective:', styles: { fontStyle: 'bold' as const, fillColor: [248, 250, 252] as [number, number, number] } },
      { content: clean(plan.instructionalObjective) || 'N/A' }
    ],
    [
      { content: 'Learning Materials & Toys:', styles: { fontStyle: 'bold' as const, fillColor: [248, 250, 252] as [number, number, number] } },
      { content: clean(plan.learningMaterials) || 'Flashcards, concrete objects, picture books, toys.' }
    ]
  ];

  autoTable(doc, {
    startY,
    body: compBody,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2.2,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      textColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 42 },
      1: { cellWidth: 140 }
    },
    margin: { left: 14, right: 14 }
  });

  startY = (doc as any).lastAutoTable.finalY + 4;

  // 4 Daily Routine Stages Matrix
  const routineHead = [
    [
      { content: 'Daily Routine Stage', styles: { halign: 'center' as const } },
      { content: 'Timing', styles: { halign: 'center' as const } },
      { content: 'Teacher & Children Playful Activities', styles: { halign: 'center' as const } }
    ]
  ];

  const steps = plan.steps || ({} as any);

  const routineBody = [
    [
      { content: '1. Greeting Circle &\nWarm-Up', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [248, 250, 252] as [number, number, number] } },
      { content: clean(steps.greetingCircle?.duration) || '5 min', styles: { halign: 'center' as const } },
      { content: clean(steps.greetingCircle?.activities) || 'Welcoming song, roll call with smile, daily weather observation.' }
    ],
    [
      { content: '2. Guided Discovery &\nActive Learning', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [248, 250, 252] as [number, number, number] } },
      { content: clean(steps.guidedLearning?.duration) || '15 min', styles: { halign: 'center' as const } },
      { content: clean(steps.guidedLearning?.activities) || 'Teacher demonstrates with real objects/cards; children touch, name, and practice in pairs.' }
    ],
    [
      { content: '3. Creative Play &\nPhysical Movement', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [248, 250, 252] as [number, number, number] } },
      { content: clean(steps.creativePlay?.duration) || '5 min', styles: { halign: 'center' as const } },
      { content: clean(steps.creativePlay?.activities) || 'Free play corner, jumping, drawing in sand or coloring with crayons.' }
    ],
    [
      { content: '4. Recap, Songs &\nGoodbye', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [248, 250, 252] as [number, number, number] } },
      { content: clean(steps.recapAndGoodbye?.duration) || '5 min', styles: { halign: 'center' as const } },
      { content: clean(steps.recapAndGoodbye?.activities) || 'Summary song, praising effort, tidy up learning corner, gentle farewell.' }
    ]
  ];

  autoTable(doc, {
    startY,
    head: routineHead,
    body: routineBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 2.5
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 2.5,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      textColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 22 },
      2: { cellWidth: 120 }
    },
    margin: { left: 14, right: 14 }
  });

  startY = (doc as any).lastAutoTable.finalY + 3;

  let selfEvalTitle = "Teacher's Observations & Evaluation";
  if (_language === 'Kinyarwanda') {
    selfEvalTitle = "Kwisuzuma n'Ibitekerezo bya Mwarimu (Teacher's Self-Evaluation)";
  } else if (_language === 'Français') {
    selfEvalTitle = "Observations & Évaluation de l'enseignant (Teacher's Self-Evaluation)";
  } else if (_language === 'Kiswahili') {
    selfEvalTitle = "Tathmini na Maoni ya Mwalimu (Teacher's Self-Evaluation)";
  }

  // Evaluation notes box
  const evalBody = [
    [
      {
        content: plan.evaluationComments
          ? `${selfEvalTitle}:\n${clean(plan.evaluationComments)}`
          : `${selfEvalTitle}:\n\n\n\n\n`,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          minCellHeight: 18,
          fontStyle: 'normal' as const,
          textColor: [0, 0, 0] as [number, number, number],
          fillColor: [255, 255, 255] as [number, number, number]
        }
      }
    ]
  ];

  autoTable(doc, {
    startY,
    body: evalBody,
    theme: 'grid',
    styles: {
      lineColor: [0, 0, 0],
      lineWidth: 0.3
    },
    margin: { left: 14, right: 14 }
  });

  addPageFooters(doc, `REB Nursery Plan • ${plan.subject || 'Nursery'} (${plan.classLevel || 'Class'})`);

  const safeSubject = (plan.subject || 'Nursery').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeClass = (plan.classLevel || 'Level').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Nursery_Plan_${safeSubject}_${safeClass}.pdf`;

  doc.save(filename);
};

/**
 * 4. EXPORT REMEDIAL LESSON PLAN TO PDF (A4 Portrait)
 */
export const exportRemedialLessonPlanToPdf = async (
  plan: RemedialLessonPlanData,
  _language: string = 'English'
): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  addOfficialHeader(
    doc, 
    'REMEDIAL LESSON PLAN (CBC SCAFFOLDING)', 
    'RWANDA BASIC EDUCATION BOARD (REB) • SPECIAL NEEDS & INCLUSIVE PEDAGOGY'
  );

  let startY = 32;

  const struggling = plan.strugglingLearners || ({} as any);
  const remAct = plan.remedialActivities || ({} as any);
  const conAct = plan.consolidationActivities || ({} as any);

  // A. GENERAL INFORMATION Table Body
  const generalInfoBody = [
    [
      { content: `Class: ${clean(plan.className) || 'P5'}` },
      { content: `Lesson: ${clean(plan.lessonName)}` }
    ],
    [
      { content: `Period: ${clean(plan.period) || '40'} Min` },
      { content: `Date: ${clean(plan.date) || new Date().toISOString().split('T')[0]}` }
    ],
    [
      { content: `Teachername: ${clean(plan.teacherName) || 'NKUNDIMANA Theogene'}` },
      { content: `Group 1: Number of learners who need remedial activities: ${clean(plan.group1Count) || '4'}\nGroup 2: Number of learners who need consolidation activities: ${clean(plan.group2Count) || '5'}\nGroup 3: Number of learners who need extended activities: ${clean(plan.group3Count) || '3'}` }
    ],
    [
      { content: `Introduction: Brief review or warm-up activity that connects to the learning objectives.\n${clean(plan.introduction)}`, colSpan: 2 }
    ]
  ];

  // A. GENERAL INFORMATION Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('A. GENERAL INFORMATION', 14, startY);
  startY += 1.8;

  autoTable(doc, {
    startY,
    body: generalInfoBody,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      textColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 91 },
      1: { cellWidth: 91 }
    },
    margin: { left: 14, right: 14 }
  });
  startY = (doc as any).lastAutoTable.finalY + 3;

  // B. IDENTIFIED GROUPS OF STRUGGLING LEARNERS Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('B. IDENTIFIED GROUPS OF STRUGGLING LEARNERS', 14, startY);
  startY += 1.8;

  const strugglingHead = [
    [
      { content: 'Categories of learners who need the\nremedial activities and issues identified', styles: { fontStyle: 'bold' as const, halign: 'center' as const } },
      { content: 'Objectives per categories identified', styles: { fontStyle: 'bold' as const, halign: 'center' as const } }
    ]
  ];

  const strugglingBody = [
    [
      { content: `Group 1:\n${clean(struggling.group1?.categoriesAndIssues)}` },
      { content: `Group 1:\n${clean(struggling.group1?.objectives)}` }
    ],
    [
      { content: `Group 2:\n${clean(struggling.group2?.categoriesAndIssues)}` },
      { content: `Group 2:\n${clean(struggling.group2?.objectives)}` }
    ],
    [
      { content: `Group 3:\n${clean(struggling.group3?.categoriesAndIssues)}` },
      { content: `Group 3:\n${clean(struggling.group3?.objectives)}` }
    ]
  ];

  autoTable(doc, {
    startY,
    head: strugglingHead,
    body: strugglingBody,
    theme: 'grid',
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: 1.2,
      lineColor: [0, 0, 0],
      lineWidth: 0.2
    },
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      textColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 91 },
      1: { cellWidth: 91 }
    },
    margin: { left: 14, right: 14 }
  });
  startY = (doc as any).lastAutoTable.finalY + 3;

  // C. IDENTIFIED PROBLEMS, REMEDIAL ACTIVITIES AND LEARNING AIDS Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('C. IDENTIFIED PROBLEMS, REMEDIAL ACTIVITIES AND LEARNING AIDS', 14, startY);
  startY += 1.8;

  const remHead = [
    [
      { content: 'Identified problem', styles: { fontStyle: 'bold' as const, halign: 'center' as const } },
      { content: 'Remedial activities', styles: { fontStyle: 'bold' as const, halign: 'center' as const } },
      { content: 'Methodology used', styles: { fontStyle: 'bold' as const, halign: 'center' as const } },
      { content: 'Teaching and learning aids', styles: { fontStyle: 'bold' as const, halign: 'center' as const } }
    ]
  ];

  const remBody = [
    [
      { content: `Group 1:\n${clean(remAct.group1?.problem)}` },
      { content: clean(remAct.group1?.activities) },
      { content: clean(remAct.group1?.methodology) },
      { content: clean(remAct.group1?.learningAids) }
    ],
    [
      { content: `Group 2:\n${clean(remAct.group2?.problem)}` },
      { content: clean(remAct.group2?.activities) },
      { content: clean(remAct.group2?.methodology) },
      { content: clean(remAct.group2?.learningAids) }
    ]
  ];

  autoTable(doc, {
    startY,
    head: remHead,
    body: remBody,
    theme: 'grid',
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: 1.2,
      lineColor: [0, 0, 0],
      lineWidth: 0.2
    },
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      textColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 69 },
      2: { cellWidth: 36 },
      3: { cellWidth: 37 }
    },
    margin: { left: 14, right: 14 }
  });
  startY = (doc as any).lastAutoTable.finalY + 3;

  // D. CONSOLIDATION AND EXTENDED ACTIVITIES FOR OTHER LEARNERS Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('D. CONSOLIDATION AND EXTENDED ACTIVITIES FOR OTHER LEARNERS', 14, startY);
  startY += 1.8;

  const conHead = [
    [
      { content: 'Category of learners &\nShort explanations', styles: { fontStyle: 'bold' as const, halign: 'center' as const } },
      { content: 'Consolidation/Extended\nactivities', styles: { fontStyle: 'bold' as const, halign: 'center' as const } },
      { content: 'Methodology\nused', styles: { fontStyle: 'bold' as const, halign: 'center' as const } },
      { content: 'Learning aids', styles: { fontStyle: 'bold' as const, halign: 'center' as const } }
    ]
  ];

  const conBody = [
    [
      { content: `Group 3:\nLearners who need consolidated activities\n${clean(conAct.group3?.categoryAndExplanation)}` },
      { content: clean(conAct.group3?.activities) },
      { content: clean(conAct.group3?.methodology) },
      { content: clean(conAct.group3?.learningAids) }
    ],
    [
      { content: `Group 4:\nLearners who need extended activities\n${clean(conAct.group4?.categoryAndExplanation)}` },
      { content: clean(conAct.group4?.activities) },
      { content: clean(conAct.group4?.methodology) },
      { content: clean(conAct.group4?.learningAids) }
    ]
  ];

  autoTable(doc, {
    startY,
    head: conHead,
    body: conBody,
    theme: 'grid',
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: 1.2,
      lineColor: [0, 0, 0],
      lineWidth: 0.2
    },
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      textColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 69 },
      2: { cellWidth: 36 },
      3: { cellWidth: 37 }
    },
    margin: { left: 14, right: 14 }
  });
  startY = (doc as any).lastAutoTable.finalY + 3;

  // Teacher's Self-Evaluation Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Teacher’s Self - Evaluation', 14, startY);
  startY += 1.8;

  const evalBody = [
    [
      {
        content: clean(plan.selfEvaluation) || '\n\n\n',
        styles: {
          fontSize: 7.5,
          cellPadding: 3,
          minCellHeight: 14,
          fontStyle: 'normal' as const
        }
      }
    ]
  ];

  autoTable(doc, {
    startY,
    body: evalBody,
    theme: 'grid',
    styles: {
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      textColor: [0, 0, 0]
    },
    margin: { left: 14, right: 14 }
  });

  addPageFooters(doc, `REB Remedial Plan • ${plan.subject || 'Subject'} (${plan.className || 'Class'})`);

  const safeSubject = (plan.subject || 'Subject').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeClass = (plan.className || 'Class').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Remedial_Plan_${safeSubject}_${safeClass}.pdf`;

  doc.save(filename);
};

/**
 * 5. EXPORT GENERAL LESSON PLAN TO PDF
 */
export const exportGenericLessonPlanToPdf = async (
  plan: LessonPlan
): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  addOfficialHeader(doc, 'LESSON PLAN (REB COMPETENCE-BASED CURRICULUM)');

  let startY = 34;

  const metaBody = [
    [
      { content: `School: ${clean(plan.schoolName)}`, styles: { fontStyle: 'bold' as const } },
      { content: `Teacher: ${clean(plan.teacherName)}`, styles: { fontStyle: 'bold' as const } },
      { content: `Date: ${clean(plan.date)}`, styles: { fontStyle: 'bold' as const } }
    ],
    [
      { content: `Subject: ${clean(plan.subject)}` },
      { content: `Class: ${clean(plan.className)}` },
      { content: `Duration: ${clean(plan.duration) || '40 min'}` }
    ],
    [
      { content: `Unit: ${clean(plan.unitNumber)} - ${clean(plan.unitName)}`, colSpan: 2 },
      { content: `Class Size: ${clean(plan.classSize) || '45'}` }
    ],
    [
      { content: `Lesson: ${clean(plan.lessonNumber)} - ${clean(plan.lessonName)}`, colSpan: 3, styles: { fontStyle: 'bold' as const, fillColor: [248, 250, 252] as [number, number, number] } }
    ]
  ];

  autoTable(doc, {
    startY,
    body: metaBody,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2,
      lineColor: [203, 213, 225],
      lineWidth: 0.3,
      textColor: [15, 23, 42]
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 65 },
      2: { cellWidth: 57 }
    },
    margin: { left: 14, right: 14 }
  });

  startY = (doc as any).lastAutoTable.finalY + 3;

  const compBody = [
    [
      { content: 'Key Competence:', styles: { fontStyle: 'bold' as const, cellWidth: 40, fillColor: [241, 245, 249] as [number, number, number] } },
      { content: clean(plan.keyCompetence) }
    ],
    [
      { content: 'Instructional Objective:', styles: { fontStyle: 'bold' as const, fillColor: [241, 245, 249] as [number, number, number] } },
      { content: clean(plan.instructionalObjective) || `${plan.objectives?.knowledge || ''} ${plan.objectives?.skills || ''}` }
    ],
    [
      { content: 'Learning Materials:', styles: { fontStyle: 'bold' as const, fillColor: [241, 245, 249] as [number, number, number] } },
      { content: clean(plan.materials) || 'Chalkboard, Student Book, Teacher Guide.' }
    ]
  ];

  autoTable(doc, {
    startY,
    body: compBody,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2,
      lineColor: [203, 213, 225],
      lineWidth: 0.3,
      textColor: [15, 23, 42]
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 142 }
    },
    margin: { left: 14, right: 14 }
  });

  startY = (doc as any).lastAutoTable.finalY + 3;

  const stepsHead = [
    [
      { content: 'Timing', styles: { halign: 'center' as const } },
      { content: 'Description of Teaching & Learning Activities', styles: { halign: 'center' as const } },
      { content: 'Competences Addressed', styles: { halign: 'center' as const } }
    ]
  ];

  const steps = plan.steps || ({} as any);

  const stepsBody = [
    [
      { content: `Introduction\n(${clean(steps.introduction?.duration) || '10 min'})`, styles: { fontStyle: 'bold' as const, halign: 'center' as const } },
      { content: `Teacher: ${clean(steps.introduction?.teacherActivity)}\n\nLearner: ${clean(steps.introduction?.learnerActivity)}` },
      { content: clean(steps.introduction?.competences) || 'Critical thinking, communication' }
    ],
    [
      { content: `Development\n(${clean(steps.presentation?.duration) || '20 min'})`, styles: { fontStyle: 'bold' as const, halign: 'center' as const } },
      { content: `Teacher: ${clean(steps.presentation?.teacherActivity)}\n\nLearner: ${clean(steps.presentation?.learnerActivity)}` },
      { content: clean(steps.presentation?.competences) || 'Cooperation, problem solving' }
    ],
    [
      { content: `Conclusion\n(${clean(steps.conclusion?.duration) || '10 min'})`, styles: { fontStyle: 'bold' as const, halign: 'center' as const } },
      { content: `Teacher: ${clean(steps.conclusion?.teacherActivity)}\n\nLearner: ${clean(steps.conclusion?.learnerActivity)}` },
      { content: clean(steps.conclusion?.competences) || 'Self-evaluation, lifelong learning' }
    ]
  ];

  autoTable(doc, {
    startY,
    head: stepsHead,
    body: stepsBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 2
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [203, 213, 225],
      lineWidth: 0.3,
      textColor: [15, 23, 42]
    },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 98 },
      2: { cellWidth: 52 }
    },
    margin: { left: 14, right: 14 }
  });

  addPageFooters(doc, `REB Lesson Plan • ${plan.subject} (${plan.className})`);

  const safeSubject = (plan.subject || 'Subject').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Lesson_Plan_${safeSubject}_${plan.className || 'Class'}.pdf`;

  doc.save(filename);
};

export interface StudentForPdf {
  id?: string;
  regNo?: string;
  names?: string;
  gender?: string;
  dob?: string;
  pob?: string;
  dobPlace?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  residence?: string;
  attendance?: string;
  fatherName?: string;
  fatherPhone?: string;
  fatherId?: string;
  motherName?: string;
  motherPhone?: string;
  motherId?: string;
  guardianName?: string;
  guardianPhone?: string;
}

export interface SchoolInfoForPdf {
  schoolName: string;
  academicYear: string;
  classCombo: string;
}

/**
 * Renders a single student form onto the current page of a jsPDF document.
 * Vertically stretched and balanced to cover the full A4 page (297mm) cleanly on exactly 1 page.
 */
const renderStudentIdPage = async (
  doc: jsPDF,
  st: StudentForPdf,
  schoolInfo: SchoolInfoForPdf,
  index: number,
  totalCount: number
) => {
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  // 1. Top Decorative Ribbon
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 5, 'F');
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 5, pageWidth, 1.8, 'F');

  // 2. Official Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  doc.text('REPUBLIC OF RWANDA', pageWidth / 2, 14.5, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('MINISTRY OF EDUCATION / RWANDA BASIC EDUCATION BOARD (REB)', pageWidth / 2, 19.5, { align: 'center' });

  const school = (schoolInfo.schoolName || 'GS MAYANGE B').toUpperCase();
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(school, pageWidth / 2, 27, { align: 'center' });

  // Badge for Form Title
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.setLineWidth(0.4);
  doc.roundedRect(pageWidth / 2 - 62, 30.5, 124, 7.5, 2, 2, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 120, 87); // emerald-700
  doc.text('STUDENT IDENTIFICATION & REGISTRATION FORM', pageWidth / 2, 35.5, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Academic Year: ${schoolInfo.academicYear || new Date().getFullYear()}   •   Class / Stream: ${schoolInfo.classCombo || 'All'}`, pageWidth / 2, 42.5, { align: 'center' });

  // Divider line
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.6);
  doc.line(margin, 45.5, pageWidth - margin, 45.5);
  doc.setLineWidth(0.2);
  doc.line(margin, 46.5, pageWidth - margin, 46.5);

  // 3. Meta Box + QR Code
  const metaBoxY = 49;
  const metaBoxH = 34;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(0, 0, 0); // solid black border
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, metaBoxY, contentWidth, metaBoxH, 1.5, 1.5, 'FD');

  // Text inside meta box
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('Registration Number:', margin + 4, metaBoxY + 7);
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(4, 120, 87); // emerald-700
  doc.text(clean(st.regNo) || 'N/A', margin + 43, metaBoxY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Class & Combination:', margin + 4, metaBoxY + 15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(clean(schoolInfo.classCombo) || '-', margin + 43, metaBoxY + 15);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Attendance Mode:', margin + 4, metaBoxY + 23);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(st.attendance === 'Boarding' ? 'Boarder (Internat)' : 'Day Student (Externe)', margin + 43, metaBoxY + 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Official Issue Date: ${new Date().toLocaleDateString('en-GB')}   •   Record Ref: NKORERA-STD-${clean(st.regNo) || '001'}`, margin + 4, metaBoxY + 30);

  // Parse location and formatted dates
  const formattedDob = st.dob ? (() => {
    if (st.dob.includes('-')) {
      const dp = st.dob.split('-');
      if (dp.length === 3) return `${dp[2]}/${dp[1]}/${dp[0]}`;
    }
    return st.dob;
  })() : (st.dobPlace ? st.dobPlace.split(' - ')[0] : '-');

  const placeOfBirth = st.pob || (st.dobPlace ? st.dobPlace.split(' - ')[1] : '-');
  const district = st.district || (st.residence ? st.residence.split(',')[0] : '-');
  const sector = st.sector || (st.residence ? st.residence.split(',')[1] : '-');
  const cell = st.cell || (st.residence ? st.residence.split(',')[2] : '-');
  const village = st.village || (st.residence ? st.residence.split(',')[3] : '-');

  // QR Code Box on right of meta box
  const qrString = `REPUBLIC OF RWANDA - REB\nSTUDENT IDENTIFICATION RECORD\nNames: ${st.names || '-'}\nReg No: ${st.regNo || 'N/A'}\nGender: ${st.gender === 'M' ? 'Male' : 'Female'}\nSchool: ${schoolInfo.schoolName || 'N/A'}\nClass: ${schoolInfo.classCombo || 'N/A'}\nDOB: ${formattedDob}\nPOB: ${placeOfBirth}\nGuardian: ${st.fatherPhone || st.motherPhone || st.guardianPhone || 'N/A'}\nVerified by Nkorera Portal`;

  try {
    const qrDataUrl = await QRCode.toDataURL(qrString, {
      width: 250,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0f172a', light: '#ffffff' }
    });
    const qrSize = 27;
    const qrX = pageWidth - margin - qrSize - 3.5;
    const qrY = metaBoxY + 2.5;
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('QR VERIFICATION', qrX + qrSize / 2, qrY + qrSize + 3, { align: 'center' });
  } catch (err) {
    console.warn('QR Code generation skipped in PDF:', err);
  }

  // 4. Section 1: Student Personal Identity Table (Solid black grid lines)
  const sec1StartY = metaBoxY + metaBoxH + 4;

  const sec1Rows = [
    ['Full Names:', (st.names || '-').toUpperCase()],
    ['Gender:', st.gender === 'M' ? 'Male' : (st.gender === 'F' ? 'Female' : (st.gender || '-'))],
    ['Date Of Birth:', formattedDob || '-'],
    ['Place Of Birth:', placeOfBirth || '-'],
    ['Class & Combination:', clean(schoolInfo.classCombo) || '-'],
    ['District:', district || '-'],
    ['Sector:', sector || '-'],
    ['Cell:', cell || '-'],
    ['Village:', village || '-'],
    ['Attendance Mode:', st.attendance === 'Boarding' ? 'Boarder' : 'Day Student']
  ];

  autoTable(doc, {
    startY: sec1StartY,
    head: [[{ content: '1. STUDENT PERSONAL IDENTITY', colSpan: 2 }]],
    body: sec1Rows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      cellPadding: 2.2,
      lineColor: [0, 0, 0],
      lineWidth: 0.35
    },
    styles: {
      fontSize: 8.2,
      cellPadding: 2.2,
      lineColor: [0, 0, 0],
      lineWidth: 0.35,
      textColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.35 },
      1: { cellWidth: contentWidth - 50, fontStyle: 'bold', lineColor: [0, 0, 0], lineWidth: 0.35 }
    },
    margin: { left: margin, right: margin }
  });

  // 5. Section 2: Parents & Guardians Table (Solid black grid lines)
  const sec2StartY = (doc as any).lastAutoTable.finalY + 3.5;

  const fatherInfo = `${clean(st.fatherName) || '-'}${st.fatherPhone ? ` (${st.fatherPhone})` : ''}${st.fatherId ? ` [ID: ${st.fatherId}]` : ''}`;
  const motherInfo = `${clean(st.motherName) || '-'}${st.motherPhone ? ` (${st.motherPhone})` : ''}${st.motherId ? ` [ID: ${st.motherId}]` : ''}`;
  const guardianInfo = `${clean(st.guardianName) || '-'}${st.guardianPhone ? ` (${st.guardianPhone})` : ' (-)'}`;

  const sec2Rows = [
    ["Father's Name & Phone:", fatherInfo],
    ["Mother's Name & Phone:", motherInfo],
    ["Guardian & Phone:", guardianInfo]
  ];

  autoTable(doc, {
    startY: sec2StartY,
    head: [[{ content: '2. PARENTS & GUARDIANS', colSpan: 2 }]],
    body: sec2Rows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      cellPadding: 2.2,
      lineColor: [0, 0, 0],
      lineWidth: 0.35
    },
    styles: {
      fontSize: 8.2,
      cellPadding: 2.2,
      lineColor: [0, 0, 0],
      lineWidth: 0.35,
      textColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.35 },
      1: { cellWidth: contentWidth - 50, fontStyle: 'normal', lineColor: [0, 0, 0], lineWidth: 0.35 }
    },
    margin: { left: margin, right: margin }
  });

  // 6. Signatures & Attestation Section (Cleanly grouped at bottom with crisp black borders)
  const sigY = (doc as any).lastAutoTable.finalY + 5;
  const colWidth = (contentWidth - 8) / 2;
  const sigBoxHeight = 32;

  // Student / Parent Signature Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, sigY, colWidth, sigBoxHeight, 1.5, 1.5, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Student or Parent Signature:', margin + 4, sigY + 6);

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(margin + 4, sigY + 23, margin + colWidth - 4, sigY + 23);
  doc.setLineDashPattern([], 0); // reset dash

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(71, 85, 105);
  doc.text('Signature & Date / Umukono n\'Itariki', margin + 4, sigY + 28);

  // Headteacher Attestation & Stamp Box
  const rightColX = margin + colWidth + 8;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.roundedRect(rightColX, sigY, colWidth, sigBoxHeight, 1.5, 1.5, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('School Headteacher Attestation:', rightColX + 4, sigY + 6);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('OFFICIAL STAMP & SIGNATURE', rightColX + colWidth / 2, sigY + 16, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('courier', 'bold');
  doc.setTextColor(4, 120, 87);
  doc.text('NKORERA EDUCATIONAL PORTAL VERIFIED', rightColX + colWidth / 2, sigY + 24, { align: 'center' });

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, rightColX + 4, sigY + 29);

  // 8. Security Footer
  const footerY = pageHeight - 9;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Ref: NKORERA-STD-${clean(st.regNo) || '001'}`, margin, footerY + 2);
  doc.text('Official Rwanda Education Board (REB) Student Form', pageWidth / 2, footerY + 2, { align: 'center' });
  doc.text(`Record (${index + 1} of ${totalCount})`, pageWidth - margin, footerY + 2, { align: 'right' });
};

/**
 * High-speed native vector PDF exporter for the entire Student Identification Roster.
 * Renders each student on a separate page in milliseconds.
 */
export const exportStudentIdentificationRosterToPdf = async (
  students: StudentForPdf[],
  schoolInfo: SchoolInfoForPdf
) => {
  if (!students || students.length === 0) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  for (let i = 0; i < students.length; i++) {
    if (i > 0) {
      doc.addPage('a4', 'portrait');
    }
    await renderStudentIdPage(doc, students[i], schoolInfo, i, students.length);
  }

  const cleanSchool = (schoolInfo.schoolName || 'School').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanClass = (schoolInfo.classCombo || 'Class').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Student_Identification_Forms_${cleanClass}_${cleanSchool}.pdf`;

  doc.save(filename);
};

/**
 * High-speed native vector PDF exporter for a single student.
 */
export const exportSingleStudentIdToPdf = async (
  student: StudentForPdf,
  schoolInfo: SchoolInfoForPdf,
  index: number = 0,
  totalCount: number = 1
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  await renderStudentIdPage(doc, student, schoolInfo, index, totalCount);

  const cleanName = (student.names || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanReg = (student.regNo || 'Record').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Student_ID_Form_${cleanName}_${cleanReg}.pdf`;

  doc.save(filename);
};

