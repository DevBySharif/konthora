import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { TranscribeGuidePage } from '@/components/guides/TranscribeGuidePage';
import { getGuide } from '@/config/transcribeGuides';

const guide = getGuide('transcribe-interview')!;

export const metadata: Metadata = constructMetadata({
  title: guide.title,
  description: guide.description,
  path: '/transcribe-interview',
});

export default function TranscribeInterviewPage() {
  return <TranscribeGuidePage guide={guide} />;
}
