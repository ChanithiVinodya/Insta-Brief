package com.instabrief.persistence.repository;

import com.instabrief.persistence.entity.ArticleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ArticleRepository extends JpaRepository<ArticleEntity, UUID> {

    Optional<ArticleEntity> findByUrl(String url);

    @Query("SELECT a FROM ArticleEntity a WHERE a.summary IS NULL OR a.processedAt IS NULL ORDER BY a.ingestedAt DESC")
    List<ArticleEntity> findUnprocessedArticles();
}
