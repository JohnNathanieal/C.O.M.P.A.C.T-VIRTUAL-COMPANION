import { useRef, useEffect } from 'react';
import { getName } from '@/lib/voiceSettings';

function generateWakeWords(name) {
  const lower = (name || '').toLowerCase().trim();
  const words = [];
  if (lower) {
    words.push(`hey ${lower}`, `hello ${lower}`, `ok ${lower}`, `hi ${lower}`, lower);
    const firstPart = lower.split(' ')[0];
    if (firstPart.length >= 3) {
      words.push(`hey ${firstPart}`, `hello ${firstPart}`, firstPart);
    }
  }
  words.push('hey sir', 'sir', 'hey', 'hello');
  return words;
}

export function useWakeWord(enabled, onCommand, onStatus) {
  const enabledRef = useRef(enabled);
  const onCommandRef = useRef(onCommand);
  const onStatusRef = useRef(onStatus);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);
  useEffect(() => { onCommandRef.current = onCommand; }, [onCommand]);
  useEffect(() => { onStatusRef.current = onStatus; }, [onStatus]);

  useEffect(() => {
    if (!enabled) { onStatusRef.current?.('idle'); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { onStatusRef.current?.('unsupported'); return; }

    let recognition;
    let shouldRun = true;
    let restartTimer;

    const start = () => {
      if (!shouldRun || !enabledRef.current) return;
      try {
        recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => onStatusRef.current?.('listening');

        recognition.onresult = (event) => {
          const wakeWords = generateWakeWords(getName());
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (!event.results[i].isFinal) continue;
            const transcript = event.results[i][0].transcript.toLowerCase().trim();
            let command = transcript;
            for (const w of wakeWords) {
              if (transcript.startsWith(w)) { command = transcript.slice(w.length).trim(); break; }
            }
            if (command) onCommandRef.current(command);
          }
        };

        recognition.onerror = (e) => {
          if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
            onStatusRef.current?.('denied');
            shouldRun = false;
          }
        };

        recognition.onend = () => {
          if (shouldRun && enabledRef.current) {
            restartTimer = setTimeout(start, 300);
          }
        };

        onStatusRef.current?.('starting');
        recognition.start();
      } catch (err) {
        restartTimer = setTimeout(start, 1000);
      }
    };

    start();

    return () => {
      shouldRun = false;
      clearTimeout(restartTimer);
      try { recognition && recognition.stop(); } catch {}
      onStatusRef.current?.('idle');
    };
  }, [enabled]);

  return null;
}