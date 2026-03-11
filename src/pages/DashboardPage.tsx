import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Target, Flame, CheckCircle2, TrendingUp } from 'lucide-react';
import StatCard from '@/components/StatCard';
import CircularProgress from '@/components/CircularProgress';
import { getGoals, getLifeScore, getStreak, getTodaysTasks, getCompletionRate } from '@/lib/store';

export default function DashboardPage() {
  const [goals] = useState(getGoals);
  const todayTasks = getTodaysTasks();
  const completedToday = todayTasks.filter(t => t.completed).length;
  const lifeScore = getLifeScore();
  const streak = getStreak();

  const topGoals = goals.slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Good {getGreeting()}</h1>
        <p className="text-muted-foreground mt-1">Here's your progress overview</p>
      </div>

      {/* Life Score + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 bg-card rounded-xl border border-border p-6 flex items-center justify-center">
          <CircularProgress value={lifeScore} label="Life Score" sublabel="Overall progress" />
        </div>
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Today's Tasks"
            value={`${completedToday}/${todayTasks.length}`}
            subtitle={todayTasks.length > 0 ? `${Math.round((completedToday / todayTasks.length) * 100)}% complete` : 'No tasks today'}
            icon={<CheckCircle2 size={20} />}
          />
          <StatCard
            title="Current Streak"
            value={`${streak} days`}
            subtitle="Keep it going!"
            icon={<Flame size={20} />}
          />
          <StatCard
            title="Active Goals"
            value={goals.length}
            subtitle={`${goals.filter(g => getCompletionRate(g) >= 100).length} completed`}
            icon={<Target size={20} />}
          />
        </div>
      </div>

      {/* Goal Progress */}
      {topGoals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Goal Progress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topGoals.map(goal => {
              const rate = getCompletionRate(goal);
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl border border-border p-5 card-hover"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{goal.category}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      goal.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                      goal.priority === 'medium' ? 'bg-warning/10 text-warning' :
                      'bg-muted text-muted-foreground'
                    }`}>{goal.priority}</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{goal.title}</h3>
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <motion.div
                      className="bg-primary rounded-full h-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${rate}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{rate}% complete</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Target size={40} className="mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No goals yet</h3>
          <p className="text-muted-foreground text-sm">Create your first goal to start tracking your life progress.</p>
        </div>
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
