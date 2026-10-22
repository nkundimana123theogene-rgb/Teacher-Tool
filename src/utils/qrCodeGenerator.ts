import QRCode from 'qrcode';
import jsPDF from 'jspdf';

const clean = (text: string | null | undefined): string => {
  if (!text) return '';
  return String(text)
    .replace(/[^\x20-\x7E\r\n\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export interface LessonPlanQrDetails {
  id: string;
  title: string;
  subject: string;
  className: string;
  type?: 'cbc' | 'remedial' | 'nursery' | string;
  schoolName?: string;
  teacherName?: string;
  date?: string;
  term?: string;
  unitTitle?: string;
  duration?: string;
  keyCompetence?: string;
}

/**
 * Generate deep-link URL for opening a digital lesson plan directly on any device.
 */
export const buildLessonPlanDigitalUrl = (
  planId: string, 
  type: string = 'cbc', 
  customOrigin?: string
): string => {
  let origin = 'https://nkorera.rw';
  let pathname = '';
  
  if (typeof window !== 'undefined') {
    origin = customOrigin || window.location.origin;
    pathname = window.location.pathname;
  }
  
  // Clean trailing slash
  const base = `${origin}${pathname}`.replace(/\/+$/, '');
  return `${base}?planId=${encodeURIComponent(planId)}&planType=${encodeURIComponent(type)}`;
};

/**
 * Generates a Data URL (PNG base64) for a QR code string with standard quiet zone and high optical contrast.
 */
export const generateQrCodeDataUrl = async (
  text: string, 
  size: number = 512,
  darkColor: string = '#000000'
): Promise<string> => {
  try {
    return await QRCode.toDataURL(text, {
      width: Math.max(size, 400),
      margin: 3, // Standard ISO quiet zone ensures camera edge detectors find it immediately
      color: {
        dark: darkColor || '#000000', // Pure #000000 black provides 100% optical contrast against white
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M' // Level M produces larger, more readable modules for rapid scanning
    });
  } catch (err) {
    console.error('Error generating QR code data URL:', err);
    throw err;
  }
};

/**
 * Download QR Code as a PNG image file
 */
export const downloadQrCodePng = (dataUrl: string, fileName: string = 'lesson_plan_qr.png') => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generates a professional printable A4 PDF placard with the QR Code and lesson metadata
 */
export const generatePrintableLessonPlanQrPdf = async (
  plan: LessonPlanQrDetails,
  format: 'single-placard' | 'desk-cards-4up' = 'single-placard'
): Promise<void> => {
  const digitalUrl = buildLessonPlanDigitalUrl(plan.id, plan.type || 'cbc');
  const qrDataUrl = await generateQrCodeDataUrl(digitalUrl, 400);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4' // 210mm x 297mm
  });

  const pageWidth = 210;

  if (format === 'single-placard') {
    // -------------------------------------------------------------
    // FULL A4 LESSON PLAN QR CODE PLACARD (For Classrooms / Inspection / Binders)
    // -------------------------------------------------------------

    // Top Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 30, 'F');

    // Accent Bar
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, 30, pageWidth, 2, 'F');

    // Header Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('NKORERA EDUCATIONAL ENGINE', 14, 13);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Official REB/NESA Digital Lesson Plan Verification & Mobile Access', 14, 21);

    // Digital Access Badge (Top Right)
    doc.setFillColor(30, 41, 59); // slate-800
    doc.roundedRect(pageWidth - 62, 7, 48, 16, 3, 3, 'F');
    doc.setTextColor(52, 211, 153); // emerald-400
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('INSTANT SCAN ACCESS', pageWidth - 38, 15, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(203, 213, 225);
    doc.text('Mobile / Tablet Ready', pageWidth - 38, 19.5, { align: 'center' });

    // LESSON DETAILS CARD
    const cardY = 38;
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.4);
    doc.roundedRect(14, cardY, pageWidth - 28, 48, 4, 4, 'FD');

    // Tag pills
    doc.setFillColor(16, 185, 129); // emerald
    doc.roundedRect(18, cardY + 5, 28, 6, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text((plan.subject || 'Subject').toUpperCase(), 32, cardY + 9.2, { align: 'center' });

    doc.setFillColor(14, 165, 233); // cyan
    doc.roundedRect(48, cardY + 5, 24, 6, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.text((plan.className || 'Class').toUpperCase(), 60, cardY + 9.2, { align: 'center' });

    if (plan.term) {
      doc.setFillColor(100, 116, 139); // slate-500
      doc.roundedRect(74, cardY + 5, 20, 6, 2, 2, 'F');
      doc.text(`TERM ${plan.term}`, 84, cardY + 9.2, { align: 'center' });
    }

    // Type badge
    const typeLabel = plan.type === 'remedial' ? 'REMEDIAL LESSON' : plan.type === 'nursery' ? 'NURSERY LESSON' : 'CBC LESSON PLAN';
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(typeLabel, pageWidth - 18, cardY + 9.5, { align: 'right' });

    // Lesson Title
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(clean(plan.title || 'Untitled Lesson'), pageWidth - 36);
    doc.text(titleLines.slice(0, 2), 18, cardY + 18);

    // Meta details row
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);

    const teacherStr = plan.teacherName ? `Teacher: ${clean(plan.teacherName)}` : 'Teacher: General';
    const schoolStr = plan.schoolName ? `School: ${clean(plan.schoolName)}` : 'School: Standard';
    const dateStr = plan.date ? `Date: ${clean(plan.date)}` : '';
    const durStr = plan.duration ? `Duration: ${clean(plan.duration)}` : '';

    doc.text(`${teacherStr}  •  ${schoolStr}`, 18, cardY + 33);
    doc.text(`${dateStr}  ${durStr ? ` •  ${durStr}` : ''}${plan.unitTitle ? `  •  Unit: ${clean(plan.unitTitle)}` : ''}`, 18, cardY + 41);

    // QR CODE DISPLAY BOX (CENTERPIECE)
    const qrBoxY = 93;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(16, 185, 129); // emerald-500 border
    doc.setLineWidth(1);
    doc.roundedRect(30, qrBoxY, pageWidth - 60, 115, 6, 6, 'FD');

    // QR Title
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SCAN TO OPEN DIGITAL LESSON PLAN', pageWidth / 2, qrBoxY + 12, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Instantly opens interactive lesson plan on phone, tablet, or laptop', pageWidth / 2, qrBoxY + 18, { align: 'center' });

    // Embed QR Code Image
    const qrSize = 68;
    const qrX = (pageWidth - qrSize) / 2;
    doc.addImage(qrDataUrl, 'PNG', qrX, qrBoxY + 22, qrSize, qrSize);

    // Deep link text below QR
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(36, qrBoxY + 94, pageWidth - 72, 13, 3, 3, 'F');
    doc.setFontSize(7.5);
    doc.setFont('courier', 'bold');
    doc.setTextColor(30, 41, 59);
    const shortUrl = digitalUrl.length > 58 ? digitalUrl.substring(0, 56) + '...' : digitalUrl;
    doc.text(shortUrl, pageWidth / 2, qrBoxY + 102, { align: 'center' });

    // HOW TO SCAN / INSTRUCTIONS CARD
    const instY = 215;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, instY, pageWidth - 28, 52, 4, 4, 'FD');

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('HOW TEACHERS & HEAD TEACHERS USE THIS QR CODE:', 20, instY + 9);

    const steps = [
      '1. Open Camera App: Open standard Camera on Android or iPhone (no extra app required).',
      '2. Scan & Tap Link: Aim the camera lens at the QR code above and tap the yellow/green popup link.',
      '3. Digital Teaching Mode: View the step-by-step activities, timing prompts, competence checklist, and teaching notes directly on your screen.',
      '4. Offline & Inspection Ready: The plan is permanently verifiable on Cloud Firestore & available offline.'
    ];

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);

    steps.forEach((step, idx) => {
      doc.text(step, 20, instY + 18 + (idx * 7.5));
    });

    // FOOTER
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 280, pageWidth - 14, 280);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated by Nkorera Educational System • Plan ID: ${plan.id}`, 14, 286);
    doc.text(`Printed on ${new Date().toLocaleDateString('en-GB')}`, pageWidth - 14, 286, { align: 'right' });

  } else {
    // -------------------------------------------------------------
    // 4-UP DESK / BINDER CARDS (Grid of 4 Printable Badges on 1 Page)
    // -------------------------------------------------------------
    
    // Page Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('NKORERA DIGITAL LESSON PLAN QR BADGES (4-UP PRINTABLE)', 14, 11);

    const cardWidth = 88;
    const cardHeight = 125;
    const margin = 12;
    const gapX = 10;
    const gapY = 8;

    for (let i = 0; i < 4; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);

      const x = margin + (col * (cardWidth + gapX));
      const y = 24 + (row * (cardHeight + gapY));

      // Card Container
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.4);
      doc.roundedRect(x, y, cardWidth, cardHeight, 4, 4, 'FD');

      // Card Header
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(x, y, cardWidth, 14, 4, 4, 'F');
      doc.rect(x, y + 10, cardWidth, 4, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('DIGITAL LESSON PLAN', x + 6, y + 9);

      doc.setFillColor(16, 185, 129);
      doc.roundedRect(x + cardWidth - 28, y + 3.5, 24, 7, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6.5);
      doc.text((plan.subject || 'CBC').substring(0, 8).toUpperCase(), x + cardWidth - 16, y + 8, { align: 'center' });

      // Title
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      const cardTitle = clean(plan.title || 'Lesson Plan');
      const lines = doc.splitTextToSize(cardTitle, cardWidth - 10);
      doc.text(lines.slice(0, 2), x + 5, y + 21);

      // Meta info
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`${plan.className || 'Class'} • ${plan.teacherName ? clean(plan.teacherName) : 'Teacher'}`, x + 5, y + 31);
      doc.text(`${plan.schoolName ? clean(plan.schoolName) : 'School'} • ${plan.date || ''}`, x + 5, y + 36);

      // QR Code
      const qrS = 48;
      const qrPosX = x + (cardWidth - qrS) / 2;
      doc.addImage(qrDataUrl, 'PNG', qrPosX, y + 40, qrS, qrS);

      // Footer call-to-action
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(x + 4, y + 92, cardWidth - 8, 16, 2, 2, 'F');
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('SCAN WITH PHONE CAMERA', x + cardWidth / 2, y + 98, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Instantly opens interactive digital plan', x + cardWidth / 2, y + 104, { align: 'center' });

      // Cut guideline
      doc.setDrawColor(203, 213, 225);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(x - 2, y - 2, x + cardWidth + 2, y - 2);
      doc.line(x - 2, y + cardHeight + 2, x + cardWidth + 2, y + cardHeight + 2);
      doc.setLineDashPattern([], 0); // reset
    }

    // Bottom note
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Cut along dashed lines to place QR badges on teacher desks, binders, or classroom boards.', 14, 290);
  }

  const safeFilename = `${(plan.title || 'Lesson_Plan').replace(/[^a-zA-Z0-9_-]/g, '_')}_QR_Code.pdf`;
  doc.save(safeFilename);
};
