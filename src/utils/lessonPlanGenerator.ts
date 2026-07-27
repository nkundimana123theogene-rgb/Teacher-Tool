import { LessonPlanRequest, LessonPlanData } from '../types';

export function generateClientLessonPlan(request: LessonPlanRequest, defaultTeacherName?: string): LessonPlanData {
  const language = request.language || 'English';
  const isKiny = language.toLowerCase().includes('kiny') || language.toLowerCase().includes('rwanda');
  const isFrench = language.toLowerCase().includes('fren') || language.toLowerCase().includes('fran');
  const isSwahili = language.toLowerCase().includes('swah') || language.toLowerCase().includes('kisw');

  const school = request.schoolName || 'Standard School';
  const teacher = request.teacherName || defaultTeacherName || 'Teacher';
  const term = request.term || 'Term 1';
  const date = request.date || new Date().toISOString().split('T')[0];
  const subject = request.subject || 'General Subject';
  const grade = request.classGrade || 'Primary 5';
  const unitNo = request.unitNo || '1';
  const lessonNo = request.lessonNo || '1 of 5';
  const duration = request.duration || '40 minutes';
  const classSize = request.classSize || '40 learners';
  const specialNeeds = request.specialNeeds || (isKiny ? 'Abafite ubumuga buzwi bazahabwa imfashanyigisho zihariye.' : 'Visual and auditory support provided as needed.');
  const unitTitle = request.unitTitle || 'Core Concepts';
  const keyCompetence = request.keyUnitCompetence || 'Demonstrate understanding and practical application of key concepts.';
  const lessonTitle = request.lessonTitle || 'Introduction to Topic';
  const materials = request.learningMaterials || 'Textbooks, wall charts, exercise books, chalk/markers';
  const refs = request.references || 'REB Syllabus & Teacher Guide';

  let obj = '';
  if (request.instructionalObjective && request.instructionalObjective.length > 5 && !request.instructionalObjective.includes('Auto-generated')) {
    obj = request.instructionalObjective;
  } else if (isKiny) {
    obj = `Mu gusoza isomo, bahawe imfashanyigisho n'inyandiko zikwiye, abanyeshuri bazaba bashoboye gusobanura no gukoresha ${lessonTitle} mu buryo bw'ukuri no bila kuguza.`;
  } else if (isFrench) {
    obj = `À la fin de la leçon, à l'aide des supports pédagogiques fournis, les apprenants seront capables d'expliquer et d'appliquer ${lessonTitle} avec précision.`;
  } else if (isSwahili) {
    obj = `Fikia mwisho wa somo, kwa kutumia vifaa vya kufundishia, wanafunzi wataweza kufafanua na kutumia ${lessonTitle} kwa usahihi.`;
  } else {
    obj = `By the end of the lesson, given illustrative charts and exercise sheets, learners will be able to explain, construct, and apply ${lessonTitle} accurately within ${duration}.`;
  }

  let steps = [];
  if (isKiny) {
    steps = [
      {
        stepName: '1. IRIBURIRO (INTRODUCTION)',
        timing: '5 min',
        teacherActivities: `Mwarimu asaba abanyeshuri kwibuka isomo ryatambutse, ababaza ibibazo bitanga icyerekezo ku topic ya "${lessonTitle}". Ahanika intego y'isomo ku kibaho.`,
        learnerActivities: `Abanyeshuri barasubiza ibibazo by'isomo rya kera, barategera amatwi intego nshya kandi bakandika umutwe w'isomo muri kaye zabo.`,
        competencesAndCrossCutting: 'Itumanaho (Communication) & Ubushobozi bwo gutekereza cyane (Critical thinking).'
      },
      {
        stepName: '2. INYIGISHO NYIRIZINA (DEVELOPMENT)',
        timing: '25 min',
        teacherActivities: `Mwarimu asobanura neza amategeko n'ibice by'isomo rya "${lessonTitle}". Agaba abanyeshuri mu matsinda macheya (group work), akabahera ibikorwa (tasks) no gukora imyitozo. Mwarimu agendagenda mu matsinda afasha abafite ingorane.`,
        learnerActivities: `Abanyeshuri bakorera mu matsinda, baraganira ku ngingo za ${lessonTitle}, bakora imyitozo bayobowe n'amatsinda, bakandika imyanzuro yabo bafite ubusabane. Abahagarariye amatsinda barasobanurira ibyo bagezeho imbere y'ishuri.`,
        competencesAndCrossCutting: 'Ubusabane (Cooperation) & Uburinganire (Gender education in group leadership).'
      },
      {
        stepName: '3. UMWANZURO N\'ISUZUMA (CONCLUSION & EVALUATION)',
        timing: '10 min',
        teacherActivities: `Mwarimu afatanyije n'abanyeshuri basoza incamake y'isomo. Mwarimu abaza ibibazo 2 byo gupima ubumenyi (formative assessment) kandi agahera abanyeshuri umukoro w'o murugo (homework).`,
        learnerActivities: `Abanyeshuri baravuga incamake y'ibyo basobanukiwe, barasubiza ibibazo by'isuzuma, bakandika umukoro wo mu rugo mu makaye zabo.`,
        competencesAndCrossCutting: 'Gukemura ibibazo (Problem solving) & Kwigira no kwiyemerera.'
      }
    ];
  } else if (isFrench) {
    steps = [
      {
        stepName: '1. INTRODUCTION',
        timing: '5 min',
        teacherActivities: `L'enseignant révise les prérequis par des questions relatives au sujet "${lessonTitle}". Présente l'objectif de la leçon au tableau.`,
        learnerActivities: `Les apprenants répondent aux questions de rappel, écoutent attentivement l'objectif et notent le titre de la leçon dans leurs cahiers.`,
        competencesAndCrossCutting: 'Communication et pensée critique.'
      },
      {
        stepName: '2. DÉVELOPPEMENT',
        timing: '25 min',
        teacherActivities: `L'enseignant explique le contenu de "${lessonTitle}". Organise les travaux de groupe, guide les exercices et soutient les apprenants en difficulté.`,
        learnerActivities: `Les apprenants travaillent en petits groupes, discutent des concepts, résolvent les exercices et présentent leurs réponses à la classe.`,
        competencesAndCrossCutting: 'Coopération et égalité des genres.'
      },
      {
        stepName: '3. CONCLUSION ET ÉVALUATION',
        timing: '10 min',
        teacherActivities: `L'enseignant résume la leçon avec la participation des apprenants, pose des questions d'évaluation et donne les devoirs à domicile.`,
        learnerActivities: `Les apprenants formulent la synthèse de ce qu'ils ont appris, répondent aux questions d'évaluation et notent les devoirs.`,
        competencesAndCrossCutting: 'Résolution de problèmes et apprentissage autonome.'
      }
    ];
  } else if (isSwahili) {
    steps = [
      {
        stepName: '1. UTANGULIZI',
        timing: '5 min',
        teacherActivities: `Mwalimu anakumbusha somo lililopita kwa kuuliza maswali yanayohusiana na mada ya "${lessonTitle}". Anaandika lengo la somo ubaoni.`,
        learnerActivities: `Wanafunzi wanajibu maswali, wanasikiliza kwa makini lengo la somo na kuandika mada kwenye daftari zao.`,
        competencesAndCrossCutting: 'Uwasilishaji na fikra tunduizi.'
      },
      {
        stepName: '2. MAENDELEO YA SOMO',
        timing: '25 min',
        teacherActivities: `Mwalimu anafafanua dhana kuu za "${lessonTitle}". Anagawanya wanafunzi katika makundi na kusimamia mazoezi.`,
        learnerActivities: `Wanafunzi wanafanya kazi katika makundi, wanajadili na kusawazisha majibu, kisha wanawasilisha mbele ya darasa.`,
        competencesAndCrossCutting: 'Ushirikiano na usawa wa kijinsia.'
      },
      {
        stepName: '3. HITIMISHO NA TATHMINI',
        timing: '10 min',
        teacherActivities: `Mwalimu anaongoza muhtasari wa somo, anauliza maswali ya tathmini na kutoa kazi ya nyumbani.`,
        learnerActivities: `Wanafunzi wanatoa muhtasari wa kile walichojifunza, wanajibu maswali na kuandika kazi ya nyumbani.`,
        competencesAndCrossCutting: 'Utatuzi wa matatizo na kujifunza maisha yote.'
      }
    ];
  } else {
    steps = [
      {
        stepName: '1. INTRODUCTION',
        timing: '5 min',
        teacherActivities: `Teacher reviews prerequisite knowledge by asking key questions related to previous topics. Introduces the new lesson topic: "${lessonTitle}" and states the instructional objective clearly on the board.`,
        learnerActivities: `Learners actively respond to recap questions, pay close attention to the introduced objective, and write down the lesson title in their notebooks.`,
        competencesAndCrossCutting: 'Communication skills & Critical thinking through guided recap questions.'
      },
      {
        stepName: '2. DEVELOPMENT (BODY OF LESSON)',
        timing: '25 min',
        teacherActivities: `Teacher presents core concepts of "${lessonTitle}" using learning materials. Facilitates small group activities and practical exercises. Moves around the classroom providing targeted guidance, checking understanding, and encouraging active peer collaboration.`,
        learnerActivities: `Learners work collaboratively in small groups to examine ${lessonTitle}, solve exercise problems, discuss key solutions, and present group findings to the class.`,
        competencesAndCrossCutting: 'Cooperation and Interpersonal relations & Gender equality in team roles.'
      },
      {
        stepName: '3. CONCLUSION & ASSESSMENT',
        timing: '10 min',
        teacherActivities: `Teacher guides learners to summarize the main lesson takeaways. Administers quick formative assessment questions to check mastery, and assigns homework exercises.`,
        learnerActivities: `Learners articulate key takeaways, answer assessment questions individually, and write down the assigned homework in their notebooks.`
      }
    ];
  }

  const openFormat = `# LESSON PLAN: ${lessonTitle.toUpperCase()}
**Subject:** ${subject} | **Class:** ${grade} | **Date:** ${date}
**School:** ${school} | **Teacher:** ${teacher}

---
### 1. LESSON OVERVIEW
- **Unit N° & Title:** Unit ${unitNo} - ${unitTitle}
- **Key Unit Competence:** ${keyCompetence}
- **Lesson Topic:** ${lessonTitle} (${lessonNo})
- **Duration:** ${duration} | **Class Size:** ${classSize}
- **Learning Materials:** ${materials}
- **References:** ${refs}

---
### 2. INSTRUCTIONAL OBJECTIVE
${obj}

---
### 3. STEP-BY-STEP PEDAGOGICAL DELIVERABLES
${steps.map(s => `#### ${s.stepName} (${s.timing})
- **Teacher Activities:** ${s.teacherActivities}
- **Learner Activities:** ${s.learnerActivities}
- **Competences & Cross-Cutting:** ${s.competencesAndCrossCutting}
`).join('\n')}

---
### 4. TEACHER SELF-EVALUATION
*(To be completed after lesson delivery)*
`;

  return {
    id: 'lp_' + Math.random().toString(36).substring(2, 10),
    createdAt: new Date().toISOString(),
    language: request.language,
    format: request.format,
    header: {
      schoolName: school,
      teacherName: teacher,
      term: term,
      date: date,
      subject: subject,
      classGrade: grade,
      unitNo: unitNo,
      lessonNo: lessonNo,
      duration: duration,
      classSize: classSize,
      specialNeeds: specialNeeds,
      unitTitle: unitTitle,
      keyUnitCompetence: keyCompetence,
      lessonTitle: lessonTitle,
      instructionalObjective: obj,
      location: request.location || 'In Classroom',
      learningMaterials: materials,
      references: refs,
    },
    steps: steps,
    selfEvaluation: '',
    openFormatContent: openFormat,
  };
}

