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
        backgroundColor: '#0f0f23',
        backgroundImage: 'linear-gradient(135deg, #0f0f23 0%, #1e1b4b 55%, #312e81 100%)',
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
          <span style={{ fontSize: '26px', color: '#a5b4fc', marginTop: '4px' }}>
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
            backgroundColor: '#4f46e5',
            color: '#ffffff',
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
            border: '2px solid #6366f1',
            color: '#c7d2fe',
          }}
        >
          SRT · VTT · Word Timestamps
        </span>
      </div>
    </div>
  );
}
