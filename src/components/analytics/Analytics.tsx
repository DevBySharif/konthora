'use client';

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

export default function Analytics() {
  return (
    <>
      {GA_MEASUREMENT_ID ? <GoogleAnalytics gaId={GA_MEASUREMENT_ID} /> : null}
      <ClarityAnalytics projectId={CLARITY_PROJECT_ID} />
    </>
  );
}
