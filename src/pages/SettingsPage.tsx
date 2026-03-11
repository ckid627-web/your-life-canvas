import { useState } from 'react';
import { Plus, X, Zap } from 'lucide-react';
import { getCategories, saveCategories } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [categories, setCategories] = useState(getCategories);
  const [newCat, setNewCat] = useState('');

  function addCategory() {
    if (!newCat.trim() || categories.includes(newCat.trim())) return;
    const updated = [...categories, newCat.trim()];
    saveCategories(updated);
    setCategories(updated);
    setNewCat('');
  }

  function removeCategory(cat: string) {
    const updated = categories.filter(c => c !== cat);
    saveCategories(updated);
    setCategories(updated);
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-3xl font-bold font-display text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Customize your experience</p>
      </div>

      <div className="card-elevated p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Categories</h2>
        <p className="text-xs text-muted-foreground">Create custom categories for your goals.</p>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <span key={cat} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold group">
              {cat}
              <button onClick={() => removeCategory(cat)} className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="New category" value={newCat} onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()} className="bg-muted border-border rounded-xl" />
          <Button onClick={addCategory} variant="outline" size="icon" className="rounded-xl border-border"><Plus size={16} /></Button>
        </div>
      </div>

      <div className="card-elevated p-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Zap size={14} className="text-primary-foreground" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">LifeTrack</h2>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your personal life dashboard. Define goals, track daily progress, reflect through journaling, and let the AI coach guide your growth.
        </p>
        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">All data stored locally in your browser</p>
      </div>
    </div>
  );
}
