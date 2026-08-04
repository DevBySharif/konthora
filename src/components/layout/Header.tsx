'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { headerNavLinks } from '@/config/navigation';
import { siteConfig } from '@/config/site';
import { ThemeToggle } from '../ThemeToggle';
import { Container } from '../ui/Container';
import { Menu, X, AudioLines } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close mobile menu on route change or when clicking links
  const handleLinkClick = () => {
    setMobileMenuOpen(false);
    // Return focus to the trigger element when menu closes
    triggerRef.current?.focus();
  };

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-colors duration-200">
      <Container className="flex h-16 items-center justify-between">
        {/* Brand Wordmark */}
        <Link
          href={siteConfig.links.home}
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 rounded-lg px-2 py-1"
        >
          <AudioLines className="w-6 h-6 text-primary" strokeWidth={2.5} />
          <span className="font-sans font-extrabold">{siteConfig.name}</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
          {headerNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-md px-2.5 py-1 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Mobile Menu Toggle Button */}
          <button
            ref={triggerRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle main menu"
            className="inline-flex md:hidden items-center justify-center w-10 h-10 rounded-lg border border-border bg-card text-foreground hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </Container>

      {/* Mobile Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu drawer"
          className="fixed inset-0 top-16 z-30 w-full h-[calc(100vh-4rem)] bg-background p-6 border-t border-border md:hidden animate-in fade-in-50 slide-in-from-bottom-5 duration-200"
        >
          <nav className="flex flex-col gap-4" aria-label="Mobile Navigation">
            {headerNavLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className={`text-lg font-semibold transition-colors hover:text-foreground py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-md px-2 ${
                    isActive ? 'text-primary border-l-2 border-primary pl-4' : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
