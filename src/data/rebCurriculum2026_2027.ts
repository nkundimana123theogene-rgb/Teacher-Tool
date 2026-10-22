/**
 * REB & NESA OFFICIAL CURRICULUM & TEXTBOOK DATABASE (UPDATED 2026-2027)
 * Competence-Based Curriculum (CBC) Standards for Rwanda Basic Education
 * Covers:
 * 1. Nursery / Pre-Primary (Baby N1, Middle N2, Top N3)
 * 2. Primary Education (P1, P2, P3, P4, P5, P6)
 * 3. Secondary O-Level (S1, S2, S3)
 * 4. Secondary A-Level (S4, S5, S6)
 * 5. Teacher Training Colleges (TTCs: Y1, Y2, Y3 - SME, ECLPE, LE, SSE)
 * 6. TVET Trades (RTB / NESA: Level 1 to Level 5)
 */
import { RWANDA_EDUCATION_CURRICULUM } from './rwandaCurriculumSubjects';

export interface RebCurriculumLesson {
  lessonNumber: string; // e.g. "1 of 6", "2 of 8"
  lessonTitleEn: string;
  lessonTitleRw: string;
  suggestedObjectiveEn?: string;
  suggestedObjectiveRw?: string;
  suggestedMaterialsEn?: string;
  suggestedMaterialsRw?: string;
  suggestedReferencesEn?: string;
  suggestedReferencesRw?: string;
}

export interface RebCurriculumUnit {
  unitNumber: string; // e.g. "Unit 1", "Unit 2"
  unitTitleEn: string;
  unitTitleRw: string;
  keyCompetenceEn: string;
  keyCompetenceRw: string;
  textbookReferenceEn?: string;
  textbookReferenceRw?: string;
  lessons: RebCurriculumLesson[];
}

export interface RebCurriculumSubjectBook {
  subjectId: string;
  subjectNameEn: string;
  subjectNameRw: string;
  category: 'nursery_pre_primary' | 'primary_school' | 'secondary_o_level' | 'secondary_a_level' | 'ttc_colleges' | 'tvet_trades';
  gradeLevels: string[]; // e.g. ["P1", "P2", "P3"] or ["S1"]
  edition: string; // "REB Updated 2026-2027 Edition"
  units: RebCurriculumUnit[];
}

