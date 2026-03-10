import { render, toPlainText } from '@react-email/render';
import { Result } from '@the-civia-project/core';
import EmailList, { type Email } from '@the-civia-project/emails';
import main_logger from '@the-civia-project/logger';

const logger = main_logger().child({ ctx: 'EMAILS' });

const EMAIL_ID_TAG = '{{__EMAIL_ADDRESS_ID__}}';

export function renderEmail(email: string, email_address_id: string) {
  const html = email.replaceAll(EMAIL_ID_TAG, email_address_id);

  return {
    html,
    text: toPlainText(html),
  };
}

export type RenderedEmail = {
  html: string;
  text: string;
};

export type PreparedEmail = {
  html: string | null;

  name: string;
  subject: string;
  prerender: () => Promise<void>;
  render: (emailId: string) => Result<RenderedEmail, Error>;
};

async function prepareEmails() {
  const subscribed: PreparedEmail = {
    html: null,
    subject: EmailList.default.Subscribed.subject,
    name: 'Subscribed',
    async prerender() {
      if (this.html) {
        logger.trace(
          { email: this.name },
          'Email is already prerendered, skipping prerendering',
        );
        return;
      }

      logger.trace({ email: this.name }, 'Prerendering email');

      this.html = await render(
        await EmailList.default.Subscribed({ emailId: EMAIL_ID_TAG }),
      );
    },
    render(emailId: string) {
      if (!this.html) {
        return {
          success: false,
          error: new Error(
            `Email ${this.name} needs to be prerendered. Call the prerender method`,
          ),
        };
      }

      return {
        success: true,
        value: renderEmail(this.html, emailId),
      };
    },
  };

  const unsubscribed: PreparedEmail = {
    html: null,
    subject: EmailList.default.Unsubscribed.subject,
    name: 'Unsubscribed',
    prerender: async function () {
      if (this.html) {
        logger.trace(
          { email: this.name },
          'Email is already prerendered, skipping prerendering',
        );

        return;
      }

      logger.trace({ email: this.name }, 'Prerendering email');

      this.html = await render(
        await EmailList.default.Unsubscribed({ emailId: EMAIL_ID_TAG }),
      );
    },
    render: function (emailId: string) {
      if (!this.html) {
        return {
          success: false,
          error: new Error(
            `Email ${this.name} needs to be prerendered. Call the prerender method`,
          ),
        };
      }

      return {
        success: true,
        value: renderEmail(this.html, emailId),
      };
    },
  };

  const newsletters: PreparedEmail[] = await Promise.all(
    Object.entries(EmailList.default.Emails).map(
      async ([name, email]: [string, Email]) => {
        if (!email.subject) {
          // Fail early if the email does not have a subject, as it's required to send the email
          throw new Error(`Email ${name} does not have a subject`);
        }

        return {
          html: null,
          name,
          subject: email.subject,
          async prerender() {
            if (this.html) {
              logger.trace(
                { email: this.name },
                'Email is already prerendered, skipping prerendering',
              );

              return;
            }

            logger.trace({ email: this.name }, 'Prerendering email');

            this.html = await render(await email({ emailId: EMAIL_ID_TAG }));
          },
          render: function (emailId: string) {
            if (!this.html) {
              return {
                success: false,
                error: new Error(
                  `Email ${this.name} needs to be prerendered. Call the prerender method`,
                ),
              };
            }

            return {
              success: true,
              value: renderEmail(this.html, emailId),
            };
          },
        } satisfies PreparedEmail;
      },
    ),
  );

  logger.trace(
    {
      emails: [
        subscribed.name,
        unsubscribed.name,
        ...newsletters.map((n) => n.name),
      ],
    },
    'Prepared all emails',
  );

  return { subscribed, unsubscribed, newsletters };
}

export default await prepareEmails();
