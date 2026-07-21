import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { speak, stopSpeaking } from '@/lib/tts';

const PHRASES = [
  'Please wait, sir',
  'Checking on it',
  'Just a moment, Boss',
  'Working on it',
  'Right away, sir',
  'Allow me a second',
  'On it',
];

export default function ProcessingIndicator() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    speak(PHRASES[0]);
    const t = setInterval(() => {
      setIdx((i) => {
        const next = (i + 1) % PHRASES.length;
        speak(PHRASES[next]);
        return next;
      });
    }, 3000);
    return () => { clearInterval(t); stopSpeaking(); };
  }, []);

  return (
    <div className="flex gap-3">
      <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
        <Loader2 className="h-4 w-4 text-primary animate-spin" />
      </div>
      <div className="bg-card border border-border rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-muted-foreground">{PHRASES[idx]}…</span>
        </div>
      </div>
    </div>
  );
}