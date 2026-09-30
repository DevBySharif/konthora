import React from 'react';

/**
 * Concise, self-contained factual summary of a page, used for `Speakable`
 * schema so voice assistants and AI answer engines can quote the page's core
 * claim verbatim.
 *
 * Rules this enforces:
 *  - the text must be plain, factual, and self-contained (no "click here")
 *  - it must match the visible copy closely enough not to mislead
 *  - it is rendered visually hidden, so screen readers still get it
 *
 * The `id` is referenced by both the schema `cssSelector` and the DOM element;
 * keep them in sync.
 */
export function SpeakableSummary({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="sr-only">
      {children}
    </p>
  );
}