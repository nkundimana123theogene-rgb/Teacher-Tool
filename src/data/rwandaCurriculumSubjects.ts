export interface RwandaSubjectItem {
  id: string;
  nameEn: string;
  nameRw: string;
  nameFr: string;
  nameSw: string;
  defaultPeriods?: string;
  suggestedClasses?: string[];
  suggestedCombinations?: string[];
  sampleUnits?: { unitNumber: string; unitTitleEn: string; unitTitleRw: string; competenceEn: string; competenceRw: string }[];
}

export interface RwandaEducationCategory {
  id: string;
  titleEn: string;
  titleRw: string;
  titleFr: string;
  titleSw: string;
  badge: string;
  levels: string[];
  combinations?: string[];
  subjects: RwandaSubjectItem[];
}

const RAW_RWANDA_EDUCATION_CURRICULUM: RwandaEducationCategory[] = [
  // I. NURSERY / PRE-PRIMARY (ECD)
  {
    id: 'nursery_pre_primary',
    titleEn: 'I. Nursery (Pre-Primary / ECD)',
    titleRw: 'I. Amashuri y\'Inshuke (Nursery / ECD)',
    titleFr: 'I. Maternelle (Pré-Primaire / DPE)',
    titleSw: 'I. Chekechea (Pre-Primary / ECD)',
    badge: 'N1 - N3',
    levels: ['Baby Class (N1)', 'Middle Class (N2)', 'Top Class (N3)'],
    combinations: ['Early Childhood Development (ECD)'],
    subjects: [
      {
        id: 'nur_kiny',
        nameEn: 'Developing Language & Literacy (Kinyarwanda)',
        nameRw: 'Kumenya Ururimi n\'Imiyoborere (Ikinyarwanda)',
        nameFr: 'Éveil au Langage et Alphabétisation (Kinyarwanda)',
        nameSw: 'Kukuza Lugha na Kusoma (Kinyarwanda)',
        defaultPeriods: '5 periods per week',
        suggestedClasses: ['Baby Class (N1)', 'Middle Class (N2)', 'Top Class (N3)'],
        sampleUnits: [
          {
            unitNumber: 'Unit 1',
            unitTitleEn: 'Myself and My Body Parts',
            unitTitleRw: 'Njye n\'ibice by\'umubiri wanjye',
            competenceEn: 'Identify and name basic body parts and express personal feelings.',
            competenceRw: 'Gutahura no kuvuga ibice by\'umubiri no kugaragaza ibyiyumvo bye.'
          }
        ]
      },
      {
        id: 'nur_eng',
        nameEn: 'Developing Language & Literacy (English Basics)',
        nameRw: 'Icyongereza cy\'Ibanze mu Nshuke (English Basics)',
        nameFr: 'Éveil à la Langue Anglaise',
        nameSw: 'Misingi ya Kiingereza kwa Watoto',
        defaultPeriods: '4 periods per week',
        suggestedClasses: ['Baby Class (N1)', 'Middle Class (N2)', 'Top Class (N3)'],
        sampleUnits: [
          {
            unitNumber: 'Unit 1',
            unitTitleEn: 'Greetings, Family and Classroom Objects',
            unitTitleRw: 'Indamukanyo, Umuryango n\'ibikoresho by\'ishuri',
            competenceEn: 'Listen, understand and respond to simple daily English greetings and instructions.',
            competenceRw: 'Kumva no gusubiza indamukanyo z\'Icyongereza n\'amabwiriza y\'ishuri.'
          }
        ]
      },
      {
        id: 'nur_num',
        nameEn: 'Early Numeracy & Mathematics Concept',
        nameRw: 'Kubara no Kumenya Imibare y\'Ibanze (Numeracy)',
        nameFr: 'Éveil Mathématique et Numératie',
        nameSw: 'Kujifunza Kuhesabu na Misingi ya Hesabu',
        defaultPeriods: '5 periods per week',
        suggestedClasses: ['Baby Class (N1)', 'Middle Class (N2)', 'Top Class (N3)'],
        sampleUnits: [
          {
            unitNumber: 'Unit 1',
            unitTitleEn: 'Sorting, Counting Objects (1-10) and Shapes',
            unitTitleRw: 'Gutoranya ibintu, kubara 1-10 no gutahura amashusho',
            competenceEn: 'Count concrete objects from 1 to 10 and sort by colors and sizes.',
            competenceRw: 'Kubara ibintu bifatika 1-10 no kubitoranya hakurikijwe amabara n\'ingano.'
          }
        ]
      },
      {
        id: 'nur_disc',
        nameEn: 'Discovery of the World & Environment',
        nameRw: 'Kuvumbura Isi n\'Ibidukikije (Discovery of World)',
        nameFr: 'Découverte du Monde et Environnement',
        nameSw: 'Ugunduzi wa Mazingira na Ulimwengu',
        defaultPeriods: '4 periods per week',
        suggestedClasses: ['Baby Class (N1)', 'Middle Class (N2)', 'Top Class (N3)'],
        sampleUnits: [
          {
            unitNumber: 'Unit 1',
            unitTitleEn: 'Domestic Animals and Common Plants',
            unitTitleRw: 'Amatungo yo mu rugo n\'ibihingwa bisanzwe',
            competenceEn: 'Recognize domestic animals and appreciate plants in the immediate environment.',
            competenceRw: 'Kumenya amatungo yo mu rugo no gukunda ibimera bituriye.'
          }
        ]
      },
      {
        id: 'nur_arts',
        nameEn: 'Creative Arts (Music, Drawing, Modeling & Craft)',
        nameRw: 'Ubugeni n\'Umuco (Indirimbo, Gushushanya & Kubumba)',
        nameFr: 'Arts Créatifs (Dessin, Musique et Modelage)',
        nameSw: 'Sanaa za Ubunifu (Muziki, Kuchora na Ufinyanzi)',
        defaultPeriods: '4 periods per week',
        suggestedClasses: ['Baby Class (N1)', 'Middle Class (N2)', 'Top Class (N3)']
      },
      {
        id: 'nur_phys',
        nameEn: 'Physical Development, Health & Sanitation',
        nameRw: 'Imikurire y\'Umubiri, Isuku n\'Ubuzima',
        nameFr: 'Développement Psychomoteur, Hygiène et Santé',
        nameSw: 'Ukuaji wa Mwili, Usafi na Afya',
        defaultPeriods: '4 periods per week',
        suggestedClasses: ['Baby Class (N1)', 'Middle Class (N2)', 'Top Class (N3)']
      },
      {
        id: 'nur_motor',
        nameEn: 'Fine Motor Skills, Pre-Writing & Sensory Play',
        nameRw: 'Gukorana Intoki, Inyandiko y\'Ibanze n\'Ibikinisho (Motor Skills)',
        nameFr: 'Psychomotricité Fine et Pré-Écriture',
        nameSw: 'Kukuza Vidole na Mazoezi ya Kuandika',
        defaultPeriods: '4 periods per week',
        suggestedClasses: ['Baby Class (N1)', 'Middle Class (N2)', 'Top Class (N3)']
      },
      {
        id: 'nur_fr',
        nameEn: 'French Language Basics (Nursery)',
        nameRw: 'Igifaransa cy\'Ibanze mu Nshuke (French Basics)',
        nameFr: 'Initiation à la Langue Française',
        nameSw: 'Misingi ya Kifaransa kwa Watoto',
        defaultPeriods: '3 periods per week',
        suggestedClasses: ['Middle Class (N2)', 'Top Class (N3)']
      },
      {
        id: 'nur_soc',
        nameEn: 'Social & Emotional Development (Play & Sharing)',
        nameRw: 'Imibanire n\'Imyitwarire myiza (Gusangira & Gukina)',
        nameFr: 'Développement Socio-Émotionnel et Vivre-Ensemble',
        nameSw: 'Maendeleo ya Kijamii na Kihisia',
        defaultPeriods: '3 periods per week',
        suggestedClasses: ['Baby Class (N1)', 'Middle Class (N2)', 'Top Class (N3)']
      }
    ]
  },

  // II. PRIMARY (P1 - P6)
  {
    id: 'primary_school',
    titleEn: 'II. Primary School (P1 - P6)',
    titleRw: 'II. Amashuri Abanza (P1 - P6)',
    titleFr: 'II. École Primaire (P1 - P6)',
    titleSw: 'II. Shule ya Msingi (P1 - P6)',
    badge: 'P1 - P6',
    levels: ['Primary 1 (P1)', 'Primary 2 (P2)', 'Primary 3 (P3)', 'Primary 4 (P4)', 'Primary 5 (P5)', 'Primary 6 (P6)'],
    combinations: ['Lower Primary (P1-P3)', 'Upper Primary (P4-P6)'],
    subjects: [
      {
        id: 'pri_kiny',
        nameEn: 'Ikinyarwanda (Primary)',
        nameRw: 'Ikinyarwanda (P1-P6)',
        nameFr: 'Ikinyarwanda (Primaire)',
        nameSw: 'Kinyarwanda (Shule ya Msingi)',
        defaultPeriods: '7 periods (P1-P3) / 4 periods (P4-P6)',
        suggestedClasses: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
        sampleUnits: [
          {
            unitNumber: 'Unit 1',
            unitTitleEn: 'Reading and Grammar: Nouns and Sentence Structure',
            unitTitleRw: 'Gusoma n\'ikibonezamvugo: Amazina n\'imiterere y\'interuro',
            competenceEn: 'Read short text accurately and use correct grammar in sentences.',
            competenceRw: 'Gusoma umwandiko muto neza no gukoresha amategeko y\'ikibonezamvugo mu nteruro.'
          }
        ]
      },
      {
        id: 'pri_math',
        nameEn: 'Mathematics (Primary)',
        nameRw: 'Imibare / Mathematics (P1-P6)',
        nameFr: 'Mathématiques (Primaire)',
        nameSw: 'Hisabati (Msingi)',
        defaultPeriods: '6 periods per week',
        suggestedClasses: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
        sampleUnits: [
          {
            unitNumber: 'Unit 1',
            unitTitleEn: 'Whole Numbers, Place Values and Operations',
            unitTitleRw: 'Imibare yose, agaciro k\'imibare n\'ibikorwa byayo',
            competenceEn: 'Read, write, compare and perform arithmetic operations on whole numbers.',
            competenceRw: 'Gusoma, kwandika, kugereranya no gukora imibare y\'inyongera, gukuramo, gukuba no kugabanya.'
          }
        ]
      },
      {
        id: 'pri_eng',
        nameEn: 'English Language (Primary)',
        nameRw: 'Icyongereza / English Language (P1-P6)',
        nameFr: 'Anglais (Primaire)',
        nameSw: 'Kiingereza (Msingi)',
        defaultPeriods: '7 periods per week',
        suggestedClasses: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
        sampleUnits: [
          {
            unitNumber: 'Unit 1',
            unitTitleEn: 'People and Professions / Classroom Communication',
            unitTitleRw: 'Abantu n\'imirimo / Itumanaho mu ishuri',
            competenceEn: 'Communicate accurately in oral and written English about daily activities.',
            competenceRw: 'Gukoresha Icyongereza cyanditse n\'icyafatishijwe mu kuvuga ku mirimo n\'ibikorwa bya buri munsi.'
          }
        ]
      },
      {
        id: 'pri_set',
        nameEn: 'Science and Elementary Technology (SET)',
        nameRw: 'Ubumenyi n\'Ikoranabuhanga ry\'Ibanze (SET - Upper Primary P4-P6)',
        nameFr: 'Sciences et Technologies Élémentaires (SET P4-P6)',
        nameSw: 'Sayansi na Teknolojia ya Awali (SET P4-P6)',
        defaultPeriods: '5 periods per week',
        suggestedClasses: ['P4', 'P5', 'P6'],
        sampleUnits: [
          {
            unitNumber: 'Unit 1',
            unitTitleEn: 'Plants, Animals and Human Body Systems',
            unitTitleRw: 'Ibihingwa, Inyamaswa n\'inzira z\'umubiri w\'umuntu',
            competenceEn: 'Investigate characteristics of living things and protect the local environment.',
            competenceRw: 'Gushishoza no gusobanura imiterere y\'ibinyabuzima no kubungabunga ibidukikije.'
          }
        ]
      },
      {
        id: 'pri_srs',
        nameEn: 'Social and Religious Studies (SRS)',
        nameRw: 'Ubumenyi bw\'Imibanire n\'Iyobokamana (SRS - Upper Primary P4-P6)',
        nameFr: 'Sciences Sociales et Religieuses (SRS P4-P6)',
        nameSw: 'Masomo ya Jamii na Dini (SRS P4-P6)',
        defaultPeriods: '4 periods per week',
        suggestedClasses: ['P4', 'P5', 'P6'],
        sampleUnits: [
          {
            unitNumber: 'Unit 1',
            unitTitleEn: 'Our District, Province and Good Governance in Rwanda',
            unitTitleRw: 'Akarere kacu, Intara n\'Imiyoborere myiza mu Rwanda',
            competenceEn: 'Describe geographical features and administrative leadership in Rwanda.',
            competenceRw: 'Gusobanura ibiranga Akarere n\'Intara no gukurikiza indangagaciro z\'imiyoborere myiza.'
          }
        ]
      },
      {
        id: 'pri_ict',
        nameEn: 'ICT / Computer Literacy (Upper Primary)',
        nameRw: 'Ikoranabuhanga ry\'Ibanze / ICT & Laptop Skills (Upper Primary P4-P6)',
        nameFr: 'Informatique et Outils Numériques (P4-P6)',
        nameSw: 'TEHAMA na Teknolojia (P4-P6)',
        defaultPeriods: '2 periods per week',
        suggestedClasses: ['P4', 'P5', 'P6'],
        sampleUnits: [
          {
            unitNumber: 'Unit 1',
            unitTitleEn: 'Introduction to Laptops, Operating System & Word Processing',
            unitTitleRw: 'Gukoresha Mudasobwa (XO/Laptop), Sisitemu no Kwandika Umwandiko',
            competenceEn: 'Identify hardware parts of a laptop and create simple text documents.',
            competenceRw: 'Kumenya ibice bya mudasobwa no kubasha kwandika inyandiko yo mu buryo bw\'ikoranabuhanga.'
          }
        ]
      },
      {
        id: 'pri_creative_arts',
        nameEn: 'Creative Arts (Fine Art, Craft & Music)',
        nameRw: 'Ubugeni, Igishushanyo n\'Indirimbo / Creative Arts (P1-P6)',
        nameFr: 'Arts Créatifs et Musique (Primaire)',
        nameSw: 'Sanaa za Mikono na Muziki (Msingi)',
        defaultPeriods: '2 periods per week',
        suggestedClasses: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']
      },
      {
        id: 'pri_pe',
        nameEn: 'Physical Education and Sports (PE)',
        nameRw: 'Imikino n\'Imyitozo Ngororangingo / PE (P1-P6)',
        nameFr: 'Éducation Physique et Sportive (EPS Primaire)',
        nameSw: 'Elimu ya Michezo na Viungo (PE Msingi)',
        defaultPeriods: '2 periods per week',
        suggestedClasses: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']
      },
      {
        id: 'pri_fr',
        nameEn: 'French Language (Français Upper Primary)',
        nameRw: 'Igifaransa / Français (Upper Primary P4-P6)',
        nameFr: 'Français Langue Étrangère (P4-P6)',
        nameSw: 'Kifaransa (P4-P6)',
        defaultPeriods: '3 periods per week',
        suggestedClasses: ['P4', 'P5', 'P6'],
        sampleUnits: [
          {
            unitNumber: 'Unité 1',
            unitTitleEn: 'Greetings, Family and Classroom Vocabulary in French',
            unitTitleRw: 'Isuhuzanya, Umuryango n\'Ibizina byo mu Ishuri mu Gifarantza',
            competenceEn: 'Introduce oneself and family members simple expressions in French.',
            competenceRw: 'Kwikorera icyerekezo cy\'irangamuntu no kuvuga ku muryango mu Gifarantza.'
          }
        ]
      },
      {
        id: 'pri_sw',
        nameEn: 'Kiswahili Basics (Upper Primary)',
        nameRw: 'Igiswahili cy\'Ibanze / Kiswahili (Upper Primary P4-P6)',
        nameFr: 'Initiation au Kiswahili (P4-P6)',
        nameSw: 'Kiswahili cha Awali (P4-P6)',
        defaultPeriods: '2 periods per week',
        suggestedClasses: ['P4', 'P5', 'P6'],
        sampleUnits: [
          {
            unitNumber: 'Somo la 1',
            unitTitleEn: 'Kiswahili Greetings, Numbers and Everyday Expressions',
            unitTitleRw: 'Isuhuzanya, Imibare n\'Imvugo z\'Ibanze mu Giswahili',
            competenceEn: 'Greet and introduce oneself using basic Kiswahili expressions.',
            competenceRw: 'Gusuhuza no kwiranga mu Giswahili cy\'ibanze.'
          }
        ]
      },
      {
        id: 'pri_agri_home',
        nameEn: 'Agriculture & Home Economics Basics (Upper Primary)',
        nameRw: 'Ubuhinzi, Ubworozi n\'Isuku mu Muryango (P4-P6 Practical Skills)',
        nameFr: 'Initiation à l\'Agriculture et Économie Domestique',
        nameSw: 'Kilimo na Uchumi wa Nyumbani (P4-P6)',
        defaultPeriods: '2 periods per week',
        suggestedClasses: ['P4', 'P5', 'P6'],
        sampleUnits: [
          {
            unitNumber: 'Unit 1',
            unitTitleEn: 'Soil Preparation, Kitchen Gardening & Nutrition',
            unitTitleRw: 'Gutegura Ubutaka, Akarima k\'Igikoni n\'Imyitwarire y\'Isuku n\'Amapfunyika',
            competenceEn: 'Demonstrate practical skills in setting up a kitchen garden and preparing balanced meals.',
            competenceRw: 'Kugaragaza ubushobozi mu gutunganya akarima k\'igikoni no gutegura indyo yuzuye.'
          }
        ]
      },
      {
        id: 'pri_re',
        nameEn: 'Religious Education & Values (RE - Primary)',
        nameRw: 'Inyigisho z\'Iyobokamana n\'Indangagaciro / Religious Education (P1-P6)',
        nameFr: 'Éducation Religieuse et Valeurs (Primaire)',
        nameSw: 'Elimu ya Dini na Maadili (Msingi)',
        defaultPeriods: '2 periods per week',
        suggestedClasses: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']
      },
      {
        id: 'pri_music',
        nameEn: 'Performing Arts & Music (Primary)',
        nameRw: 'Indirimbo, Ibyino n\'Ikinamico / Music & Performing Arts (P1-P6)',
        nameFr: 'Arts du Spectacle et Musique (Primaire)',
        nameSw: 'Sanaa za Onyesho na Muziki (Msingi)',
        defaultPeriods: '2 periods per week',
        suggestedClasses: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']
      }
    ]
  },

  // III. SECONDARY O-LEVEL (S1 - S3 / TRONC COMMUN)
  {
    id: 'secondary_o_level',
    titleEn: 'III. Secondary O-Level (S1 - S3 / Tronc Commun)',
    titleRw: 'III. Icyiciro Rusange cy\'Amashuri Yisumbuye (S1 - S3)',
    titleFr: 'III. Secondaire Tronc Commun (S1 - S3)',
    titleSw: 'III. Sekondari ya Awali (S1 - S3)',
    badge: 'S1 - S3',
    levels: ['Senior 1 (S1)', 'Senior 2 (S2)', 'Senior 3 (S3)'],
    combinations: ['General Tronc Commun'],
    subjects: [
      {
        id: 'olevel_math',
        nameEn: 'Mathematics (O-Level)',
        nameRw: 'Imibare (Icyiciro Rusange S1-S3)',
        nameFr: 'Mathématiques (Tronc Commun)',
        nameSw: 'Hisabati (Sekondari ya Awali)',
        defaultPeriods: '6 periods per week',
        suggestedClasses: ['S1', 'S2', 'S3']
      },
      {
        id: 'olevel_phy',
        nameEn: 'Physics (O-Level)',
        nameRw: 'Ubugenge / Physics (S1-S3)',
        nameFr: 'Physique (Tronc Commun)',
        nameSw: 'Fizikia (Sekondari ya Awali)',
        defaultPeriods: '3 periods per week',
        suggestedClasses: ['S1', 'S2', 'S3']
      },
      {
        id: 'olevel_chem',
        nameEn: 'Chemistry (O-Level)',
        nameRw: 'Ubutabire / Chemistry (S1-S3)',
        nameFr: 'Chimie (Tronc Commun)',
        nameSw: 'Kemia (Sekondari ya Awali)',
        defaultPeriods: '3 periods per week',
        suggestedClasses: ['S1', 'S2', 'S3']
      },
      {
        id: 'olevel_bio',
        nameEn: 'Biology and Health Sciences (O-Level)',
        nameRw: 'Ubumenyi bw\'Ubuzima / Biology (S1-S3)',
        nameFr: 'Biologie et Sciences de la Santé',
        nameSw: 'Biolojia na Afya (Sekondari)',
        defaultPeriods: '3 periods per week',
        suggestedClasses: ['S1', 'S2', 'S3']
      },
      {
        id: 'olevel_geo',
        nameEn: 'Geography and Environment (O-Level)',
        nameRw: 'Ubumenyi bw\'Isi n\'Ibidukikije / Geography (S1-S3)',
        nameFr: 'Géographie et Environnement',
        nameSw: 'Jiografia na Mazingira',
        defaultPeriods: '3 periods per week',
        suggestedClasses: ['S1', 'S2', 'S3'],
        sampleUnits: [
          {
            unitNumber: 'Unit 1',
            unitTitleEn: 'Soil Erosion in Rwanda',
            unitTitleRw: 'Isuri n\'Isenyuka ry\'Ubutaka mu Rwanda',
            competenceEn: 'To be able to explain the causes, effects and conservation measures of soil erosion in Rwanda.',
            competenceRw: 'Gusobanura impamvu, ingaruka n\'uburyo bwo kurwanya isuri mu Rwanda.'
          }
        ]
      },
      {
        id: 'olevel_hist',
        nameEn: 'History and Citizenship (O-Level)',
        nameRw: 'Amateka n\'Uburere Mboneragihugu (S1-S3)',
        nameFr: 'Histoire et Citoyenneté (Tronc Commun)',
        nameSw: 'Historia na Uraia',
        defaultPeriods: '3 periods per week',
        suggestedClasses: ['S1', 'S2', 'S3']
      },
      {
        id: 'olevel_kiny',
        nameEn: 'Ikinyarwanda (O-Level)',
        nameRw: 'Ikinyarwanda (Icyiciro Rusange S1-S3)',
        nameFr: 'Ikinyarwanda (Tronc Commun)',
        nameSw: 'Kinyarwanda (Sekondari)',
        defaultPeriods: '4 periods per week',
        suggestedClasses: ['S1', 'S2', 'S3']
      },
      {
        id: 'olevel_eng',
        nameEn: 'English Language & Literature (O-Level)',
        nameRw: 'Icyongereza n\'Ubuvanganzo (S1-S3)',
        nameFr: 'Anglais et Littérature (Tronc Commun)',
        nameSw: 'Kiingereza na Fasihi',
        defaultPeriods: '5 periods per week',
        suggestedClasses: ['S1', 'S2', 'S3']
      },
      {
        id: 'olevel_fr',
        nameEn: 'French (Français Tronc Commun)',
        nameRw: 'Igifaransa (Icyiciro Rusange S1-S3)',
        nameFr: 'Français (Tronc Commun)',
        nameSw: 'Kifaransa (Sekondari)',
        defaultPeriods: '3 periods per week',
        suggestedClasses: ['S1', 'S2', 'S3']
      },
      {
        id: 'olevel_sw',
        nameEn: 'Kiswahili (O-Level)',
        nameRw: 'Igiswahili (Icyiciro Rusange S1-S3)',
        nameFr: 'Kiswahili (Tronc Commun)',
        nameSw: 'Kiswahili (Sekondari ya Awali)',
        defaultPeriods: '3 periods per week',
        suggestedClasses: ['S1', 'S2', 'S3']
      },
      {
        id: 'olevel_ict',
        nameEn: 'Information and Communication Technology (ICT)',
        nameRw: 'Ikoranabuhanga n\'Itumanaho (ICT S1-S3)',
        nameFr: 'Technologies de l\'Information et de la Communication (TIC)',
        nameSw: 'TEHAMA / Teknolojia ya Habari na Mawasiliano',
        defaultPeriods: '2 periods per week',
        suggestedClasses: ['S1', 'S2', 'S3']
      },
      {
        id: 'olevel_ent',
        nameEn: 'Entrepreneurship (O-Level)',
        nameRw: 'Rwiyemezamirimo / Entrepreneurship (S1-S3)',
        nameFr: 'Entrepreneuriat (Tronc Commun)',
        nameSw: 'Ujasiriamali (Sekondari)',
        defaultPeriods: '2 periods per week',
        suggestedClasses: ['S1', 'S2', 'S3']
      },
      {
        id: 'olevel_re',
        nameEn: 'Religious Education (RE - Christian / Islamic)',
        nameRw: 'Inyigisho z\'Iyobokamana (RE)',
        nameFr: 'Éducation Religieuse',
        nameSw: 'Elimu ya Dini',
        defaultPeriods: '2 periods per week',
        suggestedClasses: ['S1', 'S2', 'S3']
      },
      {
        id: 'olevel_pe',
        nameEn: 'Physical Education and Sports (PE O-Level)',
        nameRw: 'Imyitozo Ngororangingo n\'Imikino (PE S1-S3)',
        nameFr: 'Éducation Physique et Sportive (EPS)',
        nameSw: 'Elimu ya Viungo na Michezo',
        defaultPeriods: '2 periods per week',
        suggestedClasses: ['S1', 'S2', 'S3']
      },
      {
        id: 'olevel_lit',
        nameEn: 'Literature in English (O-Level)',
        nameRw: 'Ubuvanganzo mu Cyongereza / Literature in English (S1-S3)',
        nameFr: 'Littérature Anglaise (Tronc Commun)',
        nameSw: 'Fasihi ya Kiingereza (Sekondari ya Awali)',
        defaultPeriods: '2 periods per week',
        suggestedClasses: ['S1', 'S2', 'S3']
      },
      {
        id: 'olevel_art',
        nameEn: 'Creative & Fine Arts (O-Level Elective)',
        nameRw: 'Ubugeni n\'Igishushanyo / Fine Arts (S1-S3)',
        nameFr: 'Arts Plastiques et Créatifs',
        nameSw: 'Sanaa za Mikono na Ubunifu',
        defaultPeriods: '2 periods per week',
        suggestedClasses: ['S1', 'S2', 'S3']
      },
      {
        id: 'olevel_agri',
        nameEn: 'Agriculture & Farming Science (O-Level)',
        nameRw: 'Ubuhinzi n\'Ubworozi / Agriculture Science (S1-S3)',
        nameFr: 'Sciences Agricoles',
        nameSw: 'Sayansi ya Kilimo na Ufugaji',
        defaultPeriods: '2 periods per week',
        suggestedClasses: ['S1', 'S2', 'S3']
      }
    ]
  },

  // IV. SECONDARY A-LEVEL (S4 - S6 GENERAL COMBINATIONS)
  {
    id: 'secondary_a_level',
    titleEn: 'IV. Secondary A-Level (S4 - S6 General Combinations)',
    titleRw: 'IV. Icyiciro Gisumbuye cy\'Amashuri Yisumbuye (S4 - S6)',
    titleFr: 'IV. Secondaire Supérieur (S4 - S6)',
    titleSw: 'IV. Sekondari ya Juu (S4 - S6)',
    badge: 'S4 - S6',
    levels: ['Senior 4 (S4)', 'Senior 5 (S5)', 'Senior 6 (S6)'],
    combinations: [
      'MCB (Mathematics - Chemistry - Biology)',
      'PCB (Physics - Chemistry - Biology)',
      'MPC (Mathematics - Physics - Computer Science)',
      'MPG (Mathematics - Physics - Geography)',
      'PCM (Physics - Chemistry - Mathematics)',
      'BCG (Biology - Chemistry - Geography)',
      'MEG (Mathematics - Economics - Geography)',
      'MCE (Mathematics - Computer Science - Economics)',
      'HEG (History - Economics - Geography)',
      'HEL (History - Economics - Literature)',
      'LEG (Literature - Economics - Geography)',
      'LFK (Literature - French - Kinyarwanda)',
      'LKK (Literature - Kiswahili - Kinyarwanda)',
      'EKK (English - Kiswahili - Kinyarwanda)',
      'HKG (History - Kiswahili - Geography)'
    ],
    subjects: [
      {
        id: 'alevel_advmath',
        nameEn: 'Advanced Mathematics (A-Level)',
        nameRw: 'Imibare Msumb进步 / Advanced Mathematics (S4-S6)',
        nameFr: 'Mathématiques Avancées (Secondaire Supérieur)',
        nameSw: 'Hisabati ya Juu (A-Level)',
        defaultPeriods: '7 periods per week',
        suggestedClasses: ['S4', 'S5', 'S6'],
        suggestedCombinations: ['MCB', 'MPC', 'MPG', 'PCM', 'MEG', 'MCE']
      },
      {
        id: 'alevel_submath',
        nameEn: 'Subsidiary Mathematics',
        nameRw: 'Imibare Yunganira / Subsidiary Mathematics',
        nameFr: 'Mathématiques Subsidiaires',
        nameSw: 'Hisabati ya Ziada',
        defaultPeriods: '3 periods per week',
        suggestedClasses: ['S4', 'S5', 'S6'],
        suggestedCombinations: ['PCB', 'BCG', 'HEG', 'HEL']
      },
      {
        id: 'alevel_phy',
        nameEn: 'Physics (Principal A-Level)',
        nameRw: 'Ubugenge / Physics (S4-S6)',
        nameFr: 'Physique (Majeure A-Level)',
        nameSw: 'Fizikia ya Juu',
        defaultPeriods: '7 periods per week',
        suggestedClasses: ['S4', 'S5', 'S6'],
        suggestedCombinations: ['PCB', 'MPC', 'MPG', 'PCM']
      },
      {
        id: 'alevel_chem',
        nameEn: 'Chemistry (Principal A-Level)',
        nameRw: 'Ubutabire / Chemistry (S4-S6)',
        nameFr: 'Chimie (Majeure A-Level)',
        nameSw: 'Kemia ya Juu',
        defaultPeriods: '7 periods per week',
        suggestedClasses: ['S4', 'S5', 'S6'],
        suggestedCombinations: ['MCB', 'PCB', 'PCM', 'BCG']
      },
      {
        id: 'alevel_bio',
        nameEn: 'Biology (Principal A-Level)',
        nameRw: 'Ubumenyi bw\'Ubuzima / Biology (S4-S6)',
        nameFr: 'Biologie (Majeure A-Level)',
        nameSw: 'Biolojia ya Juu',
        defaultPeriods: '7 periods per week',
        suggestedClasses: ['S4', 'S5', 'S6'],
        suggestedCombinations: ['MCB', 'PCB', 'BCG']
      },
      {
        id: 'alevel_cs',
        nameEn: 'Computer Science (Programming, DB & Networking)',
        nameRw: 'Ubumenyi bwa Mudasobwa / Computer Science',
        nameFr: 'Informatique et Sciences du Numérique',
        nameSw: 'Sayansi ya Kompyuta',
        defaultPeriods: '7 periods per week',
        suggestedClasses: ['S4', 'S5', 'S6'],
        suggestedCombinations: ['MPC', 'MCE']
      },
      {
        id: 'alevel_econ',
        nameEn: 'Economics (Principal A-Level)',
        nameRw: 'Ubukungu / Economics (S4-S6)',
        nameFr: 'Sciences Économiques',
        nameSw: 'Uchumi (A-Level)',
        defaultPeriods: '7 periods per week',
        suggestedClasses: ['S4', 'S5', 'S6'],
        suggestedCombinations: ['MEG', 'HEG', 'HEL', 'LEG', 'MCE']
      },
      {
        id: 'alevel_geo',
        nameEn: 'Geography (Principal A-Level)',
        nameRw: 'Ubumenyi bw\'Isi / Geography (S4-S6)',
        nameFr: 'Géographie Approfondie',
        nameSw: 'Jiografia ya Juu',
        defaultPeriods: '7 periods per week',
        suggestedClasses: ['S4', 'S5', 'S6'],
        suggestedCombinations: ['MPG', 'BCG', 'HEG', 'MEG', 'LEG', 'HKG']
      },
      {
        id: 'alevel_hist',
        nameEn: 'History (Principal A-Level)',
        nameRw: 'Amateka / History (S4-S6)',
        nameFr: 'Histoire Générale et Contemporaine',
        nameSw: 'Historia ya Juu',
        defaultPeriods: '7 periods per week',
        suggestedClasses: ['S4', 'S5', 'S6'],
        suggestedCombinations: ['HEG', 'HEL', 'HKG']
      },
      {
        id: 'alevel_lit',
        nameEn: 'Literature in English (Principal A-Level)',
        nameRw: 'Ubuvanganzo mu Cyongereza / Literature in English',
        nameFr: 'Littérature Anglaise',
        nameSw: 'Fasihi ya Kiingereza',
        defaultPeriods: '7 periods per week',
        suggestedClasses: ['S4', 'S5', 'S6'],
        suggestedCombinations: ['HEL', 'LEG', 'LFK', 'LKK', 'EKK']
      },
      {
        id: 'alevel_kiny',
        nameEn: 'Ikinyarwanda (Principal A-Level)',
        nameRw: 'Ikinyarwanda cy\'Ubuvanganzo n\'Ururimi (S4-S6)',
        nameFr: 'Ikinyarwanda et Littérature Rwandaise',
        nameSw: 'Kinyarwanda na Fasihi',
        defaultPeriods: '7 periods per week',
        suggestedClasses: ['S4', 'S5', 'S6'],
        suggestedCombinations: ['LFK', 'LKK', 'EKK']
      },
      {
        id: 'alevel_fr',
        nameEn: 'Français (Principal A-Level)',
        nameRw: 'Igifaransa cy\'Ubuvanganzo / Français (S4-S6)',
        nameFr: 'Français et Littérature Francophone',
        nameSw: 'Kifaransa na Fasihi',
        defaultPeriods: '7 periods per week',
        suggestedClasses: ['S4', 'S5', 'S6'],
        suggestedCombinations: ['LFK']
      },
      {
        id: 'alevel_sw',
        nameEn: 'Kiswahili (Principal A-Level)',
        nameRw: 'Igiswahili cy\'Ubuvanganzo / Kiswahili (S4-S6)',
        nameFr: 'Kiswahili et Littérature Swahili',
        nameSw: 'Kiswahili na Fasihi ya Kiswahili',
        defaultPeriods: '7 periods per week',
        suggestedClasses: ['S4', 'S5', 'S6'],
        suggestedCombinations: ['LKK', 'EKK', 'HKG']
      },
      {
        id: 'alevel_ent',
        nameEn: 'Entrepreneurship (A-Level Core)',
        nameRw: 'Rwiyemezamirimo / Entrepreneurship (S4-S6)',
        nameFr: 'Entrepreneuriat et Gestion',
        nameSw: 'Ujasiriamali wa Juu',
        defaultPeriods: '3 periods per week',
        suggestedClasses: ['S4', 'S5', 'S6']
      },
      {
        id: 'alevel_gscs',
        nameEn: 'General Studies and Communication Skills (GSCS)',
        nameRw: 'Ubumenyi Rusange n\'Itumanaho / GSCS',
        nameFr: 'Études Générales et Compétences de Communication',
        nameSw: 'Masomo ya Jumla na Mawasiliano (GSCS)',
        defaultPeriods: '2 periods per week',
        suggestedClasses: ['S4', 'S5', 'S6']
      },
      {
        id: 'alevel_subict',
        nameEn: 'Subsidiary ICT (Sub-ICT / Computer Studies)',
        nameRw: 'Ikoranabuhanga Yunganira / Subsidiary ICT (S4-S6)',
        nameFr: 'Informatique Subsidiaire (Sub-TIC)',
        nameSw: 'TEHAMA ya Ziada (Sub-ICT)',
        defaultPeriods: '3 periods per week',
        suggestedClasses: ['S4', 'S5', 'S6']
      },
      {
        id: 'alevel_fineart',
        nameEn: 'Fine Art & Visual Design (Principal A-Level)',
        nameRw: 'Ubugeni, Igishushanyo n\'Imideri / Fine Art (S4-S6)',
        nameFr: 'Beaux-Arts et Arts Visuels',
        nameSw: 'Sanaa za Mikono na Michoro (Fine Art)',
        defaultPeriods: '7 periods per week',
        suggestedClasses: ['S4', 'S5', 'S6']
      },
      {
        id: 'alevel_rs',
        nameEn: 'Religious Studies (A-Level Elective)',
        nameRw: 'Inyigisho z\'Iyobokamana z\'Ibanze / Religious Studies (S4-S6)',
        nameFr: 'Sciences Religieuses',
        nameSw: 'Masomo ya Dini (A-Level)',
        defaultPeriods: '3 periods per week',
        suggestedClasses: ['S4', 'S5', 'S6']
      }
    ]
  },

  // V. TEACHER TRAINING COLLEGES (TTCs)
  {
    id: 'ttc_colleges',
    titleEn: 'V. Teacher Training Colleges (TTCs / Nderabarezi)',
    titleRw: 'V. Amashuri Nderabarezi (TTCs)',
    titleFr: 'V. Écoles Normales d\'Instituteurs (TTC)',
    titleSw: 'V. Vyuo vya Mafunzo ya Ualimu (TTC)',
    badge: 'TTC Y1 - Y3',
    levels: ['Year One (Y1)', 'Year Two (Y2)', 'Year Three (Y3)'],
    combinations: [
      'ECLPE (Early Childhood & Lower Primary Education)',
      'SME (Science and Mathematics Education)',
      'LE (Languages Education: Kinyarwanda, English, French, Kiswahili)',
      'SSE (Social Studies Education: History, Geography, SRS)'
    ],
    subjects: [
      {
        id: 'ttc_foe',
        nameEn: 'Foundations of Education (FOE & Educational Philosophy)',
        nameRw: 'Inkomoko n\'Inkingi z\'Uburezi / Foundations of Education',
        nameFr: 'Fondements de l\'Éducation et Philosophie Pédagogique',
        nameSw: 'Misingi ya Elimu na Falsafa ya Ualimu',
        defaultPeriods: '4 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3']
      },
      {
        id: 'ttc_psych',
        nameEn: 'Educational Psychology & Child Development',
        nameRw: 'Imitekerereze n\'Imikurire y\'Umwana mu Burezi (Psychology)',
        nameFr: 'Psychologie de l\'Éducation et Développement de l\'Enfant',
        nameSw: 'Saikolojia ya Elimu na Ukuaji wa Mtoto',
        defaultPeriods: '4 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3']
      },
      {
        id: 'ttc_pedagogy',
        nameEn: 'Pedagogy, Curriculum Studies & CBC Methodology',
        nameRw: 'Uburyo bwo Kwigisha no Gutegura Amasomo (Pedagogy & CBC)',
        nameFr: 'Pédagogie Générale et Didactique CBC',
        nameSw: 'Mbinu za Ufundishaji na Muhtasari wa CBC',
        defaultPeriods: '5 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3']
      },
      {
        id: 'ttc_sne',
        nameEn: 'Special Needs and Inclusive Education (SNE)',
        nameRw: 'Uburezi Bwihariye n\'Uburezi Bwibanda kuri Bose (SNE)',
        nameFr: 'Éducation Spéciale et Inclusive',
        nameSw: 'Elimu Jumuishi na Mahitaji Maalum',
        defaultPeriods: '3 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3']
      },
      {
        id: 'ttc_teaching_practice',
        nameEn: 'Teaching Practice, Micro-Teaching & Lesson Evaluation',
        nameRw: 'Imenyerezamwuga mu Kwigisha (Teaching Practice & Micro-teaching)',
        nameFr: 'Stage Pédagogique et Micro-Enseignement',
        nameSw: 'Mafunzo ya Vitendo ya Ualimu',
        defaultPeriods: '4 periods per week',
        suggestedClasses: ['Y2', 'Y3']
      },
      {
        id: 'ttc_edtech',
        nameEn: 'Educational Technology & Teaching Aids Production',
        nameRw: 'Ikoranabuhanga mu Burezi no Gukora Ibikoresho Byigishwaho',
        nameFr: 'Technologies Éducatives et Fabrication de Matériel Didactique',
        nameSw: 'Teknolojia ya Elimu na Zana za Kufundishia',
        defaultPeriods: '3 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3']
      },
      {
        id: 'ttc_meth_math',
        nameEn: 'Methodology of Teaching Primary Mathematics (SME / ECLPE)',
        nameRw: 'Uburyo bwo Kwigisha Imibare mu Mashuri Abanza',
        nameFr: 'Didactique des Mathématiques au Primaire',
        nameSw: 'Mbinu za Kufundisha Hisabati ya Msingi',
        defaultPeriods: '4 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3'],
        suggestedCombinations: ['SME', 'ECLPE']
      },
      {
        id: 'ttc_meth_sci',
        nameEn: 'Methodology of Teaching Science & SET (SME / ECLPE)',
        nameRw: 'Uburyo bwo Kwigisha Ubumenyi n\'Ikoranabuhanga (SET)',
        nameFr: 'Didactique des Sciences et Technologies Élémentaires',
        nameSw: 'Mbinu za Kufundisha Sayansi ya Msingi',
        defaultPeriods: '4 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3'],
        suggestedCombinations: ['SME', 'ECLPE']
      },
      {
        id: 'ttc_meth_lang',
        nameEn: 'Methodology of Teaching Languages (Kinyarwanda & English)',
        nameRw: 'Uburyo bwo Kwigisha Indimi (Ikinyarwanda n\'Icyongereza)',
        nameFr: 'Didactique des Langues (Kinyarwanda et Anglais)',
        nameSw: 'Mbinu za Kufundisha Lugha',
        defaultPeriods: '4 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3'],
        suggestedCombinations: ['LE', 'ECLPE']
      },
      {
        id: 'ttc_meth_soc',
        nameEn: 'Methodology of Teaching Social Studies & SRS (SSE)',
        nameRw: 'Uburyo bwo Kwigisha Ubumenyi bw\'Imibanire (SRS / SSE)',
        nameFr: 'Didactique des Sciences Sociales',
        nameSw: 'Mbinu za Kufundisha Masomo ya Jamii',
        defaultPeriods: '4 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3'],
        suggestedCombinations: ['SSE']
      },
      {
        id: 'ttc_school_mgt',
        nameEn: 'School Management, Administration & Leadership',
        nameRw: 'Ubuyobozi n\'Imicungire y\'Ishuri (School Management)',
        nameFr: 'Gestion et Administration Scolaire',
        nameSw: 'Usimamizi na Uongozi wa Shule',
        defaultPeriods: '3 periods per week',
        suggestedClasses: ['Y2', 'Y3']
      },
      {
        id: 'ttc_meth_arts_pe',
        nameEn: 'Methodology of Teaching Creative Arts & Physical Education',
        nameRw: 'Uburyo bwo Kwigisha Ubugeni n\'Imikino Ngororangingo (Arts & PE)',
        nameFr: 'Didactique des Arts Créatifs et EPS',
        nameSw: 'Mbinu za Kufundisha Sanaa na Michezo',
        defaultPeriods: '3 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3'],
        suggestedCombinations: ['ECLPE', 'LE', 'SSE']
      },
      {
        id: 'ttc_assessment',
        nameEn: 'Educational Assessment, Evaluation & Test Construction',
        nameRw: 'Iseruzabumenyi n\'Isuzuma mu Burezi (Assessment & Evaluation)',
        nameFr: 'Évaluation Pédagogique et Docimologie',
        nameSw: 'Tathmini na Upimaji wa Elimu',
        defaultPeriods: '3 periods per week',
        suggestedClasses: ['Y2', 'Y3']
      },
      {
        id: 'ttc_counselling',
        nameEn: 'Guidance, Counselling & Peace Education',
        nameRw: 'Ubujyanama, Inyigisho z\'Amahoro n\'Imyitwarire (Guidance & Counselling)',
        nameFr: 'Orientation, Guidance et Éducation à la Paix',
        nameSw: 'Ushauri Nasaha na Elimu ya Amani',
        defaultPeriods: '2 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3']
      },
      // Core Content Subjects taught in TTC Options (SME, LE, SSE, ECLPE)
      {
        id: 'ttc_math',
        nameEn: 'Mathematics (TTC SME / ECLPE Option)',
        nameRw: 'Imibare / Mathematics (TTC Y1-Y3)',
        nameFr: 'Mathématiques pour TTC',
        nameSw: 'Hisabati kwa TTC',
        defaultPeriods: '5 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3'],
        suggestedCombinations: ['SME', 'ECLPE']
      },
      {
        id: 'ttc_ent',
        nameEn: 'Entrepreneurship & Financial Education (TTC)',
        nameRw: 'Rwiyemezamirimo n\'Ubucuruzi / Entrepreneurship (TTC Y1-Y3)',
        nameFr: 'Entrepreneuriat et Éducation Financière TTC',
        nameSw: 'Ujasiriamali na Elimu ya Fedha TTC',
        defaultPeriods: '3 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3']
      },
      {
        id: 'ttc_kiny',
        nameEn: 'Kinyarwanda Language & Literature (TTC LE / ECLPE)',
        nameRw: 'Ikinyarwanda n\'Ubuvanganzo / Kinyarwanda (TTC Y1-Y3)',
        nameFr: 'Langue et Littérature Kinyarwanda TTC',
        nameSw: 'Kinyarwanda na Fasihi TTC',
        defaultPeriods: '5 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3'],
        suggestedCombinations: ['LE', 'ECLPE']
      },
      {
        id: 'ttc_eng',
        nameEn: 'English Language & Literature (TTC LE / ECLPE)',
        nameRw: 'Icyongereza n\'Ubuvanganzo / English (TTC Y1-Y3)',
        nameFr: 'Langue et Littérature Anglaise TTC',
        nameSw: 'Kiingereza na Fasihi TTC',
        defaultPeriods: '5 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3'],
        suggestedCombinations: ['LE', 'ECLPE']
      },
      {
        id: 'ttc_fr',
        nameEn: 'French Language & Literature (TTC LE Option)',
        nameRw: 'Igifaransa n\'Ubuvanganzo / Français (TTC Y1-Y3)',
        nameFr: 'Langue et Littérature Française TTC',
        nameSw: 'Kifaransa na Fasihi TTC',
        defaultPeriods: '4 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3'],
        suggestedCombinations: ['LE']
      },
      {
        id: 'ttc_sw',
        nameEn: 'Kiswahili Language & Literature (TTC LE Option)',
        nameRw: 'Igiswahili n\'Ubuvanganzo / Kiswahili (TTC Y1-Y3)',
        nameFr: 'Langue et Littérature Kiswahili TTC',
        nameSw: 'Kiswahili na Fasihi TTC',
        defaultPeriods: '4 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3'],
        suggestedCombinations: ['LE']
      },
      {
        id: 'ttc_bio',
        nameEn: 'Biology & Life Sciences (TTC SME / ECLPE)',
        nameRw: 'Ibyabuzima n\'Ibinyabuzima / Biology (TTC Y1-Y3)',
        nameFr: 'Biologie et Sciences de la Vie TTC',
        nameSw: 'Biolojia na Sayansi ya Uzima TTC',
        defaultPeriods: '4 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3'],
        suggestedCombinations: ['SME', 'ECLPE']
      },
      {
        id: 'ttc_chem',
        nameEn: 'Chemistry (TTC SME Option)',
        nameRw: 'Ubumenyi bw\'Ibyatanzwe / Chemistry (TTC Y1-Y3)',
        nameFr: 'Chimie TTC',
        nameSw: 'Kemia TTC',
        defaultPeriods: '4 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3'],
        suggestedCombinations: ['SME']
      },
      {
        id: 'ttc_phy',
        nameEn: 'Physics (TTC SME Option)',
        nameRw: 'Ubugenge / Physics (TTC Y1-Y3)',
        nameFr: 'Physique TTC',
        nameSw: 'Lugha na Fizikia TTC',
        defaultPeriods: '4 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3'],
        suggestedCombinations: ['SME']
      },
      {
        id: 'ttc_geog',
        nameEn: 'Geography, Environment & Climate (TTC SSE Option)',
        nameRw: 'Ubumenyi bw\'Isi n\'Ikirere / Geography (TTC Y1-Y3)',
        nameFr: 'Géographie et Environnement TTC',
        nameSw: 'Jiografia na Mazingira TTC',
        defaultPeriods: '4 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3'],
        suggestedCombinations: ['SSE']
      },
      {
        id: 'ttc_hist',
        nameEn: 'History, Genocide Studies & Citizenship (TTC SSE)',
        nameRw: 'Amateka, Uburere mboneragihugu n\'Amasomo y\'Jenoside / History (TTC Y1-Y3)',
        nameFr: 'Histoire, Citoyenneté et Études du Génocide TTC',
        nameSw: 'Historia na Uraia TTC',
        defaultPeriods: '4 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3'],
        suggestedCombinations: ['SSE']
      },
      {
        id: 'ttc_ict',
        nameEn: 'ICT & Computer Studies (TTC All Options)',
        nameRw: 'Ikoranabuhanga / ICT & Computer Literacy (TTC Y1-Y3)',
        nameFr: 'Informatique et Bureautique TTC',
        nameSw: 'TEHAMA na Kompyuta TTC',
        defaultPeriods: '3 periods per week',
        suggestedClasses: ['Y1', 'Y2', 'Y3']
      }
    ]
  },

  // VI. TECHNICAL & VOCATIONAL EDUCATION & TRAINING (TVET)
  {
    id: 'tvet_trades',
    titleEn: 'VI. TVET & Vocational Trades (Imyuga n\'Ubumenyingiro)',
    titleRw: 'VI. Amashuri y\'Imyuga n\'Ubumenyingiro (TVET / VTC / TSS)',
    titleFr: 'VI. Enseignement Technique et Professionnel (ETFP / TVET)',
    titleSw: 'VI. Mafunzo ya Ufundi Stadi na Amali (TVET)',
    badge: 'TVET L1 - L5',
    levels: ['Level 1 (L1)', 'Level 2 (L2)', 'Level 3 (L3)', 'Level 4 (L4)', 'Level 5 (L5)'],
    combinations: [
      'Software Development (SOD)',
      'Networking & Cybersecurity (NET)',
      'Multimedia & Graphic Design',
      'Electricity & Electrical Technology',
      'Electronics & Telecommunications',
      'Automobile Mechanics (AUT)',
      'Masonry & Building Construction (MAS)',
      'Plumbing & Pipe Fitting (PLU)',
      'Carpentry & Wood Technology (CAR)',
      'Welding & Metal Fabrication (WEL)',
      'Culinary Arts & Food Production (CUL)',
      'Tourism & Hotel Operations (THO)',
      'Tailoring, Fashion & Garment Design (FAD)',
      'Food Processing & Preservation (FOP)',
      'Animal Health & Veterinary Services (VET)',
      'Crop Production & Horticulture (CRP)',
      'Accounting & Business Services (ACC)',
      'Solar & Renewable Energy Technology (SOL)',
      'Electronics & Telecommunications (ETT)',
      'Land Surveying & Civil Engineering (SUR)',
      'Hairdressing & Cosmetology (HBC)',
      'Office Administration & Secretarial Services (BOA)'
    ],
    subjects: [
      {
        id: 'tvet_sod',
        nameEn: 'Software Development & Web Programming (HTML, CSS, JS, Python, DB)',
        nameRw: 'Ikoranabuhanga ryo Gukora Porogaramu za Mudasobwa (Software Development)',
        nameFr: 'Développement Logiciel et Programmation Web',
        nameSw: 'Uundaji wa Programu za Kompyuta na Tovuti',
        defaultPeriods: '12 periods per week',
        suggestedClasses: ['Level 3', 'Level 4', 'Level 5'],
        suggestedCombinations: ['Software Development (SOD)']
      },
      {
        id: 'tvet_net',
        nameEn: 'Computer Networking, Maintenance & Cybersecurity',
        nameRw: 'Guhuza Mudasobwa, Kuzisana no Kuzirinda (Networking & Security)',
        nameFr: 'Réseaux Informatiques, Maintenance et Cybersécurité',
        nameSw: 'Mitandao ya Kompyuta na Usalama wa Mtandao',
        defaultPeriods: '10 periods per week',
        suggestedClasses: ['Level 3', 'Level 4', 'Level 5'],
        suggestedCombinations: ['Networking & Cybersecurity (NET)']
      },
      {
        id: 'tvet_elec',
        nameEn: 'Domestic & Industrial Electrical Technology',
        nameRw: 'Amashanyarazi yo mu Nzu n\'ay\'Inganda (Electricity)',
        nameFr: 'Électricité Bâtiment et Industrielle',
        nameSw: 'Teknolojia ya Umeme wa Majumbani na Viwandani',
        defaultPeriods: '12 periods per week',
        suggestedClasses: ['Level 3', 'Level 4', 'Level 5'],
        suggestedCombinations: ['Electricity & Electrical Technology']
      },
      {
        id: 'tvet_auto',
        nameEn: 'Automobile Mechanics & Automotive Technology',
        nameRw: 'Ubunyakanika bwo Gusana Ibinyabiziga (Automobile Mechanics)',
        nameFr: 'Mécanique Automobile et Diagnostic Véhicule',
        nameSw: 'Ufundi wa Magari na Mitambo',
        defaultPeriods: '12 periods per week',
        suggestedClasses: ['Level 3', 'Level 4', 'Level 5'],
        suggestedCombinations: ['Automobile Mechanics (AUT)']
      },
      {
        id: 'tvet_masonry',
        nameEn: 'Masonry, Bricklaying & Building Construction',
        nameRw: 'Ubwubatsi bwa Kijyambere n\'Ubuyobizi bw\'Inzu (Masonry)',
        nameFr: 'Maçonnerie et Construction de Bâtiments',
        nameSw: 'Uashi na Ujenzi wa Majengo',
        defaultPeriods: '12 periods per week',
        suggestedClasses: ['Level 3', 'Level 4', 'Level 5'],
        suggestedCombinations: ['Masonry & Building Construction (MAS)']
      },
      {
        id: 'tvet_plumb',
        nameEn: 'Plumbing, Water Systems & Pipe Fitting',
        nameRw: 'Gushyira no Gusana Imiferege n\'Umiyoboro y\'Amazi (Plumbing)',
        nameFr: 'Plomberie Sanitaire et Canalisations',
        nameSw: 'Ufundi Bomba na Mifereji ya Maji',
        defaultPeriods: '10 periods per week',
        suggestedClasses: ['Level 3', 'Level 4', 'Level 5'],
        suggestedCombinations: ['Plumbing & Pipe Fitting (PLU)']
      },
      {
        id: 'tvet_carp',
        nameEn: 'Carpentry, Joinery & Woodworking Technology',
        nameRw: 'Ububaji bw\'Ibikoresho by\'Imbaho (Carpentry & Woodwork)',
        nameFr: 'Menuiserie et Travail du Bois',
        nameSw: 'Useremala na Teknolojia ya Mbao',
        defaultPeriods: '10 periods per week',
        suggestedClasses: ['Level 3', 'Level 4', 'Level 5'],
        suggestedCombinations: ['Carpentry & Wood Technology (CAR)']
      },
      {
        id: 'tvet_weld',
        nameEn: 'Welding, Metal Fabrication & Machining',
        nameRw: 'Guteranya no Guhimba Ibyuma (Welding & Fabrication)',
        nameFr: 'Soudure et Chaudronnerie Métallique',
        nameSw: 'Uchomeleaji na Uundaji wa Vyuma',
        defaultPeriods: '10 periods per week',
        suggestedClasses: ['Level 3', 'Level 4', 'Level 5'],
        suggestedCombinations: ['Welding & Metal Fabrication (WEL)']
      },
      {
        id: 'tvet_culinary',
        nameEn: 'Culinary Arts, Food Production & Bakery',
        nameRw: 'Guteka Kijyambere no Gutunganya Amafunguro (Culinary Arts)',
        nameFr: 'Arts Culinaires, Cuisine et Pâtisserie',
        nameSw: 'Upishi Bora na Uzalishaji wa Vyakula',
        defaultPeriods: '12 periods per week',
        suggestedClasses: ['Level 3', 'Level 4', 'Level 5'],
        suggestedCombinations: ['Culinary Arts & Food Production (CUL)']
      },
      {
        id: 'tvet_tourism',
        nameEn: 'Tourism, Hotel Operations & Customer Care',
        nameRw: 'Ubukerarugendo, Kwakira Abashyitsi n\'Amahoteli (Tourism)',
        nameFr: 'Tourisme, Hôtellerie et Réception',
        nameSw: 'Utalii na Uendeshaji wa Hoteli',
        defaultPeriods: '10 periods per week',
        suggestedClasses: ['Level 3', 'Level 4', 'Level 5'],
        suggestedCombinations: ['Tourism & Hotel Operations (THO)']
      },
      {
        id: 'tvet_fashion',
        nameEn: 'Tailoring, Fashion & Garment Design',
        nameRw: 'Kudoda, Gukora Imyenda n\'Imideri (Tailoring & Fashion)',
        nameFr: 'Coupe-Couture, Mode et Stylisme',
        nameSw: 'Ushonaji na Ubunifu wa Mavazi',
        defaultPeriods: '12 periods per week',
        suggestedClasses: ['Level 3', 'Level 4', 'Level 5'],
        suggestedCombinations: ['Tailoring, Fashion & Garment Design (FAD)']
      },
      {
        id: 'tvet_agriculture',
        nameEn: 'Crop Production, Horticulture & Agro-business',
        nameRw: 'Ubuhinzi bwa Kijyambere n\'Ubuhinzi bw\'Imboga n\'Imbuto (Crop Production)',
        nameFr: 'Production Végétale, Horticulture et Agro-business',
        nameSw: 'Uzalishaji wa Mazao na Kilimo Biashara',
        defaultPeriods: '10 periods per week',
        suggestedClasses: ['Level 3', 'Level 4', 'Level 5'],
        suggestedCombinations: ['Crop Production & Horticulture (CRP)']
      },
      {
        id: 'tvet_vet',
        nameEn: 'Animal Health, Veterinary & Livestock Production',
        nameRw: 'Ubuvuzi bw\'Amatungo n\'Ubworozi bwa Kijyambere (Veterinary)',
        nameFr: 'Santé Animale, Élevage et Soins Vétérinaires',
        nameSw: 'Afya ya Mifugo na Ufugaji Bora',
        defaultPeriods: '10 periods per week',
        suggestedClasses: ['Level 3', 'Level 4', 'Level 5'],
        suggestedCombinations: ['Animal Health & Veterinary Services (VET)']
      },
      {
        id: 'tvet_food_proc',
        nameEn: 'Food Processing, Quality Control & Packaging',
        nameRw: 'Gutunganya no Kubika Ibiribwa (Food Processing)',
        nameFr: 'Transformation Agroalimentaire et Contrôle Qualité',
        nameSw: 'Usindikaji wa Vyakula na Uhakiki wa Ubora',
        defaultPeriods: '10 periods per week',
        suggestedClasses: ['Level 3', 'Level 4', 'Level 5'],
        suggestedCombinations: ['Food Processing & Preservation (FOP)']
      },
      {
        id: 'tvet_acc',
        nameEn: 'Accounting, Bookkeeping & Financial Reporting',
        nameRw: 'Ibaruramari n\'Icungamutungo (Accounting & Finance)',
        nameFr: 'Comptabilité et Gestion Financière',
        nameSw: 'Uhasibu na Taarifa za Kifedha',
        defaultPeriods: '10 periods per week',
        suggestedClasses: ['Level 3', 'Level 4', 'Level 5'],
        suggestedCombinations: ['Accounting & Business Services (ACC)']
      },
      {
        id: 'tvet_solar',
        nameEn: 'Renewable Energy, Solar Installation & Maintenance',
        nameRw: 'Ingufu z\'Izuba n\'Ingufu Zishya (Solar & Renewable Energy)',
        nameFr: 'Énergie Solaire et Énergies Renouvelables',
        nameSw: 'Nishati Mbadala na Sola',
        defaultPeriods: '12 periods per week',
        suggestedClasses: ['Level 3', 'Level 4', 'Level 5'],
        suggestedCombinations: ['Solar & Renewable Energy Technology (SOL)']
      },
      {
        id: 'tvet_telecom',
        nameEn: 'Electronics, Telecommunications & Signal Processing',
        nameRw: 'Elektroniki n\'Itumanaho ry\'Ibanze (Electronics & Telecom)',
        nameFr: 'Électronique et Télécommunications',
        nameSw: 'Elektroniki na Mawasiliano',
        defaultPeriods: '12 periods per week',
        suggestedClasses: ['Level 3', 'Level 4', 'Level 5'],
        suggestedCombinations: ['Electronics & Telecommunications (ETT)']
      },
      {
        id: 'tvet_survey',
        nameEn: 'Land Surveying, GIS & Civil Engineering Technology',
        nameRw: 'Gupima Ubutaka, GIS n\'Ubwubatsi (Land Surveying & Civil)',
        nameFr: 'Topographie, Arpentage et Génie Civil',
        nameSw: 'Upimaji wa Ardhi na Ujenzi',
        defaultPeriods: '12 periods per week',
        suggestedClasses: ['Level 3', 'Level 4', 'Level 5'],
        suggestedCombinations: ['Land Surveying & Civil Engineering (SUR)']
      },
      {
        id: 'tvet_beauty',
        nameEn: 'Hairdressing, Beauty Therapy & Cosmetology',
        nameRw: 'Kogosha, Gutunganya Imusatsi n\'Ubwiza (Hairdressing & Beauty)',
        nameFr: 'Coiffure, Esthétique et Cosmétologie',
        nameSw: 'Ushusi, Urembo na Cosmetology',
        defaultPeriods: '10 periods per week',
        suggestedClasses: ['Level 3', 'Level 4', 'Level 5'],
        suggestedCombinations: ['Hairdressing & Cosmetology (HBC)']
      },
      {
        id: 'tvet_office',
        nameEn: 'Office Administration, Secretarial Practice & Archives',
        nameRw: 'Imicungire y\'Ibiro, Ubwanditsi n\'Ububiko (Office Administration)',
        nameFr: 'Secrétariat et Administration des Bureaux',
        nameSw: 'Usimamizi wa Ofisi na Ukarani',
        defaultPeriods: '10 periods per week',
        suggestedClasses: ['Level 3', 'Level 4', 'Level 5'],
        suggestedCombinations: ['Office Administration & Secretarial Services (BOA)']
      }
    ]
  }
];

