import { useState } from 'react';
import { Plus, X } from 'lucide-react';
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
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Customize your experience</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Categories</h2>
        <p className="text-sm text-muted-foreground">Create custom categories for your goals.</p>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <span key={cat} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium group">
              {cat}
              <button onClick={() => removeCategory(cat)} className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="New category" value={newCat} onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()} />
          <Button onClick={addCategory} variant="outline" size="icon"><Plus size={16} /></Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">About</h2>
        <p className="text-sm text-muted-foreground">
          LifeTrack is your personal life dashboard. Define your goals, track daily progress, reflect through journaling, and let the AI assistant guide your growth.
        </p>
        <p className="text-xs text-muted-foreground">All data is stored locally in your browser.</p>
      </div>
    </div>
  );
}
