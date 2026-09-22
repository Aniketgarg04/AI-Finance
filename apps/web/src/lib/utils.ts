/**
 * Utility functions — cn(), formatCurrency, formatDate, formatCompact
 */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

/** Merges Tailwind class names safely */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Indian currency (₹)
 * e.g. 125000 → "₹1,25,000"
 */
export function formatCurrency(
  amount: number,
  options?: { compact?: boolean; decimals?: number }
): string {
  const decimals = options?.decimals ?? 0;

  if (options?.compact) {
    if (Math.abs(amount) >= 1_00_00_000)
      return `₹${(amount / 1_00_00_000).toFixed(1)}Cr`;
    if (Math.abs(amount) >= 1_00_000)
      return `₹${(amount / 1_00_000).toFixed(1)}L`;
    if (Math.abs(amount) >= 1_000)
      return `₹${(amount / 1_000).toFixed(1)}K`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format an ISO date string or Date object
 * e.g. "2024-01-15" → "15 Jan 2024"
 */
export function formatDate(dateInput: string | Date, fmt = 'dd MMM yyyy'): string {
  try {
    const dateObj = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    return format(dateObj, fmt);
  } catch {
    return String(dateInput);
  }
}

/** Returns positive/negative class for P&L display */
export function getPnlClass(value: number): string {
  return value >= 0 ? 'text-green-400' : 'text-red-400';
}

/** Returns positive/negative prefix sign */
export function getPnlSign(value: number): string {
  return value >= 0 ? '+' : '';
}

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Truncate long text */
export function truncate(str: string, length = 30): string {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}
