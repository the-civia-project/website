import { Button as ReactEmailButton } from 'react-email';
import * as React from 'react';

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
};

/** Inner black (light clients) + outer light gray (dark clients). */
const RING_LIGHT = '#fdfdfd';
const RING_DARK = '#000000';

export const Button = ({
  href,
  children,
  variant = 'primary',
  fullWidth = false,
}: ButtonProps): React.ReactElement => {
  const isPrimary = variant === 'primary';

  return (
    <ReactEmailButton
      href={href}
      className={
        isPrimary
          ? 'email-btn-primary text-sm font-bold no-underline text-center py-3 px-6 rounded-none'
          : 'email-btn-secondary text-sm font-bold no-underline text-center py-3 px-6 rounded-none'
      }
      style={{
        backgroundColor: isPrimary ? '#000000' : '#ffffff',
        color: isPrimary ? '#ffffff' : '#000000',
        border: '0',
        boxSizing: 'border-box',
        borderColor: isPrimary ? '#ffffff' : '#000000',
        display: fullWidth ? 'block' : 'inline-block',
        width: fullWidth ? '100%' : undefined,
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: 700,
        textDecoration: 'none',
        textAlign: 'center',
        borderRadius: 0,
      }}
    >
      {children}
    </ReactEmailButton>
  );
};
