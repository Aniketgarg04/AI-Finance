'use client';

/**
 * GoalTracker — savings goals with linear progress bars and target date countdown.
 */
import { differenceInDays, parseISO } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import type { SavingsGoal } from '@/types';

import { Plus } from 'lucide-react';

export default function GoalTracker({ goals, onAddGoal }: { goals: SavingsGoal[], onAddGoal?: () => void }) {
  return (
    <div className="card-glass rounded-2xl p-5">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Savings Goals</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Track your progress</p>
        </div>
        {onAddGoal && (
          <button 
            onClick={onAddGoal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors text-xs font-semibold"
          >
            <Plus size={14} /> Add Goal
          </button>
        )}
      </div>
      <div className="space-y-4">
        {goals.map((goal) => {
          const pct = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
          const isComplete = goal.savedAmount >= goal.targetAmount;
          let daysLeft: number | null = null;
          try {
            if (goal.targetDate) {
              daysLeft = differenceInDays(parseISO(goal.targetDate), new Date());
            }
          } catch {
            daysLeft = null;
          }
          return (
            <div key={goal.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{goal.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">{goal.title}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {isComplete ? '🎉 Completed!' : daysLeft !== null ? `${daysLeft}d left` : 'No deadline set'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-semibold text-[var(--text-primary)]">
                    {formatCurrency(goal.savedAmount, { compact: true })}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    of {formatCurrency(goal.targetAmount, { compact: true })}
                  </p>
                </div>
              </div>
              <div className="relative h-2 bg-[var(--bg-overlay)] rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: isComplete
                      ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                      : 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                  }}
                />
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 text-right">{Math.round(pct)}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
