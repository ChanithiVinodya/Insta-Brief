import { Router } from 'express';
import { Op } from 'sequelize';
import { authJwt } from '../middleware/authJwt.js';
import { Article, ArticleKeyword, UserInterest } from '../models/index.js';
import { scoreArticle } from '../services/feedScoring.js';

const router = Router();

router.get('/', authJwt, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20', 10)));

    const interests = await UserInterest.findAll({ where: { user_id: req.userId } });
    const interestList = interests.map((i) => i.interest);

    const articles = await Article.findAll({
      where: { summary: { [Op.ne]: null } },
      order: [['published_at', 'DESC']],
      limit: 200,
    });

    const articleIds = articles.map((a) => a.id);
    const allKeywords = await ArticleKeyword.findAll({
      where: { article_id: { [Op.in]: articleIds } },
    });

    const keywordsByArticle = {};
    for (const kw of allKeywords) {
      if (!keywordsByArticle[kw.article_id]) keywordsByArticle[kw.article_id] = [];
      keywordsByArticle[kw.article_id].push(kw);
    }

    const scored = articles.map((article) => {
      const keywords = keywordsByArticle[article.id] || [];
      const { score } = scoreArticle(article, keywords, interestList);
      return {
        id: article.id,
        title: article.title,
        summary: article.summary,
        source: article.source,
        url: article.url,
        imageUrl: article.image_url,
        author: article.author,
        publishedAt: article.published_at,
        trendingScore: article.trending_score,
        keywords: keywords.map((k) => k.keyword),
        feedScore: score,
      };
    });

    scored.sort((a, b) => b.feedScore - a.feedScore || new Date(b.publishedAt) - new Date(a.publishedAt));

    const offset = (page - 1) * limit;
    const paginated = scored.slice(offset, offset + limit);

    res.json({
      data: paginated,
      pagination: {
        page,
        limit,
        total: scored.length,
        totalPages: Math.ceil(scored.length / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