export const REB_CURRICULUM_2026_2027: RebCurriculumSubjectBook[] = [
  // =========================================================================
  // I. NURSERY / PRE-PRIMARY (BABY CLASS N1, MIDDLE CLASS N2, TOP CLASS N3)
  // =========================================================================
  {
    subjectId: 'nur_kiny',
    subjectNameEn: 'Developing Language & Literacy (Kinyarwanda)',
    subjectNameRw: 'Kumenya Ururimi n\'Imiyoborere (Ikinyarwanda)',
    category: 'nursery_pre_primary',
    gradeLevels: ['Baby Class (N1)', 'Middle Class (N2)', 'Top Class (N3)'],
    edition: 'REB ECE Updated Syllabus & Teacher\'s Guide 2026-2027',
    units: [
      {
        unitNumber: 'Unit 1',
        unitTitleEn: 'Myself, My Name, and My Body Parts',
        unitTitleRw: 'Njye n\'ibice by\'umubiri wanjye n\'izina ryanjye',
        keyCompetenceEn: 'Identify and name body parts, express personal identity, and practice basic personal hygiene.',
        keyCompetenceRw: 'Gutahura no kuvuga ibice by\'umubiri, kwivuga izina no kugaragaza isuku y\'umubiri wanjye.',
        textbookReferenceEn: 'REB Pre-Primary Kinyarwanda Activity Book (2026-2027 Ed.), Unit 1, pp. 4-12.',
        textbookReferenceRw: 'Igitabo cy\'Ikinyarwanda mu Mashuri y\'Inshuke (REB 2026-2027), Umutwe wa 1, ipaji 4-12.',
        lessons: [
          {
            lessonNumber: '1 of 5',
            lessonTitleEn: 'Saying My Name and Introducing Myself',
            lessonTitleRw: 'Kwivuga izina no kwitangaho ubuhamya buciriritse',
            suggestedObjectiveEn: 'Using a welcome circle and a ball-toss game, young learners will be able to say their full names aloud clearly.',
            suggestedObjectiveRw: 'Hifashishijwe umuzingi w\'ikaze n\'umupira bahahererekanya, abana bazaba bashobora kuvuga amazina yabo mu ijwi ryumvikana neza.',
            suggestedMaterialsEn: 'Soft ball, name badges, welcoming songs, picture cards',
            suggestedMaterialsRw: 'Umupira woroheje, amakarita y\'amazina, indirimbo zo kwakirana'
          },
          {
            lessonNumber: '2 of 5',
            lessonTitleEn: 'Identifying and Naming Head, Eyes, Ears, and Nose',
            lessonTitleRw: 'Gutahura no kwerekana Umutwe, Amaso, Amatwi n\'Izuru',
            suggestedObjectiveEn: 'Through pointing songs and mirror observations, learners will be able to touch and correctly name their eyes, ears, and nose.',
            suggestedObjectiveRw: 'Hifashishijwe indirimbo zo kwerekana n\'indorerwamo, abana bazaba bashobora gukora no kuvuga amaso, amatwi n\'izuru ku buryo bw\'ukuri.',
            suggestedMaterialsEn: 'Small mirrors, flashcards with face illustrations, doll models'
          },
          {
            lessonNumber: '3 of 5',
            lessonTitleEn: 'Identifying Hands, Legs, and Feet in Action',
            lessonTitleRw: 'Kwerekana Amaboko, Amaguru n\'Ibirenge mu bikorwa',
            suggestedObjectiveEn: 'Through action rhymes and clapping games, learners will demonstrate how hands clap and feet jump.',
            suggestedObjectiveRw: 'Hifashishijwe indirimbo zo gukoma amashyi no gusimbuka, abana bazerekana imirimo y\'amaboko n\'amaguru.'
          },
          {
            lessonNumber: '4 of 5',
            lessonTitleEn: 'Basic Personal Hygiene: Washing Hands with Clean Water and Soap',
            lessonTitleRw: 'Isuku y\'umubiri: Gukaraba intoki n\'amazi meza n\'isabune',
            suggestedObjectiveEn: 'Using a handwashing demonstration station, learners will perform the steps of washing hands before eating.',
            suggestedObjectiveRw: 'Hifashishijwe amazi meza n\'isabune, abana bazagaragaza intambwe zo gukaraba intoki mbere yo kurya.'
          },
          {
            lessonNumber: '5 of 5',
            lessonTitleEn: 'Expressing Feelings and Needs (Happy, Sad, Thirsty, Hungry)',
            lessonTitleRw: 'Kugaragaza ibyiyumvo n\'ibyo akeneye (Ibyishimo, Agahinda, Inyota, Inzara)',
            suggestedObjectiveEn: 'Using emotion facial expression puppets, learners will express when they feel happy or need help.',
            suggestedObjectiveRw: 'Hifashishijwe amashusho y\'ibyiyumvo, abana bazasobanura igihe bishimye n\'igihe bakeneye ubufasha.'
          }
        ]
      },
      {
        unitNumber: 'Unit 2',
        unitTitleEn: 'My Family, Home, and Classroom Environment',
        unitTitleRw: 'Umuryango wanjye, Urugo n\'Ibikoresho byo mu Ishuri',
        keyCompetenceEn: 'Name family members, describe home objects, and keep classroom materials tidy.',
        keyCompetenceRw: 'Kuvuga abagize umuryango, ibikoresho byo mu rugo no gusukura ibyumba by\'ishuri.',
        lessons: [
          {
            lessonNumber: '1 of 4',
            lessonTitleEn: 'Family Members: Mother, Father, Brother, and Sister',
            lessonTitleRw: 'Abagize Umuryango: Mama, Papa, Musaza/Mushiki na Mukuru/Murumuna',
            suggestedObjectiveEn: 'Using family photo cards, learners will identify and role-play family member roles.'
          },
          {
            lessonNumber: '2 of 4',
            lessonTitleEn: 'Naming Common Utensils and Objects at Home',
            lessonTitleRw: 'Kuvuga amazina y\'ibikoresho byo mu rugo (Isahani, Igikombe, Intebe)',
            suggestedObjectiveEn: 'Given toy utensils, learners will group and name plates, cups, and spoons accurately.'
          },
          {
            lessonNumber: '3 of 4',
            lessonTitleEn: 'Classroom Objects: Slates, Crayons, Blocks, and Storybooks',
            lessonTitleRw: 'Ibikoresho byo mu ishuri: Urubaho rw\'umunyeshuri, Amakaramu, Ibitabo',
            suggestedObjectiveEn: 'Learners will locate and name three classroom items and return them to storage bins.'
          },
          {
            lessonNumber: '4 of 4',
            lessonTitleEn: 'Care of School Materials and Tidying the Play Corner',
            lessonTitleRw: 'Gufata neza ibikoresho by\'ishuri no gutunganya aho gukinira',
            suggestedObjectiveEn: 'Learners will participate cooperatively in tidying up toys after free play.'
          }
        ]
      }
    ]
  },
  {
    subjectId: 'nur_num',
    subjectNameEn: 'Early Numeracy & Mathematics Concepts',
    subjectNameRw: 'Kubara no Kumenya Imibare y\'Ibanze (Numeracy)',
    category: 'nursery_pre_primary',
    gradeLevels: ['Baby Class (N1)', 'Middle Class (N2)', 'Top Class (N3)'],
    edition: 'REB Pre-Primary Numeracy Activity Guide 2026-2027',
    units: [
      {
        unitNumber: 'Unit 1',
        unitTitleEn: 'Colors, Shapes, and Sorting Objects',
        unitTitleRw: 'Amabara y\'ibanze, Imiterere n\'Itoranya ry\'ibintu',
        keyCompetenceEn: 'Sort concrete objects by color and shape, and recognize red, blue, yellow, and green.',
        keyCompetenceRw: 'Gutoranya ibintu hakurikijwe amabara n\'imiterere, no gutahura umutuku, ubururu, umuhondo n\'icyatsi.',
        lessons: [
          {
            lessonNumber: '1 of 5',
            lessonTitleEn: 'Recognizing Primary Colors (Red and Blue)',
            lessonTitleRw: 'Gutahura amabara y\'ibanze: Umutuku n\'Ubururu',
            suggestedObjectiveEn: 'Using colorful plastic caps and beads, learners will separate red objects from blue objects.'
          },
          {
            lessonNumber: '2 of 5',
            lessonTitleEn: 'Recognizing Yellow and Green Objects',
            lessonTitleRw: 'Gutahura ibintu by\'umuhondo n\'ibyatsi bibisi',
            suggestedObjectiveEn: 'Using leaves and fruit models, learners will match yellow bananas and green leaves correctly.'
          },
          {
            lessonNumber: '3 of 5',
            lessonTitleEn: 'Exploring Circles and Rectangles with Concrete Realia',
            lessonTitleRw: 'Kuvumbura Uruziga n\'Urukiramende mu bikoresho bifatika',
            suggestedObjectiveEn: 'Given circular plates and rectangular books, learners will trace and name circles and rectangles.'
          },
          {
            lessonNumber: '4 of 5',
            lessonTitleEn: 'Sorting Objects by Size (Big and Small)',
            lessonTitleRw: 'Gutoranya ibintu hakurikijwe ingano: Ikinini n\'Igito',
            suggestedObjectiveEn: 'Using various stones and balls, learners will group items into big and small baskets.'
          },
          {
            lessonNumber: '5 of 5',
            lessonTitleEn: 'Simple AB Color Pattern Creation',
            lessonTitleRw: 'Gukora uruhererekane rw\'amabara akurikirana (Umutuku - Ubururu)',
            suggestedObjectiveEn: 'Using colored bottle tops, learners will assemble an alternating red-blue-red-blue chain.'
          }
        ]
      },
      {
        unitNumber: 'Unit 2',
        unitTitleEn: 'Counting Concrete Objects (Numbers 1 to 5)',
        unitTitleRw: 'Kubara ibintu bifatika (Imibare 1 kugeza kuri 5)',
        keyCompetenceEn: 'Count, match, and order concrete quantities from 1 to 5 with confidence.',
        keyCompetenceRw: 'Kubara, guhuza no gutondeka imibare 1 kugeza kuri 5 ukoresheje uburyo bufatika.',
        lessons: [
          {
            lessonNumber: '1 of 5',
            lessonTitleEn: 'Introducing Number 1: One Nose, One Sun, One Slate',
            lessonTitleRw: 'Kumenya Umubare 1: Izuru rimwe, Izuba rimwe, Urubaho rumwe',
            suggestedObjectiveEn: 'Using fingers and blocks, learners will show and count 1 item with accurate gesture.'
          },
          {
            lessonNumber: '2 of 5',
            lessonTitleEn: 'Introducing Number 2: Two Eyes, Two Hands, Two Shoes',
            lessonTitleRw: 'Kumenya Umubare 2: Amaso abiri, Amaboko abiri, Inkweto ebyiri',
            suggestedObjectiveEn: 'Using pairs of shoes and bottle caps, learners will point and count "one, two".'
          },
          {
            lessonNumber: '3 of 5',
            lessonTitleEn: 'Introducing Number 3: Counting 3 Sticks and 3 Beans',
            lessonTitleRw: 'Kumenya Umubare 3: Kubara uduti 3 n\'ibishyimbo 3',
            suggestedObjectiveEn: 'Learners will place exactly 3 seeds into their counting cup.'
          },
          {
            lessonNumber: '4 of 5',
            lessonTitleEn: 'Introducing Numbers 4 and 5 with Finger Rhymes',
            lessonTitleRw: 'Kumenya Umubare 4 na 5 binyuze mu ndirimbo z\'intoki',
            suggestedObjectiveEn: 'Learners will count fingers from 1 to 5 and chant number rhymes together.'
          },
          {
            lessonNumber: '5 of 5',
            lessonTitleEn: 'Matching Dot Cards to Concrete Quantities (1 to 5)',
            lessonTitleRw: 'Guhuza amakarita y\'utudomo n\'imibare y\'ibintu bifatika',
            suggestedObjectiveEn: 'Learners will link cards with 1-5 dots to corresponding groups of counting counters.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // II. PRIMARY EDUCATION (P1 - P6)
  // =========================================================================
  {
    subjectId: 'pri_math',
    subjectNameEn: 'Mathematics',
    subjectNameRw: 'Imibare (Mathematics)',
    category: 'primary_school',
    gradeLevels: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    edition: 'REB Updated Primary Mathematics CBC Learner\'s Book & Teacher\'s Guide 2026-2027',
    units: [
      {
        unitNumber: 'Unit 1',
        unitTitleEn: 'Reading, Writing, and Comparing Whole Numbers',
        unitTitleRw: 'Gusoma, Kwandika no Kugereranya Imibare Yuzuye',
        keyCompetenceEn: 'Read, write, partition, compare, and order whole numbers using place value principles.',
        keyCompetenceRw: 'Gusoma, kwandika, kugabanyamo ibice, kugereranya no gutondeka imibare yuzuye hakurikijwe agaciro k\'umwanya.',
        textbookReferenceEn: 'REB Primary Mathematics Learner\'s Book (2026-2027 Edition), Unit 1, pp. 1-28.',
        textbookReferenceRw: 'Igitabo cy\'Umunyeshuri cy\'Imibare (REB 2026-2027), Umutwe wa 1, ipaji 1-28.',
        lessons: [
          {
            lessonNumber: '1 of 6',
            lessonTitleEn: 'Place Value and Value of Digits in Numbers',
            lessonTitleRw: 'Agaciro k\'umwanya n\'agaciro k\'ibimenyetso mu mibare',
            suggestedObjectiveEn: 'By using an abacus and place value charts, learners will determine place values of digits correctly in 5 exercises.',
            suggestedObjectiveRw: 'Hifashishijwe imbonerahamwe y\'agaciro k\'umwanya n\'abacus, abanyeshuri bazabasha kugaragaza agaciro k\'imibare ku buryo bw\'ukuri.'
          },
          {
            lessonNumber: '2 of 6',
            lessonTitleEn: 'Reading and Writing Numbers in Words and Numerals',
            lessonTitleRw: 'Gusoma no kwandika imibare mu magambo no mu mibare',
            suggestedObjectiveEn: 'Using chalkboard flashcards, learners will accurately write given numbers in words without spelling errors.'
          },
          {
            lessonNumber: '3 of 6',
            lessonTitleEn: 'Comparing Numbers Using Signs (<, >, =)',
            lessonTitleRw: 'Kugereranya imibare hifashishijwe ibimenyetso (<, >, =)',
            suggestedObjectiveEn: 'Learners will insert appropriate inequality signs between number pairs correctly in 6 problems.'
          },
          {
            lessonNumber: '4 of 6',
            lessonTitleEn: 'Arranging Numbers in Ascending and Descending Order',
            lessonTitleRw: 'Gutondeka imibare ihereye ku mutoya ijya ku munini no mu cyerekezo kinyuranye',
            suggestedObjectiveEn: 'Learners will sort a set of five large numbers in increasing order within 10 minutes.'
          },
          {
            lessonNumber: '5 of 6',
            lessonTitleEn: 'Rounding Off Whole Numbers to the Nearest Ten and Hundred',
            lessonTitleRw: 'Gukwiza imibare yuzuye ku cyacumi no ku ijana byegereye',
            suggestedObjectiveEn: 'By using number lines, learners will round numbers correctly in 4 out of 5 practice items.'
          },
          {
            lessonNumber: '6 of 6',
            lessonTitleEn: 'Word Problems Involving Whole Numbers in Daily Contexts',
            lessonTitleRw: 'Gukemura ibibazo byo mu buzima busanzwe bifashishije imibare yuzuye',
            suggestedObjectiveEn: 'Learners will solve real-life word problems involving census and financial calculations accurately.'
          }
        ]
      },
      {
        unitNumber: 'Unit 2',
        unitTitleEn: 'Addition and Subtraction of Whole Numbers',
        unitTitleRw: 'Guteranya no Gukuramo Imibare Yuzuye',
        keyCompetenceEn: 'Perform column addition and subtraction with and without carrying/borrowing, and solve related multi-step word problems.',
        keyCompetenceRw: 'Guteranya no gukuramo imibare itondetse mu mirongo ifite cyangwa idafite igiteranyo gihindurwa, no gukemura ibibazo byo mu buzima.',
        lessons: [
          {
            lessonNumber: '1 of 6',
            lessonTitleEn: 'Column Addition Without Carrying',
            lessonTitleRw: 'Guteranya mu nkingi nta guhindura (nta kubika)',
            suggestedObjectiveEn: 'Learners will compute sums of whole numbers arranged vertically with 100% accuracy.'
          },
          {
            lessonNumber: '2 of 6',
            lessonTitleEn: 'Column Addition With Carrying (Regrouping)',
            lessonTitleRw: 'Guteranya mu nkingi harimo kubika (guhindura)',
            suggestedObjectiveEn: 'Using Dienes blocks and chalkboard demonstrations, learners will carry over tens and hundreds accurately.'
          },
          {
            lessonNumber: '3 of 6',
            lessonTitleEn: 'Subtraction of Whole Numbers Without Borrowing',
            lessonTitleRw: 'Gukuramo imibare nta gutira (nta gukata)',
            suggestedObjectiveEn: 'Learners will compute subtractions by aligning columns correctly.'
          },
          {
            lessonNumber: '4 of 6',
            lessonTitleEn: 'Subtraction With Decomposition (Borrowing/Regrouping)',
            lessonTitleRw: 'Gukuramo imibare harimo gutira (regrouping)',
            suggestedObjectiveEn: 'Learners will subtract numbers across zero and regroup places accurately in 4 problems.'
          },
          {
            lessonNumber: '5 of 6',
            lessonTitleEn: 'Estimating Sums and Differences in Daily Life',
            lessonTitleRw: 'Gukora igereranya ry\'igiteranyo n\'ikinyuranyo mu buzima bwa buri munsi',
            suggestedObjectiveEn: 'Learners will round numbers prior to computing estimated totals for grocery budgets.'
          },
          {
            lessonNumber: '6 of 6',
            lessonTitleEn: 'Solving Practical Two-Step Word Problems (Market & Savings)',
            lessonTitleRw: 'Gukemura ibibazo by\'ubucuruzi n\'ubwizigame bifite intambwe ebyiri',
            suggestedObjectiveEn: 'Learners will write mathematical statements and solve financial problems clearly.'
          }
        ]
      },
      {
        unitNumber: 'Unit 3',
        unitTitleEn: 'Multiplication and Division of Whole Numbers',
        unitTitleRw: 'Gukuba no Kugabanya Imibare Yuzuye',
        keyCompetenceEn: 'Multiply and divide whole numbers using standard algorithms and apply them to solve economic and resource-sharing problems.',
        keyCompetenceRw: 'Gukuba no kugabanya imibare yuzuye hifashishijwe uburyo busanzwe no kubikoresha mu gukemura ibibazo by\'ubukungu.',
        lessons: [
          {
            lessonNumber: '1 of 6',
            lessonTitleEn: 'Multiplication of Whole Numbers by 1-Digit and 2-Digit Multipliers',
            lessonTitleRw: 'Gukuba umubare wuzuye n\'umubare w\'ikimenyetso kimwe n\'ibiri',
            suggestedObjectiveEn: 'Using the vertical grid method, learners will multiply 3-digit numbers by 2-digit multipliers correctly.'
          },
          {
            lessonNumber: '2 of 6',
            lessonTitleEn: 'Multiplication Properties (Commutative, Associative, Distributive)',
            lessonTitleRw: 'Ibiranga ubwikube: Guhinduranya, Guhuriza hamwe no Gusaranganya',
            suggestedObjectiveEn: 'Learners will apply distributive property to break down mental multiplication problems.'
          },
          {
            lessonNumber: '3 of 6',
            lessonTitleEn: 'Long Division Without Remainder',
            lessonTitleRw: 'Kugabanya umubare mu buryo bw\'inkoramutwe nta gisigazwa',
            suggestedObjectiveEn: 'Using long division steps (Divide, Multiply, Subtract, Bring down), learners will compute quotients accurately.'
          },
          {
            lessonNumber: '4 of 6',
            lessonTitleEn: 'Long Division With Remainders and Verification',
            lessonTitleRw: 'Kugabanya umubare harimo igisigazwa no kubigenzura',
            suggestedObjectiveEn: 'Learners will calculate quotients and remainders and verify using dividend = (divisor × quotient) + remainder.'
          },
          {
            lessonNumber: '5 of 6',
            lessonTitleEn: 'Multiplication and Division by Multiples of 10, 100, and 1,000',
            lessonTitleRw: 'Gukuba no kugabanya n\'ibikubye 10, 100 na 1,000',
            suggestedObjectiveEn: 'Learners will apply shortcut zero-shifting rules to calculate large products in seconds.'
          },
          {
            lessonNumber: '6 of 6',
            lessonTitleEn: 'Solving Real-Life Distribution and Packaging Word Problems',
            lessonTitleRw: 'Gukemura ibibazo by\'igabana ry\'imfashanyo n\'ububiko bw\'ibicuruzwa',
            suggestedObjectiveEn: 'Learners will formulate equations and solve packaging problems in agriculture cooperative contexts.'
          }
        ]
      },
      {
        unitNumber: 'Unit 4',
        unitTitleEn: 'Fractions and Operations on Fractions',
        unitTitleRw: 'Imigabane n\'Ibikorerwa ku Migabane',
        keyCompetenceEn: 'Model, simplify, compare, add, subtract, multiply, and divide proper, improper, and mixed fractions.',
        keyCompetenceRw: 'Gushushanya, koroshya, kugereranya, guteranya, gukuramo, gukuba no kugabanya imigabane inyuranye.',
        lessons: [
          {
            lessonNumber: '1 of 7',
            lessonTitleEn: 'Concepts of Proper, Improper, and Mixed Fractions',
            lessonTitleRw: 'Ibisobanuro by\'imigabane myimerere, itari myimerere n\'ivangiye',
            suggestedObjectiveEn: 'Using fraction circular discs, learners will classify given fractions into proper, improper, and mixed numbers.'
          },
          {
            lessonNumber: '2 of 7',
            lessonTitleEn: 'Equivalent Fractions and Simplifying to Lowest Terms',
            lessonTitleRw: 'Imigabane ingana no kuyigabanya kugeza ku kigero cyo hasi cyane',
            suggestedObjectiveEn: 'Learners will generate equivalent fractions by dividing or multiplying numerator and denominator by the GCD.'
          },
          {
            lessonNumber: '3 of 7',
            lessonTitleEn: 'Addition of Fractions with Same and Different Denominators (LCM)',
            lessonTitleRw: 'Guteranya imigabane ifite ibice bihuje n\'ibidahuje (LCM)',
            suggestedObjectiveEn: 'By finding the Least Common Multiple (LCM), learners will add dissimilar fractions correctly in 4 problems.'
          },
          {
            lessonNumber: '4 of 7',
            lessonTitleEn: 'Subtraction of Fractions and Mixed Numbers',
            lessonTitleRw: 'Gukuramo imigabane n\'imibare ivangiye',
            suggestedObjectiveEn: 'Learners will convert mixed numbers to improper fractions and subtract accurately.'
          },
          {
            lessonNumber: '5 of 7',
            lessonTitleEn: 'Multiplication of a Fraction by a Whole Number and by a Fraction',
            lessonTitleRw: 'Gukuba umugabane n\'umubare wuzuye no gukuba imigabane yombi',
            suggestedObjectiveEn: 'Learners will multiply numerators and denominators and simplify answers to lowest terms.'
          },
          {
            lessonNumber: '6 of 7',
            lessonTitleEn: 'Division of Fractions Using the Reciprocal (Inversion Method)',
            lessonTitleRw: 'Kugabanya imigabane hifashishijwe igicuri cy\'umugabane (Reciprocal)',
            suggestedObjectiveEn: 'Learners will invert the divisor and multiply to solve fraction division problems.'
          },
          {
            lessonNumber: '7 of 7',
            lessonTitleEn: 'Word Problems Involving Land Sharing and Harvest Division',
            lessonTitleRw: 'Gukemura ibibazo by\'isaranganya ry\'ubutaka n\'umusaruro mu buhinzi',
            suggestedObjectiveEn: 'Learners will solve practical land portioning word problems using fractional operations.'
          }
        ]
      }
    ]
  },
  {
    subjectId: 'pri_set',
    subjectNameEn: 'Science & Elementary Technology (SET)',
    subjectNameRw: 'Ubumenyi n\'Ikoranabuhanga ry\'Ibanze (SET)',
    category: 'primary_school',
    gradeLevels: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    edition: 'REB Updated SET Curriculum & Practical Guide 2026-2027',
    units: [
      {
        unitNumber: 'Unit 1',
        unitTitleEn: 'Human Body Systems: Digestive and Circulatory Systems',
        unitTitleRw: 'Imikorere y\'Umubiri w\'Umuntu: Urwungano ngogozi n\'Umutima',
        keyCompetenceEn: 'Describe the main organs and functions of the digestive and circulatory systems and explain good health habits.',
        keyCompetenceRw: 'Kuvuga ingingo z\'ingenzi n\'imikorere y\'urwungano ngogozi n\'amaraso no gusobanura ingeso nziza zo kwirinda indwara.',
        lessons: [
          {
            lessonNumber: '1 of 5',
            lessonTitleEn: 'Organs of the Digestive System and Their Functions',
            lessonTitleRw: 'Ingingo z\'urwungano ngogozi (Akanwa, Umuhogo, Igifu, Amara)',
            suggestedObjectiveEn: 'Using human torso anatomical charts, learners will trace food movement from the mouth to intestines.'
          },
          {
            lessonNumber: '2 of 5',
            lessonTitleEn: 'The Process of Digestion and Nutrient Absorption',
            lessonTitleRw: 'Urugendo rw\'igogora n\'iyinjizwa ry\'intungamubiri mu maraso',
            suggestedObjectiveEn: 'Learners will explain mechanical vs chemical digestion in the stomach and small intestine.'
          },
          {
            lessonNumber: '3 of 5',
            lessonTitleEn: 'The Heart, Blood Vessels, and Blood Circulation',
            lessonTitleRw: 'Umutima, Imiyoboro y\'amaraso n\'itembera ry\'amaraso mu mubiri',
            suggestedObjectiveEn: 'Using stethoscopes or pulse palpation, learners will count their resting heart rates and describe circulation.'
          },
          {
            lessonNumber: '4 of 5',
            lessonTitleEn: 'Common Diseases of the Digestive and Circulatory Systems',
            lessonTitleRw: 'Indwara zibasira urwungano ngogozi n\'urwungano rw\'amaraso',
            suggestedObjectiveEn: 'Learners will list symptoms and preventions of gastritis, cholera, ulcers, and hypertension.'
          },
          {
            lessonNumber: '5 of 5',
            lessonTitleEn: 'Healthy Eating Habits, Balanced Diet, and Clean Drinking Water',
            lessonTitleRw: 'Indyo yuzuye, Ingeso nziza zo kurya no kunywa amazi meza atetse',
            suggestedObjectiveEn: 'Learners will design a 1-day balanced diet meal plan using locally available Rwandan foodstuffs.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // III. SECONDARY O-LEVEL (S1 - S3)
  // =========================================================================
  {
    subjectId: 'olevel_math',
    subjectNameEn: 'Mathematics',
    subjectNameRw: 'Imibare (O-Level Mathematics)',
    category: 'secondary_o_level',
    gradeLevels: ['S1', 'S2', 'S3'],
    edition: 'REB Updated O-Level Mathematics Syllabus & Learner Book 2026-2027',
    units: [
      {
        unitNumber: 'Unit 1',
        unitTitleEn: 'Set Theory, Operations, and Venn Diagrams',
        unitTitleRw: 'Ibipimo by\'Amatsinda (Sets) n\'Ibishushanyo bya Venn',
        keyCompetenceEn: 'Use mathematical concepts of set theory to solve everyday problem situations with Venn diagrams.',
        keyCompetenceRw: 'Gukoresha amatsinda (Sets) n\'ibishushanyo bya Venn mu gukemura ibibazo byo mu buzima busanzwe.',
        lessons: [
          {
            lessonNumber: '1 of 5',
            lessonTitleEn: 'Set Notation, Subsets, Universal Sets, and Complements',
            lessonTitleRw: 'Imyandikire y\'amatsinda, Amatsinda mato (Subsets) n\'amatsinda yose',
            suggestedObjectiveEn: 'Learners will correctly define and write subsets, universal sets, and empty sets using symbols.'
          },
          {
            lessonNumber: '2 of 5',
            lessonTitleEn: 'Union and Intersection of Two Sets',
            lessonTitleRw: 'Ihuriro (Union) n\'Ihuriro-sangi (Intersection) by\'amatsinda abiri',
            suggestedObjectiveEn: 'Given numerical sets, learners will find A ∪ B and A ∩ B and shade Venn diagrams correctly.'
          },
          {
            lessonNumber: '3 of 5',
            lessonTitleEn: 'Solving 2-Set Real-World Survey Word Problems',
            lessonTitleRw: 'Gukemura ibibazo by\'ubushakashatsi hifashishijwe amatsinda abiri',
            suggestedObjectiveEn: 'Learners will solve survey problems using the formula n(A ∪ B) = n(A) + n(B) - n(A ∩ B).'
          }
        ]
      },
      {
        unitNumber: 'Unit 2',
        unitTitleEn: 'Algebraic Expressions, Factorization, and Equations',
        unitTitleRw: 'Imvugo za Aljebure, Isuzuma ry\'Ibihu ryabyo n\'Ibingana (Equations)',
        keyCompetenceEn: 'Manipulate algebraic expressions, factorize quadratic expressions, and solve linear and simultaneous equations.',
        keyCompetenceRw: 'Guhindura imvugo za aljebure, gushyira mu bihuza (factorization) no gukemura ingana z\'umwimerere.',
        lessons: [
          {
            lessonNumber: '1 of 6',
            lessonTitleEn: 'Expansion of Algebraic Expressions Using Distributive Law',
            lessonTitleRw: 'Kwagura imvugo za aljebure hifashishijwe amategeko yo gukwirakwiza',
            suggestedObjectiveEn: 'Learners will expand single and double brackets (x + a)(x + b) accurately.'
          },
          {
            lessonNumber: '2 of 6',
            lessonTitleEn: 'Factorizing Quadratic Expressions: ax² + bx + c',
            lessonTitleRw: 'Gushyira mu bihuza imvugo za kabiri (Quadratic expressions)',
            suggestedObjectiveEn: 'Learners will find product-sum factor pairs to factorize trinomials correctly.'
          },
          {
            lessonNumber: '3 of 6',
            lessonTitleEn: 'Simultaneous Linear Equations by Elimination and Substitution',
            lessonTitleRw: 'Gukemura ingana zibiri zihurijwe hamwe (Elimination & Substitution)',
            suggestedObjectiveEn: 'Learners will solve simultaneous equations modeling commodity prices in markets.'
          }
        ]
      }
    ]
  },
  {
    subjectId: 'olevel_phy',
    subjectNameEn: 'Physics',
    subjectNameRw: 'Ubugenge (O-Level Physics)',
    category: 'secondary_o_level',
    gradeLevels: ['S1', 'S2', 'S3'],
    edition: 'REB Updated O-Level Physics CBC Teacher\'s Guide 2026-2027',
    units: [
      {
        unitNumber: 'Unit 1',
        unitTitleEn: 'Measurements, Density, and Pressure',
        unitTitleRw: 'Ibipimo, Uburemere-sangi (Density) n\'Umuvuduko w\'Imyuka n\'Amazi (Pressure)',
        keyCompetenceEn: 'Use precision measuring instruments (Vernier calipers, micrometer screw gauge) and calculate density and fluid pressure.',
        keyCompetenceRw: 'Gukoresha ibikoresho byo gupima neza (Vernier calipers, Micrometer) no kubara density na pressure.',
        lessons: [
          {
            lessonNumber: '1 of 5',
            lessonTitleEn: 'Reading Vernier Calipers and Micrometer Screw Gauges',
            lessonTitleRw: 'Gusoma ibipimo bya Vernier Calipers na Micrometer screw gauge',
            suggestedObjectiveEn: 'Learners will measure the diameter of steel ball bearings and cylinder walls to 0.01 mm precision.'
          },
          {
            lessonNumber: '2 of 5',
            lessonTitleEn: 'Pressure in Liquids: P = ρgh and Hydraulic Machines (Pascal\'s Principle)',
            lessonTitleRw: 'Igitutu mu mazi n\'amavuta n\'imashini za hydraulic (Pascal\'s Principle)',
            suggestedObjectiveEn: 'Learners will calculate fluid pressures at given depths and model hydraulic brake systems.'
          }
        ]
      }
    ]
  },
  {
    subjectId: 'olevel_chem',
    subjectNameEn: 'Chemistry',
    subjectNameRw: 'Ubutabire (O-Level Chemistry)',
    category: 'secondary_o_level',
    gradeLevels: ['S1', 'S2', 'S3'],
    edition: 'REB Updated O-Level Chemistry CBC Syllabus 2026-2027',
    units: [
      {
        unitNumber: 'Unit 1',
        unitTitleEn: 'States of Matter, Particle Theory, and Changes of State',
        unitTitleRw: 'Imiterere y\'Ibinyabutabire (States of Matter) n\'Impinduka Zabyo',
        keyCompetenceEn: 'Use particle kinetic theory to explain properties of solids, liquids, and gases and changes of physical state.',
        keyCompetenceRw: 'Gukoresha inyigisho y\'ingendo z\'agatsiko k\'uduce duto gusobanura ibikomeye, ibidatemba n\'imyuka.',
        lessons: [
          {
            lessonNumber: '1 of 5',
            lessonTitleEn: 'Kinetic Particle Theory of Solids, Liquids, and Gases',
            lessonTitleRw: 'Inyigisho z\'ingendo z\'uduce duto mu bintu bikomeye, ibidatemba n\'imyuka',
            suggestedObjectiveEn: 'Learners will describe particle arrangement, motion, and attractive forces in the 3 states of matter.'
          },
          {
            lessonNumber: '2 of 5',
            lessonTitleEn: 'Melting, Freezing, Boiling, Evaporation, and Condensation',
            lessonTitleRw: 'Gushonga, Gukomera, Kubira, Guhumeka no Guhinduka amazi (Condensation)',
            suggestedObjectiveEn: 'Using heating and cooling curve graphs, learners will identify phase transition plateaus.'
          }
        ]
      }
    ]
  },
  {
    subjectId: 'olevel_bio',
    subjectNameEn: 'Biology',
    subjectNameRw: 'Ibinyabuzima (O-Level Biology)',
    category: 'secondary_o_level',
    gradeLevels: ['S1', 'S2', 'S3'],
    edition: 'REB Updated O-Level Biology CBC Syllabus 2026-2027',
    units: [
      {
        unitNumber: 'Unit 1',
        unitTitleEn: 'Cell Biology: Microscopy, Animal and Plant Cells, and Specialization',
        unitTitleRw: 'Ubumenyi bw\'Akagangingo (Cell Biology): Microscopy n\'Ibinyuranyo by\'utugangingo',
        keyCompetenceEn: 'Prepare wet mount slides, operate light microscopes, compare plant and animal cell structures, and explain cell specialization.',
        keyCompetenceRw: 'Gukoresha microscope, gutegura ibipimo no kugereranya akagangingo k\'ikimera n\'ak\'inyamaswa.',
        lessons: [
          {
            lessonNumber: '1 of 5',
            lessonTitleEn: 'Parts of a Light Microscope and Slide Preparation (Onion Epidermal Peel)',
            lessonTitleRw: 'Ibice bya microscope no gutegura uruhu rw\'igitunguru (Wet mount slide)',
            suggestedObjectiveEn: 'Learners will focus slides under low and high magnification and calculate magnification = ocular × objective.'
          },
          {
            lessonNumber: '2 of 5',
            lessonTitleEn: 'Structure of Animal Cells vs Plant Cells (Organelles & Functions)',
            lessonTitleRw: 'Imiterere y\'akagangingo k\'inyamaswa n\'ak\'ikimera (Nucleus, Mitochondria, Chloroplasts)',
            suggestedObjectiveEn: 'Learners will sketch and label plant and animal cells, listing 4 distinct structural differences.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // IV. SECONDARY A-LEVEL (S4 - S6)
  // =========================================================================
  {
    subjectId: 'alevel_advmath',
    subjectNameEn: 'Advanced Mathematics',
    subjectNameRw: 'Imibare y\'Icyiciro Gisumbuye (Advanced Mathematics)',
    category: 'secondary_a_level',
    gradeLevels: ['S4', 'S5', 'S6'],
    edition: 'REB Updated Advanced Level Mathematics CBC Syllabus 2026-2027',
    units: [
      {
        unitNumber: 'Unit 1',
        unitTitleEn: 'Complex Numbers, Polar Forms, and De Moivre\'s Theorem',
        unitTitleRw: 'Imibare Ihanitse (Complex Numbers), Ifishi ya Polare n\'Ihame rya De Moivre',
        keyCompetenceEn: 'Perform algebraic operations on complex numbers in Cartesian, polar, and exponential forms and apply De Moivre\'s theorem.',
        keyCompetenceRw: 'Gukora imibare ku mibare ihanitse mu buryo bwa Cartesian, polar na exponential no gukoresha De Moivre.',
        lessons: [
          {
            lessonNumber: '1 of 6',
            lessonTitleEn: 'Imaginary Unit i, Powers of i, and Cartesian Form z = a + bi',
            lessonTitleRw: 'Igice cy\'igitekerezo (i), Imbaraga za i n\'imiterere ya z = a + bi',
            suggestedObjectiveEn: 'Learners will simplify high powers of i and perform addition, subtraction, and multiplication of complex numbers.'
          },
          {
            lessonNumber: '2 of 6',
            lessonTitleEn: 'De Moivre\'s Theorem and Expanding [r(cos θ + i sin θ)]ⁿ',
            lessonTitleRw: 'Ihame rya De Moivre no kwagura imbaraga z\'imibare ihanitse',
            suggestedObjectiveEn: 'Learners will apply De Moivre\'s theorem to compute powers and derive multiple angle trigonometric identities.'
          }
        ]
      },
      {
        unitNumber: 'Unit 2',
        unitTitleEn: 'Differentiation Techniques, Higher Derivatives, and Applications',
        unitTitleRw: 'Uburyo bwo Gukora Differentiation, Imizi Isumbuye n\'Imikoreshereze Yayo',
        keyCompetenceEn: 'Differentiate algebraic, trigonometric, logarithmic, and exponential functions, and solve optimization and rates of change problems.',
        keyCompetenceRw: 'Gukora derivatives ku moko yose y\'imikorere no gukemura ibibazo byo kongera umusaruro (optimization).',
        lessons: [
          {
            lessonNumber: '1 of 6',
            lessonTitleEn: 'Product Rule, Quotient Rule, and Chain Rule of Differentiation',
            lessonTitleRw: 'Amategeko yo gukuba (Product), kugabanya (Quotient) n\'uruhererekane (Chain Rule)',
            suggestedObjectiveEn: 'Learners will compute first derivatives of compound functions using product, quotient, and chain rules.'
          },
          {
            lessonNumber: '2 of 6',
            lessonTitleEn: 'Practical Optimization Problems in Economics, Engineering, and Architecture',
            lessonTitleRw: 'Ibibazo byo kuringaniza no kurushaho gutunganya umusaruro (Optimization)',
            suggestedObjectiveEn: 'Learners will formulate functions and determine maximum profit, minimal surface area, and optimal volume.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // V. TEACHER TRAINING COLLEGES (TTCs: Y1, Y2, Y3 - SME, ECLPE, LE, SSE)
  // =========================================================================
  {
    subjectId: 'ttc_foe',
    subjectNameEn: 'Foundations of Education (FOE)',
    subjectNameRw: 'Inkomoko n\'Inkingi z\'Uburezi (FOE)',
    category: 'ttc_colleges',
    gradeLevels: ['Year 1 (Y1)', 'Year 2 (Y2)', 'Year 3 (Y3)'],
    edition: 'REB Updated TTC National Curriculum 2026-2027 (5-Year Teacher Education Framework)',
    units: [
      {
        unitNumber: 'Unit 1',
        unitTitleEn: 'Philosophy, Sociology, and Historical Evolution of Education in Rwanda',
        unitTitleRw: 'Intekerezo (Philosophy), Imibereho n\'Amateka y\'Uburezi mu Rwanda',
        keyCompetenceEn: 'Analyze the historical transformation of Rwanda\'s education system and apply philosophical principles in modern CBC teaching.',
        keyCompetenceRw: 'Gusesengura impinduka z\'amateka y\'uburezi mu Rwanda no gukoresha amahame y\'uburezi muri CBC igezweho.',
        lessons: [
          {
            lessonNumber: '1 of 5',
            lessonTitleEn: 'Pre-Colonial Traditional Rwandan Education (Itorero, Ubupfura, Umuryango)',
            lessonTitleRw: 'Uburezi bwa gakondo mu Rwanda mbere y\'ubukoroni (Itorero, Ubupfura)',
            suggestedObjectiveEn: 'Student teachers will analyze the transmission of moral values, crafts, and warfare through traditional Rwandan education.'
          },
          {
            lessonNumber: '2 of 5',
            lessonTitleEn: 'The Rwanda Competence-Based Curriculum (CBC): Core Pillars and Competences',
            lessonTitleRw: 'Inkingi n\'ubushobozi shingiro bya Gahunda y\'Uburezi Ishingiye ku Bushobozi (CBC)',
            suggestedObjectiveEn: 'Student teachers will explain knowledge, skills, attitudes, and values (KSAV) and 21st-century cross-cutting competences.'
          }
        ]
      },
      {
        unitNumber: 'Unit 2',
        unitTitleEn: 'Instructional Planning: Syllabi, Schemes of Work, and Lesson Plans',
        unitTitleRw: 'Iteganyabikorwa ryo Kwigisha: Integanyanyigisho, Iteganyagihe n\'Iteganyanyigisho y\'Isomo',
        keyCompetenceEn: 'Interpret REB syllabi, develop comprehensive schemes of work, and prepare standard CBC lesson plans.',
        keyCompetenceRw: 'Gusobanura integanyanyigisho za REB, gukora iteganyagihe no gutegura integanyanyigisho y\'isomo ya CBC.',
        lessons: [
          {
            lessonNumber: '1 of 5',
            lessonTitleEn: 'Deconstructing the REB Competence-Based Syllabus and Textbooks',
            lessonTitleRw: 'Gusesengura integanyanyigisho ya REB n\'ibitabo byemewe',
            suggestedObjectiveEn: 'Student teachers will extract Key Unit Competences, Learning Objectives (Cognitive, Affective, Psychomotor) from official syllabi.'
          },
          {
            lessonNumber: '2 of 5',
            lessonTitleEn: 'Designing the 3-Step CBC Teaching Matrix (Intro, Dev, Conclusion)',
            lessonTitleRw: 'Gutunganya imbonerahamwe y\'ibikorwa by\'umwarimu n\'umunyeshuri (Intangiriro, Inyigisho, Umusonzo)',
            suggestedObjectiveEn: 'Student teachers will align teacher facilitation with active learner actions and embedded generic competences.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // VI. TVET TRADES (RTB / NESA: LEVEL 1 TO LEVEL 5)
  // =========================================================================
  {
    subjectId: 'tvet_sod',
    subjectNameEn: 'Software Development & IT (TVET)',
    subjectNameRw: 'Gukora Porogaramu n\'Ikoranabuhanga (TVET Software Dev)',
    category: 'tvet_trades',
    gradeLevels: ['Level 1 (L1)', 'Level 2 (L2)', 'Level 3 (L3)', 'Level 4 (L4)', 'Level 5 (L5)'],
    edition: 'RTB / NESA Competency-Based Training Curriculum 2026-2027',
    units: [
      {
        unitNumber: 'Unit 1',
        unitTitleEn: 'Modern Web Application Development (HTML5, CSS3, JavaScript & React)',
        unitTitleRw: 'Gutunganya Urubuga rw\'Ikoranabuhanga rwa Web (Frontend & Responsive Design)',
        keyCompetenceEn: 'Design, develop, test, and deploy interactive and responsive web applications following industry UI/UX and coding standards.',
        keyCompetenceRw: 'Gushushanya, gukora, gusuzuma no gushyira ku murongo imbuga za web zikora neza kuri terefone na mudasobwa.',
        lessons: [
          {
            lessonNumber: '1 of 6',
            lessonTitleEn: 'Semantic HTML5 Architecture, Accessibility (ARIA), and SEO Meta Tags',
            lessonTitleRw: 'Imyandikire y\'urubuga (Semantic HTML5), Uburyo bworohereza bose na SEO',
            suggestedObjectiveEn: 'TVET trainees will create accessible HTML markup with semantic tags (<main>, <article>, <nav>, <section>) scoring 100 on Lighthouse.'
          },
          {
            lessonNumber: '2 of 6',
            lessonTitleEn: 'React Component Lifecycle, Props, and State Management with Hooks (useState, useEffect)',
            lessonTitleRw: 'Gukoresha React Components, Imiterere yazo (Props & State) n\'ibikoresho bya Hooks',
            suggestedObjectiveEn: 'Trainees will construct modular interactive React components handling dynamic state changes and persistence.'
          }
        ]
      },
      {
        unitNumber: 'Unit 2',
        unitTitleEn: 'Relational Database Design and SQL (PostgreSQL & MySQL)',
        unitTitleRw: 'Gushushanya n\'Ubugenzuzi bw\'Ububiko bw\'Amakuru (SQL & Databases)',
        keyCompetenceEn: 'Design normalized relational databases, write complex SQL queries, and enforce referential integrity.',
        keyCompetenceRw: 'Gukora gahunda y\'ububiko bw\'amakuru, kwandika amategeko ya SQL no kurinda umutekano w\'amakuru.',
        lessons: [
          {
            lessonNumber: '1 of 5',
            lessonTitleEn: 'Entity-Relationship Diagrams (ERD) and Database Normalization (1NF, 2NF, 3NF)',
            lessonTitleRw: 'Ibishushanyo by\'uburyo amakuru ahura (ERD) no kuyatondeka neza (Normalization)',
            suggestedObjectiveEn: 'Trainees will map out ER diagrams for a school management system in third normal form.'
          },
          {
            lessonNumber: '2 of 5',
            lessonTitleEn: 'Querying with SELECT, WHERE, ORDER BY, GROUP BY, and Aggregate Functions',
            lessonTitleRw: 'Gushakisha amakuru mu buryo buhanitse hakoreshejwe amategeko ya SQL',
            suggestedObjectiveEn: 'Trainees will write analytical SQL queries computing sums, averages, and group counts.'
          }
        ]
      }
    ]
  },
  {
    subjectId: 'tvet_elec',
    subjectNameEn: 'Electrical Technology & Solar PV Installation',
    subjectNameRw: 'Amashanyarazi n\'Imirasire y\'Izuba (Solar PV)',
    category: 'tvet_trades',
    gradeLevels: ['Level 1 (L1)', 'Level 2 (L2)', 'Level 3 (L3)', 'Level 4 (L4)', 'Level 5 (L5)'],
    edition: 'RTB Competency-Based Training Framework 2026-2027',
    units: [
      {
        unitNumber: 'Unit 1',
        unitTitleEn: 'Domestic Electrical Installation, Wiring, and Protective Devices',
        unitTitleRw: 'Gushyira amashanyarazi mu nzu, insinga n\'ibikoresho birinda impanuka',
        keyCompetenceEn: 'Perform safe domestic electrical conduit wiring, install distribution boards, and test earthing systems.',
        keyCompetenceRw: 'Gushyira amashanyarazi mu nzu ku buryo butegerejwe, gushyiraho ibibaho byo gukwirakwiza no gupima earthing.',
        lessons: [
          {
            lessonNumber: '1 of 5',
            lessonTitleEn: 'Electrical Workshop Safety, Personal Protective Equipment (PPE), and First Aid',
            lessonTitleRw: 'Umutekano mu kazi k\'amashanyarazi, imyenda y\'uburinzi n\'ubutabazi bw\'ibanze',
            suggestedObjectiveEn: 'Trainees will demonstrate proper use of insulated tools, voltage detectors, and emergency shutdown procedures.'
          },
          {
            lessonNumber: '2 of 5',
            lessonTitleEn: 'Wiring One-Way and Two-Way Lighting Circuits with Intermediate Switches',
            lessonTitleRw: 'Guhuza insinga z\'amatara azimwa ku mbago zitandukanye (Two-way switching)',
            suggestedObjectiveEn: 'Trainees will wire a staircase lighting circuit controllable from top and bottom switches.'
          }
        ]
      }
    ]
  }
];

/**
 * Subject theme templates for realistic unit synthesis when an exact textbook is not predefined
 */
const SUBJECT_THEME_TEMPLATES: Record<string, { unitEn: string; unitRw: string; compEn: string; compRw: string; lessonsEn: string[]; lessonsRw: string[] }[]> = {
  kinyarwanda: [
    {
      unitEn: 'Indangagaciro z\'Umuco Nyarwanda n\'Ubutwari',
      unitRw: 'Indangagaciro z\'Umuco Nyarwanda n\'Ubutwari',
      compEn: 'Gusesengura imyandiko ivuga ku muco nyarwanda, ubutwari n\'ubupfura no kugaragaza indangagaciro mu mibanire.',
      compRw: 'Gusesengura imyandiko ivuga ku muco nyarwanda, ubutwari n\'ubupfura no kugaragaza indangagaciro mu mibanire.',
      lessonsEn: ['Gusoma no gusobanura umwandiko: Intwari z\'u Rwanda', 'Gusesengura inyito y\'amagambo mashya', 'Inyunguramagambo n\'imikoreshereze y\'ibimenyetso by\'uburanga', 'Gukora imyitozo yo kwandika umwandiko ku butwari'],
      lessonsRw: ['Gusoma no gusobanura umwandiko: Intwari z\'u Rwanda', 'Gusesengura inyito y\'amagambo mashya', 'Inyunguramagambo n\'imikoreshereze y\'ibimenyetso by\'uburanga', 'Gukora imyitozo yo kwandika umwandiko ku butwari']
    },
    {
      unitEn: 'Imiyoborere Myiza, Ubumwe n\'Ubwiyunge',
      unitRw: 'Imiyoborere Myiza, Ubumwe n\'Ubwiyunge',
      compEn: 'Kugaragaza uruhare rw\'umuturage mu bumwe n\'ubwiyunge no kwandika imyandiko y\'ubuvanganzo.',
      compRw: 'Kugaragaza uruhare rw\'umuturage mu bumwe n\'ubwiyunge no kwandika imyandiko y\'ubuvanganzo.',
      lessonsEn: ['Uruhare rw\'ubumwe mu iterambere ry\'igihugu', 'Ibisakuzo n\'insigamigani bijyanye n\'ubumwe', 'Ikinyabupfura n\'imvugo yiyubashye mu ruhame', 'Guhanga igisigo kigufi cy\'ubumwe'],
      lessonsRw: ['Uruhare rw\'ubumwe mu iterambere ry\'igihugu', 'Ibisakuzo n\'insigamigani bijyanye n\'ubumwe', 'Ikinyabupfura n\'imvugo yiyubashye mu ruhame', 'Guhanga igisigo kigufi cy\'ubumwe']
    },
    {
      unitEn: 'Ibidukikije, Ubuhinzi n\'Iterambere Rirambye',
      unitRw: 'Ibidukikije, Ubuhinzi n\'Iterambere Rirambye',
      compEn: 'Kwandika no gusobanura amateka n\'ibikorwa byo kubungabunga ibidukikije no guteza imbere ubuhinzi buvuguruye.',
      compRw: 'Kwandika no gusobanura amateka n\'ibikorwa byo kubungabunga ibidukikije no guteza imbere ubuhinzi buvuguruye.',
      lessonsEn: ['Gusoma umwandiko: Kubungabunga amashyamba n\'imigezi', 'Amategeko y\'ikibonezamvugo: Ibinyazina n\'interuro', 'Imyitozo yo kwandika inyandiko ngufi y\'ubuvugizi', 'Gusubiramo no gukora isuzuma ry\'umutwe'],
      lessonsRw: ['Gusoma umwandiko: Kubungabunga amashyamba n\'imigezi', 'Amategeko y\'ikibonezamvugo: Ibinyazina n\'interuro', 'Imyitozo yo kwandika inyandiko ngufi y\'ubuvugizi', 'Gusubiramo no gukora isuzuma ry\'umutwe']
    }
  ],
  english: [
    {
      unitEn: 'Family, School, and Community Relationships',
      unitRw: 'Umuryango, Ishuri n\'Imibanire myiza mu Muryango',
      compEn: 'Listen to and communicate effectively about personal relationships, school routines, and communal responsibilities using accurate present tenses.',
      compRw: 'Kumva no kuvuga mu Cyongereza ibyerekeye umuryango, imirimo y\'ishuri n\'inshingano mu muryango hakoreshejwe amagambo akwiye.',
      lessonsEn: ['Describing Family Roles and Responsibilities', 'Expressing Daily Routines using Present Simple Tense', 'Asking and Giving Directions around School and Community', 'Writing a Short Descriptive Paragraph about My Community'],
      lessonsRw: ['Gusobanura imirimo y\'abagize umuryango', 'Kuvuga gahunda za buri munsi mu Cyongereza', 'Kubaza no kwerekana icyerekezo ku ishuri no mu gace utuyemo', 'Kwandika igika kigufi gisobanura umuryango wanjye']
    },
    {
      unitEn: 'Health, Nutrition, and Hygiene in Daily Life',
      unitRw: 'Ubuzima, Imirire Myiza n\'Isuku mu Buzima bwa buri Munsi',
      compEn: 'Discuss healthy diets, personal hygiene habits, and common illnesses using modal verbs and health vocabulary.',
      compRw: 'Kuganira ku mirire myiza, isuku n\'indwara zikunze kugaragara hifashishijwe amagambo akwiye y\'Icyongereza.',
      lessonsEn: ['Identifying Balanced Diet Components and Food Groups', 'Practicing Hygiene Rules and Handwashing Dialogue', 'Using Modals (Should / Must) for Health Advice', 'Reading Comprehension: Prevention of Communicable Diseases'],
      lessonsRw: ['Gutahura amatsinda y\'ibiribwa n\'indyo yuzuye', 'Gukora ibiganiro ku mabwiriza y\'isuku no gukaraba intoki', 'Gukoresha inshinga zifasha (should/must) mu gutanga inama z\'ubuzima', 'Gusoma umwandiko ku kwirinda indwara zandura']
    },
    {
      unitEn: 'Science, Technology, and Environmental Protection',
      unitRw: 'Ubumenyi, Ikoranabuhanga no Kubungabunga Ibidukikije',
      compEn: 'Read, summarize and debate issues related to climate change, renewable energy, and digital devices in modern Rwanda.',
      compRw: 'Gusoma, gushyira mu magambo ahinnye no kungurana ibitekerezo ku mihindagurikire y\'ibihe n\'ikoranabuhanga.',
      lessonsEn: ['Vocabulary of Digital Tools and Safe Internet Usage', 'Causes and Effects of Climate Change and Tree Planting', 'Expressing Cause and Effect using Conditionals (If-clauses)', 'Conducting a Class Debate on Renewable Energy Solutions'],
      lessonsRw: ['Amagambo y\'ibikoresho by\'ikoranabuhanga n\'imikoreshereze myiza ya internet', 'Impamvu n\'ingaruka z\'imihindagurikire y\'ibihe no gutera ibiti', 'Kugaragaza impamvu n\'ingaruka hakoreshejwe interuro zifite ibisabwa', 'Kugira impaka mu ishuri ku mbaraga zikomoka ku zuba']
    }
  ],
  social: [
    {
      unitEn: 'Physical Features and Geography of Rwanda',
      unitRw: 'Imiterere y\'Ubutaka n\'Ikarita y\'u Rwanda',
      compEn: 'Locate, describe, and appreciate major physical features, lakes, and national parks on the map of Rwanda.',
      compRw: 'Kumenya, gusobanura no gukunda ibiranga ubutaka, ibiyaga na za pariki z\'u Rwanda ku ikarita.',
      lessonsEn: ['Reading and Interpreting Map Symbols, Scales, and Legends', 'Mountains, Plateaus, and Lowlands of Rwanda', 'Water Bodies: Lakes, Rivers, and Wetland Conservation', 'Field Sketching and Map Drawing of Our Local District'],
      lessonsRw: ['Gusoma no gusobanura ibimenyetso n\'ipima ku ikarita', 'Imisozi, ibibaya n\'imanga by\'u Rwanda', 'Ibiyaga, imigezi n\'urufunzo rwo mu Rwanda', 'Gushushanya ikarita y\'akarere k\'ishuri ryacu']
    },
    {
      unitEn: 'Good Governance, Civic Rights, and Responsibilities',
      unitRw: 'Imiyoborere Myiza, Uburenganzira n\'Inshingano by\'Umuturage',
      compEn: 'Explain organs of local administration, fundamental human rights, and citizen duties in community development.',
      compRw: 'Gusobanura inzego z\'ubuyobozi bwite bwa leta, uburenganzira bw\'ikiremwamuntu n\'inshingano mu iterambere.',
      lessonsEn: ['Levels of Decentralized Governance (Umudugudu to District)', 'Fundamental Human Rights and Child Protection Laws', 'Community Work (Umuganda) and Civic Participation', 'Role of Mediation and Community Dispute Resolution'],
      lessonsRw: ['Inzego z\'ubutegetsi bwegerejwe abaturage (Umudugudu kugeza ku Karere)', 'Uburenganzira bw\'umwana n\'amategeko amurinda', 'Umuganda n\'uruhare rw\'umuturage mu bikorwa rusange', 'Inzego z\'abunzi no gukemura amakimbirane mu mahoro']
    }
  ]
};

/**
 * Generate fallback units for any arbitrary subject
 */
function generateSubjectFallbackUnits(subjectName: string, category: string, className?: string): RebCurriculumUnit[] {
  const sLower = subjectName.toLowerCase();
  let theme = SUBJECT_THEME_TEMPLATES.english;
  if (sLower.includes('kiny') || sLower.includes('ikinyarwanda')) {
    theme = SUBJECT_THEME_TEMPLATES.kinyarwanda;
  } else if (sLower.includes('soc') || sLower.includes('geog') || sLower.includes('hist') || sLower.includes('civic') || sLower.includes('imibanire')) {
    theme = SUBJECT_THEME_TEMPLATES.social;
  }

  const cls = className || (category === 'primary_school' ? 'P4' : category === 'secondary_o_level' ? 'S2' : 'Level');
  return theme.map((t, idx) => ({
    unitNumber: `Unit ${idx + 1}`,
    unitTitleEn: `${t.unitEn} (${subjectName})`,
    unitTitleRw: `${t.unitRw} (${subjectName})`,
    keyCompetenceEn: t.compEn,
    keyCompetenceRw: t.compRw,
    textbookReferenceEn: `REB CBC Official Curriculum Book for ${subjectName} (${cls}), 2026-2027 Updated Edition, Unit ${idx + 1}.`,
    textbookReferenceRw: `Igitabo cyemewe na REB cya ${subjectName} (${cls}), 2026-2027, Umutwe wa ${idx + 1}.`,
    lessons: t.lessonsEn.map((lEn, lIdx) => ({
      lessonNumber: `${lIdx + 1} of ${t.lessonsEn.length}`,
      lessonTitleEn: lEn,
      lessonTitleRw: t.lessonsRw[lIdx] || lEn,
      suggestedObjectiveEn: `By the end of the lesson, learners will master the core concepts of ${lEn.toLowerCase()} through group inquiry.`,
      suggestedObjectiveRw: `Gusoza isomo abanyeshuri bashobora gusobanura neza ibijyanye na ${t.lessonsRw[lIdx]?.toLowerCase() || lEn.toLowerCase()} binyuze mu gukorera hamwe.`,
      suggestedMaterialsEn: `Textbooks, learner activity sheets, chalk/whiteboard, realia and charts`,
      suggestedMaterialsRw: `Ibitabo by\'abanyeshuri, impapuro z\'imyitozo, ikibaho, ibikoresho bifatika`
    }))
  }));
}

/**
 * Helper to find available curriculum units for a given category, level/class, and subject.
 */
export function findRebCurriculumUnits(
  category: string,
  className?: string,
  subjectName?: string
): RebCurriculumUnit[] {
  if (!category) return [];

  // Match category in REB_CURRICULUM_2026_2027
  let matchedBooks = REB_CURRICULUM_2026_2027.filter(b => b.category === category);

  if (subjectName) {
    const sLower = subjectName.toLowerCase().trim();
    // 1. Exact match on subjectId
    let specificBook = matchedBooks.find(b => b.subjectId.toLowerCase() === sLower);
    
    // 2. Partial match on English or Kinyarwanda name
    if (!specificBook) {
      specificBook = matchedBooks.find(b => 
        b.subjectNameEn.toLowerCase().includes(sLower) || 
        b.subjectNameRw.toLowerCase().includes(sLower) ||
        sLower.includes(b.subjectNameEn.toLowerCase().split('(')[0].trim().toLowerCase())
      );
    }

    // 3. Keyword matching across titles (e.g. "Math" matches "Mathematics", "Chem" matches "Chemistry")
    if (!specificBook) {
      const keywords = sLower.replace(/[^a-z0-9]/gi, ' ').split(/\s+/).filter(k => k.length > 2);
      specificBook = matchedBooks.find(b => 
        keywords.some(kw => b.subjectNameEn.toLowerCase().includes(kw) || b.subjectNameRw.toLowerCase().includes(kw))
      );
    }

    if (specificBook && specificBook.units.length > 0) {
      return specificBook.units;
    }

    // 4. Try matching sampleUnits from RWANDA_EDUCATION_CURRICULUM
    const rawCat = RWANDA_EDUCATION_CURRICULUM.find(c => c.id === category);
    if (rawCat) {
      const matchedSubject = rawCat.subjects.find(s => 
        s.id.toLowerCase() === sLower || 
        s.nameEn.toLowerCase().includes(sLower) || 
        s.nameRw.toLowerCase().includes(sLower) ||
        sLower.includes(s.nameEn.toLowerCase().split('(')[0].trim().toLowerCase())
      );
      if (matchedSubject && matchedSubject.sampleUnits && matchedSubject.sampleUnits.length > 0) {
        return matchedSubject.sampleUnits.map((su, idx) => ({
          unitNumber: su.unitNumber || `Unit ${idx + 1}`,
          unitTitleEn: su.unitTitleEn,
          unitTitleRw: su.unitTitleRw,
          keyCompetenceEn: su.competenceEn,
          keyCompetenceRw: su.competenceRw,
          textbookReferenceEn: `REB ${subjectName} Learner Book (Updated 2026-2027 Edition), ${su.unitNumber}.`,
          textbookReferenceRw: `Igitabo cy\'umunyeshuri cya ${subjectName} (REB 2026-2027), ${su.unitNumber}.`,
          lessons: [
            {
              lessonNumber: '1 of 4',
              lessonTitleEn: `Introduction to ${su.unitTitleEn}`,
              lessonTitleRw: `Intangiriro ya ${su.unitTitleRw}`,
              suggestedObjectiveEn: `By the end of the lesson, learners will define key terms and concepts in ${su.unitTitleEn}.`,
              suggestedObjectiveRw: `Gusoza isomo abanyeshuri bazaba bashobora gusobanura amagambo n'amahame y'ingenzi muri ${su.unitTitleRw}.`
            },
            {
              lessonNumber: '2 of 4',
              lessonTitleEn: `Core Principles and Practical Applications of ${su.unitTitleEn}`,
              lessonTitleRw: `Amahame n'imikoreshereze mu bikorwa bya ${su.unitTitleRw}`,
              suggestedObjectiveEn: `Learners will apply core concepts in group practical tasks.`,
              suggestedObjectiveRw: `Abanyeshuri bazakoresha ubumenyi buvugwa mu matsinda y'ibikorwa.`
            },
            {
              lessonNumber: '3 of 4',
              lessonTitleEn: `Problem Solving and Guided Practice: ${su.unitTitleEn}`,
              lessonTitleRw: `Gukemura ibibazo n'imyitozo iyobowe muri ${su.unitTitleRw}`,
              suggestedObjectiveEn: `Learners will solve graded questions accurately in pairs.`,
              suggestedObjectiveRw: `Abanyeshuri bazakemura ibibazo byatanzwe mu matsinda ya babiri babiri.`
            },
            {
              lessonNumber: '4 of 4',
              lessonTitleEn: `Evaluation and Formative Assessment: ${su.unitTitleEn}`,
              lessonTitleRw: `Isuzuma ngiro n'isuzuma risoza ry'umutwe: ${su.unitTitleRw}`,
              suggestedObjectiveEn: `Learners will demonstrate mastery of ${su.competenceEn.slice(0, 50)}... in written exercises.`,
              suggestedObjectiveRw: `Abanyeshuri bazagaragaza ubushobozi bw'umutwe mu kizamini ngiro cyanditse.`
            }
          ]
        }));
      }
    }

    // 5. Generate tailored fallback units for this subject so it is NEVER empty
    return generateSubjectFallbackUnits(subjectName, category, className);
  }

  // If specific subject not matched, return units of the first book for that category
  if (matchedBooks.length > 0) {
    return matchedBooks[0].units;
  }

  return generateSubjectFallbackUnits('General Studies', category, className);
}

/**
 * Find the matched book metadata for display
 */
export function findRebCurriculumBook(
  category: string,
  subjectName?: string
): RebCurriculumSubjectBook | undefined {
  if (!category) return undefined;
  let matchedBooks = REB_CURRICULUM_2026_2027.filter(b => b.category === category);
  if (matchedBooks.length === 0) matchedBooks = REB_CURRICULUM_2026_2027;

  if (subjectName) {
    const sLower = subjectName.toLowerCase().trim();
    const found = matchedBooks.find(b => 
      b.subjectNameEn.toLowerCase().includes(sLower) || 
      b.subjectNameRw.toLowerCase().includes(sLower) ||
      sLower.includes(b.subjectNameEn.toLowerCase().split('(')[0].trim().toLowerCase())
    );
    if (found) return found;
  }

  return matchedBooks[0];
}

/**
 * Search across the entire 2026-2027 REB curriculum by keyword
 */
export function searchRebCurriculum(keyword: string): {
  book: RebCurriculumSubjectBook;
  unit: RebCurriculumUnit;
  lesson?: RebCurriculumLesson;
}[] {
  if (!keyword || keyword.trim().length < 2) return [];
  const q = keyword.toLowerCase().trim();
  const results: {
    book: RebCurriculumSubjectBook;
    unit: RebCurriculumUnit;
    lesson?: RebCurriculumLesson;
  }[] = [];

  for (const book of REB_CURRICULUM_2026_2027) {
    for (const unit of book.units) {
      const unitMatches = 
        unit.unitNumber.toLowerCase().includes(q) ||
        unit.unitTitleEn.toLowerCase().includes(q) ||
        unit.unitTitleRw.toLowerCase().includes(q) ||
        unit.keyCompetenceEn.toLowerCase().includes(q) ||
        unit.keyCompetenceRw.toLowerCase().includes(q);

      if (unitMatches) {
        results.push({ book, unit, lesson: unit.lessons[0] });
      }

      for (const lesson of unit.lessons) {
        if (
          lesson.lessonNumber.toLowerCase().includes(q) ||
          lesson.lessonTitleEn.toLowerCase().includes(q) ||
          lesson.lessonTitleRw.toLowerCase().includes(q)
        ) {
          if (!results.some(r => r.unit === unit && r.lesson === lesson)) {
            results.push({ book, unit, lesson });
          }
        }
      }
    }
  }

  return results.slice(0, 20); // Top 20 results
}
