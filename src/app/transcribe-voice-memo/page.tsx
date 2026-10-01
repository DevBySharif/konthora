import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { TranscribeGuidePage } from '@/components/guides/TranscribeGuidePage';
import { getGuide } from '@/config/transcribeGuides';

const guide = getGuide('transcribe-voice-memo')!;

export const metadata: Metadata = constructMetadata({
  title: guide.title,
  description: guide.description,
  path: '/transcribe-voice-memo',
});

export default function TranscribeVoiceMemoPage() {
  return <TranscribeGuidePage guide={guide} />;
}
