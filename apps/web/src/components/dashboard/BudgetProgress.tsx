'use client';

/**
 * BudgetProgress — mini progress bars for each budget category in the dashboard.
 */
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { getCategoryMeta } from '@/lib/constants';
import type { Budget } from '@/types';

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const isOver = value > max;
  return (
    <div className="w-full h-1.5 bg-[var(--bg-overlay)] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${pct}%`,
          background: isOver ? '#ef4444' : color,
          boxShadow: isOver ? '0 0 8px rgba(239,68,68,0.4)' : 'none',
        }}
      />
    </div>
  );
}

export default function BudgetProgress({ budgets }: { budgets: Budget[] }) {
  return (
    <div className="card-glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Budget Status</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">May 2024</p>
        </div>
        <Link href="/budgets" className="text-xs text-[var(--primary)] hover:underline font-medium">
          Manage →
        </Link>
      </div>

      <div className="space-y-3">
        {budgets.map((b) => {
          const meta = getCategoryMeta(b.category);
          const isOver = b.spent > b.limit;
          return (
            <div key={b.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{meta.emoji}</span>
                  <span className="text-xs font-medium text-[var(--text-secondary)]">{b.category}</span>
                  {isOver && (
                    <span className="text-[9px] bg-red-500/15 text-red-400 border border-red-500/20
                                     rounded-full px-1.5 py-0.5">Over budget</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs font-mono">
                  <span className={isOver ? 'text-red-400' : 'text-[var(--text-primary)]'}>
                    {formatCurrency(b.spent, { compact: true })}
                  </span>
                  <span className="text-[var(--text-muted)]">/</span>
                  <span className="text-[var(--text-muted)]">{formatCurrency(b.limit, { compact: true })}</span>
                </div>
              </div>
              <ProgressBar value={b.spent} max={b.limit} color={meta.color} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
