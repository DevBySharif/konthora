import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

interface KonthoraBrandProps {
  variant?: 'header' | 'footer';
}

export function KonthoraBrand({ variant = 'header' }: KonthoraBrandProps) {
  const isHeader = variant === 'header';
  
  const gapClass = isHeader ? 'gap-[9px]' : 'gap-[10px]';
  const containerClass = isHeader ? 'h-[36px] w-[36px]' : 'h-[40px] w-[40px]';
  const imageSize = isHeader ? '36px' : '40px';
  const wordmarkClass = isHeader ? 'text-[17px]' : 'text-[20px]';

  return (
    <Link
      href={siteConfig.links.home}
      aria-label="Konthora home"
      className={`group flex items-center ${gapClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg px-1 py-1`}
    >
      <span
        className={`relative inline-flex shrink-0 transition-transform duration-200 group-hover:scale-105 ${containerClass}`}
      >
        <Image
          src="/brand/konthora-logo-light.svg"
          alt="Konthora"
          fill
          sizes={imageSize}
          unoptimized
          style={{
            width: '120%',
            height: '120%',
            top: '-10%',
            right: 'auto',
            bottom: 'auto',
            left: '-10%',
          }}
          className="konthora-logo konthora-logo--light object-contain"
        />
        <Image
          src="/brand/konthora-logo-dark.svg"
          alt="Konthora"
          fill
          sizes={imageSize}
          unoptimized
          style={{
            width: '120%',
            height: '120%',
            top: '-10%',
            right: 'auto',
            bottom: 'auto',
            left: '-10%',
          }}
          className="konthora-logo konthora-logo--dark object-contain"
        />
      </span>
      <span
        className={`font-sans font-[650] tracking-[-0.03em] text-foreground leading-none mt-[1px] ${wordmarkClass}`}
      >
        {siteConfig.name}
      </span>
    </Link>
  );
}
