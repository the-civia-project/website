import * as React from 'react';
import Email_0001_ProjectLaunch from './0001_ProjectLaunch';
import Subscribed from './Subscribed';
import { EmailProps } from './types';
import Unsubscribed from './Unsubscribed';

export type Email = React.FC<EmailProps> & {
  subject: string;
};

const Emails: Record<string, Email> = {
  '0001_ProjectLaunch': Email_0001_ProjectLaunch,
};

export default { Emails, Subscribed, Unsubscribed } as {
  Emails: Record<string, Email>;
  Subscribed: Email;
  Unsubscribed: Email;
};
