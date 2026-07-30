import { Img, Link, Section } from 'react-email';
import * as React from 'react';
import type { EmailAssets, SocialIconKey } from '../lib/asset-types';

const ICON_DISPLAY_SIZE = 24;

const SOCIAL_LINKS: {
  key: SocialIconKey;
  href: string;
  title: string;
}[] = [
  {
    key: 'discord',
    href: 'https://discord.gg/pNTmzvd7pe',
    title: 'The Civia Project Discord Community',
  },
  {
    key: 'matrix',
    href: 'https://matrix.to/#/#the-civia-project:matrix.org',
    title: 'The Civia Project Matrix Community',
  },
  {
    key: 'youtube',
    href: 'https://www.youtube.com/@theciviaproject',
    title: 'The Civia Project on Youtube',
  },
  {
    key: 'x',
    href: 'https://x.com/theciviaproject',
    title: 'The Civia Project on X',
  },
  {
    key: 'bluesky',
    href: 'https://bsky.app/profile/theciviaproject.org',
    title: 'The Civia Project on Bluesky',
  },
  {
    key: 'instagram',
    href: 'https://www.instagram.com/theciviaproject',
    title: 'The Civia Project on Instagram',
  },
  {
    key: 'facebook',
    href: 'https://www.facebook.com/theciviaproject',
    title: 'The Civia Project on Facebook',
  },
  {
    key: 'threads',
    href: 'https://www.threads.com/@theciviaproject',
    title: 'The Civia Project on Threads',
  },
  {
    key: 'mastodon',
    href: 'https://mastodon.social/@theciviaproject',
    title: 'The Civia Project on Mastodon',
  },
  {
    key: 'tiktok',
    href: 'https://www.tiktok.com/@theciviaproject',
    title: 'The Civia Project on TikTok',
  },
  {
    key: 'github',
    href: 'https://github.com/the-civia-project',
    title: 'The Civia Project on Github',
  },
  {
    key: 'proton',
    href: 'mailto:theciviaproject@protonmail.com',
    title: 'theciviaproject@protonmail.com',
  },
];

type SocialLinksProps = {
  social: EmailAssets['social'];
};

export const SocialLinks = ({
  social,
}: SocialLinksProps): React.ReactElement => (
  <Section style={{ textAlign: 'center', fontSize: 0, lineHeight: 0 }}>
    {SOCIAL_LINKS.map(({ key, href, title }) => (
      <Link
        key={key}
        href={href}
        title={title}
        style={{
          display: 'inline-block',
          padding: '8px',
          lineHeight: 0,
          verticalAlign: 'middle',
        }}
      >
        <Img
          src={social[key]}
          width={ICON_DISPLAY_SIZE}
          height={ICON_DISPLAY_SIZE}
          alt={title}
          style={{ display: 'block', border: 0 }}
        />
      </Link>
    ))}
  </Section>
);
