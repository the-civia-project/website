import { serve } from '@hono/node-server';
import { getConnInfo } from '@hono/node-server/conninfo';
import { zValidator } from '@hono/zod-validator';
import { toPlainText } from '@react-email/render';
import amqp from '@the-civia-project/amqp';
import {
  BadResult,
  GoodResult,
  GracefulWorker,
  mapError,
  Result,
} from '@the-civia-project/core';
import {
  getSentNewsletters,
  getSubscriberCount,
  isEmailAddressSubscribed,
  isEmailAddressSubscribedById,
  registerNewsletter,
  subscribeEmailAddress,
  unSubscribeEmailAddress,
} from '@the-civia-project/db';
import main_logger from '@the-civia-project/logger';
import { Hono, type Context, type Env } from 'hono';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import * as z from 'zod';
import prepared_emails from './prepare-emails.ts';

const http_logger = main_logger().child({ ctx: 'HTTP' });

const queueProcessNewsletter = await amqp.queueProcessNewsletter();
const queueSendEmail = await amqp.queueSendEmail();

async function buildRequestLog(ctx: Context<Env, string, {}>) {
  return {
    method: ctx.req.method,
    endpoint: ctx.req.url,
    headers: ctx.req.header(),
    connection_info: getConnInfo(ctx),
    raw: await ctx.req.text(),
  };
}

const app = new Hono();
app.use(requestId());

declare module 'hono' {
  interface ContextVariableMap {
    logger: typeof http_logger;
  }
}

app.use((ctx, next) => {
  ctx.set('logger', http_logger.child({ request_id: ctx.var.requestId }));

  ctx.var.logger.info(
    {
      method: ctx.req.method,
      endpoint: ctx.req.url,
      headers: ctx.req.header(),
    },
    'Incoming request',
  );

  return next().then(async () => {
    ctx.var.logger.info(
      {
        method: ctx.req.method,
        endpoint: ctx.req.url,
        status: ctx.res.status,
      },
      'Outgoing response',
    );

    if (ctx.res.status === 404) {
      //
      // SECURITY: Access of unknown endpoint
      //

      ctx.var.logger.warn(
        await buildRequestLog(ctx),
        'Unknown endpoint accessed',
      );
    }
  });
});

app.use(secureHeaders());
app.use(cors());

app.use('/work/*', async (ctx, next) => {
  const api_key = ctx.req.header('api-key');

  if (api_key && api_key === process.env.API_KEY!) {
    ctx.var.logger.trace('Authorized access to /work endpoints');
    return next();
  } else {
    ctx.var.logger.warn(
      await buildRequestLog(ctx),
      'Unauthorized access attempt to /work endpoints',
    );
    return ctx.body(null, 401);
  }
});

const emailAddressSchema = z.object({
  email: z.email(),
});

const uuidSchema = z.object({
  id: z.uuidv4(),
});

const invalidMiddleware = async (
  result: { success: boolean },
  ctx: Context<Env, string, {}>,
) => {
  if (!result.success) {
    ctx.var.logger.warn(
      {
        ...(await buildRequestLog(ctx)),
        result,
      },
      'Invalid email address format',
    );

    return ctx.body(null, 400);
  }
};

const validateEmailAddressSchema = zValidator(
  'json',
  emailAddressSchema,
  invalidMiddleware,
);

const validUUIDSchema = zValidator('json', uuidSchema, invalidMiddleware);

app.post('/subscribe', validateEmailAddressSchema, async (ctx) => {
  const json = ctx.req.valid('json');

  ctx.var.logger.trace({ email: json.email }, 'Received subscription request');

  try {
    if (await isEmailAddressSubscribed(json.email)) {
      ctx.var.logger.warn(
        {
          ...(await buildRequestLog(ctx)),
          email: json.email,
        },
        'Attempt to subscribe an already subscribed email address',
      );

      //
      // SECURITY: INFORMATION DISCLOSURE MITIGATION
      //
      // We intentionally return a 201 status code
      // even if the email address is already subscribed
      // to prevent malicious actors from enumerating
      // valid email addresses in our system.
      //
      // This way, we do not disclose whether an
      // email address is already in our database or not.
      //

      return ctx.body(null, 201);
    }

    const subscription = await subscribeEmailAddress(json.email);

    if (!subscription?.inserted_uuid) {
      ctx.var.logger.error(
        { email: json.email },
        'Database did not return subscriber UUID',
      );

      return ctx.body(null, 500);
    }

    ctx.var.logger.trace(
      { email: json.email },
      'Email address subscribed successfully',
    );

    await prepared_emails.subscribed.prerender();
    const email = prepared_emails.subscribed.render(subscription.inserted_uuid);

    if (!email.success) {
      ctx.var.logger.error(
        email.error,
        'Failed to render the subscribed email',
      );

      return ctx.body(null, 500);
    }

    const result = queueSendEmail({
      request_id: ctx.var.requestId,
      to: json.email,
      subject: prepared_emails.subscribed.subject,
      body: email.value.html,
      text: email.value.text,
    });

    if (!result.success) {
      ctx.var.logger.error(
        result.error,
        'Failed to queue the subscribed email',
      );

      return ctx.body(null, 500);
    }
  } catch (e) {
    const error = mapError(e);
    ctx.var.logger.fatal(error, 'Unexpected error');

    return ctx.body(null, 500);
  }

  return ctx.body(null, 201);
});

