import pino, {
  type TransportMultiOptions,
  type TransportPipelineOptions,
  type TransportSingleOptions,
} from 'pino';
import type { LokiOptions } from 'pino-loki';

const transports: Record<
  string,
  TransportSingleOptions | TransportMultiOptions | TransportPipelineOptions
> = {
  pretty: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      errorProps: 'error',
    },
  },
  prod: {
    target: 'pino-loki',
    options: {
      host: process.env.GRAFANA_LOKI_URL!,
      basicAuth: {
        username: process.env.GRAFANA_LOKI_USERNAME!,
        password: process.env.GRAFANA_LOKI_PASSWORD!,
      },
      labels: {
        service: 'newsletter',
      },
    },
  } satisfies TransportSingleOptions<LokiOptions>,
};

const chosenTransport =
  process.env.NODE_ENV === 'production' ? 'prod' : 'pretty';

export default () =>
  pino({
    level:
      process.env.NODE_ENV === 'production' ? 'warn' : process.env.LOG_LEVEL!,
    transport: transports[chosenTransport],
  });
