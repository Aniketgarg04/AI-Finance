'use client';

/**
 * ExpenseDonut — donut chart showing expense breakdown by category.
 * Interactive: hover highlights segment, shows center total.
 */
import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface DataItem { category: string; amount: number; percentage: number; color: string; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as DataItem;
  return (
    <div className="card-glass rounded-xl p-3 text-xs">
      <p className="font-semibold text-[var(--text-primary)] mb-1">{d.category}</p>
      <p className="text-[var(--text-muted)]">{formatCurrency(d.amount)} <span className="text-[var(--text-disabled)]">({d.percentage}%)</span></p>
    </div>
  );
}

export default function ExpenseDonut({ data }: { data: DataItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="card-glass rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Expenses by Category</h3>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">This month</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Chart */}
        <div className="relative flex-shrink-0 w-36 h-36">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data} cx="50%" cy="50%"
                innerRadius={44} outerRadius={64}
                paddingAngle={2} dataKey="amount"
                onMouseEnter={(_, i) => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index} fill={entry.color}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-xs text-[var(--text-muted)]">Total</p>
            <p className="text-sm font-bold text-[var(--text-primary)] font-mono">
              {formatCurrency(total, { compact: true })}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 min-w-0">
          {data.slice(0, 6).map((d) => (
            <div key={d.category} className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
              <span className="text-xs text-[var(--text-muted)] truncate flex-1">{d.category}</span>
              <span className="text-xs font-mono font-medium text-[var(--text-primary)] shrink-0">
                {d.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
