import { Text as ReactEmailText } from 'react-email';
import * as React from 'react';

export const Text = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => (
  <ReactEmailText className="email-text leading-8" style={{ color: '#000000' }}>
    {children}
  </ReactEmailText>
);
