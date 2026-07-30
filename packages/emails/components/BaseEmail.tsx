import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';
import type { EmailAssets } from '../lib/asset-types';
import { Header } from './Header';

export type BaseEmailProps = {
  children: React.ReactNode;
  preview: string;
  assets: EmailAssets;
};

export const BaseEmail = ({
  children,
  preview,
  assets,
}: BaseEmailProps): React.ReactElement => (
  <Html lang="en" dir="ltr">
    <Tailwind>
      <Head>
        <title>The Civia Project Newsletter</title>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
      </Head>
      <Body
        className="email-body bg-white m-0 p-0"
        style={{
          backgroundColor: '#ffffff',
          color: '#000000',
          margin: 0,
          padding: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        }}
      >
        <Preview>{preview}</Preview>
        <Container
          className="email-container mx-auto my-0 p-6 bg-white"
          style={{
            maxWidth: '560px',
            margin: '0 auto',
            padding: '24px',
            backgroundColor: '#ffffff',
            color: '#000000',
          }}
        >
          <Header logo={assets.logo} />
          {children}
        </Container>
      </Body>
    </Tailwind>
  </Html>
);
