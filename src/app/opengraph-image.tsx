import { ImageResponse } from 'next/og';
import { getOgLogoDataUri, OgImage } from '@/components/OgImage';

export const alt = 'Konthora — AI Text to Speech and Timestamped Audio Transcription';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  const logoSrc = await getOgLogoDataUri();

  return new ImageResponse(<OgImage logoSrc={logoSrc} />, {
    width: size.width,
    height: size.height,
    headers: {
      'X-Robots-Tag': 'noindex',
    },
  });
}
