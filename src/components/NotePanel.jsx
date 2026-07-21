const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Plus, Trash2, Loader2, StickyNote, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function NotePanel() {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: () => db.entities.Note.list('-updated_date'),
  });

  const createNote = useMutation({
    mutationFn: (data) => db.entities.Note.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes'] }); reset(); },
  });
  const updateNote = useMutation({
    mutationFn: ({ id, data }) => db.entities.Note.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes'] }); reset(); },
  });
  const deleteNote = useMutation({
    mutationFn: (id) => db.entities.Note.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  });

  const reset = () => { setTitle(''); setContent(''); setEditingId(null); };

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const data = { title: title.trim(), content: content.trim() };
    if (editingId) updateNote.mutate({ id: editingId, data });
    else createNote.mutate(data);
  };

  const edit = (n) => { setEditingId(n.id); setTitle(n.title); setContent(n.content || ''); };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><StickyNote className="h-5 w-5 text-primary" /> Notes</h2>
        <form onSubmit={submit} className="space-y-2">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title..."
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your note..." rows={3}
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={!title.trim()} className="rounded-lg">{editingId ? 'Update' : 'Add note'}</Button>
            {editingId && <Button type="button" variant="outline" size="sm" onClick={reset} className="rounded-lg">Cancel</Button>}
          </div>
        </form>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading && <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
        {!isLoading && notes.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No notes yet. Add one above or ask JARVIS!</p>}
        {notes.map(n => (
          <div key={n.id} className="group p-3 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">{n.title}</h3>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => edit(n)}><Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" /></button>
                <button onClick={() => deleteNote.mutate(n.id)}><Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" /></button>
              </div>
            </div>
            {n.content && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{n.content}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}