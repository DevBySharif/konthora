'use client';

import { GoogleAnalytics } from '@next/third-parties/google';
import ClarityAnalytics from '@/components/analytics/ClarityAnalytics';

// Analytics integration, rendered once from the root layout.
// - Google Analytics 4 via the official @next/third-parties GoogleAnalytics
//   component (auto-tracks client-side route changes; Measurement ID is inlined
//   from NEXT_PUBLIC_GA_MEASUREMENT_ID at build time).
// - Microsoft Clarity via the non-blocking ClarityAnalytics component
//   (NEXT_PUBLIC_CLARITY_PROJECT_ID).
// Both are loaded in production only.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const isProduction = process.env.NODE_ENV === 'production';

export default function Analytics() {
  return (
    <>
      {isProduction && GA_MEASUREMENT_ID ? <GoogleAnalytics gaId={GA_MEASUREMENT_ID} /> : null}
      <ClarityAnalytics />
    </>
  );
}