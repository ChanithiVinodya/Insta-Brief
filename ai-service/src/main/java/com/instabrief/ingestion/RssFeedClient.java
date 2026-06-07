package com.instabrief.ingestion;

import com.instabrief.config.InstaBriefProperties;
import com.instabrief.normalization.ContentNormalizer;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.URL;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class RssFeedClient {

    private static final Logger log = LoggerFactory.getLogger(RssFeedClient.class);

    private final InstaBriefProperties properties;
    private final ContentNormalizer normalizer;

    public RssFeedClient(InstaBriefProperties properties, ContentNormalizer normalizer) {
        this.properties = properties;
        this.normalizer = normalizer;
    }

    public List<ArticleDraft> fetchAllFeeds() {
        List<ArticleDraft> drafts = new ArrayList<>();
        String urls = properties.getRssFeedUrls();
        if (urls == null || urls.isBlank()) {
            return drafts;
        }

        Arrays.stream(urls.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .forEach(feedUrl -> {
                    try {
                        drafts.addAll(fetchFeed(feedUrl));
                    } catch (Exception e) {
                        log.warn("Skipping RSS feed {}: {}", feedUrl, e.getMessage());
                    }
                });
        return drafts;
    }

    private List<ArticleDraft> fetchFeed(String feedUrl) throws Exception {
        List<ArticleDraft> drafts = new ArrayList<>();
        SyndFeedInput input = new SyndFeedInput();
        SyndFeed feed = input.build(new XmlReader(new URL(feedUrl).openStream()));
        String source = "rss:" + feed.getTitle();

        for (SyndEntry entry : feed.getEntries()) {
            if (entry.getLink() == null) {
                continue;
            }
            ArticleDraft draft = new ArticleDraft();
            draft.setExternalId(entry.getUri() != null ? entry.getUri() : entry.getLink());
            draft.setSource(source);
            draft.setTitle(entry.getTitle());
            draft.setUrl(entry.getLink());
            String body = entry.getDescription() != null ? entry.getDescription().getValue() : "";
            draft.setContent(normalizer.normalizeHtml(body));
            if (entry.getAuthor() != null) {
                draft.setAuthor(entry.getAuthor());
            }
            if (entry.getPublishedDate() != null) {
                draft.setPublishedAt(entry.getPublishedDate().toInstant());
            } else {
                draft.setPublishedAt(Instant.now());
            }
            drafts.add(draft);
        }
        log.info("Fetched {} entries from RSS {}", drafts.size(), feedUrl);
        return drafts;
    }
}
