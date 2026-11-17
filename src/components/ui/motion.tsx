'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

/**
 * Scroll reveals that are visible by default.
 *
 * The previous implementation used framer-motion scroll-triggered reveals
 * that started fully transparent. In a full-page capture, print, or any
 * run where the animation never fires, whole sections stayed invisible
 * — viewport-tall pure-black voids between the hero and the footer (audit
 * P0-1). These primitives flip the default: content renders fully visible
 * (opacity 1, no transform) and an IntersectionObserver only adds an
 * `is-in` class that plays a short transform-only CSS rise. If the
 * observer never fires, animations are disabled, or JS is off, the content
 * is simply there. Mid-animation the text is still readable — the keyframe
 * never touches opacity.
 */

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}

function useInViewOnce(once: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      // Very old browser: no observer, so reveal immediately. Deferred so
      // the state update is not a synchronous setState-in-effect.
      let cancelled = false;
      queueMicrotask(() => {
        if (!cancelled) setInView(true);
      });
      return () => {
        cancelled = true;
      };
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { rootMargin: '-80px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return { ref, inView };
}

export function Reveal({ children, className, delay = 0, y = 24, once = true }: RevealProps) {
  const { ref, inView } = useInViewOnce(once);

  return (
    <div
      ref={ref}
      className={`reveal${inView ? ' is-in' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--reveal-delay': `${delay}s`, '--reveal-y': `${y}px` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

interface StaggerContextValue {
  delay: number;
  step: number;
  once: boolean;
  /** Next item index, in render order. Only feeds the animation delay. */
  nextIndex: () => number;
}

const StaggerContext = createContext<StaggerContextValue | null>(null);

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  once?: boolean;
}

/**
 * Container that staggers its child <StaggerItem/>s into view. The
 * container itself never hides anything; each item reveals on its own
 * IntersectionObserver with a delay derived from its index.
 */
export function Stagger({ children, className, stagger = 0.08, delay = 0, once = true }: StaggerProps) {
  const counterRef = useRef(0);
  const value: StaggerContextValue = {
    delay,
    step: stagger,
    once,
    nextIndex: () => {
      const index = counterRef.current;
      counterRef.current += 1;
      return index;
    },
  };

  return (
    <StaggerContext.Provider value={value}>
      <div className={className}>{children}</div>
    </StaggerContext.Provider>
  );
}

export function StaggerItem({ children, className, y = 24 }: { children: React.ReactNode; className?: string; y?: number }) {
  const ctx = useContext(StaggerContext);
  // Registered once, in render order — this only sets the animation delay,
  // so an off-by-one in StrictMode dev double-render is cosmetic.
  const [index] = useState(() => ctx?.nextIndex() ?? 0);
  const { ref, inView } = useInViewOnce(ctx?.once ?? true);
  const delay = (ctx?.delay ?? 0) + index * (ctx?.step ?? 0.08);

  return (
    <div
      ref={ref}
      className={`reveal${inView ? ' is-in' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--reveal-delay': `${delay}s`, '--reveal-y': `${y}px` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
