import { Router } from 'express';
import { authJwt } from '../middleware/authJwt.js';
import { Article, UserInteraction } from '../models/index.js';

const VALID_TYPES = ['view', 'bookmark', 'like'];

const router = Router();

router.post('/', authJwt, async (req, res, next) => {
  try {
    const { articleId, type } = req.body;
    if (!articleId || !type) {
      return res.status(400).json({ error: 'articleId and type are required' });
    }
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(', ')}` });
    }

    const article = await Article.findByPk(articleId);
    if (!article) return res.status(404).json({ error: 'Article not found' });

    const interaction = await UserInteraction.create({
      user_id: req.userId,
      article_id: articleId,
      interaction_type: type,
    });

    res.status(201).json({
      id: interaction.id,
      articleId,
      type,
      createdAt: interaction.created_at,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
