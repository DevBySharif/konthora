import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { ToolPage } from '@/components/tools/ToolPage';
import { getToolPage } from '@/config/toolPages';

const content = getToolPage('mp3-to-text')!;

export const metadata: Metadata = constructMetadata({
  title: content.heading,
  description: content.description,
  path: '/mp3-to-text',
});

export default function Mp3ToTextPage() {
  return <ToolPage content={content} />;
}
