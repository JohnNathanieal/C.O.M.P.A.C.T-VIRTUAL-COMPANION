const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery } from '@tanstack/react-query';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CheckCircle2, Circle, Clock, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => db.entities.Task.list('-created_date'),
  });

  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const total = tasks.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const chartData = [
    { name: 'Completed', value: completed, cssVar: '--chart-2' },
    { name: 'Pending', value: pending, cssVar: '--chart-3' },
    { name: 'In Progress', value: inProgress, cssVar: '--chart-1' },
  ].filter((d) => d.value > 0);

  const stats = [
    { label: 'Total', value: total, icon: TrendingUp, cssVar: '--foreground' },
    { label: 'Completed', value: completed, icon: CheckCircle2, cssVar: '--chart-2' },
    { label: 'In Progress', value: inProgress, icon: Clock, cssVar: '--chart-1' },
    { label: 'Pending', value: pending, icon: Circle, cssVar: '--chart-3' },
  ];

  return (