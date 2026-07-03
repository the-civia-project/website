export type CommunityLinkIcon = 'globe' | 'rocket' | 'discord' | 'matrix';

export type CommunityLink = {
  href: string;
  label: string;
  icon: CommunityLinkIcon;
};

export const communityLinks: CommunityLink[] = [
  {
    href: 'https://theciviaproject.org',
    label: 'theciviaproject.org',
    icon: 'globe',
  },
  {
    href: 'https://demo.theciviaproject.org',
    label: 'demo.theciviaproject.org',
    icon: 'rocket',
  },
  {
    href: 'https://discord.gg/pNTmzvd7pe',
    label: 'discord.gg/pNTmzvd7pe',
    icon: 'discord',
  },
  {
    href: 'https://matrix.to/#/#the-civia-project:matrix.org',
    label: '#the-civia-project:matrix.org',
    icon: 'matrix',
  },
];
