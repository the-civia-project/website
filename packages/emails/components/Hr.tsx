import { Hr as ReactEmailHr } from '@react-email/components';
import * as React from 'react';

export const Hr = ({
  className = 'email-hr my-5',
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
} = {}): React.ReactElement => (
  <ReactEmailHr
    className={className}
    style={{ borderTopWidth: '1px', ...style }}
  />
);
