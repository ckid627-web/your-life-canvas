import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accent?: boolean;
}

export default function StatCard({ title, value, subtitle, icon, accent }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl p-5 transition-all duration-300 ${
        accent
          ? 'bg-primary/10 border border-primary/20 hover:border-primary/40 hover:shadow-[var(--glow-primary)]'
          : 'glass-card-hover'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className={`text-2xl font-bold font-display mt-1.5 ${accent ? 'text-primary' : 'text-foreground'}`}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {icon && <div className={accent ? 'text-primary' : 'text-muted-foreground'}>{icon}</div>}
      </div>
    </motion.div>
  );
}
