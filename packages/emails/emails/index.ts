import * as React from 'react';
import Email_0001_ProjectLaunch from './0001_ProjectLaunch';
import ConfirmSubscription from './ConfirmSubscription';
import Subscribed from './Subscribed';
import { ConfirmSubscriptionProps, EmailProps } from './types';
import Unsubscribed from './Unsubscribed';

export type Email = React.FC<EmailProps> & {
  subject: string;
};

export type ConfirmEmail = React.FC<ConfirmSubscriptionProps> & {
  subject: string;
};

const Emails: Record<string, Email> = {
  '0001_ProjectLaunch': Email_0001_ProjectLaunch,
};

export default {
  Emails,
  ConfirmSubscription,
  Subscribed,
  Unsubscribed,
} as {
  Emails: Record<string, Email>;
  ConfirmSubscription: ConfirmEmail;
  Subscribed: Email;
  Unsubscribed: Email;
};
