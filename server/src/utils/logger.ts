import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'advanced-auth-service' },
  transports: [
    new transports.Console()
    // In production, add file or remote transports here.
  ]
});

export default logger;
