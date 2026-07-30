export type SocialIconKey =
  | 'discord'
  | 'matrix'
  | 'youtube'
  | 'x'
  | 'bluesky'
  | 'instagram'
  | 'facebook'
  | 'threads'
  | 'mastodon'
  | 'tiktok'
  | 'github'
  | 'proton';

export const SOCIAL_ICON_KEYS: SocialIconKey[] = [
  'discord',
  'matrix',
  'youtube',
  'x',
  'bluesky',
  'instagram',
  'facebook',
  'threads',
  'mastodon',
  'tiktok',
  'github',
  'proton',
];

/** Display size in email HTML (CSS pixels). */
export const EMAIL_LOGO_DISPLAY = { width: 64, height: 64 } as const;
export const EMAIL_ICON_DISPLAY = { width: 16, height: 16 } as const;

/** Raster size at 2× for retina. */
export const EMAIL_LOGO_RASTER = {
  width: EMAIL_LOGO_DISPLAY.width * 2,
  height: EMAIL_LOGO_DISPLAY.height * 2,
} as const;
export const EMAIL_ICON_RASTER = {
  width: EMAIL_ICON_DISPLAY.width * 2,
  height: EMAIL_ICON_DISPLAY.height * 2,
} as const;

/** Public URL paths served from the website (`/email/...`). */
export const EMAIL_ASSET_PATHS = {
  logo: '/email/logo.png',
  social: Object.fromEntries(
    SOCIAL_ICON_KEYS.map((key) => [key, `/email/social/${key}.png`]),
  ) as Record<SocialIconKey, string>,
} as const;
