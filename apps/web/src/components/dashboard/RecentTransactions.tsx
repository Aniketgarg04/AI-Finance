'use client';

import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getCategoryMeta } from '@/lib/constants';
import type { Transaction } from '@/types';
import { cn } from '@/lib/utils';

export default function RecentTransactions({
  transactions,
  limit = 6,
}: {
  transactions: Transaction[];
  limit?: number;
}) {
  const items = transactions.slice(0, limit);
  if (!items.length) return null;

  return (
    <div className="divide-y divide-[var(--border)]">
      {items.map((txn) => {
        const meta     = getCategoryMeta(txn.category);
        const isCredit = txn.type === 'credit';
        return (
          <div
            key={txn.id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-muted)] transition-colors duration-100"
          >
            {/* Category emoji */}
            <div
              className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[15px] shrink-0"
              style={{ background: meta.color + '18' }}
            >
              {meta.emoji}
            </div>

            {/* Title + date */}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[var(--text-primary)] truncate">
                {txn.title}
              </p>
              <p className="text-[12px] text-[var(--text-tertiary)]">
                {formatDate(txn.date, 'dd MMM')} · {txn.category}
              </p>
            </div>

            {/* Amount */}
            <div className={cn(
              'flex items-center gap-1 text-[14px] font-semibold shrink-0 tabular-nums',
              isCredit ? 'text-[var(--green)]' : 'text-[var(--text-primary)]',
            )}>
              {isCredit
                ? <ArrowDownLeft size={13} />
                : <ArrowUpRight size={13} />
              }
              {isCredit ? '+' : '−'}{formatCurrency(txn.amount)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
