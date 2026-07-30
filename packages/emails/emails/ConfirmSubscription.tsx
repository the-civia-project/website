import { Section } from '@react-email/components';
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
        <strong>
          <U>Confirm your subscription</U>
        </strong>
      </Text>

      <Text>
        Thanks for signing up to The Civia Project Newsletter. Please confirm
        your email address so we can start sending you updates.
      </Text>

      <Section style={{ textAlign: 'center', margin: '24px 0' }}>
        <Button href={confirmUrl}>Confirm my email address</Button>
      </Section>

      <Text>
        If the link does not work, copy and paste this URL into your browser:
      </Text>

      <Text>
        <span className="text-xs break-all">{confirmUrl}</span>
      </Text>

      <Text>
        If you did not request this subscription, you can safely ignore this
        email.
      </Text>

      <Signature />

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
