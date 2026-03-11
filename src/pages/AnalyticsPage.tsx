import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { getGoals, getDailyLogs, getCompletionRate, getLifeScore, getStreak } from '@/lib/store';
import CircularProgress from '@/components/CircularProgress';
import StatCard from '@/components/StatCard';
import { TrendingUp, Target, Flame, CheckCircle2 } from 'lucide-react';

export default function AnalyticsPage() {
  const goals = getGoals();
  const logs = getDailyLogs();
  const lifeScore = getLifeScore();
  const streak = getStreak();

  const allTasks = goals.flatMap(g => g.milestones.flatMap(m => m.tasks));
  const totalCompleted = allTasks.filter(t => t.completed).length;
  const totalTasks = allTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  // Weekly data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const log = logs.find(l => l.date === dateStr);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      completed: log?.tasksCompleted || 0,
      total: log?.tasksTotal || 0,
    };
  });

  // Goal breakdown
  const goalData = goals.map(g => ({
    name: g.title.length > 15 ? g.title.slice(0, 15) + '…' : g.title,
    progress: getCompletionRate(g),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Your productivity insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Life Score" value={lifeScore} icon={<TrendingUp size={20} />} />
        <StatCard title="Completion Rate" value={`${completionRate}%`} subtitle={`${totalCompleted}/${totalTasks} tasks`} icon={<CheckCircle2 size={20} />} />
        <StatCard title="Active Goals" value={goals.length} icon={<Target size={20} />} />
        <StatCard title="Streak" value={`${streak} days`} icon={<Flame size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Goal Progress</h3>
          {goalData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={goalData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="progress" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">No goals to display</div>
          )}
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Productivity Heatmap (Last 30 Days)</h3>
        <div className="flex flex-wrap gap-1">
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
                className="w-6 h-6 rounded-sm transition-colors"
                style={{
                  backgroundColor: intensity > 0
                    ? `hsl(var(--primary) / ${0.2 + intensity * 0.8})`
                    : 'hsl(var(--muted))',
                }}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <span>Less</span>
          {[0.2, 0.4, 0.6, 0.8, 1].map(v => (
            <div key={v} className="w-4 h-4 rounded-sm" style={{ backgroundColor: `hsl(var(--primary) / ${v})` }} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
