import * as React from 'react';
import { Link } from './Link';
import { Text } from './Text';
import { Section } from 'react-email';

export const WasntYou = ({
  emailId,
  subscribed,
}: {
  emailId: string;
  subscribed: boolean;
}): React.ReactElement => (
  <Section style={{ textAlign: 'center' }}>
    <Text>
      If this wasn't you, you can{' '}
      <Link
        href={
          subscribed
            ? `https://theciviaproject.org/unsubscribe?who=${emailId}`
            : `https://theciviaproject.org/`
        }
      >
        {subscribed ? 'unsubscribe' : 'resubscribe'}
      </Link>{' '}
      {subscribed ? 'from' : 'to'} our newsletter.
    </Text>
  </Section>
);
