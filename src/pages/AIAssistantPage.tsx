import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { getGoals, getCompletionRate, getLifeScore, getStreak, getTodaysTasks } from '@/lib/store';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hey! 👋 I'm your productivity coach. Ask me about your goals, progress, or schedule.\n\nTry:\n• \"Am I falling behind?\"\n• \"Suggest today's priorities\"\n• \"Improve my plan\"" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  function generateResponse(query: string): string {
    const goals = getGoals();
    const lifeScore = getLifeScore();
    const streak = getStreak();
    const todayTasks = getTodaysTasks();
    const completedToday = todayTasks.filter(t => t.completed).length;
    const q = query.toLowerCase();

    if (q.includes('behind') || q.includes('falling') || q.includes('progress')) {
      if (goals.length === 0) return "You haven't set any goals yet. Head to the Goals page to create your first one! 🎯";
      const behind = goals.filter(g => getCompletionRate(g) < 30);
      if (behind.length > 0) {
        return `⚠️ You're behind on ${behind.length} goal(s):\n\n${behind.map(g => `• "${g.title}" — ${getCompletionRate(g)}%`).join('\n')}\n\nTip: Break these into smaller daily tasks to regain momentum.`;
      }
      return `✅ You're on track! Life Score: ${lifeScore}. All goals progressing well. Keep pushing! 💪`;
    }

    if (q.includes('priorities') || q.includes('today') || q.includes('focus')) {
      if (todayTasks.length === 0) return "No tasks today. Go to Goals → add tasks with today's date. Want me to help plan? 📋";
      const pending = todayTasks.filter(t => !t.completed);
      if (pending.length === 0) return "🎉 All tasks done today! Consider journaling about your wins or reviewing weekly milestones.";
      return `Today's priorities:\n\n${pending.map((t, i) => `${i + 1}. ${t.title}`).join('\n')}\n\n${completedToday}/${todayTasks.length} done so far. Focus on one at a time! 🎯`;
    }

    if (q.includes('break') || q.includes('milestone') || q.includes('breakdown')) {
      return "To break a goal into milestones:\n\n1. Open the goal in Goals page\n2. Click \"Add Milestone\" for weekly checkpoints\n3. Add 3-5 tasks per milestone\n4. Set specific dates\n\n💡 Tip: Start with 4-6 milestones, each achievable in a week.";
    }

    if (q.includes('improve') || q.includes('plan') || q.includes('better')) {
      const tips: string[] = [];
      if (streak < 3) tips.push("🔥 Build your streak: complete at least 1 task daily");
      if (goals.some(g => g.milestones.length === 0)) tips.push("📊 Some goals have no milestones — break them down!");
      if (lifeScore < 50) tips.push("📈 Life Score is below 50 — focus on high-priority tasks first");
      if (tips.length === 0) tips.push("🌟 You're doing great! Consider stretch goals or new categories");
      return `Suggestions:\n\n${tips.join('\n')}`;
    }

    if (q.includes('score') || q.includes('life score')) {
      return `Your Life Score: **${lifeScore}**\n\nCalculated from:\n• Task completion (60%)\n• Weekly consistency (40%)\n\n${lifeScore >= 70 ? '🔥 Excellent!' : lifeScore >= 40 ? '📈 Room to grow' : '🌱 Let\'s build habits!'}`;
    }

    return "I can help with:\n\n• \"Am I falling behind?\" — progress check\n• \"Suggest today's priorities\" — daily focus\n• \"Break this goal into milestones\" — planning\n• \"Improve my plan\" — optimization\n• \"What's my life score?\" — overall score\n\nWhat would you like to know? 🤔";
  }

  function handleSend() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: generateResponse(input) }]);
      setLoading(false);
    }, 600);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold font-display text-foreground">AI Coach</h1>
        <p className="text-muted-foreground mt-1 text-sm">Your personal productivity assistant</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto space-y-3 pb-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <Sparkles size={14} className="text-primary" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'card-elevated text-foreground rounded-bl-md'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <User size={14} className="text-muted-foreground" />
              </div>
            )}
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Sparkles size={14} className="text-primary" />
            </div>
            <div className="card-elevated rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                {[0, 150, 300].map(d => (
                  <div key={d} className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything..."
          className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
