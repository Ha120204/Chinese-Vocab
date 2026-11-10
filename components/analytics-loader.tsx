'use client';

import { useEffect, useState } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { flushQueuedEvents } from '@/lib/analytics';

export function AnalyticsLoader({ gaId }: { gaId: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const start = () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
      setEnabled(true);
    };
    const timer = window.setTimeout(start, 7000);
    window.addEventListener('pointerdown', start, { once: true, passive: true });
    window.addEventListener('keydown', start, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const poll = window.setInterval(() => {
      if (flushQueuedEvents()) window.clearInterval(poll);
    }, 100);
    return () => window.clearInterval(poll);
  }, [enabled]);

  return enabled ? <GoogleAnalytics gaId={gaId}/> : null;
}
