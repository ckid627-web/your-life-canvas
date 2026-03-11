export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  notes: string;
  createdAt: string;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  weekNumber: number;
  completed: boolean;
  tasks: Task[];
}

export interface Task {
  id: string;
  milestoneId: string;
  goalId: string;
  title: string;
  completed: boolean;
  date: string;
  order: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  tags: string[];
  linkedGoalId?: string;
  createdAt: string;
}

export interface DailyLog {
  date: string;
  tasksCompleted: number;
  tasksTotal: number;
}

export type Page = 'dashboard' | 'goals' | 'daily-focus' | 'journal' | 'analytics' | 'ai-assistant' | 'settings';
