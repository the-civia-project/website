import { SendEmail } from '@the-civia-project/amqp';
import {
  BadResult,
  GoodResult,
  mapError,
  Result,
} from '@the-civia-project/core';
import main_logger from '@the-civia-project/logger';
import axios from 'axios';
import { ProcessingRateLimitExceededError } from './queue.ts';

const logger = main_logger().child({ ctx: 'MAIL' });

const ONE_MINUTE_IN_S = 60;
const ONE_MINUTE_IN_MS = ONE_MINUTE_IN_S * 1000;
const BREVO_API_BASE_URL =
  process.env.BREVO_API_BASE_URL ?? 'https://api.brevo.com';

const parseNumberHeader = (
  header_value: string | string[] | undefined,
  default_value: number,
): number => {
  if (typeof header_value === 'string') {
    const parsed = parseInt(header_value, 10);
    return isNaN(parsed) ? default_value : parsed;
  }

  return default_value;
};

const mapAxiosError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    // Only map the error to another error if it is a HTTP 429 Too Many Requests
    // Otherwise return the AxiosError
    if (error.response && error.response.status === 429) {
      // https://developers.brevo.com/docs/limit-headers
      const time_until_reset_ms = parseNumberHeader(
        error.response.headers['x-ratelimit-reset-after'],
        ONE_MINUTE_IN_MS,
      );

      return new ProcessingRateLimitExceededError({
        cause: error,
        time_until_reset_ms,
      });
    } else {
      return error;
    }
  } else {
    return mapError(error);
  }
};

type BrevoBulkEmail = {
  sender: {
    name: string;
    email: string;
  };
  subject: string;
  htmlContent: string;
  messageVersions: {
    to: {
      email: string;
    }[];
    htmlContent: string;
    textContent: string;
    subject: string;
  }[];
  headers?: {
    [key: string]: string;
  };
};

export type RateLimit = {
  time_until_reset_ms: number;
  limit: number;
  remaining: number;
};

export async function sendBulkEmail(
  email: SendEmail[],
): Promise<Result<RateLimit, Error>> {
  const data: BrevoBulkEmail = {
    sender: {
      name: 'The Civia Project Newsletter',
      email: 'newsletter@theciviaproject.org',
    },
    // Because Brevo forces us to have a subject and a htmlContent
    // Even if all of our messageVersions have their dedicated one
    subject: '<empty>',
    htmlContent: '<empty>',
    messageVersions: email.map((e) => ({
      to: [{ email: e.to }],
      htmlContent: e.body,
      textContent: e.text,
      subject: e.subject,
    })),
  };

  // Sandbox Mode
  // https://developers.brevo.com/docs/using-sandbox-mode
  // if (process.env.NODE_ENV !== 'production') {
  //   logger.trace(
  //     'Running in non-production environment, enabling Brevo sandbox mode',
  //   );
  //   data.headers = {
  //     'X-Sib-Sandbox': 'drop',
  //   };
  // }

  return axios
    .request({
      method: 'POST',
      url: `${BREVO_API_BASE_URL}/v3/smtp/email`,
      data: JSON.stringify(data),
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
      },
    })
    .then((res) => {
      const time_until_reset_ms =
        parseNumberHeader(
          res.headers['x-sib-ratelimit-reset'],
          ONE_MINUTE_IN_S,
        ) * 1000;
      const limit = parseNumberHeader(res.headers['x-sib-ratelimit-limit'], 0);
      const remaining = parseNumberHeader(
        res.headers['x-sib-ratelimit-remaining'],
        0,
      );

      logger.trace(
        { time_until_reset_ms, limit, remaining },
        'Email batch sent successfully',
      );

      return {
        //
        // Useless now, may prove useful in the future
        // https://developers.brevo.com/docs/api-limits
        // https://developers.brevo.com/docs/limit-headers
        //
        success: true,
        value: {
          time_until_reset_ms,
          limit,
          remaining,
        },
      } satisfies GoodResult<RateLimit>;
    })
    .catch(
      (error) =>
        ({
          success: false,
          error: mapAxiosError(error),
        }) satisfies BadResult<Error>,
    );
}
