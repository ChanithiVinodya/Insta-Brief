import { Router } from 'express';
import { authJwt } from '../middleware/authJwt.js';
import { TrendingTopic } from '../models/index.js';
import { isNoiseTopic } from '../services/topicFilter.js';

const router = Router();

router.get('/', authJwt, async (req, res, next) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const topics = await TrendingTopic.findAll({
      order: [['score', 'DESC'], ['window_end', 'DESC']],
      limit: limit * 3,
    });

    const filtered = topics.filter((t) => !isNoiseTopic(t.topic)).slice(0, limit);

    res.json({
      data: filtered.map((t) => ({
        id: t.id,
        topic: t.topic,
        score: t.score,
        articleCount: t.article_count,
        windowStart: t.window_start,
        windowEnd: t.window_end,
        summary: t.summary,
        imageUrl: t.image_url,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
