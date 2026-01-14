import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: ReactNode;
  variant?: 'default' | 'primary' | 'accent' | 'success';
}

export function StatCard({ title, value, change, icon, variant = 'default' }: StatCardProps) {
  const isPositive = change && change > 0;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group',
        variant === 'primary' && 'bg-gradient-primary text-primary-foreground',
        variant === 'accent' && 'bg-gradient-accent text-accent-foreground',
        variant === 'success' && 'bg-success text-success-foreground',
        variant === 'default' && 'bg-card text-card-foreground shadow-md'
      )}
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-500" />
      <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5 group-hover:scale-125 transition-transform duration-700" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              variant === 'default' ? 'bg-primary/10 text-primary' : 'bg-white/20'
            )}
          >
            {icon}
          </div>
          {change !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                variant === 'default'
                  ? isPositive
                    ? 'bg-success/10 text-success'
                    : 'bg-destructive/10 text-destructive'
                  : 'bg-white/20'
              )}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>

        <div>
          <p
            className={cn(
              'text-sm font-medium mb-1',
              variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
            )}
          >
            {title}
          </p>
          <p className="text-3xl font-display font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
