'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { headerNavLinks } from '@/config/navigation';
import { siteConfig } from '@/config/site';
import { Container } from '../ui/Container';
import { KonthoraBrand } from '../brand/KonthoraBrand';
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
        <KonthoraBrand variant="header" />

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-2" aria-label="Main Navigation">
          {headerNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`metal-pill h-10 px-[18px] text-sm tracking-[-0.01em] ${
                  isActive ? 'border-white/70' : ''
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <Link
            href={siteConfig.links.textToSpeech}
            className="shine solid-metal group hidden lg:inline-flex items-center justify-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
            className="shine glass-ghost inline-flex lg:hidden h-10 w-10 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 cursor-pointer"
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
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
                          className={`metal-pill flex items-center justify-between rounded-lg px-4 py-3 text-base font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                            isActive ? 'border-white/70' : ''
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
                    className="shine solid-metal inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-base font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
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