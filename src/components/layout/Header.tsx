'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { headerNavLinks } from '@/config/navigation';
import { siteConfig } from '@/config/site';
import { ThemeToggle } from '../ThemeToggle';
import { Container } from '../ui/Container';
import { Menu, X, ArrowRight } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
    triggerRef.current?.focus();
  };

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
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/75 backdrop-blur-xl shadow-card">
      <Container className="relative flex h-16 items-center justify-between">
        {/* Brand Wordmark */}
        <Link
          href={siteConfig.links.home}
          aria-label="Konthora Home"
          className="group flex items-center gap-[9px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg px-1.5 py-1"
        >
          <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-gradient-to-b from-primary to-primary-strong shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_2px_4px_rgba(16,185,129,0.15)] transition-transform duration-200 group-hover:scale-105">
            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-[20px] w-[20px] text-white drop-shadow-sm">
              <path d="M7 4a2 2 0 0 0-2 2v12a2 2 0 1 0 4 0V6a2 2 0 0 0-2-2z" />
              <path d="M18.41 5.59a2 2 0 0 0-2.82 0l-4.59 4.59a2 2 0 0 0 0 2.82l4.59 4.59a2 2 0 1 0 2.82-2.82L15.41 12l3-3a2 2 0 0 0 0-2.82z" />
            </svg>
          </span>
          <span className="font-sans text-[17px] font-[650] tracking-[-0.03em] text-foreground leading-none mt-[1px]">{siteConfig.name}</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation" role="list">
          {headerNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                role="listitem"
                aria-current={isActive ? 'page' : undefined}
                className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="header-active-pill"
                    transition={{
                      type: 'spring',
                      duration: reduce ? 0 : 0.4,
                      bounce: 0.25,
                    }}
                    className="absolute inset-0 -z-10 rounded-lg bg-primary/10 ring-1 ring-primary/20"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {/* CTA Button (desktop) */}
          <Link
            href={siteConfig.links.textToSpeech}
            className="group hidden lg:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-from to-brand-to px-4 py-2.5 text-sm font-semibold text-white shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            ref={triggerRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle main menu"
            className="inline-flex lg:hidden items-center justify-center w-10 h-10 rounded-xl border border-border bg-card/60 text-foreground hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors cursor-pointer"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileMenuOpen ? 'close' : 'open'}
                initial={reduce ? false : { rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={reduce ? undefined : { rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="inline-flex"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </Container>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu drawer"
            className="fixed inset-x-0 top-16 z-30 lg:hidden h-[calc(100vh-4rem)]"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
              onClick={handleLinkClick}
              aria-hidden="true"
            />
            {/* Panel */}
            <motion.div
              initial={reduce ? false : { y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? undefined : { y: -12, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="absolute inset-x-0 top-0 bg-background border-b border-border/70 shadow-card"
            >
              <Container className="py-4">
                <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
                  {headerNavLinks.map((link, i) => {
                    const isActive = pathname === link.href;
                    return (
                      <motion.div
                        key={link.href}
                        initial={reduce ? false : { opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: reduce ? 0 : i * 0.04 }}
                      >
                        <Link
                          href={link.href}
                          onClick={handleLinkClick}
                          aria-current={isActive ? 'page' : undefined}
                          className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                            isActive ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : 'text-foreground hover:bg-secondary/50'
                          }`}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                <div className="mt-4 border-t border-border/70 pt-4">
                  <Link
                    href={siteConfig.links.textToSpeech}
                    onClick={handleLinkClick}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-from to-brand-to px-4 py-3 text-base font-semibold text-white shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </Container>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}