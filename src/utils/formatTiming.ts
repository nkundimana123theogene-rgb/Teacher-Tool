import { CbcLanguage } from '../data/cbcSheetLabels';

/**
 * Normalizes and formats lesson plan duration according to target language:
 * - Kinyarwanda: "Iminota 40"
 * - Français: "40 Min"
 * - Kiswahili: "Dakika 40"
 * - English: "40 min"
 */
export const formatDurationForLanguage = (
  val: string | undefined | null,
  lang: CbcLanguage = 'Kinyarwanda'
): string => {
  if (!val || typeof val !== 'string') {
    if (lang === 'Kinyarwanda') return 'Iminota 40';
    if (lang === 'Français') return '40 Min';
    if (lang === 'Kiswahili') return 'Dakika 40';
    return '40 min';
  }
  const match = val.match(/\d+/);
  const num = match ? match[0] : '40';
  if (lang === 'Kinyarwanda') return `Iminota ${num}`;
  if (lang === 'Français') return `${num} Min`;
  if (lang === 'Kiswahili') return `Dakika ${num}`;
  return `${num} min`;
};

/**
 * Normalizes and formats pedagogical step timing according to target language:
 * - Kinyarwanda: "Iminota 10" / "Iminota 20"
 * - Français: "10 Min" / "20 Min"
 * - Kiswahili: "Dakika 10" / "Dakika 20"
 * - English: "10 min" / "20 min"
 */
export const formatTimingForLanguage = (
  val: string | undefined | null,
  fallbackNum: number,
  lang: CbcLanguage = 'Kinyarwanda'
): string => {
  if (!val || typeof val !== 'string') {
    if (lang === 'Kinyarwanda') return `Iminota ${fallbackNum}`;
    if (lang === 'Français') return `${fallbackNum} Min`;
    if (lang === 'Kiswahili') return `Dakika ${fallbackNum}`;
    return `${fallbackNum} min`;
  }
  const match = val.match(/\d+/);
  const num = match ? match[0] : fallbackNum.toString();
  if (lang === 'Kinyarwanda') return `Iminota ${num}`;
  if (lang === 'Français') return `${num} Min`;
  if (lang === 'Kiswahili') return `Dakika ${num}`;
  return `${num} min`;
};
