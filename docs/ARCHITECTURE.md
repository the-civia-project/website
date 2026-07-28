# Architecture

There are several components within our architecture

- The Website: deployed to [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- Reverse Proxy, Newsletter API & AMQP Workers: deployed to an [UpCloud Server](https://upcloud.com/) and proxied using [Cloudflare WAF](https://developers.cloudflare.com/waf/)
- LavinMQ: AMQP Server hosted on [CloudAMQP](https://www.cloudamqp.com/).
- SQLite-compatible Database: provided by [Turso](https://turso.tech)
- Monitoring: hosted on the [Grafana](https://grafana.com/).

More details in the [ARCHITECTURE.mmd](./ARCHITECTURE.mmd).

## Flows

More details on the [FLOWS.mmd](./FLOWS.mmd).

### Subscribe / Confirm / Unsubscribe

When a user subscribes, an `INSERT` is done against the `email_addresses` table with a hashed validation code and `validated_at` left null. A confirmation email with a one-time link is published to the `SEND_MAIL_QUEUE`.

When the user opens the confirm link, `POST /confirm` matches the code hash, sets `validated_at`, and queues the thank-you (“Subscribed”) email. Only validated addresses receive newsletters.

Unvalidated addresses older than 24 hours are deleted daily by an in-process cleanup worker (`setInterval`). Pending re-subscribe regenerates the code and resends confirmation only when `created_at` is older than 24 hours (and resets `created_at`).

Unsubscribe performs a `DELETE` against `email_addresses` and queues an “Unsubscribed” notification email.

### Process Newsletter

We `INSERT` a newsletter document in the database that contains the partially rendered newsletter for the user and then we send multiple `ProcessNewsletter` events into the `PROCESS_NEWSLETTER_QUEUE`.

A single `ProcessNewsletter` event consists of a page (`skip` & `take`) of **validated** rows from the `email_addresses` table. The consumer then process that page and outputs dedicated `SendEmail` events into the `SEND_MAIL_QUEUE` for each email address in that page.

This is done in order to decouple the newsletter processing from the API, because for large lists of email addresses the processing will take a while.

### Send Mail

## Deployment