app.delete('/unsubscribe', validUUIDSchema, async (ctx) => {
  const json = ctx.req.valid('json');

  try {
    if (!(await isEmailAddressSubscribedById(json.id))) {
      ctx.var.logger.warn(
        {
          ...(await buildRequestLog(ctx)),
          email_id: json.id,
        },
        `Attempt to unsubscribe an email address that is not subscribed`,
      );

      //
      // SECURITY: INFORMATION DISCLOSURE MITIGATION
      //
      // We intentionally return a 204 status code
      // even if the email address is not subscribed
      // to prevent malicious actors from enumerating
      // and unsubscribing valid email addresses in our system.
      //
      // This way, we do not disclose whether an
      // email address is already in our database or not.
      //

      return ctx.body(null, 204);
    }

    const { deleted_uuid, address } = await unSubscribeEmailAddress(json.id);

    await prepared_emails.unsubscribed.prerender();
    const email = prepared_emails.unsubscribed.render(deleted_uuid);

    if (!email.success) {
      ctx.var.logger.error(
        email.error,
        'Failed to render the unsubscribed email',
      );

      return ctx.body(null, 500);
    }

    const result = queueSendEmail({
      request_id: ctx.var.requestId,
      to: address,
      subject: prepared_emails.unsubscribed.subject,
      body: email.value.html,
      text: email.value.text,
    });

    if (!result.success) {
      ctx.var.logger.error(
        result.error,
        'Failed to queue the unsubscribed email',
      );

      return ctx.body(null, 500);
    }
  } catch (e) {
    const error = mapError(e);
    ctx.var.logger.fatal(error, 'Unexpected error');

    return ctx.body(null, 500);
  }

  return ctx.body(null, 204);
});

app.get('/work/newsletters', async (ctx) => {
  const newsletters = prepared_emails.newsletters.map(({ name }) => name);

  const sent = await getSentNewsletters();

  return ctx.json({
    to_send: newsletters.filter(
      (newsletter) => !sent.find((s) => s.name === newsletter),
    ),
    newsletters,
    sent,
  });
});

app.post('/work/send-newsletters', async (ctx) => {
  const sent = await getSentNewsletters();

  const to_send = prepared_emails.newsletters.filter(
    (newsletter) => !sent.find((s) => s.name === newsletter.name),
  );

  if (to_send.length === 0) {
    return ctx.json({ status: 'failed', reason: 'nothing to send' }, 200);
  }

  const number_of_subscribers = await getSubscriberCount();

  if (number_of_subscribers === 0) {
    return ctx.json({ status: 'failed', reason: 'nobody subscribed' }, 200);
  }

  const queue_results = (
    await Promise.all(
      to_send.map(async (newsletter): Promise<Result<void, Error>[]> => {
        await newsletter.prerender();

        if (!newsletter.html) {
          ctx.var.logger.error(
            { newsletter: newsletter.name },
            'Newsletter email is not prerendered',
          );

          return [
            {
              success: false,
              error: new Error('Newsletter email is not prerendered'),
            },
          ];
        }

        const newsletter_registration = await registerNewsletter(
          newsletter.name,
          newsletter.subject,
          toPlainText(newsletter.html),
          newsletter.html,
          number_of_subscribers,
        );

        if (!newsletter_registration?.inserted_uuid) {
          ctx.var.logger.error(
            { newsletter: newsletter.name },
            'Database did not return newsletter UUID',
          );

          return [
            {
              success: false,
              error: new Error('Database did not return newsletter UUID'),
            },
          ];
        }

        const newsletter_id = newsletter_registration.inserted_uuid;

        const results = [];

        const take = 10_000;
        for (let skip = 0; skip < number_of_subscribers; skip += take) {
          // Compute the remaining rows for the current page to avoid
          // over-requesting and to skip creating an empty trailing chunk.
          const page_take = Math.min(take, number_of_subscribers - skip);

          results.push(
            queueProcessNewsletter({
              request_id: ctx.var.requestId,
              newsletter_id,
              skip,
              take: page_take,
            }),
          );
        }

        return results;
      }),
    )
  ).flat();

  const bad_results: BadResult<Error>[] = [];
  const good_results: GoodResult<void>[] = [];

  queue_results.forEach((r) => {
    if (r.success) {
      good_results.push(r);
    } else {
      bad_results.push(r);
    }
  });

  const response = [];

  if (good_results.length > 0) {
    response.push({
      status: 'success',
      count: good_results.length,
      result: 'queued',
    });
  }

  if (bad_results.length > 0) {
    response.push({
      status: 'failed',
      count: bad_results.length,
      errors: bad_results.map((r) => r.error.message),
    });
  }

  return ctx.json(response);
});

app.get('/work/subscribers', async (ctx) => {
  const count = await getSubscriberCount();

  return ctx.json({ count });
});

const server = serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    http_logger.info(
      { host: 'localhost', port: info.port },
      'Newsletter API is running',
    );
  },
);

new GracefulWorker().onGracefulShutdown(async () => {
  http_logger.info('Server shutting down gracefully...');

  await new Promise<void>((resolve, reject) =>
    server.close((e) => {
      if (e) {
        const error = mapError(e);

        http_logger.error(error, 'Error occurred while closing server');

        reject(error);
      } else {
        resolve();
      }
    }),
  );

  http_logger.info('Server gracefully shut down');
});
