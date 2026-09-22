'use client';

/**
 * MetricCard — Typography-first financial metric card.
 * Stripe/Linear design: number emphasis, subtle trend badge, clean border.
 * No giant icons, no gradient backgrounds.
 */
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label:    string;
  value:    string | number;
  change?:  number;
  caption?: string;
  icon?:    LucideIcon;
  delay?:   number;
  positiveIsGood?: boolean;
}

const SPARKLINE = [4, 7, 5, 9, 6, 11, 8, 13, 10, 14];
const SPARKLINE_DOWN = [14, 11, 13, 9, 12, 8, 10, 7, 9, 6];

export default function MetricCard({
  label,
  value,
  change,
  caption,
  icon: Icon,
  delay = 0,
  positiveIsGood = true,
}: MetricCardProps) {
  const hasChange   = change !== undefined && change !== 0;
  const isPositive  = (change ?? 0) >= 0;
  const isGood      = isPositive === positiveIsGood;
  const sparkData   = (isPositive ? SPARKLINE : SPARKLINE_DOWN).map((v) => ({ v }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: delay / 1000 }}
      className="card card-hover p-5 flex flex-col gap-3"
    >
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-[var(--text-tertiary)]" />}
          <span className="text-[13px] font-medium text-[var(--text-secondary)]">{label}</span>
        </div>

        {/* Trend badge */}
        {hasChange && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[12px] font-medium px-2 py-0.5 rounded-full',
              isGood
                ? 'bg-[var(--green-subtle)] text-[var(--green)]'
                : 'bg-[var(--red-subtle)] text-[var(--red)]',
            )}
          >
            {isPositive
              ? <TrendingUp size={11} />
              : <TrendingDown size={11} />
            }
            {Math.abs(change!).toFixed(1)}%
          </span>
        )}
        {!hasChange && change === 0 && (
          <span className="inline-flex items-center gap-1 text-[12px] font-medium px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-tertiary)]">
            <Minus size={11} />0%
          </span>
        )}
      </div>

      {/* Value — typography emphasis */}
      <div>
        <p className="number-xl text-[var(--text-primary)]" title={String(value)}>
          {value}
        </p>
        {caption && (
          <p className="text-[12px] text-[var(--text-tertiary)] mt-1">{caption}</p>
        )}
      </div>

      {/* Mini sparkline */}
      <div className="h-8 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData}>
            <Line
              type="monotone"
              dataKey="v"
              stroke={isGood ? 'var(--green)' : 'var(--red)'}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
