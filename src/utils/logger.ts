import { createLogger, format, transports } from "winston";
require("winston-daily-rotate-file");
const { combine, timestamp, printf, colorize } = format;
// const config = require("./config");

var logger: any;

function init() {
  if (!logger) {
    getLogger();
  }
  return logger;
}

function getLogger() {
  const myFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] [${level}]: ${message}`;
  });
  // const log = config.getLog();
  logger = createLogger({
    level: `{
      log: {
        level: "DEBUG",
        output_type: "file",
        out_file: "/logs/log_file.log",
      },
    }`,

    format: combine(timestamp(), colorize(), myFormat),
    transports: [
      new transports.Console({
        level: "debug",
      }),
      //   new transports.DailyRotateFile({
      //     filename: "log_report",
      //     datePattern: "YYYY-MM-DD",
      //     zippedArchive: true,
      //     level: "info",
      //   }),
      new transports.Console(),
    ],
  });
  return logger;
}

module.exports = { init };
