# The Civia Project Website & Newsletter

> Make the world <strong>more resilient</strong> towards and <strong>better equipped</strong> against <u>fake news</u>, <u>propaganda</u>, <u>disinformation</u>, <u>misinformation</u> and <u>malinformation</u>.

## Structure

- `apps/website/` - The Civia Project website, built with [Astro](https://astro.build/) and [Tailwind CSS](https://tailwindcss.com/).
- `apps/newsletter/` - The Civia Project newsletter, built with [Hono](https://hono.dev/), [Drizzle ORM](https://orm.drizzle.team/), [amqplib](https://amqp-node.github.io/amqplib/), [React Email](https://react.email/), [LavinMQ](https://lavinmq.com/) and [Turso](https://turso.tech/).
- `api-docs` - [Bruno](https://www.usebruno.com/) API Collection
- `packages/amqp` - specific AMQP primitives and queue orchestration using [amqplib](https://amqp-node.github.io/amqplib/).
- `packages/db` - database connection and queries, mutations, procedures and other primitives using [DrizzleORM](https://orm.drizzle.team/).
- `packages/email` - emails (subscribe, unsubscribe, newsletters), using [React Email](https://react.email/).
- `packages/logger` - configured logger, using [Pino](https://pino.dev/).`pino-pretty` for local development and `pink-floki` for production.
- `packages/prettier-config` - [Prettier](https://prettier.io/) configuration for the project.
- `packages/core` - general utilities and types used across the project.

## Getting started

- [Node.js](https://nodejs.org/) v24
- [pnpm](https://pnpm.io/) v10
- [Docker](https://docker.com)
- [Bruno](https://www.usebruno.com/)

1. Setup a `.env` file

```sh
LOG_LEVEL="info"

AMQP_URL="amqp://localhost:5672"

# Used by the frontend to subscribe & unsubscribe users
API_URL="http://localhost:3000"
# Used for the authorization layer on the `/work/*` endpoints
API_KEY="some-api-key"

# LibSQL `turso dev` Server URL
TURSO_DATABASE_URL="http://127.0.0.1:8080"
```

2. Install the Node.js dependencies

```sh
pnpm install
```

3. Start up LavinMQ via docker

```sh
docker compose up -d
```

4. Run `apps/website`, `apps/newsletter`, `packages/email` and `turso` in development mode.

```sh
pnpm -r --parallel run dev
```
