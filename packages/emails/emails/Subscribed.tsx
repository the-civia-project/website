import * as React from 'react';
import { BaseEmail } from '../components/BaseEmail';
import { Hr } from '../components/Hr';
import { Link } from '../components/Link';
import { Signature } from '../components/Signature';
import { Text } from '../components/Text';
import { U } from '../components/U';
import { WasntYou } from '../components/WasntYou';
import { EmailProps } from './types';

export const Subscribed = ({ emailId }: EmailProps): React.ReactElement => {
  return (
    <BaseEmail preview="Thank you for joining The Civia Project Newsletter!">
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
        hi, feel you can connect with us on our{' '}
        <Link href="https://discord.com/invite/pNTmzvd7pe">
          discord community
        </Link>
        .
      </Text>

      <Text>
        Or, if you use any social media platforms, you can follow us on:
      </Text>

      <ul className="text-xs list-disc leading-6">
        <li>
          <Link href="https://www.youtube.com/@theciviaproject">Youtube</Link>
        </li>
        <li>
          <Link href="https://x.com/theciviaproject">X (Twitter)</Link>
        </li>
        <li>
          <Link href="https://bsky.app/profile/theciviaproject.org">
            BlueSky
          </Link>
        </li>
        <li>
          <Link href="https://www.instagram.com/theciviaproject">
            Instagram
          </Link>
        </li>
        <li>
          <Link href="https://www.facebook.com/theciviaproject">Facebook</Link>
        </li>
        <li>
          <Link href="https://www.threads.com/@theciviaproject">Threads</Link>
        </li>
        <li>
          <Link href="https://mastodon.social/@theciviaproject">Mastodon</Link>
        </li>
        <li>
          <Link href="https://www.tiktok.com/@theciviaproject">TikTok</Link>
        </li>
      </ul>

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

Subscribed.PreviewProps = {
  emailId: 'test',
} satisfies EmailProps;

Subscribed.subject = 'Subscribed to The Civia Project Newsletter';

export default Subscribed;