/**
 * Custom Error Class for Lesson Plan Validation Failures
 */
export class LessonPlanValidationError extends Error {
  constructor(message: string, public readonly rawContent?: unknown) {
    super(message);
    this.name = 'LessonPlanValidationError';
  }
}

/**
 * Extracts and cleans JSON string from raw text, API streams, SSE payloads, or markdown blocks.
 */
export function extractJsonFromText(rawText: string): string | null {
  if (!rawText || typeof rawText !== 'string') return null;

  let cleaned = rawText.trim();

  // If HTML or standard HTTP error page, reject immediately
  if (
    cleaned.startsWith('<!DOCTYPE') ||
    cleaned.startsWith('<html') ||
    cleaned.startsWith('The page') ||
    cleaned.startsWith('404') ||
    cleaned.startsWith('500')
  ) {
    return null;
  }

  // Remove markdown code fences if present
  if (cleaned.includes('```')) {
    cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
  }

  // Handle Server-Sent Events (SSE) data streams if formatted as "data: {...}"
  if (cleaned.includes('data:')) {
    const lines = cleaned.split('\n');
    const jsonParts = lines
      .map((l) => l.trim())
      .filter((l) => l.startsWith('data:'))
      .map((l) => l.replace(/^data:\s*/, ''))
      .filter((l) => l && l !== '[DONE]');
    if (jsonParts.length > 0) {
      cleaned = jsonParts.join('');
    }
  }

  // Extract content between first '{' and last '}'
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.substring(firstBrace, lastBrace + 1);
  }

  return null;
}

