import { Text } from '@react-email/components';
import * as React from 'react';

export const Signature = (): React.ReactElement => (
  <Text>
    <span className="text-xs">
      <strong>Thank you</strong>, <br />
      The Civia Project Team.
    </span>
  </Text>
);
