import React from 'react';
import Link from 'next/link';
import { AudioLines, Mail, Sparkles } from 'lucide-react';
import { footerNavLinks } from '@/config/navigation';
import { siteConfig } from '@/config/site';
import { Container } from '../ui/Container';

const socials = [
  {
    label: 'X (Twitter)',
    href: 'https://x.com/',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/',
    path: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z',
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/',
    path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/',
    path: 'M20.447 20.452h-3.554v-5.519c0-.124 0-.124.003-.18v.001h.023a3.771 3.771 0 0 1-1.042 2.893 3.635 3.635 0 0 1-2.211.82 3.337 3.337 0 0 1-2.612-1.243 3.412 3.412 0 0 1-.781-2.22V14.26h-3.554v11.192h3.554v-5.6c0-1.561.296-3.07 2.228-3.07 1.904 0 1.929 1.78 1.929 3.171v5.499h3.554zM4.229 4.75a2.137 2.137 0 0 0 2.13 2.134 2.137 2.137 0 0 0 0-4.268 2.137 2.137 0 0 0 0 4.268 2.137 2.137 0 0 6.735-2.134zM2.594 26.16h3.554V14.26H2.594v11.9z',
  },
];

const columns = [
  { title: 'Product', links: footerNavLinks.tools },
  { title: 'Resources', links: footerNavLinks.info },
  { title: 'Legal', links: footerNavLinks.legal },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-card/40 text-foreground transition-colors duration-200" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <Container className="py-14 md:py-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand section */}
          <div className="col-span-2 md:col-span-1 lg:col-span-4">
            <Link
              href={siteConfig.links.home}
              className="group inline-flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-card-hover transition-transform duration-200 group-hover:scale-105">
                <AudioLines className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <span className="font-sans font-extrabold">{siteConfig.name}</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>

            {/* Social icons */}
            <ul className="mt-6 flex items-center gap-3" aria-label="Social links">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-card text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                      <path d={s.path} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 col-span-2 sm:grid-cols-none sm:grid-cols-3 md:col-span-1 lg:col-span-8">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground">
                  {col.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-md"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Contact strip */}
        <div className="mt-12 mb-0 rounded-2xl border border-border/70 bg-card/60 p-5">
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-md"
          >
            <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
            {siteConfig.contactEmail}
          </a>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-6 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/80">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Built with modern AI audio tools
          </p>
        </div>
      </Container>
    </footer>
  );
}