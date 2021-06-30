const winston = require('winston');

const myFormat = winston.format.printf(
  info => `${info.timestamp} ${info.level}: ${info.message}`,
);
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(winston.format.timestamp(), myFormat),

  transports: [
    new winston.transports.File({
      level: 'info',
      filename: './logs/allLogs.log',
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: false,
    }),
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: './logs/exceptions.log',
    }),
  ],
  exitOnError: false,
});
// console.log(undefinedVariable);

module.exports = logger;
module.exports.stream = {
  write(message) {
    logger.info(message);
  },
};
