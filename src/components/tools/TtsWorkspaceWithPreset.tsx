'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TtsWorkspace } from './TtsWorkspace';

function TtsWorkspaceWithPresetInner() {
  const searchParams = useSearchParams();
  const voice = searchParams.get('voice');
  return <TtsWorkspace initialVoiceId={voice} />;
}

function TtsWorkspaceFallback() {
  return <div className="min-h-[420px]" aria-hidden="true" />;
}

/**
 * Embeds the TTS workspace and pre-selects the voice named by the
 * `voice` query parameter (e.g. /text-to-speech?voice=af_heart).
 * The inner component reads useSearchParams inside a Suspense boundary so it
 * can be embedded on statically prerendered pages without breaking the build.
 */
export function TtsWorkspaceWithPreset() {
  return (
    <Suspense fallback={<TtsWorkspaceFallback />}>
      <TtsWorkspaceWithPresetInner />
    </Suspense>
  );
}