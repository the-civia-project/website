import { Column, Row } from '@react-email/components';
import * as React from 'react';
import { EmailProps } from '../emails/types';
import { BaseEmail, BaseEmailProps } from './BaseEmail';
import { Hr } from './Hr';
import { Link } from './Link';
import { Signature } from './Signature';
import { Text } from './Text';
import { U } from './U';

type NewsletterEmailProps = BaseEmailProps & EmailProps;

export const NewsletterEmail = ({
  children,
  preview,
  emailId,
}: NewsletterEmailProps): React.ReactElement => {
  return (
    <BaseEmail preview={preview}>
      <Text>
        Hello{' '}
        <strong>
          <U>friend!</U>
        </strong>
      </Text>

      {children}
      <Signature />

      <Hr />

      <Row>
        <Column>
          <span className="text-xs">
            <Link href="https://theciviaproject.org/privacy">
              Privacy Policy
            </Link>
          </span>
        </Column>
        <Column align="center">
          <span className="text-xs">
            <Link href="https://discord.com/invite/pNTmzvd7pe">
              Join Discord
            </Link>
          </span>
        </Column>
        <Column align="right">
          <span className="text-xs">
            <Link
              href={`https://theciviaproject.org/unsubscribe?who=${emailId}`}
            >
              Unsubscribe
            </Link>
          </span>
        </Column>
      </Row>
    </BaseEmail>
  );
};
