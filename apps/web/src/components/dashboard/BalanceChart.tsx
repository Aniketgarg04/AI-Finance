'use client';

import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { format, subDays } from 'date-fns';

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card p-3" style={{ padding: '8px 12px' }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'var(--text)' }}>
        ₹{payload[0].value.toLocaleString('en-IN')}
      </p>
    </div>
  );
};

export default function BalanceTrendChart({ data = [] }: { data?: { date: string; balance: number }[] }) {
  const chartData = useMemo(() => {
    if (data.length > 0) return data;
    let base = 420000;
    return Array.from({ length: 31 }, (_, i) => {
      base += Math.sin(i * 0.5) * 4000 + 1500;
      return { date: format(subDays(new Date(), 30 - i), 'dd MMM'), balance: Math.round(base) };
    });
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 4, right: 2, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="bg-balance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--chart-1)" stopOpacity={0.15} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.6} />
        <XAxis
          dataKey="date" axisLine={false} tickLine={false}
          tick={{ fill: 'var(--text-faint)', fontSize: 11 }}
          minTickGap={30} interval="preserveStartEnd"
        />
        <YAxis
          axisLine={false} tickLine={false}
          tick={{ fill: 'var(--text-faint)', fontSize: 11 }}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          width={48}
        />
        <Tooltip content={<Tip />} cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1 }} />
        <Area
          type="monotone" dataKey="balance"
          stroke="var(--chart-1)" strokeWidth={2}
          fill="url(#bg-balance)"
          activeDot={{ r: 4, fill: 'var(--chart-1)', stroke: 'var(--surface)', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
