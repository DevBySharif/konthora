import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { TtsUseCasePage } from '@/components/guides/TtsUseCasePage';
import { getTtsUseCase } from '@/config/ttsUseCases';

const content = getTtsUseCase('text-to-speech-for-youtube-videos')!;

export const metadata: Metadata = constructMetadata({
  title: content.title,
  description: content.description,
  path: '/text-to-speech-for-youtube-videos',
});

export default function TtsForYouTubePage() {
  return <TtsUseCasePage content={content} />;
}
