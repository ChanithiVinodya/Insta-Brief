import { Router } from 'express';
import { Op } from 'sequelize';
import { authJwt } from '../middleware/authJwt.js';
import { sequelize } from '../config/database.js';
import { Article, ArticleKeyword, UserInterest } from '../models/index.js';
import { scoreArticle } from '../services/feedScoring.js';

const router = Router();

function mapArticle(article, keywords) {
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
  };
}

async function loadKeywordsByArticle(articleIds) {
  if (articleIds.length === 0) return {};

  const allKeywords = await ArticleKeyword.findAll({
    where: { article_id: { [Op.in]: articleIds } },
  });

  const keywordsByArticle = {};
  for (const kw of allKeywords) {
    if (!keywordsByArticle[kw.article_id]) keywordsByArticle[kw.article_id] = [];
    keywordsByArticle[kw.article_id].push(kw);
  }
  return keywordsByArticle;
}

router.get('/', authJwt, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const topic = typeof req.query.topic === 'string' ? req.query.topic.trim() : '';
    const defaultLimit = topic ? 200 : 20;
    const maxLimit = topic ? 500 : 100;
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit || String(defaultLimit), 10)));

    if (topic) {
      const topicLower = topic.toLowerCase();
      const matchingKeywords = await ArticleKeyword.findAll({
        where: sequelize.where(sequelize.fn('lower', sequelize.col('keyword')), topicLower),
        attributes: ['article_id'],
      });

      const articleIds = [...new Set(matchingKeywords.map((k) => k.article_id))];
      if (articleIds.length === 0) {
        return res.json({
          data: [],
          topic,
          pagination: { page, limit, total: 0, totalPages: 0 },
        });
      }

      const articles = await Article.findAll({
        where: {
          id: { [Op.in]: articleIds },
          summary: { [Op.ne]: null },
        },
        order: [['published_at', 'DESC']],
      });

      const keywordsByArticle = await loadKeywordsByArticle(articles.map((a) => a.id));
      const mapped = articles.map((article) =>
        mapArticle(article, keywordsByArticle[article.id] || [])
      );

      const offset = (page - 1) * limit;
      const paginated = mapped.slice(offset, offset + limit);

      return res.json({
        data: paginated,
        topic,
        pagination: {
          page,
          limit,
          total: mapped.length,
          totalPages: Math.ceil(mapped.length / limit),
        },
      });
    }

    const interests = await UserInterest.findAll({ where: { user_id: req.userId } });
    const interestList = interests.map((i) => i.interest);

    const articles = await Article.findAll({
      where: { summary: { [Op.ne]: null } },
      order: [['published_at', 'DESC']],
      limit: 200,
    });

    const keywordsByArticle = await loadKeywordsByArticle(articles.map((a) => a.id));

    const scored = articles.map((article) => {
      const keywords = keywordsByArticle[article.id] || [];
      const { score } = scoreArticle(article, keywords, interestList);
      return {
        ...mapArticle(article, keywords),
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
