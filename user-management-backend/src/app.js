import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { securityMiddleware } from './middleware/sanitize.js';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import AppError from './utils/AppError.js';

dotenv.config();

const app = express();

// Security middleware FIRST
securityMiddleware(app);

// CORS configuration (restrict in production)
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend.com'] 
    : '*', // Dev only - restrict in production!
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/v1', routes);

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler (MUST be last)
app.use(errorHandler);

export default app;