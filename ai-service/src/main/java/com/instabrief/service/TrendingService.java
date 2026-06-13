package com.instabrief.service;

import com.instabrief.nlp.HuggingFaceNlpClient;
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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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

        List<Object[]> rows = keywordRepository.findKeywordFrequencyRecent();
        List<TrendingTopicEntity> candidates = new ArrayList<>();
        List<String> filteredTopics = new ArrayList<>();

        for (Object[] row : rows) {
            String topic = (String) row[0];

            if (HuggingFaceNlpClient.isNoiseKeyword(topic)) {
                filteredTopics.add(topic);
                continue;
            }

            String normalizedTopic = HuggingFaceNlpClient.normalizeKeyword(topic);
            if (normalizedTopic.length() < 4 || !normalizedTopic.matches(".*[a-z].*")) {
                filteredTopics.add(topic);
                continue;
            }

            if (normalizedTopic.matches("[\\d\\s\\p{Punct}]+")) {
                filteredTopics.add(topic);
                continue;
            }

            long count = ((Number) row[1]).longValue();
            double avgScore = row[2] != null ? ((Number) row[2]).doubleValue() : 0;
            long sourceCount = row[3] != null ? ((Number) row[3]).longValue() : 1;
            long headlineCount = row[4] != null ? ((Number) row[4]).longValue() : 0;

            double engagementBoost = fetchEngagementBoost(topic);

            double score = (count * 1.5) + (sourceCount * 3.0) + (headlineCount * 5.0) + engagementBoost
                    + (avgScore * 0.1);

            TrendingTopicEntity entity = new TrendingTopicEntity();
            entity.setTopic(normalizedTopic);
            entity.setScore(score);
            entity.setArticleCount((int) count);
            entity.setWindowStart(windowStart);
            entity.setWindowEnd(windowEnd);

            try {
                Query articleQuery = entityManager.createQuery("""
                        SELECT a FROM ArticleEntity a
                        JOIN ArticleKeywordEntity k ON k.articleId = a.id
                        WHERE LOWER(k.keyword) = LOWER(:topic)
                        ORDER BY a.publishedAt DESC
                        """);
                articleQuery.setParameter("topic", topic);
                articleQuery.setMaxResults(1);
                ArticleEntity rep = (ArticleEntity) articleQuery.getSingleResult();
                if (rep != null) {
                    entity.setSummary(rep.getSummary());
                    entity.setImageUrl(rep.getImageUrl());
                    entity.setCategory(rep.getSource());
                }
            } catch (Exception e) {
                // No representative article
            }
            candidates.add(entity);
        }

        List<TrendingTopicEntity> top20 = candidates.stream()
                .sorted((a, b) -> Double.compare(b.getScore(), a.getScore()))
                .limit(20)
                .collect(Collectors.toList());

        trendingTopicRepository.deleteAllTopics();

        for (TrendingTopicEntity entity : top20) {
            trendingTopicRepository.save(entity);
            updateArticleTrendingScores(entity.getTopic(), entity.getScore());
        }

        // #region agent log
        debugLog("TrendingService.java:recomputeTrending", "trending recompute complete", java.util.Map.of(
                "hypothesisId", "C",
                "rowCount", rows.size(),
                "filteredCount", filteredTopics.size(),
                "filteredSample", filteredTopics.stream().limit(10).collect(Collectors.toList()),
                "savedTopics", top20.stream().map(TrendingTopicEntity::getTopic).collect(Collectors.toList())));
        // #endregion

        log.info("Recomputed {} trending topics (filtered {} noise keywords)", top20.size(), filteredTopics.size());
    }

    private void debugLog(String location, String message, java.util.Map<String, Object> data) {
        try {
            String payload = "{\"sessionId\":\"11efc6\",\"location\":\"" + location + "\",\"message\":\"" + message
                    + "\",\"data\":" + new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(data)
                    + ",\"timestamp\":" + System.currentTimeMillis() + "}";
            Files.writeString(Path.of("debug-11efc6.log"), payload + System.lineSeparator(),
                    StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (IOException ignored) {
        }
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
