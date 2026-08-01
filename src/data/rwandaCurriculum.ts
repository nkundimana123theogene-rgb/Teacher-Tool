export interface CurriculumTopicItem {
  id: string;
  subject: string;
  grade: string;
  unit: string;
  topic: string;
  details?: string;
}

export const REB_CURRICULUM_DATA: CurriculumTopicItem[] = [
  // Biology
  { id: 'reb_bio_1', subject: 'Biology', grade: 'Senior 1', unit: 'Unit 1: Introduction to Biology', topic: 'Cell Structure and Function' },
  { id: 'reb_bio_2', subject: 'Biology', grade: 'Senior 1', unit: 'Unit 2: Classification of Living Organisms', topic: 'Binomial Nomenclature & Five Kingdoms' },
  { id: 'reb_bio_3', subject: 'Biology', grade: 'Senior 2', unit: 'Unit 1: Transport in Plants and Animals', topic: 'Xylem, Phloem & Blood Circulation' },
  { id: 'reb_bio_4', subject: 'Biology', grade: 'Senior 3', unit: 'Unit 1: Respiration in Plants & Animals', topic: 'Aerobic & Anaerobic Respiration' },
  { id: 'reb_bio_5', subject: 'Biology', grade: 'Senior 4', unit: 'Unit 3: Photosynthesis', topic: 'Light Dependent & Independent Reactions' },
  { id: 'reb_bio_6', subject: 'Biology', grade: 'Senior 5', unit: 'Unit 2: Homeostasis & Coordination', topic: 'Nervous Impulse Transmission & Kidneys' },
  { id: 'reb_bio_7', subject: 'Biology', grade: 'Senior 6', unit: 'Unit 1: Evolution & Genetics', topic: 'Mendelian Monohybrid & Dihybrid Inheritance' },

  // Mathematics
  { id: 'reb_math_1', subject: 'Mathematics', grade: 'Primary 5', unit: 'Unit 2: Fractions and Decimals', topic: 'Operations on Improper Fractions & Decimals' },
  { id: 'reb_math_2', subject: 'Mathematics', grade: 'Senior 1', unit: 'Unit 2: Linear Equations & Inequalities', topic: 'Solving Linear Equations in One Variable' },
  { id: 'reb_math_3', subject: 'Mathematics', grade: 'Senior 2', unit: 'Unit 1: Quadratic Equations', topic: 'Factoring & Quadratic Formula' },
  { id: 'reb_math_4', subject: 'Mathematics', grade: 'Senior 3', unit: 'Unit 2: Trigonometric Ratios', topic: 'Sine, Cosine & Tangent in Right Triangles' },
  { id: 'reb_math_5', subject: 'Mathematics', grade: 'Senior 4', unit: 'Unit 1: Polynomial Functions', topic: 'Polynomial Division & Remainder Theorem' },
  { id: 'reb_math_6', subject: 'Mathematics', grade: 'Senior 5', unit: 'Unit 2: Differential Calculus', topic: 'Derivatives & Rates of Change' },
  { id: 'reb_math_7', subject: 'Mathematics', grade: 'Senior 6', unit: 'Unit 1: Integral Calculus', topic: 'Definite & Indefinite Integration' },

  // Physics
  { id: 'reb_phys_1', subject: 'Physics', grade: 'Senior 1', unit: 'Unit 1: Measurement & Quantities', topic: 'SI Units and Density Calculations' },
  { id: 'reb_phys_2', subject: 'Physics', grade: 'Senior 2', unit: 'Unit 2: Force and Motion', topic: 'Newton\'s Laws of Motion' },
  { id: 'reb_phys_3', subject: 'Physics', grade: 'Senior 3', unit: 'Unit 1: Current Electricity', topic: 'Ohm\'s Law and Series/Parallel Circuits' },
  { id: 'reb_phys_4', subject: 'Physics', grade: 'Senior 4', unit: 'Unit 2: Wave Motion & Optics', topic: 'Reflection, Refraction & Lenses' },

  // Chemistry
  { id: 'reb_chem_1', subject: 'Chemistry', grade: 'Senior 1', unit: 'Unit 1: Matter and Pure Substances', topic: 'States of Matter & Physical Changes' },
  { id: 'reb_chem_2', subject: 'Chemistry', grade: 'Senior 2', unit: 'Unit 1: Atomic Structure', topic: 'Subatomic Particles & Periodic Table Trends' },
  { id: 'reb_chem_3', subject: 'Chemistry', grade: 'Senior 3', unit: 'Unit 2: Acids, Bases and Indicators', topic: 'pH Scale and Neutralization Reactions' },
  { id: 'reb_chem_4', subject: 'Chemistry', grade: 'Senior 4', unit: 'Unit 3: Organic Chemistry', topic: 'Hydrocarbons: Alkanes, Alkenes & Alkynes' },

  // Chemistry & History & English
  { id: 'reb_eng_1', subject: 'English', grade: 'Senior 2', unit: 'Unit 1: Environmental Protection', topic: 'Reading Comprehension & Passive Voice' },
  { id: 'reb_hist_1', subject: 'History', grade: 'Senior 3', unit: 'Unit 2: Pre-colonial Rwanda History', topic: 'Social Organization & Kingship in Ancient Rwanda' },
  { id: 'reb_ent_1', subject: 'Entrepreneurship', grade: 'Senior 2', unit: 'Unit 1: Business Opportunities', topic: 'Market Research & Feasibility Study' }
];

