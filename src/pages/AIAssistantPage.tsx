import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getGoals, getCompletionRate, getLifeScore, getStreak, getTodaysTasks } from '@/lib/store';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your productivity coach. Ask me anything about your goals, progress, or schedule. Try: \"Am I falling behind?\" or \"Suggest today's priorities.\"" },
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
      if (goals.length === 0) return "You haven't set any goals yet. Let's start by creating your first goal in the Goals page!";
      const behind = goals.filter(g => getCompletionRate(g) < 30);
      if (behind.length > 0) {
        return `You're falling behind on ${behind.length} goal(s): ${behind.map(g => `"${g.title}" (${getCompletionRate(g)}%)`).join(', ')}. Consider breaking these into smaller daily tasks to get back on track.`;
      }
      return `You're doing great! All your goals are on track. Your life score is ${lifeScore}. Keep it up!`;
    }

    if (q.includes('priorities') || q.includes('today') || q.includes('focus')) {
      if (todayTasks.length === 0) return "No tasks scheduled for today. Go to Goals and assign tasks to today's date, or I can suggest priorities from your active goals.";
      const pending = todayTasks.filter(t => !t.completed);
      if (pending.length === 0) return "🎉 You've completed all today's tasks! Consider reviewing your weekly milestones or journaling about your progress.";
      return `Here are your priorities for today:\n${pending.map((t, i) => `${i + 1}. ${t.title}`).join('\n')}\n\nYou've completed ${completedToday}/${todayTasks.length} so far. Focus on one task at a time!`;
    }

    if (q.includes('break') || q.includes('milestone') || q.includes('breakdown')) {
      return "To break a goal into milestones:\n1. Open the goal in the Goals page\n2. Click 'Add Milestone' to create weekly checkpoints\n3. Add specific tasks under each milestone\n4. Set dates for each task\n\nTip: Start with 4-6 milestones per goal, each with 3-5 actionable tasks.";
    }

    if (q.includes('improve') || q.includes('plan') || q.includes('better')) {
      const tips: string[] = [];
      if (streak < 3) tips.push("Build consistency: aim for at least 1 completed task daily to build your streak.");
      if (goals.some(g => g.milestones.length === 0)) tips.push("Some goals have no milestones. Break them into weekly milestones for better tracking.");
      if (lifeScore < 50) tips.push("Your life score is below 50. Focus on completing high-priority tasks first.");
      if (tips.length === 0) tips.push("You're doing well! Consider setting stretch goals or adding new categories to challenge yourself.");
      return `Here are my suggestions:\n${tips.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
    }

    if (q.includes('score') || q.includes('life score')) {
      return `Your current Life Score is **${lifeScore}**. This is calculated from your task completion rate (60%) and weekly consistency (40%). ${lifeScore >= 70 ? 'Excellent work!' : lifeScore >= 40 ? 'Room for improvement — focus on daily consistency.' : 'Let\'s work on building a daily habit. Start small!'}`;
    }

    return `I can help you with:\n- "Am I falling behind?" — progress check\n- "Suggest today's priorities" — daily focus\n- "Break this goal into milestones" — task planning\n- "Improve my plan" — optimization tips\n- "What's my life score?" — overall score\n\nWhat would you like to know?`;
  }

  function handleSend() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const response = generateResponse(input);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setLoading(false);
    }, 500);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-foreground">AI Assistant</h1>
        <p className="text-muted-foreground mt-1">Your personal productivity coach</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto space-y-4 pb-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-primary" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
              msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <User size={16} className="text-muted-foreground" />
              </div>
            )}
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-primary" />
            </div>
            <div className="bg-card border border-border rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything..."
          className="flex-1"
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
