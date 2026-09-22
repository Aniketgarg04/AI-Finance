'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, Sparkles, ArrowLeftRight,
  TrendingUp, PieChart, Lightbulb, FileText,
  Settings, ChevronsLeft, ChevronsRight, LogOut,
  Wallet, type LucideIcon,
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

interface NavItem { label: string; href: string; icon: LucideIcon; }

const GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: '',
    items: [
      { label: 'Dashboard',    href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Transactions', href: '/expenses',  icon: ArrowLeftRight },
      { label: 'Portfolio',    href: '/portfolio', icon: TrendingUp },
      { label: 'Budget',       href: '/budgets',   icon: PieChart },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'AI Copilot',   href: '/assistant', icon: Sparkles },
      { label: 'Insights',     href: '/fraud',     icon: Lightbulb },
      { label: 'Reports',      href: '/reports',   icon: FileText },
      { label: 'Settings',     href: '/tax',       icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <aside className={cn('sidebar', sidebarOpen && 'open')}>
        {/* Brand */}
        <div className={cn(
          'flex items-center h-[60px] px-3 border-b shrink-0 gap-2.5',
          'border-[var(--border)]',
          sidebarOpen ? 'justify-between' : 'justify-center',
        )}>
          <div className={cn('flex items-center gap-2.5', !sidebarOpen && 'justify-center')}>
            <div className="w-7 h-7 rounded-[8px] bg-[var(--primary)] flex items-center justify-center shrink-0">
              <Wallet size={13} className="text-white" strokeWidth={2.5} />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="text-[14px] font-semibold text-[var(--text)] truncate"
                >
                  Finance AI
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={toggleSidebar}
            className={cn(
              'hidden md:flex btn btn-ghost w-6 h-6 p-0 rounded-[6px] shrink-0',
              !sidebarOpen && 'mx-auto',
            )}
            aria-label={sidebarOpen ? 'Collapse' : 'Expand'}
          >
            {sidebarOpen
              ? <ChevronsLeft size={14} className="text-[var(--text-faint)]" />
              : <ChevronsRight size={14} className="text-[var(--text-faint)]" />
            }
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 no-scroll">
          {GROUPS.map((group) => (
            <div key={group.label || '_'} className="mb-1">
              <AnimatePresence>
                {sidebarOpen && group.label && (
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="px-3 pb-1 pt-3 t-label"
                  >
                    {group.label}
                  </motion.p>
                )}
              </AnimatePresence>

              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}
                    {...(!sidebarOpen && { 'data-tip': item.label })}
                    className={cn(
                      'relative flex items-center gap-2.5 rounded-[8px] mx-2 my-px',
                      'text-[13.5px] transition-all duration-150',
                      sidebarOpen ? 'px-2.5 py-[7px]' : 'py-[7px] px-0 justify-center',
                      active
                        ? 'bg-[var(--primary-subtle)] text-[var(--primary)] font-medium'
                        : 'text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]',
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[var(--primary)]"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}
                    <item.icon
                      size={15}
                      strokeWidth={active ? 2 : 1.75}
                      className={cn('shrink-0', active ? 'text-[var(--primary)]' : 'text-[var(--text-faint)]')}
                    />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          transition={{ duration: 0.1 }}
                          className="truncate"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="shrink-0 border-t border-[var(--border)] p-2">
          <div className={cn(
            'flex items-center gap-2 rounded-[8px] p-1.5',
            !sidebarOpen && 'justify-center flex-col',
          )}>
            <div className="w-7 h-7 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-[11px] font-semibold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-[12px] font-medium text-[var(--text)] truncate leading-tight">
                    {user?.name ?? 'User'}
                  </p>
                  <p className="text-[11px] text-[var(--text-faint)] truncate leading-tight">
                    {user?.email ?? ''}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={handleLogout}
              className={cn(
                'btn btn-ghost p-1.5 rounded-[6px] text-[var(--text-faint)] hover:text-[var(--danger)]',
                !sidebarOpen && 'w-full justify-center mt-1',
              )}
              title="Sign out"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
