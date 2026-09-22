'use client';

/**
 * Portfolio Panel — right sidebar of dashboard hero.
 * Shows Net Worth, Investments, Cash, Budget, Savings Goal.
 * All CSS-variable aware for dark mode.
 */
import { TrendingUp, TrendingDown, Minus, Target, PiggyBank } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface NetWorthRowProps { label: string; value: number; change?: number; sub?: string; }
interface ProgressBarProps { value: number; max: number; color?: string; }

function ProgressBar({ value, max, color }: ProgressBarProps) {
  const pct  = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const cls  = pct > 90 ? 'danger' : pct > 75 ? 'warning' : color ?? '';
  return (
    <div className="progress-track">
      <div className={cn('progress-fill', cls)} style={{ width: `${pct}%` }} />
    </div>
  );
}

function TrendBadge({ change }: { change: number }) {
  if (change === 0) return (
    <span className="badge badge-gray"><Minus size={9} />0%</span>
  );
  const positive = change > 0;
  return (
    <span className={cn('badge', positive ? 'badge-green' : 'badge-red')}>
      {positive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}

interface Props {
  netWorth:         number;
  totalInvestments: number;
  cashBalance:      number;
  emergencyFund:    number;
  monthlySavings:   number;
  activeBudgets:    number;
}

export default function PortfolioPanel({
  netWorth, totalInvestments, cashBalance, emergencyFund, monthlySavings, activeBudgets,
}: Props) {
  // Budget: assume monthly income ≈ cashBalance + monthlySavings (rough)
  const estimatedIncome = cashBalance + monthlySavings;
  const budgetSpent = estimatedIncome > 0 ? estimatedIncome - monthlySavings : 0;

  // Savings goal: emergency fund target = 6 months of estimated expenses
  const monthlyExpenses = Math.max(budgetSpent, 1);
  const savingsTarget   = monthlyExpenses * 6;

  const sections: { label: string; value: number; change: number; note?: string }[] = [
    { label: 'Net Worth',    value: netWorth,          change: 2.4,  note: 'All accounts' },
    { label: 'Investments',  value: totalInvestments,  change: 1.1,  note: 'Portfolio value' },
    { label: 'Cash',         value: cashBalance,       change: -0.3, note: 'Available balance' },
  ];

  return (
    <div className="card h-full flex flex-col p-0 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--border)]">
        <p className="t-title">Financial Summary</p>
        <p className="t-muted mt-0.5" style={{ fontSize: 12 }}>Real-time overview</p>
      </div>

      <div className="flex-1 overflow-y-auto no-scroll divide-y divide-[var(--border)]">

        {/* Net Worth + sub-metrics */}
        {sections.map((s, i) => (
          <div key={s.label} className="px-6 py-4">
            <div className="flex items-start justify-between mb-1">
              <p className="t-muted" style={{ fontSize: 12 }}>{s.label}</p>
              <TrendBadge change={s.change} />
            </div>
            <p className={cn(i === 0 ? 't-number-lg' : 't-number-md')}>
              {formatCurrency(s.value, { compact: i > 0 })}
            </p>
            {s.note && <p className="t-muted mt-0.5" style={{ fontSize: 11 }}>{s.note}</p>}
          </div>
        ))}

        {/* Monthly Budget */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <p className="t-muted" style={{ fontSize: 12 }}>Monthly Budget</p>
            <p style={{ fontSize: 11, color: 'var(--text-faint)' }}>{activeBudgets} active</p>
          </div>
          <ProgressBar value={budgetSpent} max={estimatedIncome} />
          <div className="flex justify-between mt-1.5">
            <p style={{ fontSize: 11, color: 'var(--text-faint)' }}>
              {formatCurrency(budgetSpent, { compact: true })} spent
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-faint)' }}>
              {formatCurrency(estimatedIncome, { compact: true })} budget
            </p>
          </div>
        </div>

        {/* Emergency Fund / Savings Goal */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-1.5 mb-2">
            <PiggyBank size={13} className="text-[var(--text-faint)]" />
            <p className="t-muted" style={{ fontSize: 12 }}>Emergency Fund</p>
          </div>
          <ProgressBar
            value={emergencyFund}
            max={savingsTarget > 0 ? savingsTarget : emergencyFund * 1.5}
          />
          <div className="flex justify-between mt-1.5">
            <p style={{ fontSize: 11, color: 'var(--text-faint)' }}>
              {formatCurrency(emergencyFund, { compact: true })} saved
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-faint)' }}>
              Target: {formatCurrency(savingsTarget > 0 ? savingsTarget : emergencyFund * 1.5, { compact: true })}
            </p>
          </div>
        </div>

        {/* Monthly Savings */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="t-muted" style={{ fontSize: 12 }}>Monthly Savings</p>
              <p className="t-number-sm mt-1" style={{ color: monthlySavings >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {monthlySavings >= 0 ? '+' : ''}{formatCurrency(monthlySavings, { compact: true })}
              </p>
            </div>
            <Target size={18} className="text-[var(--text-faint)]" />
          </div>
        </div>

        {/* Market Summary placeholder */}
        <div className="px-6 py-4">
          <p className="t-muted mb-3" style={{ fontSize: 12 }}>Market</p>
          {[
            { name: 'NIFTY 50',  val: '24,632', chg: '+0.42%', up: true },
            { name: 'SENSEX',    val: '81,274', chg: '+0.38%', up: true },
            { name: 'Gold',      val: '₹71,240', chg: '-0.12%', up: false },
          ].map((m) => (
            <div key={m.name} className="flex items-center justify-between py-1.5">
              <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{m.name}</p>
              <div className="flex items-center gap-2">
                <p style={{ fontSize: 12, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{m.val}</p>
                <p style={{ fontSize: 11, fontWeight: 500, color: m.up ? 'var(--success)' : 'var(--danger)' }}>{m.chg}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
