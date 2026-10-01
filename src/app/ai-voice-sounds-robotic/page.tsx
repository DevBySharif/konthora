import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { AnswerPage } from '@/components/guides/AnswerPage';
import { getAnswerPage } from '@/config/answerPages';

const content = getAnswerPage('ai-voice-sounds-robotic')!;

export const metadata: Metadata = constructMetadata({
  title: content.title,
  description: content.description,
  path: '/ai-voice-sounds-robotic',
});

export default function AiVoiceRoboticPage() {
  return <AnswerPage content={content} />;
}
