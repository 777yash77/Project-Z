'use client';

import { useState, useEffect } from 'react';
import { useTheme } from './theme-provider';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300"
      style={{
        border: '1px solid var(--border-mid)',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--accent)',
        boxShadow: '0 0 12px var(--accent-glow)',
        minWidth: '110px',
      }}
    >
      {/* Animated icon */}
      <span className="relative flex h-5 w-5 items-center justify-center">
        <span
          className="absolute transition-all duration-300"
          style={{
            opacity: mounted && isDark ? 1 : 0,
            transform: mounted && isDark ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0.5)',
          }}
        >
          <Sun size={18} />
        </span>
        <span
          className="absolute transition-all duration-300"
          style={{
            opacity: mounted && !isDark ? 1 : 0,
            transform: mounted && !isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)',
          }}
        >
          <Moon size={18} />
        </span>
      </span>

      {/* Label */}
      <span>{!mounted ? 'Theme' : (isDark ? 'Light mode' : 'Dark mode')}</span>

      {/* Active dot */}
      <span
        className="ml-auto h-2 w-2 rounded-full"
        style={{
          backgroundColor: 'var(--accent)',
          boxShadow: '0 0 6px var(--accent)',
        }}
      />
    </button>
  );
}
