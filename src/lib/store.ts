import { Goal, JournalEntry, Task, DailyLog } from './types';

const GOALS_KEY = 'lifetrack_goals';
const JOURNAL_KEY = 'lifetrack_journal';
const CATEGORIES_KEY = 'lifetrack_categories';
const DAILY_LOGS_KEY = 'lifetrack_daily_logs';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Goals
export function getGoals(): Goal[] { return load(GOALS_KEY, []); }
export function saveGoals(goals: Goal[]) { save(GOALS_KEY, goals); }
export function addGoal(goal: Goal) { const g = getGoals(); g.push(goal); saveGoals(g); }
export function updateGoal(goal: Goal) { saveGoals(getGoals().map(g => g.id === goal.id ? goal : g)); }
export function deleteGoal(id: string) { saveGoals(getGoals().filter(g => g.id !== id)); }

// Journal
export function getJournalEntries(): JournalEntry[] { return load(JOURNAL_KEY, []); }
export function saveJournalEntries(entries: JournalEntry[]) { save(JOURNAL_KEY, entries); }
export function addJournalEntry(entry: JournalEntry) { const e = getJournalEntries(); e.unshift(entry); saveJournalEntries(e); }
export function deleteJournalEntry(id: string) { saveJournalEntries(getJournalEntries().filter(e => e.id !== id)); }

// Categories
export function getCategories(): string[] { return load(CATEGORIES_KEY, ['Health', 'Career', 'Finance', 'Education', 'Personal', 'Relationships']); }
export function saveCategories(cats: string[]) { save(CATEGORIES_KEY, cats); }

// Daily Logs
export function getDailyLogs(): DailyLog[] { return load(DAILY_LOGS_KEY, []); }
export function saveDailyLog(log: DailyLog) {
  const logs = getDailyLogs();
  const idx = logs.findIndex(l => l.date === log.date);
  if (idx >= 0) logs[idx] = log; else logs.push(log);
  save(DAILY_LOGS_KEY, logs);
}

// Computed
export function getTodaysTasks(): Task[] {
  const today = new Date().toISOString().split('T')[0];
  const goals = getGoals();
  const tasks: Task[] = [];
  for (const goal of goals) {
    for (const m of goal.milestones) {
      for (const t of m.tasks) {
        if (t.date === today) tasks.push(t);
      }
    }
  }
  return tasks;
}

export function getCompletionRate(goal: Goal): number {
  const allTasks = goal.milestones.flatMap(m => m.tasks);
  if (allTasks.length === 0) return 0;
  return Math.round((allTasks.filter(t => t.completed).length / allTasks.length) * 100);
}

export function getLifeScore(): number {
  const goals = getGoals();
  if (goals.length === 0) return 0;
  const avgCompletion = goals.reduce((sum, g) => sum + getCompletionRate(g), 0) / goals.length;
  const logs = getDailyLogs();
  const recent = logs.slice(-7);
  const consistency = recent.length > 0
    ? recent.filter(l => l.tasksTotal > 0 && l.tasksCompleted / l.tasksTotal >= 0.5).length / Math.max(recent.length, 1) * 100
    : 0;
  return Math.round((avgCompletion * 0.6 + consistency * 0.4));
}

export function getStreak(): number {
  const logs = getDailyLogs().sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < logs.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    const expectedStr = expected.toISOString().split('T')[0];
    const log = logs.find(l => l.date === expectedStr);
    if (log && log.tasksTotal > 0 && log.tasksCompleted > 0) streak++;
    else break;
  }
  return streak;
}
