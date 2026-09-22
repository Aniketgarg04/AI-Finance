'use client';

/**
 * AssetAllocationChart — donut chart showing portfolio asset type breakdown.
 */
import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface AssetData { name: string; value: number; color: string; percentage: number; }

export default function AssetAllocationChart({ holdings }: { holdings: any[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const allocationMap: Record<string, number> = {};
  holdings.forEach((h: any) => {
    const value = h.quantity * (h.currentPrice || h.buyPrice);
    const type = h.assetType || 'STOCK';
    allocationMap[type] = (allocationMap[type] || 0) + value;
  });

  const total = Object.values(allocationMap).reduce((a, b) => a + b, 0);
  
  const COLORS: Record<string, string> = {
    'STOCK': '#3b82f6',
    'MF': '#8b5cf6',
    'FD': '#10b981',
    'GOLD': '#f59e0b',
    'CRYPTO': '#f43f5e',
    'REAL_ESTATE': '#06b6d4'
  };

  const data: AssetData[] = Object.entries(allocationMap).map(([name, value]) => ({
    name,
    value,
    percentage: total > 0 ? Math.round((value / total) * 1000) / 10 : 0,
    color: COLORS[name] || '#94a3b8'
  }));

  if (data.length === 0) return null;

  return (
    <div className="card-glass rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Asset Allocation</h3>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0 w-36 h-36">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data} cx="50%" cy="50%"
                innerRadius={44} outerRadius={64}
                paddingAngle={2} dataKey="value"
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
              <Tooltip 
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload as AssetData;
                  return (
                    <div className="card-glass rounded-xl p-3 text-xs">
                      <p className="font-semibold text-[var(--text-primary)] mb-1">{d.name}</p>
                      <p className="text-[var(--text-muted)]">{formatCurrency(d.value)} <span className="text-[var(--text-disabled)]">({d.percentage}%)</span></p>
                    </div>
                  );
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2 min-w-0">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
              <span className="text-xs text-[var(--text-muted)] truncate flex-1">{d.name}</span>
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
