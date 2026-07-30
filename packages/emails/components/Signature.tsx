import { Text } from 'react-email';
import * as React from 'react';

export const Signature = (): React.ReactElement => (
  <Text
    className="email-text"
    style={{
      color: '#000000',
      fontSize: '12px',
      lineHeight: '20px',
    }}
  >
    <strong>Thank you</strong>, <br />
    The Civia Project Team.
  </Text>
);
