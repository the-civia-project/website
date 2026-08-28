import * as React from 'react';
import { BaseEmail } from '../components/BaseEmail';
import { CommunityButtons } from '../components/CommunityButtons';
import { Footer } from '../components/Footer';
import { Signature } from '../components/Signature';
import { Text } from '../components/Text';
import { U } from '../components/U';
import { WasntYou } from '../components/WasntYou';
import { getEmailAssets } from '../lib/assets';
import { EmailProps } from './types';
import { Hr } from '../components/Hr';

export const Subscribed = ({
  emailId,
  assets,
}: EmailProps): React.ReactElement => {
  return (
    <BaseEmail
      preview="Thank you for joining The Civia Project Newsletter!"
      assets={assets}
    >
      <Text>
        <strong>
          <U>Thank you!</U>
        </strong>
      </Text>

      <Text>
        We are <strong>thrilled</strong> to have you onboard and can't wait to
        share our latest <U>news</U>, <U>updates</U>, and <U>milestones</U> with
        you.
      </Text>

      <Text>
        Meanwhile, if you have any questions, suggestions, or just want to say
        hi, feel free to connect with us on Discord or Matrix.
      </Text>

      <CommunityButtons discordLabel="Join Discord" matrixLabel="Join Matrix" />

      <Signature />

      <Hr />

      <WasntYou emailId={emailId} subscribed={true} />

      <Footer social={assets.social} />
    </BaseEmail>
  );
};

Subscribed.PreviewProps = {
  emailId: 'test',
  assets: getEmailAssets(),
} satisfies EmailProps;

Subscribed.subject = 'Subscribed to The Civia Project Newsletter';

export default Subscribed;
