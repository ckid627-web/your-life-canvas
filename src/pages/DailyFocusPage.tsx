import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Flame, TrendingUp } from 'lucide-react';
import { getGoals, saveGoals, getStreak, saveDailyLog, getCompletionRate } from '@/lib/store';
import { Task } from '@/lib/types';
import StatCard from '@/components/StatCard';

export default function DailyFocusPage() {
  const today = new Date().toISOString().split('T')[0];
  const [goals, setGoals] = useState(getGoals);

  const todayTasks: (Task & { goalTitle: string })[] = [];
  for (const goal of goals) {
    for (const m of goal.milestones) {
      for (const t of m.tasks) {
        if (t.date === today) todayTasks.push({ ...t, goalTitle: goal.title });
      }
    }
  }

  const completed = todayTasks.filter(t => t.completed).length;
  const total = todayTasks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const streak = getStreak();

  useEffect(() => {
    saveDailyLog({ date: today, tasksCompleted: completed, tasksTotal: total });
  }, [completed, total, today]);

  function toggleTask(taskId: string) {
    const updated = goals.map(g => ({
      ...g,
      milestones: g.milestones.map(m => ({
        ...m,
        tasks: m.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t),
      })),
    }));
    saveGoals(updated);
    setGoals(updated);
  }

  // Weekly progress
  const weekTasks: Task[] = [];
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  for (const goal of goals) {
    for (const m of goal.milestones) {
      for (const t of m.tasks) {
        const d = new Date(t.date);
        if (d >= weekStart && d <= new Date()) weekTasks.push(t);
      }
    }
  }
  const weekCompleted = weekTasks.filter(t => t.completed).length;
  const weekPct = weekTasks.length > 0 ? Math.round((weekCompleted / weekTasks.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Daily Focus</h1>
        <p className="text-muted-foreground mt-1">
          {total > 0
            ? `You completed ${completed} of ${total} tasks today. You are ${pct}% on track.`
            : 'No tasks scheduled for today. Add tasks to your goals!'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Today" value={`${completed}/${total}`} subtitle={`${pct}% done`} icon={<CheckCircle2 size={20} />} />
        <StatCard title="This Week" value={`${weekPct}%`} subtitle={`${weekCompleted}/${weekTasks.length} tasks`} icon={<TrendingUp size={20} />} />
        <StatCard title="Streak" value={`${streak} days`} subtitle="Keep pushing!" icon={<Flame size={20} />} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Today's Tasks</h2>
        <div className="space-y-2">
          {todayTasks.map(task => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 bg-card rounded-xl border border-border p-4 card-hover cursor-pointer"
              onClick={() => toggleTask(task.id)}
            >
              {task.completed
                ? <CheckCircle2 size={20} className="text-success shrink-0" />
                : <Circle size={20} className="text-muted-foreground shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {task.title}
                </p>
                <p className="text-xs text-muted-foreground">{task.goalTitle}</p>
              </div>
            </motion.div>
          ))}
          {todayTasks.length === 0 && (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <p className="text-muted-foreground text-sm">No tasks for today. Go to Goals to add tasks with today's date.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
