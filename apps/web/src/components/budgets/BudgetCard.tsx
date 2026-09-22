'use client';

/**
 * BudgetCard — shows a category budget with circular progress ring and spent/limit.
 */
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { getCategoryMeta } from '@/lib/constants';
import type { Budget } from '@/types';

interface BudgetCardProps { budget: Budget; delay?: number; }

const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function BudgetCard({ budget, delay = 0 }: BudgetCardProps) {
  const meta = getCategoryMeta(budget.category);
  const pct = Math.min((budget.spent / budget.limit) * 100, 100);
  const isOver = budget.spent > budget.limit;
  const strokeColor = isOver ? '#ef4444' : meta.color;
  const dashOffset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
  const remaining = budget.limit - budget.spent;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay }}
      className="card-glass rounded-2xl p-5 hover:border-[var(--border-strong)] transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{budget.category}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {isOver
              ? `Over by ${formatCurrency(Math.abs(remaining))}`
              : `${formatCurrency(remaining)} left`}
          </p>
        </div>
        <span className="text-2xl">{meta.emoji}</span>
      </div>

      {/* Ring */}
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg width="80" height="80" className="-rotate-90">
            {/* Track */}
            <circle cx="40" cy="40" r={RADIUS} fill="none" stroke="var(--bg-overlay)" strokeWidth="6" />
            {/* Progress */}
            <circle
              cx="40" cy="40" r={RADIUS} fill="none"
              stroke={strokeColor} strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          {/* Center % */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-bold font-mono ${isOver ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
              {Math.round(pct)}%
            </span>
          </div>
        </div>

        {/* Text details */}
        <div className="space-y-1 flex-1">
          <div className="flex justify-between text-xs">
            <span className="text-[var(--text-muted)]">Spent</span>
            <span className={`font-mono font-medium ${isOver ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
              {formatCurrency(budget.spent)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[var(--text-muted)]">Limit</span>
            <span className="font-mono font-medium text-[var(--text-primary)]">{formatCurrency(budget.limit)}</span>
          </div>
          {isOver && (
            <div className="mt-2 text-[10px] bg-red-500/10 text-red-400 border border-red-500/20
                            rounded-full px-2 py-0.5 text-center">
              ⚠ Budget exceeded
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
