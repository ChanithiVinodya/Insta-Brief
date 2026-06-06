package com.instabrief.service;

import com.instabrief.config.InstaBriefProperties;
import com.instabrief.nlp.NlpClient;
import com.instabrief.persistence.entity.ArticleEntity;
import com.instabrief.persistence.entity.ArticleKeywordEntity;
import com.instabrief.persistence.repository.ArticleKeywordRepository;
import com.instabrief.persistence.repository.ArticleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class ArticleProcessingService {

    private static final Logger log = LoggerFactory.getLogger(ArticleProcessingService.class);

    private final ArticleRepository articleRepository;
    private final ArticleKeywordRepository keywordRepository;
    private final NlpClient nlpClient;
    private final InstaBriefProperties properties;

    public ArticleProcessingService(ArticleRepository articleRepository,
                                    ArticleKeywordRepository keywordRepository,
                                    NlpClient nlpClient,
                                    InstaBriefProperties properties) {
        this.articleRepository = articleRepository;
        this.keywordRepository = keywordRepository;
        this.nlpClient = nlpClient;
        this.properties = properties;
    }

    @Transactional
    public int processUnprocessed() {
        List<ArticleEntity> articles = articleRepository.findUnprocessedArticles();
        int processed = 0;

        for (ArticleEntity article : articles) {
            try {
                String text = buildNlpInput(article);
                String summary = nlpClient.summarize(text, properties.getSummaryMaxLength());
                List<String> keywords = nlpClient.extractKeywords(text, properties.getMaxKeywords());

                article.setSummary(summary);
                article.setProcessedAt(Instant.now());
                articleRepository.save(article);

                keywordRepository.deleteByArticleId(article.getId());
                double weight = keywords.size();
                for (String keyword : keywords) {
                    ArticleKeywordEntity kw = new ArticleKeywordEntity();
                    kw.setArticleId(article.getId());
                    kw.setKeyword(keyword.toLowerCase());
                    kw.setWeight(weight);
                    keywordRepository.save(kw);
                    weight -= 0.1;
                }
                processed++;
            } catch (Exception e) {
                log.error("Failed to process article {}: {}", article.getId(), e.getMessage());
            }
        }
        log.info("Processed {} articles with NLP", processed);
        return processed;
    }

    private String buildNlpInput(ArticleEntity article) {
        StringBuilder sb = new StringBuilder(article.getTitle());
        if (article.getContent() != null && !article.getContent().isBlank()) {
            sb.append(". ").append(article.getContent());
        }
        return sb.toString();
    }
}
