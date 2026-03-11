import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Flame, CheckCircle2, TrendingUp, ArrowUpRight } from 'lucide-react';
import StatCard from '@/components/StatCard';
import CircularProgress from '@/components/CircularProgress';
import StreakDots from '@/components/StreakDots';
import { getGoals, getLifeScore, getStreak, getTodaysTasks, getCompletionRate, getDailyLogs } from '@/lib/store';

export default function DashboardPage() {
  const [goals] = useState(getGoals);
  const todayTasks = getTodaysTasks();
  const completedToday = todayTasks.filter(t => t.completed).length;
  const lifeScore = getLifeScore();
  const streak = getStreak();
  const logs = getDailyLogs();

  // Build streak dots for last 7 days
  const streakDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const log = logs.find(l => l.date === dateStr);
    return {
      date: dateStr,
      completed: log ? log.tasksCompleted > 0 && log.tasksCompleted >= log.tasksTotal * 0.5 : false,
      hasData: !!log && log.tasksTotal > 0,
    };
  });

  const topGoals = goals.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold font-display text-foreground"
        >
          Good {getGreeting()} 👋
        </motion.h1>
        <p className="text-muted-foreground mt-1 text-sm">Here's your momentum overview</p>
      </div>

      {/* Momentum + Key Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Momentum Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="card-elevated p-6 flex flex-col items-center justify-center gap-4"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Momentum</p>
          <CircularProgress value={lifeScore} size={150} strokeWidth={12} />
          <p className="text-xs text-primary font-medium">
            {lifeScore >= 70 ? '🔥 On fire!' : lifeScore >= 40 ? '📈 Building up' : '🌱 Just starting'}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <StatCard
            title="Today's Tasks"
            value={`${completedToday}/${todayTasks.length}`}
            subtitle={todayTasks.length > 0 ? `${Math.round((completedToday / todayTasks.length) * 100)}% done` : 'No tasks'}
            icon={<CheckCircle2 size={18} />}
          />
          <StatCard
            title="Current Streak"
            value={`${streak} days`}
            subtitle="Consistency is key"
            icon={<Flame size={18} />}
            accent
          />
          <StatCard
            title="Active Goals"
            value={goals.length}
            subtitle={`${goals.filter(g => getCompletionRate(g) >= 100).length} completed`}
            icon={<Target size={18} />}
          />
          <StatCard
            title="Completion Rate"
            value={goals.length > 0 ? `${Math.round(goals.reduce((s, g) => s + getCompletionRate(g), 0) / goals.length)}%` : '0%'}
            subtitle="Avg across goals"
            icon={<TrendingUp size={18} />}
          />
        </div>
      </div>

      {/* Weekly Streak */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-elevated p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-foreground">Current Streak</h3>
          <span className="text-sm font-bold text-primary flex items-center gap-1">
            <Flame size={14} /> {streak} days
          </span>
        </div>
        <StreakDots days={streakDays} />
      </motion.div>

      {/* Goal Progress */}
      {topGoals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold font-display text-foreground">Goal Progress</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topGoals.map((goal, i) => {
              const rate = getCompletionRate(goal);
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="glass-card-hover p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                      {goal.category}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider ${
                      goal.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                      goal.priority === 'medium' ? 'bg-warning/10 text-warning' :
                      'bg-muted text-muted-foreground'
                    }`}>{goal.priority}</span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-3">{goal.title}</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <motion.div
                        className="bg-primary rounded-full h-2"
                        initial={{ width: 0 }}
                        animate={{ width: `${rate}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                      />
                    </div>
                    <span className="text-xs font-bold text-primary">{rate}%</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Target size={28} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold font-display text-foreground mb-2">No goals yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">Create your first goal to start building momentum and tracking your life progress.</p>
        </motion.div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
