import * as React from 'react';
import { BaseEmail } from '../components/BaseEmail';
import { Hr } from '../components/Hr';
import { Link } from '../components/Link';
import { Signature } from '../components/Signature';
import { Text } from '../components/Text';
import { U } from '../components/U';
import { WasntYou } from '../components/WasntYou';
import { ConfirmSubscriptionProps } from './types';

export const ConfirmSubscription = ({
  emailId,
  validationCode,
}: ConfirmSubscriptionProps): React.ReactElement => {
  const confirmUrl = `https://theciviaproject.org/confirm?code=${validationCode}`;

  return (
    <BaseEmail preview="Please confirm your subscription to The Civia Project Newsletter">
      <Text>
        <strong>
          <U>Confirm your subscription</U>
        </strong>
      </Text>

      <Text>
        Thanks for signing up to The Civia Project Newsletter. Please confirm
        your email address so we can start sending you updates.
      </Text>

      <Text>
        <Link href={confirmUrl}>Confirm my email address</Link>
      </Text>

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

      <Hr />

      <WasntYou emailId={emailId} subscribed={true} />

      <Hr />

      <Text>
        <span className="text-xs">
          <Link href="https://theciviaproject.org/privacy">Privacy Policy</Link>
        </span>
      </Text>
    </BaseEmail>
  );
};

ConfirmSubscription.PreviewProps = {
  emailId: 'test',
  validationCode: 'preview-validation-code',
} satisfies ConfirmSubscriptionProps;

ConfirmSubscription.subject =
  'Confirm your subscription to The Civia Project Newsletter';

export default ConfirmSubscription;
