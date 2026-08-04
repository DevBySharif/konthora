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

export const footerNavLinks = {
  tools: [
    { label: 'Text to Speech', href: siteConfig.links.textToSpeech },
    { label: 'Audio to Text', href: siteConfig.links.audioToText },
  ],
  info: [
    { label: 'About Us', href: siteConfig.links.about },
    { label: 'Contact', href: siteConfig.links.contact },
  ],
  legal: [
    { label: 'Privacy Policy', href: siteConfig.links.privacy },
    { label: 'Terms of Service', href: siteConfig.links.terms },
    { label: 'Copyright & Removal', href: siteConfig.links.copyright },
  ],
};
