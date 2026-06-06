import { env } from '../config/env.js';

export function scoreArticle(article, keywords, userInterests) {
  const interestSet = new Set(userInterests.map((i) => i.toLowerCase()));
  const keywordList = keywords.map((k) => k.keyword.toLowerCase());

  const interestMatch = keywordList.filter((k) => interestSet.has(k)).length;
  const interestScore = interestSet.size > 0
    ? interestMatch / interestSet.size
    : 0;

  const keywordOverlap = keywordList.length > 0
    ? keywordList.filter((k) => interestSet.has(k)).length / keywordList.length
    : 0;

  const publishedAt = article.published_at ? new Date(article.published_at) : new Date();
  const ageHours = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);
  const recencyScore = Math.exp(-ageHours / env.recencyHalfLifeHours);

  const trendingScore = Math.min(article.trending_score || 0, 100) / 100;

  const w = env.feedWeights;
  const score =
    w.interest * interestScore +
    w.keyword * keywordOverlap +
    w.recency * recencyScore +
    w.trending * trendingScore;

  return {
    score,
    interestScore,
    keywordOverlap,
    recencyScore,
    trendingScore,
  };
}
