# Build from the monorepo root:
#   docker build -f apps/newsletter/Dockerfile -t newsletter .
#
# Run (required env vars: API_KEY, AMQP_URL, TURSO_DATABASE_URL, BREVO_API_KEY):
#   docker run --rm -p 3000:3000 --env-file .env newsletter

FROM node:24-alpine

WORKDIR /app

ENV CI=true
RUN corepack enable
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY . .
RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/newsletter
EXPOSE 3000

CMD ["pnpm", "start"]
