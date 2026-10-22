import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Lock, Unlock, FileText, Printer, User, ShieldCheck, Sparkles, Eye, Edit3, Send, CheckCircle2, ShieldAlert, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Plus, Minus, Calendar, RotateCw, Trash2, AlertTriangle } from 'lucide-react';
// @ts-ignore
import { rwandaLocation } from '@devrw/rwanda-location';
import { UserProfile } from '../types';
import { sanitizeClonedDocForPdf } from '../utils/pdfSanitizer';
import { exportStudentIdentificationRosterToPdf, exportSingleStudentIdToPdf } from '../utils/jspdfExporter';
import { checkStudentIdUnlocked, requestStudentIdUnlock, toggleStudentIdUnlockStatus, saveStudentRosterToFirestore, loadStudentRosterFromFirestore, subscribeToStudentRoster } from '../utils/firebase';

interface StudentRecord {
  id: string;
  regNo: string;
  names: string;
  gender: 'M' | 'F';
  dobPlace: string;
  dob?: string;
  pob?: string;
  residence: string;
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  fatherName: string;
  fatherPhone: string;
  fatherId?: string;
  motherName: string;
  motherPhone: string;
  motherId?: string;
  guardianName: string;
  guardianPhone: string;
  attendance: 'Day' | 'Boarding' | 'Day School' | 'Boarding School';
  classLevel?: string;
}

const RWANDA_PROVINCES: Record<string, string[]> = {
  'Kigali City': ['Nyarugenge', 'Gasabo', 'Kicukiro'],
  'Eastern Province': ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
  'Northern Province': ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
  'Southern Province': ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
  'Western Province': ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro']
};

const ALL_RWANDA_DISTRICTS = Object.values(RWANDA_PROVINCES).flat().sort();

const RWANDA_SECTORS: Record<string, string[]> = {
  'Nyarugenge': ['Gitega', 'Kanyinya', 'Kigali', 'Kimisagara', 'Mageragere', 'Muhima', 'Nyakabanda', 'Nyamirambo', 'Rwezamenyo'],
  'Gasabo': ['Bumbogo', 'Gatsata', 'Jali', 'Gihogwe', 'Gikomero', 'Gisozi', 'Jabana', 'Kinyinya', 'Ndera', 'Nduba', 'Rusororo', 'Rutunga', 'Kacyiru', 'Kimihurura', 'Remera'],
  'Kicukiro': ['Gahanga', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro', 'Kigarama', 'Masaka', 'Nyarugunga'],
  'Bugesera': ['Gashora', 'Juru', 'Kamabuye', 'Ntarama', 'Nyamata', 'Mayange', 'Musenyi', 'Mwogo', 'Ngeruka', 'Rilima', 'Ruhuha', 'Rweru', 'Shyara', 'Mareba'],
  'Gatsibo': ['Gasange', 'Gatsibo', 'Gitoki', 'Kabarore', 'Kageyo', 'Kiramuruzi', 'Kiziguro', 'Muhura', 'Murambi', 'Ngarama', 'Nyagihanga', 'Remera', 'Rugarama', 'Rwimbogo'],
  'Kayonza': ['Gahini', 'Kabare', 'Kabarondo', 'Mukarange', 'Murama', 'Murundi', 'Mwiri', 'Ndego', 'Nyamirama', 'Rukara', 'Ruramira', 'Rwinkwavu'],
  'Kirehe': ['Gahara', 'Gatore', 'Kigarama', 'Kigina', 'Kirehe', 'Mahama', 'Mpanga', 'Musaza', 'Mushikiri', 'Nasho', 'Nyamugari', 'Nyarubuye'],
  'Ngoma': ['Gashanda', 'Jarama', 'Karembo', 'Kazo', 'Kibungo', 'Mugesera', 'Murama', 'Mutenderi', 'Remera', 'Rukira', 'Rukumberi', 'Sake', 'Zaza', 'Rurenge'],
  'Nyagatare': ['Gatunda', 'Kiyombe', 'Karama', 'Karangazi', 'Katabagemu', 'Mimuri', 'Mukama', 'Musheri', 'Nyagatare', 'Rukomo', 'Rwempasha', 'Rwimiyaga', 'Tabagwe', 'Matimba'],
  'Rwamagana': ['Fumbwe', 'Gahengeri', 'Gishari', 'Karenge', 'Kigabiro', 'Nyakariro', 'Mwulire', 'Munyaga', 'Munyiginya', 'Musha', 'Muyumbu', 'Rubona', 'Nzige'],
  'Burera': ['Bungwe', 'Butaro', 'Cyanika', 'Cyeru', 'Gahunga', 'Gatebe', 'Gatumba', 'Kagogo', 'Kinoni', 'Kinyababa', 'Kivuye', 'Nemba', 'Rugarama', 'Rugendabari', 'Ruhunde', 'Rwerere', 'Senyi'],
  'Gakenke': ['Busengo', 'Coko', 'Cyabingo', 'Gakenke', 'Gashenyi', 'Janja', 'Kamubuga', 'Karambo', 'Kivuruga', 'Minazi', 'Mugunga', 'Muhondo', 'Muyongwe', 'Muzo', 'Nemba', 'Ruli', 'Rusasa', 'Shyira'],
  'Gicumbi': ['Byumba', 'Bwisige', 'Cyumba', 'Giti', 'Kaniga', 'Manyagiro', 'Miyove', 'Kageyo', 'Mukarange', 'Muko', 'Mutete', 'Nyamiyaga', 'Nyankenke', 'Rubaya', 'Rukomo', 'Rushaki', 'Rutare', 'Ruvune', 'Shangasha', 'Yaramba'],
  'Musanze': ['Busogo', 'Cyuve', 'Gacaca', 'Gashaki', 'Gataraga', 'Kimonyi', 'Kinigi', 'Muhoza', 'Muko', 'Musanze', 'Nkotsi', 'Nyange', 'Remera', 'Rwaza', 'Shingiro'],
  'Rulindo': ['Base', 'Burenga', 'Bushoki', 'Buyoga', 'Cyinzuzi', 'Cyungo', 'Kinihira', 'Kisaro', 'Masoro', 'Mbogo', 'Murambi', 'Ngoma', 'Ntarabana', 'Rukozo', 'Rusiga', 'Shyorongi', 'Tumba'],
  'Gisagara': ['Gikonko', 'Gishubi', 'Kansi', 'Kibilizi', 'Kigembe', 'Mamba', 'Muganza', 'Mugombwa', 'Mukindo', 'Musha', 'Ndora', 'Nyanza', 'Save'],
  'Huye': ['Gishamvu', 'Karama', 'Kigoma', 'Kinazi', 'Maraba', 'Mbazi', 'Mukura', 'Ngoma', 'Ruhashya', 'Rusatira', 'Rwaniro', 'Tumba', 'Huye'],
  'Kamonyi': ['Gacurabwenge', 'Karama', 'Kayenzi', 'Kayumbu', 'Mugina', 'Musambira', 'Ngamba', 'Nyamiyaga', 'Nyarubaka', 'Rugalika', 'Rukoma', 'Runda'],
  'Muhanga': ['Cyeza', 'Kabacuzi', 'Kiyumba', 'Muhanga', 'Mushishiro', 'Nyabinoni', 'Nyamabuye', 'Nyarusange', 'Rongi', 'Rugendabari', 'Shyogwe'],
  'Nyamagabe': ['Buruhukiro', 'Cyanika', 'Gatare', 'Kaduha', 'Kamegeli', 'Kibirizi', 'Kibumbwe', 'Kitabi', 'Mbazi', 'Mugano', 'Musange', 'Musebeya', 'Mushubi', 'Nkomane', 'Gasaka', 'Tare', 'Uwinkingi'],
  'Nyanza': ['Busasamana', 'Busoro', 'Cyabakamyi', 'Kibirizi', 'Kigoma', 'Mukingo', 'Muyira', 'Ntyazo', 'Nyagisozi', 'Rwabicuma'],
  'Nyaruguru': ['Cyahinda', 'Busanze', 'Kibeho', 'Mata', 'Muganza', 'Munini', 'Ngera', 'Ngoma', 'Nyabimata', 'Nyagisozi', 'Ruheru', 'Ruramba', 'Mugina'],
  'Ruhango': ['Bweramana', 'Byimana', 'Kabagali', 'Kinazi', 'Mbuye', 'Mwendo', 'Ntongwe', 'Ruhango'],
  'Karongi': ['Bwishyura', 'Gashari', 'Gishyita', 'Gihango', 'Gisovu', 'Murambi', 'Murundi', 'Mutuntu', 'Rubengera', 'Rugabano', 'Ruganda', 'Rwankuba', 'Twumba'],
  'Ngororero': ['Bwira', 'Gatumba', 'Hindiro', 'Kabaya', 'Kageyo', 'Kavumu', 'Matyazo', 'Muhanda', 'Muhororo', 'Ndaro', 'Ngororero', 'Nyange', 'Sovu'],
  'Nyabihu': ['Bigogwe', 'Jenda', 'Jomba', 'Kabatwa', 'Karago', 'Kintobo', 'Mukamira', 'Muringa', 'Rambura', 'Rugerero', 'Shyira'],
  'Nyamasheke': ['Bushekeri', 'Bushenge', 'Cyato', 'Gihombo', 'Kagano', 'Kanjongo', 'Karambi', 'Kirimbi', 'Macuba', 'Nyabitekeri', 'Mahembe', 'Ruharambuga', 'Shangi'],
  'Rubavu': ['Bugeshi', 'Busasamana', 'Cyanzarwe', 'Gisenyi', 'Kanama', 'Nyakiriba', 'Nyamyumba', 'Nyundo', 'Rubavu', 'Rugerero', 'Ruhanzu'],
  'Rusizi': ['Bugarama', 'Butare', 'Bweyeye', 'Gashonga', 'Giheke', 'Gihundwe', 'Gikundamvura', 'Kamembe', 'Muganza', 'Mururu', 'Nkanka', 'Nkombo', 'Nyakabuye', 'Nyakarenzo', 'Nzahaha', 'Rwimbogo'],
  'Rutsiro': ['Boneza', 'Gihango', 'Kigeyo', 'Kivumu', 'Manihira', 'Mukura', 'Murunda', 'Musasa', 'Mushonyi', 'Mushubati', 'Nyabirasi', 'Ruhango', 'Rutsiro']
};

const findProvinceForDistrict = (districtName: string): string => {
  if (!districtName) return '';
  const dNameClean = districtName.trim().toLowerCase();
  for (const [prov, dists] of Object.entries(RWANDA_PROVINCES)) {
    if (dists.some(d => d.toLowerCase() === dNameClean)) {
      return prov;
    }
  }
  return '';
};

const mapProvinceToPackageName = (prov: string): string => {
  if (!prov) return '';
  const p = prov.toLowerCase();
  if (p.includes('kigali')) return 'KIGALI';
  if (p.includes('east')) return 'EAST';
  if (p.includes('north')) return 'NORTH';
  if (p.includes('south')) return 'SOUTH';
  if (p.includes('west')) return 'WEST';
  return prov;
};

const getSectorsForDistrict = (districtName: string, provinceName?: string): string[] => {
  if (!districtName) return [];
  try {
    const filter: any = { districtName };
    if (provinceName) {
      filter.provinceName = mapProvinceToPackageName(provinceName);
    }
    const results = rwandaLocation.query(filter) || [];
    if (results && results.length > 0) {
      const sectors = Array.from(new Set(results.map((r: any) => r.sectorName || r.sector_name))).filter(Boolean);
      if (sectors.length > 0) {
        return sectors.sort() as string[];
      }
    }
  } catch (e) {
    console.warn("Failed to get sectors from '@devrw/rwanda-location' package:", e);
  }
  return RWANDA_SECTORS[districtName] || [];
};

const getCommonCellsForSector = (sector: string, province?: string, district?: string): string[] => {
  if (!sector) return [];
  try {
    const filter: any = { sectorName: sector };
    if (district) filter.districtName = district;
    if (province) filter.provinceName = mapProvinceToPackageName(province);
    
    const results = rwandaLocation.query(filter) || [];
    if (results && results.length > 0) {
      const cells = Array.from(new Set(results.map((r: any) => r.cellName || r.cell_name))).filter(Boolean);
      if (cells.length > 0) {
        return cells.sort() as string[];
      }
    }
  } catch (e) {
    console.warn("Failed to get cells from '@devrw/rwanda-location' package, using fallback:", e);
  }
  const sClean = sector.trim().toLowerCase();
  if (sClean === 'mayange') return ['Mbyo', 'Kagenge', 'Kibenga', 'Gakomeye', 'Muyenzi'];
  if (sClean === 'gashora') return ['Kagomasi', 'Mwendo', 'Ramiro', 'Kabuye', 'Biryogo'];
  if (sClean === 'nyamata') return ['Nyamata', 'Murama', 'Kanazi', 'Maranyundo', 'Kayumba'];
  if (sClean === 'remera') return ['Rukiri I', 'Rukiri II', 'Nyarutarama', 'Kibagabaga'];
  if (sClean === 'kimihurura') return ['Kimihurura', 'Rugando', 'Kamukina'];
  if (sClean === 'kacyiru') return ['Kamatamu', 'Kibaza', 'Inyange'];
  if (sClean === 'gisozi') return ['Ruhango', 'Musezero'];
  if (sClean === 'kanombe') return ['Busanza', 'Kabeza', 'Karama', 'Rubirizi'];
  if (sClean === 'masaka') return ['Gako', 'Ayabaraya', 'Cyimo'];
  return ['Ubumwe', 'Amahoro', 'Iterambere', 'Isangano'];
};

const getCommonVillagesForCell = (cell: string, province?: string, district?: string, sector?: string): string[] => {
  if (!cell) return [];
  try {
    const filter: any = { cellName: cell };
    if (sector) filter.sectorName = sector;
    if (district) filter.districtName = district;
    if (province) filter.provinceName = mapProvinceToPackageName(province);

    const results = rwandaLocation.query(filter) || [];
    if (results && results.length > 0) {
      const villages = Array.from(new Set(results.map((r: any) => r.name || r.villageName || r.village_name || r.village))).filter(Boolean);
      if (villages.length > 0) {
        return villages.sort() as string[];
      }
    }
  } catch (e) {
    console.warn("Failed to get villages from '@devrw/rwanda-location' package, using fallback:", e);
  }
  const cClean = cell.trim().toLowerCase();
  if (cClean === 'mbyo') return ['Mbyo', 'Rebero', 'Kigali', 'Ruhuha'];
  if (cClean === 'kagenge') return ['Gisenyi', 'Gatare', 'Kabuga'];
  if (cClean === 'kibenga') return ['Kibenga', 'Rukurazo', 'Nyarurembo'];
  if (cClean === 'nyarutarama') return ['Kamutwa', 'Kiyovu', 'Gisimenti'];
  if (cClean === 'kibagabaga') return ['Karongi', 'Gasharu', 'Rurembo'];
  return ['Iterambere', 'Ubumwe', 'Amahoro', 'Kigali', 'Rebero', 'Kabuga', 'Gatare', 'Gasharu', 'Rurembo', 'Nyarurembo'];
};

interface StudentIdentificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSubscription?: () => void;
  currentUser?: UserProfile | null;
}

const COMMON_CLASSES = [
  'Nursery 1',
  'Nursery 2',
  'Nursery 3',
  'Primary 1',
  'Primary 2',
  'Primary 3',
  'Primary 4',
  'Primary 5',
  'Primary 6',
  'S1',
  'S2',
  'S3 A',
  'S3 B',
  'S4 LKK',
  'S4 MCB',
  'S5 MCB',
  'S6 MCB',
  'TTC Year 1',
  'TTC Year 2',
  'TTC Year 3',
  'TVET L1',
  'TVET L2',
  'TVET L3',
  'TVET L4',
  'TVET L5'
];

