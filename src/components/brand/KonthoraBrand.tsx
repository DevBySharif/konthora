import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

interface KonthoraBrandProps {
  variant?: 'header' | 'footer';
}

export function KonthoraBrand({ variant = 'header' }: KonthoraBrandProps) {
  const isHeader = variant === 'header';
  
  const gapClass = isHeader ? 'gap-[9px]' : 'gap-[10px]';
  const containerClass = isHeader ? 'h-[36px] w-[36px] rounded-[10px]' : 'h-[40px] w-[40px] rounded-[11px]';
  const svgClass = isHeader ? 'h-[22px] w-[22px]' : 'h-[24px] w-[24px]';
  const wordmarkClass = isHeader ? 'text-[17px]' : 'text-[20px]';

  return (
    <Link
      href={siteConfig.links.home}
      aria-label="Konthora home"
      className={`group flex items-center ${gapClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg px-1 py-1`}
    >
      <span
        className={`inline-flex items-center justify-center bg-gradient-to-b from-primary to-primary-strong shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_2px_4px_rgba(16,185,129,0.15)] transition-transform duration-200 group-hover:scale-105 ${containerClass}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className={`text-white drop-shadow-sm ${svgClass}`}
        >
          {/* Stem */}
          <path d="M7.5 4a1.5 1.5 0 0 0-1.5 1.5v13a1.5 1.5 0 0 0 3 0v-13A1.5 1.5 0 0 0 7.5 4z" />
          {/* Chevron */}
          <path d="M18.7 5.3a1.5 1.5 0 0 0-2.12 0l-4.24 4.24a1.5 1.5 0 0 0 0 2.12l4.24 4.24a1.5 1.5 0 1 0 2.12-2.12L15.56 10.6l3.14-3.18a1.5 1.5 0 0 0 0-2.12z" />
        </svg>
      </span>
      <span
        className={`font-sans font-[650] tracking-[-0.03em] text-foreground leading-none mt-[1px] ${wordmarkClass}`}
      >
        {siteConfig.name}
      </span>
    </Link>
  );
}
