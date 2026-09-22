'use client';

import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { format, subMonths } from 'date-fns';

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card" style={{ padding: '8px 12px' }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2" style={{ marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.fill, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.name}:</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
            ₹{p.value.toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function IncomeVsExpenseBar({ data = [] }: { data?: any[] }) {
  const chartData = useMemo(() => {
    if (data.length > 0) return data;
    return Array.from({ length: 6 }, (_, i) => ({
      month: format(subMonths(new Date(), 5 - i), 'MMM'),
      Income:  Math.round(55000 + Math.sin(i * 0.7) * 7000),
      Expense: Math.round(38000 + Math.cos(i * 0.6) * 5000),
    }));
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 4, right: 2, left: -20, bottom: 0 }} barSize={8} barCategoryGap="35%">
        <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.6} />
        <XAxis
          dataKey="month" axisLine={false} tickLine={false}
          tick={{ fill: 'var(--text-faint)', fontSize: 11 }}
        />
        <YAxis
          axisLine={false} tickLine={false}
          tick={{ fill: 'var(--text-faint)', fontSize: 11 }}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          width={44}
        />
        <Tooltip content={<Tip />} cursor={{ fill: 'var(--bg)', radius: 4 }} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(v) => <span style={{ color: 'var(--text-muted)' }}>{v}</span>}
        />
        <Bar dataKey="Income"  fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Expense" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
