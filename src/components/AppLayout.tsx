import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Target, CalendarCheck, BookOpen, BarChart3, Bot, Settings, Menu, X } from 'lucide-react';
import type { Page } from '@/lib/types';

interface AppLayoutProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  children: React.ReactNode;
}

const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { page: 'goals', label: 'Goals', icon: <Target size={20} /> },
  { page: 'daily-focus', label: 'Daily Focus', icon: <CalendarCheck size={20} /> },
  { page: 'journal', label: 'Journal', icon: <BookOpen size={20} /> },
  { page: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
  { page: 'ai-assistant', label: 'AI Assistant', icon: <Bot size={20} /> },
  { page: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

export default function AppLayout({ currentPage, onPageChange, children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-sidebar p-6 gap-1">
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-tight text-foreground">LifeTrack</h1>
          <p className="text-xs text-muted-foreground mt-1">Your personal life dashboard</p>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(item => (
            <button
              key={item.page}
              onClick={() => onPageChange(item.page)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
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
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">LifeTrack</h1>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-accent text-foreground">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-16"
          >
            <nav className="flex flex-col gap-1 p-4">
              {navItems.map(item => (
                <button
                  key={item.page}
                  onClick={() => { onPageChange(item.page); setMobileOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all ${
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
