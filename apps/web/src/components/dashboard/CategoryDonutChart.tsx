'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = [
  'var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)',
  'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)',
];

const Tip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card" style={{ padding: '8px 12px' }}>
      <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{payload[0].name}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
        ₹{payload[0].value.toLocaleString('en-IN')}
      </p>
    </div>
  );
};

export default function CategoryDonutChart({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ position: 'relative', flex: '0 0 auto', height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data} cx="50%" cy="50%"
              innerRadius="55%" outerRadius="78%"
              paddingAngle={2} dataKey="value" strokeWidth={0}
            >
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip content={<Tip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center total */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <p style={{ fontSize: 10, color: 'var(--text-faint)' }}>Total</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
            ₹{(total / 1000).toFixed(0)}k
          </p>
        </div>
      </div>

      {/* Legend */}
      <div style={{ flex: 1, overflowY: 'auto', marginTop: 12 }} className="no-scroll">
        {data.slice(0, 6).map((d, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', flexShrink: 0, marginLeft: 8 }}>
              ₹{d.value.toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
