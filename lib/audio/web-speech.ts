type SpeechCallbacks = {
  onStart: () => void;
  onEnd: () => void;
  onError: () => void;
};

let voices: SpeechSynthesisVoice[] = [];
let listening = false;
const voiceListeners = new Set<() => void>();
let active: { utterance: SpeechSynthesisUtterance; onEnd: () => void } | null = null;

function synthesis() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
}

function refreshVoices() {
  const available = synthesis()?.getVoices() ?? [];
  if (available.length) voices = available;
  for (const listener of voiceListeners) listener();
  return voices;
}

export function prepareVoices() {
  const synth = synthesis();
  if (!synth) return;
  if (!listening) {
    synth.addEventListener('voiceschanged', refreshVoices);
    listening = true;
  }
  refreshVoices();
}

function selectVoice(list: SpeechSynthesisVoice[]) {
  const preferred = (voice: SpeechSynthesisVoice) => /natural|online|google/i.test(voice.name);
  for (const locale of ['zh-cn', 'zh-tw']) {
    const matches = list.filter(voice => voice.lang.toLowerCase().replace('_', '-').startsWith(locale));
    if (matches.length) return matches.find(preferred) ?? matches[0];
  }
  return null;
}

export function waitForChineseVoice(timeoutMs = 2000): Promise<SpeechSynthesisVoice | null> {
  if (!synthesis()) return Promise.resolve(null);
  prepareVoices();
  const available = selectVoice(voices);
  if (available) return Promise.resolve(available);
  return new Promise(resolve => {
    let settled = false;
    const check = () => {
      const voice = selectVoice(voices);
      if (voice) finish(voice);
    };
    const finish = (voice: SpeechSynthesisVoice | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      voiceListeners.delete(check);
      resolve(voice);
    };
    const timer = window.setTimeout(() => {
      refreshVoices();
      finish(selectVoice(voices));
    }, timeoutMs);
    voiceListeners.add(check);
  });
}

export function getChineseVoice() {
  prepareVoices();
  return selectVoice(voices);
}

export function stopWebSpeech() {
  const current = active;
  active = null;
  if (current) {
    synthesis()?.cancel();
    current.onEnd();
  }
}

export function playWebSpeech(text: string, voice: SpeechSynthesisVoice, callbacks: SpeechCallbacks) {
  const synth = synthesis();
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') throw new Error('Web Speech unavailable');
  stopWebSpeech();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = 0.9;
  utterance.onstart = () => { if (active?.utterance === utterance) callbacks.onStart(); };
  utterance.onend = () => {
    if (active?.utterance !== utterance) return;
    active = null;
    callbacks.onEnd();
  };
  utterance.onerror = () => {
    if (active?.utterance !== utterance) return;
    active = null;
    callbacks.onError();
  };
  active = { utterance, onEnd: callbacks.onEnd };
  try { synth.speak(utterance); }
  catch (error) { active = null; throw error; }
  return () => { if (active?.utterance === utterance) stopWebSpeech(); };
}
