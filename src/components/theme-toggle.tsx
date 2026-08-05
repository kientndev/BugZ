'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-lg bg-zinc-900/10 border border-zinc-800/40" />;
  }

  const themesList = [
    { name: 'Light', value: 'light', icon: Sun },
    { name: 'Dark', value: 'dark', icon: Moon },
    { name: 'System', value: 'system', icon: Laptop },
  ];

  const CurrentIcon =
    theme === 'dark' ? Moon : theme === 'light' ? Sun : Laptop;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/20 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition flex items-center justify-center w-8 h-8"
        title="Toggle Theme"
      >
        <CurrentIcon className="h-4 w-4 shrink-0" />
      </button>

      {open && (
        <>
          {/* Backdrop to close */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          
          <div className="absolute right-0 mt-2 w-28 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            {themesList.map((item) => {
              const IconComp = item.icon;
              const isSelected = theme === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => {
                    setTheme(item.value);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs font-medium flex items-center space-x-2 transition ${
                    isSelected
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-250'
                  }`}
                >
                  <IconComp className="h-3.5 w-3.5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
