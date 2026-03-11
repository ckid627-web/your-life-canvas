import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Search, BookOpen } from 'lucide-react';
import { getJournalEntries, addJournalEntry, deleteJournalEntry, generateId } from '@/lib/store';
import { JournalEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function JournalPage() {
  const [entries, setEntries] = useState(getJournalEntries);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  function handleCreate() {
    if (!content.trim()) return;
    addJournalEntry({
      id: generateId(), date: new Date().toISOString().split('T')[0],
      content, tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    });
    setEntries(getJournalEntries());
    setDialogOpen(false);
    setContent(''); setTags('');
  }

  function handleDelete(id: string) { deleteJournalEntry(id); setEntries(getJournalEntries()); }

  const filtered = entries.filter(e =>
    e.content.toLowerCase().includes(search.toLowerCase()) ||
    e.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Journal</h1>
          <p className="text-muted-foreground mt-1 text-sm">Reflect, record, and grow</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl"><Plus size={16} /> New Entry</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-card border-border">
            <DialogHeader><DialogTitle className="font-display">New Journal Entry</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Textarea placeholder="What's on your mind?" rows={6} value={content} onChange={e => setContent(e.target.value)} className="bg-muted border-border" />
              <Input placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} className="bg-muted border-border" />
              <Button onClick={handleCreate} className="w-full rounded-xl">Save Entry</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search entries..." value={search} onChange={e => setSearch(e.target.value)} className="pl-11 bg-muted border-border rounded-xl" />
      </div>

      <div className="space-y-3">
        {filtered.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-elevated p-5 group"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium">
                {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
              <button onClick={() => handleDelete(entry.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                <Trash2 size={14} />
              </button>
            </div>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {entry.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold uppercase tracking-wider">#{tag}</span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="card-elevated p-12 text-center">
            <BookOpen size={24} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">{search ? 'No matching entries found.' : 'Start journaling to capture your thoughts.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
