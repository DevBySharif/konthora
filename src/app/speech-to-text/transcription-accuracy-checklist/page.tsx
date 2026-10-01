import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { AnswerPage } from '@/components/guides/AnswerPage';
import { getAnswerPage } from '@/config/answerPages';

const content = getAnswerPage('speech-to-text/transcription-accuracy-checklist')!;

export const metadata: Metadata = constructMetadata({
  title: content.title,
  description: content.description,
  path: '/speech-to-text/transcription-accuracy-checklist',
});

export default function TranscriptionAccuracyChecklistPage() {
  return <AnswerPage content={content} />;
}
