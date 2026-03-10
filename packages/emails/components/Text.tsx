import { Text as ReactEmailText } from '@react-email/components';
import * as React from 'react';

export const Text = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => (
  <ReactEmailText className="leading-8">{children}</ReactEmailText>
);
