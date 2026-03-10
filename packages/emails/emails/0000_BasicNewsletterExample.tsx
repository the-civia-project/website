import * as React from 'react';
import { NewsletterEmail } from '../components/NewsletterEmail';
import { Text } from '../components/Text';
import { EmailProps } from './types';

export const TestEmail = ({ emailId }: EmailProps): React.ReactElement => {
  return (
    <NewsletterEmail preview="This is the preview" emailId={emailId}>
      <Text>This is the body</Text>
    </NewsletterEmail>
  );
};

TestEmail.subject = 'This is a title';

TestEmail.PreviewProps = {
  emailId: 'test',
} satisfies EmailProps;

export default TestEmail;
