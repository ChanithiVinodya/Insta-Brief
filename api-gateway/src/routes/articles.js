import { Router } from 'express';
import { authJwt } from '../middleware/authJwt.js';
import { Article, ArticleKeyword } from '../models/index.js';

const router = Router();

router.get('/:id', authJwt, async (req, res, next) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });

    const keywords = await ArticleKeyword.findAll({
      where: { article_id: article.id },
    });

    res.json({
      id: article.id,
      title: article.title,
      summary: article.summary,
      content: article.content,
      source: article.source,
      url: article.url,
      imageUrl: article.image_url,
      author: article.author,
      publishedAt: article.published_at,
      trendingScore: article.trending_score,
      keywords: keywords.map((k) => k.keyword),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
