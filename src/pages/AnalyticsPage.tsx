import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getGoals, getDailyLogs, getCompletionRate, getLifeScore, getStreak } from '@/lib/store';
import CircularProgress from '@/components/CircularProgress';
import StatCard from '@/components/StatCard';
import { TrendingUp, Target, Flame, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const goals = getGoals();
  const logs = getDailyLogs();
  const lifeScore = getLifeScore();
  const streak = getStreak();

  const allTasks = goals.flatMap(g => g.milestones.flatMap(m => m.tasks));
  const totalCompleted = allTasks.filter(t => t.completed).length;
  const totalTasks = allTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const log = logs.find(l => l.date === dateStr);
    return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), completed: log?.tasksCompleted || 0 };
  });

  const goalData = goals.map(g => ({
    name: g.title.length > 12 ? g.title.slice(0, 12) + '…' : g.title,
    progress: getCompletionRate(g),
  }));

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">Your productivity insights</p>
      </div>

      {/* Time Range Tabs */}
      <div className="flex gap-1 card-elevated p-1 w-fit">
        {(['week', 'month', 'all'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTimeRange(t)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              timeRange === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'week' ? 'This week' : t === 'month' ? 'This month' : 'All time'}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Life Score" value={lifeScore} icon={<TrendingUp size={16} />} accent />
        <StatCard title="Completion" value={`${completionRate}%`} subtitle={`${totalCompleted}/${totalTasks}`} icon={<CheckCircle2 size={16} />} />
        <StatCard title="Goals" value={goals.length} icon={<Target size={16} />} />
        <StatCard title="Streak" value={`${streak}d`} icon={<Flame size={16} />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-6">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-5">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={last7}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(220 8% 50%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(220 8% 50%)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(220 12% 10%)',
                  border: '1px solid hsl(220 10% 16%)',
                  borderRadius: '12px',
                  fontSize: '11px',
                  color: 'hsl(60 10% 95%)',
                }}
              />
              <Bar dataKey="completed" fill="hsl(75 85% 55%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-elevated p-6">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-5">Goal Progress</h3>
          {goalData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={goalData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(220 8% 50%)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(220 8% 50%)' }} width={90} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(220 12% 10%)',
                    border: '1px solid hsl(220 10% 16%)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: 'hsl(60 10% 95%)',
                  }}
                />
                <Bar dataKey="progress" fill="hsl(75 85% 55%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-xs text-muted-foreground">No goals yet</div>
          )}
        </motion.div>
      </div>

      {/* Heatmap */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-elevated p-6">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">30-Day Heatmap</h3>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 30 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (29 - i));
            const dateStr = d.toISOString().split('T')[0];
            const log = logs.find(l => l.date === dateStr);
            const intensity = log && log.tasksTotal > 0 ? log.tasksCompleted / log.tasksTotal : 0;
            return (
              <div
                key={i}
                title={`${dateStr}: ${log?.tasksCompleted || 0}/${log?.tasksTotal || 0}`}
                className="w-7 h-7 rounded-lg transition-colors"
                style={{
                  backgroundColor: intensity > 0
                    ? `hsl(75 85% 55% / ${0.15 + intensity * 0.85})`
                    : 'hsl(220 10% 14%)',
                }}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground">
          <span>Less</span>
          {[0.15, 0.35, 0.55, 0.75, 1].map(v => (
            <div key={v} className="w-5 h-5 rounded-md" style={{ backgroundColor: `hsl(75 85% 55% / ${v})` }} />
          ))}
          <span>More</span>
        </div>
      </motion.div>
    </div>
  );
}
