import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Add file transports in production/staging
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
  logger.add(new winston.transports.File({ filename: 'log/error.log', level: 'error' }));
  logger.add(new winston.transports.File({ filename: 'log/combined.log' }));
}

export default logger;
