import { useState, useEffect, useCallback } from 'react';

export type AppLanguage = 'English' | 'Kinyarwanda' | 'Français' | 'Kiswahili';

export interface LanguageInfo {
  code: string;
  key: AppLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', key: 'English', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'rw', key: 'Kinyarwanda', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', flag: '🇷🇼' },
  { code: 'fr', key: 'Français', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'sw', key: 'Kiswahili', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇹🇿' },
];

export const LANGUAGE_STORAGE_KEY = 'nkorera_app_language';
const LANGUAGE_EVENT = 'nkorera_language_changed';

/**
 * Normalizes various language names, aliases, or ISO codes into standard AppLanguage.
 */
export function normalizeLanguage(lang?: string | null): AppLanguage {
  if (!lang) return 'English';
  const clean = lang.trim().toLowerCase();

  if (clean === 'rw' || clean === 'kin' || clean.includes('kinya') || clean.includes('ikinyarwanda')) {
    return 'English';
  }
  if (clean === 'fr' || clean === 'fra' || clean.includes('fran') || clean.includes('french')) {
    return 'Français';
  }
  if (clean === 'sw' || clean === 'swa' || clean.includes('kiswa') || clean.includes('swahili')) {
    return 'Kiswahili';
  }
  return 'English';
}

/**
 * Retrieves the currently active app language from local persistence.
 */
export function getAppLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'English';
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved) return normalizeLanguage(saved);
  } catch {
    // ignore localStorage errors in sandboxed contexts
  }
  return 'English';
}

/**
 * Persists and broadcasts a change in the application language.
 */
export function setAppLanguage(lang: AppLanguage | string): void {
  const normalized = normalizeLanguage(lang);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
      window.dispatchEvent(new CustomEvent(LANGUAGE_EVENT, { detail: { language: normalized } }));
    } catch {
      // ignore localStorage errors
    }
  }
}

/**
 * Comprehensive central translation dictionary organized by domains & dot notation.
 */
