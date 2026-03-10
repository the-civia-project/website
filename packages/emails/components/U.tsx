import * as React from 'react';

export const U = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => (
  <span className="text-black underline underline-offset-4">{children}</span>
);
