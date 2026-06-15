import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

const baseOptions: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
};

/**
 * Pino logger instance.
 *
 * - **Development**: uses `pino-pretty` transport for human-readable,
 *   colorized output with timestamps.
 * - **Production**: outputs structured JSON to stdout, suitable for
 *   ingestion by log aggregation systems (Datadog, Grafana, etc.).
 *
 * Log level is controlled via the `LOG_LEVEL` env var (defaults to
 * `debug` in dev, `info` in production).
 *
 * @example
 *   import logger from "@/lib/logger";
 *
 *   logger.info("Server started");
 *   logger.error({ err }, "Failed to connect to DB");
 *   logger.debug({ accountId }, "Syncing positions");
 */
const logger = isDev
  ? pino({
      ...baseOptions,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
    })
  : pino(baseOptions);

export default logger;
