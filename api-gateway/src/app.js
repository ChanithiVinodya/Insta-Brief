import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { sequelize } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import feedRoutes from './routes/feed.js';
import articleRoutes from './routes/articles.js';
import interactionRoutes from './routes/interactions.js';
import trendingRoutes from './routes/trending.js';

import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';

const app = express();

// Apply general rate limiter to all requests
app.use(generalLimiter);


app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/trending', trendingRoutes);

app.use(errorHandler);

export default app;