function cleanBaseSubjectName(str: string): string {
  if (!str) return '';
  return str
    .replace(/\s*\((P1-P6|P4-P6|P1-P3|S1-S3|S4-S6|Y1-Y3|N1-N3|Upper Primary P4-P6|Lower Primary P1-P3|P1|P2|P3|P4|P5|P6|S1|S2|S3|S4|S5|S6|Y1|Y2|Y3|L1|L2|L3|L4|L5|Primary|Maternelle|Shule ya Msingi|Primaire|O-Level|A-Level|Tronc Commun)\)/gi, '')
    .trim();
}

function extractShortClass(cls: string): string {
  if (!cls) return '';
  if (cls.includes('(') && cls.includes(')')) {
    const match = cls.match(/\(([^)]+)\)/);
    if (match) return match[1].trim();
  }
  return cls.trim();
}

// Dynamically expand every raw subject item into explicit per-level subject entries (e.g., Mathematics P1, Mathematics P2, Mathematics P3...)
export const RWANDA_EDUCATION_CURRICULUM: RwandaEducationCategory[] = RAW_RWANDA_EDUCATION_CURRICULUM.map(cat => {
  const expandedSubjects: RwandaSubjectItem[] = [];

  cat.subjects.forEach(subj => {
    const classes = subj.suggestedClasses && subj.suggestedClasses.length > 0 
      ? subj.suggestedClasses 
      : cat.levels;

    if (classes && classes.length > 0) {
      classes.forEach(cls => {
        const shortCls = extractShortClass(cls);
        const baseEn = cleanBaseSubjectName(subj.nameEn);
        const baseRw = cleanBaseSubjectName(subj.nameRw);
        const baseFr = cleanBaseSubjectName(subj.nameFr);
        const baseSw = cleanBaseSubjectName(subj.nameSw);

        expandedSubjects.push({
          ...subj,
          id: `${subj.id}_${shortCls.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          nameEn: `${baseEn} ${shortCls}`,
          nameRw: `${baseRw} ${shortCls}`,
          nameFr: `${baseFr} ${shortCls}`,
          nameSw: `${baseSw} ${shortCls}`,
          suggestedClasses: [cls]
        });
      });
    } else {
      expandedSubjects.push(subj);
    }
  });

  return {
    ...cat,
    subjects: expandedSubjects
  };
});

// Flat list helper of all expanded subjects with their category
export const ALL_RWANDA_SUBJECT_NAMES = RWANDA_EDUCATION_CURRICULUM.flatMap(cat => 
  cat.subjects.map(s => ({
    category: cat.titleEn,
    categoryBadge: cat.badge,
    nameEn: s.nameEn,
    nameRw: s.nameRw,
    nameFr: s.nameFr,
    nameSw: s.nameSw,
    defaultPeriods: s.defaultPeriods || '4 periods per week',
    suggestedClasses: s.suggestedClasses || cat.levels,
    suggestedCombinations: s.suggestedCombinations || cat.combinations || []
  }))
);

export interface RwandaCombinationGroup {
  category: string;
  badge: string;
  options: { label: string; value: string; code?: string }[];
}

export const RWANDA_COMBINATIONS_AND_STREAMS: RwandaCombinationGroup[] = [
  {
    category: 'General & Lower Levels (Inshuke, Abanza, Tronc Commun)',
    badge: 'General / Streams',
    options: [
      { label: 'General Stream (Rusange)', value: 'General / Rusange' },
      { label: 'Stream A (Icyiciro A)', value: 'Stream A' },
      { label: 'Stream B (Icyiciro B)', value: 'Stream B' },
      { label: 'Stream C (Icyiciro C)', value: 'Stream C' },
      { label: 'Stream D (Icyiciro D)', value: 'Stream D' },
      { label: 'Stream E (Icyiciro E)', value: 'Stream E' },
      { label: 'Stream F (Icyiciro F)', value: 'Stream F' },
      { label: 'Stream G (Icyiciro G)', value: 'Stream G' },
      { label: 'Stream H (Icyiciro H)', value: 'Stream H' },
      { label: 'Early Childhood Development (ECD / Nursery)', value: 'ECD / Nursery' },
      { label: 'Lower Primary Section (P1 - P3)', value: 'Lower Primary' },
      { label: 'Upper Primary Section (P4 - P6)', value: 'Upper Primary' },
      { label: 'O-Level Tronc Commun (S1 - S3)', value: 'O-Level / Tronc Commun' }
    ]
  },
  {
    category: 'Secondary A-Level Science & Mathematics (S4 - S6)',
    badge: 'A-Level Sciences',
    options: [
      { label: 'MCB (Mathematics - Chemistry - Biology)', value: 'MCB', code: 'MCB' },
      { label: 'PCB (Physics - Chemistry - Biology)', value: 'PCB', code: 'PCB' },
      { label: 'MPC (Mathematics - Physics - Computer Science)', value: 'MPC', code: 'MPC' },
      { label: 'MPG (Mathematics - Physics - Geography)', value: 'MPG', code: 'MPG' },
      { label: 'PCM (Physics - Chemistry - Mathematics)', value: 'PCM', code: 'PCM' },
      { label: 'BCG (Biology - Chemistry - Geography)', value: 'BCG', code: 'BCG' },
      { label: 'MCE (Mathematics - Computer Science - Economics)', value: 'MCE', code: 'MCE' },
      { label: 'MSE (Mathematics - Sports & PE - Economics)', value: 'MSE', code: 'MSE' },
      { label: 'MSE Stream 1 (Mathematics Science Education Stream One)', value: 'MSE Stream 1', code: 'MSE1' },
      { label: 'MSE Stream 2 (Mathematics Science Education Stream Two)', value: 'MSE Stream 2', code: 'MSE2' }
    ]
  },
  {
    category: 'Secondary A-Level Humanities, Economics & Social Sciences (S4 - S6)',
    badge: 'A-Level Humanities',
    options: [
      { label: 'MEG (Mathematics - Economics - Geography)', value: 'MEG', code: 'MEG' },
      { label: 'HEG (History - Economics - Geography)', value: 'HEG', code: 'HEG' },
      { label: 'HEL (History - Economics - Literature in English)', value: 'HEL', code: 'HEL' },
      { label: 'LEG (Literature in English - Economics - Geography)', value: 'LEG', code: 'LEG' },
      { label: 'HKG (History - Kiswahili - Geography)', value: 'HKG', code: 'HKG' },
      { label: 'HGL (History - Geography - Literature)', value: 'HGL', code: 'HGL' },
      { label: 'HGP (History - Geography - Pedagogy / Philosophy)', value: 'HGP', code: 'HGP' }
    ]
  },
  {
    category: 'Secondary A-Level Languages & Literature (S4 - S6)',
    badge: 'A-Level Languages',
    options: [
      { label: 'LFK (Literature in English - French - Kinyarwanda)', value: 'LFK', code: 'LFK' },
      { label: 'LKK (Literature in English - Kiswahili - Kinyarwanda)', value: 'LKK', code: 'LKK' },
      { label: 'EKK (English - Kiswahili - Kinyarwanda)', value: 'EKK', code: 'EKK' },
      { label: 'EFK (English - French - Kinyarwanda)', value: 'EFK', code: 'EFK' },
      { label: 'FLE (French - Literature - English)', value: 'FLE', code: 'FLE' }
    ]
  },
  {
    category: 'Teacher Training Colleges Options (TTC Y1 - Y3)',
    badge: 'TTC Options',
    options: [
      { label: 'ECLPE (Early Childhood & Lower Primary Education)', value: 'ECLPE', code: 'ECLPE' },
      { label: 'ECLPE Stream 1 (Early Childhood & Lower Primary Ed. Stream 1)', value: 'ECLPE Stream 1', code: 'ECLPE1' },
      { label: 'ECLPE Stream 2 (Early Childhood & Lower Primary Ed. Stream 2)', value: 'ECLPE Stream 2', code: 'ECLPE2' },
      { label: 'SME / MSE (Science and Mathematics Education / Mathematics Science Education)', value: 'SME', code: 'SME' },
      { label: 'SME Stream 1 (Science & Mathematics Education Stream 1)', value: 'SME Stream 1', code: 'SME1' },
      { label: 'SME Stream 2 (Science & Mathematics Education Stream 2)', value: 'SME Stream 2', code: 'SME2' },
      { label: 'MSE Stream 1 (Mathematics Science Education Stream One)', value: 'MSE Stream 1', code: 'MSE1' },
      { label: 'MSE Stream 2 (Mathematics Science Education Stream Two)', value: 'MSE Stream 2', code: 'MSE2' },
      { label: 'LE (Languages Education: Kinyarwanda, English, French, Kiswahili)', value: 'LE', code: 'LE' },
      { label: 'LE Stream 1 (Languages Education Stream 1)', value: 'LE Stream 1', code: 'LE1' },
      { label: 'LE Stream 2 (Languages Education Stream 2)', value: 'LE Stream 2', code: 'LE2' },
      { label: 'SSE (Social Studies Education: History, Geography, SRS)', value: 'SSE', code: 'SSE' },
      { label: 'SSE Stream 1 (Social Studies Education Stream 1)', value: 'SSE Stream 1', code: 'SSE1' },
      { label: 'SSE Stream 2 (Social Studies Education Stream 2)', value: 'SSE Stream 2', code: 'SSE2' }
    ]
  },
  {
    category: 'TVET / Technical & Vocational Education Trades (L1 - L5 / TSS / VTC)',
    badge: 'TVET Trades',
    options: [
      { label: 'Software Development (SOD)', value: 'SOD (Software Development)', code: 'SOD' },
      { label: 'Networking & Cybersecurity (NET)', value: 'NET (Computer Networking)', code: 'NET' },
      { label: 'Multimedia & Graphic Design (MGD)', value: 'MGD (Multimedia & Graphics)', code: 'MGD' },
      { label: 'Electricity & Industrial Electrical Technology (ELT)', value: 'ELT (Electricity)', code: 'ELT' },
      { label: 'Electronics & Telecommunications (ETT)', value: 'ETT (Electronics & Telecom)', code: 'ETT' },
      { label: 'Automobile Mechanics & Technology (AUT)', value: 'AUT (Automobile Technology)', code: 'AUT' },
      { label: 'Masonry & Building Construction (MAS)', value: 'MAS (Building Construction)', code: 'MAS' },
      { label: 'Plumbing & Water Sanitation Technology (PLU)', value: 'PLU (Plumbing Technology)', code: 'PLU' },
      { label: 'Carpentry & Woodworking Technology (CAR)', value: 'CAR (Carpentry & Woodwork)', code: 'CAR' },
      { label: 'Welding & Metal Fabrication (WEL)', value: 'WEL (Welding & Metal Tech)', code: 'WEL' },
      { label: 'Culinary Arts & Food Production (CUL)', value: 'CUL (Culinary Arts)', code: 'CUL' },
      { label: 'Tourism & Hotel Operations / Hospitality (THO)', value: 'THO (Tourism & Hospitality)', code: 'THO' },
      { label: 'Tailoring, Fashion & Garment Design (FAD)', value: 'FAD (Fashion & Tailoring)', code: 'FAD' },
      { label: 'Food Processing & Preservation (FOP)', value: 'FOP (Food Processing)', code: 'FOP' },
      { label: 'Animal Health & Veterinary Technology (VET)', value: 'VET (Veterinary Technology)', code: 'VET' },
      { label: 'Crop Production & Horticulture (CRP)', value: 'CRP (Crop Production)', code: 'CRP' },
      { label: 'Accounting & Business Financial Services (ACC)', value: 'ACC (Accounting Services)', code: 'ACC' },
      { label: 'Solar & Renewable Energy Technology (SOL)', value: 'SOL (Renewable Energy)', code: 'SOL' },
      { label: 'Land Surveying & Civil Engineering (SUR)', value: 'SUR (Land Surveying)', code: 'SUR' },
      { label: 'Hairdressing & Cosmetology / Beauty Therapy (HBC)', value: 'HBC (Hairdressing & Cosmetology)', code: 'HBC' },
      { label: 'Business & Office Administration / Secretarial (BOA)', value: 'BOA (Office Administration)', code: 'BOA' },
      { label: 'Agro-processing & Agriculture Technology (AGR)', value: 'AGR (Agro-Processing)', code: 'AGR' }
    ]
  },
  {
    category: 'Specialized & Creative Arts',
    badge: 'Specialized Arts',
    options: [
      { label: 'Fine Art & Visual Design', value: 'Fine Art & Visual Design' },
      { label: 'Music, Dance and Drama (MDD)', value: 'Music, Dance and Drama' },
      { label: 'Sports & Athletics Science', value: 'Sports Science' }
    ]
  }
];


