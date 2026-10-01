import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { ToolPage } from '@/components/tools/ToolPage';
import { getToolPage } from '@/config/toolPages';

const content = getToolPage('video-to-text')!;

export const metadata: Metadata = constructMetadata({
  title: content.heading,
  description: content.description,
  path: '/video-to-text',
});

export default function VideoToTextPage() {
  return <ToolPage content={content} />;
}
