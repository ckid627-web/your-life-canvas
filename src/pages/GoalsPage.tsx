import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronDown, ChevronRight, Target } from 'lucide-react';
import { Goal, Milestone, Task } from '@/lib/types';
import { getGoals, saveGoals, addGoal, deleteGoal, generateId, getCategories, getCompletionRate } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function GoalsPage() {
  const [goals, setGoals] = useState(getGoals);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const categories = getCategories();

  const [form, setForm] = useState({
    title: '', description: '', category: categories[0], startDate: new Date().toISOString().split('T')[0],
    endDate: '', priority: 'medium' as Goal['priority'], tags: '',
  });

  function handleCreate() {
    if (!form.title || !form.endDate) return;
    const goal: Goal = {
      id: generateId(), title: form.title, description: form.description,
      category: form.category, startDate: form.startDate, endDate: form.endDate,
      priority: form.priority, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      notes: '', createdAt: new Date().toISOString(), milestones: [],
    };
    addGoal(goal);
    setGoals(getGoals());
    setDialogOpen(false);
    setForm({ title: '', description: '', category: categories[0], startDate: new Date().toISOString().split('T')[0], endDate: '', priority: 'medium', tags: '' });
  }

  function handleDelete(id: string) { deleteGoal(id); setGoals(getGoals()); }

  function addMilestone(goalId: string) {
    const updated = goals.map(g => {
      if (g.id !== goalId) return g;
      const m: Milestone = { id: generateId(), goalId, title: `Week ${g.milestones.length + 1}`, weekNumber: g.milestones.length + 1, completed: false, tasks: [] };
      return { ...g, milestones: [...g.milestones, m] };
    });
    saveGoals(updated); setGoals(updated);
  }

  function addTask(goalId: string, milestoneId: string) {
    const updated = goals.map(g => {
      if (g.id !== goalId) return g;
      return { ...g, milestones: g.milestones.map(m => {
        if (m.id !== milestoneId) return m;
        const t: Task = { id: generateId(), milestoneId, goalId, title: 'New task', completed: false, date: new Date().toISOString().split('T')[0], order: m.tasks.length };
        return { ...m, tasks: [...m.tasks, t] };
      }) };
    });
    saveGoals(updated); setGoals(updated);
  }

  function toggleTask(goalId: string, milestoneId: string, taskId: string) {
    const updated = goals.map(g => {
      if (g.id !== goalId) return g;
      return { ...g, milestones: g.milestones.map(m => {
        if (m.id !== milestoneId) return m;
        return { ...m, tasks: m.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) };
      }) };
    });
    saveGoals(updated); setGoals(updated);
  }

  function updateTaskTitle(goalId: string, milestoneId: string, taskId: string, title: string) {
    const updated = goals.map(g => {
      if (g.id !== goalId) return g;
      return { ...g, milestones: g.milestones.map(m => {
        if (m.id !== milestoneId) return m;
        return { ...m, tasks: m.tasks.map(t => t.id === taskId ? { ...t, title } : t) };
      }) };
    });
    saveGoals(updated); setGoals(updated);
  }

  function updateTaskDate(goalId: string, milestoneId: string, taskId: string, date: string) {
    const updated = goals.map(g => {
      if (g.id !== goalId) return g;
      return { ...g, milestones: g.milestones.map(m => {
        if (m.id !== milestoneId) return m;
        return { ...m, tasks: m.tasks.map(t => t.id === taskId ? { ...t, date } : t) };
      }) };
    });
    saveGoals(updated); setGoals(updated);
  }

  function deleteTask(goalId: string, milestoneId: string, taskId: string) {
    const updated = goals.map(g => {
      if (g.id !== goalId) return g;
      return { ...g, milestones: g.milestones.map(m => {
        if (m.id !== milestoneId) return m;
        return { ...m, tasks: m.tasks.filter(t => t.id !== taskId) };
      }) };
    });
    saveGoals(updated); setGoals(updated);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Goals</h1>
          <p className="text-muted-foreground mt-1 text-sm">Define and track your yearly goals</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl"><Plus size={16} /> New Goal</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-card border-border">
            <DialogHeader><DialogTitle className="font-display">Create New Goal</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Goal title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-muted border-border" />
              <Textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-muted border-border" />
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Start</label>
                  <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="bg-muted border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">End</label>
                  <Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="bg-muted border-border" />
                </div>
              </div>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as Goal['priority'] }))}>
                <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="bg-muted border-border" />
              <Button onClick={handleCreate} className="w-full rounded-xl">Create Goal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {goals.map(goal => {
          const rate = getCompletionRate(goal);
          const expanded = expandedGoal === goal.id;
          return (
            <motion.div key={goal.id} layout className="card-elevated overflow-hidden">
              <div className="p-5 cursor-pointer" onClick={() => setExpandedGoal(expanded ? null : goal.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {expanded ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">{goal.category}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          goal.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                          goal.priority === 'medium' ? 'bg-warning/10 text-warning' :
                          'bg-muted text-muted-foreground'
                        }`}>{goal.priority}</span>
                      </div>
                      <h3 className="font-semibold text-foreground text-sm">{goal.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-primary">{rate}%</span>
                    <button onClick={e => { e.stopPropagation(); handleDelete(goal.id); }} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mt-3">
                  <div className="bg-primary rounded-full h-1.5 transition-all duration-700" style={{ width: `${rate}%` }} />
                </div>
              </div>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-border overflow-hidden"
                  >
                    <div className="p-5 space-y-4">
                      {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}
                      <div className="text-xs text-muted-foreground">{goal.startDate} → {goal.endDate}</div>

                      {goal.milestones.map(m => (
                        <div key={m.id} className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border/50">
                          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">{m.title}</h4>
                          {m.tasks.map(t => (
                            <div key={t.id} className="flex items-center gap-3 group">
                              <button
                                onClick={() => toggleTask(goal.id, m.id, t.id)}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                                  t.completed ? 'bg-primary border-primary' : 'border-muted-foreground/30 hover:border-primary/50'
                                }`}
                              >
                                {t.completed && <span className="text-primary-foreground text-[10px]">✓</span>}
                              </button>
                              <input
                                className={`flex-1 bg-transparent text-sm border-none outline-none font-body ${t.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                                value={t.title}
                                onChange={e => updateTaskTitle(goal.id, m.id, t.id, e.target.value)}
                                onClick={e => e.stopPropagation()}
                              />
                              <input type="date" value={t.date} onChange={e => updateTaskDate(goal.id, m.id, t.id, e.target.value)}
                                className="text-xs bg-transparent text-muted-foreground border-none outline-none" onClick={e => e.stopPropagation()} />
                              <button onClick={e => { e.stopPropagation(); deleteTask(goal.id, m.id, t.id); }}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                          <button onClick={() => addTask(goal.id, m.id)}
                            className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                            <Plus size={12} /> Add Task
                          </button>
                        </div>
                      ))}

                      <button onClick={() => addMilestone(goal.id)}
                        className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1">
                        <Plus size={14} /> Add Milestone
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {goals.length === 0 && (
          <div className="card-elevated p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Target size={24} className="text-primary" />
            </div>
            <p className="text-muted-foreground text-sm">No goals yet. Create your first goal to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
