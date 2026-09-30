import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { siteConfig } from '@/config/site';

interface OgImageProps {
  logoSrc: string;
}

export async function getOgLogoDataUri() {
  const logo = await readFile(
    join(process.cwd(), 'public', 'brand', 'konthora-logo-dark-512.png'),
  );

  return `data:image/png;base64,${logo.toString('base64')}`;
}

/**
 * Shared visual for Open Graph and Twitter social cards.
 * Rendered by src/app/opengraph-image.tsx and src/app/twitter-image.tsx.
 * Uses only inline styles (emotion-compatible) for `next/og` ImageResponse.
 */
export function OgImage({ logoSrc }: OgImageProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        backgroundColor: '#000000',
        backgroundImage: 'linear-gradient(135deg, #000000 0%, #0a0a0a 55%, #141414 100%)',
        color: '#ffffff',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '40px',
        }}
      >
        {/* ImageResponse renders native image elements rather than next/image. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt=""
          width={88}
          height={88}
          style={{ objectFit: 'contain' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '44px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {siteConfig.name}
          </span>
          <span style={{ fontSize: '26px', color: '#9a9a9a', marginTop: '4px' }}>
            {siteConfig.tagline}
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontSize: '62px',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
        }}
      >
        <span>AI Text to Speech</span>
        <span>&amp; Timestamped Transcription</span>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginTop: '48px' }}>
        <span
          style={{
            borderRadius: '9999px',
            padding: '16px 28px',
            fontSize: '28px',
            fontWeight: 600,
            backgroundColor: '#ffffff',
            color: '#111111',
          }}
        >
          Natural Voices
        </span>
        <span
          style={{
            borderRadius: '9999px',
            padding: '16px 28px',
            fontSize: '28px',
            fontWeight: 600,
            border: '2px solid rgba(198,198,198,0.55)',
            color: '#f3f3f3',
          }}
        >
          SRT · VTT · Word Timestamps
        </span>
      </div>
    </div>
  );
}
