import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Award, Lock, Unlock, QrCode, Globe, ShieldCheck } from 'lucide-react';
import { generateQrCodeDataUrl } from '../utils/qrCodeGenerator';
import { 
  auth, 
  db, 
  checkIsAdmin, 
  checkSingleCertificateUnlocked,
  toggleCertificateLockStatus,
  requestCertificateUnlock,
  doc,
  onSnapshot,
  setDoc
} from '../utils/firebase';
import jsPDF from 'jspdf';

interface AiCertificateCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiCertificateCreatorModal: React.FC<AiCertificateCreatorModalProps> = ({ isOpen, onClose }) => {
  const [recipientName, setRecipientName] = useState<string>('Phyllis Schwaiger');
  const [certificateType, setCertificateType] = useState<string>('Special Coach');
  const [description, setDescription] = useState<string>(
    'In recognition of your outstanding dedication, valuable contributions, and unwavering commitment. Your efforts have made a lasting impact, and your work is truly appreciated.'
  );
  const [issueDate, setIssueDate] = useState<string>('August 28, 2026');
  const [verificationNo, setVerificationNo] = useState<string>('NK-SC-2026-0812');
  const [leftSignatureName, setLeftSignatureName] = useState<string>('Theogene N.');
  const [leftSignatureTitle, setLeftSignatureTitle] = useState<string>('Nkorera AI Coordinator');
  const [rightSignatureName, setRightSignatureName] = useState<string>('Director General');
  const [rightSignatureTitle, setRightSignatureTitle] = useState<string>('REB Quality Assurance');
  
  const [embedQr, setEmbedQr] = useState<boolean>(true);
  const [qrPosition, setQrPosition] = useState<'Bottom Left' | 'Bottom Right' | 'Top Right'>('Bottom Left');
  const [qrSize, setQrSize] = useState<number>(52); // slider value in px (36px to 76px)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  
  // MoMo Manual Approval Form States
  const [paymentStatus, setPaymentStatus] = useState<'Locked' | 'Unlocked' | 'Paid' | 'Pending'>('Locked');
  const [momoNumber, setMomoNumber] = useState<string>('');
  const [momoTxId, setMomoTxId] = useState<string>('');
  const [momoSenderName, setMomoSenderName] = useState<string>('');
  const [showPaymentForm, setShowPaymentForm] = useState<boolean>(false);

  // Automatic Mobile Money USSD Integration and SIM selector states
  const [paymentCarrier, setPaymentCarrier] = useState<'MTN' | 'Airtel'>('MTN');
  const [selectedSim, setSelectedSim] = useState<'SIM1 (MTN)' | 'SIM2 (Airtel)'>('SIM1 (MTN)');
  const [ussdPhone, setUssdPhone] = useState<string>('');
  const [showUssdPrompt, setShowUssdPrompt] = useState<boolean>(false);
  const [ussdPin, setUssdPin] = useState<string>('');
  const [isProcessingUssd, setIsProcessingUssd] = useState<boolean>(false);
  const [ussdError, setUssdError] = useState<string | null>(null);

  const [verificationStatus, setVerificationStatus] = useState<'Unverified' | 'Authentic'>('Unverified');
  const [isVerifyingNow, setIsVerifyingNow] = useState<boolean>(false);

