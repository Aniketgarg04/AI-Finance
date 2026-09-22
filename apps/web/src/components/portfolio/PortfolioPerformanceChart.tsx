'use client';

/**
 * PortfolioPerformanceChart — Area chart showing portfolio value over time with gradient fill.
 */
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK_HISTORY = [
  { date: 'Jan', value: 240000 }, { date: 'Feb', value: 258000 },
  { date: 'Mar', value: 245000 }, { date: 'Apr', value: 270000 },
  { date: 'May', value: 262000 }, { date: 'Jun', value: 285000 },
  { date: 'Jul', value: 298000 }, { date: 'Aug', value: 318821 },
];

export default function PortfolioPerformanceChart({ totalValue }: { totalValue: number }) {
  // Scale history to end at actual total value
  const scale = totalValue > 0 ? totalValue / 318821 : 1;
  const data = MOCK_HISTORY.map(d => ({ ...d, value: Math.round(d.value * scale) }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="card-glass rounded-xl px-4 py-3 text-xs shadow-2xl border border-[var(--border-default)]">
        <p className="text-[var(--text-muted)] mb-1">{label} 2026</p>
        <p className="font-bold text-[var(--text-primary)] text-base">
          ₹{payload[0].value.toLocaleString('en-IN')}
        </p>
      </div>
    );
  };

  return (
    <div className="card-glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Portfolio Performance</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">2026 YTD</p>
        </div>
        <div className="flex gap-1">
          {['1M', '3M', '6M', '1Y'].map((p, i) => (
            <button key={p} className={`text-xs px-2.5 py-1 rounded-lg transition-all ${i === 3 ? 'bg-[var(--primary)]/20 text-[var(--primary)] font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#7c3aed', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2.5} fill="url(#portfolioGrad)" dot={false} activeDot={{ r: 5, fill: '#7c3aed', strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
