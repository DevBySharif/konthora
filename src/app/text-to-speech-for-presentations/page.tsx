import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { TtsUseCasePage } from '@/components/guides/TtsUseCasePage';
import { getTtsUseCase } from '@/config/ttsUseCases';

const content = getTtsUseCase('text-to-speech-for-presentations')!;

export const metadata: Metadata = constructMetadata({
  title: content.title,
  description: content.description,
  path: '/text-to-speech-for-presentations',
});

export default function TtsForPresentationsPage() {
  return <TtsUseCasePage content={content} />;
}
