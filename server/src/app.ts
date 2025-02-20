import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import authRoutes from './routes/authRoutes';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config/config';

const app = express();

// Enable CORS: allow requests from your frontend origin.
app.use(cors({ origin: config.corsOrigin, credentials: true }));

// Set security-related HTTP headers.
app.use(helmet());

// Parse JSON bodies.
app.use(express.json());

// Sanitize data to prevent NoSQL injection.
app.use(mongoSanitize());

// Apply rate limiting.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per IP per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Mount authentication routes.
app.use('/api/auth', authRoutes);

// Global error handler.
app.use(errorHandler);

export default app;
