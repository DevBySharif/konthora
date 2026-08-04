'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, Theme } from './ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Toggle dropdown visibility
  const toggleDropdown = () => setIsOpen((prev) => !prev);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  const getThemeIcon = (t: Theme) => {
    switch (t) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Change theme. Current: ${theme}`}
        className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-card text-foreground hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors cursor-pointer"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-5 h-5 text-indigo-400" />
        ) : (
          <Sun className="w-5 h-5 text-amber-500" />
        )}
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label="Theme options"
          className="absolute right-0 mt-2 w-32 rounded-xl border border-border bg-card p-1 shadow-lg ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-2 duration-100"
        >
          {(['light', 'dark', 'system'] as Theme[]).map((option) => (
            <li key={option}>
              <button
                role="option"
                aria-selected={theme === option}
                onClick={() => selectTheme(option)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-left cursor-pointer transition-colors ${
                  theme === option
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-secondary/50'
                }`}
              >
                {getThemeIcon(option)}
                <span className="capitalize">{option}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
