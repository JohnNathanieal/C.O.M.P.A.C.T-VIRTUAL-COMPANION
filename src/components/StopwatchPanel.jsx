import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StopwatchPanel() {
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    if (running) {
      const start = Date.now() - ms;
      ref.current = setInterval(() => setMs(Date.now() - start), 31);
    } else {
      clearInterval(ref.current);
    }
    return () => clearInterval(ref.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const fmt = (t) => {
    const m = Math.floor(t / 60000);
    const s = Math.floor((t % 60000) / 1000);
    const cs = Math.floor((t % 1000) / 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Stopwatch</h2>
      <div className="text-5xl font-mono font-bold text-primary mb-8 tabular-nums">{fmt(ms)}</div>
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <Button onClick={() => setRunning(r => !r)} className="rounded-xl px-6">
          {running ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Start</>}
        </Button>
        <Button variant="outline" onClick={() => setLaps(l => [fmt(ms), ...l])} disabled={!running} className="rounded-xl">
          <Flag className="h-4 w-4" /> Lap
        </Button>
        <Button variant="outline" onClick={() => { setRunning(false); setMs(0); setLaps([]); }} className="rounded-xl">
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
      </div>
      {laps.length > 0 && (
        <div className="w-full max-w-xs space-y-1">
          {laps.map((l, i) => (
            <div key={i} className="flex justify-between text-sm text-muted-foreground px-3 py-1.5 rounded-lg bg-secondary">
              <span>Lap {laps.length - i}</span>
              <span className="font-mono">{l}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}