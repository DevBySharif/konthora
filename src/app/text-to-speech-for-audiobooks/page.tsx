import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { TtsUseCasePage } from '@/components/guides/TtsUseCasePage';
import { getTtsUseCase } from '@/config/ttsUseCases';

const content = getTtsUseCase('text-to-speech-for-audiobooks')!;

export const metadata: Metadata = constructMetadata({
  title: content.title,
  description: content.description,
  path: '/text-to-speech-for-audiobooks',
});

export default function TtsForAudiobooksPage() {
  return <TtsUseCasePage content={content} />;
}
