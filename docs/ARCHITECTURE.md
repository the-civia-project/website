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

### Subscribe / Unsubscribe

When a user subscribes / unsubscribes an `INSERT` (subscribe) / `DELETE` (unsubscribe) operation is done against the `email_addresses` table in the database and then a `SendEmail` event is published into the `SEND_MAIL_QUEUE` to notify the user that they have subscribed / unsubscribed.

### Process Newsletter

We `INSERT` a newsletter document in the database that contains the partially rendered newsletter for the user and then we send multiple `ProcessNewsletter` events into the `PROCESS_NEWSLETTER_QUEUE`.

A single `ProcessNewsletter` event consists of a page (`skip` & `take`) of the `email_address` database table. The consumer then process that page and outputs dedicated `SendEmail` events into the `SEND_MAIL_QUEUE` for each email address in that page.

This is done in order to decouple the newsletter processing from the API, because for large lists of email addresses the processing will take a while.

### Send Mail

## Deployment