export const TRANSLATIONS_DICTIONARY: Record<AppLanguage, Record<string, any>> = {
  English: {
    common: {
      save: "Save",
      saving: "Saving...",
      saved: "Saved",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      create: "Create",
      back: "Back",
      next: "Next",
      previous: "Previous",
      copy: "Copy",
      copied: "Copied!",
      download: "Download",
      print: "Print",
      export: "Export",
      exportWord: "Export Word (.doc)",
      exportPdf: "Export PDF",
      close: "Close",
      confirm: "Confirm",
      search: "Search",
      loading: "Loading...",
      filter: "Filter",
      refresh: "Refresh",
      retry: "Retry",
      viewAll: "View All",
      selectAll: "Select All",
      clear: "Clear",
      actions: "Actions",
      settings: "Settings",
      help: "Help",
      language: "Language",
      new: "New",
      open: "Open",
      status: "Status",
      active: "Active",
      error: "Error",
      success: "Success",
      preview: "Preview",
      optional: "Optional",
      required: "Required",
      done: "Done",
      date: "Date",
      name: "Name",
      total: "Total",
      noData: "No data available",
      present: "Present",
      handout: "Handout",
      share: "Share",
      learnMore: "Learn More"
    },
    nav: {
      dashboard: "Dashboard",
      lessonPlanning: "Lesson Planning",
      cbcPlans: "CBC Lesson Plans",
      nurseryPlans: "Nursery Lesson Plans",
      remedialPlans: "Remedial Plans",
      schemesOfWork: "Schemes of Work",
      worksheets: "Worksheets & Exercises",
      slides: "Presentation Slides",
      quizHomework: "Homework & Quizzes",
      teacherRecords: "Teacher Records & Books",
      rebBooks: "REB Curriculum Books",
      resources: "Teacher Resources",
      subscription: "Subscription Plans",
      myProfile: "My Profile",
      adminPanel: "Admin Panel",
      logout: "Log Out",
      login: "Sign In",
      helpSupport: "Help & Support",
      aiAssistant: "Nkorera AI Assistant"
    },
    lessonPlan: {
      schoolName: "School Name",
      teacherName: "Teacher Name",
      term: "Term",
      date: "Date",
      subject: "Subject",
      classLevel: "Class Level",
      grade: "Grade Level",
      lessonName: "Lesson Name",
      duration: "Duration (min)",
      classSize: "Class Size",
      unitNumber: "Unit Number",
      unitTitle: "Unit Title",
      lessonNumber: "Lesson Number",
      topic: "Topic / Focus",
      keyCompetence: "Key Unit Competence",
      instructionalObjective: "Instructional Objective",
      learningMaterials: "Learning Materials",
      references: "References & Sources",
      specialNeeds: "Special Educational Needs",
      location: "Class Location",
      introduction: "Introduction / Greeting",
      development: "Development / Guided Learning",
      conclusion: "Conclusion & Summary",
      teacherSelfEval: "Teacher Self-Evaluation & Observations",
      aiAutoFill: "AI Auto-Fill",
      generateAiPlan: "Generate AI Plan",
      generatingAiPlan: "Writing AI Plan...",
      editDetails: "Edit Details",
      printPdf: "Print PDF",
      language: "Lesson Language",
      editMode: "Enable Edit Mode",
      lockPreview: "Lock / Preview",
      editorTab: "Editor Tab",
      sheetTab: "1-Page Sheet",
      previewDownload: "Preview & Download Plan",
      finishEditPlan: "Finish & Save Plan"
    },
    nursery: {
      schoolName: "1. School Name",
      teacherName: "2. Teacher Name",
      classLevel: "3. Class Level (Nursery)",
      subject: "4. Subject / Activity Area",
      lessonName: "5. Activity / Lesson Name",
      term: "6. Term",
      date: "7. Date",
      duration: "8. Duration",
      classSize: "9. Class Size",
      competenceFocus: "10. Competence Focus",
      instructionalObjective: "1. Instructional Objective",
      learningMaterials: "2. Learning Materials",
      greetingCircle: "1. Greeting Circle",
      guidedLearning: "2. Guided Learning",
      creativePlay: "3. Creative Play & Practice",
      recapAndGoodbye: "4. Recap & Goodbye",
      evaluationComments: "1. Teacher Observations & Self-Evaluation",
      generateAiPlan: "Generate AI Plan",
      editDetails: "Edit Details",
      printPdf: "Print PDF",
      language: "Lesson Language",
      editMode: "Enable Edit Mode",
      lockPreview: "Lock / Preview",
      editorTab: "Editor Tab",
      sheetTab: "1-Page Sheet"
    },
    slides: {
      modalTitle: "Create Presentation Slides",
      modalSubtitle: "Create beautiful presentation slides aligned with your topic, ready to present in class",
      modalBadge: "AI SLIDES",
      savedDecksBtn: "Saved Decks",
      backBtn: "Back",
      langTitle: "Presentation Language Context",
      lessonDetailsTitle: "Lesson Details",
      lessonDetailsSub: "Fill in the details about your lesson",
      subjectLabel: "Subject *",
      gradeLabel: "Grade *",
      topicLabel: "Topic *",
      durationLabel: "Lesson Duration *",
      languageLabel: "Language",
      countryLabel: "Country",
      curriculumLabel: "Curriculum Standard",
      additionalDetailsLabel: "Additional Details (Optional)",
      additionalDetailsPlaceholder: "e.g., Introduce the concept and include questions for in-class discussion",
      pasteNotesTitle: "Paste Your Notes (Optional)",
      pasteNotesSub: "Have your own notes? Paste them here and we'll structure them into slides.",
      pasteNotesPlaceholder: "Paste your lesson notes here...",
      pasteNotesExampleTitle: "Example:",
      enhancementTitle: "Enhancement Options",
      searchResourcesLabel: "Search curriculum & educational resources",
      searchResourcesDesc: "Automatically searches for official curriculum content and textbook resources.",
      generateImagesLabel: "Generate images for slides",
      generateImagesDesc: "Generates relevant educational diagrams and illustrations for each slide.",
      teacherPrefTitle: "Teacher Preferences",
      teacherPrefSub: "Customize how your slides are generated",
      teacherNotesStyleLabel: "Teacher Notes Style",
      bulletPointStyleLabel: "Bullet Point Style",
      numberOfSlidesLabel: "Number of Slides",
      includeTimingsLabel: "Include slide timings",
      simplifiedModeLabel: "Simplified mode (no heavy academic terms)",
      chooseThemeTitle: "Choose Theme",
      chooseThemeSub: "Select a visual theme for your presentation",
      generateBtn: "Create Presentation Slides",
      generatingBtn: "Creating Presentation Slides...",
      presentFullscreenBtn: "Present (Full Screen)",
      pdfBtn: "PDF",
      pptBtn: "PPT",
      handoutBtn: "Handout PDF",
      copyBtn: "Copy",
      copiedBtn: "Copied!",
      newDeckBtn: "New Deck",
      slideOf: "Slide #{current} of {total}",
      teacherGuidanceTitle: "Teacher Guidance & Speaker Notes:",
      prevSlide: "Previous Slide",
      nextSlide: "Next Slide",
      allSlidesOverview: "All Slides Overview"
    },
    worksheets: {
      modalTitle: "Create Printable Worksheet",
      modalSubtitle: "Generate AI-powered worksheets with automatic answer keys",
      backBtn: "Back to Worksheets",
      langTitle: "Language Context / Ururimi",
      subjectLabel: "Subject *",
      gradeLabel: "Grade Level *",
      unitLabel: "Unit (Number & Title) *",
      topicLabel: "Topic / Lesson Focus *",
      worksheetTypeLabel: "Worksheet Type",
      difficultyLabel: "Difficulty (Optional)",
      numQuestionsLabel: "Number of Questions",
      marksPerQuestionLabel: "Marks per Question",
      languageLabel: "Language",
      curriculumLabel: "Curriculum (Optional)",
      countryLabel: "Country (Optional)",
      customInstructionsLabel: "Custom Instructions (Optional)",
      additionalDetailsLabel: "Additional Details (Optional)",
      additionalDetailsPlaceholder: "Any specific instructions, contexts, or learning objectives to emphasize...",
      webSearchLabel: "Web Search",
      webSearchDesc: "Use curriculum resources to generate relevant questions",
      includeAnswerKeyLabel: "Include Answer Key",
      includeAnswerKeyDesc: "Generate answer key with step-by-step explanations",
      generateBtn: "Generate Worksheet",
      generatingBtn: "Generating Worksheet...",
      cancelBtn: "Cancel",
      editParamsBtn: "Edit Parameters",
      copyBtn: "Copy",
      copiedBtn: "Copied!",
      printBtn: "Print",
      exportWordBtn: "Export Word (.doc)",
      studentNameLabel: "Student Name:",
      dateLabel: "Date:",
      totalQuestionsLabel: "Total Questions:",
      totalMarksLabel: "Total Marks:",
      instructionsLabel: "Instructions:",
      answerKeyTitle: "Official Answer Key & Teacher Guide",
      answerKeySub: "Correct responses and marking notes"
    },
    auth: {
      signIn: "Sign In",
      signUp: "Create Account",
      email: "Email Address",
      password: "Password",
      fullName: "Full Name",
      phone: "Phone Number",
      country: "Country",
      welcomeBack: "Welcome back to Nkorera!",
      logoutSuccess: "You have been logged out successfully.",
      requireLogin: "Please sign in to access this feature."
    },
    subscription: {
      title: "Subscription Plans",
      activePlan: "Active Plan",
      upgrade: "Upgrade to Premium",
      creditsRemaining: "{count} credits remaining",
      unlimitedAccess: "Unlimited Access for Rwandan & Global Teachers"
    }
  },

  Kinyarwanda: {
    common: {
      save: "Bika",
      saving: "Birimo kubikwa...",
      saved: "Byabitswe",
      cancel: "Kureka",
      delete: "Siba",
      edit: "Hindura",
      create: "Kora / Rema",
      back: "Gusubira Inyuma",
      next: "Ibikurikira",
      previous: "Ibibanziriza",
      copy: "Koporora",
      copied: "Byakoporowe!",
      download: "Kukuramo (Download)",
      print: "Gucapa (Print)",
      export: "Kohereza hanze",
      exportWord: "Gukuramo Word (.doc)",
      exportPdf: "Gukuramo PDF",
      close: "Funga",
      confirm: "Emeza",
      search: "Shakisha",
      loading: "Birimo gutunganywa...",
      filter: "Shungura",
      refresh: "Vugurura",
      retry: "Ongera ugerageze",
      viewAll: "Reba Byose",
      selectAll: "Hitamo Byose",
      clear: "Guhanagura",
      actions: "Ibikorwa",
      settings: "Igenamiterere",
      help: "Ubufasha",
      language: "Ururimi",
      new: "Gishya",
      open: "Fungura",
      status: "Imimerere",
      active: "Bikora",
      error: "Ikosa",
      success: "Byagenze neza",
      preview: "Irebere uko bimeze",
      optional: "Bishobora kurekerwa",
      required: "Birategetswe",
      done: "Byarangiye",
      date: "Itariki",
      name: "Izina",
      total: "Igiteranyo",
      noData: "Nta makuru aboneka",
      present: "Erekana mu ishuri",
      handout: "Impapuro z'abanyeshuri",
      share: "Sangiza abandi",
      learnMore: "Menya Byinshi"
    },
    nav: {
      dashboard: "Urupapuro Rwibanze (Dashboard)",
      lessonPlanning: "Iteganyanyigisho (Lesson Planning)",
      cbcPlans: "Amateganyanyigisho ya CBC",
      nurseryPlans: "Amateganyanyigisho y'Incuke (Nursery)",
      remedialPlans: "Imyigire Yihariye (Remedial)",
      schemesOfWork: "Imbonerahamwe y'Igihembwe (Scheme of Work)",
      worksheets: "Imyitozo n'Impapuro zo Gucapa",
      slides: "Ibyerekana mu Ishuri (Slides)",
      quizHomework: "Imikoro n'Ibizamini (Quizzes)",
      teacherRecords: "Ibitabo n'Inyandiko z'Umwarimu",
      rebBooks: "Ibitabo by'Integanyanyigisho ya REB",
      resources: "Ibikoresho by'Umwarimu",
      subscription: "Ifatabuguzi (Subscription)",
      myProfile: "Umwirondoro Wanjye",
      adminPanel: "Ubuyobozi (Admin)",
      logout: "Gusohoka (Log Out)",
      login: "Kwinjira (Sign In)",
      helpSupport: "Ubufasha n'Umuvugizi",
      aiAssistant: "Ubufasha bwa Nkorera AI"
    },
    lessonPlan: {
      schoolName: "Izina ry'Ishuri",
      teacherName: "Izina ry'Umwarimu",
      term: "Igice cy'Amashuri (Term)",
      date: "Itariki (Date)",
      subject: "Isomo (Subject)",
      classLevel: "Icyiciro cy'Abanyeshuri (Class Level)",
      grade: "Umwaka w'Amashuri",
      lessonName: "Umutwe w'Isomo (Lesson Name)",
      duration: "Igihe (Iminota)",
      classSize: "Umubare w'Abanyeshuri",
      unitNumber: "Umutwe wa (Unit Number)",
      unitTitle: "Izina ry'Umutwe (Unit Title)",
      lessonNumber: "Isomo rya (Lesson Number)",
      topic: "Ingingo Nyirizina (Topic / Focus)",
      keyCompetence: "Ubumenyi n'Ubushobozi bw'Umutwe (Competence)",
      instructionalObjective: "Instructional Objective",
      learningMaterials: "Ibikoresho by'Isomo",
      references: "Ibitabo n'Aho byakuwe (References)",
      specialNeeds: "Ubufasha ku Bafite Ubumuga bwihariye",
      location: "Aho Isomo Riberera (Inside/Outside)",
      introduction: "Intangiriro y'Isomo (Introduction)",
      development: "Imiterere y'Isomo (Lesson Development)",
      conclusion: "Umwanzuro no Gusubiramo (Conclusion)",
      teacherSelfEval: "Isuzuma n'Icyitegererezo by'Umwarimu (Self-Evaluation)",
      aiAutoFill: "Koresha AI Yuzuze",
      generateAiPlan: "Tegura Isomo na AI",
      generatingAiPlan: "AI irimo kwandika isomo...",
      editDetails: "Hindura Amakuru",
      printPdf: "Gucapa PDF",
      language: "Ururimi rw'Isomo",
      editMode: "Fungura Ubuhinduzi",
      lockPreview: "Funga / Reba uko bimeze",
      editorTab: "Aho Bahindurira",
      sheetTab: "Urupapuro Rumwe",
      previewDownload: "Reba unakuremo Iteganyanyigisho",
      finishEditPlan: "Soza no Kubika Iteganyanyigisho"
    },
    nursery: {
      schoolName: "1. Izina ry'Ishuri ry'Incuke",
      teacherName: "2. Izina ry'Umwarimu",
      classLevel: "3. Icyiciro cy'Abana b'Incuke",
      subject: "4. Isomo / Agace k'Ibikorwa",
      lessonName: "5. Umutwe w'Igikorwa cyangwa Isomo",
      term: "6. Igihembwe (Term)",
      date: "7. Itariki (Date)",
      duration: "8. Igihe (Minutin)",
      classSize: "9. Umubare w'Abana",
      competenceFocus: "10. Ubumenyi n'Ubumenyingiro Byibandwaho",
      instructionalObjective: "1. Instructional Objective",
      learningMaterials: "2. Ibikoresho by'Isomo",
      greetingCircle: "1. Umurongo w'Ikaze (Greeting Circle)",
      guidedLearning: "2. Kwiga Bifashishwemo (Guided Learning)",
      creativePlay: "3. Imikino y'Ubuhanga n'Imyitozo (Creative Play)",
      recapAndGoodbye: "4. Gusubiramo no Gusezerana (Recap & Goodbye)",
      evaluationComments: "1. Isuzuma n'Icyitegererezo by'Umwarimu",
      generateAiPlan: "Tegura Isomo na AI",
      editDetails: "Hindura Amakuru",
      printPdf: "Gucapa PDF",
      language: "Ururimi rw'Isomo",
      editMode: "Fungura Ubuhinduzi",
      lockPreview: "Funga / Reba uko bimeze",
      editorTab: "Aho Bahindurira",
      sheetTab: "Urupapuro Rumwe"
    },
    slides: {
      modalTitle: "Kora Amaslide yo Kwigisha (Presentation Slides)",
      modalSubtitle: "Tegura amaslide meza ajyanye n'integanyanyigisho yo kwigisha mu ishuri",
      modalBadge: "AI SLIDES",
      savedDecksBtn: "Ibyabitswe",
      backBtn: "Gusubira Inyuma",
      langTitle: "Ururimi rw'Ibyerekanwa mu Ishuri",
      lessonDetailsTitle: "Amakuru y'Isomo",
      lessonDetailsSub: "Uzuza amakuru ajyanye n'isomo ryawe",
      subjectLabel: "Isomo *",
      gradeLabel: "Icyiciro / Umwaka *",
      topicLabel: "Ingingo y'Isomo *",
      durationLabel: "Igihe cy'Isomo *",
      languageLabel: "Ururimi",
      countryLabel: "Igihugu",
      curriculumLabel: "Integanyanyigisho",
      additionalDetailsLabel: "Ibindi bisobanuro (Optional)",
      additionalDetailsPlaceholder: "Urugero: Sobanura neza iby'ibanze ndetse ushyiremo ibibazo byo kuganiraho...",
      pasteNotesTitle: "Ongeraho Inyandiko Zawe (Optional)",
      pasteNotesSub: "Ufite inyandiko zawe? Zishyire hano AI izikoremo amaslide meza.",
      pasteNotesPlaceholder: "Shyira hano inyandiko z'isomo ryawe...",
      pasteNotesExampleTitle: "Urugero:",
      enhancementTitle: "Amahitamo Yisumbuye",
      searchResourcesLabel: "Shakisha mu nteganyanyigisho n'ibitabo byizewe",
      searchResourcesDesc: "Gushakisha amakuru nyayo mu nteganyanyigisho n'ibitabo by'amashuri.",
      generateImagesLabel: "Kora amashusho n'ibishushanyo by'isomo",
      generateImagesDesc: "Gukora amashusho meza asobanura neza buri ngingo kuri buri slide.",
      teacherPrefTitle: "Ibyifuzo by'Umwarimu",
      teacherPrefSub: "Hitamo uburyo amaslide yawe atunganywamo",
      teacherNotesStyleLabel: "Uburyo bw'Inyandiko z'Umwarimu",
      bulletPointStyleLabel: "Uburyo bw'Utubago (Bullet Points)",
      numberOfSlidesLabel: "Umubare w'Amaslide",
      includeTimingsLabel: "Shyiraho igihe cya buri slide",
      simplifiedModeLabel: "Koresha amagambo yoroshye",
      chooseThemeTitle: "Hitamo Isura n'Amabara (Theme)",
      chooseThemeSub: "Hitamo uburyo amaslide aza agaragara mu buryo bw'amabara",
      generateBtn: "Tegura Amaslide",
      generatingBtn: "Gutunganya Amaslide...",
      presentFullscreenBtn: "Erekana mu Ishuri (Full Screen)",
      pdfBtn: "PDF",
      pptBtn: "PPT",
      handoutBtn: "Impapuro z'Abanyeshuri (Handout)",
      copyBtn: "Koporora",
      copiedBtn: "Byakoporowe!",
      newDeckBtn: "Isomo Rishya",
      slideOf: "Slide ya #{current} kuri {total}",
      teacherGuidanceTitle: "Inyandiko z'Umwarimu n'Ubuyobozi:",
      prevSlide: "Slide Ibanza",
      nextSlide: "Slide Ikurikira",
      allSlidesOverview: "Amaslide Yose Hamwe"
    },
    worksheets: {
      modalTitle: "Kora Urupapuro rw'Imyitozo (Printable Worksheet)",
      modalSubtitle: "Tegura imyitozo icapwa ifite n'ibisubizo by'umwarimu mu buryo bw'ikoranabuhanga",
      backBtn: "Gusubira Inyuma",
      langTitle: "Hitamo Ururimi / Context",
      subjectLabel: "Isomo (Subject) *",
      gradeLabel: "Umwaka / Icyiciro (Grade Level) *",
      unitLabel: "Umutwe w'Isomo (Unit Number & Title) *",
      topicLabel: "Ingingo Nyirizina (Topic / Focus) *",
      worksheetTypeLabel: "Ubwoko bw'Urupapuro rw'Imyitozo",
      difficultyLabel: "Urugero rw'Uburemere (Difficulty)",
      numQuestionsLabel: "Umubare w'Ibibazo",
      marksPerQuestionLabel: "Amanota kuri Buri Kibazo",
      languageLabel: "Ururimi",
      curriculumLabel: "Integanyanyigisho (Curriculum)",
      countryLabel: "Igihugu (Country)",
      customInstructionsLabel: "Amabwiriza Yihariye (Custom Instructions)",
      additionalDetailsLabel: "Ibisobanuro Byiyongereyeho",
      additionalDetailsPlaceholder: "Andika ibindi bintu byihariye wifuza ko byibandwaho muri iyi myitozo...",
      webSearchLabel: "Gushakisha mu Nteganyanyigisho (Web Search)",
      webSearchDesc: "Koresha ibitabo by'integanyanyigisho mu gutegura ibibazo bikwiye",
      includeAnswerKeyLabel: "Shyiramo n'Ibisubizo by'Umwarimu (Answer Key)",
      includeAnswerKeyDesc: "Kora urupapuro rw'ibisubizo birambuye bisobanuye neza",
      generateBtn: "Tegura Urupapuro rw'Imyitozo",
      generatingBtn: "Gutunganya Urupapuro rw'Imyitozo...",
      cancelBtn: "Kureka",
      editParamsBtn: "Hindura Ibisabwa",
      copyBtn: "Koporora",
      copiedBtn: "Byakoporowe!",
      printBtn: "Gucapa (Print)",
      exportWordBtn: "Gukuramo Word (.doc)",
      studentNameLabel: "Izina ry'Umunyeshuri:",
      dateLabel: "Itariki:",
      totalQuestionsLabel: "Igiteranyo cy'Ibibazo:",
      totalMarksLabel: "Igiteranyo cy'Amanota:",
      instructionsLabel: "Amabwiriza:",
      answerKeyTitle: "Ibisubizo by'Umwarimu n'Ibisobanuro (Answer Key)",
      answerKeySub: "Ibisubizo byizewe n'uko byakosorwa"
    },
    auth: {
      signIn: "Injira",
      signUp: "Fungura Konti Nshya",
      email: "Imeri (Email Address)",
      password: "Ijambobanga (Password)",
      fullName: "Amazina Yose",
      phone: "Nimero ya Terefone",
      country: "Igihugu",
      welcomeBack: "Murakaza neza kuri Nkorera!",
      logoutSuccess: "Mwasohotse neza muri gahunda.",
      requireLogin: "Mubanze mwinjire kugira ngo mukoreshe iki gikoresho."
    },
    subscription: {
      title: "Amafatabuguzi (Subscription Plans)",
      activePlan: "Gahunda Ukoresha",
      upgrade: "Gura Ifatabuguzi",
      creditsRemaining: "Hasigaye {count} zo gutegura",
      unlimitedAccess: "Gahunda y'Amateganyanyigisho Adashira ku Barimu"
    }
  },

  Français: {
    common: {
      save: "Enregistrer",
      saving: "Enregistrement...",
      saved: "Enregistré",
      cancel: "Annuler",
      delete: "Supprimer",
      edit: "Modifier",
      create: "Créer",
      back: "Retour",
      next: "Suivant",
      previous: "Précédent",
      copy: "Copier",
      copied: "Copié !",
      download: "Télécharger",
      print: "Imprimer",
      export: "Exporter",
      exportWord: "Exporter Word (.doc)",
      exportPdf: "Exporter PDF",
      close: "Fermer",
      confirm: "Confirmer",
      search: "Rechercher",
      loading: "Chargement...",
      filter: "Filtrer",
      refresh: "Actualiser",
      retry: "Réessayer",
      viewAll: "Voir Tout",
      selectAll: "Tout Sélectionner",
      clear: "Effacer",
      actions: "Actions",
      settings: "Paramètres",
      help: "Aide",
      language: "Langue",
      new: "Nouveau",
      open: "Ouvrir",
      status: "Statut",
      active: "Actif",
      error: "Erreur",
      success: "Succès",
      preview: "Aperçu",
      optional: "Optionnel",
      required: "Requis",
      done: "Terminé",
      date: "Date",
      name: "Nom",
      total: "Total",
      noData: "Aucune donnée disponible",
      present: "Présenter",
      handout: "Feuille élève",
      share: "Partager",
      learnMore: "En savoir plus"
    },
    nav: {
      dashboard: "Tableau de Bord",
      lessonPlanning: "Planification des Cours",
      cbcPlans: "Fiches Pédagogiques CBC",
      nurseryPlans: "Plans de Maternelle",
      remedialPlans: "Plans de Remédiation",
      schemesOfWork: "Répartitions Annuelles / Trimestrielles",
      worksheets: "Fiches d'Exercices",
      slides: "Présentations & Diapositives",
      quizHomework: "Devoirs & Évaluations",
      teacherRecords: "Cahiers & Registres de l'Enseignant",
      rebBooks: "Manuels Scolaires REB",
      resources: "Ressources Pédagogiques",
      subscription: "Abonnements",
      myProfile: "Mon Profil",
      adminPanel: "Administration",
      logout: "Se Déconnecter",
      login: "Se Connecter",
      helpSupport: "Aide & Support",
      aiAssistant: "Assistant IA Nkorera"
    },
    lessonPlan: {
      schoolName: "Nom de l'école",
      teacherName: "Nom de l'enseignant",
      term: "Trimestre",
      date: "Date",
      subject: "Matière",
      classLevel: "Niveau de classe",
      grade: "Niveau scolaire",
      lessonName: "Nom de la leçon",
      duration: "Durée (min)",
      classSize: "Effectif de la classe",
      unitNumber: "Numéro d'unité",
      unitTitle: "Titre de l'unité",
      lessonNumber: "Numéro de leçon",
      topic: "Thème / Sujet",
      keyCompetence: "Compétence clé de l'unité",
      instructionalObjective: "Objectif pédagogique",
      learningMaterials: "Matériel didactique",
      references: "Références et manuels",
      specialNeeds: "Besoins éducatifs particuliers",
      location: "Lieu du cours",
      introduction: "Introduction / Accueil",
      development: "Développement / Démarche guidée",
      conclusion: "Conclusion et synthèse",
      teacherSelfEval: "Auto-évaluation de l'enseignant",
      aiAutoFill: "Remplissage IA",
      generateAiPlan: "Générer la Fiche avec l'IA",
      generatingAiPlan: "Génération de la fiche en cours...",
      editDetails: "Modifier les détails",
      printPdf: "Imprimer le PDF",
      language: "Langue de la leçon",
      editMode: "Activer le mode édition",
      lockPreview: "Verrouiller / Aperçu",
      editorTab: "Onglet Éditeur",
      sheetTab: "Feuille 1-Page",
      previewDownload: "Aperçu & Téléchargement",
      finishEditPlan: "Terminer & Enregistrer"
    },
    nursery: {
      schoolName: "1. Nom de l'école maternelle",
      teacherName: "2. Nom de l'enseignant",
      classLevel: "3. Niveau de classe (Maternelle)",
      subject: "4. Matière / Domaine d'activité",
      lessonName: "5. Nom de l'activité ou de la leçon",
      term: "6. Trimestre",
      date: "7. Date",
      duration: "8. Durée (min)",
      classSize: "9. Nombre d'enfants",
      competenceFocus: "10. Focus de compétence",
      instructionalObjective: "1. Objectif pédagogique",
      learningMaterials: "2. Matériel d'apprentissage",
      greetingCircle: "1. Cercle d'accueil",
      guidedLearning: "2. Apprentissage guidé",
      creativePlay: "3. Jeu créatif et pratique",
      recapAndGoodbye: "4. Récapitulatif et au revoir",
      evaluationComments: "1. Observations et auto-évaluation",
      generateAiPlan: "Générer le plan IA",
      editDetails: "Modifier les détails",
      printPdf: "Imprimer le PDF",
      language: "Langue de la leçon",
      editMode: "Activer le mode édition",
      lockPreview: "Verrouiller / Aperçu",
      editorTab: "Onglet Éditeur",
      sheetTab: "Feuille 1-Page"
    },
    slides: {
      modalTitle: "Créer une Présentation de Cours (Diapositives)",
      modalSubtitle: "Générez des diapositives attrayantes et alignées sur le programme pour vos cours",
      modalBadge: "DIAPOSITIVES IA",
      savedDecksBtn: "Présentations enregistrées",
      backBtn: "Retour",
      langTitle: "Contexte Linguistique de la Présentation",
      lessonDetailsTitle: "Détails de la Leçon",
      lessonDetailsSub: "Complétez les informations relatives à votre leçon",
      subjectLabel: "Matière *",
      gradeLabel: "Classe / Niveau *",
      topicLabel: "Sujet de la Leçon *",
      durationLabel: "Durée du cours *",
      languageLabel: "Langue",
      countryLabel: "Pays",
      curriculumLabel: "Programme Scolaire",
      additionalDetailsLabel: "Détails Supplémentaires (Optionnel)",
      additionalDetailsPlaceholder: "Ex: Introduire le concept clé et inclure des questions de discussion en groupe...",
      pasteNotesTitle: "Coller vos Notes (Optionnel)",
      pasteNotesSub: "Vous avez vos propres notes ? Collez-les ici pour les structurer en diapositives.",
      pasteNotesPlaceholder: "Collez vos notes de cours ici...",
      pasteNotesExampleTitle: "Exemple :",
      enhancementTitle: "Options d'Enrichissement",
      searchResourcesLabel: "Rechercher dans les ressources officielles",
      searchResourcesDesc: "Recherche automatique dans les manuels et programmes officiels de référence.",
      generateImagesLabel: "Générer des illustrations pour chaque diapositive",
      generateImagesDesc: "Création automatique de schémas et diagrammes pédagogiques adaptés.",
      teacherPrefTitle: "Préférences de l'Enseignant",
      teacherPrefSub: "Personnalisez la génération de vos diapositives",
      teacherNotesStyleLabel: "Style des Notes de l'Enseignant",
      bulletPointStyleLabel: "Style des Puces",
      numberOfSlidesLabel: "Nombre de Diapositives",
      includeTimingsLabel: "Inclure les minutages par diapositive",
      simplifiedModeLabel: "Mode simplifié (vocabulaire accessible)",
      chooseThemeTitle: "Choisir un Thème Visuel",
      chooseThemeSub: "Sélectionnez une palette visuelle pour votre présentation",
      generateBtn: "Créer la Présentation",
      generatingBtn: "Création en cours...",
      presentFullscreenBtn: "Présenter (Plein Écran)",
      pdfBtn: "PDF",
      pptBtn: "PPT",
      handoutBtn: "Fiche Élève PDF (Handout)",
      copyBtn: "Copier",
      copiedBtn: "Copié !",
      newDeckBtn: "Nouvelle Présentation",
      slideOf: "Diapositive #{current} sur {total}",
      teacherGuidanceTitle: "Conseils Enseignant & Notes d'Intervention :",
      prevSlide: "Diapositive Précédente",
      nextSlide: "Diapositive Suivante",
      allSlidesOverview: "Aperçu Global des Diapositives"
    },
    worksheets: {
      modalTitle: "Créer une Fiche d'Exercices Imprimable",
      modalSubtitle: "Générez des fiches d'exercices prêtes à imprimer avec corrigé détaillé",
      backBtn: "Retour aux Fiches",
      langTitle: "Contexte Linguistique / Langue",
      subjectLabel: "Matière *",
      gradeLabel: "Niveau / Classe *",
      unitLabel: "Unité (Numéro & Titre) *",
      topicLabel: "Sujet / Thème de la Leçon *",
      worksheetTypeLabel: "Type de Fiche",
      difficultyLabel: "Niveau de Difficulté",
      numQuestionsLabel: "Nombre de Questions",
      marksPerQuestionLabel: "Points par Question",
      languageLabel: "Langue",
      curriculumLabel: "Programme Scolaire",
      countryLabel: "Pays",
      customInstructionsLabel: "Instructions Personnalisées",
      additionalDetailsLabel: "Détails Supplémentaires",
      additionalDetailsPlaceholder: "Objectifs spécifiques ou compétences clés à évaluer...",
      webSearchLabel: "Recherche Pédagogique",
      webSearchDesc: "Utiliser les manuels et programmes officiels de référence",
      includeAnswerKeyLabel: "Inclure le Corrigé Enseignant",
      includeAnswerKeyDesc: "Générer le corrigé complet avec démarches détaillées",
      generateBtn: "Générer la Fiche d'Exercices",
      generatingBtn: "Génération en cours...",
      cancelBtn: "Annuler",
      editParamsBtn: "Modifier les Paramètres",
      copyBtn: "Copier",
      copiedBtn: "Copié !",
      printBtn: "Imprimer",
      exportWordBtn: "Exporter en Word (.doc)",
      studentNameLabel: "Nom de l'Élève :",
      dateLabel: "Date :",
      totalQuestionsLabel: "Nombre Total de Questions :",
      totalMarksLabel: "Total des Points :",
      instructionsLabel: "Consignes :",
      answerKeyTitle: "Guide de Correction et Réponses de l'Enseignant",
      answerKeySub: "Solutions complètes et barème de notation"
    },
    auth: {
      signIn: "Se Connecter",
      signUp: "Créer un Compte",
      email: "Adresse Email",
      password: "Mot de Passe",
      fullName: "Nom Complet",
      phone: "Numéro de Téléphone",
      country: "Pays",
      welcomeBack: "Bienvenue sur Nkorera !",
      logoutSuccess: "Déconnexion réussie.",
      requireLogin: "Veuillez vous connecter pour accéder à cette fonctionnalité."
    },
    subscription: {
      title: "Forfaits d'Abonnement",
      activePlan: "Formule Actuelle",
      upgrade: "Passer à la Formule Premium",
      creditsRemaining: "{count} crédits restants",
      unlimitedAccess: "Accès Illimité pour les Enseignants"
    }
  },

  Kiswahili: {
    common: {
      save: "Hifadhi",
      saving: "Inahifadhi...",
      saved: "Imehifadhiwa",
      cancel: "Ghairi",
      delete: "Futa",
      edit: "Hariri",
      create: "Unda",
      back: "Rudi Nyuma",
      next: "Inayofuata",
      previous: "Iliyotangulia",
      copy: "Nakili",
      copied: "Imenakiliwa!",
      download: "Pakua",
      print: "Chapisha (Print)",
      export: "Hamisha",
      exportWord: "Pakua Word (.doc)",
      exportPdf: "Pakua PDF",
      close: "Funga",
      confirm: "Thibitisha",
      search: "Tafuta",
      loading: "Inapakia...",
      filter: "Chuja",
      refresh: "Onyesha Upya",
      retry: "Jaribu Tena",
      viewAll: "Tazama Yote",
      selectAll: "Chagua Yote",
      clear: "Futa Yote",
      actions: "Vitendo",
      settings: "Mipangilio",
      help: "Msaada",
      language: "Lugha",
      new: "Mpya",
      open: "Fungua",
      status: "Hali",
      active: "Inatumika",
      error: "Hitilafu",
      success: "Imefaulu",
      preview: "Hakiki",
      optional: "Hiari",
      required: "Inahitajika",
      done: "Imekamilika",
      date: "Tarehe",
      name: "Jina",
      total: "Jumla",
      noData: "Hakuna taarifa zilizopo",
      present: "Wasilisha Darasani",
      handout: "Karatasi ya Mwanafunzi",
      share: "Shiriki",
      learnMore: "Jifunze Zaidi"
    },
    nav: {
      dashboard: "Dashibodi Kuu",
      lessonPlanning: "Maandalizi ya Masomo",
      cbcPlans: "Mipango ya Somo ya CBC",
      nurseryPlans: "Mipango ya Somo ya Chekechea",
      remedialPlans: "Mipango ya Masomo ya Ziada",
      schemesOfWork: "Ratiba ya Muhula (Scheme of Work)",
      worksheets: "Mazoezi ya Karatasi",
      slides: "Mawasilisho ya Darasani (Slides)",
      quizHomework: "Kazi za Nyumbani na Majaribio",
      teacherRecords: "Kumbukumbu na Vitabu vya Mwalimu",
      rebBooks: "Vitabu vya Mtaala wa REB",
      resources: "Nyenzo za Kufundishia",
      subscription: "Vifurushi vya Kujiunga",
      myProfile: "Wasifu Wangu",
      adminPanel: "Utawala (Admin)",
      logout: "Ondoka (Log Out)",
      login: "Ingia (Sign In)",
      helpSupport: "Msaada na Huduma kwa Wateja",
      aiAssistant: "Msaidizi wa Nkorera AI"
    },
    lessonPlan: {
      schoolName: "Jina la Shule",
      teacherName: "Jina la Mwalimu",
      term: "Muhula",
      date: "Tarehe",
      subject: "Somo",
      classLevel: "Kiwango cha Darasa",
      grade: "Darasa",
      lessonName: "Jina la Somo",
      duration: "Muda (Dakika)",
      classSize: "Ukubwa wa Darasa",
      unitNumber: "Namba ya Mada Kuu",
      unitTitle: "Kichwa cha Mada Kuu",
      lessonNumber: "Namba ya Somo",
      topic: "Mada Ndogo / Lengo Kuu",
      keyCompetence: "Ujuzi Mkuu Unaotarajiwa",
      instructionalObjective: "Lengo Kuu la Kufundishia",
      learningMaterials: "Vifaa vya Kufundishia",
      references: "Vitabu na Marejeleo",
      specialNeeds: "Mahitaji Maalum ya Kielimu",
      location: "Mahali pa Kufundishia",
      introduction: "Utangulizi na Salamu",
      development: "Uwasilishaji wa Somo",
      conclusion: "Hitimisho na Majumuisho",
      teacherSelfEval: "Tathmini Binafsi ya Mwalimu",
      aiAutoFill: "Jaza na AI",
      generateAiPlan: "Tengeneza Mpango na AI",
      generatingAiPlan: "AI inaandika mpango wa somo...",
      editDetails: "Hariri Maelezo",
      printPdf: "Chapisha PDF",
      language: "Lugha ya Somo",
      editMode: "Wezesha Uhariri",
      lockPreview: "Funga / Hakiki",
      editorTab: "Kichupo cha Mhariri",
      sheetTab: "Karatasi Moja",
      previewDownload: "Hakiki & Pakua Mpango",
      finishEditPlan: "Kamilisha na Hifadhi"
    },
    nursery: {
      schoolName: "1. Jina la Shule ya Chekechea",
      teacherName: "2. Jina la Mwalimu",
      classLevel: "3. Ngazi ya Darasa (Chekechea)",
      subject: "4. Somo / Eneo la Shughuli",
      lessonName: "5. Jina la Somo au Shughuli",
      term: "6. Muhula",
      date: "7. Tarehe",
      duration: "8. Muda (Dakika)",
      classSize: "9. Idadi ya Watoto",
      competenceFocus: "10. Ujuzi Unaolengwa",
      instructionalObjective: "1. Lengo la Somo",
      learningMaterials: "2. Vifaa vya Kujifunzia",
      greetingCircle: "1. Duara la Salamu",
      guidedLearning: "2. Kujifunza kwa Kuongozwa",
      creativePlay: "3. Michezo ya Ubunifu na Mazoezi",
      recapAndGoodbye: "4. Muhtasari na Kuagana",
      evaluationComments: "1. Tathmini ya Mwalimu na Maoni",
      generateAiPlan: "Tengeneza Mpango na AI",
      editDetails: "Hariri Maelezo",
      printPdf: "Chapisha PDF",
      language: "Lugha ya Somo",
      editMode: "Wezesha Uhariri",
      lockPreview: "Funga / Hakiki",
      editorTab: "Kichupo cha Mhariri",
      sheetTab: "Karatasi Moja"
    },
    slides: {
      modalTitle: "Tengeneza Slaidi za Kufundishia (Presentation Slides)",
      modalSubtitle: "Unda slaidi nzuri zenye kufuata mtaala, tayari kuonyesha darasani",
      modalBadge: "SLAIDI ZA AI",
      savedDecksBtn: "Slaidi Zilizohifadhiwa",
      backBtn: "Rudi Nyuma",
      langTitle: "Muktadha wa Lugha ya Slaidi",
      lessonDetailsTitle: "Taarifa za Somo",
      lessonDetailsSub: "Jaza taarifa kuhusu somo lako",
      subjectLabel: "Somo *",
      gradeLabel: "Darasa *",
      topicLabel: "Mada ya Somo *",
      durationLabel: "Muda wa Somo *",
      languageLabel: "Lugha",
      countryLabel: "Nchi",
      curriculumLabel: "Mtaala",
      additionalDetailsLabel: "Maelezo ya Ziada (Hiari)",
      additionalDetailsPlaceholder: "Mfano: Weka msisitizo kwenye dhana kuu na maswali ya majadiliano...",
      pasteNotesTitle: "Weka Notisi Zako (Hiari)",
      pasteNotesSub: "Je, una notisi zako? Ziweke hapa ili tuzibadilishe ziwe slaidi nzuri.",
      pasteNotesPlaceholder: "Weka notisi zako hapa...",
      pasteNotesExampleTitle: "Mfano:",
      enhancementTitle: "Machaguo ya Ziada",
      searchResourcesLabel: "Tafuta kwenye nyenzo rasmi za mtaala",
      searchResourcesDesc: "Inatafuta maudhui halisi kutoka kwenye vitabu rasmi na mitaala.",
      generateImagesLabel: "Tengeneza picha na michoro kwa kila slaidi",
      generateImagesDesc: "Inatengeneza michoro na vielelezo vinavyofaa kwa kila slaidi.",
      teacherPrefTitle: "Mapendeleo ya Mwalimu",
      teacherPrefSub: "Binafsisha jinsi slaidi zako zinavyotengenezwa",
      teacherNotesStyleLabel: "Aina ya Notisi za Mwalimu",
      bulletPointStyleLabel: "Mtindo wa Alama za Vipelelezo",
      numberOfSlidesLabel: "Idadi ya Slaidi",
      includeTimingsLabel: "Weka muda wa kila slaidi",
      simplifiedModeLabel: "Mfumo rahisi (lugha isiyo ngumu)",
      chooseThemeTitle: "Chagua Muonekano (Theme)",
      chooseThemeSub: "Chagua mtindo wa rangi na muundo unaopendelea",
      generateBtn: "Tengeneza Slaidi za Somo",
      generatingBtn: "Inatengeneza Slaidi...",
      presentFullscreenBtn: "Onyesha Darasani (Full Screen)",
      pdfBtn: "PDF",
      pptBtn: "PPT",
      handoutBtn: "Karatasi ya Mwanafunzi (Handout)",
      copyBtn: "Nakili",
      copiedBtn: "Imenakiliwa!",
      newDeckBtn: "Somo Jipya",
      slideOf: "Slaidi ya #{current} kati ya {total}",
      teacherGuidanceTitle: "Mwongozo wa Mwalimu na Vidokezo:",
      prevSlide: "Slaidi Iliyopita",
      nextSlide: "Slaidi Inayofuata",
      allSlidesOverview: "Muhtasari wa Slaidi Zote"
    },
    worksheets: {
      modalTitle: "Tengeneza Karatasi ya Mazoezi ya Kuchapishwa",
      modalSubtitle: "Unda mazoezi ya darasani yenye majibu ya mwalimu kiotomatiki",
      backBtn: "Rudi Kwenye Mazoezi",
      langTitle: "Lugha ya Muktadha / Lugha",
      subjectLabel: "Somo *",
      gradeLabel: "Darasa / Ngazi *",
      unitLabel: "Mada Kuu (Unit Number & Title) *",
      topicLabel: "Mada Ndogo / Lengo la Somo *",
      worksheetTypeLabel: "Aina ya Karatasi ya Mazoezi",
      difficultyLabel: "Kiwango cha Ugumu",
      numQuestionsLabel: "Idadi ya Maswali",
      marksPerQuestionLabel: "Alama kwa Kila Swali",
      languageLabel: "Lugha",
      curriculumLabel: "Mtaala (Curriculum)",
      countryLabel: "Nchi",
      customInstructionsLabel: "Maagizo Maalum",
      additionalDetailsLabel: "Maelezo ya Ziada",
      additionalDetailsPlaceholder: "Weka malengo au muktadha wowote unaotaka kusisitiza...",
      webSearchLabel: "Utafutaji wa Mtandaoni",
      webSearchDesc: "Tumia nyenzo za mtaala kutoa maswali sahihi",
      includeAnswerKeyLabel: "Weka Majibu ya Mwalimu (Answer Key)",
      includeAnswerKeyDesc: "Tengeneza mwongozo wa masahihisho wenye maelezo ya kina",
      generateBtn: "Tengeneza Karatasi ya Mazoezi",
      generatingBtn: "Inatengeneza Karatasi...",
      cancelBtn: "Ghairi",
      editParamsBtn: "Badilisha Vigezo",
      copyBtn: "Nakili",
      copiedBtn: "Imenakiliwa!",
      printBtn: "Chapa (Print)",
      exportWordBtn: "Pakua Word (.doc)",
      studentNameLabel: "Jina la Mwanafunzi:",
      dateLabel: "Tarehe:",
      totalQuestionsLabel: "Jumla ya Maswali:",
      totalMarksLabel: "Jumla ya Alama:",
      instructionsLabel: "Maagizo:",
      answerKeyTitle: "Mwongozo Rasmi wa Majibu ya Mwalimu",
      answerKeySub: "Majibu sahihi na vidokezo vya usahihishaji"
    },
    auth: {
      signIn: "Ingia",
      signUp: "Fungua Akaunti",
      email: "Barua Pepe",
      password: "Nenosiri",
      fullName: "Jina Kamili",
      phone: "Namba ya Simu",
      country: "Nchi",
      welcomeBack: "Karibu tena Nkorera!",
      logoutSuccess: "Umeondoka kikamilifu.",
      requireLogin: "Tafadhali ingia ili uweze kutumia kipengele hiki."
    },
    subscription: {
      title: "Vifurushi vya Kujiunga",
      activePlan: "Kifurushi Kilicho Hai",
      upgrade: "Boresha hadi Premium",
      creditsRemaining: "Salio: {count} zilizobaki",
      unlimitedAccess: "Upatikanaji Usio na Kikomo kwa Walimu Wote"
    }
  }
};

