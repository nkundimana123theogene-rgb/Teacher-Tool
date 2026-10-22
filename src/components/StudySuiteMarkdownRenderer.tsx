import React, { useState } from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  BookOpen, 
  Presentation, 
  Mic, 
  CheckSquare, 
  Square,
  ChevronDown,
  Lightbulb,
  XCircle,
  Key,
  RotateCcw,
  Award,
  Printer,
  EyeOff
} from 'lucide-react';
import { FlashcardItem } from './SavetoAiStudio';

interface StudySuiteMarkdownRendererProps {
  content: string;
  onImportFlashcards?: (cards: FlashcardItem[]) => void;
  onRequestFullPpt?: () => void;
}

interface ParsedQuizQuestion {
  index: number;
  questionText: string;
  options: { key: string; label: string; text: string }[];
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  cleanAnswer: string;
  explanation: string;
  correctKey: string;
  rawAnswerLine: string;
}

export const StudySuiteMarkdownRenderer: React.FC<StudySuiteMarkdownRendererProps> = ({
  content,
  onImportFlashcards: _onImportFlashcards,
  onRequestFullPpt
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [speakingLine, setSpeakingLine] = useState<string | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  // Interactive Quiz & Answer Key State (Yakemeza no Gushyiraho Answer Key)
  const [quizUserAnswers, setQuizUserAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});
  const [quizSelfGraded, setQuizSelfGraded] = useState<Record<string, boolean>>({});
  const [showAnswerKey, setShowAnswerKey] = useState<Record<number, boolean>>({});
  const [copiedAnswerKeyIdx, setCopiedAnswerKeyIdx] = useState<number | null>(null);

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSpeakText = (text: string, key: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingLine === key) {
      window.speechSynthesis.cancel();
      setSpeakingLine(null);
      return;
    }
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#`_\[\]]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'en-US';
    utterance.onend = () => setSpeakingLine(null);
    utterance.onerror = () => setSpeakingLine(null);
    setSpeakingLine(key);
    window.speechSynthesis.speak(utterance);
  };

  const toggleAnswer = (key: string | number) => {
    setRevealedAnswers(prev => ({ ...prev, [String(key)]: !prev[String(key)] }));
  };

  const toggleTask = (taskKey: string) => {
    setCompletedTasks(prev => ({ ...prev, [taskKey]: !prev[taskKey] }));
  };

  // Helper to parse individual questions from markdown quiz text
  const parseQuizQuestions = (bodyText: string): ParsedQuizQuestion[] => {
    // Match questions starting with "1.", "1)", "Q1:", etc.
    const blocks = bodyText.split(/\n(?=(?:\d+[\.\)]|Q\d+[:\.]?)\s+)/i).filter(q => q.trim().length > 0);
    return blocks.map((block, idx) => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      const qLine = lines[0] || `Question ${idx + 1}`;
      const cleanQuestion = qLine
        .replace(/^(?:\d+[\.\)]|Q\d+[:\.]?)\s*/i, '')
        .replace(/\*\*/g, '')
        .trim();

      // Find answer line (e.g. "*Answer: b) Digestion*", "Answer: True", "*Igisubizo: ...*", "*Réponse: ...*", "*Jibu: ...*")
      const answerLine = lines.find(l => {
        const lower = l.toLowerCase();
        return lower.startsWith('*answer:') || 
               lower.startsWith('answer:') || 
               lower.startsWith('**answer:**') || 
               lower.includes('*answer:') ||
               lower.startsWith('*igisubizo:') ||
               lower.startsWith('igisubizo:') ||
               lower.startsWith('**igisubizo:**') ||
               lower.includes('*igisubizo:') ||
               lower.startsWith('*réponse:') ||
               lower.startsWith('réponse:') ||
               lower.startsWith('*reponse:') ||
               lower.startsWith('reponse:') ||
               lower.startsWith('*jibu:') ||
               lower.startsWith('jibu:');
      }) || '';

      // Option lines: lines that aren't the answer line
      const optionLines = lines.slice(1).filter(l => {
        const lower = l.toLowerCase();
        return !lower.startsWith('*answer:') && 
               !lower.startsWith('answer:') && 
               !lower.startsWith('**answer:**') &&
               !lower.includes('*answer:') &&
               !lower.startsWith('*igisubizo:') &&
               !lower.startsWith('igisubizo:') &&
               !lower.startsWith('*réponse:') &&
               !lower.startsWith('réponse:') &&
               !lower.startsWith('*jibu:') &&
               !lower.startsWith('jibu:') &&
               !lower.includes('answer key') &&
               !lower.includes("urutonde rw'ibisubizo");
      });

      const isTrueFalse = cleanQuestion.toLowerCase().includes('true or false') || 
        cleanQuestion.toLowerCase().includes('true/false') ||
        cleanQuestion.toLowerCase().includes('yego cyangwa oya') ||
        cleanQuestion.toLowerCase().includes('yego/oya') ||
        cleanQuestion.toLowerCase().includes('vrai ou faux') ||
        cleanQuestion.toLowerCase().includes('vrai/faux') ||
        cleanQuestion.toLowerCase().includes('kweli au si kweli') ||
        cleanQuestion.toLowerCase().includes('ndiyo au hapana') ||
        optionLines.some(o => /^(a[\.\)]|b[\.\)]|\-|\*)?\s*(true|false|yego|oya|vrai|faux|kweli|si kweli|ndiyo|hapana)/i.test(o.trim()));

      let options: { key: string; label: string; text: string }[] = [];
      if (optionLines.length > 0) {
        options = optionLines.map(l => {
          const clean = l.replace(/^[\*\-]\s*/, '').trim();
          const optMatch = clean.match(/^([a-dA-D][\.\)])\s*(.+)/);
          if (optMatch) {
            return { 
              key: optMatch[1].toLowerCase().replace(/[\.\)]/, ''), 
              label: optMatch[1], 
              text: optMatch[2].replace(/\*\*/g, '').trim() 
            };
          }
          return { key: clean.toLowerCase(), label: '', text: clean.replace(/\*\*/g, '').trim() };
        });
      } else if (isTrueFalse) {
        if (cleanQuestion.toLowerCase().includes('yego') || cleanQuestion.toLowerCase().includes('oya')) {
          options = [
            { key: 'true', label: 'A', text: 'Yego (True)' },
            { key: 'false', label: 'B', text: 'Oya (False)' }
          ];
        } else if (cleanQuestion.toLowerCase().includes('vrai') || cleanQuestion.toLowerCase().includes('faux')) {
          options = [
            { key: 'true', label: 'A', text: 'Vrai (True)' },
            { key: 'false', label: 'B', text: 'Faux (False)' }
          ];
        } else if (cleanQuestion.toLowerCase().includes('kweli') || cleanQuestion.toLowerCase().includes('hapana')) {
          options = [
            { key: 'true', label: 'A', text: 'Kweli / Ndiyo (True)' },
            { key: 'false', label: 'B', text: 'Si Kweli / Hapana (False)' }
          ];
        } else {
          options = [
            { key: 'true', label: 'A', text: 'True' },
            { key: 'false', label: 'B', text: 'False' }
          ];
        }
      }

      let cleanAnswer = '';
      let explanation = '';
      let correctKey = '';

      if (answerLine) {
        let ansPart = answerLine
          .replace(/^(\*{1,2})?(Answer|Igisubizo|Réponse|Reponse|Jibu):(\*{1,2})?\s*/i, '')
          .replace(/[\*]/g, '')
          .trim();
        ansPart = ansPart.replace(/\.$/, '').trim();

        // Extract explanation in parentheses e.g. "b) Digestion (It is part of Nutrition...)"
        const parenMatch = ansPart.match(/\(([^)]+)\)$/);
        if (parenMatch) {
          explanation = parenMatch[1].trim();
          ansPart = ansPart.replace(/\s*\([^)]+\)$/, '').trim();
        }

        cleanAnswer = ansPart;

        const letterMatch = ansPart.match(/^([a-dA-D])[\.\)]\s*(.*)/);
        const isTrueVal = /^(true|yego|vrai|ndiyo|kweli)/i.test(ansPart);
        const isFalseVal = /^(false|oya|faux|hapana|si kweli)/i.test(ansPart);

        if (letterMatch) {
          correctKey = letterMatch[1].toLowerCase();
        } else if (isTrueVal) {
          correctKey = 'true';
        } else if (isFalseVal) {
          correctKey = 'false';
        }
      }

      return {
        index: idx,
        questionText: cleanQuestion,
        type: options.length > 0 ? (isTrueFalse ? 'true_false' : 'multiple_choice') : 'short_answer',
        options,
        cleanAnswer,
        explanation,
        correctKey,
        rawAnswerLine: answerLine
      };
    });
  };

  // Check if a user's answer is correct
  const isQuestionCorrect = (q: ParsedQuizQuestion, sIdx: number): boolean => {
    const ansKey = `${sIdx}_${q.index}`;
    const userAns = (quizUserAnswers[ansKey] || '').trim();

    // Check manual teacher/student override if present
    if (quizSelfGraded[ansKey] !== undefined) {
      return quizSelfGraded[ansKey];
    }

    if (q.type === 'multiple_choice' || q.type === 'true_false') {
      if (!userAns) return false;
      if (q.correctKey && userAns.toLowerCase() === q.correctKey.toLowerCase()) {
        return true;
      }
      if (q.cleanAnswer && userAns.toLowerCase() === q.cleanAnswer.toLowerCase()) {
        return true;
      }
      return false;
    }

    // Short answer evaluation
    if (!userAns) return false;
    if (!q.cleanAnswer) return false;
    const userLower = userAns.toLowerCase();
    const targetLower = q.cleanAnswer.toLowerCase();
    if (userLower === targetLower) return true;
    if (targetLower.includes(userLower) && userLower.length >= 3) return true;
    if (userLower.includes(targetLower) && targetLower.length >= 3) return true;

    return false;
  };

  // Copy full Answer Key to clipboard
  const handleCopyAnswerKey = (questions: ParsedQuizQuestion[], sIdx: number) => {
    const formatted = [
      `=== SAVETO AI - ANSWER KEY & MARKING GUIDE (IMBONERAHAMWE Y'IBISUBIZO) ===`,
      `Date: ${new Date().toLocaleDateString()}`,
      `Total Questions: ${questions.length}\n`,
      ...questions.map(q => {
        return `[Question ${q.index + 1}]\n${q.questionText}\n` +
          `• Correct Answer: ${q.cleanAnswer || (q.correctKey ? q.correctKey.toUpperCase() : 'N/A')}\n` +
          (q.explanation ? `• Explanation: ${q.explanation}\n` : '') +
          `--------------------------------------------------`;
      })
    ].join('\n');

    navigator.clipboard.writeText(formatted);
    setCopiedAnswerKeyIdx(sIdx);
    setTimeout(() => setCopiedAnswerKeyIdx(null), 2500);
  };

  // Reset quiz answers
  const handleResetQuiz = (sIdx: number, count: number) => {
    setQuizSubmitted(prev => ({ ...prev, [sIdx]: false }));
    setQuizUserAnswers(prev => {
      const next = { ...prev };
      for (let i = 0; i < count; i++) {
        delete next[`${sIdx}_${i}`];
      }
      return next;
    });
    setQuizSelfGraded(prev => {
      const next = { ...prev };
      for (let i = 0; i < count; i++) {
        delete next[`${sIdx}_${i}`];
      }
      return next;
    });
  };

  // Helper to parse markdown tables
  const renderMarkdownTable = (lines: string[]) => {
    const tableRows = lines.filter(l => l.trim().startsWith('|') && l.trim().endsWith('|'));
    if (tableRows.length < 2) return null;

    // Header row
    const headerCells = tableRows[0]
      .split('|')
      .map(c => c.trim())
      .filter((_, i, arr) => i > 0 && i < arr.length - 1);

    // Filter out separator line | :--- | :--- |
    const dataRows = tableRows.slice(1).filter(row => !row.includes('---'));

    return (
      <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-sm bg-white my-4">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/90 text-slate-800 font-black border-b border-slate-200">
              {headerCells.map((h, i) => (
                <th key={i} className="py-2.5 px-4 font-black uppercase tracking-wider text-[11px]">
                  {h.replace(/\*\*/g, '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dataRows.map((row, rIdx) => {
              const cells = row
                .split('|')
                .map(c => c.trim())
                .filter((_, i, arr) => i > 0 && i < arr.length - 1);
              return (
                <tr key={rIdx} className="hover:bg-orange-50/30 transition-colors">
                  {cells.map((cell, cIdx) => (
                    <td key={cIdx} className="py-2.5 px-4 text-slate-700 leading-relaxed font-medium">
                      {cell.startsWith('**') && cell.endsWith('**') ? (
                        <span className="font-extrabold text-slate-900 bg-orange-100/60 text-orange-950 px-1.5 py-0.5 rounded">
                          {cell.replace(/\*\*/g, '')}
                        </span>
                      ) : (
                        cell.replace(/\*\*/g, '')
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Check if text has flashcards JSON
  const extractFlashcards = (text: string): FlashcardItem[] | null => {
    try {
      const match = text.match(/```json([\s\S]*?)```/);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1].trim());
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].front && parsed[0].back) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
  };

  const detectedCards = extractFlashcards(content);

  // Split into structured sections
  const rawSections = content.split(/\n(?=###?\s+|\-\-\-)/g);

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* Top spacing */}

      {rawSections.map((section, sIdx) => {
        const trimmed = section.trim();
        if (!trimmed || trimmed === '---') return null;

        // Header check
        const headerMatch = trimmed.match(/^###?\s+([^\n]+)/);
        const headerText = headerMatch ? headerMatch[1].trim() : null;
        const bodyText = headerMatch ? trimmed.slice(headerMatch[0].length).trim() : trimmed;

        // Check section type
        const isExecutiveSummary = headerText?.toLowerCase().includes('executive summary');
        const isTakeaways = headerText?.toLowerCase().includes('key takeaways');
        const isTableSection = headerText?.toLowerCase().includes('definitions') || headerText?.toLowerCase().includes('table');
        const isActionPoints = headerText?.toLowerCase().includes('actionable') || headerText?.toLowerCase().includes('review points');
        const isPodcast = headerText?.toLowerCase().includes('podcast') || headerText?.toLowerCase().includes('audio');
        const isQuiz = headerText?.toLowerCase().includes('quiz') || 
                       headerText?.toLowerCase().includes('questions') || 
                       headerText?.toLowerCase().includes('ibibazo') || 
                       headerText?.toLowerCase().includes('maswali');
        const isAnswerKeySection = headerText?.toLowerCase().includes('answer key') || 
                                   headerText?.toLowerCase().includes('marking guide') || 
                                   headerText?.toLowerCase().includes("imbonerahamwe y'ibisubizo") ||
                                   headerText?.toLowerCase().includes("urutonde rw'ibisubizo") ||
                                   headerText?.toLowerCase().includes("corrigé") ||
                                   headerText?.toLowerCase().includes("guide de correction") ||
                                   headerText?.toLowerCase().includes("mwongozo wa majibu");
        const isFlashcards = headerText?.toLowerCase().includes('flashcards');
        const isPpt = headerText?.toLowerCase().includes('ppt') || headerText?.toLowerCase().includes('slide');

        // SECTION 1: EXECUTIVE SUMMARY
        if (isExecutiveSummary) {
          return (
            <div key={sIdx} className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-orange-100 text-orange-600">📌</span>
                  <span>{headerText}</span>
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100/70 text-orange-800 px-2 py-0.5 rounded-full">
                  High-Yield Overview
                </span>
              </div>
              <div className="text-slate-700 text-sm leading-relaxed space-y-3 font-normal">
                {bodyText.split('\n\n').map((para, pIdx) => (
                  <p key={pIdx}>{para.replace(/\*\*/g, '')}</p>
                ))}
              </div>
            </div>
          );
        }

        // SECTION 2: KEY TAKEAWAYS
        if (isTakeaways) {
          const items = bodyText
            .split('\n')
            .filter(l => l.trim().startsWith('*') || l.trim().startsWith('-'));

          return (
            <div key={sIdx} className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">🔑</span>
                  <span>{headerText}</span>
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100/80 text-amber-900 px-2 py-0.5 rounded-full">
                  Core Principles
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2.5 pt-1">
                {items.map((item, iIdx) => {
                  const cleaned = item.replace(/^[\*\-]\s+/, '').trim();
                  const parts = cleaned.split(':');
                  const title = parts.length > 1 ? parts[0].replace(/\*\*/g, '') : null;
                  const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : cleaned.replace(/\*\*/g, '');

                  return (
                    <div key={iIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3 hover:bg-orange-50/30 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 shrink-0" />
                      <div className="text-xs sm:text-sm">
                        {title && (
                          <strong className="font-black text-slate-900 mr-1.5 text-orange-950 bg-orange-100/70 px-1.5 py-0.5 rounded">
                            {title}:
                          </strong>
                        )}
                        <span className="text-slate-700 leading-relaxed font-medium">{desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        // SECTION 3: KEY DEFINITIONS & FACTS TABLE
        if (isTableSection && bodyText.includes('|')) {
          const tableLines = bodyText.split('\n').filter(l => l.includes('|'));
          return (
            <div key={sIdx} className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">💡</span>
                  <span>{headerText}</span>
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded-full">
                  Definitions Table
                </span>
              </div>
              {renderMarkdownTable(tableLines)}
            </div>
          );
        }

        // SECTION 4: ACTIONABLE STUDY REVIEW POINTS
        if (isActionPoints) {
          const items = bodyText
            .split('\n')
            .filter(l => l.trim().startsWith('*') || l.trim().startsWith('-'));

          return (
            <div key={sIdx} className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-teal-100 text-teal-700">🎯</span>
                  <span>{headerText}</span>
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-teal-100/80 text-teal-900 px-2 py-0.5 rounded-full">
                  Student Tasks
                </span>
              </div>
              <div className="space-y-2.5 pt-1">
                {items.map((item, iIdx) => {
                  const cleaned = item.replace(/^[\*\-]\s+/, '').trim();
                  const parts = cleaned.split(':');
                  const title = parts.length > 1 ? parts[0].replace(/\*\*/g, '') : null;
                  const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : cleaned.replace(/\*\*/g, '');
                  const taskKey = `task_${sIdx}_${iIdx}`;
                  const isDone = completedTasks[taskKey];

                  return (
                    <div 
                      key={iIdx}
                      onClick={() => toggleTask(taskKey)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isDone 
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' 
                          : 'bg-slate-50 border-slate-200/80 hover:bg-orange-50/30'
                      }`}
                    >
                      <button type="button" className="mt-0.5 text-slate-400 hover:text-emerald-600 shrink-0">
                        {isDone ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      <div className="text-xs sm:text-sm">
                        {title && (
                          <span className={`font-black mr-1.5 ${isDone ? 'line-through text-emerald-800' : 'text-slate-900'}`}>
                            {title}:
                          </span>
                        )}
                        <span className={isDone ? 'line-through text-slate-500' : 'text-slate-700'}>
                          {desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        // SECTION 5: PODCAST SCRIPT (AI VOICES)
        if (isPodcast) {
          const lines = bodyText.split('\n').filter(l => l.trim().length > 0);

          return (
            <div key={sIdx} className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                    <Mic className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {headerText}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Co-Host Dialogue between Alex (Student) and Dr. Eric (Educator)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleSpeakText(bodyText, `pod_${sIdx}`)}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-purple-200"
                >
                  {speakingLine === `pod_${sIdx}` ? <VolumeX className="w-3.5 h-3.5 text-purple-600" /> : <Volume2 className="w-3.5 h-3.5 text-purple-600" />}
                  <span>{speakingLine === `pod_${sIdx}` ? 'Stop Audio' : 'Play Podcast'}</span>
                </button>
              </div>

              <div className="space-y-3 pt-1">
                {lines.map((line, lIdx) => {
                  const lineTrimmed = line.trim();

                  // Sound cues like [Sound: ...]
                  if (lineTrimmed.startsWith('[') && lineTrimmed.endsWith(']')) {
                    return (
                      <div key={lIdx} className="flex justify-center my-1">
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 italic">
                          🎵 {lineTrimmed.replace(/[\[\]]/g, '')}
                        </span>
                      </div>
                    );
                  }

                  const isAlex = lineTrimmed.startsWith('**Alex:**') || lineTrimmed.startsWith('Alex:');
                  const isEric = lineTrimmed.startsWith('**Dr. Eric:**') || lineTrimmed.startsWith('Dr. Eric:');
                  const cleanSpeech = lineTrimmed.replace(/\*\*(Alex|Dr\. Eric):\*\*/, '').replace(/^(Alex|Dr\. Eric):/, '').trim();

                  if (isAlex || isEric) {
                    return (
                      <div 
                        key={lIdx}
                        className={`flex gap-3 p-3.5 rounded-2xl border transition-all ${
                          isAlex 
                            ? 'bg-blue-50/70 border-blue-200/80 mr-4 sm:mr-10' 
                            : 'bg-emerald-50/70 border-emerald-200/80 ml-4 sm:ml-10'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 text-white shadow-sm ${
                          isAlex ? 'bg-blue-600' : 'bg-emerald-600'
                        }`}>
                          {isAlex ? 'A' : 'E'}
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-800">
                              {isAlex ? 'Alex (Student)' : 'Dr. Eric (Educator)'}
                            </span>
                            <button
                              onClick={() => handleSpeakText(cleanSpeech, `line_${lIdx}`)}
                              className="text-slate-400 hover:text-slate-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                              title="Listen to this line"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                            {cleanSpeech}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <p key={lIdx} className="text-xs text-slate-600">
                      {lineTrimmed}
                    </p>
                  );
                })}
              </div>
            </div>
          );
        }

        // SECTION 6: AI QUIZ (INTERACTIVE QUIZ, KWEMEZA IBISUBIZO & GUSHYIRAHO ANSWER KEY)
        if (isQuiz) {
          const questions = parseQuizQuestions(bodyText);
          const isSubmitted = !!quizSubmitted[sIdx];
          const isKeyVisible = !!showAnswerKey[sIdx];

          // Score calculations
          const correctCount = questions.filter(q => isQuestionCorrect(q, sIdx)).length;
          const totalCount = questions.length;
          const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
          const answeredCount = questions.filter(q => {
            const ans = (quizUserAnswers[`${sIdx}_${q.index}`] || '').trim();
            return ans.length > 0;
          }).length;

          return (
            <div key={sIdx} className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              {/* QUIZ HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-rose-100 text-rose-700">
                    <HelpCircle className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <span>{headerText}</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Interactive Practice • Subiza, Emeza amanota yawe, no Gushyiraho Answer Key
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* TOGGLE ANSWER KEY BUTTON (GUSHYIRAHO ANSWER KEY) */}
                  <button
                    type="button"
                    onClick={() => setShowAnswerKey(prev => ({ ...prev, [sIdx]: !prev[sIdx] }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer border shadow-xs ${
                      isKeyVisible 
                        ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700 ring-2 ring-amber-300' 
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
                    }`}
                    title="Shyiraho / Hisha Answer Key (Toggle Official Answer Key)"
                  >
                    {isKeyVisible ? <EyeOff className="w-3.5 h-3.5 text-white" /> : <Key className="w-3.5 h-3.5 text-amber-700" />}
                    <span>{isKeyVisible ? 'Hisha Answer Key' : '🔑 Shyiraho Answer Key'}</span>
                  </button>

                  <span className="text-[11px] font-black uppercase tracking-wider bg-rose-100/80 text-rose-800 px-2.5 py-1 rounded-full border border-rose-200">
                    {questions.length} Questions
                  </span>
                </div>
              </div>

              {/* DEDICATED ANSWER KEY PANEL (IMBONERAHAMWE Y'IBISUBIZO NYABYO) */}
              {isKeyVisible && (
                <div className="rounded-2xl border-2 border-amber-400 bg-amber-50/50 overflow-hidden shadow-md animate-fade-in space-y-0">
                  <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 text-white p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-white/20">
                        <Key className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm">
                          🔑 Imbonerahamwe y'Ibisubizo n'Ibisobanuro (Official Answer Key)
                        </h4>
                        <p className="text-[11px] text-amber-100">
                          Ibisubizo byose byemewe n'ibisobanuro birambuye by'iyi Quiz
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyAnswerKey(questions, sIdx)}
                        className="px-3 py-1.5 bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                        title="Koporora Answer Key yose"
                      >
                        {copiedAnswerKeyIdx === sIdx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Yakoporowe!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-amber-800" />
                            <span>Koporora Answer Key</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3 py-1.5 bg-amber-800/80 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                        title="Sohora Answer Key (Print)"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-200" />
                        <span>Sohora</span>
                      </button>
                    </div>
                  </div>

                  {/* ANSWER KEY LIST / TABLE */}
                  <div className="p-4 sm:p-5 space-y-3 bg-white divide-y divide-amber-100">
                    {questions.map((q, qIdx) => (
                      <div key={qIdx} className="pt-3 first:pt-0 space-y-1.5 no-break">
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {qIdx + 1}
                          </span>
                          <div className="flex-1 space-y-1">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              {q.questionText}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                              <span className="text-[11px] font-black uppercase text-slate-500">Igisubizo Nyacyo:</span>
                              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-950 font-black text-xs border border-emerald-300">
                                {q.cleanAnswer || (q.correctKey ? q.correctKey.toUpperCase() : 'N/A')}
                              </span>
                            </div>
                            {q.explanation && (
                              <p className="text-xs text-amber-950 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80 flex items-start gap-1.5 font-medium leading-relaxed mt-1">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <span><strong>Ibisobanuro:</strong> {q.explanation}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SCORE BANNER (AFTER USER CLICKS "EMEZA IBISUBIZO" - YAKEMEZA) */}
              {isSubmitted && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg border border-indigo-500/30 space-y-3 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                            Amanota Yabonetse (Result)
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            percentage >= 80 ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40' :
                            percentage >= 60 ? 'bg-amber-500/30 text-amber-300 border border-amber-400/40' :
                            'bg-rose-500/30 text-rose-300 border border-rose-400/40'
                          }`}>
                            {percentage >= 80 ? 'Passed with Honors' : percentage >= 50 ? 'Passed' : 'Needs Review'}
                          </span>
                        </div>
                        <h4 className="text-xl sm:text-2xl font-black tracking-tight">
                          {correctCount} / {totalCount} <span className="text-sm font-bold text-slate-300">({percentage}%)</span>
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleResetQuiz(sIdx, questions.length)}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/15"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-indigo-300" />
                        <span>Subiramo (Retake)</span>
                      </button>

                      {!isKeyVisible && (
                        <button
                          type="button"
                          onClick={() => setShowAnswerKey(prev => ({ ...prev, [sIdx]: true }))}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                        >
                          <Key className="w-3.5 h-3.5 text-slate-950" />
                          <span>Reba Answer Key</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
                    <div 
                      className={`h-full transition-all duration-700 ${
                        percentage >= 80 ? 'bg-gradient-to-r from-emerald-400 to-teal-400' :
                        percentage >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
                        'bg-gradient-to-r from-rose-500 to-orange-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {percentage === 100 
                      ? '🎉 Byose Ni Byiza Cyane! (Perfect Score - Outstanding Mastery of the Material!)'
                      : percentage >= 70 
                        ? '👏 Wakoze Neza Cyane! (Great Job - Review the highlighted explanations below!)'
                        : '📚 Komeza Kwitoza! (Review each explanation and official answer key below to master this topic!)'}
                  </p>
                </div>
              )}

              {/* QUESTIONS LIST */}
              <div className="space-y-4 pt-1">
                {questions.map((q, qIdx) => {
                  const ansKey = `${sIdx}_${q.index}`;
                  const userAns = (quizUserAnswers[ansKey] || '').trim();
                  const isCorrect = isQuestionCorrect(q, sIdx);
                  const isRevealed = revealedAnswers[ansKey];

                  return (
                    <div 
                      key={qIdx} 
                      className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 no-break ${
                        isSubmitted 
                          ? isCorrect 
                            ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200' 
                            : 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-200'
                          : 'bg-slate-50/80 border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      {/* QUESTION HEADER */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-start gap-2.5 flex-1">
                          <span className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                            isSubmitted 
                              ? isCorrect 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-rose-600 text-white'
                              : 'bg-slate-800 text-white'
                          }`}>
                            {qIdx + 1}
                          </span>
                          <div className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                            {q.questionText}
                          </div>
                        </div>

                        {/* STATUS BADGE WHEN SUBMITTED */}
                        {isSubmitted && (
                          <div className="shrink-0">
                            {isCorrect ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black flex items-center gap-1 shadow-xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Ni Byo (+1)</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-xs font-black flex items-center gap-1 shadow-xs">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Wibeshye (0)</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* OPTIONS / INTERACTION AREA */}
                      {q.options && q.options.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = userAns.toLowerCase() === opt.key.toLowerCase();
                            const isCorrectOpt = q.correctKey.toLowerCase() === opt.key.toLowerCase();

                            // Dynamic style based on submission
                            let optionClass = 'bg-white border-slate-200/90 text-slate-700 hover:border-orange-300 hover:bg-orange-50/20';
                            if (isSubmitted) {
                              if (isSelected && isCorrectOpt) {
                                optionClass = 'bg-emerald-100/90 border-emerald-500 text-emerald-950 font-black ring-2 ring-emerald-300';
                              } else if (isSelected && !isCorrectOpt) {
                                optionClass = 'bg-rose-100/90 border-rose-400 text-rose-950 font-bold line-through';
                              } else if (!isSelected && isCorrectOpt) {
                                optionClass = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-black ring-2 ring-emerald-200';
                              } else {
                                optionClass = 'bg-white opacity-60 border-slate-200 text-slate-500';
                              }
                            } else if (isSelected) {
                              optionClass = 'bg-orange-50/90 border-orange-500 text-orange-950 ring-2 ring-orange-200 font-bold';
                            }

                            return (
                              <div
                                key={oIdx}
                                onClick={() => {
                                  if (!isSubmitted) {
                                    setQuizUserAnswers(prev => ({ ...prev, [ansKey]: opt.key }));
                                  }
                                }}
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 text-xs sm:text-sm ${optionClass}`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-xs shrink-0 ${
                                    isSelected 
                                      ? 'bg-orange-500 text-white' 
                                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                                  }`}>
                                    {opt.label ? opt.label.replace(/[\.\)]/, '').toUpperCase() : String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span className="leading-snug">{opt.text}</span>
                                </div>

                                {isSubmitted && (
                                  <div className="shrink-0 text-xs font-black">
                                    {isSelected && isCorrectOpt && <span className="text-emerald-700">✓ Ni cyo</span>}
                                    {isSelected && !isCorrectOpt && <span className="text-rose-600">✕ Wihisemo iki</span>}
                                    {!isSelected && isCorrectOpt && <span className="text-emerald-700 font-black">★ Igisubizo</span>}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        /* SHORT ANSWER INPUT */
                        <div className="space-y-2 pt-1">
                          {!isSubmitted ? (
                            <input
                              type="text"
                              value={userAns}
                              onChange={e => setQuizUserAnswers(prev => ({ ...prev, [ansKey]: e.target.value }))}
                              placeholder="Andika igisubizo cyawe hano... / Type your answer here..."
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 font-medium placeholder:text-slate-400"
                            />
                          ) : (
                            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                              <div className="text-xs">
                                <span className="text-slate-500 font-bold">Igisubizo wanditse: </span>
                                <span className="font-extrabold text-slate-900">{userAns || '(Nta gisubizo)'}</span>
                              </div>
                              <div className="text-xs flex items-center gap-1.5">
                                <span className="text-slate-500 font-bold">Igisubizo Nyacyo: </span>
                                <span className="font-black text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                                  {q.cleanAnswer}
                                </span>
                              </div>
                              {/* MANUAL SELF-GRADE OVERRIDE FOR SHORT ANSWER */}
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[11px] text-slate-500 font-medium">Kosora niba wari ubifite:</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setQuizSelfGraded(prev => ({ ...prev, [ansKey]: true }))}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                                      quizSelfGraded[ansKey] === true ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-emerald-100'
                                    }`}
                                  >
                                    ✓ Nari mbifite (Correct)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setQuizSelfGraded(prev => ({ ...prev, [ansKey]: false }))}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                                      quizSelfGraded[ansKey] === false ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-rose-100'
                                    }`}
                                  >
                                    ✕ Nari nibeshye
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* EXPLANATION & REVEAL SECTION */}
                      {(isSubmitted || isRevealed) ? (
                        <div className="pt-2 border-t border-slate-200/80 mt-2 space-y-1.5 animate-fade-in">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                                Igisubizo Nyacyo / Answer:
                              </span>
                              <span className="text-xs font-black text-emerald-900 bg-emerald-100/90 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                                {q.cleanAnswer || (q.correctKey ? q.correctKey.toUpperCase() : 'N/A')}
                              </span>
                            </div>
                            {!isSubmitted && (
                              <button
                                type="button"
                                onClick={() => toggleAnswer(ansKey)}
                                className="text-[11px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                              >
                                Hisha
                              </button>
                            )}
                          </div>
                          {q.explanation && (
                            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-950 flex items-start gap-1.5 font-medium leading-relaxed">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <span><strong>Ibisobanuro:</strong> {q.explanation}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* PEEK BUTTON BEFORE SUBMISSION */
                        <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => toggleAnswer(ansKey)}
                            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Hishura Igisubizo (Peek)</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* BOTTOM ACTION BAR (EMEZA / SUBMIT, RETAKE & ANSWER KEY) */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-600 font-medium">
                  Yasubijwe: <strong className="text-slate-900 font-extrabold">{answeredCount}</strong> kuri <strong className="text-slate-900 font-extrabold">{questions.length}</strong>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!isSubmitted ? (
                    /* SUBMISSION BUTTON (YAKEMEZA!) */
                    <button
                      type="button"
                      onClick={() => setQuizSubmitted(prev => ({ ...prev, [sIdx]: true }))}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Emeza Ibisubizo (Submit & Check)</span>
                    </button>
                  ) : (
                    /* RETAKE & ANSWER KEY ACTIONS */
                    <>
                      <button
                        type="button"
                        onClick={() => handleResetQuiz(sIdx, questions.length)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                        <span>Subiramo (Retake Quiz)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowAnswerKey(prev => ({ ...prev, [sIdx]: !prev[sIdx] }))}
                        className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Key className="w-3.5 h-3.5 text-amber-700" />
                        <span>{isKeyVisible ? 'Hisha Answer Key' : '🔑 Shyiraho Answer Key'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyAnswerKey(questions, sIdx)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        {copiedAnswerKeyIdx === sIdx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Yakoporowe!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-300" />
                            <span>Koporora Key</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        }

        // SECTION: STANDALONE ANSWER KEY & MARKING GUIDE (IMBONERAHAMWE Y'IBISUBIZO)
        if (isAnswerKeySection) {
          const tableLines = bodyText.split('\n').filter(l => l.includes('|'));
          return (
            <div key={sIdx} className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-amber-300 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-amber-100 gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                    <Key className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {headerText}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Official Marking Scheme & Solutions Guide
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyText(bodyText, `key_${sIdx}`)}
                    className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs rounded-xl border border-amber-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedKey === `key_${sIdx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-amber-700" />}
                    <span>{copiedKey === `key_${sIdx}` ? 'Yakoporowe!' : 'Koporora Answer Key'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>Sohora</span>
                  </button>
                </div>
              </div>

              {tableLines.length >= 2 ? (
                renderMarkdownTable(tableLines)
              ) : (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-slate-800 whitespace-pre-wrap font-mono leading-relaxed">
                  {bodyText}
                </div>
              )}
            </div>
          );
        }

        // SECTION 7: PEDAGOGICAL SUMMARY NOTES & CORE CONCEPTS (STRICTLY NO FLASHCARDS, NO Q&A)
        if (isFlashcards) {
          const cards = detectedCards || [];
          const cleanTitle = (headerText || "Incamake y'Ingingo z'Ingenzi (Core Study Notes)")
            .replace(/Flashcards?\s*(d'Étude)?/gi, "Notes z'Incamake (Key Study Notes)")
            .replace(/🃏/g, '📚');

          return (
            <div key={sIdx} className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-orange-100 text-orange-700">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {cleanTitle}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Incamake y'Amasomo n'Ingingo z'Ingenzi (Summary Notes & Core Academic Concepts)
                    </p>
                  </div>
                </div>
              </div>

              {cards.length > 0 ? (
                <div className="space-y-3">
                  {cards.map((card, cIdx) => (
                    <div key={cIdx} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-2 hover:bg-orange-50/20 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase text-orange-600 bg-orange-100/80 px-2 py-0.5 rounded-md">
                          Ingingo #{cIdx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                          {card.front.replace(/^Qu'est-ce que\s+/i, '').replace(/\?$/, '')}
                        </h4>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
                        {card.back}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {bodyText.replace(/```json[\s\S]*?```/g, '').trim()}
                </div>
              )}
            </div>
          );
        }

        // SECTION 8: AI PPT OUTLINE
        if (isPpt) {
          const lines = bodyText.split('\n').filter(l => l.trim().length > 0);

          return (
            <div key={sIdx} className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                    <Presentation className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {headerText}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Presentation Structure & Visual Direction
                    </p>
                  </div>
                </div>

                {onRequestFullPpt && (
                  <button
                    onClick={onRequestFullPpt}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    📊 Generate Full 6 Slides
                  </button>
                )}
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <span className="font-black text-xs text-indigo-950 uppercase tracking-wide">
                    Slide Overview
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700">
                  {lines.map((l, lIdx) => (
                    <div key={lIdx} className="leading-relaxed">
                      {l.replace(/\*\*/g, '')}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        // GENERAL SECTION FALLBACK
        return (
          <div key={sIdx} className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            {headerText && (
              <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-2">
                {headerText}
              </h3>
            )}
            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-normal">
              {bodyText}
            </div>
          </div>
        );
      })}
    </div>
  );
};