const DEFAULT_SAMPLE_STUDENTS: StudentRecord[] = [
  {
    id: 'std-1',
    regNo: 'STD-2026-001',
    names: 'UWIMANA Alice',
    gender: 'F',
    dobPlace: '12/05/2010 - Bugesera',
    dob: '2010-05-12',
    pob: 'Bugesera',
    residence: 'Bugesera, Mayange, Mbyo, Gisenyi',
    district: 'Bugesera',
    sector: 'Mayange',
    cell: 'Mbyo',
    village: 'Gisenyi',
    fatherName: 'MUGABO Jean Pierre',
    fatherPhone: '+250 788 123 456',
    fatherId: '1198080012345678',
    motherName: 'MUKAMANA Marie',
    motherPhone: '+250 785 987 654',
    motherId: '1198270087654321',
    guardianName: 'GAKWAYA Paul',
    guardianPhone: '+250 783 112 233',
    attendance: 'Day',
    classLevel: 'S3'
  },
  {
    id: 'std-2',
    regNo: 'STD-2026-002',
    names: 'NKUNDIMANA Eric',
    gender: 'M',
    dobPlace: '04/11/2009 - Kigali',
    dob: '2009-11-04',
    pob: 'Kigali',
    residence: 'Kicukiro, Niboye, Gatare, Niboye',
    district: 'Kicukiro',
    sector: 'Niboye',
    cell: 'Gatare',
    village: 'Niboye',
    fatherName: 'HABIMANA Claude',
    fatherPhone: '+250 781 223 344',
    fatherId: '1197880023456789',
    motherName: 'UWERA Chantal',
    motherPhone: '+250 782 334 455',
    motherId: '1198170098765432',
    guardianName: '-',
    guardianPhone: '-',
    attendance: 'Boarding',
    classLevel: 'S3'
  },
  {
    id: 'std-3',
    regNo: 'STD-2026-003',
    names: 'MUTANGUHA Jean de Dieu',
    gender: 'M',
    dobPlace: '15/08/2010 - Musanze',
    dob: '2010-08-15',
    pob: 'Musanze',
    residence: 'Musanze, Muhoza, Ruhengeri, Kigombe',
    district: 'Musanze',
    sector: 'Muhoza',
    cell: 'Ruhengeri',
    village: 'Kigombe',
    fatherName: 'BIZIMANA Felicien',
    fatherPhone: '+250 788 456 789',
    fatherId: '1197780034567812',
    motherName: 'MUTONI Jeanne',
    motherPhone: '+250 785 654 321',
    motherId: '1198070012345678',
    guardianName: '-',
    guardianPhone: '-',
    attendance: 'Boarding',
    classLevel: 'S3 A'
  }
];

