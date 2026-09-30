import { siteConfig } from './site';

export interface NavLink {
  label: string;
  href: string;
}

export const headerNavLinks: NavLink[] = [
  { label: 'Text to Speech', href: siteConfig.links.textToSpeech },
  { label: 'Audio to Text', href: siteConfig.links.audioToText },
  { label: 'About', href: siteConfig.links.about },
];
