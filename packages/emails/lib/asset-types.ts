import type { SocialIconKey } from '@the-civia-project/assets/email';

export type { SocialIconKey };

export type EmailAssets = {
  logo: string;
  social: Record<SocialIconKey, string>;
};
