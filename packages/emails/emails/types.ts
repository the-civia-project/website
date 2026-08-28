import * as React from 'react';
import type { EmailAssets } from '../lib/asset-types';

export type EmailProps = {
  emailId: string;
  assets: EmailAssets;
};

export type ConfirmSubscriptionProps = EmailProps & {
  validationCode: string;
};

export type EmailComponent<P> = ((props: P) => React.ReactElement) & {
  subject: string;
  PreviewProps?: P;
};
