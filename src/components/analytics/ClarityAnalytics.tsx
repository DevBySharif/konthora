'use client';

import { useEffect } from 'react';

// Official Microsoft Clarity snippet, adapted to load only after the page has
// become interactive and idling (never blocking the first render). The script
// is injected asynchronously; the `clarity` queue function is defined before
// the network request so early calls are buffered like the default loader.
const SCRIPT_BASE = 'https://www.clarity.ms/tag/';

function injectClarity(projectId: string) {
  try {
    const existing = (window as unknown as { clarity?: { q?: unknown[] } }).clarity;
    if (existing?.q) {
      return;
    }
    const inject = () => {
      const c = window as unknown as Record<string, unknown>;
      const d = document;
      const script = 'script';
      c.clarity = c.clarity || function (this: unknown, ...args: unknown[]) {
        ((c.clarity as { q?: unknown[] }).q = (c.clarity as { q?: unknown[] }).q || []).push(args);
      };
      const tag = d.createElement(script);
      tag.async = true;
      tag.src = `${SCRIPT_BASE}${projectId}`;
      const first = d.getElementsByTagName(script)[0];
      first?.parentNode?.insertBefore(tag, first);
    };

    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(inject, { timeout: 3000 });
    } else {
      setTimeout(inject, 1500);
    }
  } catch (error) {
    // Analytics must never break the page.
    console.error('Clarity init failed', error);
  }
}

export default function ClarityAnalytics() {
  useEffect(() => {
    // Production only — no-op in development/test builds and when the project ID is
    // unset (the variable is inlined at build time).
    if (process.env.NODE_ENV !== 'production') {
      return;
    }
    const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
    if (!projectId) {
      return;
    }
    injectClarity(projectId);
  }, []);

  return null;
}