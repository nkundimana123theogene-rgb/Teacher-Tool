import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Play, 
  Pause, 
  Video, 
  Sparkles, 
  Copy, 
  Check, 
  Clock, 
  BookOpen, 
  Volume2,
  VolumeX,
  Cast,
  Subtitles,
  Settings
} from 'lucide-react';

interface AiVideoTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPromptsStudio?: () => void;
}

export const AiVideoTutorialModal: React.FC<AiVideoTutorialModalProps> = ({
  isOpen,
  onClose,
  onOpenPromptsStudio
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'video' | 'chapters' | 'prompts' | 'summary'>('video');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(1); // 00:01 start
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1.0); // 100% max volume
  const totalDuration = 1500; // 25:00 exact minutes

  // Audio Context & Speech Synthesis references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // English Video Transcript Narration Script (Comprehensive 25-Minute Full Website Guide)
  const audioNarrationScript = [
    {
      timeSec: 1,
      text: "Welcome to Nkorera Education Portal! This is a comprehensive 25-minute video tutorial explaining the entire platform and how teachers can use Artificial Intelligence to prepare all their teaching materials. On Nkorera Education, you can generate termly Schemes of Work, CBC Lesson Plans, Quizzes, and Early Childhood learning materials in just one minute. Designed by MITECH RWANDA experts to empower teachers and elevate educational quality. Let us explore every module step by step.",
      gesture: "👋",
      gestureTitle: "1. Welcome & Platform Overview",
      actionState: "WAVING_HANDS",
      uiMockup: "WELCOME_CARD"
    },
    {
      timeSec: 120,
      text: "Chapter 2: Dashboard and Lesson Repository. On the Dashboard, you can track all your prepared lesson statistics, downloaded documents in PDF and Word formats, and active subscription plans. Furthermore, you can review the complete REB Competency Based Curriculum (CBC) competencies in both English and Kinyarwanda to align your teaching materials precisely.",
      gesture: "📊",
      gestureTitle: "2. Dashboard & Lesson Repository",
      actionState: "POINTING_RIGHT",
      uiMockup: "DASHBOARD_PREVIEW"
    },
    {
      timeSec: 270,
      text: "Chapter 3: Scheme of Work AI Generator. This feature allows you to prepare a full termly Scheme of Work aligned with the REB CBC syllabus. Select your grade level, subject, term, and desired units. Artificial Intelligence instantly constructs a comprehensive timetable including Learning Objectives, Key Competencies, Teaching Aids, Assessment Methods, and Evaluation Strategies.",
      gesture: "⌨️",
      gestureTitle: "3. Scheme of Work AI Generator (REB Syllabus)",
      actionState: "TYPING_LAPTOP",
      uiMockup: "SCHEME_GENERATOR"
    },
    {
      timeSec: 435,
      text: "Chapter 4: Lesson Plan AI Generator. Create a detailed 40-minute or 80-minute CBC Lesson Plan in just one minute. Artificial Intelligence embeds SMART Objectives, Bloom's Taxonomy verbs, Differentiated Group Activities, and Assessment Rubrics certified by REB. All documents are formatted professionally in English for instant downloading and printing.",
      gesture: "📝",
      gestureTitle: "4. Lesson Plan AI Generator (CBC Matrix)",
      actionState: "EXPLAINING_PLAN",
      uiMockup: "LESSON_PLAN_MATRIX"
    },
    {
      timeSec: 600,
      text: "Chapter 5: Nursery & Primary Early Childhood Modules. A specialized feature for nursery and primary teachers featuring visual aids, counting tools, math bundles, and interactive play-based learning games. AI generates age-appropriate illustrations and educational games for early childhood learners.",
      gesture: "🎨",
      gestureTitle: "5. Nursery & Primary Early Childhood Modules",
      actionState: "PLAYFUL_GESTURE",
      uiMockup: "NURSERY_CARDS"
    },
    {
      timeSec: 780,
      text: "Chapter 6: Assessment & Quiz Generator with Marking Schemes. Easily generate Formative and Summative Assessments, Quizzes, Multiple Choice Questions, Essay Questions, and a complete Marking Guide with detailed scoring rubrics to guide teachers efficiently.",
      gesture: "🎯",
      gestureTitle: "6. Assessment & Quiz Generator (Marking Schemes)",
      actionState: "HOLDING_QUIZ",
      uiMockup: "QUIZ_MARKING_GUIDE"
    },
    {
      timeSec: 945,
      text: "Chapter 7: Remedial & Differentiated Support Plan. Support every learner in your classroom. Artificial Intelligence generates targeted Remedial activities for struggling students, alongside Extended tasks to challenge advanced learners and boost overall class performance.",
      gesture: "🤝",
      gestureTitle: "7. Remedial & Differentiated Support Plan",
      actionState: "GUIDING_REMEDIAL",
      uiMockup: "REMEDIAL_PLAN"
    },
    {
      timeSec: 1110,
      text: "Chapter 8: Lesson Plan Prompts Studio. Access a curated library of high-quality AI prompts crafted by REB pedagogy experts. Copy any prompt, customize it with your specific grade and subject details, or create your custom prompts for flawless AI outputs.",
      gesture: "💡",
      gestureTitle: "8. Lesson Plan Prompts Studio",
      actionState: "PROMPT_WORKSHOP",
      uiMockup: "PROMPTS_STUDIO_CARD"
    },
    {
      timeSec: 1260,
      text: "Chapter 9: Subscription Plans & MoMo Integration. Explore 6 affordable subscription plans on Nkorera Education: from Free Plan, Day Pass, Term Pass, up to School Unlimited Pass. Instant local payments are supported via MTN Mobile Money and Airtel Money.",
      gesture: "💳",
      gestureTitle: "9. Subscription Plans & MoMo Integration",
      actionState: "SHOWING_SUBSCRIPTION",
      uiMockup: "MOMO_SUBSCRIPTION"
    },
    {
      timeSec: 1410,
      text: "Chapter 10: DOCX and PDF Exporting with Support Center. Download all your generated documents in PDF or editable Word format ready for immediate classroom printing. Access 24/7 instant customer support via WhatsApp and Nkorera Education Call Center.",
      gesture: "🖨️",
      gestureTitle: "10. DOCX/PDF Exporting & Support Center",
      actionState: "EXPORTING_PRINTING",
      uiMockup: "PRINT_DOCX_CARD"
    }
  ];

  // Helper to play an audible chime/beep via Web Audio API (Guarantees loud sound output on all devices)
  const playWebAudioChime = () => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (!audioCtxRef.current) return;

      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // Play pleasant tutorial chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.3); // G5

      gain.gain.setValueAtTime(volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {
      console.warn('Web Audio API chime error:', e);
    }
  };

  // High Volume Voice Speech Narration Engine with Continuous Loop
  const speakTextLoudly = (text: string) => {
    if (!('speechSynthesis' in window) || isMuted) return;

    window.speechSynthesis.cancel(); // Clear previous queue

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = volume; // 1.0 Max Volume
    utterance.rate = 0.92; // Clear, comfortable speaking rate
    utterance.pitch = 1.0;

    // Pick best voice
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith('rw') || v.lang.startsWith('sw') || v.lang.startsWith('en')) || voices[0];
    if (voice) utterance.voice = voice;

    // Continuous loop listener: if text finishes speaking while video is still playing in this chapter, repeat naturally
    utterance.onend = () => {
      if (speechUtteranceRef.current === utterance && !isMuted) {
        // Small delay then repeat speech for full chapter duration coverage
        setTimeout(() => {
          if (speechUtteranceRef.current === utterance && !isMuted) {
            window.speechSynthesis.speak(utterance);
          }
        }, 800);
      }
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const getCurrentChunk = () => {
    return [...audioNarrationScript].reverse().find(s => currentTime >= s.timeSec) || audioNarrationScript[0];
  };

  const getCurrentScriptText = () => {
    return getCurrentChunk().text;
  };

  const lastSpokenTimeRef = useRef<number | null>(null);

  // Synchronize play timer & speech
  useEffect(() => {
    if (isPlaying) {
      const currentChunk = getCurrentChunk();
      if (lastSpokenTimeRef.current !== currentChunk.timeSec) {
        lastSpokenTimeRef.current = currentChunk.timeSec;
        playWebAudioChime();
        speakTextLoudly(currentChunk.text);
      }

      timerIntervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            window.speechSynthesis?.cancel();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      window.speechSynthesis?.cancel();
      lastSpokenTimeRef.current = null;
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      window.speechSynthesis?.cancel();
    };
  }, [isPlaying, currentTime, isMuted, volume]);

  const togglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      window.speechSynthesis?.cancel();
    }
  };

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const videoChapters = [
    { time: '00:01', timeSec: 1, title: '1. Welcome & Platform Overview', desc: 'Introduction to Nkorera Education Portal and how to generate lesson materials in 1 minute.' },
    { time: '02:00', timeSec: 120, title: '2. Dashboard & Lesson Repository', desc: 'View statistics, prepared lessons, subscription packages, and REB CBC curriculum alignment.' },
    { time: '04:30', timeSec: 270, title: '3. Scheme of Work AI Generator (REB Syllabus)', desc: 'Generate termly Schemes of Work according to REB learning objectives and key competencies.' },
    { time: '07:15', timeSec: 435, title: '4. Lesson Plan AI Generator (CBC Matrix)', desc: 'Create 40/80 min Lesson Plans with SMART objectives, Bloom’s taxonomy, and group activities.' },
    { time: '10:00', timeSec: 600, title: '5. Nursery & Primary Early Childhood Modules', desc: 'Learning aids for nursery and primary teachers, visual cards, math sets, and play-based games.' },
    { time: '13:00', timeSec: 780, title: '6. Assessment & Quiz Generator (Marking Schemes)', desc: 'Prepare Formative & Summative quizzes, Multiple Choice, and complete teacher Marking Guides.' },
    { time: '15:45', timeSec: 945, title: '7. Remedial & Differentiated Support Plan', desc: 'Strategies and learning tasks for struggling learners (Remedial) and advanced learners (Extended).' },
    { time: '18:30', timeSec: 1110, title: '8. Lesson Plan Prompts Studio', desc: 'Use AI prompts created by REB experts, copy and customize them using AI.' },
    { time: '21:00', timeSec: 1260, title: '9. Subscription Plans & MoMo Integration', desc: '6 flexible packages from Free Plan, Day Pass, Term Pass, to School Unlimited Pass with MoMo.' },
    { time: '23:30', timeSec: 1410, title: '10. DOCX/PDF Exporting & Support Center', desc: 'Download documents in PDF/Word ready for printing, plus 24/7 instant WhatsApp support.' }
  ];

  const featuredPrompts = [
    {
      id: 'vp-1',
      title: 'High-Quality Lesson Plan Prompt (CBC)',
      prompt: 'Act as a Master Rwandan CBC Pedagogy Expert. Create a complete, detailed 40-minute lesson plan for [Grade, e.g. Primary 5] [Subject, e.g. Mathematics] on [Topic, e.g. Finding the Area of Triangles]. Include SMART objectives, Bloom Taxonomy verbs, differentiated group activities (Remedial, Consolidation, Extended), REB cross-cutting issues, and a formative assessment rubric.',
      tag: 'Lesson Plan Master'
    },
    {
      id: 'vp-2',
      title: 'Termly Scheme of Work Prompt (REB)',
      prompt: 'Generate a termly Scheme of Work for [Subject] Grade [Class] covering [Term 1/2/3] aligned with REB Rwanda syllabus. Include week-by-week unit breakdown, key competencies, learning objectives, teaching aids, and evaluation strategies in clear tabular format.',
      tag: 'Scheme of Work'
    },
    {
      id: 'vp-3',
      title: 'Remedial Learning Task Prompt',
      prompt: 'Design a 15-minute Remedial Learning Task for 4 struggling learners in Primary [Grade] who fail to understand [Topic]. Use concrete local visual manipulative aids, simplified step-by-step guidance, and positive reinforcement feedback prompts.',
      tag: 'Remedial Support'
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden">
        
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-2xl">
              <Video className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full">
                  VIDEO TUTORIAL
                </span>
                <span className="text-amber-400 text-xs font-bold">How to Use AI Prompts Guide</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Video AI Prompts: How to Use AI Prompts for Teachers
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* MAIN BODY AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* VIDEO PLAYER CONTAINER */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-amber-500/50 shadow-2xl group">
            {/* DYNAMIC SCREEN CANVAS / ANIMATED 3D CHARACTER AT LAPTOP */}
            <div className="relative aspect-video w-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
              
              {/* BASE IMAGE THUMBNAIL */}
              <img 
                src="/ai_prompt_tutorial_thumb.jpg" 
                alt="AI Video Tutorial - Mitech Rwanda" 
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                  isPlaying ? 'scale-105 brightness-90 saturate-110' : 'brightness-75 hover:brightness-90'
                }`}
              />

              {/* TOP RIGHT VIDEO OVERLAY CONTROLS (Cast, Subtitles CC, Settings) */}
              <div className="absolute top-3 right-4 z-20 flex items-center gap-2 text-white/90">
                <button className="p-2 rounded-full bg-slate-950/60 hover:bg-slate-900 border border-slate-700/60 backdrop-blur-md transition-all cursor-pointer">
                  <Cast className="w-4 h-4 text-white" />
                </button>
                <button className="p-2 rounded-full bg-slate-950/60 hover:bg-slate-900 border border-slate-700/60 backdrop-blur-md transition-all cursor-pointer">
                  <Subtitles className="w-4 h-4 text-amber-400 font-bold" />
                </button>
                <button className="p-2 rounded-full bg-slate-950/60 hover:bg-slate-900 border border-slate-700/60 backdrop-blur-md transition-all cursor-pointer">
                  <Settings className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* REAL-TIME ANIMATED CHARACTER & HOLOGRAPHIC WEBSITE CARDS OVERLAY */}
              {isPlaying && (
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                  
                  {/* HOLOGRAPHIC LIGHT BEAM FROM LAPTOP */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.8, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute bottom-12 left-[25%] w-[45%] h-[65%] bg-gradient-to-t from-cyan-500/40 via-amber-500/25 to-transparent blur-lg transform -skew-x-12" 
                  />

                  {/* 3D FLOATING WEBSITE MOCKUP CARDS POPPING UP FROM LAPTOP (MATCHING VIDEO) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      initial={{ y: 20, opacity: 0, scale: 0.8 }}
                      animate={{ y: [0, -12, 0], opacity: 1, scale: [0.95, 1.05, 0.95] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className="absolute top-[18%] right-[10%] sm:right-[15%] w-48 sm:w-64 bg-slate-950/90 border-2 border-cyan-400/80 rounded-xl p-2.5 shadow-[0_0_35px_rgba(34,211,238,0.5)] backdrop-blur-md flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between text-[9px] font-mono text-cyan-300 border-b border-cyan-500/30 pb-1">
                        <span className="font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          AI WEBSITE GENERATOR
                        </span>
                        <span className="bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded font-black">100% FREE</span>
                      </div>
                      <div className="bg-slate-900 rounded-lg p-2 border border-slate-800 space-y-1">
                        <div className="h-2 w-3/4 bg-cyan-400/60 rounded" />
                        <div className="h-1.5 w-1/2 bg-slate-700 rounded" />
                        <div className="grid grid-cols-2 gap-1 pt-1">
                          <div className="h-8 bg-amber-500/20 border border-amber-400/40 rounded flex items-center justify-center text-[8px] font-bold text-amber-300">
                            CBC Lesson Plan
                          </div>
                          <div className="h-8 bg-cyan-500/20 border border-cyan-400/40 rounded flex items-center justify-center text-[8px] font-bold text-cyan-300">
                            Scheme of Work
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* SECOND FLOATING CARD */}
                    <motion.div 
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: [0, 10, 0], opacity: [0.8, 1, 0.8] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.5 }}
                      className="absolute bottom-[28%] left-[8%] sm:left-[12%] bg-slate-950/90 border border-amber-400/80 rounded-lg p-2 shadow-[0_0_25px_rgba(245,158,11,0.5)] backdrop-blur-md text-[10px] font-bold text-amber-300 flex items-center gap-2"
                    >
                      <span className="text-base">🚀</span>
                      <span>No Payment • 1 Minute AI Build</span>
                    </motion.div>
                  </div>

                  {/* LIVE TALKING & GESTURE AVATAR HEAD/HAND OVERLAY (TEACHER MIMIC WITH HEAD BOB & HAND MOVEMENTS) */}
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-4 left-4 flex items-center gap-3 bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.6)]"
                  >
                    <div className="relative">
                      <motion.div 
                        animate={{ 
                          rotate: [0, -5, 5, -3, 2, 0],
                          y: [0, -4, 2, -3, 1, 0],
                          scale: [1, 1.08, 0.98, 1.05, 1]
                        }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                        className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 border-2 border-slate-950 flex items-center justify-center text-2xl shadow-inner relative"
                      >
                        {getCurrentChunk().gesture}

                        {/* SYNCHRONIZED TALKING MOUTH / SPEECH RIPPLE */}
                        <motion.span 
                          animate={{ scale: [1, 1.8, 1], opacity: [0.9, 0.1, 0.9] }}
                          transition={{ repeat: Infinity, duration: 0.5 }}
                          className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950"
                        />
                      </motion.div>

                      {/* DYNAMIC HAND GESTURE MOVEMENT */}
                      <motion.div 
                        animate={{ 
                          x: [0, 10, -6, 8, 0],
                          y: [0, -5, 3, -6, 0],
                          rotate: [0, 20, -15, 12, 0]
                        }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                        className="absolute -bottom-2 -left-2 bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-slate-950 shadow"
                      >
                        {getCurrentChunk().gesture}
                      </motion.div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-[9px] font-mono text-amber-400 font-black">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>AI TEACHER SPEAKING</span>
                      </div>
                      <span className="text-white text-xs font-bold block">
                        {getCurrentChunk().actionState}
                      </span>
                    </div>
                  </motion.div>

                  {/* LAPTOP KEYBOARD GLOW & SOUNDWAVE PULSES */}
                  <motion.div 
                    animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.95, 1.05, 0.95] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="absolute bottom-[22%] left-[28%] w-36 h-10 bg-cyan-400/40 rounded-full blur-xl" 
                  />
                </div>
              )}

              {/* GRADIENT OVERLAY FOR CONTROLS & READABILITY */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/60" />

              {/* CENTER PLAY/PAUSE CONTROL OVERLAY */}
              <div className="relative z-20 flex items-center justify-center">
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex flex-col items-center justify-center shadow-2xl shadow-amber-500/50 transition-all transform hover:scale-110 active:scale-95 cursor-pointer ring-4 ring-amber-400/30 text-center"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-current" />
                  ) : (
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
                  )}
                </button>
              </div>

              {/* VIDEO OVERLAY CONTROLS BAR (MATCHING USER'S SCREENSHOT) */}
              <div className="absolute bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur-md px-4 py-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 z-20">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={togglePlay} 
                    className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <span className="font-mono text-[11px] text-amber-300 font-bold">
                    {formatTime(currentTime)} / {formatTime(totalDuration)}
                  </span>
                </div>

                {/* Progress bar */}
                <div 
                  className="flex-1 mx-4 h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer relative"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const pct = clickX / rect.width;
                    const newTime = Math.floor(pct * totalDuration);
                    setCurrentTime(newTime);
                    if (isPlaying) {
                      playWebAudioChime();
                      speakTextLoudly(getCurrentScriptText());
                    }
                  }}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 transition-all"
                    style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const nextMute = !isMuted;
                      setIsMuted(nextMute);
                      if (nextMute) {
                        window.speechSynthesis?.cancel();
                      } else if (isPlaying) {
                        speakTextLoudly(getCurrentScriptText());
                      }
                    }}
                    className="p-1 rounded text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1 font-bold text-[10px]"
                    title={isMuted ? "Unmute Audio" : "Mute Audio"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                    <span>{isMuted ? "MUTED" : "MAX 100%"}</span>
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setVolume(v);
                      if (v > 0) setIsMuted(false);
                    }}
                    className="w-16 accent-amber-500 cursor-pointer hidden sm:block"
                    title="Volume Control"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* TABS NAVIGATION */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 rounded-2xl p-1 gap-1">
            <button
              onClick={() => setActiveTab('video')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'video' 
                  ? 'bg-amber-500 text-slate-950 shadow' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Prompt Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('chapters')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'chapters' 
                  ? 'bg-amber-500 text-slate-950 shadow' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Video Chapters ({videoChapters.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('prompts')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'prompts' 
                  ? 'bg-amber-500 text-slate-950 shadow' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sample AI Prompts</span>
            </button>
          </div>

          {/* TAB CONTENT 1: OVERVIEW & KEY TAKEAWAYS */}
          {activeTab === 'video' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-black text-amber-400 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Key Video Takeaways & Lessons:</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-2.5">
                    <span className="text-amber-400 font-bold text-base">1.</span>
                    <div>
                      <h5 className="font-bold text-white text-xs">AI Speed & Efficiency</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        AI completes a lesson draft for teachers in under 1 minute, eliminating fatigue and saving valuable time.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-2.5">
                    <span className="text-amber-400 font-bold text-base">2.</span>
                    <div>
                      <h5 className="font-bold text-white text-xs">Good Prompt = High Quality</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        The better your prompt, the higher quality your AI generated results will be. Provide clear objectives, grade, subject, and topic.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-2.5">
                    <span className="text-amber-400 font-bold text-base">3.</span>
                    <div>
                      <h5 className="font-bold text-white text-xs">Avoid Generic Prompts</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Direct AI specifically towards the REB Competency-Based Curriculum (CBC), using Bloom's Taxonomy and SMART objectives.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-2.5">
                    <span className="text-amber-400 font-bold text-base">4.</span>
                    <div>
                      <h5 className="font-bold text-white text-xs">Exporting & Printing</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Export your document instantly in PDF or Word (DOCX) format, ready for classroom printing and usage.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {onOpenPromptsStudio && (
                <div className="p-4 bg-gradient-to-r from-blue-950 to-slate-900 rounded-2xl border border-blue-500/40 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-black text-white text-xs">Explore Pedagogy Prompts in Studio</h4>
                    <p className="text-[11px] text-slate-300">Open the Lesson Plan Prompts Studio to test expert-crafted prompts built for REB teachers.</p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPromptsStudio();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 transition-all cursor-pointer shadow-lg"
                  >
                    Open Prompts Studio &rarr;
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT 2: CHAPTERS */}
          {activeTab === 'chapters' && (
            <div className="space-y-2.5">
              {videoChapters.map((ch, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    const chapterScriptText = audioNarrationScript.find(s => s.timeSec === ch.timeSec)?.text || `${ch.title}. ${ch.desc}`;
                    setCurrentTime(ch.timeSec);
                    setIsPlaying(true);
                    playWebAudioChime();
                    speakTextLoudly(chapterScriptText);
                  }}
                  className="p-3.5 bg-slate-950 hover:bg-slate-800/80 rounded-xl border border-slate-800 hover:border-amber-500/50 transition-all flex items-start gap-3 group cursor-pointer"
                >
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg font-mono font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                    {ch.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-black text-white text-xs group-hover:text-amber-300 truncate">
                      {ch.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {ch.desc}
                    </p>
                  </div>
                  <Play className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 self-center" />
                </div>
              ))}
            </div>
          )}

          {/* TAB CONTENT 3: FEATURED PROMPTS */}
          {activeTab === 'prompts' && (
            <div className="space-y-3">
              {featuredPrompts.map((p) => (
                <div key={p.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                      {p.tag}
                    </span>
                    <button
                      onClick={() => handleCopy(p.prompt, p.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      {copiedId === p.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>
                  </div>
                  <h5 className="font-black text-white text-xs">{p.title}</h5>
                  <p className="p-3 bg-slate-900 rounded-xl text-slate-300 text-[11px] font-mono leading-relaxed border border-slate-800 selection:bg-amber-500 selection:text-slate-950">
                    {p.prompt}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Video Tutorial Guide • Nkorera Education Portal 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