/**
 * Safely parses any stream, Response, or text into a JSON object.
 */
export async function parseResponseStream(
  input: string | Response | ReadableStream | unknown
): Promise<any> {
  if (!input) return null;

  try {
    let rawString = '';

    if (typeof input === 'string') {
      rawString = input;
    } else if (typeof Response !== 'undefined' && input instanceof Response) {
      const clone = input.clone();
      rawString = await clone.text();
    } else if (
      typeof ReadableStream !== 'undefined' &&
      input instanceof ReadableStream
    ) {
      const reader = input.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          rawString += decoder.decode(value, { stream: !done });
        }
      }
    } else if (typeof input === 'object') {
      return input;
    }

    const jsonString = extractJsonFromText(rawString);
    if (!jsonString) {
      throw new LessonPlanValidationError('Failed to locate valid JSON structure in stream or response', rawString);
    }

    return JSON.parse(jsonString);
  } catch (err: any) {
    if (err instanceof LessonPlanValidationError) throw err;
    throw new LessonPlanValidationError(`JSON stream parsing failed: ${err?.message || err}`, input);
  }
}

/**
 * Validates whether an object matches the required LessonPlanData structure.
 */
export function validateLessonPlanStructure(candidate: any): LessonPlanData | null {
  if (!candidate || typeof candidate !== 'object') return null;

  // Handle case where lessonPlan is nested inside a container object e.g. { lessonPlan: { ... } }
  const data = candidate.lessonPlan ? candidate.lessonPlan : candidate;

  if (!data || typeof data !== 'object') return null;

  // Validate header presence or build default header if partial
  const header = data.header && typeof data.header === 'object' ? data.header : {};
  const steps = Array.isArray(data.steps) ? data.steps : [];

  // Minimum field validation
  const hasBasicHeaderInfo =
    typeof header.subject === 'string' ||
    typeof header.lessonTitle === 'string' ||
    typeof data.openFormatContent === 'string' ||
    steps.length > 0;

  if (!hasBasicHeaderInfo) {
    return null;
  }

  const validatedData: LessonPlanData = {
    id: typeof data.id === 'string' && data.id ? data.id : 'lp_' + Math.random().toString(36).substring(2, 10),
    createdAt: typeof data.createdAt === 'string' && data.createdAt ? data.createdAt : new Date().toISOString(),
    language: data.language || 'English',
    format: data.format || 'reb_grid',
    header: {
      schoolName: header.schoolName || 'Standard School',
      teacherName: header.teacherName || 'Teacher',
      term: header.term || 'Term 1',
      date: header.date || new Date().toISOString().split('T')[0],
      subject: header.subject || 'General Subject',
      classGrade: header.classGrade || 'Primary 5',
      unitNo: header.unitNo || '1',
      lessonNo: header.lessonNo || '1',
      duration: header.duration || '40 minutes',
      classSize: header.classSize || '40 learners',
      specialNeeds: header.specialNeeds || 'Standard classroom support',
      unitTitle: header.unitTitle || 'Unit Core',
      keyUnitCompetence: header.keyUnitCompetence || 'Key competence',
      lessonTitle: header.lessonTitle || 'Lesson Topic',
      instructionalObjective: header.instructionalObjective || 'Lesson objective',
      location: header.location || 'In Classroom',
      learningMaterials: header.learningMaterials || 'Textbooks, chalkboard',
      references: header.references || 'REB Syllabus',
    },
    steps: steps.map((s: any, idx: number) => ({
      stepName: s.stepName || `Step ${idx + 1}`,
      timing: s.timing || '10 min',
      teacherActivities: s.teacherActivities || 'Teacher introduces topic',
      learnerActivities: s.learnerActivities || 'Learners engage in activities',
      competencesAndCrossCutting: s.competencesAndCrossCutting || 'Basic competence',
    })),
    selfEvaluation: typeof data.selfEvaluation === 'string' ? data.selfEvaluation : '',
    openFormatContent: typeof data.openFormatContent === 'string' ? data.openFormatContent : undefined,
  };

  return validatedData;
}

/**
 * Robust Error Boundary function that parses and validates API response streams.
 * Guarantees a valid LessonPlanData object is returned, using fallback if stream is invalid or broken.
 */
export async function processLessonPlanStreamSafely(
  input: string | Response | ReadableStream | unknown,
  fallbackRequest?: LessonPlanRequest,
  defaultTeacherName?: string
): Promise<LessonPlanData> {
  try {
    const parsedJson = await parseResponseStream(input);
    if (parsedJson) {
      const validated = validateLessonPlanStructure(parsedJson);
      if (validated) {
        return validated;
      }
    }
  } catch (error: any) {
    console.warn('Lesson Plan Stream Parsing Boundary intercepted issue:', error?.message || error);
  }

  // Deploy resilient client generator fallback if API stream parsing or validation fails
  if (fallbackRequest) {
    return generateClientLessonPlan(fallbackRequest, defaultTeacherName);
  }

  throw new LessonPlanValidationError('Failed to parse lesson plan stream and no fallback request provided.');
}

