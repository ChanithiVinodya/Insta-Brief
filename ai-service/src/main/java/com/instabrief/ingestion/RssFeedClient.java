package com.instabrief.ingestion;

import com.instabrief.config.InstaBriefProperties;
import com.instabrief.normalization.ContentNormalizer;
import com.rometools.rome.feed.synd.SyndContent;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndEnclosure;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class RssFeedClient {

    private static final Logger log = LoggerFactory.getLogger(RssFeedClient.class);
    private static final Pattern ITEM_PATTERN = Pattern.compile(
            "<item\\b[\\s\\S]*?</item>",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern LINK_TAG_PATTERN = Pattern.compile(
            "<link>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</link>",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern MEDIA_URL_PATTERN = Pattern.compile(
            "media:(?:content|thumbnail)\\b[^>]*?\\burl=[\"']([^\"']+)[\"']",
            Pattern.CASE_INSENSITIVE);

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
        String rawXml;
        try (var stream = new URL(feedUrl).openStream()) {
            rawXml = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
        Map<String, String> imagesByLink = extractImagesFromRawXml(rawXml);

        SyndFeedInput input = new SyndFeedInput();
        SyndFeed feed = input.build(new XmlReader(
                new ByteArrayInputStream(rawXml.getBytes(StandardCharsets.UTF_8))));
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
                draft.setPublishedAt(java.time.Instant.now());
            }

            String imageUrl = extractImageUrl(entry, body, imagesByLink);
            if (imageUrl != null && !imageUrl.isBlank()) {
                draft.setImageUrl(imageUrl);
            }

            drafts.add(draft);
        }
        log.info("Fetched {} entries from RSS {}", drafts.size(), feedUrl);
        return drafts;
    }

    private Map<String, String> extractImagesFromRawXml(String rawXml) {
        Map<String, String> imagesByLink = new HashMap<>();
        Matcher itemMatcher = ITEM_PATTERN.matcher(rawXml);
        while (itemMatcher.find()) {
            String itemXml = itemMatcher.group();
            Matcher linkMatcher = LINK_TAG_PATTERN.matcher(itemXml);
            if (!linkMatcher.find()) {
                continue;
            }

            String link = normalizeLink(linkMatcher.group(1));
            if (link == null || link.isBlank()) {
                continue;
            }

            Matcher mediaMatcher = MEDIA_URL_PATTERN.matcher(itemXml);
            while (mediaMatcher.find()) {
                String imageUrl = normalizeImageUrl(mediaMatcher.group(1), link);
                if (imageUrl != null && !imageUrl.isBlank()) {
                    imagesByLink.put(link, imageUrl);
                    break;
                }
            }
        }
        return imagesByLink;
    }

    private String extractImageUrl(SyndEntry entry, String bodyHtml, Map<String, String> imagesByLink) {
        try {
            if (entry.getLink() != null) {
                String fromRawXml = imagesByLink.get(normalizeLink(entry.getLink()));
                if (fromRawXml != null) {
                    return fromRawXml;
                }
            }

            String fromEnclosure = extractFromEnclosures(entry);
            if (fromEnclosure != null) {
                return normalizeImageUrl(fromEnclosure, entry.getLink());
            }

            String fromContent = extractImageUrlFromEntryContent(entry);
            if (fromContent != null) {
                return normalizeImageUrl(fromContent, entry.getLink());
            }

            String fromBody = extractImageUrlFromHtml(bodyHtml);
            if (fromBody != null) {
                return normalizeImageUrl(fromBody, entry.getLink());
            }

            String fromRawMedia = extractMediaUrlFromRawMarkup(entry);
            if (fromRawMedia != null) {
                return normalizeImageUrl(fromRawMedia, entry.getLink());
            }
        } catch (Exception e) {
            log.debug("Error extracting image URL from RSS entry: {}", e.getMessage());
        }

        return null;
    }

    private String extractFromEnclosures(SyndEntry entry) {
        if (entry.getEnclosures() == null) {
            return null;
        }
        for (SyndEnclosure enclosure : entry.getEnclosures()) {
            if (enclosure == null) {
                continue;
            }
            String type = enclosure.getType();
            if (type != null && type.startsWith("image/")) {
                String url = enclosure.getUrl();
                if (url != null && !url.isBlank()) {
                    return url;
                }
            }
        }
        return null;
    }

    private String extractMediaUrlFromRawMarkup(SyndEntry entry) {
        if (entry.getForeignMarkup() == null || entry.getForeignMarkup().isEmpty()) {
            return null;
        }
        StringBuilder markup = new StringBuilder();
        entry.getForeignMarkup().forEach(node -> markup.append(node.toString()));
        Matcher matcher = MEDIA_URL_PATTERN.matcher(markup);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    private String extractImageUrlFromEntryContent(SyndEntry entry) {
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
        return null;
    }

    private String extractImageUrlFromHtml(String html) {
        if (html == null || html.isBlank()) {
            return null;
        }
        try {
            Document document = Jsoup.parse(html);
            Element img = document.selectFirst("img[src], img[data-src]");
            if (img != null) {
                String src = img.hasAttr("src") ? img.attr("src") : img.attr("data-src");
                if (src != null && !src.isBlank()) {
                    return src.trim();
                }
            }
        } catch (Exception e) {
            log.debug("Error parsing HTML image URL: {}", e.getMessage());
        }
        return null;
    }

    String normalizeImageUrl(String imageUrl, String entryLink) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return null;
        }

        String normalized = imageUrl.trim()
                .replaceAll("\\s+", "")
                .replace("&amp;", "&");
        if (normalized.startsWith("//")) {
            normalized = "https:" + normalized;
        } else if (!normalized.startsWith("http://") && !normalized.startsWith("https://") && entryLink != null) {
            try {
                normalized = URI.create(entryLink).resolve(normalized).toString();
            } catch (Exception e) {
                log.debug("Could not resolve relative image URL {}: {}", normalized, e.getMessage());
                return null;
            }
        }

        normalized = normalized.replace("/ace/standard/240/", "/ace/standard/976/");
        if (!normalized.contains("i.guim.co.uk") && !normalized.contains("&s=")) {
            normalized = normalized.replace("width=140", "width=800");
        }

        if (normalized.isBlank() || isFeedLogo(normalized)) {
            return null;
        }

        return normalized;
    }

    private String normalizeLink(String link) {
        if (link == null) {
            return null;
        }
        return link.trim()
                .replace("&amp;", "&")
                .replaceAll("\\s+", "");
    }

    public static boolean isFeedLogo(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return false;
        }
        String lower = imageUrl.toLowerCase();
        return lower.contains("bbc_news_120x60")
                || lower.contains("guardian-logo-rss")
                || lower.contains("nyt_logo_rss");
    }
}
