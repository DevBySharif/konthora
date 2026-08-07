import { useState, useRef, useEffect, useCallback } from 'react';
import { trackTtsVoicePreviewPlayed } from '@/components/analytics/events';

export type PreviewStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export function useVoicePreview() {
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>('idle');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackedVoicesRef = useRef<Set<string>>(new Set());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.oncanplaythrough = null;
        audioRef.current.onerror = null;
        audioRef.current.onended = null;
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const stopPreview = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.oncanplaythrough = null;
      audioRef.current.onerror = null;
      audioRef.current.onended = null;
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setActivePreviewId(null);
    setPreviewStatus('idle');
  }, []);

  const pausePreview = useCallback(() => {
    if (audioRef.current && previewStatus === 'playing') {
      audioRef.current.pause();
      setPreviewStatus('paused');
    }
  }, [previewStatus]);

  const resumePreview = useCallback(() => {
    if (audioRef.current && previewStatus === 'paused') {
      audioRef.current.play().catch(() => setPreviewStatus('error'));
      setPreviewStatus('playing');
    }
  }, [previewStatus]);

  const playPreview = useCallback((voiceId: string, voiceMetadata: { accent: string, gender: string, recommended?: boolean, previewUrl?: string }) => {
    if (activePreviewId === voiceId) {
      if (previewStatus === 'playing') {
        pausePreview();
      } else if (previewStatus === 'paused') {
        resumePreview();
      }
      return;
    }

    // Start fresh preview for the new voice, preferring the API-provided URL
    stopPreview();
    setActivePreviewId(voiceId);
    setPreviewStatus('loading');

    const audio = new Audio(voiceMetadata.previewUrl || `/audio/voice-previews/${voiceId}.mp3`);
    audioRef.current = audio;

    audio.oncanplaythrough = () => {
      if (audioRef.current !== audio) return;
      audio.play().then(() => {
        if (audioRef.current !== audio) return;
        setPreviewStatus('playing');
        
        // Track at most once per session per voice
        if (!trackedVoicesRef.current.has(voiceId)) {
          trackedVoicesRef.current.add(voiceId);
          trackTtsVoicePreviewPlayed({
            voice_id: voiceId,
            accent: voiceMetadata.accent,
            gender: voiceMetadata.gender,
            recommended: !!voiceMetadata.recommended
          });
        }
      }).catch(() => {
        if (audioRef.current !== audio) return;
        setPreviewStatus('error');
      });
    };

    audio.onerror = () => {
      if (audioRef.current !== audio) return;
      setPreviewStatus('error');
    };

    audio.onended = () => {
      if (audioRef.current !== audio) return;
      setPreviewStatus('idle');
      setActivePreviewId(null);
    };
  }, [activePreviewId, previewStatus, stopPreview, pausePreview, resumePreview]);

  return {
    activePreviewId,
    previewStatus,
    playPreview,
    pausePreview,
    resumePreview,
    stopPreview
  };
}