export const RTB_CURRICULUM_DATA: CurriculumTopicItem[] = [
  // Computer Science / Software Development
  { id: 'rtb_cs_1', subject: 'Software Development', grade: 'Level 3 TVET', unit: 'Unit 1: Computer Hardware', topic: 'Assembly & Troubleshooting Computer Components' },
  { id: 'rtb_cs_2', subject: 'Software Development', grade: 'Level 4 TVET', unit: 'Unit 2: Database Management', topic: 'SQL Queries, Joins & Normalization' },
  { id: 'rtb_cs_3', subject: 'Software Development', grade: 'Level 4 TVET', unit: 'Unit 3: Web Development', topic: 'HTML5, CSS3, Responsive Design & JavaScript DOM' },
  { id: 'rtb_cs_4', subject: 'Software Development', grade: 'Level 5 TVET', unit: 'Unit 1: Backend API Development', topic: 'RESTful API Services and Authentication' },

  // Electrical Technology
  { id: 'rtb_elec_1', subject: 'Electrical Technology', grade: 'Level 3 TVET', unit: 'Unit 1: Electrical Wiring', topic: 'Domestic Conduit Installation and Circuit Protection' },
  { id: 'rtb_elec_2', subject: 'Electrical Technology', grade: 'Level 4 TVET', unit: 'Unit 2: Solar Energy Systems', topic: 'Solar Panel Sizing, Inverters & Battery Storage' },
  { id: 'rtb_elec_3', subject: 'Electrical Technology', grade: 'Level 5 TVET', unit: 'Unit 1: Industrial Automation', topic: 'PLC Programming & Motor Control Logic' },

  // Automotive Technology
  { id: 'rtb_auto_1', subject: 'Automotive Technology', grade: 'Level 3 TVET', unit: 'Unit 1: Internal Combustion Engines', topic: 'Four-Stroke Engine Operations & Valve Clearance' },
  { id: 'rtb_auto_2', subject: 'Automotive Technology', grade: 'Level 4 TVET', unit: 'Unit 2: Vehicle Electronics', topic: 'ECU Diagnostics & Sensor Signal Measurement' },

  // Culinary Arts & Hospitality
  { id: 'rtb_cul_1', subject: 'Culinary Arts', grade: 'Level 3 TVET', unit: 'Unit 1: Food Safety & Hygiene', topic: 'HACCP Standards & Cross-Contamination Prevention' },
  { id: 'rtb_cul_2', subject: 'Hospitality', grade: 'Level 4 TVET', unit: 'Unit 2: Front Office Operations', topic: 'Reservation Systems & Customer Relations' },

  // Construction & Building Technology
  { id: 'rtb_const_1', subject: 'Construction Technology', grade: 'Level 3 TVET', unit: 'Unit 1: Masonry & Concrete Work', topic: 'Brick Bonding Patterns and Mortar Mixing Ratios' },
  { id: 'rtb_const_2', subject: 'Construction Technology', grade: 'Level 4 TVET', unit: 'Unit 2: Structural Blueprints', topic: 'Reading Architectural Drawings and Quantity Surveying' }
];
