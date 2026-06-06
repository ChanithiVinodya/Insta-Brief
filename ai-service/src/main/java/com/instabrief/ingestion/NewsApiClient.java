package com.instabrief.ingestion;

import com.fasterxml.jackson.databind.JsonNode;
import com.instabrief.config.InstaBriefProperties;
import com.instabrief.normalization.ContentNormalizer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Component
public class NewsApiClient {

    private static final Logger log = LoggerFactory.getLogger(NewsApiClient.class);

    private final RestClient restClient;
    private final InstaBriefProperties properties;
    private final ContentNormalizer normalizer;

    public NewsApiClient(RestClient restClient, InstaBriefProperties properties, ContentNormalizer normalizer) {
        this.restClient = restClient;
        this.properties = properties;
        this.normalizer = normalizer;
    }

    public List<ArticleDraft> fetchTopHeadlines() {
        List<ArticleDraft> drafts = new ArrayList<>();
        String apiKey = properties.getNewsApiKey();
        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("your_")) {
            log.warn("NewsAPI key not configured — skipping NewsAPI ingestion");
            return drafts;
        }
        try {
            String url = String.format(
                    "%s?country=%s&pageSize=%d",
                    properties.getNewsApiUrl(),
                    properties.getNewsApiCountry(),
                    properties.getNewsApiPageSize());

            JsonNode response = restClient.get()
                    .uri(url)
                    .header("X-Api-Key", properties.getNewsApiKey())
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null || !response.has("articles")) {
                log.warn("NewsAPI returned no articles");
                return drafts;
            }

            for (JsonNode article : response.get("articles")) {
                String articleUrl = textOrNull(article, "url");
                if (articleUrl == null || articleUrl.isBlank()) {
                    continue;
                }
                ArticleDraft draft = new ArticleDraft();
                draft.setExternalId(articleUrl);
                draft.setSource("newsapi");
                draft.setTitle(textOrNull(article, "title"));
                draft.setUrl(articleUrl);
                draft.setContent(normalizer.normalizePlain(
                        textOrNull(article, "description") + " " + textOrNull(article, "content")));
                draft.setAuthor(textOrNull(article, "author"));
                draft.setImageUrl(textOrNull(article, "urlToImage"));
                String published = textOrNull(article, "publishedAt");
                if (published != null) {
                    draft.setPublishedAt(Instant.parse(published));
                }
                drafts.add(draft);
            }
            log.info("Fetched {} articles from NewsAPI", drafts.size());
        } catch (Exception e) {
            log.warn("NewsAPI fetch failed, continuing with other sources: {}", e.getMessage());
        }
        return drafts;
    }

    private String textOrNull(JsonNode node, String field) {
        if (node.has(field) && !node.get(field).isNull()) {
            return node.get(field).asText();
        }
        return null;
    }
}