/**
 * Backward compatibility object for legacy imports (e.g. NurseryLessonPlanModal).
 */
export const UI_LABELS: Record<string, Record<string, string>> = {
  English: TRANSLATIONS_DICTIONARY.English.nursery,
  Kinyarwanda: TRANSLATIONS_DICTIONARY.Kinyarwanda.nursery,
  French: TRANSLATIONS_DICTIONARY.Français.nursery,
  Français: TRANSLATIONS_DICTIONARY.Français.nursery,
  Kiswahili: TRANSLATIONS_DICTIONARY.Kiswahili.nursery,
};

/**
 * Legacy helper for direct UI labels lookup.
 */
export function getUIText(lang: string) {
  const norm = normalizeLanguage(lang);
  return UI_LABELS[norm] || UI_LABELS['English'];
}

/**
 * Deep key lookup function in the translations dictionary.
 */
function getValueByPath(obj: any, path: string): string | undefined {
  if (!obj) return undefined;
  if (typeof obj[path] === 'string') return obj[path];
  
  const segments = path.split('.');
  let current = obj;
  for (const seg of segments) {
    if (current && typeof current === 'object' && seg in current) {
      current = current[seg];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Formats a string template with parameters: replaces `{paramKey}` with value.
 */
export function formatString(template: string, params?: Record<string, string | number>): string {
  if (!params || !template) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return key in params ? String(params[key]) : match;
  });
}

/**
 * Central translation utility function.
 * Can be called anywhere dynamically with or without explicit language context.
 *
 * @param key - The dot-notation key (e.g., 'common.save', 'lessonPlan.schoolName', 'slides.slideOf')
 * @param lang - Target language or code (defaults to current app language)
 * @param params - Optional parameter replacements for templates (e.g. { current: 1, total: 10 })
 * @param fallback - Optional fallback text if key is not found
 */
export function translate(
  key: string,
  lang?: AppLanguage | string,
  params?: Record<string, string | number>,
  fallback?: string
): string {
  const targetLang = normalizeLanguage(lang || getAppLanguage());
  
  // 1. Check target language dictionary
  let text = getValueByPath(TRANSLATIONS_DICTIONARY[targetLang], key);

  // 2. Also check flat keys in root common or lessonPlan if not in dot notation
  if (!text) {
    text = TRANSLATIONS_DICTIONARY[targetLang]?.common?.[key] ||
           TRANSLATIONS_DICTIONARY[targetLang]?.lessonPlan?.[key] ||
           TRANSLATIONS_DICTIONARY[targetLang]?.slides?.[key] ||
           TRANSLATIONS_DICTIONARY[targetLang]?.worksheets?.[key];
  }

  // 3. Fallback to English if missing in target language
  if (!text && targetLang !== 'English') {
    text = getValueByPath(TRANSLATIONS_DICTIONARY.English, key) ||
           TRANSLATIONS_DICTIONARY.English?.common?.[key] ||
           TRANSLATIONS_DICTIONARY.English?.lessonPlan?.[key] ||
           TRANSLATIONS_DICTIONARY.English?.slides?.[key] ||
           TRANSLATIONS_DICTIONARY.English?.worksheets?.[key];
  }

  // 4. Fallback to specified fallback string or humanized key
  if (!text) {
    if (fallback !== undefined) return formatString(fallback, params);
    const lastPart = key.split('.').pop() || key;
    return formatString(lastPart.replace(/([A-Z])/g, ' $1').trim(), params);
  }

  return formatString(text, params);
}

/**
 * Shorthand alias for `translate`
 */
export const t = translate;

/**
 * React hook for consuming translations and dynamic language context inside any component.
 * Automatically synchronizes when app language changes globally.
 */
export function useTranslation(overrideLang?: AppLanguage | string) {
  const [currentLang, setCurrentLangState] = useState<AppLanguage>(() => {
    return overrideLang ? normalizeLanguage(overrideLang) : getAppLanguage();
  });

  useEffect(() => {
    if (overrideLang) {
      setCurrentLangState(normalizeLanguage(overrideLang));
      return;
    }

    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ language: AppLanguage }>;
      if (customEvent.detail?.language) {
        setCurrentLangState(customEvent.detail.language);
      } else {
        setCurrentLangState(getAppLanguage());
      }
    };

    window.addEventListener(LANGUAGE_EVENT, handleLangChange);
    return () => window.removeEventListener(LANGUAGE_EVENT, handleLangChange);
  }, [overrideLang]);

  const changeLanguage = useCallback((newLang: AppLanguage | string) => {
    const normalized = normalizeLanguage(newLang);
    setCurrentLangState(normalized);
    setAppLanguage(normalized);
  }, []);

  const translateFn = useCallback(
    (key: string, params?: Record<string, string | number>, lang?: string) => {
      return translate(key, lang || currentLang, params);
    },
    [currentLang]
  );

  const langInfo = SUPPORTED_LANGUAGES.find((item) => item.key === currentLang) || SUPPORTED_LANGUAGES[0];

  return {
    t: translateFn,
    translate: translateFn,
    language: currentLang,
    setLanguage: changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    langInfo,
    isRTL: false
  };
}

export default translate;
