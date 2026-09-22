'use client';

/**
 * ThemeToggle — clean icon button, light/dark toggle.
 */
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="btn btn-icon"
    >
      {theme === 'dark'
        ? <Sun size={15} />
        : <Moon size={15} />
      }
    </button>
  );
}
