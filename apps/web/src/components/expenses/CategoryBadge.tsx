'use client';

/**
 * CategoryBadge — colored pill badge for expense categories.
 */
import { getCategoryMeta } from '@/lib/constants';
import type { ExpenseCategory } from '@/types';

interface CategoryBadgeProps { category: ExpenseCategory; size?: 'sm' | 'md'; }

export default function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const meta = getCategoryMeta(category);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${meta.badgeClass}
                  ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}
    >
      <span className={size === 'sm' ? 'text-[10px]' : 'text-xs'}>{meta.emoji}</span>
      {category}
    </span>
  );
}
