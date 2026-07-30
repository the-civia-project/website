import { getEmailAssets } from '../lib/assets';
import Email_0001_ProjectLaunch from './0001_ProjectLaunch';
import ConfirmSubscription from './ConfirmSubscription';
import Subscribed from './Subscribed';
import { ConfirmSubscriptionProps, EmailComponent, EmailProps } from './types';
import Unsubscribed from './Unsubscribed';

export type { EmailAssets } from '../lib/asset-types';
export { getEmailAssets } from '../lib/assets';
export { civiaTheme } from '../lib/theme';

export type Email = EmailComponent<EmailProps>;

export type ConfirmEmail = EmailComponent<ConfirmSubscriptionProps>;

const Emails: Record<string, Email> = {
  '0001_ProjectLaunch': Email_0001_ProjectLaunch,
};

export default {
  Emails,
  ConfirmSubscription,
  Subscribed,
  Unsubscribed,
  getEmailAssets,
};
