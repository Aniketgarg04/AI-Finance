'use client';

/**
 * MobileBottomNav — clean 5-tab fixed bottom navigation for mobile.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Sparkles, TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { label: 'Home',     href: '/dashboard', icon: LayoutDashboard },
  { label: 'Txns',    href: '/expenses',  icon: ArrowLeftRight },
  { label: 'Budget',  href: '/budgets',   icon: PieChart },
  { label: 'Invest',  href: '/portfolio', icon: TrendingUp },
  { label: 'AI',      href: '/assistant', icon: Sparkles },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav items-stretch" aria-label="Mobile navigation">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center gap-1',
              'text-[11px] font-medium transition-colors duration-150',
              active ? 'text-[var(--blue)]' : 'text-[var(--text-tertiary)]',
            )}
          >
            {active && (
              <motion.span
                layoutId="mobile-tab"
                className="absolute top-0 inset-x-3 h-0.5 bg-[var(--blue)] rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 38 }}
              />
            )}
            <tab.icon size={20} strokeWidth={active ? 2 : 1.5} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
