package com.instabrief.persistence.repository;

import com.instabrief.persistence.entity.ArticleKeywordEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface ArticleKeywordRepository extends JpaRepository<ArticleKeywordEntity, UUID> {

    List<ArticleKeywordEntity> findByArticleId(UUID articleId);

    @Modifying
    @Transactional
    @Query("DELETE FROM ArticleKeywordEntity k WHERE k.articleId = :articleId")
    void deleteByArticleId(UUID articleId);

    @Query(value = """
        SELECT k.keyword, COUNT(*) as cnt, AVG(a.trending_score) as avg_score
        FROM article_keywords k
        JOIN articles a ON a.id = k.article_id
        WHERE a.published_at >= NOW() - INTERVAL '7 days'
        GROUP BY k.keyword
        ORDER BY cnt DESC
        LIMIT 50
        """, nativeQuery = true)
    List<Object[]> findKeywordFrequencyRecent();
}
