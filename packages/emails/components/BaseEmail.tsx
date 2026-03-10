import {
  Body,
  Font,
  Head,
  Heading,
  Html,
  Preview,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';
import { Hr } from './Hr';

export type BaseEmailProps = {
  children: React.ReactNode;
  preview: string;
};

export const BaseEmail = ({
  children,
  preview,
}: BaseEmailProps): React.ReactElement => {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>The Civia Project Newsletter</title>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: 'https://cdn.jsdelivr.net/fontsource/fonts/inter:vf@latest/latin-wght-normal.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Tailwind>
        <Body className="p-4">
          <Preview>{preview}</Preview>
          <Heading className="text-xs">The Civia Project Newsletter</Heading>
          <Hr />
          {children}
        </Body>
      </Tailwind>
    </Html>
  );
};
