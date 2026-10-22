import { PaymentNotification } from '../types';

/**
 * Synthesizes a celebratory 2-tone payment sound via Web Audio API.
 * Does not require external audio files and works instantly in modern browsers.
 */
export const playPaymentChimeSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Tone 1: C5 (523.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Tone 2: G5 (783.99 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + 0.12);
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    // Audio context may be restricted by autoplay policy until user gesture
  }
};

/**
 * Fetches notifications for a given user or admin
 */
export const fetchNotificationsApi = async (
  email?: string,
  phone?: string,
  role?: string
): Promise<{ notifications: PaymentNotification[]; unreadCount: number }> => {
  try {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (phone) params.append('phone', phone);
    if (role) params.append('role', role);

    const res = await fetch(`/api/notifications?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    return {
      notifications: data.notifications || [],
      unreadCount: Number(data.unreadCount || 0)
    };
  } catch (e) {
    return { notifications: [], unreadCount: 0 };
  }
};

/**
 * Mark a single notification or all as read
 */
export const markNotificationReadApi = async (
  id?: string,
  all?: boolean,
  email?: string,
  role?: string
) => {
  try {
    await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, all, email, role })
    });
  } catch (e) {}
};

/**
 * Simulate a payment notification for testing
 */
export const simulateTestNotificationApi = async (params: {
  phone?: string;
  email?: string;
  name?: string;
  amount?: number;
  plans?: number;
}) => {
  try {
    const res = await fetch('/api/notifications/simulate-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await res.json();
  } catch (e) {
    return { success: false };
  }
};
