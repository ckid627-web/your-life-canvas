import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Target, CalendarCheck, BookOpen, BarChart3, Bot, Settings, Menu, X, Zap } from 'lucide-react';
import type { Page } from '@/lib/types';

interface AppLayoutProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  children: React.ReactNode;
}

const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { page: 'goals', label: 'Goals', icon: <Target size={18} /> },
  { page: 'daily-focus', label: 'Daily Focus', icon: <CalendarCheck size={18} /> },
  { page: 'journal', label: 'Journal', icon: <BookOpen size={18} /> },
  { page: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  { page: 'ai-assistant', label: 'AI Coach', icon: <Bot size={18} /> },
  { page: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

export default function AppLayout({ currentPage, onPageChange, children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-sidebar p-5 gap-1">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Zap size={16} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold font-display text-foreground tracking-tight">LifeTrack</h1>
          </div>
        </div>
        <nav className="flex flex-col gap-0.5 flex-1">
          {navItems.map(item => (
            <button
              key={item.page}
              onClick={() => onPageChange(item.page)}
              className={currentPage === item.page ? 'nav-item-active' : 'nav-item-inactive'}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-border">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">U</span>
            </div>
            <span className="text-xs text-muted-foreground">Personal</span>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Zap size={14} className="text-primary-foreground" />
          </div>
          <h1 className="text-base font-bold font-display text-foreground">LifeTrack</h1>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-xl hover:bg-accent text-foreground">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-40 bg-background/98 backdrop-blur-xl pt-16"
          >
            <nav className="flex flex-col gap-1 p-4">
              {navItems.map(item => (
                <button
                  key={item.page}
                  onClick={() => { onPageChange(item.page); setMobileOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                    currentPage === item.page
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:max-h-screen">
        <div className="pt-16 md:pt-0 p-4 md:p-8 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
