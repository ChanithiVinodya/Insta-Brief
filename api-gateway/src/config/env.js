import dotenv from 'dotenv';

dotenv.config();

const required = ['DATABASE_URL', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`FATAL: Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

export const env = {
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5174')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  feedWeights: {
    interest: parseFloat(process.env.FEED_W_INTEREST || '0.4'),
    keyword: parseFloat(process.env.FEED_W_KEYWORD || '0.3'),
    recency: parseFloat(process.env.FEED_W_RECENCY || '0.2'),
    trending: parseFloat(process.env.FEED_W_TRENDING || '0.1'),
  },
  recencyHalfLifeHours: parseFloat(process.env.FEED_RECENCY_HALF_LIFE || '48'),
};
