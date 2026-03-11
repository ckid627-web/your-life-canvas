import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Flame, TrendingUp, Calendar } from 'lucide-react';
import { getGoals, saveGoals, getStreak, saveDailyLog, getDailyLogs } from '@/lib/store';
import { Task } from '@/lib/types';
import StatCard from '@/components/StatCard';
import StreakDots from '@/components/StreakDots';

export default function DailyFocusPage() {
  const today = new Date().toISOString().split('T')[0];
  const [goals, setGoals] = useState(getGoals);
  const logs = getDailyLogs();

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

  // Week days for date strip
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + i);
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      day: d.getDate(),
      isToday: d.toISOString().split('T')[0] === today,
      date: d.toISOString().split('T')[0],
    };
  });

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display text-foreground">Daily Focus</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {total > 0
            ? `${completed} of ${total} tasks done · ${pct}% on track`
            : 'No tasks scheduled for today'}
        </p>
      </div>

      {/* Date Strip */}
      <div className="flex items-center justify-between card-elevated p-3">
        {weekDays.map(d => (
          <div
            key={d.date}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              d.isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            <span className="text-[10px] font-medium uppercase">{d.label}</span>
            <span className={`text-sm font-bold ${d.isToday ? '' : 'font-display'}`}>{d.day}</span>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard title="Today" value={`${completed}/${total}`} subtitle={`${pct}% done`} icon={<CheckCircle2 size={16} />} />
        <StatCard title="Week" value={`${weekPct}%`} subtitle={`${weekCompleted}/${weekTasks.length}`} icon={<TrendingUp size={16} />} />
        <StatCard title="Streak" value={`${streak}d`} icon={<Flame size={16} />} accent />
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Daily Progress</span>
            <span className="text-xs font-bold text-primary">{pct}% completed</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <motion.div
              className="h-3 rounded-full"
              style={{ background: 'linear-gradient(90deg, hsl(75 85% 55%), hsl(85 80% 65%))' }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Tasks */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Today</h2>
        <div className="space-y-2">
          {todayTasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
                task.completed
                  ? 'bg-primary/5 border border-primary/10'
                  : 'card-elevated hover:border-primary/20'
              }`}
              onClick={() => toggleTask(task.id)}
            >
              <button className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                task.completed ? 'bg-primary border-primary' : 'border-muted-foreground/30 hover:border-primary/50'
              }`}>
                {task.completed && <span className="text-primary-foreground text-xs">✓</span>}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {task.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{task.goalTitle}</p>
              </div>
            </motion.div>
          ))}
          {todayTasks.length === 0 && (
            <div className="card-elevated p-12 text-center">
              <Calendar size={24} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">No tasks for today. Add tasks with today's date in Goals.</p>
            </div>
          )}
        </div>
      </div>

      {/* Completed section */}
      {completed > 0 && (
        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            Completed {completed} task{completed > 1 ? 's' : ''} today
          </p>
        </div>
      )}
    </div>
  );
}
