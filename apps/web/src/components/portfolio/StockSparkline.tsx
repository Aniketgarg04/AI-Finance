'use client';

/**
 * StockSparkline — Mini sparkline chart for individual stock price trend.
 */
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  symbol: string;
  isProfit: boolean;
  pnlPct: number;
}

// Generate realistic-looking sparkline data based on symbol hash
function generateSparkline(symbol: string, isProfit: boolean) {
  const seed = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const data = [];
  let val = 100;
  for (let i = 0; i < 12; i++) {
    const rand = ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;
    val = val + (rand - 0.45) * 4;
    data.push({ v: Math.max(85, Math.round(val * 10) / 10) });
  }
  // Ensure direction matches profit/loss
  if (isProfit && data[data.length - 1].v < data[0].v) {
    data[data.length - 1].v = data[0].v + 5;
  } else if (!isProfit && data[data.length - 1].v > data[0].v) {
    data[data.length - 1].v = data[0].v - 5;
  }
  return data;
}

export default function StockSparkline({ symbol, isProfit, pnlPct }: Props) {
  const data = generateSparkline(symbol, isProfit);
  const color = isProfit ? '#22c55e' : '#f43f5e';

  return (
    <div className="flex items-center gap-2">
      <div style={{ width: 64, height: 32 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={1.5}
              dot={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="card-glass rounded-lg px-2 py-1 text-[9px] font-mono" style={{ color }}>
                    {payload[0].value}
                  </div>
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
