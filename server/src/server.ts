import app from './app';
import { config } from './config/config';
import { connectDB } from './config/database';
import logger from './utils/logger';

const startServer = async () => {
  await connectDB();
  app.listen(config.port, () => {
    logger.info(`Server is running on port ${config.port}`);
  });
};

startServer();