export const StudentIdentificationModal: React.FC<StudentIdentificationModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  // General School & Class Settings
  const [schoolInfo, setSchoolInfo] = useState(() => {
    const saved = localStorage.getItem('nkorera_school_info');
    return saved ? JSON.parse(saved) : {
      schoolName: 'GS MAYANGE B',
      academicYear: '2025-2026',
      classCombo: 'S3'
    };
  });
  const [showAcademicYearPicker, setShowAcademicYearPicker] = useState<boolean>(false);

  // Students Roster
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    const saved = localStorage.getItem('nkorera_student_roster');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_SAMPLE_STUDENTS;
  });

  // Active student being edited or added (with draft recovery)
  const [currentStudent, setCurrentStudent] = useState<StudentRecord>(() => {
    try {
      const draft = localStorage.getItem('nkorera_current_student_draft');
      if (draft) {
        return JSON.parse(draft);
      }
    } catch (e) {}
    return {
      id: '',
      regNo: '',
      names: '',
      gender: 'F',
      dobPlace: '',
      dob: '',
      pob: '',
      residence: '',
      district: '',
      sector: '',
      cell: '',
      village: '',
      fatherName: '',
      fatherPhone: '',
      fatherId: '',
      motherName: '',
      motherPhone: '',
      motherId: '',
      guardianName: '',
      guardianPhone: '',
      attendance: 'Day School',
      classLevel: ''
    };
  });

  const [isCustomClassActive, setIsCustomClassActive] = useState<boolean>(() => {
    try {
      const draft = localStorage.getItem('nkorera_current_student_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        return !!(parsed.classLevel && !COMMON_CLASSES.includes(parsed.classLevel));
      }
    } catch {}
    return false;
  });

  const [isEditingCustomClassActive, setIsEditingCustomClassActive] = useState<boolean>(false);

  const [editingId, setEditingId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('nkorera_current_editing_id') || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (editingId) {
        localStorage.setItem('nkorera_current_editing_id', editingId);
      } else {
        localStorage.removeItem('nkorera_current_editing_id');
      }
    } catch {}
  }, [editingId]);

  const formRef = useRef<HTMLFormElement>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => setActionFeedback(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  const [activeTab, setActiveTab] = useState<'roster' | 'preview'>('roster');
  const [previewPageIndex, setPreviewPageIndex] = useState<number>(0);
  const [previewSearch, setPreviewSearch] = useState<string>('');
  const [demoQuantity, setDemoQuantity] = useState<number>(100);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'none' | 'name_asc' | 'name_desc' | 'index_asc' | 'index_desc'>('none');
  const [filterClass, setFilterClass] = useState<string>('All');

  // Edit Student Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);

  const openEditModal = (student: StudentRecord) => {
    let dob = student.dob || '';
    let pob = student.pob || '';
    if (!dob && student.dobPlace) {
      const parts = student.dobPlace.split(' - ');
      const rawDate = parts[0] || '';
      pob = parts[1] || '';
      if (rawDate.includes('/')) {
        const dateParts = rawDate.split('/');
        if (dateParts.length === 3) {
          const day = dateParts[0].trim().padStart(2, '0');
          const month = dateParts[1].trim().padStart(2, '0');
          const year = dateParts[2].trim();
          dob = `${year}-${month}-${day}`;
        }
      } else {
        dob = rawDate.trim();
      }
    }

    let district = student.district || '';
    let sector = student.sector || '';
    let cell = student.cell || '';
    let village = student.village || '';
    if (!district && student.residence) {
      const resParts = student.residence.split(',').map(s => s.trim());
      if (resParts.length >= 1) district = resParts[0];
      if (resParts.length >= 2) sector = resParts[1];
      if (resParts.length >= 3) cell = resParts[2];
      if (resParts.length >= 4) village = resParts.slice(3).join(', ');
    }

    const autoProvince = student.province || (district ? findProvinceForDistrict(district) : '');

    setEditingStudent({
      ...student,
      province: autoProvince,
      district,
      sector,
      cell,
      village,
      dob,
      pob
    });
    setIsEditingCustomClassActive(!!(student.classLevel && !COMMON_CLASSES.includes(student.classLevel)));
    setIsEditModalOpen(true);
  };

  const handleUpdateEditedStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    if (!editingStudent.names.trim()) {
      setActionFeedback({
        type: 'error',
        message: 'Please enter student names before saving.'
      });
      return;
    }

    const distPart = editingStudent.district?.trim() || '';
    const sectPart = editingStudent.sector?.trim() || '';
    const cellPart = editingStudent.cell?.trim() || '';
    const villPart = editingStudent.village?.trim() || '';
    const computedResidence = [distPart, sectPart, cellPart, villPart].filter(Boolean).join(', ') || editingStudent.residence || '-';
    
    let computedDobPlace = editingStudent.dobPlace || '-';
    if (editingStudent.dob || editingStudent.pob) {
      computedDobPlace = `${editingStudent.dob || '-'} - ${editingStudent.pob || '-'}`;
    }

    const studentToSave: StudentRecord = {
      ...editingStudent,
      dobPlace: computedDobPlace,
      residence: computedResidence
    };

    const updatedList = students.map(s => s.id === studentToSave.id ? studentToSave : s);
    setStudents(updatedList);
    
    try {
      const safeKey = userEmail.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
      localStorage.setItem('nkorera_student_roster', JSON.stringify(updatedList));
      localStorage.setItem(`nkorera_student_roster_${safeKey}`, JSON.stringify(updatedList));
    } catch {}

    // Cloud auto-save
    setAutoSaveStatus('saving');
    saveStudentRosterToFirestore({
      userEmail,
      schoolInfo,
      students: updatedList
    }).then(() => {
      setAutoSaveStatus('synced');
      setLastSyncedAt(new Date().toISOString());
    }).catch((err) => {
      console.warn("Edit student save error:", err);
      setAutoSaveStatus('saved');
    });

    setIsEditModalOpen(false);
    setEditingStudent(null);
    setIsEditingCustomClassActive(false);
    
    setActionFeedback({
      type: 'success',
      message: `Student information for ${studentToSave.names} updated successfully!`
    });
  };

  // Dynamic list of unique classes/levels present in the roster to populate the filter dropdown
  const uniqueClasses = ['All', ...Array.from(new Set(students.map(st => st.classLevel || 'Unassigned').filter(Boolean)))];

  // 1. Filter students by selected Class/Level first
  const filteredStudents = students.filter(st => {
    if (filterClass === 'All') return true;
    const studentClass = st.classLevel || 'Unassigned';
    return studentClass.toLowerCase() === filterClass.toLowerCase();
  });

  // Check if current user is Admin
  const isAdmin = Boolean(
    currentUser?.isAdmin ||
    currentUser?.email === 'nkundimana123theogene@gmail.com'
  );

  const userEmail = currentUser?.email || 'nkundimana123theogene@gmail.com';

  // Admin unlock status
  const [isUnlockedByAdmin, setIsUnlockedByAdmin] = useState<boolean>(isAdmin);
  const [momoNumber, setMomoNumber] = useState<string>(currentUser?.phone || '');
  const [momoTxId, setMomoTxId] = useState<string>('');
  const [isSubmittingReq, setIsSubmittingReq] = useState<boolean>(false);
  const [reqSuccessMsg, setReqSuccessMsg] = useState<string>('');
  const [showReqForm, setShowReqForm] = useState<boolean>(false);

  // Interactive Instant USSD Dial + PIN Payment State
  const [paymentSim, setPaymentSim] = useState<'MTN' | 'Airtel'>('MTN');
  const [showUssdModal, setShowUssdModal] = useState<boolean>(false);
  const [ussdPin, setUssdPin] = useState<string>('');
  const [isProcessingUssd, setIsProcessingUssd] = useState<boolean>(false);

  // Admin controls target email
  const [adminTargetEmail, setAdminTargetEmail] = useState<string>(userEmail);
  const [isTogglingAdmin, setIsTogglingAdmin] = useState<boolean>(false);

  // Sorted and filtered students helper
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'name_asc') {
      return (a.names || '').localeCompare(b.names || '');
    }
    if (sortBy === 'name_desc') {
      return (b.names || '').localeCompare(a.names || '');
    }
    if (sortBy === 'index_asc') {
      return (a.regNo || '').localeCompare(b.regNo || '');
    }
    if (sortBy === 'index_desc') {
      return (b.regNo || '').localeCompare(a.regNo || '');
    }
    return 0;
  });

  // Helper to generate the next unique Registration Number
  const getNextRegNo = (currentStudentsList = students) => {
    let year = new Date().getFullYear();
    if (schoolInfo && schoolInfo.academicYear) {
      const parts = schoolInfo.academicYear.split('-');
      if (parts[0] && !isNaN(parseInt(parts[0], 10))) {
        year = parseInt(parts[0], 10);
      }
    }
    const regex = new RegExp(`^STD-${year}-(\\d+)$`);
    let maxSeq = 0;
    
    currentStudentsList.forEach(st => {
      if (st.regNo) {
        const match = st.regNo.match(regex);
        if (match) {
          const seq = parseInt(match[1], 10);
          if (seq > maxSeq) {
            maxSeq = seq;
          }
        } else {
          const digits = st.regNo.match(/\d+$/);
          if (digits) {
            const seq = parseInt(digits[0], 10);
            if (seq > maxSeq) {
              maxSeq = seq;
            }
          }
        }
      }
    });

    const nextSeq = maxSeq + 1;
    return `STD-${year}-${String(nextSeq).padStart(3, '0')}`;
  };

  // Auto-populate regNo when creating a new student and it is empty or year changes
  useEffect(() => {
    if (!editingId && !currentStudent.id) {
      // Check if current regNo already matches the target year prefix to prevent infinite loop or overwriting customized edits
      let targetYear = new Date().getFullYear();
      if (schoolInfo && schoolInfo.academicYear) {
        const parts = schoolInfo.academicYear.split('-');
        if (parts[0] && !isNaN(parseInt(parts[0], 10))) {
          targetYear = parseInt(parts[0], 10);
        }
      }
      
      const currentRegYear = currentStudent.regNo ? currentStudent.regNo.split('-')[1] : '';
      if (!currentStudent.regNo || currentRegYear !== String(targetYear)) {
        setCurrentStudent(prev => ({
          ...prev,
          regNo: getNextRegNo()
        }));
      }
    }
  }, [editingId, currentStudent.id, schoolInfo.academicYear, students]);

  useEffect(() => {
    if (isOpen) {
      if (isAdmin) {
        setIsUnlockedByAdmin(true);
      } else {
        checkStudentIdUnlocked(userEmail).then(unlocked => {
          setIsUnlockedByAdmin(unlocked);
        });
      }
    }
  }, [isOpen, userEmail, isAdmin]);

  // Cloud Sync & Instant Auto-Save state
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'synced'>('saved');
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    return localStorage.getItem('nkorera_student_roster_last_synced') || null;
  });
  const [hasInitializedCloud, setHasInitializedCloud] = useState<boolean>(false);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ id: string; name: string } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const isSavingLocallyRef = useRef<boolean>(false);
  const currentStudentRef = useRef<StudentRecord>(currentStudent);
  const editingIdRef = useRef<string | null>(editingId);
  const studentsRef = useRef<StudentRecord[]>(students);
  const schoolInfoRef = useRef(schoolInfo);

  useEffect(() => {
    currentStudentRef.current = currentStudent;
  }, [currentStudent]);

  useEffect(() => {
    editingIdRef.current = editingId;
  }, [editingId]);

  useEffect(() => {
    studentsRef.current = students;
  }, [students]);

  useEffect(() => {
    schoolInfoRef.current = schoolInfo;
  }, [schoolInfo]);

  // Reset cloud initialization status and load specific cached student roster when user email changes
  useEffect(() => {
    setHasInitializedCloud(false);
    const safeKey = userEmail.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
    
    try {
      const cachedRoster = localStorage.getItem(`nkorera_student_roster_${safeKey}`);
      const cachedSchool = localStorage.getItem(`nkorera_school_info_${safeKey}`);
      
      if (cachedRoster) {
        try {
          const parsed = JSON.parse(cachedRoster);
          setStudents(Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SAMPLE_STUDENTS);
        } catch {
          setStudents(DEFAULT_SAMPLE_STUDENTS);
        }
      } else {
        const globalSaved = localStorage.getItem('nkorera_student_roster');
        if (globalSaved) {
          try {
            const parsedGlobal = JSON.parse(globalSaved);
            setStudents(Array.isArray(parsedGlobal) && parsedGlobal.length > 0 ? parsedGlobal : DEFAULT_SAMPLE_STUDENTS);
          } catch {
            setStudents(DEFAULT_SAMPLE_STUDENTS);
          }
        } else {
          setStudents(DEFAULT_SAMPLE_STUDENTS);
        }
      }
      
      if (cachedSchool) {
        setSchoolInfo(JSON.parse(cachedSchool));
      } else {
        const globalSchool = localStorage.getItem('nkorera_school_info');
        setSchoolInfo(globalSchool ? JSON.parse(globalSchool) : {
          schoolName: 'GS MAYANGE B',
          academicYear: '2025-2026',
          classCombo: 'S3'
        });
      }
    } catch (e) {
      console.warn("Error pre-loading cached roster for email:", e);
    }
  }, [userEmail]);

  // Screen Wake Lock: Keep screen awake while writing student identification forms
  // Prevents mobile/tablet screen from dimming or sleeping during long pauses looking at paper registers
  useEffect(() => {
    if (!isOpen) return;

    let wakeLockSentinel: any = null;

    const requestWakeLock = async () => {
      try {
        if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
          wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        }
      } catch {
        // Harmless fallback if not supported or battery saver enabled
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isOpen) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockSentinel && typeof wakeLockSentinel.release === 'function') {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, [isOpen]);

  // 1. Initial Load from Cloud Firestore when modal opens + Real-time Subscription with Safe Merge
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsCloudSyncing(true);

    async function syncFromCloud() {
      try {
        const cloudData = await loadStudentRosterFromFirestore(userEmail);
        if (!isMounted) return;

        if (cloudData && Array.isArray(cloudData.students) && cloudData.students.length > 0) {
          const activeEditingId = editingIdRef.current;
          const activeStudent = currentStudentRef.current;

          // Preserve active student draft if user already started writing
          if (activeEditingId && activeStudent.names?.trim()) {
            const merged = cloudData.students.map(s => s.id === activeEditingId ? activeStudent : s);
            if (!merged.some(s => s.id === activeEditingId)) merged.push(activeStudent);
            setStudents(merged);
          } else {
            setStudents(cloudData.students);
          }

          if (cloudData.schoolInfo) {
            setSchoolInfo(cloudData.schoolInfo);
          }
          if (cloudData.updatedAt) {
            setLastSyncedAt(cloudData.updatedAt);
          }
        } else {
          // Cloud has no roster yet or is empty: restore DEFAULT_SAMPLE_STUDENTS and sync to cloud
          const targetRoster = students.length > 0 ? students : DEFAULT_SAMPLE_STUDENTS;
          setStudents(targetRoster);
          await saveStudentRosterToFirestore({
            userEmail,
            schoolInfo,
            students: targetRoster
          });
          const now = new Date().toISOString();
          setLastSyncedAt(now);
        }
      } catch (err) {
        console.warn("Error syncing student roster on open:", err);
      } finally {
        if (isMounted) {
          setIsCloudSyncing(false);
          setHasInitializedCloud(true);
        }
      }
    }

    syncFromCloud();

    // Attach real-time snapshot listener: when edited on computer, updates on phone immediately!
    const unsubscribe = subscribeToStudentRoster(userEmail, (remoteData) => {
      if (!isMounted) return;
      if (isSavingLocallyRef.current) return; // avoid loop during local save

      if (remoteData && Array.isArray(remoteData.students)) {
        const activeEditingId = editingIdRef.current;
        const activeStudent = currentStudentRef.current;

        // If the teacher has an active student form loaded/being edited, protect local changes from being clobbered!
        if (activeEditingId && activeStudent.names?.trim()) {
          const merged = remoteData.students.map(s => s.id === activeEditingId ? activeStudent : s);
          if (!merged.some(s => s.id === activeEditingId)) {
            merged.push(activeStudent);
          }
          setStudents(merged);
        } else {
          setStudents(remoteData.students);
        }

        if (remoteData.schoolInfo) {
          setSchoolInfo(remoteData.schoolInfo);
        }
        if (remoteData.updatedAt) {
          setLastSyncedAt(remoteData.updatedAt);
        }
        setAutoSaveStatus('synced');
        setTimeout(() => setAutoSaveStatus('saved'), 2000);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isOpen, userEmail]);

  // 2. Draft auto-save for the student form in progress (protect against idle timeout, sleep, or tab reload)
  useEffect(() => {
    if (currentStudent.names || currentStudent.fatherName || currentStudent.motherName || currentStudent.district) {
      localStorage.setItem('nkorera_current_student_draft', JSON.stringify(currentStudent));
    }
  }, [currentStudent]);

  // 3. Keep LocalStorage in sync whenever students or schoolInfo change
  useEffect(() => {
    const safeKey = userEmail.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
    localStorage.setItem('nkorera_student_roster', JSON.stringify(students));
    localStorage.setItem('nkorera_school_info', JSON.stringify(schoolInfo));
    localStorage.setItem(`nkorera_student_roster_${safeKey}`, JSON.stringify(students));
    localStorage.setItem(`nkorera_school_info_${safeKey}`, JSON.stringify(schoolInfo));
  }, [students, schoolInfo, userEmail]);

  // 4. Instant Flush & Long Idle Resilience: guarantees no data is lost on lock, app switch, or disconnect
  useEffect(() => {
    const handleImmediateFlush = () => {
      if (!isOpen) return;
      const currentList = studentsRef.current;
      const currentInfo = schoolInfoRef.current;
      const activeCurrent = currentStudentRef.current;
      const activeEditing = editingIdRef.current;

      try {
        const safeKey = userEmail.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
        localStorage.setItem('nkorera_student_roster', JSON.stringify(currentList));
        localStorage.setItem('nkorera_school_info', JSON.stringify(currentInfo));
        localStorage.setItem(`nkorera_student_roster_${safeKey}`, JSON.stringify(currentList));
        localStorage.setItem(`nkorera_school_info_${safeKey}`, JSON.stringify(currentInfo));
        if (activeCurrent.names?.trim()) {
          localStorage.setItem('nkorera_current_student_draft', JSON.stringify(activeCurrent));
        }
        if (activeEditing) {
          localStorage.setItem('nkorera_current_editing_id', activeEditing);
        }

        if (userEmail && hasInitializedCloud) {
          saveStudentRosterToFirestore({
            userEmail,
            schoolInfo: currentInfo,
            students: currentList
          }).catch(() => {});
        }
      } catch {}
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleImmediateFlush();
      } else if (document.visibilityState === 'visible' && isOpen && userEmail) {
        // When returning after long idle, softly refresh without clobbering active form
        loadStudentRosterFromFirestore(userEmail).then(cloudData => {
          if (cloudData && Array.isArray(cloudData.students)) {
            const activeEditingId = editingIdRef.current;
            const activeStudent = currentStudentRef.current;
            if (activeEditingId && activeStudent.names?.trim()) {
              const merged = cloudData.students.map(s => s.id === activeEditingId ? activeStudent : s);
              if (!merged.some(s => s.id === activeEditingId)) merged.push(activeStudent);
              setStudents(merged);
            } else {
              setStudents(cloudData.students);
            }
          }
        }).catch(() => {});
      }
    };

    window.addEventListener('beforeunload', handleImmediateFlush);
    window.addEventListener('pagehide', handleImmediateFlush);
    window.addEventListener('online', handleImmediateFlush);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('beforeunload', handleImmediateFlush);
      window.removeEventListener('pagehide', handleImmediateFlush);
      window.removeEventListener('online', handleImmediateFlush);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isOpen, userEmail, hasInitializedCloud]);

  const handleManualCloudSync = async (forcePull = false) => {
    setIsCloudSyncing(true);
    setAutoSaveStatus('saving');
    try {
      if (forcePull) {
        const cloudData = await loadStudentRosterFromFirestore(userEmail);
        if (cloudData && Array.isArray(cloudData.students)) {
          setStudents(cloudData.students);
          if (cloudData.schoolInfo) setSchoolInfo(cloudData.schoolInfo);
          setLastSyncedAt(cloudData.updatedAt || new Date().toISOString());
          setAutoSaveStatus('synced');
        }
      } else {
        isSavingLocallyRef.current = true;
        await saveStudentRosterToFirestore({
          userEmail,
          schoolInfo,
          students
        });
        setLastSyncedAt(new Date().toISOString());
        setAutoSaveStatus('saved');
      }
    } catch (e) {
      console.warn("Manual sync error:", e);
    } finally {
      setIsCloudSyncing(false);
      setTimeout(() => {
        isSavingLocallyRef.current = false;
        setAutoSaveStatus('saved');
      }, 500);
    }
  };

  const handleRestoreSampleStudents = async () => {
    setIsCloudSyncing(true);
    try {
      setStudents(DEFAULT_SAMPLE_STUDENTS);
      await saveStudentRosterToFirestore({
        userEmail,
        schoolInfo,
        students: DEFAULT_SAMPLE_STUDENTS
      });
      const now = new Date().toISOString();
      setLastSyncedAt(now);
    } catch (e) {
      console.warn("Error restoring sample students:", e);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Access is granted strictly if user is Admin OR explicitly unlocked by Admin
  const isPaid = isAdmin || isUnlockedByAdmin;

  const handleStudentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let updatedStudent: StudentRecord;

    if (name === 'province') {
      updatedStudent = {
        ...currentStudent,
        province: value,
        district: '',
        sector: '',
        cell: '',
        village: ''
      };
    } else if (name === 'district') {
      const autoProv = findProvinceForDistrict(value);
      updatedStudent = {
        ...currentStudent,
        district: value,
        province: autoProv || currentStudent.province,
        sector: '',
        cell: '',
        village: ''
      };
    } else if (name === 'sector') {
      updatedStudent = {
        ...currentStudent,
        sector: value,
        cell: '',
        village: ''
      };
    } else if (name === 'cell') {
      updatedStudent = {
        ...currentStudent,
        cell: value,
        village: ''
      };
    } else {
      updatedStudent = {
        ...currentStudent,
        [name]: value
      };
    }

    // Compute dobPlace & residence dynamically as user writes
    const distPart = updatedStudent.district?.trim() || '';
    const sectPart = updatedStudent.sector?.trim() || '';
    const cellPart = updatedStudent.cell?.trim() || '';
    const villPart = updatedStudent.village?.trim() || '';
    const computedResidence = [distPart, sectPart, cellPart, villPart].filter(Boolean).join(', ');
    const computedDobPlace = (updatedStudent.dob || updatedStudent.pob)
      ? `${updatedStudent.dob || ''} - ${updatedStudent.pob || ''}`
      : updatedStudent.dobPlace;

    const finalizedStudent: StudentRecord = {
      ...updatedStudent,
      dobPlace: computedDobPlace,
      residence: computedResidence || updatedStudent.residence
    };

    setCurrentStudent(finalizedStudent);

    // Auto-Save directly into student roster as user edits an existing student
    if (editingId) {
      setStudents(prev => prev.map(s => s.id === editingId ? { ...finalizedStudent, id: editingId } : s));
    }
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent.names.trim()) {
      setActionFeedback({
        type: 'error',
        message: 'Please enter student names before saving.'
      });
      return;
    }

    const distPart = currentStudent.district?.trim() || '';
    const sectPart = currentStudent.sector?.trim() || '';
    const cellPart = currentStudent.cell?.trim() || '';
    const villPart = currentStudent.village?.trim() || '';
    const computedResidence = [distPart, sectPart, cellPart, villPart].filter(Boolean).join(', ') || currentStudent.residence || '-';
    
    let computedDobPlace = currentStudent.dobPlace || '-';
    if (currentStudent.dob || currentStudent.pob) {
      computedDobPlace = `${currentStudent.dob || '-'} - ${currentStudent.pob || '-'}`;
    }

    const studentToSave: StudentRecord = {
      ...currentStudent,
      dobPlace: computedDobPlace,
      residence: computedResidence
    };

    let updatedList: StudentRecord[];
    if (editingId) {
      updatedList = students.map(s => s.id === editingId ? { ...studentToSave, id: editingId } : s);
      setEditingId(null);
      setActionFeedback({
        type: 'success',
        message: `Student information for ${studentToSave.names} updated successfully!`
      });
    } else {
      const newId = `std-${Date.now()}`;
      const newRegNo = studentToSave.regNo || getNextRegNo();
      updatedList = [...students, { ...studentToSave, id: newId, regNo: newRegNo }];
      setActionFeedback({
        type: 'success',
        message: `${studentToSave.names} added successfully to roster!`
      });
    }
    setStudents(updatedList);
    try {
      const safeKey = userEmail.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
      localStorage.setItem('nkorera_student_roster', JSON.stringify(updatedList));
      localStorage.setItem(`nkorera_student_roster_${safeKey}`, JSON.stringify(updatedList));
      localStorage.removeItem('nkorera_current_student_draft');
      localStorage.removeItem('nkorera_current_editing_id');
    } catch {}

    // Instant Cloud Auto-Save
    setAutoSaveStatus('saving');
    isSavingLocallyRef.current = true;
    saveStudentRosterToFirestore({
      userEmail,
      schoolInfo,
      students: updatedList
    }).then(() => {
      setAutoSaveStatus('saved');
      setLastSyncedAt(new Date().toISOString());
    }).catch(err => {
      console.warn("Instant auto-save student error:", err);
      setAutoSaveStatus('saved');
    }).finally(() => {
      setTimeout(() => {
        isSavingLocallyRef.current = false;
      }, 500);
    });

    // Reset current student input for next entry
    setCurrentStudent({
      id: '',
      regNo: '',
      names: '',
      gender: 'F',
      dobPlace: '',
      dob: '',
      pob: '',
      residence: '',
      province: '',
      district: '',
      sector: '',
      cell: '',
      village: '',
      fatherName: '',
      fatherPhone: '',
      fatherId: '',
      motherName: '',
      motherPhone: '',
      motherId: '',
      guardianName: '',
      guardianPhone: '',
      attendance: 'Day School',
      classLevel: ''
    });
    setIsCustomClassActive(false);
    setIsEditingCustomClassActive(false);
  };

  // handleEditStudent has been replaced by openEditModal for better interactive experience in a popup modal
  const handleCancelEdit = () => {
    setEditingId(null);
    setIsEditingCustomClassActive(false);
    setIsCustomClassActive(false);
    try {
      localStorage.removeItem('nkorera_current_editing_id');
      localStorage.removeItem('nkorera_current_student_draft');
    } catch {}
    setCurrentStudent({
      id: '',
      regNo: '',
      names: '',
      gender: 'F',
      dobPlace: '',
      dob: '',
      pob: '',
      residence: '',
      province: '',
      district: '',
      sector: '',
      cell: '',
      village: '',
      fatherName: '',
      fatherPhone: '',
      fatherId: '',
      motherName: '',
      motherPhone: '',
      motherId: '',
      guardianName: '',
      guardianPhone: '',
      attendance: 'Day School',
      classLevel: ''
    });
    setActionFeedback({
      type: 'info',
      message: 'Student editing cancelled.'
    });
  };

  const handleDeleteStudent = (id: string) => {
    const target = students.find(s => s.id === id);
    const targetName = target?.names || 'Student';
    setDeleteConfirmTarget({ id, name: targetName });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmTarget) return;
    const { id, name } = deleteConfirmTarget;

    const updatedList = students.filter(s => s.id !== id);
    setStudents(updatedList);
    try {
      localStorage.setItem('nkorera_student_roster', JSON.stringify(updatedList));
    } catch {}

    if (editingId === id) {
      handleCancelEdit();
    }
    setDeleteConfirmTarget(null);

    setActionFeedback({
      type: 'success',
      message: `${name} has been deleted successfully from the roster.`
    });

    // Instant Cloud Auto-Save
    setAutoSaveStatus('saving');
    isSavingLocallyRef.current = true;
    saveStudentRosterToFirestore({
      userEmail,
      schoolInfo,
      students: updatedList
    }).then(() => {
      setAutoSaveStatus('saved');
      setLastSyncedAt(new Date().toISOString());
    }).catch(err => {
      console.warn("Delete auto-save error:", err);
      setAutoSaveStatus('saved');
    }).finally(() => {
      setTimeout(() => {
        isSavingLocallyRef.current = false;
      }, 500);
    });
  };

  const handleClearRoster = () => {
    setShowClearConfirm(true);
  };

  const handleConfirmClearRoster = () => {
    setShowClearConfirm(false);
    setStudents([]);
    setEditingId(null);
    setPreviewPageIndex(0);
    try {
      localStorage.setItem('nkorera_student_roster', JSON.stringify([]));
    } catch {}

    setActionFeedback({
      type: 'info',
      message: 'All students have been cleared from the roster.'
    });

    // Instant Cloud Auto-Save
    setAutoSaveStatus('saving');
    isSavingLocallyRef.current = true;
    saveStudentRosterToFirestore({
      userEmail,
      schoolInfo,
      students: []
    }).then(() => {
      setAutoSaveStatus('saved');
      setLastSyncedAt(new Date().toISOString());
    }).catch(err => {
      console.warn("Clear roster auto-save error:", err);
      setAutoSaveStatus('saved');
    }).finally(() => {
      setTimeout(() => {
        isSavingLocallyRef.current = false;
      }, 500);
    });
  };

  const handleGenerateStudents = (count: number) => {
    const actualCount = Math.max(1, Math.min(300, Number(count) || 1));
    const surnames = [
        'NKUNDIMANA', 'UWIMANA', 'MUKAMANA', 'HARELIMANA', 'HABIMANA', 'MBONYINGABO', 'MUNYANEZA',
        'BIZIMANA', 'MANZI', 'RUKUNDO', 'IRADUKUNDA', 'UMUTONI', 'KEZA', 'GAKIRE', 'GAHIMA',
        'NDAYISABA', 'NSABIMANA', 'MUGABO', 'NIZEYIMANA', 'NGABONZIZA', 'MUTANGUHA', 'TUYISHIME',
        'KABERA', 'NGARAMBE', 'MUKASHEMA', 'RUTAYISIRE', 'SANO', 'MUGISHA', 'KANYAMIBWA', 'SHYAKA'
      ];
      const firstnames = [
        'Eric', 'Alice', 'Jean', 'Jean de Dieu', 'Pierre', 'Marie', 'Chantal', 'Claudine', 'Promise',
        'Ange', 'Yves', 'Claude', 'Theogene', 'Kevine', 'Aline', 'Patient', 'Pacifique', 'Christian',
        'Thierry', 'Divine', 'Ghislaine', 'Clementine', 'David', 'Moses', 'Solange', 'Diane', 'Joshua',
        'Gloria', 'Grace', 'Frank'
      ];
      const places = ['Kigali', 'Bugesera', 'Rwamagana', 'Musanze', 'Rubavu', 'Huye', 'Muhanga', 'Kicukiro', 'Gasabo', 'Gatsibo', 'Nyagatare'];
      const rwandanAddresses = [
        { district: 'Bugesera', sector: 'Mayange', cell: 'Mbyo', village: 'Gisenyi' },
        { district: 'Kicukiro', sector: 'Niboye', cell: 'Gatare', village: 'Niboye' },
        { district: 'Rwamagana', sector: 'Kigabiro', cell: 'Cyanya', village: 'Rwamagana' },
        { district: 'Musanze', sector: 'Muhoza', cell: 'Ruhengeri', village: 'Kigombe' },
        { district: 'Huye', sector: 'Ngoma', cell: 'Butare', village: 'Nyarugenge' },
        { district: 'Muhanga', sector: 'Nyamabuye', cell: 'Gitarama', village: 'Shyogwe' },
        { district: 'Gasabo', sector: 'Kimironko', cell: 'Kibagabaga', village: 'Nyagatovu' }
      ];
      const parentSurnames = ['HABIMANA', 'MUGABO', 'BIZIMANA', 'RUTAYISIRE', 'KABERA', 'GAKWAYA', 'NGARAMBE'];
      const fatherFirstnames = ['Claude', 'Jean Pierre', 'Paul', 'Augustin', 'Felicien', 'Theoneste', 'Charles'];
      const motherFirstnames = ['Chantal', 'Marie', 'Jeanne', 'Esperance', 'Beata', 'Colette', 'Ester'];

      const generated: StudentRecord[] = Array.from({ length: actualCount }, (_, i) => {
        const num = i + 1;
        const regNo = `STD-2026-${String(num).padStart(3, '0')}`;
        const gender = Math.random() > 0.5 ? 'M' : 'F';
        const sName = surnames[Math.floor(Math.random() * surnames.length)];
        const fName = firstnames[Math.floor(Math.random() * firstnames.length)];
        const names = `${sName} ${fName}`;
        
        const birthYear = 2008 + Math.floor(Math.random() * 4);
        const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const dob = `${birthYear}-${birthMonth}-${birthDay}`;
        const pob = places[Math.floor(Math.random() * places.length)];
        const dobPlace = `${birthDay}/${birthMonth}/${birthYear} - ${pob}`;
        
        const addr = rwandanAddresses[Math.floor(Math.random() * rwandanAddresses.length)];
        const residence = `${addr.district}, ${addr.sector}, ${addr.cell}, ${addr.village}`;
        
        const fSur = parentSurnames[Math.floor(Math.random() * parentSurnames.length)];
        const fFirst = fatherFirstnames[Math.floor(Math.random() * fatherFirstnames.length)];
        const fatherName = `${fSur} ${fFirst}`;
        const fatherPhone = `+250 788 ${String(Math.floor(Math.random() * 900000) + 100000)}`;

        const mSur = parentSurnames[Math.floor(Math.random() * parentSurnames.length)];
        const mFirst = motherFirstnames[Math.floor(Math.random() * motherFirstnames.length)];
        const motherName = `${mSur} ${mFirst}`;
        const motherPhone = `+250 785 ${String(Math.floor(Math.random() * 900000) + 100000)}`;

        const fatherId = `119${70 + Math.floor(Math.random() * 20)}800${Math.floor(Math.random() * 8999999) + 1000000}`;
        const motherId = `119${70 + Math.floor(Math.random() * 20)}700${Math.floor(Math.random() * 8999999) + 1000000}`;

        const classesList = ['Nursery 1', 'Nursery 2', 'Nursery 3', 'S3', 'S1', 'Primary 5', 'S2', 'S4 LKK', 'Primary 6', 'TTC Y1', 'TTC Y2', 'TTC Y3', 'TVET L1', 'TVET L2', 'TVET L3', 'TVET L4', 'TVET L5'];
        const classLevel = classesList[Math.floor(Math.random() * classesList.length)];

        return {
          id: `std-gen-${num}-${Date.now()}`,
          regNo,
          names,
          gender,
          dobPlace,
          dob,
          pob,
          residence,
          district: addr.district,
          sector: addr.sector,
          cell: addr.cell,
          village: addr.village,
          fatherName,
          fatherPhone,
          fatherId,
          motherName,
          motherPhone,
          motherId,
          guardianName: '-',
          guardianPhone: '-',
          attendance: Math.random() > 0.4 ? 'Day School' : 'Boarding School',
          classLevel
        };
      });

      setStudents(generated);
      setPreviewPageIndex(0);
      localStorage.setItem('nkorera_student_roster', JSON.stringify(generated));

      setActionFeedback({
        type: 'success',
        message: `${actualCount} sample student forms generated successfully!`
      });

      // Instant Cloud Auto-Save
      setAutoSaveStatus('saving');
      isSavingLocallyRef.current = true;
      saveStudentRosterToFirestore({
        userEmail,
        schoolInfo,
        students: generated
      }).then(() => {
        setAutoSaveStatus('saved');
        setLastSyncedAt(new Date().toISOString());
      }).catch(err => {
        console.warn("Generate roster auto-save error:", err);
        setAutoSaveStatus('saved');
      }).finally(() => {
        setTimeout(() => {
          isSavingLocallyRef.current = false;
        }, 500);
      });
  };

  const handleInitiateInstantPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!momoNumber.trim() || momoNumber.trim().length < 9) {
      alert("Please enter a valid phone number (e.g. 0781339530) to receive payment confirmation.");
      return;
    }

    const destNumber = paymentSim === 'Airtel' ? '0724038043' : '0781339530';
    const dialCode = `tel:*182*1*1*${destNumber}*500%23`;

    // Trigger phone's native dialer pre-filled with correct USSD sequence
    window.location.href = dialCode;

    // Show interactive simulated secure MoMo PIN input on screen
    setShowUssdModal(true);
    setUssdPin('');
  };

  const handleConfirmUssdPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const requiredLength = paymentSim === 'Airtel' ? 4 : 5;
    if (!ussdPin || ussdPin.trim().length !== requiredLength) {
      alert(`Please enter your ${requiredLength}-digit PIN to authorize payment.`);
      return;
    }

    setIsProcessingUssd(true);
    try {
      // Simulate network confirmation latency
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Unlock on Firestore
      await toggleStudentIdUnlockStatus(
        userEmail.trim().toLowerCase(),
        true,
        currentUser?.email || 'auto_verified_teacher'
      );

      setIsUnlockedByAdmin(true);
      setShowUssdModal(false);
      alert("✅ Payment of 500 RWF Approved! School Identification Forms are now unlocked successfully.");
    } catch (err) {
      console.error(err);
      alert("An error occurred during payment. Please try again or contact Nkundimana Theogene.");
    } finally {
      setIsProcessingUssd(false);
    }
  };

  const handleSendUnlockRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!momoNumber.trim()) {
      alert("Please enter the phone number used for payment.");
      return;
    }

    setIsSubmittingReq(true);
    try {
      await requestStudentIdUnlock(
        userEmail,
        currentUser?.name || 'Teacher',
        momoNumber,
        momoTxId
      );
      setReqSuccessMsg("Your unlock request has been sent to the Admin (Nkundimana Theogene) successfully! The Admin will unlock access after verifying the payment of 500 RWF.");
      setShowReqForm(false);
    } catch (err) {
      console.error("Unlock request failed:", err);
      alert("The request could not be sent. Please contact the Admin at 0781339530 (Nkundimana Theogene).");
    } finally {
      setIsSubmittingReq(false);
    }
  };

  const handleAdminToggleUnlock = async () => {
    if (!isAdmin) return;
    setIsTogglingAdmin(true);
    try {
      const target = adminTargetEmail.trim().toLowerCase();
      const newUnlockedState = !isUnlockedByAdmin;
      await toggleStudentIdUnlockStatus(
        target,
        newUnlockedState,
        currentUser?.email || 'nkundimana123theogene@gmail.com'
      );
      setIsUnlockedByAdmin(newUnlockedState);
      alert(newUnlockedState
        ? `✅ School Identification Forms UNLOCKED for ${target}!`
        : `🔒 School Identification Forms LOCKED for ${target}!`
      );
    } catch (err) {
      console.error(err);
      alert("Error toggling unlock state.");
    } finally {
      setIsTogglingAdmin(false);
    }
  };

  const handleDownloadBatchPDF = async () => {
    if (!isPaid) {
      alert("ADMIN UNLOCK REQUIRED!\n\nTHE ADMIN IS THE ONLY ONE WITH PERMISSION TO UNLOCK THE STUDENT IDENTIFICATION FORMS ONCE YOU HAVE PAID 500 RWF.\n\nIf you have already paid, please send your request to the Admin (Nkundimana Theogene - 0781339530) to unlock it for you immediately.");
      setShowReqForm(true);
      return;
    }

    if (students.length === 0) {
      alert("No students are on the roster. Please add students first to generate the Batch PDF.");
      return;
    }

    setIsDownloading(true);

    try {
      // High-speed native vector PDF export (< 1 second even for 100+ students)
      await exportStudentIdentificationRosterToPdf(sortedStudents, {
        schoolName: schoolInfo.schoolName || 'GS MAYANGE B',
        academicYear: schoolInfo.academicYear || `${new Date().getFullYear()}`,
        classCombo: schoolInfo.classCombo || 'All'
      });
    } catch (error) {
      console.warn('Vector PDF export fallback, attempting html2pdf:', error);
      try {
        const element = document.getElementById('student-id-pdf-content');
        if (element) {
          const html2pdf = (await import('html2pdf.js')).default;
          const fileName = `Student_Identification_Forms_${(schoolInfo.classCombo || 'Class').replace(/\s+/g, '_')}_${(schoolInfo.schoolName || 'School').replace(/\s+/g, '_')}.pdf`;
          const opt = {
            margin: [0, 0, 0, 0] as [number, number, number, number],
            filename: fileName,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              logging: false,
              windowWidth: 794,
              scrollX: 0,
              scrollY: 0,
              onclone: (clonedDoc: Document) => {
                sanitizeClonedDocForPdf(clonedDoc);
              }
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
            pagebreak: { mode: ['css', 'legacy'], after: '.student-id-page-card' }
          };
          await html2pdf().set(opt).from(element).save();
        } else {
          window.print();
        }
      } catch (fallbackError) {
        console.error('Fallback export failed:', fallbackError);
        window.print();
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadSingleStudentPDF = async (st: StudentRecord, index: number) => {
    if (!isPaid) {
      alert("ADMIN UNLOCK REQUIRED!\n\nTHE ADMIN IS THE ONLY ONE WITH PERMISSION TO UNLOCK THE STUDENT IDENTIFICATION FORMS ONCE YOU HAVE PAID 500 RWF.\n\nIf you have already paid, please send your request to the Admin (Nkundimana Theogene - 0781339530) to unlock it for you immediately.");
      setShowReqForm(true);
      return;
    }

    setIsDownloading(true);

    try {
      // High-speed single student vector PDF (< 100ms)
      await exportSingleStudentIdToPdf(st, {
        schoolName: schoolInfo.schoolName || 'GS MAYANGE B',
        academicYear: schoolInfo.academicYear || `${new Date().getFullYear()}`,
        classCombo: schoolInfo.classCombo || 'All'
      }, index, sortedStudents.length);
    } catch (error) {
      console.warn('Vector single PDF fallback, attempting html2pdf:', error);
      try {
        const element = document.getElementById(`student-card-preview-${st.id || index}`);
        if (element) {
          const html2pdf = (await import('html2pdf.js')).default;
          const cleanName = (st.names || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
          const fileName = `Student_ID_Form_${cleanName}_${st.regNo || 'Record'}.pdf`;
          const opt = {
            margin: [0, 0, 0, 0] as [number, number, number, number],
            filename: fileName,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              logging: false,
              windowWidth: 794,
              scrollX: 0,
              scrollY: 0,
              onclone: (clonedDoc: Document) => {
                sanitizeClonedDocForPdf(clonedDoc);
              }
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
          };
          await html2pdf().set(opt).from(element).save();
        } else {
          window.print();
        }
      } catch (fallbackError) {
        console.error('Single student fallback failed:', fallbackError);
        window.print();
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!isPaid) {
      alert("ADMIN UNLOCK REQUIRED!\n\nTHE ADMIN IS THE ONLY ONE WITH PERMISSION TO UNLOCK THE STUDENT IDENTIFICATION FORMS ONCE YOU HAVE PAID 500 RWF.\n\nIf you have already paid, please send your request to the Admin (0781339530).");
      setShowReqForm(true);
      return;
    }
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="main-student-id-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[94vh]"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <span>School Identification Forms (Batch Roster)</span>
                  </h2>
                  {isPaid ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                      <Unlock className="w-3 h-3" /> UNLOCKED BY ADMIN
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> REQUIRES ADMIN UNLOCK
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Enter student profiles to batch generate their identification forms (A4 Layout)</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ADMIN SPECIAL CONTROLS BAR (If Admin) */}
            {isAdmin && (
              <div className="px-5 py-3 bg-emerald-950/60 border-b border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>👑 Admin Controls: Manage Teacher Unlock Permission</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={adminTargetEmail}
                    onChange={(e) => setAdminTargetEmail(e.target.value)}
                    placeholder="Teacher Email to Unlock"
                    className="p-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none w-48 font-mono"
                  />
                  <button
                    onClick={handleAdminToggleUnlock}
                    disabled={isTogglingAdmin}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      isUnlockedByAdmin
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    }`}
                  >
                    {isTogglingAdmin ? 'Updating...' : isUnlockedByAdmin ? '🔒 Lock Access' : '🔓 Grant Admin Unlock'}
                  </button>
                </div>
              </div>
            )}

            {/* Sub Nav Tabs & Cloud Sync */}
            <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveTab('roster')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'roster'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>1. Student Roster ({students.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'preview'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>2. Preview Batch Forms ({students.length} Pages)</span>
                </button>

                {/* Clean Auto-Save Indicator (No 'birabitswe', No 'kuzana') */}
                <div className="flex items-center gap-2 text-[11px] bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${autoSaveStatus === 'saving' ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${autoSaveStatus === 'saving' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                    </span>
                    <span className={autoSaveStatus === 'saving' ? 'text-amber-300 font-semibold' : 'text-emerald-400 font-semibold'}>
                      {autoSaveStatus === 'saving'
                        ? 'Auto-saving...'
                        : 'Auto-Save'}
                    </span>
                    {lastSyncedAt && (
                      <span className="text-[10px] text-slate-400 hidden sm:inline">
                        ({new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleManualCloudSync(true)}
                    disabled={isCloudSyncing}
                    title="Sync latest roster data with Cloud"
                    className="text-slate-300 hover:text-emerald-400 transition-colors p-1 ml-1 cursor-pointer flex items-center gap-1 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-700 hover:border-emerald-500/50 shadow-sm"
                  >
                    <RotateCw className={`w-3 h-3 ${isCloudSyncing ? 'animate-spin text-emerald-400' : ''}`} />
                    <span>{isCloudSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
                  </button>
                </div>
              </div>

              {/* Request Admin Unlock Banner for regular teachers */}
              {!isPaid && (
                <button
                  onClick={() => setShowReqForm(!showReqForm)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>{showReqForm ? 'Close Request' : 'Request Admin Unlock (500 RWF)'}</span>
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {/* MANDATORY ADMIN APPROVAL BANNER FOR UNPAID TEACHERS */}
              {!isPaid && (
                <div className="p-4 bg-slate-900 border-2 border-amber-500/30 rounded-2xl space-y-4 shadow-xl">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-200 space-y-1.5">
                      <p className="font-black text-amber-400 uppercase tracking-wide text-sm">
                        UNLOCK STUDENT IDENTIFICATION FORMS
                      </p>
                      <p className="text-slate-300 leading-relaxed">
                        Downloading and printing batch identification forms for all students requires a fee of <strong className="text-white">500 RWF</strong> to <strong className="text-amber-400">Nkundimana Theogene (0781339530)</strong>.
                      </p>
                    </div>
                  </div>

                  {/* PAYMENT TYPE / SIM CARD SELECTOR */}
                  <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-800 space-y-3.5">
                    <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Option 1: Instant Mobile Money Unlock</div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentSim('MTN')}
                        className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                          paymentSim === 'MTN'
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850'
                        }`}
                      >
                        MTN MoMo
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentSim('Airtel')}
                        className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                          paymentSim === 'Airtel'
                            ? 'bg-rose-500 text-white border-rose-400 font-black shadow-md'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850'
                        }`}
                      >
                        Airtel Money
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase">Your Mobile Number (MoMo Phone):</label>
                      <input
                        type="text"
                        value={momoNumber}
                        onChange={(e) => setMomoNumber(e.target.value)}
                        placeholder="0781339530"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleInitiateInstantPayment}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <Send className="w-4 h-4 text-slate-950" />
                      <span>Pay 500 RWF Instantly &rarr;</span>
                    </button>
                  </div>

                  {/* OPTION 2: MANUAL TRANSFER / VERIFICATION */}
                  <div className="border-t border-slate-850 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowReqForm(!showReqForm)}
                      className="w-full text-slate-400 hover:text-white text-xs font-black flex items-center justify-between transition-colors px-1"
                    >
                      <span>Option 2: Manual Transfer & Send Request to Admin</span>
                      <span className="text-amber-500">{showReqForm ? 'Close ▴' : 'Open ▾'}</span>
                    </button>

                    {showReqForm && (
                      <form onSubmit={handleSendUnlockRequest} className="mt-3 bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">MoMo Phone Number</label>
                            <input
                              type="text"
                              value={momoNumber}
                              onChange={(e) => setMomoNumber(e.target.value)}
                              placeholder="078..."
                              required
                              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">Tx ID / Message Proof (Optional)</label>
                            <input
                              type="text"
                              value={momoTxId}
                              onChange={(e) => setMomoTxId(e.target.value)}
                              placeholder="e.g. 3892182091"
                              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        {reqSuccessMsg && (
                          <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-xs text-emerald-200">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <span>{reqSuccessMsg}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isSubmittingReq}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                        >
                          {isSubmittingReq ? (
                            <>
                              <Sparkles className="w-4 h-4 animate-spin" />
                              <span>Sending to Admin...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Submit Request to Admin</span>
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'roster' ? (
                /* TAB 1: CLASS SETTINGS & ROSTER MANAGEMENT */
                <div className="space-y-6">
                  {/* General School & Class Header */}
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                    <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4" /> School & Class Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">School Name</label>
                        <input
                          value={schoolInfo.schoolName}
                          onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolName: e.target.value })}
                          placeholder="e.g. GS MAYANGE B"
                          className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none font-bold"
                        />
                      </div>
                      <div className="relative">
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Academic Year</label>
                        <div 
                          onClick={() => setShowAcademicYearPicker(!showAcademicYearPicker)}
                          className="flex items-center justify-between p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs cursor-pointer hover:border-emerald-500 transition-colors focus:border-emerald-500 outline-none select-none"
                        >
                          <span className="font-bold">{schoolInfo.academicYear || 'Select Year'}</span>
                          <Calendar className="w-4 h-4 text-emerald-400" />
                        </div>

                        <AnimatePresence>
                          {showAcademicYearPicker && (
                            <motion.div
                              key="academic-year-picker-dropdown"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute left-0 right-0 sm:left-auto sm:right-0 sm:w-80 mt-2 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 space-y-3"
                            >
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setShowAcademicYearPicker(false)}
                              />
                              
                              <div className="relative z-50 space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-emerald-400" />
                                    <h4 className="text-[11px] font-black uppercase text-slate-200 tracking-wider">School Calendar Picker</h4>
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={() => setShowAcademicYearPicker(false)}
                                    className="text-slate-400 hover:text-white text-[10px]"
                                  >
                                    Close
                                  </button>
                                </div>

                                <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const parts = schoolInfo.academicYear.split('-');
                                      if (parts.length === 2) {
                                        const start = parseInt(parts[0], 10) - 1;
                                        const end = parseInt(parts[1], 10) - 1;
                                        const val = `${start}-${end}`;
                                        setSchoolInfo({ ...schoolInfo, academicYear: val });
                                        localStorage.setItem('nkorera_school_info', JSON.stringify({ ...schoolInfo, academicYear: val }));
                                      } else {
                                        setSchoolInfo({ ...schoolInfo, academicYear: '2024-2025' });
                                      }
                                    }}
                                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                  </button>
                                  <span className="text-xs font-black text-emerald-400">{schoolInfo.academicYear}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const parts = schoolInfo.academicYear.split('-');
                                      if (parts.length === 2) {
                                        const start = parseInt(parts[0], 10) + 1;
                                        const end = parseInt(parts[1], 10) + 1;
                                        const val = `${start}-${end}`;
                                        setSchoolInfo({ ...schoolInfo, academicYear: val });
                                        localStorage.setItem('nkorera_school_info', JSON.stringify({ ...schoolInfo, academicYear: val }));
                                      } else {
                                        setSchoolInfo({ ...schoolInfo, academicYear: '2026-2027' });
                                      }
                                    }}
                                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="space-y-1.5">
                                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Quick Academic Years</span>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {['2023-2024', '2024-2025', '2025-2026', '2026-2027', '2027-2028', '2028-2029'].map((yr) => (
                                      <button
                                        key={yr}
                                        type="button"
                                        onClick={() => {
                                          setSchoolInfo({ ...schoolInfo, academicYear: yr });
                                          localStorage.setItem('nkorera_school_info', JSON.stringify({ ...schoolInfo, academicYear: yr }));
                                          setShowAcademicYearPicker(false);
                                        }}
                                        className={`p-2 rounded-xl text-center text-[11px] font-bold transition-all ${
                                          schoolInfo.academicYear === yr
                                            ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                                        }`}
                                      >
                                        {yr}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Standard Rwanda Terms</span>
                                  <div className="space-y-1 text-[10px]">
                                    <div className="flex justify-between text-slate-400 border-b border-slate-900/60 pb-1">
                                      <span className="font-semibold text-slate-300">Term 1:</span>
                                      <span>Sept - Dec ({schoolInfo.academicYear.split('-')[0] || ''})</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400 border-b border-slate-900/60 pb-1">
                                      <span className="font-semibold text-slate-300">Term 2:</span>
                                      <span>Jan - Apr ({schoolInfo.academicYear.split('-')[1] || ''})</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                      <span className="font-semibold text-slate-300">Term 3:</span>
                                      <span>Apr - Jul ({schoolInfo.academicYear.split('-')[1] || ''})</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Class & Combo</label>
                        <input
                          value={schoolInfo.classCombo}
                          onChange={(e) => setSchoolInfo({ ...schoolInfo, classCombo: e.target.value })}
                          placeholder="e.g. S3 or Primary 5"
                          className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Feedback Banner */}
                  {actionFeedback && (
                    <div className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between gap-2 shadow-lg transition-all animate-in fade-in ${
                      actionFeedback.type === 'success'
                        ? 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-300'
                        : actionFeedback.type === 'error'
                        ? 'bg-red-950/90 border border-red-500/50 text-red-300'
                        : 'bg-cyan-950/90 border border-cyan-500/50 text-cyan-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{actionFeedback.message}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActionFeedback(null)}
                        className="text-slate-400 hover:text-white text-xs cursor-pointer p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Add / Edit Student Form */}
                  <form
                    ref={formRef}
                    onSubmit={handleSaveStudent}
                    className={`p-4 bg-slate-950/80 border rounded-2xl space-y-4 transition-all duration-300 ${
                      editingId
                        ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-slate-950/95 shadow-xl shadow-cyan-950/40'
                        : 'border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
                        {editingId ? <Edit3 className="w-4 h-4 text-cyan-400" /> : <User className="w-4 h-4 text-emerald-400" />}
                        <span className={editingId ? 'text-cyan-300' : 'text-emerald-400'}>
                          {editingId ? "Edit Student Details" : "Student Form Details"}
                        </span>
                      </h3>
                      {editingId && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline font-bold cursor-pointer flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>

                    {editingId && (
                      <div className="p-3 bg-cyan-950/70 border border-cyan-500/40 rounded-xl flex items-center justify-between gap-3 text-cyan-200">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
                            <Edit3 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">
                              Editing Student: <span className="text-cyan-300 underline font-black">{currentStudent.names || 'Student'}</span>
                              {currentStudent.regNo && <span className="font-mono text-cyan-400 text-[11px] ml-1.5">({currentStudent.regNo})</span>}
                            </p>
                            <p className="text-[10px] text-cyan-400 font-medium">
                              Update the student details below and click &quot;Save Student Changes&quot;.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 border border-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 flex items-center justify-between">
                          <span>Student ID / Reg No</span>
                          <span className="text-[9px] px-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md font-mono">Auto</span>
                        </label>
                        <div className="relative flex items-center">
                          <input
                            name="regNo"
                            value={currentStudent.regNo}
                            readOnly
                            placeholder="e.g. STD-2026-001"
                            className="w-full p-2 pr-8 bg-slate-900/60 border border-slate-800 rounded-xl text-emerald-400 font-bold text-xs outline-none font-mono cursor-not-allowed select-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentStudent(prev => ({
                                ...prev,
                                regNo: getNextRegNo()
                              }));
                            }}
                            title="Regenerate next Registration Number"
                            className="absolute right-2 text-slate-500 hover:text-emerald-400 transition-colors p-1 rounded-md hover:bg-slate-800"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Full Student Names</label>
                        <input
                          name="names"
                          value={currentStudent.names}
                          onChange={handleStudentInputChange}
                          placeholder="e.g. UWIMANA Alice"
                          required
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Gender</label>
                        <select
                          name="gender"
                          value={currentStudent.gender}
                          onChange={handleStudentInputChange}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none"
                        >
                          <option value="F">Female</option>
                          <option value="M">Male</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Date Of Birth</label>
                        <input
                          type="date"
                          name="dob"
                          value={currentStudent.dob || ''}
                          onChange={handleStudentInputChange}
                          required
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Place Of Birth</label>
                        <select
                          name="pob"
                          value={currentStudent.pob || ''}
                          onChange={handleStudentInputChange}
                          required
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none"
                        >
                          <option value="">-- Choose District --</option>
                          {ALL_RWANDA_DISTRICTS.map(dist => (
                            <option key={dist} value={dist}>{dist}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Province</label>
                        <select
                          name="province"
                          value={currentStudent.province || ''}
                          onChange={handleStudentInputChange}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none"
                        >
                          <option value="">-- Choose Province --</option>
                          {Object.keys(RWANDA_PROVINCES).map(prov => (
                            <option key={prov} value={prov}>{prov}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">District</label>
                        <select
                          name="district"
                          value={currentStudent.district || ''}
                          onChange={handleStudentInputChange}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none"
                        >
                          <option value="">-- Choose District --</option>
                          {currentStudent.province ? (
                            RWANDA_PROVINCES[currentStudent.province].map(dist => (
                              <option key={dist} value={dist}>{dist}</option>
                            ))
                          ) : (
                            Object.entries(RWANDA_PROVINCES).map(([prov, dists]) => (
                              <optgroup key={prov} label={prov}>
                                {dists.map(dist => (
                                  <option key={dist} value={dist}>{dist}</option>
                                ))}
                              </optgroup>
                            ))
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Sector</label>
                        <select
                          name="sector"
                          value={currentStudent.sector || ''}
                          onChange={handleStudentInputChange}
                          disabled={!currentStudent.district}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none disabled:opacity-50"
                        >
                          <option value="">-- Choose Sector --</option>
                          {currentStudent.district && getSectorsForDistrict(currentStudent.district, currentStudent.province).map(sect => (
                            <option key={sect} value={sect}>{sect}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[10px] font-bold text-slate-400">Cell</label>
                        </div>
                        <select
                          name="cell"
                          value={currentStudent.cell || ''}
                          onChange={handleStudentInputChange}
                          disabled={!currentStudent.sector}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none disabled:opacity-50"
                        >
                          <option value="">-- Choose Cell --</option>
                          {currentStudent.sector && getCommonCellsForSector(currentStudent.sector, currentStudent.province, currentStudent.district).map(cl => (
                            <option key={cl} value={cl}>{cl}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[10px] font-bold text-slate-400">Village</label>
                        </div>
                        <select
                          name="village"
                          value={currentStudent.village || ''}
                          onChange={handleStudentInputChange}
                          disabled={!currentStudent.cell}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none disabled:opacity-50"
                        >
                          <option value="">-- Choose Village --</option>
                          {currentStudent.cell && getCommonVillagesForCell(currentStudent.cell, currentStudent.province, currentStudent.district, currentStudent.sector).map(v => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Father's Name & Phone</label>
                        <div className="flex gap-1.5">
                          <input
                            name="fatherName"
                            value={currentStudent.fatherName}
                            onChange={handleStudentInputChange}
                            placeholder="Father's Name"
                            className="w-1/2 p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs outline-none"
                          />
                          <input
                            name="fatherPhone"
                            value={currentStudent.fatherPhone}
                            onChange={handleStudentInputChange}
                            placeholder="Phone"
                            className="w-1/2 p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs outline-none"
                          />
                        </div>
                        <input
                          name="fatherId"
                          value={currentStudent.fatherId || ''}
                          onChange={handleStudentInputChange}
                          placeholder="Father's National ID (Optional)"
                          className="w-full mt-1.5 p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Mother's Name & Phone</label>
                        <div className="flex gap-1.5">
                          <input
                            name="motherName"
                            value={currentStudent.motherName}
                            onChange={handleStudentInputChange}
                            placeholder="Mother's Name"
                            className="w-1/2 p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs outline-none"
                          />
                          <input
                            name="motherPhone"
                            value={currentStudent.motherPhone}
                            onChange={handleStudentInputChange}
                            placeholder="Phone"
                            className="w-1/2 p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs outline-none"
                          />
                        </div>
                        <input
                          name="motherId"
                          value={currentStudent.motherId || ''}
                          onChange={handleStudentInputChange}
                          placeholder="Mother's National ID (Optional)"
                          className="w-full mt-1.5 p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Attendance Mode</label>
                        <select
                          name="attendance"
                          value={currentStudent.attendance}
                          onChange={handleStudentInputChange}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none"
                        >
                          <option value="Day">Day School</option>
                          <option value="Boarding">Boarding School</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Class / Level (Optional)</label>
                        <select
                          value={isCustomClassActive ? 'custom' : (currentStudent.classLevel || '')}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'custom') {
                              setIsCustomClassActive(true);
                              setCurrentStudent(prev => ({
                                ...prev,
                                classLevel: (prev.classLevel && !COMMON_CLASSES.includes(prev.classLevel)) ? prev.classLevel : ''
                              }));
                            } else {
                              setIsCustomClassActive(false);
                              setCurrentStudent(prev => ({ ...prev, classLevel: val }));
                            }
                          }}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 outline-none font-bold cursor-pointer"
                        >
                          <option value="">-- Select Class --</option>
                          {COMMON_CLASSES.map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                          ))}
                          <option value="custom">Other Class (Custom Class)...</option>
                        </select>

                        {isCustomClassActive && (
                          <div className="mt-1.5">
                            <input
                              type="text"
                              name="classLevel"
                              value={currentStudent.classLevel || ''}
                              onChange={handleStudentInputChange}
                              placeholder="e.g. S4 HEG, Primary 6 B"
                              autoFocus
                              className="w-full p-2 bg-slate-850 border border-emerald-500/40 rounded-xl text-white text-xs focus:border-emerald-400 outline-none font-bold"
                            />
                            <p className="text-[9px] text-slate-400 mt-0.5">Enter class name here.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={`w-full py-3 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                        editingId
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/50 ring-2 ring-cyan-400'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                      }`}
                    >
                      {editingId ? <CheckCircle2 className="w-4 h-4 text-cyan-200" /> : <Plus className="w-4 h-4 text-emerald-200" />}
                      <span>{editingId ? "Save Student Changes" : "Save Student to Roster"}</span>
                    </button>

                    {/* Auto-Save indicator */}
                    <div className="flex items-center justify-center gap-1.5 py-1 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Changes are saved automatically in real-time (Auto-Save)</span>
                    </div>

                    {/* Add New Student Button */}
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-950/40 border border-blue-500/40"
                    >
                      <Plus className="w-4 h-4 text-blue-100" />
                      <span>{editingId ? "Cancel & Add New Student" : "Add New Student"}</span>
                    </button>

                    {/* Generate Students Button */}
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Number of Students to Generate:</span>
                      </div>
                      
                      <div className="flex gap-2">
                        {/* Improved Qty Selector with Plus and Minus Buttons */}
                        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-1.5 py-1 text-slate-300 w-1/2 justify-between">
                          <button
                            type="button"
                            onClick={() => setDemoQuantity(prev => Math.max(1, prev - 1))}
                            className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer font-bold border border-slate-700 text-sm"
                            title="Decrease by 1"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          
                          <input
                            type="number"
                            value={demoQuantity}
                            onChange={(e) => {
                              const rawVal = e.target.value;
                              if (rawVal === '') {
                                setDemoQuantity('' as any);
                                return;
                              }
                              const parsed = parseInt(rawVal);
                              if (!isNaN(parsed)) {
                                setDemoQuantity(Math.min(300, parsed));
                              }
                            }}
                            className="w-12 bg-transparent text-center text-sm font-black text-amber-300 outline-none"
                            min="1"
                            max="300"
                          />
                          
                          <button
                            type="button"
                            onClick={() => setDemoQuantity(prev => Math.min(300, prev + 1))}
                            className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer font-bold border border-slate-700 text-sm"
                            title="Increase by 1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Presets shortcut buttons like +10 and -10 */}
                        <div className="flex gap-1.5 w-1/2">
                          <button
                            type="button"
                            onClick={() => setDemoQuantity(prev => Math.min(300, prev + 10))}
                            className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-[10px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                            title="Add 10"
                          >
                            +10
                          </button>
                          <button
                            type="button"
                            onClick={() => setDemoQuantity(prev => Math.max(1, prev - 10))}
                            className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-[10px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                            title="Subtract 10"
                          >
                            -10
                          </button>
                        </div>
                      </div>

                      {/* Sparkles Action Button */}
                      <button
                        type="button"
                        onClick={() => handleGenerateStudents(demoQuantity)}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        title={`Generate ${demoQuantity} demo students`}
                      >
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>Generate {demoQuantity} Students Forms</span>
                      </button>
                    </div>
                  </form>

                  {/* Student Roster Table */}
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                          2. Class Student Roster ({students.length} Students)
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Manage your class list individually or generate sample student records in bulk.
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={handleRestoreSampleStudents}
                          disabled={isCloudSyncing}
                          className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                          title="Zana abanyeshuri 3 b'icyitegererezo (Restore 3 sample students)"
                        >
                          <RotateCw className="w-3 h-3 text-emerald-400" />
                          <span>Zana Abanyeshuri 3</span>
                        </button>
                        {/* Sort Selector Control */}
                        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-slate-300">
                          <span className="text-[9px] font-bold text-slate-400 mr-2 uppercase tracking-wide">
                            Sort:
                          </span>
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-transparent text-xs font-bold text-emerald-400 outline-none cursor-pointer"
                          >
                            <option value="none" className="bg-slate-950 text-slate-300">Default</option>
                            <option value="name_asc" className="bg-slate-950 text-slate-300">Names: A &rarr; Z</option>
                            <option value="name_desc" className="bg-slate-950 text-slate-300">Names: Z &rarr; A</option>
                            <option value="index_asc" className="bg-slate-950 text-slate-300">Index: Low &rarr; High</option>
                            <option value="index_desc" className="bg-slate-950 text-slate-300">Index: High &rarr; Low</option>
                          </select>
                        </div>

                        {/* Filter by Class/Level Control */}
                        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-slate-300">
                          <span className="text-[9px] font-bold text-slate-400 mr-2 uppercase tracking-wide">
                            Class/Level:
                          </span>
                          <select
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                            className="bg-transparent text-xs font-bold text-cyan-400 outline-none cursor-pointer"
                          >
                            {uniqueClasses.map(cls => (
                              <option key={cls} value={cls} className="bg-slate-950 text-slate-300">
                                {cls}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity Selector Control */}
                        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-slate-300">
                          <span className="text-[9px] font-bold text-slate-400 mr-2 uppercase tracking-wide">
                            Forms:
                          </span>
                          <input
                            type="number"
                            value={demoQuantity}
                            onChange={(e) => {
                              const rawVal = e.target.value;
                              if (rawVal === '') {
                                setDemoQuantity('' as any);
                                return;
                              }
                              const parsed = parseInt(rawVal);
                              if (!isNaN(parsed)) {
                                setDemoQuantity(Math.min(300, parsed));
                              }
                            }}
                            className="w-10 bg-transparent text-center text-xs font-bold text-amber-300 outline-none border-b border-slate-700 focus:border-amber-400"
                            min="1"
                            max="300"
                          />
                          <div className="flex gap-1 ml-2">
                            <button
                              type="button"
                              onClick={() => setDemoQuantity(prev => Math.min(300, prev + 10))}
                              className="text-[9px] hover:bg-slate-700 text-slate-300 px-1 py-0.5 bg-slate-800 rounded font-bold cursor-pointer"
                              title="+10"
                            >
                              +10
                            </button>
                            <button
                              type="button"
                              onClick={() => setDemoQuantity(prev => Math.max(1, prev - 10))}
                              className="text-[9px] hover:bg-slate-700 text-slate-300 px-1 py-0.5 bg-slate-800 rounded font-bold cursor-pointer"
                              title="-10"
                            >
                              -10
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleGenerateStudents(demoQuantity)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-[11px] transition-all flex items-center gap-1 cursor-pointer shadow-md"
                          title={`Generate ${demoQuantity} demo students`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate {demoQuantity} Forms</span>
                        </button>
                        
                        {students.length > 0 && (
                          <>
                            <button
                              type="button"
                              onClick={handleClearRoster}
                              className="px-3 py-1.5 bg-red-950/30 hover:bg-red-900/40 border border-red-900/30 text-red-400 font-bold rounded-xl text-[11px] transition-all cursor-pointer"
                            >
                              Clear All Roster
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewPageIndex(0);
                                setActiveTab('preview');
                              }}
                              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1"
                            >
                              <span>Generate All Forms</span>
                              <span>&rarr;</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {students.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                        No students are on the roster. Fill out the form above and click &quot;Save Student to Roster&quot;.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left text-xs text-slate-300">
                          <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
                            <tr>
                              <th className="p-2.5">Reg No</th>
                              <th className="p-2.5">Names</th>
                              <th className="p-2.5">Gender</th>
                              <th className="p-2.5">DOB / Residence</th>
                              <th className="p-2.5">Attendance</th>
                              <th className="p-2.5">Class/Level</th>
                              <th className="p-2.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                            {sortedStudents.map((st) => {
                              const isEditingThis = editingId === st.id;
                              return (
                                <tr
                                  key={st.id}
                                  className={`transition-colors ${
                                    isEditingThis
                                      ? 'bg-cyan-950/40 border-l-4 border-l-cyan-400 text-white'
                                      : 'hover:bg-slate-900/60'
                                  }`}
                                >
                                  <td className="p-2.5 font-mono text-emerald-300 font-bold">{st.regNo || '-'}</td>
                                  <td className="p-2.5 font-bold text-white">
                                    <div className="flex items-center gap-2">
                                      <span>{st.names}</span>
                                      {isEditingThis && (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                          Editing
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-2.5">{st.gender}</td>
                                  <td className="p-2.5 text-[11px] text-slate-400">{st.dobPlace || st.residence || '-'}</td>
                                  <td className="p-2.5 text-[11px] text-slate-400">{st.attendance}</td>
                                  <td className="p-2.5 text-[11px] text-cyan-300 font-bold">{st.classLevel || 'Unassigned'}</td>
                                  <td className="p-2.5 text-right space-x-1.5 whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => openEditModal(st)}
                                      className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-950 hover:border-cyan-500 text-cyan-300 border border-slate-700 rounded-lg transition-colors cursor-pointer text-[10px] font-bold inline-flex items-center gap-1"
                                      title="Edit this student record in a beautiful popup modal"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteStudent(st.id)}
                                      className="px-2.5 py-1 bg-slate-800 hover:bg-red-950 hover:border-red-500 text-red-400 border border-slate-700 rounded-lg transition-colors cursor-pointer text-[10px] font-bold inline-flex items-center gap-1"
                                      title="Delete this student from roster"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>Delete</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* TAB 2: PRINTABLE BATCH PDF PREVIEW CONTAINER */
                <div className="space-y-4">
                  {/* PRINT-ONLY EMBEDDED STYLES FOR THE MODAL PRINT OVERRIDE */}
                  <style dangerouslySetInnerHTML={{ __html: `
                    @media screen {
                      .student-id-pdf-wrapper {
                        position: absolute !important;
                        left: -9999px !important;
                        top: 0 !important;
                        width: 210mm !important;
                        opacity: 0 !important;
                        pointer-events: none !important;
                      }
                    }
                    @media print {
                      @page {
                        size: A4 portrait;
                        margin: 0mm !important;
                      }
                      /* Hide everything except the print container */
                      body * {
                        visibility: hidden !important;
                      }
                      .student-id-pdf-wrapper, .student-id-pdf-wrapper * {
                        visibility: visible !important;
                      }
                      .student-id-pdf-wrapper {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 210mm !important;
                        max-width: 210mm !important;
                        opacity: 1 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                      }
                      .student-id-page-card {
                        visibility: visible !important;
                        position: relative !important;
                        width: 210mm !important;
                        min-height: 297mm !important;
                        max-height: 297mm !important;
                        box-sizing: border-box !important;
                        padding: 10mm 12mm !important;
                        margin: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                        page-break-after: always !important;
                        break-after: page !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        background: #ffffff !important;
                        overflow: hidden !important;
                      }
                      * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                      }
                    }
                  `}} />

                  {/* SCREEN PREVIEW HEADER: SEARCH & HIGH-PERFORMANCE PAGINATION */}
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Search & Page Controls
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Preview each identification form here. Downloading will export the full roster of {sortedStudents.length} students at once.
                        </p>
                      </div>

                      {/* Info Badge */}
                      <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        <span>Ready for {sortedStudents.length} Pages Batch PDF</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      {/* Search Bar */}
                      <div className="md:col-span-5 relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={previewSearch}
                          onChange={(e) => {
                            setPreviewSearch(e.target.value);
                            setPreviewPageIndex(0);
                          }}
                          placeholder="Search by Student Name or Reg No..."
                          className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>

                      {/* Page selector dropdown */}
                      <div className="md:col-span-3">
                        <select
                          value={previewPageIndex}
                          onChange={(e) => setPreviewPageIndex(Number(e.target.value))}
                          disabled={sortedStudents.length === 0}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-medium cursor-pointer"
                        >
                          {sortedStudents.length === 0 ? (
                            <option value={0}>No students found</option>
                          ) : (
                            sortedStudents
                              .map((st, idx) => ({ st, idx }))
                              .filter(({ st }) => {
                                const term = previewSearch.trim().toLowerCase();
                                if (!term) return true;
                                return (
                                  st.names.toLowerCase().includes(term) ||
                                  (st.regNo && st.regNo.toLowerCase().includes(term))
                                );
                              })
                              .map(({ st, idx }, filteredIdx) => (
                                <option key={st.id || idx} value={idx}>
                                  {filteredIdx + 1}. {st.names.substring(0, 24)} {st.regNo ? `(${st.regNo})` : ''}
                                </option>
                              ))
                          )}
                        </select>
                      </div>

                      {/* Pagination Controls */}
                      <div className="md:col-span-4 flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewPageIndex(0)}
                          disabled={previewPageIndex === 0 || sortedStudents.length === 0}
                          className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 disabled:hover:bg-slate-900 rounded-xl border border-slate-800 transition-all cursor-pointer"
                          title="First Page"
                        >
                          <ChevronsLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewPageIndex(prev => Math.max(0, prev - 1))}
                          disabled={previewPageIndex === 0 || sortedStudents.length === 0}
                          className="p-2 px-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 disabled:hover:bg-slate-900 rounded-xl border border-slate-800 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                          title="Previous Page"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Previous</span>
                        </button>

                        <span className="text-[11px] font-mono font-bold text-slate-400 px-2 min-w-[70px] text-center">
                          {sortedStudents.length === 0 ? '0 / 0' : `${previewPageIndex + 1} / ${
                            sortedStudents.filter(st => {
                              const term = previewSearch.trim().toLowerCase();
                              if (!term) return true;
                              return (
                                st.names.toLowerCase().includes(term) ||
                                (st.regNo && st.regNo.toLowerCase().includes(term))
                              );
                            }).length
                          }`}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            const filteredLength = sortedStudents.filter(st => {
                              const term = previewSearch.trim().toLowerCase();
                              if (!term) return true;
                              return (
                                st.names.toLowerCase().includes(term) ||
                                (st.regNo && st.regNo.toLowerCase().includes(term))
                              );
                            }).length;
                            setPreviewPageIndex(prev => Math.min(filteredLength - 1, prev + 1));
                          }}
                          disabled={
                            sortedStudents.length === 0 ||
                            previewPageIndex >= (sortedStudents.filter(st => {
                              const term = previewSearch.trim().toLowerCase();
                              if (!term) return true;
                              return (
                                st.names.toLowerCase().includes(term) ||
                                (st.regNo && st.regNo.toLowerCase().includes(term))
                              );
                            }).length - 1)
                          }
                          className="p-2 px-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 disabled:hover:bg-slate-900 rounded-xl border border-slate-800 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                          title="Next Page"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const filteredLength = sortedStudents.filter(st => {
                              const term = previewSearch.trim().toLowerCase();
                              if (!term) return true;
                              return (
                                st.names.toLowerCase().includes(term) ||
                                (st.regNo && st.regNo.toLowerCase().includes(term))
                              );
                            }).length;
                            setPreviewPageIndex(Math.max(0, filteredLength - 1));
                          }}
                          disabled={
                            sortedStudents.length === 0 ||
                            previewPageIndex >= (sortedStudents.filter(st => {
                              const term = previewSearch.trim().toLowerCase();
                              if (!term) return true;
                              return (
                                st.names.toLowerCase().includes(term) ||
                                (st.regNo && st.regNo.toLowerCase().includes(term))
                              );
                            }).length - 1)
                          }
                          className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 disabled:hover:bg-slate-900 rounded-xl border border-slate-800 transition-all cursor-pointer"
                          title="Last Page"
                        >
                          <ChevronsRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE STUDENT ON-SCREEN FORM (ONLY RENDERS ONE CARD - EXTREMELY FAST & PRECISE PREVIEW) */}
                  <div className="bg-slate-950/40 p-4 rounded-3xl border border-slate-800 flex justify-center">
                    {sortedStudents.length === 0 ? (
                      <div className="p-16 text-center text-slate-500 text-xs w-full">
                        No students are on the roster. Please return to Tab 1 to add them or click "Add New Student to Roster".
                      </div>
                    ) : (() => {
                      const filteredList = sortedStudents.filter(st => {
                        const term = previewSearch.trim().toLowerCase();
                        if (!term) return true;
                        return (
                          st.names.toLowerCase().includes(term) ||
                          (st.regNo && st.regNo.toLowerCase().includes(term))
                        );
                      });

                      const currentIdx = Math.min(Math.max(0, previewPageIndex), Math.max(0, filteredList.length - 1));
                      const st = filteredList[currentIdx];

                      if (!st) {
                        return (
                          <div className="p-16 text-center text-slate-400 text-xs w-full">
                            No students on this list match your search for "{previewSearch}".
                          </div>
                        );
                      }

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

                      const qrValue = `REPUBLIC OF RWANDA - REB\nSTUDENT IDENTIFICATION RECORD\nNames: ${st.names}\nReg No: ${st.regNo || 'N/A'}\nGender: ${st.gender === 'M' ? 'Male' : 'Female'}\nSchool: ${schoolInfo.schoolName || 'N/A'}\nClass: ${schoolInfo.classCombo || 'N/A'}\nDOB: ${formattedDob}\nPOB: ${placeOfBirth}\nGuardian: ${st.fatherPhone || st.motherPhone || st.guardianPhone || 'N/A'}\nVerified by Nkorera Portal`;

                      return (
                        <div className="w-full max-w-2xl space-y-3">
                          {/* Quick Edit/Delete/Single Download toolbar for Preview */}
                          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-xl text-xs">
                            <div className="flex items-center gap-2 text-slate-300 font-medium">
                              <span className="text-slate-400 font-mono text-[11px] font-bold">#{currentIdx + 1}</span>
                              <span className="font-bold text-white">{st.names}</span>
                              {st.regNo && <span className="text-emerald-400 font-mono text-[11px]">({st.regNo})</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleDownloadSingleStudentPDF(st, currentIdx)}
                                disabled={isDownloading}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                                title="Download 1-page PDF for this student"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download This Form (PDF)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditModal(st)}
                                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                                title="Edit this student record in a beautiful popup modal"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStudent(st.id)}
                                className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                                title="Delete this student from roster"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>

                          {/* Beautiful On-Screen Card Preview Container */}
                          <div 
                            id={`student-card-preview-${st.id || currentIdx}`}
                            className="p-6 sm:p-7 bg-white text-slate-900 rounded-2xl shadow-2xl w-full space-y-3.5 text-[11px] font-sans border border-slate-300 leading-tight"
                          >
                            {/* Header Banner */}
                            <div className="border-b-2 border-slate-900 pb-2.5 text-center space-y-0.5">
                              <p className="font-black text-[10px] uppercase tracking-widest text-slate-700">REPUBLIC OF RWANDA</p>
                              <p className="font-extrabold text-[10px] uppercase tracking-wider text-slate-800">MINISTRY OF EDUCATION / REB</p>
                              <h1 className="text-base sm:text-lg font-black uppercase text-slate-950 tracking-tight my-0.5">
                                {schoolInfo.schoolName || 'GS MAYANGE B'}
                              </h1>
                              <p className="text-xs font-black text-slate-900 tracking-wide uppercase">STUDENT IDENTIFICATION FORM</p>
                              <p className="text-[9.5px] font-bold text-slate-600">
                                Academic Year: {schoolInfo.academicYear} &bull; Class & Combination: {schoolInfo.classCombo || 'N/A'}
                              </p>
                            </div>

                            {/* Meta row + QR Code */}
                            <div className="flex justify-between items-center gap-4 bg-slate-50 border border-slate-300 rounded-lg p-2.5">
                              <div className="space-y-1 text-[11px] text-slate-800">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-700">Reg Number:</span>
                                  <span className="font-mono bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded font-black text-xs border border-emerald-300">
                                    {st.regNo || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-700">Class & Section:</span>
                                  <span className="font-bold text-slate-900">{schoolInfo.classCombo || '-'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-700">Attendance Mode:</span>
                                  <span className="font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded text-[10px]">
                                    {st.attendance === 'Boarding' ? 'Boarding School' : 'Day School'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                  <span>Date Issued:</span>
                                  <span className="font-semibold text-slate-700">{new Date().toLocaleDateString()}</span>
                                </div>
                              </div>

                              {/* Crisp Verification QR Code */}
                              <div className="w-24 bg-white border border-slate-300 rounded-lg p-1.5 flex flex-col items-center justify-center text-center shadow-xs shrink-0" title="Scan to verify student record">
                                <QRCodeSVG
                                  value={qrValue}
                                  size={68}
                                  level="M"
                                  includeMargin={false}
                                />
                                <span className="text-[7.5px] font-black text-slate-700 mt-1 uppercase tracking-wider">
                                  QR Verification
                                </span>
                              </div>
                            </div>

                            {/* Form Table Details - Section 1 */}
                            <div className="border-2 border-black rounded overflow-hidden">
                              <div className="bg-slate-900 text-white font-black px-3 py-1.5 uppercase text-[9px] tracking-wider flex items-center justify-between border-b-2 border-black">
                                <span>1. Student Personal Identity</span>
                                <span className="text-slate-300 font-normal text-[8px]">Official Registry</span>
                              </div>
                              <div className="divide-y divide-black text-[10.5px]">
                                <div className="grid grid-cols-3 bg-slate-50">
                                  <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Full Names:</span>
                                  <span className="col-span-2 font-black text-black uppercase px-2.5 py-1.5">{st.names || '-'}</span>
                                </div>
                                <div className="grid grid-cols-3 bg-white">
                                  <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Gender:</span>
                                  <span className="col-span-2 font-bold text-black px-2.5 py-1.5">{st.gender === 'M' ? 'Male' : (st.gender === 'F' ? 'Female' : (st.gender || '-'))}</span>
                                </div>
                                <div className="grid grid-cols-3 bg-slate-50">
                                  <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Date Of Birth:</span>
                                  <span className="col-span-2 text-black font-bold px-2.5 py-1.5">{formattedDob}</span>
                                </div>
                                <div className="grid grid-cols-3 bg-white">
                                  <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Place Of Birth:</span>
                                  <span className="col-span-2 text-black font-semibold px-2.5 py-1.5">{placeOfBirth}</span>
                                </div>
                                <div className="grid grid-cols-3 bg-slate-50">
                                  <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Class & Combination:</span>
                                  <span className="col-span-2 font-bold text-black px-2.5 py-1.5">{schoolInfo.classCombo || '-'}</span>
                                </div>
                                <div className="grid grid-cols-3 bg-white">
                                  <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">District:</span>
                                  <span className="col-span-2 text-black font-medium px-2.5 py-1.5">{district}</span>
                                </div>
                                <div className="grid grid-cols-3 bg-slate-50">
                                  <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Sector:</span>
                                  <span className="col-span-2 text-black font-medium px-2.5 py-1.5">{sector}</span>
                                </div>
                                <div className="grid grid-cols-3 bg-white">
                                  <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Cell:</span>
                                  <span className="col-span-2 text-black font-medium px-2.5 py-1.5">{cell}</span>
                                </div>
                                <div className="grid grid-cols-3 bg-slate-50">
                                  <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Village:</span>
                                  <span className="col-span-2 text-black font-medium px-2.5 py-1.5">{village}</span>
                                </div>
                                <div className="grid grid-cols-3 bg-white">
                                  <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Attendance Mode:</span>
                                  <span className="col-span-2 text-emerald-800 font-black px-2.5 py-1.5">{st.attendance === 'Boarding' ? 'Boarder' : 'Day Student'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Form Table Details - Section 2 */}
                            <div className="border-2 border-black rounded overflow-hidden">
                              <div className="bg-slate-900 text-white font-black px-3 py-1.5 uppercase text-[9px] tracking-wider flex items-center justify-between border-b-2 border-black">
                                <span>2. Parents & Guardians</span>
                                <span className="text-slate-300 font-normal text-[8px]">Emergency Contacts</span>
                              </div>
                              <div className="divide-y divide-black text-[10.5px]">
                                <div className="grid grid-cols-3 bg-slate-50">
                                  <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Father's Name & Phone:</span>
                                  <span className="col-span-2 text-black font-bold px-2.5 py-1.5">
                                    {st.fatherName || '-'} {st.fatherPhone ? <span className="font-mono text-slate-700 font-normal">({st.fatherPhone})</span> : ''}
                                    {st.fatherId ? <span className="text-[9px] font-mono text-slate-500 ml-2 font-semibold">[ID: {st.fatherId}]</span> : null}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 bg-white">
                                  <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Mother's Name & Phone:</span>
                                  <span className="col-span-2 text-black font-bold px-2.5 py-1.5">
                                    {st.motherName || '-'} {st.motherPhone ? <span className="font-mono text-slate-700 font-normal">({st.motherPhone})</span> : ''}
                                    {st.motherId ? <span className="text-[9px] font-mono text-slate-500 ml-2 font-semibold">[ID: {st.motherId}]</span> : null}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 bg-slate-50">
                                  <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Guardian & Phone:</span>
                                  <span className="col-span-2 text-black font-medium px-2.5 py-1.5">
                                    {st.guardianName || '-'} {st.guardianPhone ? <span className="font-mono text-slate-700 font-normal">({st.guardianPhone})</span> : '(-)'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Official Signatures & Stamp Box */}
                            <div className="grid grid-cols-2 gap-6 pt-3 text-[10px] border-t border-slate-300">
                              <div>
                                <p className="font-black text-slate-900 uppercase text-[9px] tracking-wider">Student or Parent Signature:</p>
                                <div className="h-10 border-b-2 border-dashed border-slate-400 mt-1 flex items-end pb-0.5 text-[8.5px] text-slate-500 italic">
                                  Signature & Date
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-slate-900 uppercase text-[9px] tracking-wider">School Headteacher Attestation:</p>
                                <div className="h-10 border border-slate-300 rounded bg-slate-50 mt-1 p-1 flex flex-col justify-between items-center text-center">
                                  <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider">Stamp & Signature</span>
                                  <span className="text-[7.5px] text-emerald-800 font-mono font-black tracking-wide">NKORERA EDUCATIONAL PORTAL VERIFIED</span>
                                </div>
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="pt-2 border-t border-slate-200 text-center text-[8px] text-slate-500 font-mono flex items-center justify-between">
                              <span>Ref: NKORERA-STD-{(st.regNo || '001').replace(/\s+/g, '')}</span>
                              <span className="font-bold uppercase tracking-wider">Official Rwanda Education Board Form</span>
                              <span>Record ({sortedStudents.indexOf(st) + 1}/{sortedStudents.length})</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* ALL FORMS CONTAINER TO BE DOWNLOADED VIA HTML2PDF / WINDOW.PRINT (COMPACT 1-PAGE PER STUDENT GUARANTEED) */}
                  <div className="student-id-pdf-wrapper">
                    <div id="student-id-pdf-content" className="bg-white">
                      {sortedStudents.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 bg-white">
                          No students found on the list. Please add students under Tab 1 first.
                        </div>
                      ) : (
                        sortedStudents.map((st, index) => {
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

                          const qrValue = `REPUBLIC OF RWANDA - REB\nSTUDENT IDENTIFICATION RECORD\nNames: ${st.names}\nReg No: ${st.regNo || 'N/A'}\nGender: ${st.gender === 'M' ? 'Male' : 'Female'}\nSchool: ${schoolInfo.schoolName || 'N/A'}\nClass: ${schoolInfo.classCombo || 'N/A'}\nDOB: ${formattedDob}\nPOB: ${placeOfBirth}\nGuardian: ${st.fatherPhone || st.motherPhone || st.guardianPhone || 'N/A'}\nVerified by Nkorera Portal`;

                          return (
                            <div
                              key={st.id || index}
                              className="student-id-page-card bg-white text-slate-900 font-sans text-[11px] leading-tight space-y-3.5"
                              style={{ pageBreakAfter: 'always', breakAfter: 'page', pageBreakInside: 'avoid', breakInside: 'avoid' }}
                            >
                              {/* Header Banner */}
                              <div className="border-b-2 border-slate-900 pb-2.5 text-center space-y-0.5">
                                <p className="font-black text-[10px] uppercase tracking-widest text-slate-700">REPUBLIC OF RWANDA</p>
                                <p className="font-extrabold text-[10px] uppercase tracking-wider text-slate-800">MINISTRY OF EDUCATION / REB</p>
                                <h1 className="text-base sm:text-lg font-black uppercase text-slate-950 tracking-tight my-0.5">
                                  {schoolInfo.schoolName || 'GS MAYANGE B'}
                                </h1>
                                <p className="text-xs font-black text-slate-900 tracking-wide uppercase">STUDENT IDENTIFICATION FORM</p>
                                <p className="text-[9.5px] font-bold text-slate-600">
                                  Academic Year: {schoolInfo.academicYear} &bull; Class & Combination: {schoolInfo.classCombo || 'N/A'}
                                </p>
                              </div>

                              {/* Meta row + QR Code */}
                              <div className="flex justify-between items-center gap-4 bg-slate-50 border border-slate-300 rounded-lg p-2.5">
                                <div className="space-y-1 text-[11px] text-slate-800">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-700">Reg Number:</span>
                                    <span className="font-mono bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded font-black text-xs border border-emerald-300">
                                      {st.regNo || 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-700">Class & Section:</span>
                                    <span className="font-bold text-slate-900">{schoolInfo.classCombo || '-'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-700">Attendance Mode:</span>
                                    <span className="font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded text-[10px]">
                                      {st.attendance === 'Boarding' ? 'Boarding School' : 'Day School'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                    <span>Date Issued:</span>
                                    <span className="font-semibold text-slate-700">{new Date().toLocaleDateString()}</span>
                                  </div>
                                </div>

                                {/* Crisp Verification QR Code */}
                                <div className="w-24 bg-white border border-slate-300 rounded-lg p-1.5 flex flex-col items-center justify-center text-center shadow-xs shrink-0">
                                  <QRCodeSVG
                                    value={qrValue}
                                    size={68}
                                    level="M"
                                    includeMargin={false}
                                  />
                                  <span className="text-[7.5px] font-black text-slate-700 mt-1 uppercase tracking-wider">
                                    QR Verification
                                  </span>
                                </div>
                              </div>

                              {/* Form Table Details - Section 1 */}
                              <div className="border-2 border-black rounded overflow-hidden">
                                <div className="bg-slate-900 text-white font-black px-3 py-1.5 uppercase text-[9px] tracking-wider flex items-center justify-between border-b-2 border-black">
                                  <span>1. Student Personal Identity</span>
                                  <span className="text-slate-300 font-normal text-[8px]">Official Registry</span>
                                </div>
                                <div className="divide-y divide-black text-[10.5px]">
                                  <div className="grid grid-cols-3 bg-slate-50">
                                    <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Full Names:</span>
                                    <span className="col-span-2 font-black text-black uppercase px-2.5 py-1.5">{st.names || '-'}</span>
                                  </div>
                                  <div className="grid grid-cols-3 bg-white">
                                    <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Gender:</span>
                                    <span className="col-span-2 font-bold text-black px-2.5 py-1.5">{st.gender === 'M' ? 'Male' : (st.gender === 'F' ? 'Female' : (st.gender || '-'))}</span>
                                  </div>
                                  <div className="grid grid-cols-3 bg-slate-50">
                                    <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Date Of Birth:</span>
                                    <span className="col-span-2 text-black font-bold px-2.5 py-1.5">{formattedDob}</span>
                                  </div>
                                  <div className="grid grid-cols-3 bg-white">
                                    <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Place Of Birth:</span>
                                    <span className="col-span-2 text-black font-semibold px-2.5 py-1.5">{placeOfBirth}</span>
                                  </div>
                                  <div className="grid grid-cols-3 bg-slate-50">
                                    <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Class & Combination:</span>
                                    <span className="col-span-2 font-bold text-black px-2.5 py-1.5">{schoolInfo.classCombo || '-'}</span>
                                  </div>
                                  <div className="grid grid-cols-3 bg-white">
                                    <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">District:</span>
                                    <span className="col-span-2 text-black font-medium px-2.5 py-1.5">{district}</span>
                                  </div>
                                  <div className="grid grid-cols-3 bg-slate-50">
                                    <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Sector:</span>
                                    <span className="col-span-2 text-black font-medium px-2.5 py-1.5">{sector}</span>
                                  </div>
                                  <div className="grid grid-cols-3 bg-white">
                                    <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Cell:</span>
                                    <span className="col-span-2 text-black font-medium px-2.5 py-1.5">{cell}</span>
                                  </div>
                                  <div className="grid grid-cols-3 bg-slate-50">
                                    <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Village:</span>
                                    <span className="col-span-2 text-black font-medium px-2.5 py-1.5">{village}</span>
                                  </div>
                                  <div className="grid grid-cols-3 bg-white">
                                    <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Attendance Mode:</span>
                                    <span className="col-span-2 text-emerald-800 font-black px-2.5 py-1.5">{st.attendance === 'Boarding' ? 'Boarding School' : 'Day School'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Form Table Details - Section 2 */}
                              <div className="border-2 border-black rounded overflow-hidden">
                                <div className="bg-slate-900 text-white font-black px-3 py-1.5 uppercase text-[9px] tracking-wider flex items-center justify-between border-b-2 border-black">
                                  <span>2. Parents & Guardians</span>
                                  <span className="text-slate-300 font-normal text-[8px]">Emergency Contacts</span>
                                </div>
                                <div className="divide-y divide-black text-[10.5px]">
                                  <div className="grid grid-cols-3 bg-slate-50">
                                    <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Father's Name & Phone:</span>
                                    <span className="col-span-2 text-black font-bold px-2.5 py-1.5">
                                      {st.fatherName || '-'} {st.fatherPhone ? <span className="font-mono text-slate-700 font-normal">({st.fatherPhone})</span> : ''}
                                      {st.fatherId ? <span className="text-[9px] font-mono text-slate-500 ml-2 font-semibold">[ID: {st.fatherId}]</span> : null}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 bg-white">
                                    <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Mother's Name & Phone:</span>
                                    <span className="col-span-2 text-black font-bold px-2.5 py-1.5">
                                      {st.motherName || '-'} {st.motherPhone ? <span className="font-mono text-slate-700 font-normal">({st.motherPhone})</span> : ''}
                                      {st.motherId ? <span className="text-[9px] font-mono text-slate-500 ml-2 font-semibold">[ID: {st.motherId}]</span> : null}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 bg-slate-50">
                                    <span className="font-bold text-black px-2.5 py-1.5 border-r border-black">Guardian & Phone:</span>
                                    <span className="col-span-2 text-black font-medium px-2.5 py-1.5">
                                      {st.guardianName || '-'} {st.guardianPhone ? <span className="font-mono text-slate-700 font-normal">({st.guardianPhone})</span> : '(-)'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Official Signatures & Stamp Box */}
                              <div className="grid grid-cols-2 gap-6 pt-3 text-[10px] border-t border-slate-300">
                                <div>
                                  <p className="font-black text-slate-900 uppercase text-[9px] tracking-wider">Student or Parent Signature:</p>
                                  <div className="h-10 border-b-2 border-dashed border-slate-400 mt-1 flex items-end pb-0.5 text-[8.5px] text-slate-500 italic">
                                    Signature & Date
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-black text-slate-900 uppercase text-[9px] tracking-wider">School Headteacher Attestation:</p>
                                  <div className="h-10 border border-slate-300 rounded bg-slate-50 mt-1 p-1 flex flex-col justify-between items-center text-center">
                                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider">Stamp & Signature</span>
                                    <span className="text-[7.5px] text-emerald-800 font-mono font-black tracking-wide">NKORERA EDUCATIONAL PORTAL VERIFIED</span>
                                  </div>
                                </div>
                              </div>

                              {/* Footer */}
                              <div className="pt-2 border-t border-slate-200 text-center text-[8px] text-slate-500 font-mono flex items-center justify-between">
                                <span>Ref: NKORERA-STD-{(st.regNo || '001').replace(/\s+/g, '')}</span>
                                <span className="font-bold uppercase tracking-wider">Official Rwanda Education Board Form</span>
                                <span>Record ({index + 1}/{sortedStudents.length})</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-amber-300 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Annual Fee: 500 RWF &bull; Requires Admin Approval</span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>

                {activeTab === 'preview' && (
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-cyan-400" />
                    <span>Print All ({students.length})</span>
                  </button>
                )}

                {/* PROMINENT BATCH DOWNLOAD BUTTON */}
                <button
                  onClick={handleDownloadBatchPDF}
                  disabled={isDownloading || students.length === 0}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
                    isPaid
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50 hover:scale-105 active:scale-95'
                      : 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-amber-950/50'
                  }`}
                >
                  {isDownloading ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Generating Batch PDF ({students.length})...</span>
                    </>
                  ) : isPaid ? (
                    <>
                      <Download className="w-4 h-4 text-white" />
                      <span>Download All Forms PDF ({students.length})</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-slate-950" />
                      <span>Download All Forms (Requires Admin Unlock)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* NATIVE SIMULATED MOBILE USSD PIN POPUP OVERLAY */}
      {showUssdModal && (
        <div key="ussd-pin-modal-popup" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-amber-500 border-2 border-amber-300 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-slate-950 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-950/20 pb-2">
              <span className="text-[10px] font-black uppercase bg-slate-950 text-amber-300 px-2 py-0.5 rounded">
                {paymentSim === 'Airtel' ? 'Airtel Money' : 'MTN MoMo'}
              </span>
              <span className="text-[10px] font-bold text-slate-900">Push Payment</span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-black leading-relaxed">
                Pay <strong className="underline text-slate-950">500 RWF</strong> to <strong className="text-slate-950">Nkundimana Theogene (0781339530)</strong>.
              </p>
              
              <form onSubmit={handleConfirmUssdPin} className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-950">
                    Enter your {paymentSim === 'Airtel' ? '4-Digit Airtel Money' : '5-Digit MTN MoMo'} PIN:
                  </label>
                  <input
                    type="password"
                    maxLength={paymentSim === 'Airtel' ? 4 : 5}
                    value={ussdPin}
                    onChange={(e) => setUssdPin(e.target.value.replace(/\D/g, ''))}
                    placeholder={paymentSim === 'Airtel' ? "* * * *" : "* * * * *"}
                    autoFocus
                    className="w-full text-center bg-slate-950 border border-slate-900 rounded-xl py-2.5 px-3 text-lg font-black text-amber-400 font-mono tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-slate-950"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUssdModal(false)}
                    className="py-2 px-3 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingUssd}
                    className="py-2 px-3 bg-slate-950 text-amber-400 rounded-xl text-xs font-black hover:bg-slate-900 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isProcessingUssd ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Confirming...</span>
                      </>
                    ) : (
                      <span>Confirm PIN</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 📝 ELEGANT IN-APP EDIT STUDENT POPUP MODAL */}
      {isEditModalOpen && editingStudent && (
        <div key="edit-student-modal-popup" className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-950/60 border border-cyan-500/30 rounded-xl text-cyan-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Edit Student Record for {editingStudent.names || 'Student'}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Quickly update and synchronize student profile details.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingStudent(null);
                  setIsEditingCustomClassActive(false);
                }}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable form) */}
            <form onSubmit={handleUpdateEditedStudent} className="flex-1 overflow-y-auto max-h-[65vh] p-6 space-y-6">
              {/* SECTION 1: BASIC INFO */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1.5">
                  1. Basic Student Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Full Names*</label>
                    <input
                      required
                      type="text"
                      value={editingStudent.names}
                      onChange={(e) => setEditingStudent({ ...editingStudent, names: e.target.value })}
                      placeholder="e.g. NKUNDIMANA Jean"
                      className="w-full p-2.5 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:border-cyan-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Index Number / Reg No</label>
                    <input
                      type="text"
                      value={editingStudent.regNo || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, regNo: e.target.value })}
                      placeholder="e.g. REB-0158-2026"
                      className="w-full p-2.5 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:border-cyan-500 outline-none font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Gender</label>
                    <select
                      value={editingStudent.gender}
                      onChange={(e) => setEditingStudent({ ...editingStudent, gender: e.target.value as 'M' | 'F' })}
                      className="w-full p-2.5 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:border-cyan-500 outline-none font-bold"
                    >
                      <option value="M">M (Male)</option>
                      <option value="F">F (Female)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Date of Birth (DOB)</label>
                    <input
                      type="date"
                      value={editingStudent.dob || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, dob: e.target.value })}
                      className="w-full p-2.5 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:border-cyan-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Place of Birth (POB)</label>
                    <input
                      type="text"
                      value={editingStudent.pob || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, pob: e.target.value })}
                      placeholder="e.g. Bugesera, Mayange"
                      className="w-full p-2.5 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:border-cyan-500 outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Class / Level</label>
                    <select
                      value={isEditingCustomClassActive ? 'custom' : (editingStudent.classLevel || '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          setIsEditingCustomClassActive(true);
                          setEditingStudent(prev => prev ? ({
                            ...prev,
                            classLevel: (prev.classLevel && !COMMON_CLASSES.includes(prev.classLevel)) ? prev.classLevel : ''
                          }) : null);
                        } else {
                          setIsEditingCustomClassActive(false);
                          setEditingStudent(prev => prev ? ({ ...prev, classLevel: val }) : null);
                        }
                      }}
                      className="w-full p-2.5 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:border-cyan-500 outline-none font-bold cursor-pointer"
                    >
                      <option value="">-- Select Class --</option>
                      {COMMON_CLASSES.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                      <option value="custom">Other Class (Custom Class)...</option>
                    </select>

                    {isEditingCustomClassActive && (
                      <div className="mt-1.5">
                        <input
                          type="text"
                          value={editingStudent.classLevel || ''}
                          onChange={(e) => setEditingStudent({ ...editingStudent, classLevel: e.target.value })}
                          placeholder="e.g. S4 HEG, Primary 6 B"
                          autoFocus
                          className="w-full p-2.5 bg-slate-850 border border-cyan-500/40 rounded-xl text-white text-xs focus:border-cyan-400 outline-none font-bold"
                        />
                        <p className="text-[9px] text-slate-400 mt-0.5">Enter class name here.</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Attendance Mode</label>
                    <select
                      value={editingStudent.attendance || 'Day'}
                      onChange={(e) => setEditingStudent({ ...editingStudent, attendance: e.target.value as 'Day' | 'Boarding' })}
                      className="w-full p-2.5 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:border-cyan-500 outline-none font-bold cursor-pointer"
                    >
                      <option value="Day">Day School</option>
                      <option value="Boarding">Boarding School</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PARENTAL & RESIDENCE INFORMATION */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1.5">
                  2. Parents & Residence Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Father's Name</label>
                    <input
                      type="text"
                      value={editingStudent.fatherName || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, fatherName: e.target.value })}
                      className="w-full p-2.5 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:border-cyan-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Father's Phone</label>
                    <input
                      type="text"
                      value={editingStudent.fatherPhone || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, fatherPhone: e.target.value })}
                      placeholder="e.g. 078XXXXXXX"
                      className="w-full p-2.5 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:border-cyan-500 outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Mother's Name</label>
                    <input
                      type="text"
                      value={editingStudent.motherName || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, motherName: e.target.value })}
                      className="w-full p-2.5 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:border-cyan-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Mother's Phone</label>
                    <input
                      type="text"
                      value={editingStudent.motherPhone || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, motherPhone: e.target.value })}
                      placeholder="e.g. 078XXXXXXX"
                      className="w-full p-2.5 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:border-cyan-500 outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Guardian Name</label>
                    <input
                      type="text"
                      value={editingStudent.guardianName || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, guardianName: e.target.value })}
                      className="w-full p-2.5 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:border-cyan-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Guardian Phone</label>
                    <input
                      type="text"
                      value={editingStudent.guardianPhone || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, guardianPhone: e.target.value })}
                      placeholder="e.g. 078XXXXXXX"
                      className="w-full p-2.5 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:border-cyan-500 outline-none font-bold"
                    />
                  </div>
                </div>

                {/* Residence Sub-form */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">District</label>
                    <input
                      type="text"
                      value={editingStudent.district || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, district: e.target.value })}
                      className="w-full p-2 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:border-cyan-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Sector</label>
                    <input
                      type="text"
                      value={editingStudent.sector || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, sector: e.target.value })}
                      className="w-full p-2 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:border-cyan-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Cell</label>
                    <input
                      type="text"
                      value={editingStudent.cell || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, cell: e.target.value })}
                      className="w-full p-2 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:border-cyan-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Village</label>
                    <input
                      type="text"
                      value={editingStudent.village || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, village: e.target.value })}
                      className="w-full p-2 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:border-cyan-500 outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingStudent(null);
                    setIsEditingCustomClassActive(false);
                  }}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs transition-colors cursor-pointer border border-slate-700 text-center animate-pulse"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black rounded-2xl text-xs transition-colors cursor-pointer shadow-lg shadow-cyan-950/40 text-center"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-APP CONFIRM DELETE STUDENT MODAL (RELIABLE IN IFRAMES) */}
      {deleteConfirmTarget && (
        <div key="delete-confirm-modal-popup" className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Delete Student from Roster</h3>
                <p className="text-xs text-slate-400">This action will remove the student record.</p>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs text-slate-300">
              Are you sure you want to delete <strong className="text-white underline">{deleteConfirmTarget.name}</strong> from the student roster?
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer border border-slate-700 text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-lg shadow-red-950/50 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP CONFIRM CLEAR ALL ROSTER MODAL */}
      {showClearConfirm && (
        <div key="clear-confirm-modal-popup" className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Clear Entire Student Roster</h3>
                <p className="text-xs text-slate-400">Permanent action</p>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs text-slate-300">
              Are you sure you want to remove all <strong className="text-amber-400">{students.length} students</strong> from the roster? This cannot be undone.
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer border border-slate-700 text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearRoster}
                className="py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-lg shadow-red-950/50 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Clear All</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
