import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { TtsUseCasePage } from '@/components/guides/TtsUseCasePage';
import { getTtsUseCase } from '@/config/ttsUseCases';

const content = getTtsUseCase('text-to-speech-for-social-media')!;

export const metadata: Metadata = constructMetadata({
  title: content.title,
  description: content.description,
  path: '/text-to-speech-for-social-media',
});

export default function TtsForSocialMediaPage() {
  return <TtsUseCasePage content={content} />;
}
