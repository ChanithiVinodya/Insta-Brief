package com.instabrief.ingestion;

import com.instabrief.config.InstaBriefProperties;
import com.instabrief.normalization.ContentNormalizer;
import com.rometools.rome.feed.synd.SyndContent;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import org.jsoup.Jsoup;
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
            
            // Extract image URL from the entry content or feed metadata
            String imageUrl = extractImageUrl(entry, feed, body);
            if (imageUrl != null && !imageUrl.isBlank()) {
                draft.setImageUrl(imageUrl);
            }
            
            drafts.add(draft);
        }
        log.info("Fetched {} entries from RSS {}", drafts.size(), feedUrl);
        return drafts;
    }

    /**
     * Extract image URL from an RSS entry.
     * Attempts to find images from multiple sources:
     * 1. Entry enclosures (for image types)
     * 2. Media extensions (if available)
     * 3. Feed-level image as fallback
     */
    private String extractImageUrl(SyndEntry entry, SyndFeed feed, String bodyHtml) {
        try {
            // Try to get image from enclosures (looks for image MIME types)
            if (entry.getEnclosures() != null && !entry.getEnclosures().isEmpty()) {
                for (Object enclosure : entry.getEnclosures()) {
                    // Rome returns SyndEnclosure objects
                    String type = getEnclosureType(enclosure);
                    if (type != null && type.startsWith("image/")) {
                        String url = getEnclosureUrl(enclosure);
                        if (url != null && !url.isBlank()) {
                            log.debug("Found image from enclosure: {}", url);
                            return url;
                        }
                    }
                }
            }

            // Try to get image from entry content blocks
            String contentImage = extractImageUrlFromEntryContent(entry);
            if (contentImage != null && !contentImage.isBlank()) {
                log.debug("Found image from entry content: {}", contentImage);
                return contentImage;
            }

            // Try to get image from HTML body content
            String bodyImage = extractImageUrlFromHtml(bodyHtml);
            if (bodyImage != null && !bodyImage.isBlank()) {
                log.debug("Found image from HTML body: {}", bodyImage);
                return bodyImage;
            }

            // Try to get image from media extensions (media:content, media:thumbnail)
            if (entry.getModule("http://search.yahoo.com/mrss/") != null) {
                Object mediaModule = entry.getModule("http://search.yahoo.com/mrss/");
                String imageUrl = extractFromMediaModule(mediaModule);
                if (imageUrl != null && !imageUrl.isBlank()) {
                    log.debug("Found image from media extension: {}", imageUrl);
                    return imageUrl;
                }
            }

            // Try to get image from feed level
            if (feed.getImage() != null && feed.getImage().getUrl() != null) {
                String feedImageUrl = feed.getImage().getUrl();
                if (!feedImageUrl.isBlank()) {
                    log.debug("Using feed-level image: {}", feedImageUrl);
                    return feedImageUrl;
                }
            }
        } catch (Exception e) {
            log.debug("Error extracting image URL from RSS entry: {}", e.getMessage());
        }

        return null;
    }

    private String getEnclosureUrl(Object enclosure) {
        try {
            // Rome's SyndEnclosure has getUrl() method
            return (String) enclosure.getClass().getMethod("getUrl").invoke(enclosure);
        } catch (Exception e) {
            log.debug("Error getting enclosure URL: {}", e.getMessage());
            return null;
        }
    }

    private String getEnclosureType(Object enclosure) {
        try {
            // Rome's SyndEnclosure has getType() method
            return (String) enclosure.getClass().getMethod("getType").invoke(enclosure);
        } catch (Exception e) {
            log.debug("Error getting enclosure type: {}", e.getMessage());
            return null;
        }
    }

    private String extractFromMediaModule(Object mediaModule) {
        try {
            // Try to get content list
            Object content = mediaModule.getClass().getMethod("getContent").invoke(mediaModule);
            if (content != null && content instanceof java.util.List) {
                java.util.List<?> contentList = (java.util.List<?>) content;
                if (!contentList.isEmpty()) {
                    Object firstContent = contentList.get(0);
                    Object url = firstContent.getClass().getMethod("getUrl").invoke(firstContent);
                    if (url != null) {
                        return url.toString();
                    }
                }
            }

            // Try to get thumbnails
            Object thumbnail = mediaModule.getClass().getMethod("getThumbnail").invoke(mediaModule);
            if (thumbnail != null && thumbnail instanceof java.util.List) {
                java.util.List<?> thumbnailList = (java.util.List<?>) thumbnail;
                if (!thumbnailList.isEmpty()) {
                    Object firstThumbnail = thumbnailList.get(0);
                    Object url = firstThumbnail.getClass().getMethod("getUrl").invoke(firstThumbnail);
                    if (url != null) {
                        return url.toString();
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Error extracting from media module: {}", e.getMessage());
        }

        return null;
    }

    private String extractImageUrlFromEntryContent(SyndEntry entry) {
        try {
            if (entry.getContents() == null || entry.getContents().isEmpty()) {
                return null;
            }
            for (SyndContent content : entry.getContents()) {
                if (content == null || content.getValue() == null) {
                    continue;
                }
                String url = extractImageUrlFromHtml(content.getValue());
                if (url != null && !url.isBlank()) {
                    return url;
                }
            }
        } catch (Exception e) {
            log.debug("Error extracting image URL from entry content: {}", e.getMessage());
        }
        return null;
    }

    private String extractImageUrlFromHtml(String html) {
        if (html == null || html.isBlank()) {
            return null;
        }
        try {
            org.jsoup.nodes.Document document = Jsoup.parse(html);
            org.jsoup.nodes.Element img = document.selectFirst("img[src]");
            if (img != null) {
                return img.attr("src").trim();
            }
        } catch (Exception e) {
            log.debug("Error parsing HTML image URL: {}", e.getMessage());
        }
        return null;
    }
}
