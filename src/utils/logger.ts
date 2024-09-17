import winston, { format, transports } from "winston"
import LokiTransport from "winston-loki"
import "dotenv/config"

var logger: any;

const commonOptions: winston.LoggerOptions = {
  level: "info",
  format: winston.format.combine(
    winston.format.printf(({ level, message }) => {
      return `[${level.toUpperCase()}]: ${message}`
    }),
  ),
}

let config: winston.LoggerOptions = {
  transports: [new winston.transports.Console()],
}

const envLocation = process.env.NODE_ENV || "dev"

if (["dev", "staging", "production"].includes(envLocation)) {
  console.log("here")

  config = {
    transports: [
      new LokiTransport({
        host: process.env.LOKI_HOST||"http://host.docker.internal:3100" as string,
        labels: { app: process.env.LOKI_APP_NAME || `infra_${envLocation}` },
        json: true,
        format: format.json(),
        replaceTimestamp: true,
        onConnectionError: (err: any) => logger.error(err),
      }),
      new transports.Console({
        format: format.combine(format.simple(), format.colorize()),
      }),
    ],
  }
}

function init() {
  if (!logger) {
    getLogger();
  }
  return logger;
}

function getLogger() {
  logger = winston.createLogger({ ...commonOptions, ...config })
  return logger;
  
}

module.exports = { init };