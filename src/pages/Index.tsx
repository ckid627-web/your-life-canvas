import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardPage from '@/pages/DashboardPage';
import GoalsPage from '@/pages/GoalsPage';
import DailyFocusPage from '@/pages/DailyFocusPage';
import JournalPage from '@/pages/JournalPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import AIAssistantPage from '@/pages/AIAssistantPage';
import SettingsPage from '@/pages/SettingsPage';
import type { Page } from '@/lib/types';

export default function Index() {
  const [page, setPage] = useState<Page>('dashboard');

  const pages: Record<Page, React.ReactNode> = {
    'dashboard': <DashboardPage />,
    'goals': <GoalsPage />,
    'daily-focus': <DailyFocusPage />,
    'journal': <JournalPage />,
    'analytics': <AnalyticsPage />,
    'ai-assistant': <AIAssistantPage />,
    'settings': <SettingsPage />,
  };

  return (
    <AppLayout currentPage={page} onPageChange={setPage}>
      {pages[page]}
    </AppLayout>
  );
}
