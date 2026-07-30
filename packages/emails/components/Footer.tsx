import { Column, Row, Section } from 'react-email';
import * as React from 'react';
import type { EmailAssets } from '../lib/asset-types';
import { Hr } from './Hr';
import { Link } from './Link';
import { SocialLinks } from './SocialLinks';
import { Text } from './Text';

type FooterProps = {
  social: EmailAssets['social'];
  emailId?: string;
  showUnsubscribe?: boolean;
};

export const Footer = ({
  social,
  emailId,
  showUnsubscribe = false,
}: FooterProps): React.ReactElement => (
  <>
    <Hr />
    <SocialLinks social={social} />
    <Section className="mt-4">
      <Row>
        <Column align="center">
          <Text>
            <span className="text-xs">
              <Link href="https://theciviaproject.org/privacy">
                Privacy Policy
              </Link>
              {showUnsubscribe && emailId ? (
                <>
                  {' · '}
                  <Link
                    href={`https://theciviaproject.org/unsubscribe?who=${emailId}`}
                  >
                    Unsubscribe
                  </Link>
                </>
              ) : null}
            </span>
          </Text>
        </Column>
      </Row>
    </Section>
  </>
);
