 'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const stored = window.localStorage.getItem('theme') as Theme | null;
    const initial = stored ?? 'system';
    setTheme(initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') applyTheme('system');
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [theme]);

  function applyTheme(next: Theme) {
    const resolved = next === 'system' ? getSystemTheme() : next;
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }

  function handleToggle() {
    const order: Theme[] = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
    window.localStorage.setItem('theme', next);
    applyTheme(next);
  }

  const resolved = theme === 'system' ? getSystemTheme() : theme;
  const label = `Theme: ${theme}`;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={handleToggle}
      className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary shadow-sm transition hover:bg-primary/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
    >
      {resolved === 'dark' ? (
        <Moon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Sun className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="hidden sm:inline">{theme === 'system' ? 'Auto' : resolved === 'dark' ? 'Dark' : 'Light'}</span>
      <span className="sr-only">{label}</span>
    </button>
  );
}

