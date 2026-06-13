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

    // #region agent log
    fetch('http://127.0.0.1:7489/ingest/a4e5ad49-7eae-456f-84eb-603849701193',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11efc6'},body:JSON.stringify({sessionId:'11efc6',location:'api-gateway/src/routes/trending.js',message:'trending topics returned',data:{hypothesisId:'B',rawCount:topics.length,returnedCount:filtered.length,returnedTopics:filtered.map(t=>t.topic).slice(0,20)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    res.json({
      data: filtered.map((t) => ({
        id: t.id,
        topic: t.topic,
        score: t.score,
        articleCount: t.article_count,
        windowStart: t.window_start,
        windowEnd: t.window_end,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
