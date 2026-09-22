/**
 * App-wide constants — categories, nav items, colors
 */
import {
  LayoutDashboard, ArrowLeftRight, PieChart,
  TrendingUp, Calculator, Shield, Bot, FileText,
  type LucideIcon,
} from 'lucide-react';
import type { ExpenseCategory } from '@/types';

export interface NavItem { label: string; href: string; icon: LucideIcon; badge?: string; }

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',       href: '/dashboard', icon: LayoutDashboard },
  { label: 'Expenses',        href: '/expenses',  icon: ArrowLeftRight },
  { label: 'Budgets',         href: '/budgets',   icon: PieChart },
  { label: 'Portfolio',       href: '/portfolio', icon: TrendingUp },
  { label: 'Tax Assistant',   href: '/tax',       icon: Calculator },
  { label: 'Fraud Detection', href: '/fraud',     icon: Shield },
  { label: 'AI Assistant',    href: '/assistant', icon: Bot },
  { label: 'Reports',         href: '/reports',   icon: FileText },
];

export interface CategoryMeta {
  label: ExpenseCategory; color: string; badgeClass: string; emoji: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { label: 'Food',          color: '#fb923c', badgeClass: 'badge-food',          emoji: '🍔' },
  { label: 'Travel',        color: '#60a5fa', badgeClass: 'badge-travel',        emoji: '✈️' },
  { label: 'Shopping',      color: '#f472b6', badgeClass: 'badge-shopping',      emoji: '🛍️' },
  { label: 'Bills',         color: '#fbbf24', badgeClass: 'badge-bills',         emoji: '📄' },
  { label: 'Education',     color: '#818cf8', badgeClass: 'badge-education',     emoji: '📚' },
  { label: 'Entertainment', color: '#c084fc', badgeClass: 'badge-entertainment', emoji: '🎬' },
  { label: 'Healthcare',    color: '#4ade80', badgeClass: 'badge-healthcare',    emoji: '🏥' },
  { label: 'Investments',   color: '#2dd4bf', badgeClass: 'badge-investments',   emoji: '📈' },
  { label: 'Others',        color: '#94a3b8', badgeClass: 'badge-others',        emoji: '📦' },
];

export function getCategoryMeta(category: ExpenseCategory): CategoryMeta {
  return CATEGORIES.find((c) => c.label === category) ?? CATEGORIES[CATEGORIES.length - 1];
}

export const CHART_COLORS = {
  primary: '#7c3aed', income: '#22c55e', expenses: '#ef4444',
  savings: '#3b82f6', balance: '#a78bfa',
};

export const CHAT_SUGGESTIONS = [
  'How much did I spend on food this month?',
  'Can I save ₹10,000 more monthly?',
  'Summarize my portfolio performance.',
  'What tax deductions can I claim?',
  'Show my biggest expenses this week.',
  'Which category is over budget?',
];
