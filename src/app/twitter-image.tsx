import { ImageResponse } from 'next/og';
import { OgImage } from '@/components/OgImage';

export const alt = 'Konthora — AI Text to Speech and Timestamped Audio Transcription';
export const size = { width: 1200, height: 675 };
export const contentType = 'image/png';

export default async function TwitterImage() {
  return new ImageResponse(<OgImage />, {
    width: size.width,
    height: size.height,
  });
}
