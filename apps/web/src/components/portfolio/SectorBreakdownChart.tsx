'use client';

/**
 * SectorBreakdownChart — Horizontal bar chart showing sector-wise allocation.
 */
import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

const SECTOR_MAP: Record<string, { sector: string; color: string }> = {
  'RELIANCE': { sector: 'Energy', color: '#f97316' },
  'TCS': { sector: 'IT', color: '#3b82f6' },
  'HDFCBANK': { sector: 'Banking', color: '#8b5cf6' },
  'INFY': { sector: 'IT', color: '#3b82f6' },
  'TATAMOTORS': { sector: 'Auto', color: '#10b981' },
  'NIFTYBEES': { sector: 'Index ETF', color: '#06b6d4' },
};

function getSector(symbol: string) {
  const base = symbol.replace('.NS', '').replace('.BO', '');
  return SECTOR_MAP[base] || { sector: 'Others', color: '#94a3b8' };
}

export default function SectorBreakdownChart({ holdings }: { holdings: any[] }) {
  const sectorMap: Record<string, { value: number; color: string }> = {};
  holdings.forEach((h: any) => {
    const val = h.quantity * (h.currentPrice || h.buyPrice);
    const { sector, color } = getSector(h.assetSymbol || '');
    if (!sectorMap[sector]) sectorMap[sector] = { value: 0, color };
    sectorMap[sector].value += val;
  });

  const total = Object.values(sectorMap).reduce((a, b) => a + b.value, 0);
  const data = Object.entries(sectorMap)
    .map(([name, { value, color }]) => ({ name, value, color, pct: total > 0 ? ((value / total) * 100).toFixed(1) : '0' }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) return null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="card-glass rounded-xl px-3 py-2 text-xs shadow-2xl border border-[var(--border-default)]">
        <p className="font-semibold text-[var(--text-primary)]">{d.name}</p>
        <p className="text-[var(--text-muted)]">{formatCurrency(d.value)} <span className="text-[var(--text-disabled)]">({d.pct}%)</span></p>
      </div>
    );
  };

  return (
    <div className="card-glass rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Sector Breakdown</h3>
      <ResponsiveContainer width="100%" height={data.length * 40 + 20}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }} barSize={10}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={72}
            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 10, fill: 'var(--text-muted)', formatter: (v: number) => `${((v / total) * 100).toFixed(0)}%` }}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
