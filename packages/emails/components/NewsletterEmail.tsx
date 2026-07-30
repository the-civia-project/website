import * as React from 'react';
import type { EmailAssets } from '../lib/asset-types';
import { BaseEmail } from './BaseEmail';
import type { BaseEmailProps } from './BaseEmail';
import { CommunityButtons } from './CommunityButtons';
import { Footer } from './Footer';
import { Signature } from './Signature';
import { Text } from './Text';
import { U } from './U';

type NewsletterEmailProps = Omit<BaseEmailProps, 'assets'> & {
  emailId: string;
  assets: EmailAssets;
};

export const NewsletterEmail = ({
  children,
  preview,
  emailId,
  assets,
}: NewsletterEmailProps): React.ReactElement => (
  <BaseEmail preview={preview} assets={assets}>
    <Text>
      Hello{' '}
      <strong>
        <U>friend!</U>
      </strong>
    </Text>

    {children}

    <Signature />

    <CommunityButtons />

    <Footer social={assets.social} emailId={emailId} showUnsubscribe />
  </BaseEmail>
);
