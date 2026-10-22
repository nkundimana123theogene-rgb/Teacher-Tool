/**
 * Robotic Audio & Speech Engine for Offline Network Alert
 * Plays: "No internet connection. Please search for internet connection."
 */

let isSpeakingActive = false;
const speechListeners: Array<(isSpeaking: boolean) => void> = [];

export function subscribeToRobotSpeechState(callback: (isSpeaking: boolean) => void): () => void {
  speechListeners.push(callback);
  callback(isSpeakingActive);
  return () => {
    const idx = speechListeners.indexOf(callback);
    if (idx !== -1) speechListeners.splice(idx, 1);
  };
}

function setSpeaking(active: boolean) {
  isSpeakingActive = active;
  speechListeners.forEach((fn) => fn(active));
}

/**
 * Play robotic beeps / sound effects using Web Audio API
 */
export function playRobotCyberChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // AudioContext may be blocked before user gesture
  }
}

/**
 * Play a cheerful, celebratory cyber chime when connection is restored
 */
export function playRobotOnlineSuccessChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    // Ascending celebratory robotic chime: C5 -> E5 -> G5 -> C6
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.3);
    });
  } catch {
    // AudioContext may be blocked
  }
}

/**
 * Speak online restoration alert: "Good Job! Now You're Online!"
 */
export function speakRobotOnlineSuccess(customText?: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    const textToSpeak = customText || "Good Job! Now You're Online!";

    // Play cheerful chime
    playRobotOnlineSuccessChime();

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 1.0;
        utterance.pitch = 1.15; // Cheerful, higher tone
        utterance.lang = 'en-US';

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Google') ||
             v.name.includes('Samantha') ||
             v.name.includes('Alex') ||
             v.name.includes('Natural'))
        ) || voices.find((v) => v.lang.startsWith('en'));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => {
          setSpeaking(false);
          resolve();
        };
        utterance.onerror = () => {
          setSpeaking(false);
          resolve();
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        console.warn('Speech synthesis error:', err);
        setSpeaking(false);
        resolve();
      }
    } else {
      resolve();
    }
  });
}

/**
 * Speak the alert line: "Now! You're Offline. No internet connection. Please search for internet connection."
 * with robotic pitch and cadence.
 */
export function speakRobotOfflineAlert(customText?: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    const textToSpeak = customText || "Now! You're Offline. No internet connection. Please search for internet connection.";

    // Play cyber chime before speech
    playRobotCyberChime();

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // cancel any ongoing speech

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 0.92; // Slightly measured robotic speed
        utterance.pitch = 1.05; // Robotic tonal range
        utterance.lang = 'en-US';

        // Prefer English / robotic-sounding voices if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Google') ||
             v.name.includes('Samantha') ||
             v.name.includes('Alex') ||
             v.name.includes('Daniel') ||
             v.name.includes('Natural') ||
             v.name.includes('David'))
        ) || voices.find((v) => v.lang.startsWith('en'));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
          setSpeaking(true);
        };

        utterance.onend = () => {
          setSpeaking(false);
          resolve();
        };

        utterance.onerror = () => {
          setSpeaking(false);
          resolve();
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        console.warn('Speech synthesis error:', err);
        setSpeaking(false);
        resolve();
      }
    } else {
      resolve();
    }
  });
}

export function stopRobotSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  setSpeaking(false);
}
