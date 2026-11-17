'use client';

import { useEffect } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import ClarityAnalytics from '@/components/analytics/ClarityAnalytics';

// Analytics integration, rendered once from the root layout.
// - Google Analytics 4 via the official @next/third-parties GoogleAnalytics
//   component (auto-tracks client-side route changes; Measurement ID is inlined
//   from NEXT_PUBLIC_GA_MEASUREMENT_ID at build time).
// - Microsoft Clarity via the non-blocking ClarityAnalytics component
//   (NEXT_PUBLIC_CLARITY_PROJECT_ID).
//
// No consent gate: both load whenever a project id is configured. An unset
// variable is a hard no-op, so a build without the ids never requests anything.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || '';

// H2 — Clarity masking of user content.
//
// Clarity has no JavaScript masking API: masking is the `data-clarity-mask`
// attribute, read when Clarity serializes a node (it masks that node and
// its children, overriding any dashboard masking mode). Input boxes are
// masked by Clarity in all modes by default, but rendered text is not —
// so the TTS script textarea, the rendered transcript, and uploaded file
// names are tagged explicitly here. Replay itself stays enabled.
//
// The studio components are owned by the UX track, so the tagger anchors
// on their stable ids / aria labels instead of editing them, and a
// MutationObserver re-tags nodes as React renders them (the transcript
// panel and the upload file card only appear after user actions). The
// anchors are pinned by tests/frontend/clarityMasking.test.mjs: if a
// studio component renames one, that test fails instead of masking
// silently stopping.
const CLARITY_MASK_SELECTORS = [
  '#tts-text-input', // TTS script textarea (defense-in-depth: inputs are masked by default)
  '[aria-label="Editable timestamped transcript"]', // rendered transcript segments
  '[aria-labelledby="source-media-heading"]', // result-panel file name
] as const;

function tagElement(element: Element): void {
  if (!element.hasAttribute('data-clarity-mask')) {
    element.setAttribute('data-clarity-mask', 'true');
  }
}

function tagClarityMaskedSurfaces(): void {
  for (const selector of CLARITY_MASK_SELECTORS) {
    document.querySelectorAll(selector).forEach(tagElement);
  }
  // Uploaded file name: the name span itself has no stable id, so anchor
  // off the file input and tag the name span inside the same upload card.
  const fileName = document
    .getElementById('transcription-file-picker')
    ?.closest('div.rounded-2xl')
    ?.querySelector('span.text-sm.font-semibold.block.truncate');
  if (fileName) tagElement(fileName);
}

function useClarityMasking(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;
    tagClarityMaskedSurfaces();
    const observer = new MutationObserver(() => tagClarityMaskedSurfaces());
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
    return () => observer.disconnect();
  }, [enabled]);
}

export default function Analytics() {
  useClarityMasking(Boolean(CLARITY_PROJECT_ID));
  return (
    <>
      {GA_MEASUREMENT_ID ? <GoogleAnalytics gaId={GA_MEASUREMENT_ID} /> : null}
      <ClarityAnalytics projectId={CLARITY_PROJECT_ID} />
    </>
  );
}
