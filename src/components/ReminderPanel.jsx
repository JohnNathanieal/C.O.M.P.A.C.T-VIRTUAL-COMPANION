const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Bell, Check, Plus, Trash2, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function ReminderPanel() {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => db.entities.Reminder.list('-due_time'),
    refetchInterval: 30000,
  });

  const createR = useMutation({
    mutationFn: (data) => db.entities.Reminder.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reminders'] }); setTitle(''); setDue(''); },
  });
  const updateR = useMutation({
    mutationFn: ({ id, data }) => db.entities.Reminder.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  });
  const deleteR = useMutation({
    mutationFn: (id) => db.entities.Reminder.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  });

  const add = (e) => {
    e.preventDefault();
    if (!title.trim() || !due) return;
    createR.mutate({ title: title.trim(), due_time: new Date(due).toISOString(), completed: false, notified: false });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Reminders</h2>
        <form onSubmit={add} className="space-y-2">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Reminder title..."
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <div className="flex gap-2">
            <input type="datetime-local" value={due} onChange={e => setDue(e.target.value)}
              className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <Button type="submit" size="sm" disabled={!title.trim() || !due} className="rounded-lg"><Plus className="h-4 w-4" /></Button>
          </div>
        </form>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading && <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
        {!isLoading && reminders.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No reminders yet. Add one above or ask JARVIS!</p>}
        {reminders.map(r => {
          const overdue = !r.completed && r.due_time && new Date(r.due_time) <= new Date();
          return (
            <div key={r.id} className="group flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors">
              <button onClick={() => updateR.mutate({ id: r.id, data: { completed: !r.completed } })} className="mt-0.5 shrink-0">
                <Check className={cn("h-5 w-5", r.completed ? "text-primary" : "text-muted-foreground hover:text-primary")} />
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", r.completed && "line-through text-muted-foreground")}>{r.title}</p>
                <p className={cn("text-xs mt-0.5 flex items-center gap-1", overdue ? "text-destructive" : "text-muted-foreground")}>
                  <Clock className="h-3 w-3" /> {r.due_time ? new Date(r.due_time).toLocaleString() : 'No time set'}
                </p>
              </div>
              <button onClick={() => deleteR.mutate(r.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}