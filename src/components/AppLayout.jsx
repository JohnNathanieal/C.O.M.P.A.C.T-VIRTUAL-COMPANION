const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { Outlet, Link, useLocation } from 'react-router-dom';
import { MessageSquare, ListTodo, LogOut, Zap, Bell, StickyNote, Timer, Settings, BarChart3 } from 'lucide-react';

import { cn } from '@/lib/utils';
import ReminderChecker from './ReminderChecker';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { to: '/', icon: MessageSquare, label: 'Chat' },
  { to: '/tasks', icon: ListTodo, label: 'Tasks' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
  { to: '/notes', icon: StickyNote, label: 'Notes' },
  { to: '/stopwatch', icon: Timer, label: 'Stopwatch' },
  { to: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className="w-16 md:w-20 border-r border-border bg-card/50 flex flex-col items-center py-4 shrink-0">
        <div className="h-10 w-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mb-8" title="Namakshar">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <nav className="flex-1 flex flex-col items-center gap-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} title={label}
              className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                pathname === to ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
              <Icon className="h-5 w-5" />
            </Link>
          ))}
        </nav>
        <ThemeToggle />
        <button onClick={() => db.auth.logout()} title="Logout"
          className="h-10 w-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <ReminderChecker />
        <Outlet />
      </div>
    </div>
  );
}