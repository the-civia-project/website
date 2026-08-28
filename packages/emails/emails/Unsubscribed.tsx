import * as React from 'react';
import { BaseEmail } from '../components/BaseEmail';
import { Footer } from '../components/Footer';
import { Signature } from '../components/Signature';
import { Text } from '../components/Text';
import { U } from '../components/U';
import { WasntYou } from '../components/WasntYou';
import { getEmailAssets } from '../lib/assets';
import { EmailProps } from './types';
import { Hr } from '../components/Hr';

export const Unsubscribed = ({
  emailId,
  assets,
}: EmailProps): React.ReactElement => {
  return (
    <BaseEmail
      preview="You have unsubscribed from The Civia Project Newsletter!"
      assets={assets}
    >
      <Text>
        <strong>
          <U>Thank you!</U>
        </strong>
      </Text>

      <Text>
        We are <strong>sad</strong> to see you go, but we <U>respect</U> your
        decision.
      </Text>

      <Text>
        Your email address has been <U>removed</U> from our mailing list, and
        you will <U>no longer receive</U> our newsletters.
      </Text>

      <Text>
        Thank you for joining us on this exciting journey, we{' '}
        <strong>appreciate</strong> your <U>time</U> and <U>support</U>!
      </Text>

      <Signature />

      <Hr />

      <WasntYou emailId={emailId} subscribed={false} />

      <Footer social={assets.social} />
    </BaseEmail>
  );
};

Unsubscribed.subject = 'Unsubscribed from The Civia Project Newsletter';

Unsubscribed.PreviewProps = {
  emailId: 'test',
  assets: getEmailAssets(),
} satisfies EmailProps;

export default Unsubscribed;
