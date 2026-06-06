package com.instabrief.service;

import com.instabrief.ingestion.ArticleDraft;
import com.instabrief.ingestion.NewsApiClient;
import com.instabrief.ingestion.RssFeedClient;
import com.instabrief.persistence.entity.ArticleEntity;
import com.instabrief.persistence.repository.ArticleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class ArticleIngestionService {

    private static final int MAX_EXTERNAL_ID = 255;
    private static final int MAX_SOURCE = 100;
    private static final int MAX_TITLE = 500;
    private static final int MAX_AUTHOR = 255;

    private static final Logger log = LoggerFactory.getLogger(ArticleIngestionService.class);

    private final NewsApiClient newsApiClient;
    private final RssFeedClient rssFeedClient;
    private final ArticleRepository articleRepository;

    public ArticleIngestionService(NewsApiClient newsApiClient, RssFeedClient rssFeedClient,
                                   ArticleRepository articleRepository) {
        this.newsApiClient = newsApiClient;
        this.rssFeedClient = rssFeedClient;
        this.articleRepository = articleRepository;
    }

    public int ingestAll() {
        List<ArticleDraft> drafts = new ArrayList<>();

        try {
            drafts.addAll(newsApiClient.fetchTopHeadlines());
        } catch (Exception e) {
            log.warn("NewsAPI ingestion skipped: {}", e.getMessage());
        }

        try {
            drafts.addAll(rssFeedClient.fetchAllFeeds());
        } catch (Exception e) {
            log.error("RSS ingestion failed: {}", e.getMessage(), e);
        }

        int saved = 0;
        for (ArticleDraft draft : drafts) {
            try {
                if (saveArticle(draft)) {
                    saved++;
                }
            } catch (Exception e) {
                log.warn("Skipping article '{}': {}", draft.getTitle(), e.getMessage());
            }
        }
        log.info("Ingestion complete: {} new articles saved", saved);
        return saved;
    }

    private boolean saveArticle(ArticleDraft draft) {
        if (draft.getUrl() == null || draft.getTitle() == null) {
            return false;
        }
        if (articleRepository.findByUrl(draft.getUrl()).isPresent()) {
            return false;
        }

        ArticleEntity entity = new ArticleEntity();
        entity.setExternalId(truncate(draft.getExternalId(), MAX_EXTERNAL_ID));
        entity.setSource(truncate(draft.getSource(), MAX_SOURCE));
        entity.setTitle(truncate(draft.getTitle(), MAX_TITLE));
        entity.setUrl(draft.getUrl());
        entity.setContent(draft.getContent());
        entity.setAuthor(truncate(draft.getAuthor(), MAX_AUTHOR));
        entity.setImageUrl(draft.getImageUrl());
        entity.setPublishedAt(draft.getPublishedAt() != null ? draft.getPublishedAt() : Instant.now());
        entity.setIngestedAt(Instant.now());
        articleRepository.save(entity);
        return true;
    }

    private String truncate(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }
}
