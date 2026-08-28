import { Section } from 'react-email';
import * as React from 'react';
import { BaseEmail } from '../components/BaseEmail';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';
import { Signature } from '../components/Signature';
import { Text } from '../components/Text';
import { U } from '../components/U';
import { WasntYou } from '../components/WasntYou';
import { getEmailAssets } from '../lib/assets';
import { ConfirmSubscriptionProps } from './types';
import { Hr } from '../components/Hr';

export const ConfirmSubscription = ({
  emailId,
  validationCode,
  assets,
}: ConfirmSubscriptionProps): React.ReactElement => {
  const confirmUrl = `https://theciviaproject.org/confirm?code=${validationCode}`;

  return (
    <BaseEmail
      preview="Please confirm your subscription to The Civia Project Newsletter"
      assets={assets}
    >
      <Text>
        <U>
          <strong>Confirm your subscription</strong>
        </U>
      </Text>

      <Text>
        Thanks for signing up to <U>The Civia Project Newsletter</U>. Please{' '}
        <strong>confirm</strong> your email address so we can start sending you
        updates.
      </Text>

      <Section style={{ margin: '24px 0' }}>
        <Button href={confirmUrl} fullWidth>
          Confirm my email address
        </Button>
      </Section>

      <Text>
        If the link does not work, copy and paste this URL into your browser:
      </Text>

      <Text>
        <span className="text-xs break-all text-blue-600 font-bold">
          {confirmUrl}
        </span>
      </Text>

      <Text>
        If you did not request this subscription, you can safely ignore this
        email.
      </Text>

      <Signature />

      <Hr />

      <WasntYou emailId={emailId} subscribed={true} />

      <Footer social={assets.social} />
    </BaseEmail>
  );
};

ConfirmSubscription.PreviewProps = {
  emailId: 'test',
  validationCode: 'preview-validation-code',
  assets: getEmailAssets(),
} satisfies ConfirmSubscriptionProps;

ConfirmSubscription.subject =
  'Confirm your subscription to The Civia Project Newsletter';

export default ConfirmSubscription;
