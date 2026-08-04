import React from 'react';

export function AdPlaceholder() {
  // Only display in development mode, return null in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      className="my-8 mx-auto w-full max-w-4xl p-4 border border-dashed border-border/60 bg-secondary/10 rounded-lg flex flex-col items-center justify-center min-h-[90px] select-none pointer-events-none"
      role="presentation"
    >
      <span className="text-[10px] tracking-wider uppercase text-muted-foreground/60 font-semibold">
        Future Ad Placement
      </span>
      <span className="text-xs text-muted-foreground/40 mt-1">
        Visible in development mode only
      </span>
    </div>
  );
}
