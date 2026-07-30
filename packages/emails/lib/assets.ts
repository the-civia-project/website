import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EMAIL_ASSET_PATHS,
  SOCIAL_ICON_KEYS,
  type SocialIconKey,
} from '@the-civia-project/assets/email';
import dotenv from 'dotenv';
import type { EmailAssets } from './asset-types';

export type { EmailAssets, SocialIconKey } from './asset-types';

if (process.env.NODE_ENV !== 'production') {
  const packageRoot = dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: join(packageRoot, '..', '..', '..', '.env'), quiet: true });
}

function websiteBaseUrl(): string {
  const base = process.env.WEBSITE_URL;
  if (!base) {
    throw new Error('WEBSITE_URL environment variable is required');
  }
  return base.replace(/\/$/, '');
}

/** Absolute CDN URLs for email HTML (`WEBSITE_URL` + `/email/...`). */
export function getEmailAssets(): EmailAssets {
  const base = websiteBaseUrl();

  return {
    logo: `${base}${EMAIL_ASSET_PATHS.logo}`,
    social: Object.fromEntries(
      SOCIAL_ICON_KEYS.map((key) => [
        key,
        `${base}${EMAIL_ASSET_PATHS.social[key]}`,
      ]),
    ) as Record<SocialIconKey, string>,
  };
}
