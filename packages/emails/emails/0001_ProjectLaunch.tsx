import * as React from 'react';
import { NewsletterEmail } from '../components/NewsletterEmail';
import { Text } from '../components/Text';
import { EmailProps } from './types';

export const TestEmail = ({ emailId }: EmailProps): React.ReactElement => {
  return (
    <NewsletterEmail
      preview="We have launched The Civia Project!"
      emailId={emailId}
    >
      <Text>Today we are announcing something big.</Text>
    </NewsletterEmail>
  );
};

TestEmail.subject = 'Project Launch';

TestEmail.PreviewProps = {
  emailId: 'test',
} satisfies EmailProps;

export default TestEmail;
