import * as React from 'react';

export const U = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => (
  <span
    className="email-text underline underline-offset-4"
    style={{ color: '#000000' }}
  >
    {children}
  </span>
);
