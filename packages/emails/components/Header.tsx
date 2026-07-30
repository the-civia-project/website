import { Img, Section, Text } from 'react-email';
import * as React from 'react';
import type { EmailAssets } from '../lib/asset-types';
import { Hr } from './Hr';

type HeaderProps = {
  logo: EmailAssets['logo'];
};

export const Header = ({ logo }: HeaderProps): React.ReactElement => (
  <Section className="mb-6">
    <Img
      src={logo}
      width={54}
      height={64}
      alt="The Civia Project"
      style={{ display: 'block', margin: '0 auto' }}
    />
    <Text
      className="email-heading"
      style={{
        margin: '16px 0 0',
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 700,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: '#000000',
      }}
    >
      The Civia Project
    </Text>
    <Text
      className="email-heading"
      style={{
        margin: '4px 0 0',
        textAlign: 'center',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.4em',
        textTransform: 'uppercase',
        color: '#000000',
      }}
    >
      Newsletter
    </Text>
    <Hr
      className="email-hr"
      style={{ margin: '20px 0 0', borderTopWidth: '1px' }}
    />
    <Hr
      className="email-hr"
      style={{ margin: '4px 0 0', borderTopWidth: '1px' }}
    />
  </Section>
);
