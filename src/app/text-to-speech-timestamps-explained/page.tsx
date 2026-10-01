import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { AnswerPage } from '@/components/guides/AnswerPage';
import { getAnswerPage } from '@/config/answerPages';

const content = getAnswerPage('text-to-speech-timestamps-explained')!;

export const metadata: Metadata = constructMetadata({
  title: content.title,
  description: content.description,
  path: '/text-to-speech-timestamps-explained',
});

export default function TimestampsExplainedPage() {
  return <AnswerPage content={content} />;
}
