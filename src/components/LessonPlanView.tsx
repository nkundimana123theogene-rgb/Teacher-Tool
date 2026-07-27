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
  Trash2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LessonPlanData, LessonPlanStep, LessonStep } from '../types';
import { OWNER_INFO } from '../data/plans';
import { getLessonPlanLabels } from '../data/translations';

interface LessonPlanViewProps {
  plan: LessonPlanData;
  onBack?: () => void;
}

export const LessonPlanView: React.FC<LessonPlanViewProps> = ({ plan, onBack }) => {
  const [editedPlan, setEditedPlan] = useState<LessonPlanData>(plan);
  const labels = getLessonPlanLabels(editedPlan.language);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditedPlan(plan);
  }, [plan]);

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
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Replace oklch/oklab in cloned stylesheets with light safe fallbacks
          const styleTags = Array.from(clonedDoc.querySelectorAll('style'));
          styleTags.forEach((style) => {
            if (style.textContent && /(oklch|oklab|color-mix|light-dark)/i.test(style.textContent)) {
              style.textContent = style.textContent.replace(/(oklch|oklab|color-mix|light-dark)\([^)]*\)/gi, '#ffffff');
            }
          });

          // Override styles on printable elements in the clone to guarantee crisp white & light grey background
          const printEl = clonedDoc.querySelector('.printable-document') as HTMLElement;
          if (printEl) {
            printEl.style.backgroundColor = '#ffffff';
            printEl.style.color = '#000000';

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

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 4; // top margin in mm

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      const filename = `${editedPlan.header.subject}_${editedPlan.header.classGrade}_${(editedPlan.header.lessonTitle || 'LessonPlan').replace(/[^a-zA-Z0-9]/g, '_')}_TeacherTool.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('jsPDF export error, falling back to window.print():', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadWord = () => {
    const filename = `${editedPlan.header.subject}_${editedPlan.header.classGrade}_${(editedPlan.header.lessonTitle || 'LessonPlan').replace(/[^a-zA-Z0-9]/g, '_')}_TeacherTool.doc`;
    
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${editedPlan.header.lessonTitle || 'Lesson Plan'}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.4; color: #333; }
          h1 { color: #0d9488; font-size: 20pt; text-align: center; margin-bottom: 5pt; }
          h2 { color: #0f766e; font-size: 14pt; margin-top: 15pt; border-bottom: 2px solid #0f766e; padding-bottom: 3pt; }
          table { width: 100%; border-collapse: collapse; margin-top: 10pt; margin-bottom: 15pt; }
          th, td { border: 1px solid #94a3b8; padding: 6pt; text-align: left; font-size: 10pt; vertical-align: top; }
          th { background-color: #f1f5f9; color: #0f766e; font-weight: bold; }
          .header-label { font-weight: bold; color: #334155; }
          .footer-note { text-align: center; font-size: 8pt; color: #64748b; margin-top: 20pt; border-top: 1px solid #cbd5e1; padding-top: 10pt; }
        </style>
      </head>
      <body>
        <h1>TEACHER TOOL - LESSON PLAN</h1>
        <p style='text-align: center; font-size: 10pt; color: #0d9488; font-weight: bold;'>REB Competence-Based Curriculum (CBC) Compliant</p>
        
        <h2>1. LESSON PLAN IDENTIFICATION / IMYIRONDORO</h2>
        <table>
          <tr>
            <td width="25%"><span class="header-label">School Name:</span></td>
            <td width="25%">${editedPlan.header.schoolName || 'N/A'}</td>
            <td width="25%"><span class="header-label">Teacher's Name:</span></td>
            <td width="25%">${editedPlan.header.teacherName || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">Subject:</span></td>
            <td>${editedPlan.header.subject || 'N/A'}</td>
            <td><span class="header-label">Class / Grade:</span></td>
            <td>${editedPlan.header.classGrade || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">Term:</span></td>
            <td>${editedPlan.header.term || 'N/A'}</td>
            <td><span class="header-label">Date:</span></td>
            <td>${editedPlan.header.date || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">Unit Number:</span></td>
            <td>${editedPlan.header.unitNo || 'N/A'}</td>
            <td><span class="header-label">Lesson Number:</span></td>
            <td>${editedPlan.header.lessonNo || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">Duration:</span></td>
            <td>${editedPlan.header.duration || 'N/A'}</td>
            <td><span class="header-label">Class Size:</span></td>
            <td>${editedPlan.header.classSize || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">Location:</span></td>
            <td>${editedPlan.header.location || 'N/A'}</td>
            <td><span class="header-label">Special Needs:</span></td>
            <td>${editedPlan.header.specialNeeds || 'None'}</td>
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

        <h2>4. SELF-EVALUATION / ISUZUMA-BUMENYI</h2>
        <table style='width: 100%; border: 1px solid #cbd5e1;'>
          <tr>
            <td style='padding: 10pt;'>
              ${(editedPlan.selfEvaluation || 'Teacher self-evaluation not completed yet.').replace(/\n/g, '<br/>')}
            </td>
          </tr>
        </table>

        <div class="footer-note">
          <p>Generated via <strong>Teacher Tool Platform</strong> • Developer & Support: Nkundimana Theogene (0781339530)</p>
          <p>&copy; ${new Date().getFullYear()} All Rights Reserved.</p>
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

  const isRebGrid = editedPlan.format === 'reb_grid';

  return (
    <div className="space-y-6">
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
              <span className="text-xs bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded-full">
                {isRebGrid ? 'REB / CBC Format' : 'Open Format'}
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

      {isEditMode && (
        <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl text-xs text-amber-900 flex items-center justify-between print:hidden">
          <p className="font-semibold">
            ✏️ Live Edit Mode Active: Click any field or table cell below to edit text directly before printing or downloading PDF.
          </p>
          <button
            onClick={handleAddStep}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Step</span>
          </button>
        </div>
      )}

      {/* PRINT STYLES SPECIFICALLY FOR CLEAN A4 SINGLE-PAGE PRINT OUTPUT */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 10pt !important;
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
            margin: 8mm 8mm 8mm 8mm;
          }
          .printable-document {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
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
        className="printable-document bg-white p-6 sm:p-8 rounded-2xl border border-slate-300 shadow-md max-w-5xl mx-auto text-slate-900 font-serif leading-tight"
        style={{ color: '#000' }}
      >
        {isRebGrid ? (
          /* EXACT REB / CBC GRID FORMAT */
          <div className="space-y-3">
            {/* Header Line */}
            <div className="flex justify-between items-center text-sm font-sans font-bold border-b border-slate-800 pb-1 mb-2">
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

            {/* Table 1: Lesson Metadata */}
            <table className="w-full border-collapse border border-slate-900 text-xs font-sans">
              <tbody>
                {/* Row 1: Headers */}
                <tr className="bg-slate-100/90 text-center font-bold">
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

                {/* Footer Row: Teacher Self-Evaluation */}
                <tr>
                  <td className="border border-slate-900 p-2 font-bold bg-slate-100 italic">
                    {labels.selfEvaluation}
                  </td>
                  <td colSpan={3} className="border border-slate-900 p-2 text-xs italic bg-slate-50/50">
                    {isEditMode ? (
                      <textarea
                        value={editedPlan.selfEvaluation || ''}
                        onChange={(e) =>
                          setEditedPlan((prev) => ({
                            ...prev,
                            selfEvaluation: e.target.value,
                          }))
                        }
                        rows={2}
                        className="w-full border border-amber-300 bg-amber-50/40 p-1 rounded text-xs italic"
                        placeholder="Teacher self-evaluation note..."
                      />
                    ) : (
                      editedPlan.selfEvaluation || ''
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          /* OPEN FORMAT VIEW */
          <div className="space-y-4 font-sans">
            <div className="border-b-2 border-emerald-600 pb-3">
              <h1 className="text-xl font-bold text-slate-900">{editedPlan.header.lessonTitle}</h1>
              <p className="text-xs text-slate-600 mt-1">
                {editedPlan.header.schoolName} | Teacher: {editedPlan.header.teacherName} | {editedPlan.header.subject} ({editedPlan.header.classGrade})
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div><span className="font-bold">{labels.term}:</span> {editedPlan.header.term}</div>
              <div><span className="font-bold">{labels.date}:</span> {editedPlan.header.date}</div>
              <div><span className="font-bold">{labels.unitTitle}:</span> {editedPlan.header.unitTitle}</div>
              <div><span className="font-bold">{labels.duration}:</span> {editedPlan.header.duration}</div>
              <div className="col-span-2"><span className="font-bold">{labels.keyUnitCompetence}:</span> {editedPlan.header.keyUnitCompetence}</div>
              <div className="col-span-2"><span className="font-bold">{labels.instructionalObjective}:</span> {editedPlan.header.instructionalObjective}</div>
            </div>

            {editedPlan.openFormatContent ? (
              <div className="prose prose-sm max-w-none text-xs leading-relaxed whitespace-pre-line">
                {editedPlan.openFormatContent}
              </div>
            ) : (
              <div className="space-y-4">
                {editedPlan.steps.map((step, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-3 bg-white">
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
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-2 text-xs italic text-slate-600">
              <span className="font-bold not-italic">{labels.selfEvaluation}:</span> {editedPlan.selfEvaluation || ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


