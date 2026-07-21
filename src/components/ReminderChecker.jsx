const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';
import { speak } from '@/lib/tts';

export default function ReminderChecker() {
  const qc = useQueryClient();
  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => db.entities.Reminder.list('-due_time'),
    refetchInterval: 30000,
  });

  useEffect(() => {
    const now = new Date();
    reminders.forEach(r => {
      if (!r.completed && !r.notified && r.due_time && new Date(r.due_time) <= now) {
        const msg = `Sir, your reminder: ${r.title}`;
        toast(`⏰ ${msg}`, { duration: 10000 });
        speak(msg);
        db.entities.Reminder.update(r.id, { notified: true });
        qc.invalidateQueries({ queryKey: ['reminders'] });
      }
    });
  }, [reminders, qc]);

  return null;
}