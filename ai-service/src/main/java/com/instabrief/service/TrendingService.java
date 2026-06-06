package com.instabrief.service;

import com.instabrief.persistence.entity.ArticleEntity;
import com.instabrief.persistence.entity.TrendingTopicEntity;
import com.instabrief.persistence.repository.ArticleKeywordRepository;
import com.instabrief.persistence.repository.ArticleRepository;
import com.instabrief.persistence.repository.TrendingTopicRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class TrendingService {

    private static final Logger log = LoggerFactory.getLogger(TrendingService.class);

    private final TrendingTopicRepository trendingTopicRepository;
    private final ArticleKeywordRepository keywordRepository;
    private final ArticleRepository articleRepository;
    private final EntityManager entityManager;

    public TrendingService(TrendingTopicRepository trendingTopicRepository,
                           ArticleKeywordRepository keywordRepository,
                           ArticleRepository articleRepository,
                           EntityManager entityManager) {
        this.trendingTopicRepository = trendingTopicRepository;
        this.keywordRepository = keywordRepository;
        this.articleRepository = articleRepository;
        this.entityManager = entityManager;
    }

    @Transactional
    public void recomputeTrending() {
        Instant windowEnd = Instant.now();
        Instant windowStart = windowEnd.minus(7, ChronoUnit.DAYS);

        trendingTopicRepository.deleteOlderThan(windowStart.minus(30, ChronoUnit.DAYS));

        @SuppressWarnings("unchecked")
        List<Object[]> rows = keywordRepository.findKeywordFrequencyRecent();

        for (Object[] row : rows) {
            String topic = (String) row[0];
            long count = ((Number) row[1]).longValue();
            double avgScore = row[2] != null ? ((Number) row[2]).doubleValue() : 0;

            double engagementBoost = fetchEngagementBoost(topic);
            double recencyFactor = 1.0;
            double score = (count * 2.0) + avgScore + engagementBoost + recencyFactor;

            TrendingTopicEntity entity = new TrendingTopicEntity();
            entity.setTopic(topic);
            entity.setScore(score);
            entity.setArticleCount((int) count);
            entity.setWindowStart(windowStart);
            entity.setWindowEnd(windowEnd);
            trendingTopicRepository.save(entity);

            updateArticleTrendingScores(topic, score);
        }
        log.info("Recomputed {} trending topics", rows.size());
    }

    private double fetchEngagementBoost(String keyword) {
        Query q = entityManager.createNativeQuery("""
            SELECT COUNT(*) FROM user_interactions ui
            JOIN article_keywords ak ON ak.article_id = ui.article_id
            WHERE LOWER(ak.keyword) = LOWER(:keyword)
            AND ui.created_at >= NOW() - INTERVAL '7 days'
            """);
        q.setParameter("keyword", keyword);
        Number result = (Number) q.getSingleResult();
        return result != null ? result.doubleValue() * 0.5 : 0;
    }

    private void updateArticleTrendingScores(String keyword, double score) {
        Query q = entityManager.createQuery("""
            SELECT a FROM ArticleEntity a
            JOIN ArticleKeywordEntity k ON k.articleId = a.id
            WHERE LOWER(k.keyword) = LOWER(:keyword)
            """);
        q.setParameter("keyword", keyword);
        @SuppressWarnings("unchecked")
        List<ArticleEntity> articles = q.getResultList();
        for (ArticleEntity article : articles) {
            article.setTrendingScore(Math.max(article.getTrendingScore(), score));
            articleRepository.save(article);
        }
    }
}
