const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { CheckCircle2, Circle, Clock, Plus, Trash2, Loader2, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import TaskStatusChart from './TaskStatusChart';

const priorityColors = {
  high: 'text-destructive',
  medium: 'text-yellow-500',
  low: 'text-primary',
};

const statusIcons = {
  pending: Circle,
  in_progress: Clock,
  completed: CheckCircle2,
};

export default function TaskPanel() {
  const qc = useQueryClient();
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(new Set());

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => db.entities.Task.list('-created_date'),
  });

  const createTask = useMutation({
    mutationFn: (data) => db.entities.Task.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); setNewTask(''); },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }) => db.entities.Task.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteTask = useMutation({
    mutationFn: (id) => db.entities.Task.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const bulkComplete = useMutation({
    mutationFn: (ids) => db.entities.Task.updateMany({ id: { $in: ids } }, { $set: { status: 'completed' } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); setSelected(new Set()); },
  });

  const bulkDelete = useMutation({
    mutationFn: (ids) => db.entities.Task.deleteMany({ id: { $in: ids } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); setSelected(new Set()); },
  });

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  const cycleStatus = (task) => {
    const next = { pending: 'in_progress', in_progress: 'completed', completed: 'pending' };
    updateTask.mutate({ id: task.id, data: { status: next[task.status] } });
  };

  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((t) => t.id)));
  };

  const selectedIds = [...selected];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3">Tasks</h2>
        <form onSubmit={(e) => { e.preventDefault(); if (newTask.trim()) createTask.mutate({ title: newTask.trim(), status: 'pending', priority: 'medium' }); }}
          className="flex gap-2">
          <input value={newTask} onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <Button type="submit" size="sm" disabled={!newTask.trim()} className="rounded-lg">
            <Plus className="h-4 w-4" />
          </Button>
        </form>
        <div className="flex gap-1 mt-3">
          {['all', 'pending', 'in_progress', 'completed'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-3 py-1 rounded-full text-xs transition-colors capitalize",
                filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary")}>
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="px-4 pt-4">
          <TaskStatusChart tasks={tasks} />
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-primary/5">
          <span className="text-xs text-primary font-medium">{selectedIds.length} selected</span>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => bulkComplete.mutate(selectedIds)} disabled={bulkComplete.isPending}>
            <CheckSquare className="h-3 w-3" /> Complete
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => bulkDelete.mutate(selectedIds)} disabled={bulkDelete.isPending}>
            <Trash2 className="h-3 w-3" /> Delete
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs ml-auto" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading && <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
        {!isLoading && filtered.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-8">No tasks yet. Add one above or ask Namakshar!</p>
        )}
        {!isLoading && filtered.length > 0 && (
          <button onClick={toggleSelectAll} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
            {selected.size === filtered.length ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
            {selected.size === filtered.length ? 'Deselect all' : 'Select all'}
          </button>
        )}
        {filtered.map((task) => {
          const Icon = statusIcons[task.status] || Circle;
          const isSelected = selected.has(task.id);
          return (
            <div key={task.id} className={cn("group flex items-start gap-2 p-3 rounded-xl border bg-card hover:border-primary/20 transition-colors", isSelected ? "border-primary/40 bg-primary/5" : "border-border")}>
              <button onClick={() => toggleSelect(task.id)} className="mt-0.5 shrink-0">
                {isSelected ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5 text-muted-foreground hover:text-primary" />}
              </button>
              <button onClick={() => cycleStatus(task)} className="mt-0.5 shrink-0">
                <Icon className={cn("h-5 w-5 transition-colors", task.status === 'completed' ? 'text-primary' : 'text-muted-foreground hover:text-primary')} />
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", task.status === 'completed' && 'line-through text-muted-foreground')}>
                  {task.title}
                </p>
                {task.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn("text-xs font-medium capitalize", priorityColors[task.priority])}>{task.priority}</span>
                  {task.due_date && <span className="text-xs text-muted-foreground">{new Date(task.due_date).toLocaleDateString()}</span>}
                </div>
              </div>
              <button onClick={() => deleteTask.mutate(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}