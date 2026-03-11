interface StreakDotsProps {
  days: { date: string; completed: boolean; hasData: boolean }[];
}

export default function StreakDots({ days }: StreakDotsProps) {
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="flex items-center gap-2 justify-center">
      {days.map((day, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <div
            className={
              day.completed
                ? 'streak-dot-completed'
                : day.hasData
                  ? 'streak-dot-missed'
                  : 'streak-dot-empty'
            }
          >
            {day.completed ? '✓' : day.hasData ? '✕' : '·'}
          </div>
          <span className="text-[10px] text-muted-foreground">{dayLabels[i % 7]}</span>
        </div>
      ))}
    </div>
  );
}
