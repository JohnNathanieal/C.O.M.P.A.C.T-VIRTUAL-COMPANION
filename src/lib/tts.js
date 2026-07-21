import { getVoiceProfile } from '@/lib/voiceSettings';

const MALE_VOICES = [
  'Google UK English Male',
  'Microsoft David',
  'Microsoft Mark',
  'Microsoft Guy',
  'Daniel',
  'Alex',
  'Arthur',
  'Rishi',
];

const FEMALE_VOICES = [
  'Google US English',
  'Google UK English Female',
  'Samantha',
  'Karen',
  'Moira',
  'Tessa',
  'Fiona',
  'Microsoft Aria',
  'Microsoft Jenny',
  'Microsoft Zira',
  'Victoria',
  'Susan',
];

let cachedVoice = null;
let cachedGender = null;

function pickVoice(gender) {
  if (cachedVoice && cachedGender === gender) return cachedVoice;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const preferred = gender === 'male' ? MALE_VOICES : FEMALE_VOICES;
  for (const name of preferred) {
    const match = voices.find((v) => v.name.includes(name));
    if (match) { cachedVoice = match; cachedGender = gender; return match; }
  }
  const enVoice = voices.find((v) => v.lang.startsWith('en'));
  const fallback = enVoice || voices[0];
  cachedVoice = fallback;
  cachedGender = gender;
  return fallback;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => { cachedVoice = null; cachedGender = null; };
}

function cleanText(text) {
  return String(text)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_#`>]/g, '')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function speak(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const clean = cleanText(text);
  if (!clean) return;
  const profile = getVoiceProfile();
  const voice = pickVoice(profile.gender);
  const sentences = splitSentences(clean);
  const baseRate = profile.rate * profile.speed;

  sentences.forEach((sentence, i) => {
    const utter = new SpeechSynthesisUtterance(sentence);
    if (voice) utter.voice = voice;
    utter.rate = Math.min(Math.max(baseRate + (i > 0 ? (Math.random() * 0.03 - 0.015) : 0), 0.5), 1.8);
    utter.pitch = profile.pitch;
    utter.volume = 1;
    window.speechSynthesis.speak(utter);
  });
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}