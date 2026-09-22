'use client';

/**
 * TopNav — Clean top navigation with greeting, search, notifications, and theme toggle.
 * Inspired by Linear / Mercury / Vercel.
 */
import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Search, Bell, X, Moon, Sun } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

function ThemeBtn() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="btn btn-icon" />;
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="btn btn-icon"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

export default function TopNav() {
  const pathname          = usePathname();
  const { toggleSidebar } = useUIStore();
  const { user }          = useAuthStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const notifsRef = useRef<HTMLDivElement>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = user?.name?.split(' ')[0] ?? '';

  useEffect(() => {
    if (!notifsOpen) return;
    const fn = (e: MouseEvent) => {
      if (!notifsRef.current?.contains(e.target as Node)) setNotifsOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [notifsOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 60);
  }, [searchOpen]);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 h-[60px] px-5 md:px-6 bg-[var(--surface)] border-b border-[var(--border)]">
      {/* Hamburger */}
      <button onClick={toggleSidebar} className="btn btn-icon" aria-label="Toggle sidebar">
        <Menu size={16} />
      </button>

      {/* Greeting */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-[var(--text)] truncate hidden sm:block">
          {greeting}{name ? `, ${name}` : ''}
        </p>
      </div>

      {/* Search */}
      <AnimatePresence mode="wait">
        {searchOpen ? (
          <motion.label
            key="open"
            initial={{ width: 36, opacity: 0.5 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 36, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center gap-2 h-9 bg-[var(--bg)] border border-[var(--primary)]
                       rounded-[var(--r-sm)] px-3 ring-3 ring-[var(--primary-subtle)]"
          >
            <Search size={13} className="text-[var(--text-faint)] shrink-0" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search…"
              className="flex-1 bg-transparent border-none text-[13px] min-w-0
                         focus:outline-none focus:border-none focus:shadow-none"
            />
            <button onClick={() => setSearchOpen(false)} className="shrink-0 text-[var(--text-faint)] hover:text-[var(--text)]">
              <X size={12} />
            </button>
          </motion.label>
        ) : (
          <motion.button
            key="closed"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(true)}
            className="btn btn-icon"
            aria-label="Search"
          >
            <Search size={15} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <div className="relative shrink-0" ref={notifsRef}>
        <button onClick={() => setNotifsOpen((v) => !v)} className="btn btn-icon relative" aria-label="Notifications">
          <Bell size={15} />
        </button>
        <AnimatePresence>
          {notifsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-10 w-72 card z-50 p-0 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-[var(--border)]">
                <p className="t-title">Notifications</p>
              </div>
              <div className="py-8 text-center">
                <Bell size={18} className="mx-auto text-[var(--text-faint)] mb-2" />
                <p className="t-muted">You're all caught up</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Theme toggle */}
      <ThemeBtn />

      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full bg-[var(--primary)] flex items-center justify-center
                   text-white text-[11px] font-semibold cursor-pointer shrink-0"
        title={user?.name ?? 'User'}
      >
        {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
      </div>
    </header>
  );
}
