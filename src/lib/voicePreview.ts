export function getVoicePreviewSource(voiceId: string, providedUrl?: string): string {
  return providedUrl || `/audio/voice-previews/${encodeURIComponent(voiceId)}.mp3`;
}
