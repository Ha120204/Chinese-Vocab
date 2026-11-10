'use client';

import { useEffect, useRef, useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { getChineseVoice, playWebSpeech, prepareVoices, waitForChineseVoice } from '@/lib/audio/web-speech';

type Playback = 'idle' | 'loading' | 'playing';
type Controller = { stop: () => void };

const guidance = 'Hãy thử Chrome, Edge hoặc điện thoại để nghe phát âm';
let activeController: Controller | null = null;

export function SpeechButton({ text, label = 'Nghe phát âm' }: { text: string; label?: string }) {
  const [playback, setPlayback] = useState<Playback>('idle');
  const [message, setMessage] = useState('');
  const requestId = useRef(0);
  const stopAudio = useRef<(() => void) | null>(null);
  const controller = useRef<Controller | null>(null);

  useEffect(() => {
    prepareVoices();
    return () => {
      requestId.current += 1;
      stopAudio.current?.();
      if (activeController === controller.current) activeController = null;
    };
  }, []);

  function stop() {
    requestId.current += 1;
    stopAudio.current?.();
    stopAudio.current = null;
    if (activeController === controller.current) activeController = null;
    controller.current = null;
    setPlayback('idle');
    setMessage('Đã dừng');
  }

  function finish(current: Controller, id: number, error = false) {
    if (requestId.current !== id) return;
    stopAudio.current = null;
    if (activeController === current) activeController = null;
    controller.current = null;
    setPlayback('idle');
    setMessage(error ? guidance : 'Đã phát xong');
  }

  function speak(voice: SpeechSynthesisVoice, current: Controller, id: number) {
    if (requestId.current !== id) return;
    try {
      stopAudio.current = playWebSpeech(text, voice, {
        onStart: () => {
          if (requestId.current !== id) return;
          setPlayback('playing');
          setMessage('');
          trackEvent('play_audio', { word: text });
        },
        onEnd: () => finish(current, id),
        onError: () => finish(current, id, true),
      });
    } catch {
      finish(current, id, true);
    }
  }

  function toggle() {
    if (controller.current) {
      stop();
      return;
    }
    activeController?.stop();
    const id = ++requestId.current;
    const current = { stop };
    controller.current = current;
    activeController = current;
    setPlayback('loading');
    setMessage('');

    // A loaded voice can start within the click gesture. The wait path handles browsers
    // that populate getVoices() later through voiceschanged.
    const voice = getChineseVoice();
    if (voice) {
      speak(voice, current, id);
      return;
    }
    void waitForChineseVoice().then(found => {
      if (requestId.current !== id) return;
      if (found) speak(found, current, id);
      else finish(current, id, true);
    });
  }

  const active = playback !== 'idle';
  return (
    <span className="speech-wrap">
      <button
        type="button"
        className="icon-button speech-button"
        aria-label={active ? 'Dừng phát âm' : label}
        aria-pressed={active}
        onClick={toggle}
      >
        {active ? <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg> : <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16 9a4 4 0 0 1 0 6M18.5 6a8 8 0 0 1 0 12" /></svg>}
      </button>
      {playback === 'loading' && <span className="speech-status" role="status">Đang chuẩn bị…</span>}
      {playback === 'playing' && <span className="speech-status" role="status">Đang phát</span>}
      {message && <span className={message === guidance ? 'speech-error' : 'speech-status'} role="status">{message}</span>}
    </span>
  );
}
