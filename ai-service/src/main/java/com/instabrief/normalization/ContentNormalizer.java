package com.instabrief.normalization;

import org.jsoup.Jsoup;
import org.springframework.stereotype.Component;

@Component
public class ContentNormalizer {

    private static final int MAX_CONTENT_LENGTH = 15000;

    public String normalizeHtml(String raw) {
        if (raw == null || raw.isBlank()) {
            return "";
        }
        String text = Jsoup.parse(raw).text();
        return truncate(text);
    }

    public String normalizePlain(String raw) {
        if (raw == null) {
            return "";
        }
        return truncate(raw.trim().replaceAll("\\s+", " "));
    }

    private String truncate(String text) {
        if (text.length() <= MAX_CONTENT_LENGTH) {
            return text;
        }
        return text.substring(0, MAX_CONTENT_LENGTH);
    }
}
