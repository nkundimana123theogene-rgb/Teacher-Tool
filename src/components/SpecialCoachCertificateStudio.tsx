import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Printer, CheckCircle, Edit, Award, Globe, Lock, Unlock, ShieldCheck } from 'lucide-react';
import { generateQrCodeDataUrl } from '../utils/qrCodeGenerator';
import jsPDF from 'jspdf';
import { db, auth, checkSingleCertificateUnlocked, toggleCertificateLockStatus, checkIsAdmin, doc, setDoc, onSnapshot } from '../utils/firebase';

interface CertificateData {
  recipientName: string;
  awardTitle: string;
  schoolName: string;
  issueDate: string;
  signatureName: string;
  signatureRole: string;
  verificationNumber: string;
}

export const SpecialCoachCertificateStudio: React.FC = () => {
  const [data, setData] = useState<CertificateData>({
    recipientName: 'Phyllis Schwaiger',
    awardTitle: 'Special Coach',
    schoolName: 'GS Mayange B',
    issueDate: 'August 28, 2026',
    signatureName: 'Nkundimana Theogene',
    signatureRole: 'Executive Director, Nkorera',
    verificationNumber: 'SC-2026-8947'
  });

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isProcessingToggle, setIsProcessingToggle] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

  // Check admin and certificate unlock status in real-time
  useEffect(() => {
    let unsub: (() => void) | null = null;
    const checkState = async () => {
      const user = auth?.currentUser;
      const adminEmail = 'nkundimana123theogene@gmail.com';
      const isEmailAdmin = user?.email === adminEmail;
      let admin = isEmailAdmin;
      if (user && !admin) {
        admin = await checkIsAdmin(user.uid);
      }
      setIsAdmin(admin);

      const unlocked = await checkSingleCertificateUnlocked(data.verificationNumber, user?.uid);
      setIsUnlocked(unlocked || admin);

      try {
        const certDocRef = doc(db, 'qr_scans', data.verificationNumber);
        unsub = onSnapshot(certDocRef, (snap) => {
          if (snap.exists()) {
            const d = snap.data();
            const u = d.isUnlocked === true || d.paymentStatus === 'Unlocked' || d.paymentStatus === 'Paid';
            setIsUnlocked(u || admin);
          }
        }, (err) => {
          console.warn("Real-time listener callback error:", err?.message);
        });
      } catch (err) {
        console.warn("Real-time listener in studio:", err);
      }
    };

    checkState();
    return () => {
      if (unsub) unsub();
    };
  }, [data.verificationNumber]);

  // Generate unique verification number
  const generateVerificationNumber = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setData(prev => ({
      ...prev,
      verificationNumber: `SC-2026-${randomSuffix}`
    }));
  };

  // Update QR Code whenever verification number or details change
  useEffect(() => {
    const updateQrCode = async () => {
      try {
        // Build a dynamic verification URL that scans directly to verification with fallbacks
        const verificationUrl = `https://teacherlessonplans.ai.studio/verify?id=${encodeURIComponent(data.verificationNumber)}&ercipient=${encodeURIComponent(data.recipientName)}`;
          
        const qrUrl = await generateQrCodeDataUrl(verificationUrl, 512, '#000000');
        setQrCodeUrl(qrUrl);

        // Safely write/register to Firestore qr_scans collection for real-time verification
        await setDoc(doc(db, 'qr_scans', data.verificationNumber), {
          id: data.verificationNumber,
          verificationNo: data.verificationNumber,
          recipientName: data.recipientName,
          title: data.awardTitle,
          description: `This certificate is proudly presented to ${data.recipientName} of ${data.schoolName} in recognition of outstanding commitment as a Special Coach.`,
          issueDate: data.issueDate,
          leftSignatureName: data.signatureName,
          leftSignatureTitle: data.signatureRole,
          rightSignatureName: 'Director General',
          rightSignatureTitle: 'REB QUALITY ASSURANCE',
          issuerWebsite: 'https://teacherlessonplans.ai.studio',
          status: 'Authentic',
          scannedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error generating and registering certificate QR code:', err);
      }
    };
    updateQrCode();
  }, [data.verificationNumber, data.recipientName, data.awardTitle, data.schoolName, data.issueDate, data.signatureName, data.signatureRole]);

  const handleFieldChange = (field: keyof CertificateData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleCopyVerification = () => {
    navigator.clipboard.writeText(data.verificationNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleToggleLock = async () => {
    setIsProcessingToggle(true);
    try {
      const nextUnlocked = !isUnlocked;
      await toggleCertificateLockStatus(
        data.verificationNumber,
        nextUnlocked,
        auth.currentUser?.email || 'nkundimana123theogene@gmail.com',
        {
          verificationNo: data.verificationNumber,
          recipientName: data.recipientName,
          title: data.awardTitle,
          schoolName: data.schoolName,
          issueDate: data.issueDate
        }
      );
      setIsUnlocked(nextUnlocked);
    } catch (e) {
      console.error("Toggle error in studio:", e);
    } finally {
      setIsProcessingToggle(false);
    }
  };

  const handlePayUnlock = async () => {
    setIsProcessingToggle(true);
    try {
      await toggleCertificateLockStatus(
        data.verificationNumber,
        true,
        auth.currentUser?.email || 'user_paid',
        {
          verificationNo: data.verificationNumber,
          recipientName: data.recipientName,
          title: data.awardTitle,
          schoolName: data.schoolName,
          issueDate: data.issueDate
        }
      );
      setIsUnlocked(true);
      setShowPaymentModal(false);
    } catch (e) {
      console.error("Pay unlock error:", e);
    } finally {
      setIsProcessingToggle(false);
    }
  };

  // Export to PDF with premium certificate styling (mimicking the uploaded template)
  const handleExportPdf = async () => {
    if (!isUnlocked && !isAdmin) {
      setShowPaymentModal(true);
      return;
    }
    // 297mm x 210mm (A4 Landscape)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const width = 297;
    const height = 210;

    // 1. Solid Warm White Background (Cream Background)
    doc.setFillColor(254, 254, 252);
    doc.rect(0, 0, width, height, 'F');

    // 2. Draw Top-Left Dark Blue Corner Curves (Overlapping ellipses for 100% standard jsPDF API compatibility)
    // Outer wave gold backing
    (doc as any).setFillColor(218, 165, 32); // gold
    (doc as any).ellipse(0, 0, 98, 98, 'F');
    // Outer wave dark navy blue
    (doc as any).setFillColor(15, 32, 67); // dark navy
    (doc as any).ellipse(0, 0, 96, 96, 'F');

    // Inner wave gold backing
    (doc as any).setFillColor(218, 165, 32); // gold
    (doc as any).ellipse(0, 0, 48, 48, 'F');
    // Inner wave lighter blue
    (doc as any).setFillColor(22, 53, 110); // lighter blue
    (doc as any).ellipse(0, 0, 46, 46, 'F');

    // 3. Draw Bottom-Right Dark Blue Corner Curves (Overlapping ellipses)
    // Outer wave gold backing
    (doc as any).setFillColor(218, 165, 32); // gold
    (doc as any).ellipse(width, height, 98, 98, 'F');
    // Outer wave dark navy blue
    (doc as any).setFillColor(15, 32, 67); // dark navy
    (doc as any).ellipse(width, height, 96, 96, 'F');

    // Inner wave gold backing
    (doc as any).setFillColor(218, 165, 32); // gold
    (doc as any).ellipse(width, height, 48, 48, 'F');
    // Inner wave lighter blue
    (doc as any).setFillColor(22, 53, 110); // lighter blue
    (doc as any).ellipse(width, height, 46, 46, 'F');

    // 4. Double Gold Outer Border Framing
    doc.setDrawColor(218, 165, 32); // gold
    doc.setLineWidth(0.8);
    doc.rect(12, 12, width - 24, height - 24); // outer gold
    doc.setLineWidth(0.3);
    doc.rect(14, 14, width - 28, height - 28); // inner gold

    // 5. Text - Titles & Headers
    doc.setFont('times', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(15, 32, 67); // dark navy
    doc.text('CERTIFICATE', width / 2, 42, { align: 'center' });

    doc.setFont('times', 'bolditalic');
    doc.setFontSize(14);
    doc.setTextColor(218, 165, 32); // gold
    doc.text(`OF APPRECIATION: ${data.awardTitle.toUpperCase()}`, width / 2, 52, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('THIS CERTIFICATE IS OFFICIALLY AWARDED TO', width / 2, 68, { align: 'center' });

    // Recipient Name (Beautiful cursive/elegant font in Times Bold)
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(24);
    doc.setTextColor(190, 140, 20); // Deep gold
    doc.text(data.recipientName, width / 2, 85, { align: 'center' });

    // Underline below name
    doc.setDrawColor(203, 213, 225); // slate-200
    doc.setLineWidth(0.5);
    doc.line(width / 2 - 60, 90, width / 2 + 60, 90);

    // Appreciation Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105); // slate-600
    const descText = [
      `In recognition of outstanding dedication, valuable contributions, and unwavering commitment as a Special Coach`,
      `at ${data.schoolName}. Your professional efforts have made a lasting impact in pedagogical mentoring`,
      `and your stellar work is truly appreciated.`
    ];
    doc.text(descText[0], width / 2, 105, { align: 'center' });
    doc.text(descText[1], width / 2, 111, { align: 'center' });
    doc.text(descText[2], width / 2, 117, { align: 'center' });

    // 6. Signatures and Date block
    doc.setDrawColor(148, 163, 184); // slate-400
    doc.setLineWidth(0.3);

    // Date line & text
    doc.line(40, 155, 100, 155);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Date: ${data.issueDate}`, 40, 161);

    // Signature line & text
    doc.line(width - 100, 155, width - 40, 155);
    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(15, 32, 67);
    doc.text(data.signatureName, width - 100, 151); // handwritten-like name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(data.signatureRole, width - 100, 161);

    // 7. Golden Badge Emblem in Bottom Center
    const centerX = width / 2;
    const centerY = 152;

    // Draw outer gold rosette circle
    doc.setFillColor(218, 165, 32); // gold
    doc.circle(centerX, centerY, 10.5, 'F');

    // Draw center gold circle
    doc.setFillColor(234, 179, 8); // lighter gold
    doc.circle(centerX, centerY, 7.5, 'F');

    // Inner gold border
    doc.setDrawColor(254, 240, 138); // yellow-100
    doc.setLineWidth(0.5);
    doc.circle(centerX, centerY, 6, 'S');

    // Draw Ribbon tails under the badge using standard triangles
    (doc as any).setFillColor(202, 138, 4); // gold-600
    // Left ribbon tail triangle
    (doc as any).triangle(centerX - 4, centerY + 8, centerX - 8, centerY + 22, centerX - 1, centerY + 20, 'F');
    // Right ribbon tail triangle
    (doc as any).triangle(centerX + 4, centerY + 8, centerX + 1, centerY + 20, centerX + 8, centerY + 22, 'F');

    // 8. QR CODE (Bottom Right corner, high contrast, clean margin for immediate mobile scan)
    if (qrCodeUrl) {
      doc.setFillColor(255, 255, 255);
      doc.rect(width - 44, height - 44, 26, 30, 'F');
      doc.addImage(qrCodeUrl, 'PNG', width - 42, height - 42, 22, 22);
      
      // QR verification text below it
      doc.setFont('courier', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(15, 32, 67);
      doc.text(data.verificationNumber, width - 31, height - 17, { align: 'center' });
    }

    // 9. VERIFICATION NUMBER (Top Right of Certificate, or Bottom Left as metadata)
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`VERIFICATION ID: ${data.verificationNumber}`, 20, 20);

    // Save PDF
    const safeName = data.recipientName.replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`Special_Coach_Certificate_${safeName}.pdf`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-slate-100 animate-fade-in">
      
      {/* LEFT COLUMN: EDIT FORM */}
      <div className="lg:col-span-4 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
        <div>
          <h3 className="font-black text-sm text-white flex items-center gap-2">
            <Edit className="w-4 h-4 text-cyan-400" />
            <span>Customize Certificate</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Edit the details below to instantly update the Special Coach Certificate.
          </p>
        </div>

        <div className="space-y-3.5">
          {/* Recipient Name */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Recipient Full Name (Teacher / Coach's Name)
            </label>
            <input
              type="text"
              value={data.recipientName}
              onChange={e => handleFieldChange('recipientName', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs focus:outline-none transition-all"
              placeholder="e.g. Phyllis Schwaiger"
            />
          </div>

          {/* Award Title */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Award Certificate Title
            </label>
            <input
              type="text"
              value={data.awardTitle}
              onChange={e => handleFieldChange('awardTitle', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs focus:outline-none transition-all"
              placeholder="e.g. Special Coach"
            />
          </div>

          {/* School Name */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              School Name (GS / School)
            </label>
            <input
              type="text"
              value={data.schoolName}
              onChange={e => handleFieldChange('schoolName', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs focus:outline-none transition-all"
              placeholder="e.g. GS Mayange B"
            />
          </div>

          {/* Issue Date */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Date of Issue
            </label>
            <input
              type="text"
              value={data.issueDate}
              onChange={e => handleFieldChange('issueDate', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs focus:outline-none transition-all"
            />
          </div>

          {/* Signatory Name */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Signatory Representative
            </label>
            <input
              type="text"
              value={data.signatureName}
              onChange={e => handleFieldChange('signatureName', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs focus:outline-none transition-all"
            />
          </div>

          {/* Signatory Role */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Signatory Designation
            </label>
            <input
              type="text"
              value={data.signatureRole}
              onChange={e => handleFieldChange('signatureRole', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs focus:outline-none transition-all"
            />
          </div>

          {/* Verification Code */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Verification Number
              </span>
              <button
                type="button"
                onClick={generateVerificationNumber}
                className="p-1 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40 rounded transition-all flex items-center gap-1 text-[10px]"
                title="Regenerate unique ID"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Regen</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-2 rounded-lg justify-between">
              <span className="font-mono text-xs text-slate-300 font-bold">{data.verificationNumber}</span>
              <button
                type="button"
                onClick={handleCopyVerification}
                className="text-[9px] bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white px-2 py-1 rounded transition-all"
              >
                {isCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Certificate Access / Lock Status Indicator */}
          <div className={`p-3 rounded-xl border transition-all ${
            isUnlocked 
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-950/30 border-rose-500/30 text-rose-400'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase">
                {isUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{isUnlocked ? 'Certificate Unlocked' : 'Certificate Locked'}</span>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-slate-900/60 border-slate-700 text-slate-300">
                {isUnlocked ? 'Active' : '2000 FRW'}
              </span>
            </div>

            {!isUnlocked && (
              <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">
                This certificate requires 2,000 FRW verification or Admin approval to download/print.
              </p>
            )}

            {/* Admin Toggle Control */}
            {isAdmin && (
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[9px] text-amber-300 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" /> Admin Switch
                </span>
                <button
                  type="button"
                  onClick={handleToggleLock}
                  disabled={isProcessingToggle}
                  className={`text-[9px] font-black px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    isUnlocked
                      ? 'bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border-rose-500/40'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400'
                  }`}
                >
                  {isProcessingToggle ? 'Updating...' : isUnlocked ? 'Lock (Prompt Pay)' : 'Unlock (Approve)'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PDF Download Button */}
        <button
          onClick={handleExportPdf}
          className={`w-full font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
            isUnlocked 
              ? 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 hover:shadow-cyan-500/20' 
              : 'bg-amber-600 hover:bg-amber-500 text-white hover:shadow-amber-500/20'
          }`}
        >
          {isUnlocked ? (
            <>
              <Download className="w-4 h-4 text-slate-950" />
              <span>DOWNLOAD SPECIAL COACH CERTIFICATE (PDF)</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-white" />
              <span>LOCKED - PAY 2,000 FRW TO DOWNLOAD PDF</span>
            </>
          )}
        </button>
      </div>

      {/* RIGHT COLUMN: CERTIFICATE LIVE PREVIEW */}
      <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-white">Live Certificate Preview</h4>
            <p className="text-[11px] text-slate-400">
              Interactive high-fidelity simulation of the official physical award layout.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold">
              Official Template Applied
            </span>
          </div>
        </div>

        {/* CERTIFICATE PREVIEW CONTAINER */}
        <div className="relative w-full aspect-[4/3] max-w-2xl mx-auto bg-stone-50 border-[10px] border-amber-600/30 shadow-2xl rounded-lg overflow-hidden text-slate-900 p-8 select-none flex flex-col justify-between border-double">
          
          {/* Inner Golden Double Border */}
          <div className="absolute inset-2 border-2 border-amber-600/50 pointer-events-none rounded"></div>
          <div className="absolute inset-3 border border-amber-600/30 pointer-events-none rounded"></div>

          {/* TOP-LEFT NAVY & GOLD WAVE CORNER */}
          <div className="absolute top-0 left-0 w-36 h-36 overflow-hidden pointer-events-none">
            <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full text-slate-900 fill-current">
              <path d="M 0,0 L 100,0 C 60,45 0,75 0,0 Z" />
            </svg>
            <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full text-amber-500 stroke-current" style={{ fill: 'none', strokeWidth: 1.5 }}>
              <path d="M 0,68 C 55,39 92,0 92,0" />
            </svg>
            <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full text-slate-800 fill-current">
              <path d="M 0,0 L 50,0 C 25,25 0,45 0,0 Z" />
            </svg>
          </div>

          {/* BOTTOM-RIGHT NAVY & GOLD WAVE CORNER */}
          <div className="absolute bottom-0 right-0 w-36 h-36 overflow-hidden pointer-events-none rotate-180">
            <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full text-slate-900 fill-current">
              <path d="M 0,0 L 100,0 C 60,45 0,75 0,0 Z" />
            </svg>
            <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full text-amber-500 stroke-current" style={{ fill: 'none', strokeWidth: 1.5 }}>
              <path d="M 0,68 C 55,39 92,0 92,0" />
            </svg>
            <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full text-slate-800 fill-current">
              <path d="M 0,0 L 50,0 C 25,25 0,45 0,0 Z" />
            </svg>
          </div>

          {/* TOP HEADER */}
          <div className="text-center z-10 pt-4">
            <span className="font-mono text-[7px] text-slate-400 tracking-wider block mb-2">
              VERIFICATION ID: {data.verificationNumber}
            </span>
            <h2 className="font-serif font-extrabold text-2xl md:text-3xl text-slate-900 tracking-wide uppercase leading-none">
              Certificate
            </h2>
            <p className="font-serif italic text-xs md:text-sm text-amber-600 font-bold tracking-widest mt-1">
              OF APPRECIATION: {data.awardTitle.toUpperCase()}
            </p>
          </div>

          {/* RECIPIENT BLOCK */}
          <div className="text-center z-10 my-4">
            <p className="text-[9px] text-slate-400 tracking-widest uppercase font-semibold">
              This Certificate is proudly awarded to
            </p>
            <h1 className="font-serif italic font-black text-xl md:text-2xl text-amber-700 mt-2 px-10">
              {data.recipientName || 'Phyllis Schwaiger'}
            </h1>
            <div className="w-1/2 h-[1px] bg-slate-200 mx-auto mt-2"></div>
          </div>

          {/* STATEMENT OF APPRECIATION */}
          <div className="text-center z-10 px-8">
            <p className="text-[10px] md:text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              In recognition of outstanding dedication, valuable contributions, and unwavering commitment as a{' '}
              <span className="font-bold text-slate-900">{data.awardTitle}</span> at{' '}
              <span className="font-bold text-slate-900">{data.schoolName}</span>. Your professional efforts have made a
              lasting impact in pedagogical mentoring and your work is truly appreciated.
            </p>
          </div>

          {/* SIGNATURES & BADGES ROW */}
          <div className="grid grid-cols-3 items-end z-10 pt-4 px-6">
            
            {/* Left: Date */}
            <div className="text-left">
              <div className="border-b border-slate-300 w-24 mb-1"></div>
              <span className="text-[7px] text-slate-400 font-bold block uppercase">Date Issued</span>
              <span className="text-[9px] text-slate-800 font-bold">{data.issueDate}</span>
            </div>

            {/* Middle: Gold Rosette Seal */}
            <div className="flex flex-col items-center justify-center relative">
              <div className="w-12 h-12 flex items-center justify-center bg-amber-500 rounded-full shadow-lg relative border-2 border-amber-300">
                {/* Ribbon details */}
                <div className="absolute top-10 left-3 w-2 h-8 bg-amber-600 origin-top rotate-[15deg] rounded-b"></div>
                <div className="absolute top-10 right-3 w-2 h-8 bg-amber-600 origin-top -rotate-[15deg] rounded-b"></div>
                
                {/* Innermost circle */}
                <div className="w-8 h-8 rounded-full bg-yellow-400 border border-yellow-200 flex items-center justify-center">
                  <Award className="w-4 h-4 text-amber-800" />
                </div>
              </div>
            </div>

            {/* Right: Signature & QR Code Block */}
            <div className="flex flex-col items-end text-right gap-1">
              {/* Embedded QR code with crisp layout */}
              {qrCodeUrl && (
                <div className="bg-white p-1 rounded-md border border-slate-300 shadow-sm flex flex-col items-center gap-0.5">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    className="w-14 h-14 shrink-0 object-contain" 
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-mono text-[6.5px] text-slate-900 font-bold">{data.verificationNumber}</span>
                </div>
              )}
              
              <div className="w-24 border-b border-slate-300 mt-1"></div>
              <span className="text-[7px] text-slate-400 font-bold block uppercase">Authorised Signature</span>
              <span className="text-[8px] text-slate-900 font-black italic">{data.signatureName}</span>
              <span className="text-[6px] text-slate-500 font-bold uppercase block">{data.signatureRole}</span>
            </div>

          </div>

        </div>

        {/* PRINT & VERIFICATION ACTIONS */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80 justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Encrypted with ISO-standard QR code for rapid camera scanning.</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`https://teacherlessonplans.ai.studio/verify?id=${encodeURIComponent(data.verificationNumber)}&ercipient=${encodeURIComponent(data.recipientName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer font-bold"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Test Verification Link</span>
            </a>
            <button
              onClick={() => {
                if (!isUnlocked && !isAdmin) {
                  setShowPaymentModal(true);
                  return;
                }
                window.print();
              }}
              className="px-4 py-1.5 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Layout</span>
            </button>
          </div>
        </div>

      </div>

      {/* PAYMENT PROMPT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Certificate Locked</h3>
                <p className="text-xs text-slate-400">Payment Verification Required (2,000 FRW)</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Certificate <span className="font-mono text-amber-300 font-bold">{data.verificationNumber}</span> is currently locked. To enable downloading and high-resolution printing, complete the 2,000 FRW payment or request approval from your administrator.
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
              <div className="font-bold text-white flex items-center justify-between">
                <span>Payment Details:</span>
                <span className="text-amber-400 font-mono">2,000 FRW</span>
              </div>
              <div className="text-[11px] text-slate-400">• MTN MoMo: <strong>0781339530</strong> / Airtel Money: <strong>0724038043</strong> (Nkundimana Theogene)</div>
              <div className="text-[11px] text-slate-400">• Reference / Reason: <strong className="font-mono text-amber-300">{data.verificationNumber}</strong></div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePayUnlock}
                disabled={isProcessingToggle}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isProcessingToggle ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Pay 2,000 FRW & Unlock</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