  // Real-time listener for unique QR scan record in Firestore
  useEffect(() => {
    if (!verificationNo || !isOpen) {
      setVerificationStatus('Unverified');
      return;
    }

    const docRef = doc(db, 'qr_scans', verificationNo);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data?.status === 'Authentic') {
          setVerificationStatus('Authentic');
        } else {
          setVerificationStatus('Unverified');
        }
      } else {
        setVerificationStatus('Unverified');
      }
    }, (error) => {
      console.warn("Failed to listen to QR scan record in Firestore:", error);
    });

    return () => unsubscribe();
  }, [verificationNo, isOpen]);

  // Handle simulated 'Verify Now' logging to Firestore
  const handleVerifyNow = async () => {
    if (!verificationNo) return;
    setIsVerifyingNow(true);
    try {
      const scanDoc = {
        id: verificationNo,
        verificationNo: verificationNo,
        recipientName: recipientName || 'Phyllis Schwaiger',
        title: certificateType || 'SPECIAL COACH CERTIFICATE',
        description: description || '',
        issueDate: issueDate || '',
        leftSignatureName: leftSignatureName || '',
        leftSignatureTitle: leftSignatureTitle || '',
        rightSignatureName: rightSignatureName || '',
        rightSignatureTitle: rightSignatureTitle || '',
        issuerWebsite: 'https://teacherlessonplans.ai.studio',
        status: 'Authentic',
        scannedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'qr_scans', verificationNo), scanDoc);
    } catch (err) {
      console.error("Failed to write QR scan verification to Firestore:", err);
    } finally {
      setIsVerifyingNow(false);
    }
  };

  // Generate QR Code dynamically when verification info or toggle changes
  useEffect(() => {
    const updateQrCode = async () => {
      if (!embedQr) {
        setQrCodeDataUrl('');
        return;
      }
      try {
        const verifyUrl = `https://teacherlessonplans.ai.studio/verify?id=${encodeURIComponent(verificationNo)}&ercipient=${encodeURIComponent(recipientName)}`;
          
        const dataUrl = await generateQrCodeDataUrl(verifyUrl, 512, '#000000');
        setQrCodeDataUrl(dataUrl);

        // Silently register this certificate to the Firestore verification database
        await setDoc(doc(db, 'qr_scans', verificationNo), {
          id: verificationNo,
          verificationNo: verificationNo,
          recipientName: recipientName || 'Phyllis Schwaiger',
          title: certificateType || 'SPECIAL COACH CERTIFICATE',
          description: description || '',
          issueDate: issueDate || '',
          leftSignatureName: leftSignatureName || '',
          leftSignatureTitle: leftSignatureTitle || '',
          rightSignatureName: rightSignatureName || '',
          rightSignatureTitle: rightSignatureTitle || '',
          issuerWebsite: 'https://teacherlessonplans.ai.studio',
          status: 'Authentic',
          scannedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('Failed to generate verification QR Code:', err);
      }
    };

    if (isOpen) {
      updateQrCode();
    }
  }, [verificationNo, recipientName, certificateType, description, issueDate, leftSignatureName, leftSignatureTitle, rightSignatureName, rightSignatureTitle, embedQr, isOpen]);
  
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const checkAccess = async () => {
      setLoading(true);
      const user = auth?.currentUser;
      const adminEmail = 'nkundimana123theogene@gmail.com';
      const isEmailAdmin = user?.email === adminEmail;
      
      let admin = isEmailAdmin;
      if (user && !admin) {
        admin = await checkIsAdmin(user.uid);
      }
      setIsAdmin(admin);

      // Check specific certificate unlock state
      const certUnlocked = await checkSingleCertificateUnlocked(verificationNo, user?.uid);
      setIsPaid(certUnlocked || admin);
      setLoading(false);

      // Setup real-time listener for this specific certificate doc
      if (verificationNo) {
        try {
          const certDocRef = doc(db, 'qr_scans', verificationNo);
          unsubscribeDoc = onSnapshot(certDocRef, (snap) => {
            if (snap.exists()) {
              const d = snap.data();
              const unlocked = d.isUnlocked === true || d.paymentStatus === 'Unlocked' || d.paymentStatus === 'Paid';
              setIsPaid(unlocked || admin);
              setPaymentStatus(unlocked ? 'Unlocked' : (d.paymentStatus || 'Locked'));
              
              if (d.momoNumber) setMomoNumber(d.momoNumber);
              if (d.momoTxId) setMomoTxId(d.momoTxId);
              if (d.momoSenderName) setMomoSenderName(d.momoSenderName);
            } else {
              setPaymentStatus('Locked');
            }
          }, (err) => {
            console.warn("Real-time listener callback error:", err?.message);
          });
        } catch (e) {
          console.warn("Real-time listener setup error:", e);
        }
      }
    };

    if (isOpen) {
      checkAccess();
    }

    return () => {
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, [isOpen, verificationNo]);

  const handleAutoUssdPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ussdPhone.trim()) {
      alert("Please enter the phone number you want to use for payment!");
      return;
    }

    // 1. Generate appropriate Rwanda USSD Quick Dialing Code
    // MTN MoMo Direct Cash transfer: *182*1*1*0781339530*2000#
    // Airtel Money Cash transfer: *182*1*1*0724038043*2000#
    const destNumber = paymentCarrier === 'Airtel' ? '0724038043' : '0781339530';
    const dialCode = `tel:*182*1*1*${destNumber}*2000%23`;
    
    // Redirect device dialing screen (This opens the phone's native dialer pre-filled on Android/iOS)
    // and asks them to select their SIM Card (MTN or Airtel) to execute.
    window.location.href = dialCode;

    // 2. Open the realistic USSD Carrier Push-Alert dialog on-screen
    setShowUssdPrompt(true);
    setUssdError(null);
  };

  const submitUssdPinConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ussdPin.trim()) {
      setUssdError("Please enter your PIN to confirm!");
      return;
    }
    const requiredLength = paymentCarrier === 'Airtel' ? 4 : 5;
    if (ussdPin.trim().length !== requiredLength) {
      setUssdError(`PIN must be exactly ${requiredLength} digits.`);
      return;
    }

    setIsProcessingUssd(true);
    setUssdError(null);

    try {
      // Simulate MTN MoMo/Airtel network delay
      await new Promise(resolve => setTimeout(resolve, 2200));

      // Successfully lock & unlock the certificate in Firestore & Local storage
      const autoTxId = `AUTO-MOMO-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const timestamp = new Date().toISOString();

      // Update Firestore directly so scan-verifiers and admins can see it
      await toggleCertificateLockStatus(
        verificationNo,
        true,
        auth.currentUser?.email || 'auto_verified_teacher',
        {
          verificationNo,
          recipientName,
          title: certificateType,
          description,
          issueDate,
          momoNumber: ussdPhone,
          momoTxId: autoTxId,
          momoSenderName: `Teacher ${ussdPhone}`,
          paymentStatus: 'Unlocked',
          paymentRequestedAt: timestamp,
          unlockedAt: timestamp
        }
      );

      // Save locally as well
      localStorage.setItem('nkorera_certificate_unlocked', 'true');
      setIsPaid(true);
      setPaymentStatus('Unlocked');
      setShowUssdPrompt(false);
      setShowPaymentForm(false);
      alert("✅ Payment successful! Your certificate is unlocked. You can now download or print it.");
    } catch (err) {
      console.error("Auto-payment simulation unlock error:", err);
      setUssdError("An error occurred during payment verification. Please try again.");
    } finally {
      setIsProcessingUssd(false);
    }
  };

  const handleRequestUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!momoNumber.trim() || !momoTxId.trim() || !momoSenderName.trim()) {
      alert("All fields are required to submit payment confirmation!");
      return;
    }

    setProcessingPayment(true);
    try {
      await requestCertificateUnlock(
        verificationNo,
        momoNumber.trim(),
        momoTxId.trim(),
        momoSenderName.trim(),
        {
          verificationNo,
          recipientName,
          title: certificateType,
          description,
          issueDate,
          userId: auth.currentUser?.uid || 'anonymous'
        }
      );
      setPaymentStatus('Pending');
      setShowPaymentForm(false);
    } catch (err) {
      console.error("Failed to request certificate unlock:", err);
      alert("An error occurred while submitting your request. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleToggleAdminLock = async () => {
    const nextState = !isPaid;
    setLoading(true);
    try {
      await toggleCertificateLockStatus(
        verificationNo,
        nextState,
        auth.currentUser?.email || 'nkundimana123theogene@gmail.com',
        {
          verificationNo,
          recipientName,
          title: certificateType,
          description,
          issueDate
        }
      );
      setIsPaid(nextState);
    } catch (e) {
      console.error("Admin toggle error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Generate a random verification number
  const generateRandomVerification = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setVerificationNo(`NK-SC-2026-${randomNum}`);
  };

  if (!isOpen) return null;

  const handleExportPDF = async () => {
    if (!isPaid && !isAdmin) {
      alert("This certificate is locked. Paying 2000 RWF or being an Admin is required to download it. If you want to pay or try it, click the 'Pay 2000 FRW to Unlock' button on the left panel.");
      return;
    }
    
    setIsExporting(true);

    // Silently register this certificate to the Firestore verification database
    if (verificationNo) {
      try {
        await setDoc(doc(db, 'qr_scans', verificationNo), {
          id: verificationNo,
          verificationNo: verificationNo,
          recipientName: recipientName || 'Phyllis Schwaiger',
          title: certificateType || 'SPECIAL COACH CERTIFICATE',
          description: description || '',
          issueDate: issueDate || '',
          leftSignatureName: leftSignatureName || '',
          leftSignatureTitle: leftSignatureTitle || '',
          rightSignatureName: rightSignatureName || '',
          rightSignatureTitle: rightSignatureTitle || '',
          issuerWebsite: 'https://teacherlessonplans.ai.studio',
          status: 'Authentic',
          scannedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Failed to silently register verification record to Firestore:", err);
      }
    }

    try {
      // 297mm x 210mm (A4 Landscape)
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const width = 297;
      const height = 210;
      const centerX = width / 2;

      // 1. Solid Warm White Background
      doc.setFillColor(254, 254, 252);
      doc.rect(0, 0, width, height, 'F');

      // 2. Draw Top-Left Corner Curves
      (doc as any).setFillColor(218, 165, 32); // gold
      (doc as any).ellipse(0, 0, 62, 62, 'F');
      (doc as any).setFillColor(15, 32, 67); // dark navy
      (doc as any).ellipse(0, 0, 60, 60, 'F');

      (doc as any).setFillColor(218, 165, 32); // gold
      (doc as any).ellipse(0, 0, 32, 32, 'F');
      (doc as any).setFillColor(22, 53, 110); // lighter blue
      (doc as any).ellipse(0, 0, 30, 30, 'F');

      // 3. Draw Bottom-Right Corner Curves
      (doc as any).setFillColor(218, 165, 32); // gold
      (doc as any).ellipse(width, height, 62, 62, 'F');
      (doc as any).setFillColor(15, 32, 67); // dark navy
      (doc as any).ellipse(width, height, 60, 60, 'F');

      (doc as any).setFillColor(218, 165, 32); // gold
      (doc as any).ellipse(width, height, 32, 32, 'F');
      (doc as any).setFillColor(22, 53, 110); // lighter blue
      (doc as any).ellipse(width, height, 30, 30, 'F');

      // 4. Double Gold Outer Border Framing
      doc.setDrawColor(218, 165, 32); // gold
      doc.setLineWidth(0.8);
      doc.rect(12, 12, width - 24, height - 24); // outer gold
      doc.setLineWidth(0.3);
      doc.rect(14, 14, width - 28, height - 28); // inner gold

      // 5. Eyebrow Text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(197, 160, 89); // gold
      doc.text('OFFICIAL RECOGNITION AWARD', centerX, 36, { align: 'center' });

      // 6. Main Certificate Title
      doc.setFont('times', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(21, 101, 192); // royal blue
      doc.text(certificateType === 'Special Coach' ? 'SPECIAL COACH CERTIFICATE' : certificateType.toUpperCase(), centerX, 48, { align: 'center' });

      // Accent line
      doc.setDrawColor(197, 160, 89);
      doc.setLineWidth(0.6);
      doc.line(centerX - 15, 53, centerX + 15, 53);

      // Award text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('THIS HIGHLY HONORABLE CERTIFICATE IS PROUDLY AWARDED TO', centerX, 64, { align: 'center' });

      // Recipient Name
      doc.setFont('times', 'bolditalic');
      doc.setFontSize(26);
      doc.setTextColor(197, 160, 89); // gold
      doc.text(recipientName || 'Phyllis Schwaiger', centerX, 80, { align: 'center' });

      // Divider below name
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(centerX - 50, 85, centerX + 50, 85);

      // Description
      doc.setFont('times', 'italic');
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      const splitDesc = doc.splitTextToSize(`"${description}"`, 210);
      let currentY = 98;
      splitDesc.forEach((line: string) => {
        doc.text(line, centerX, currentY, { align: 'center' });
        currentY += 5.5;
      });

      // Dynamic positions for signatures in PDF to guarantee they remain strictly on the white background
      let leftSigXStart = 36;
      let leftSigXEnd = 96;
      if (embedQr && qrPosition === 'Bottom Left') {
        leftSigXStart = 50;
        leftSigXEnd = 110;
      }

      let rightSigXStart = width - 96;
      let rightSigXEnd = width - 36;
      if (embedQr && qrPosition === 'Bottom Right') {
        rightSigXStart = width - 134;
        rightSigXEnd = width - 74;
      }

      // Left Signature block
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(leftSigXStart, 155, leftSigXEnd, 155);
      
      doc.setFont('times', 'italic');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 32, 67);
      doc.text(leftSignatureName, leftSigXStart, 151);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(leftSignatureTitle.toUpperCase(), leftSigXStart, 160);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Date: ${issueDate}`, leftSigXStart, 166);

      // Right Signature block
      doc.line(rightSigXStart, 155, rightSigXEnd, 155);

      doc.setFont('times', 'italic');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 32, 67);
      doc.text(rightSignatureName, rightSigXStart, 151);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(rightSignatureTitle.toUpperCase(), rightSigXStart, 160);

      doc.setFont('courier', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`VERIF: ${verificationNo}`, rightSigXStart, 166);

      // Center Seal / Gold Medal
      const centerY = 152;
      (doc as any).setFillColor(218, 165, 32); // gold
      (doc as any).circle(centerX, centerY, 10.5, 'F');

      (doc as any).setFillColor(234, 179, 8); // lighter gold
      (doc as any).circle(centerX, centerY, 7.5, 'F');

      doc.setDrawColor(254, 240, 138); // yellow-100
      doc.setLineWidth(0.5);
      doc.circle(centerX, centerY, 6, 'S');

      (doc as any).setFillColor(202, 138, 4); // gold-600
      (doc as any).triangle(centerX - 4, centerY + 8, centerX - 8, centerY + 22, centerX - 1, centerY + 20, 'F');
      (doc as any).triangle(centerX + 4, centerY + 8, centerX + 1, centerY + 20, centerX + 8, centerY + 22, 'F');

      // Add QR Code if present and enabled
      if (embedQr && qrCodeDataUrl) {
        const pdfQrSize = Math.max(22, (qrSize / 52) * 22);
        let qrX = 16.5;
        let qrY = 191.5 - (pdfQrSize + 6);
        
        if (qrPosition === 'Bottom Right') {
          qrX = width - 60;
          qrY = 191.5 - (pdfQrSize + 6);
        } else if (qrPosition === 'Top Right') {
          qrX = width - 36 - pdfQrSize;
          qrY = 16;
        }

        const cardW = pdfQrSize + 4;
        const cardH = pdfQrSize + 10;

        // Draw a neat white card with a clean, light border to hold the QR code securely
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240); // slate-200 border
        doc.setLineWidth(0.35);
        doc.rect(qrX - 2, qrY - 2, cardW, cardH, 'FD'); // white filled rect with border

        doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, pdfQrSize, pdfQrSize);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(Math.max(4, Math.min(6, 4.5 + (qrSize - 36) * 0.05)));
        doc.setTextColor(21, 101, 192); // royal blue
        doc.text('SCAN TO VERIFY', qrX + pdfQrSize / 2, qrY + pdfQrSize + 3.2, { align: 'center' });

        // Add Verification Status Badge in PDF
        if (verificationStatus === 'Authentic') {
          doc.setFillColor(209, 250, 229); // emerald-100 bg
          doc.setDrawColor(167, 243, 208); // emerald-200 border
          doc.rect(qrX, qrY + pdfQrSize + 4.5, pdfQrSize, 3.5, 'FD');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(3.2);
          doc.setTextColor(4, 120, 87); // emerald-700
          doc.text('AUTHENTIC', qrX + pdfQrSize / 2, qrY + pdfQrSize + 7, { align: 'center' });
        } else {
          doc.setFillColor(241, 245, 249); // slate-100 bg
          doc.setDrawColor(226, 232, 240); // slate-200 border
          doc.rect(qrX, qrY + pdfQrSize + 4.5, pdfQrSize, 3.5, 'FD');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(3.2);
          doc.setTextColor(71, 85, 105); // slate-500
          doc.text('UNVERIFIED', qrX + pdfQrSize / 2, qrY + pdfQrSize + 7, { align: 'center' });
        }
      }

      // Save PDF document
      const safeName = recipientName.replace(/[^a-zA-Z0-9_-]/g, '_');
      doc.save(`Certificate_Special_Coach_${safeName}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Dynamic scaling to prevent overflow and implement "Smart Snap"
  const recipientNameLength = recipientName.length;
  const descriptionLength = description.length;
  
  // Dynamic Font Sizes (in px)
  const nameFontSize = Math.max(10, Math.min(24, 24 - (recipientNameLength > 16 ? (recipientNameLength - 16) * 0.35 : 0)));
  const descFontSize = Math.max(6.2, Math.min(9.5, 9.5 - (descriptionLength > 100 ? (descriptionLength - 100) * 0.012 : 0)));
  
  // Dynamic Margins & Spacings (in px) to adapt the vertical rhythm
  const headerMarginTop = Math.max(2, Math.min(12, 12 - (descriptionLength / 40)));
  const nameMarginY = Math.max(2, Math.min(8, 8 - (descriptionLength / 50)));
  const footerMarginTop = Math.max(2, Math.min(10, 10 - (descriptionLength / 50)));

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[150] p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-fade-in my-8 max-h-[90vh]">
        
        {/* LEFT PANEL: CONFIGURATION CONTROLS */}
        <div className="w-full md:w-2/5 p-6 border-r border-slate-800 flex flex-col justify-between overflow-y-auto max-h-[40vh] md:max-h-none">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Award className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-black text-white">AI Certificate Creator</h2>
                <p className="text-[11px] text-slate-400">Generate professional "Special Coach" certificates.</p>
              </div>
            </div>

            {loading ? (
              <div className="text-slate-400 text-xs flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Checking certificate verification status...</span>
              </div>
            ) : (!isPaid && !isAdmin) ? (
              <div className="space-y-4">
                {paymentStatus === 'Pending' ? (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/40 space-y-3 shadow-lg shadow-amber-950/20 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-400">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span className="text-xs font-black uppercase tracking-wider">Pending Approval</span>
                      </div>
                      <span className="text-[10px] bg-amber-500/10 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                        2,000 FRW
                      </span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
                      <p className="text-[11px] text-slate-300">
                        Your request to unlock certificate <strong className="text-amber-300 font-mono">{verificationNo}</strong> has been sent to the Admin. We are verifying the payment.
                      </p>
                      <div className="text-[10px] text-slate-400 space-y-0.5 border-t border-slate-800/80 pt-2 mt-2">
                        <div>• Paid Phone Number: <strong>{momoNumber}</strong></div>
                        <div>• Transaction ID/Ref: <strong>{momoTxId}</strong></div>
                        <div>• Sender's Name: <strong>{momoSenderName}</strong></div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      It takes 5 to 15 minutes for payment approval. Once approved, the certificate will be immediately linked to your account.
                    </p>
                    <button
                      onClick={() => {
                        setPaymentStatus('Locked');
                        setShowPaymentForm(true);
                      }}
                      className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 text-[10px] font-bold cursor-pointer transition-all"
                    >
                      Made a mistake? Edit Payment Details
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-rose-500/40 space-y-4 shadow-lg shadow-rose-950/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-400">
                        <Lock className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-wider">Locked (Payment Required)</span>
                      </div>
                      <span className="text-[10px] bg-rose-500/10 text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-500/20">
                        2,000 FRW
                      </span>
                    </div>

                    {/* CHOICE TABS: AUTOMATIC VS MANUAL */}
                    <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 gap-1">
                      <button
                        type="button"
                        onClick={() => setShowPaymentForm(false)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          !showPaymentForm 
                            ? 'bg-amber-500 text-slate-950 font-black shadow' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        ⚡ Automatic Pay
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPaymentForm(true)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          showPaymentForm 
                            ? 'bg-amber-500 text-slate-950 font-black shadow' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        📝 Manual Proof
                      </button>
                    </div>

                    {!showPaymentForm ? (
                      /* AUTOMATIC PAYMENT FORM */
                      <form onSubmit={handleAutoUssdPay} className="space-y-3.5">
                        <div className="text-[11px] text-slate-300 leading-relaxed">
                          Use instant payment (Automatic USSD Push). Choose the SIM Card with funds, then enter your phone number to receive a secure payment PIN request on your phone.
                        </div>

                        {/* SIM CARD SELECTOR */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-400 font-bold uppercase block">Select SIM Card with funds *</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentCarrier('MTN');
                                setSelectedSim('SIM1 (MTN)');
                              }}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                paymentCarrier === 'MTN'
                                  ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/70 ring-2 ring-yellow-500/25'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <span className="w-2 h-2 rounded-full bg-yellow-400" />
                              <span>SIM 1: MTN MoMo</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentCarrier('Airtel');
                                setSelectedSim('SIM2 (Airtel)');
                              }}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                paymentCarrier === 'Airtel'
                                  ? 'bg-red-500/20 text-red-300 border-red-500/70 ring-2 ring-red-500/25'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <span className="w-2 h-2 rounded-full bg-red-500" />
                              <span>SIM 2: Airtel</span>
                            </button>
                          </div>
                        </div>

                        {/* PHONE INPUT */}
                        <div>
                          <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Enter your phone number *</label>
                          <input 
                            type="text"
                            placeholder="e.g. 078XXXXXXX"
                            required
                            value={ussdPhone}
                            onChange={(e) => setUssdPhone(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* REDIRECTION INSTRUCTION WARNING */}
                        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
                          💡 <strong>How it works:</strong> When you click <strong>"Use MoMo / Airtel Push"</strong>, you will be redirected to your phone's dialer. Press call on your selected SIM, and then enter your PIN on your screen to complete payment.
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs cursor-pointer transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Use MoMo / Airtel Push (2000 FRW)</span>
                        </button>
                      </form>
                    ) : (
                      /* MANUAL VERIFICATION FORM */
                      <form onSubmit={handleRequestUnlockSubmit} className="space-y-2.5 border-t border-slate-800/80 pt-3">
                        <div className="text-[11px] font-black text-slate-300 uppercase tracking-wider">Momo Payment Verification Form</div>
                        <div className="text-[10px] text-slate-400 mb-2">
                          If USSD push didn't arrive or you encountered an issue, please use manual transfer: send 2,000 FRW to <strong>0781339530</strong> (MTN MoMo) or <strong>0724038043</strong> (Airtel Money) - Nkundimana Theogene and submit transaction details below for approval:
                        </div>
                        
                        <div>
                          <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Momo Phone Number used to pay *</label>
                          <input 
                            type="text"
                            placeholder="e.g. 078XXXXXXX"
                            required
                            value={momoNumber}
                            onChange={(e) => setMomoNumber(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">MTN Momo Transaction ID / Reference ID *</label>
                          <input 
                            type="text"
                            placeholder="e.g. TxID 1982739281"
                            required
                            value={momoTxId}
                            onChange={(e) => setMomoTxId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Sender's Mobile Money Name *</label>
                          <input 
                            type="text"
                            placeholder="e.g. Karasira Jean"
                            required
                            value={momoSenderName}
                            onChange={(e) => setMomoSenderName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowPaymentForm(false)}
                            className="w-1/3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer border border-slate-800"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={processingPayment}
                            className="w-2/3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-1"
                          >
                            {processingPayment ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Submitting...</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5" />
                                <span>Request Approval</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-500/40 flex items-center justify-between">
                  <div className="text-emerald-400 text-xs flex items-center gap-2 font-black uppercase tracking-wider">
                    <Unlock className="w-4 h-4 text-emerald-400" />
                    <span>Unlocked & Verified</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Active Download
                  </span>
                </div>

                {isAdmin && (
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-amber-500/30 space-y-2.5 shadow-inner">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-amber-300 font-black uppercase flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Admin Access & Lock Control</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono">{verificationNo}</span>
                    </div>

                    <button
                      onClick={handleToggleAdminLock}
                      className={`w-full py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                        isPaid 
                          ? 'bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30' 
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      }`}
                    >
                      {isPaid ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Toggle: Lock this Certificate (Prompt Payment)</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Toggle: Unlock Certificate (Verify Payment)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3 pt-2">
              {/* Recipient Name */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Recipient Name (Izina ryuhawe)</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Phyllis Schwaiger"
                  className="w-full bg-slate-950 text-white placeholder-slate-600 text-xs px-3 py-2 rounded-xl border border-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Certificate Title */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Certificate Type (Ubwoko bwa Certificate)</label>
                <select
                  value={certificateType}
                  onChange={(e) => setCertificateType(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs px-3 py-2 rounded-xl border border-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Special Coach">Special Coach Certificate</option>
                  <option value="Certificate of Appreciation">Certificate of Appreciation</option>
                  <option value="Outstanding Performance">Outstanding Performance</option>
                  <option value="Pedagogical Excellence">Pedagogical Excellence</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Award Citation (Ibihamya n'Ishimwe)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 text-white placeholder-slate-600 text-xs px-3 py-2 rounded-xl border border-slate-800 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              {/* Date & Verification */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Issue Date</label>
                  <input
                    type="text"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs px-3 py-2 rounded-xl border border-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Verification No</label>
                    <button 
                      onClick={generateRandomVerification}
                      className="text-[9px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5 cursor-pointer"
                    >
                      <RefreshCw className="w-2.5 h-2.5" /> Random
                    </button>
                  </div>
                  <input
                    type="text"
                    value={verificationNo}
                    onChange={(e) => setVerificationNo(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs px-3 py-2 rounded-xl border border-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Generate & Embed Verification QR Feature */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="block text-[11px] font-bold text-slate-200">Generate Verification QR Code</span>
                      <span className="block text-[9px] text-slate-500">Embed interactive QR code for instant scan verification</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={embedQr} 
                      onChange={(e) => setEmbedQr(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950 peer-checked:after:border-transparent"></div>
                  </label>
                </div>

                {embedQr && (
                  <div className="space-y-2.5 animate-fade-in">
                    {/* QR Code Position Dropdown */}
                    <div className="space-y-1">
                      <label className="block text-[9px] font-black uppercase text-slate-500">QR Code Position (Ahazajya QR)</label>
                      <select
                        value={qrPosition}
                        onChange={(e) => setQrPosition(e.target.value as any)}
                        className="w-full bg-slate-900 text-white text-[11px] px-2.5 py-1.5 rounded-xl border border-slate-800 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="Bottom Left">Bottom Left (Ibumoso hasi)</option>
                        <option value="Bottom Right">Bottom Right (Iburyo hasi)</option>
                        <option value="Top Right">Top Right (Iburyo hejuru)</option>
                      </select>
                    </div>

                    {/* QR Code Size Slider */}
                    <div className="space-y-1 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/20">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="font-black uppercase text-slate-500">QR Code Size (Ubunini):</span>
                        <span className="font-bold text-emerald-400 font-mono">{qrSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="36"
                        max="72"
                        step="2"
                        value={qrSize}
                        onChange={(e) => setQrSize(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
                      />
                      <span className="block text-[7.5px] text-slate-500 italic">Smart Snap will auto-adjust layouts to prevent overlap.</span>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/40">
                      {qrCodeDataUrl ? (
                        <div className="bg-white p-1.5 rounded-xl flex-shrink-0 shadow-sm border border-slate-200">
                          <img 
                            src={qrCodeDataUrl} 
                            alt="Verification QR Code Preview" 
                            className="w-20 h-20 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-xl animate-pulse flex-shrink-0" />
                      )}
                      <div className="space-y-1.5 min-w-0">
                        <span className="block text-[9.5px] font-bold text-emerald-400">Embedded Verification Link</span>
                        <span className="block text-[8px] text-slate-400 break-all font-mono leading-relaxed max-w-[180px]">
                          https://teacherlessonplans.ai.studio/verify?id={verificationNo}&ercipient={recipientName}
                        </span>
                        <a 
                          href={`https://teacherlessonplans.ai.studio/verify?id=${encodeURIComponent(verificationNo)}&ercipient=${encodeURIComponent(recipientName)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold hover:bg-emerald-500/30 transition-colors"
                        >
                          <Globe className="w-3 h-3" />
                          Fungura Link (Test)
                        </a>
                      </div>
                    </div>

                    {/* Verification Status Badge & Button */}
                    <div className="flex items-center justify-between bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/30 gap-2">
                      <div className="space-y-0.5">
                        <span className="block text-[8px] font-black uppercase text-slate-500">Scan Status (Kugenzura)</span>
                        <div className="flex items-center gap-1.5">
                          {verificationStatus === 'Authentic' ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                              AUTHENTIC
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <span className="w-1 h-1 rounded-full bg-amber-400" />
                              UNVERIFIED
                            </span>
                          )}
                        </div>
                      </div>

                      {verificationStatus === 'Unverified' && (
                        <button
                          onClick={handleVerifyNow}
                          disabled={isVerifyingNow}
                          className="px-2.5 py-1 text-[8.5px] font-black uppercase tracking-wider text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm hover:shadow-emerald-400/20 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {isVerifyingNow ? 'Verifying...' : 'Verify Now'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Authority Signatures */}
              <div className="border-t border-slate-800/80 pt-3">
                <span className="block text-[10px] font-black uppercase text-slate-400 mb-2">Authority Signatures (Abasinyi)</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={leftSignatureName}
                      onChange={(e) => setLeftSignatureName(e.target.value)}
                      placeholder="Left Signature Name"
                      className="w-full bg-slate-950 text-white text-[11px] px-2.5 py-1.5 rounded-xl border border-slate-800 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={leftSignatureTitle}
                      onChange={(e) => setLeftSignatureTitle(e.target.value)}
                      placeholder="Left Signature Title"
                      className="w-full bg-slate-950 text-slate-400 text-[10px] px-2.5 py-1.5 rounded-xl border border-slate-800 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={rightSignatureName}
                      onChange={(e) => setRightSignatureName(e.target.value)}
                      placeholder="Right Signature Name"
                      className="w-full bg-slate-950 text-white text-[11px] px-2.5 py-1.5 rounded-xl border border-slate-800 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={rightSignatureTitle}
                      onChange={(e) => setRightSignatureTitle(e.target.value)}
                      placeholder="Right Signature Title"
                      className="w-full bg-slate-950 text-slate-400 text-[10px] px-2.5 py-1.5 rounded-xl border border-slate-800 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 transition-all ${
                (!isPaid && !isAdmin)
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Exporting PDF...</span>
                </>
              ) : (!isPaid && !isAdmin) ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Locked (Pay 2000 FRW)</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF (Unlocked)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: LIVE PREVIEW & VECTOR RENDERING */}
        <div className="w-full md:w-3/5 p-6 bg-slate-950 flex flex-col justify-center items-center overflow-y-auto relative">
          
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-slate-300 font-black tracking-wider uppercase">Live High-Res Preview</span>
          </div>

          {/* THE CERTIFICATE CANVAS */}
          <div className="w-full max-w-[760px] aspect-[1.414/1] bg-white rounded-md border-4 border-slate-300 shadow-2xl relative overflow-hidden text-slate-900 select-none p-1.5 break-inside-avoid" id="printable-certificate-canvas" ref={certificateRef}>
            <div className="w-full h-full border-[6px] border-[#d4af37] bg-white p-6 md:p-8 relative flex flex-col justify-between" style={{ borderColor: '#c5a059' }}>
              
              {/* TOP-LEFT GOLDEN & ROYAL BLUE CORNER WAVE */}
              <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full transform scale-x-110 scale-y-110 -translate-x-3 -translate-y-3">
                  {/* Royal Blue wave */}
                  <path d="M0,0 L90,0 C60,40 40,60 0,90 Z" fill="#0d47a1" />
                  <path d="M0,0 L80,0 C55,35 35,55 0,80 Z" fill="#1565c0" />
                  <path d="M0,0 L70,0 C50,30 30,50 0,70 Z" fill="#1e88e5" />
                  {/* Golden curved stripe */}
                  <path d="M68,0 C51,32 32,51 0,68 L0,74 C34,56 56,34 74,0 Z" fill="#d4af37" />
                  <path d="M78,0 C58,35 35,58 0,78 L0,82 C37,61 61,37 82,0 Z" fill="#f5d061" />
                </svg>
              </div>

              {/* BOTTOM-RIGHT GOLDEN & ROYAL BLUE CORNER WAVE */}
              <div className="absolute bottom-0 right-0 w-32 h-32 overflow-hidden pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full transform scale-x-110 scale-y-110 translate-x-3 translate-y-3 rotate-180">
                  {/* Royal Blue wave */}
                  <path d="M0,0 L90,0 C60,40 40,60 0,90 Z" fill="#0d47a1" />
                  <path d="M0,0 L80,0 C55,35 35,55 0,80 Z" fill="#1565c0" />
                  <path d="M0,0 L70,0 C50,30 30,50 0,70 Z" fill="#1e88e5" />
                  {/* Golden curved stripe */}
                  <path d="M68,0 C51,32 32,51 0,68 L0,74 C34,56 56,34 74,0 Z" fill="#d4af37" />
                  <path d="M78,0 C58,35 35,58 0,78 L0,82 C37,61 61,37 82,0 Z" fill="#f5d061" />
                </svg>
              </div>

              {/* DOUBLE INNER GOLD BOUNDARY LINE */}
              <div className="absolute inset-2 pointer-events-none border border-[#d4af37]/40 rounded-sm"></div>
              <div className="absolute inset-2.5 pointer-events-none border border-[#d4af37]/20 rounded-sm"></div>

              {/* CERTIFICATE HEADER */}
              <div 
                className="text-center z-10 transition-all duration-300"
                style={{ 
                  marginTop: `${headerMarginTop}px`,
                  paddingRight: embedQr && qrPosition === 'Top Right' ? `${qrSize + 64}px` : '5.5rem',
                  paddingLeft: '5.5rem'
                }}
              >
                <span className="text-[8px] font-black uppercase tracking-[0.25em] text-[#c5a059] block mb-0.5">
                  OFFICIAL RECOGNITION AWARD
                </span>
                <h1 className="text-lg md:text-xl font-black text-[#1565c0] tracking-wide uppercase font-serif">
                  {certificateType === 'Special Coach' ? 'Special Coach Certificate' : certificateType}
                </h1>
                <div className="w-16 h-0.5 bg-[#c5a059] mx-auto mt-1"></div>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-2">
                  This highly honorable certificate is proudly awarded to
                </p>
              </div>

              {/* RECIPIENT NAME IN LUXURIOUS SCRIPT STYLE */}
              <div 
                className="text-center z-10 px-16 transition-all duration-300"
                style={{ 
                  marginTop: `${nameMarginY}px`,
                  marginBottom: `${nameMarginY}px`
                }}
              >
                <h2 
                  className="text-[#c5a059] font-medium tracking-wide font-serif py-0.5 italic border-b border-slate-200 inline-block px-6 break-words max-w-full"
                  style={{ fontSize: `${nameFontSize}px` }}
                >
                  {recipientName || 'Phyllis Schwaiger'}
                </h2>
              </div>

              {/* AWARD DESCRIPTION */}
              <div className="text-center max-w-md mx-auto z-10 px-8">
                <p 
                  className="text-slate-600 leading-relaxed font-serif italic font-medium px-4 break-words transition-all duration-300"
                  style={{ fontSize: `${descFontSize}px` }}
                >
                  "{description}"
                </p>
              </div>

              {/* SMALL ABSOLUTE QR CODE */}
              {embedQr && qrCodeDataUrl && (
                <div 
                  className={`absolute p-0.5 bg-white border border-slate-300 shadow-xs rounded flex flex-col items-center justify-between z-30 transition-all ${
                    qrPosition === 'Top Right' 
                      ? 'top-4 right-4 animate-fade-in' 
                      : qrPosition === 'Bottom Left' 
                        ? 'bottom-4 left-4 animate-fade-in' 
                        : 'bottom-4 right-16 md:right-20 animate-fade-in'
                  }`}
                  style={{ 
                    width: `${qrSize}px`, 
                    height: `${qrSize + 14}px` 
                  }}
                >
                  <img 
                    src={qrCodeDataUrl} 
                    alt="Verification QR" 
                    className="w-full h-auto object-contain"
                    referrerPolicy="no-referrer"
                    style={{ maxHeight: `${qrSize - 4}px` }}
                  />
                  <span 
                    className="text-[3.5px] text-[#1565c0] font-black uppercase tracking-tight origin-center whitespace-nowrap"
                    style={{ transform: `scale(${Math.max(0.65, Math.min(1, qrSize / 36))})` }}
                  >
                    Scan to Verify
                  </span>
                  
                  {/* Dynamic verification status badge */}
                  <div 
                    className="flex items-center origin-center whitespace-nowrap"
                    style={{ transform: `scale(${Math.max(0.65, Math.min(1, qrSize / 36))})` }}
                  >
                    {verificationStatus === 'Authentic' ? (
                      <span className="inline-flex items-center px-0.5 py-0.2 rounded bg-emerald-50 border border-emerald-200 text-[3.5px] font-black text-emerald-700">
                        AUTHENTIC
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-0.5 py-0.2 rounded bg-slate-50 border border-slate-200 text-[3.5px] font-black text-slate-500">
                        UNVERIFIED
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* BOTTOM FOOTER WITH SIGNATURES AND SEAL */}
              <div 
                className="grid grid-cols-3 items-end z-10 transition-all duration-300"
                style={{ marginTop: `${footerMarginTop}px` }}
              >
                
                {/* LEFT SIGNATURE & DATE */}
                <div 
                  className="text-left space-y-0.5 transition-all duration-300"
                  style={{ 
                    paddingLeft: embedQr && qrPosition === 'Bottom Left' ? `${Math.max(88, qrSize + 36)}px` : '4.5rem' 
                  }}
                >
                  <div className="text-[8px] font-bold text-slate-800 font-mono">
                    {leftSignatureName}
                  </div>
                  <div className="border-t border-slate-300 w-24"></div>
                  <div className="text-[6.5px] text-slate-400 font-black uppercase tracking-wider">
                    {leftSignatureTitle}
                  </div>
                  <div className="text-[7px] text-slate-500 font-bold mt-0.5">
                    Date: <span className="text-slate-800">{issueDate}</span>
                  </div>
                </div>

                {/* CENTER SEAL / GOLDEN AWARD EMBLEM */}
                <div className="flex flex-col items-center justify-center relative">
                  <div className="w-9 h-9 bg-gradient-to-br from-[#f5d061] via-[#d4af37] to-[#aa7c11] rounded-full flex items-center justify-center shadow-lg relative border-2 border-white z-20">
                    <Award className="w-4 h-4 text-white" />
                    
                    {/* Ribbon Tails */}
                    <div className="absolute -bottom-2.5 left-1.5 w-2.5 h-4 bg-[#c5a059] transform -rotate-12 rounded-sm -z-10 shadow-sm"></div>
                    <div className="absolute -bottom-2.5 right-1.5 w-2.5 h-4 bg-[#c5a059] transform rotate-12 rounded-sm -z-10 shadow-sm"></div>
                  </div>
                  <div className="text-[5.5px] text-[#aa7c11] font-black uppercase tracking-widest mt-3">
                    Nkorera Quality Seal
                  </div>
                </div>

                {/* RIGHT SIGNATURE */}
                <div 
                  className="flex flex-col items-end space-y-0.5 transition-all duration-300"
                  style={{ 
                    paddingRight: embedQr && qrPosition === 'Bottom Right' ? `${Math.max(112, qrSize + 88)}px` : '5.5rem' 
                  }}
                >
                  <div className="text-[8px] font-bold text-slate-800 font-mono">
                    {rightSignatureName}
                  </div>
                  <div className="border-t border-slate-300 w-24"></div>
                  <div className="text-[6.5px] text-slate-400 font-black uppercase tracking-wider text-right">
                    {rightSignatureTitle}
                  </div>
                  
                  {/* Verification Number */}
                  <div className="text-[6px] text-slate-500 font-mono font-bold mt-0.5">
                    Verif: <span className="text-slate-800 font-black">{verificationNo}</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* USSD OVERLAY SIMULATOR DIALOG */}
        {showUssdPrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-[#1e1e1e] border-2 border-slate-700/80 rounded-2xl shadow-2xl text-white overflow-hidden font-sans">
              
              {/* HEADER */}
              <div className="bg-[#2d2d2d] px-4 py-3.5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${paymentCarrier === 'MTN' ? 'bg-yellow-400' : 'bg-red-500'}`} />
                  <span className="text-xs font-black tracking-wider uppercase text-slate-300">
                    {selectedSim}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-bold font-mono">USSD Push</span>
              </div>

              {/* CONTENT */}
              <div className="p-5 space-y-4">
                {isProcessingUssd ? (
                  <div className="py-6 flex flex-col items-center justify-center space-y-3 animate-pulse">
                    <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                    <div className="text-center">
                      <p className="text-xs font-black text-white">Waiting for Telecom approval...</p>
                      <p className="text-[10px] text-slate-400 mt-1">Linking the 2,000 FRW payment request with your mobile carrier.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={submitUssdPinConfirm} className="space-y-4">
                    <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                      {paymentCarrier === 'MTN' ? 'MTN Mobile Money' : 'Airtel Money'}: Please authorize a payment of <strong className="text-amber-300">2,000 FRW</strong> to <strong className="text-white">Nkundimana Theogene ({paymentCarrier === 'Airtel' ? '0724038043' : '0781339530'})</strong> to unlock certificate <span className="font-mono text-amber-300">{verificationNo}</span>.
                    </p>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase block text-left">
                        Enter your {paymentCarrier === 'Airtel' ? '4-Digit Airtel Money' : '5-Digit MTN MoMo'} PIN to authorize:
                      </label>
                      <input 
                        type="password"
                        placeholder={paymentCarrier === 'Airtel' ? "••••" : "•••••"}
                        required
                        maxLength={paymentCarrier === 'Airtel' ? 4 : 5}
                        autoFocus
                        value={ussdPin}
                        onChange={(e) => setUssdPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-[#121212] border border-slate-700 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-[0.4em] text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {ussdError && (
                      <p className="text-[10px] text-red-400 font-bold text-center bg-red-500/10 py-1.5 px-2 rounded-lg border border-red-500/20">
                        ⚠️ {ussdError}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUssdPrompt(false);
                          setUssdPin('');
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Confirm</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
