import { Link as ReactEmailLink } from '@react-email/components';
import * as React from 'react';

type LinkProps = {
  href: string;
  children: React.ReactNode;
};

export const Link = ({ href, children }: LinkProps): React.ReactElement => (
  <ReactEmailLink
    className="text-black underline underline-offset-4"
    href={href}
  >
    {children}
  </ReactEmailLink>
);
