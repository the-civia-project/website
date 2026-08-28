import * as React from 'react';
import { NewsletterEmail } from '../components/NewsletterEmail';
import { Text } from '../components/Text';
import { getEmailAssets } from '../lib/assets';
import { EmailProps } from './types';

export const TestEmail = ({
  emailId,
  assets,
}: EmailProps): React.ReactElement => (
  <NewsletterEmail
    preview="This is the preview"
    emailId={emailId}
    assets={assets}
  >
    <Text>This is the body</Text>
  </NewsletterEmail>
);

TestEmail.subject = 'This is a title';

TestEmail.PreviewProps = {
  emailId: 'test',
  assets: getEmailAssets(),
} satisfies EmailProps;

export default TestEmail;
