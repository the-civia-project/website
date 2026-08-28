import { Hr as ReactEmailHr } from 'react-email';
import * as React from 'react';

export const Hr = ({
  style,
}: {
  style?: React.CSSProperties;
} = {}): React.ReactElement => (
  <ReactEmailHr
    className={'my-5'}
    style={{ borderTopWidth: '1px', ...style }}
  />
);
