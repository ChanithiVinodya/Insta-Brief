package com.instabrief.nlp;

import com.fasterxml.jackson.databind.JsonNode;
import com.instabrief.config.InstaBriefProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.*;
import java.util.Objects;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Component
public class HuggingFaceNlpClient implements NlpClient {

    private static final Logger log = LoggerFactory.getLogger(HuggingFaceNlpClient.class);
    private static final Pattern WORD = Pattern.compile("[a-zA-Z]{3,}");
    private static final Pattern NON_ALPHA = Pattern.compile("[^a-z0-9\\s'-]");

    public static final Set<String> STOP_WORDS = Set.copyOf(List.of(
            "the", "is", "a", "an", "and", "or", "but", "more", "here", "this", "that", "with",
            "from", "about", "have", "has", "had", "was", "were", "will", "would", "can",
            "been", "their", "which", "when", "there", "could", "should", "after", "before",
            "other", "into", "over", "under", "between", "through", "during", "without",
            "within", "against", "among", "while", "where", "these", "those", "because",
            "since", "until", "although", "however", "article", "said", "says",
            "some", "onto", "your", "them", "ahead", "nearly", "around",
            "above", "across", "along", "behind", "below", "beneath", "beside",
            "beyond", "concerning", "considering", "despite", "down", "except", "following",
            "inside", "minus", "near", "next", "opposite", "outside", "past", "regarding",
            "round", "save", "than", "toward", "underneath", "unlike", "upon", "versus",
            "via", "always", "never", "often", "sometimes", "almost", "quite", "just",
            "very", "still", "yet", "already", "soon", "late", "later", "earlier", "much",
            "many", "few", "any", "all", "each", "every", "both", "either", "neither",
            "only", "also", "even", "instead", "then", "thereby", "therefore", "away",
            "back", "far", "long", "now", "side", "well", "wherever", "whenever",
            "another", "others", "whole", "full", "rather", "likely", "simply", "mainly",
            "mostly", "largely", "heavily", "widely", "closely", "clearly", "quickly",
            "early", "together", "further", "certain", "enough", "less",
            "least", "most", "such", "own", "same", "different", "various",
            "several", "little", "something", "anything", "everything",
            "nothing", "someone", "anyone", "everyone", "nobody", "somewhere", "anywhere",
            "everywhere", "nowhere", "somehow", "anyway", "anyhow", "meanwhile",
            "world", "global", "national", "local", "public", "private", "general", "major"));

    public static final Set<String> BLACKLIST = Set.of(
            "breaking", "update", "news", "watch", "report", "live", "today", "video",
            "press", "media", "latest", "exclusive", "summary", "read", "click", "source",
            "image", "photo", "copyright", "rights", "reserved", "newsletter", "email",
            "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
            "january", "february", "march", "april", "may", "june", "july", "august",
            "september", "october", "november", "december", "time", "year", "years", "month", "week",
            "day", "hour", "minute", "second", "moment", "period", "story");

    private final RestClient restClient;
    private final InstaBriefProperties properties;

    public HuggingFaceNlpClient(RestClient restClient, InstaBriefProperties properties) {
        this.restClient = restClient;
        this.properties = properties;
    }

    public static String normalizeKeyword(String keyword) {
        if (keyword == null) {
            return "";
        }
        return NON_ALPHA.matcher(keyword.trim().toLowerCase()).replaceAll("").trim();
    }

    public static boolean isNoiseKeyword(String keyword) {
        String normalized = normalizeKeyword(keyword);
        if (normalized.isBlank() || normalized.length() < 3) {
            return true;
        }
        if (STOP_WORDS.contains(normalized) || BLACKLIST.contains(normalized)) {
            return true;
        }
        for (String token : normalized.split("\\s+")) {
            if (token.isBlank()) {
                continue;
            }
            if (STOP_WORDS.contains(token) || BLACKLIST.contains(token)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public String summarize(String content, int maxLength) {
        if (content == null || content.isBlank()) {
            return "";
        }
        String input = content.length() > maxLength ? content.substring(0, maxLength) : content;
        try {
            Map<String, Object> body = Map.of(
                    "inputs", input,
                    "parameters", Map.of(
                            "min_length", 60,
                            "max_length", 180,
                            "do_sample", false));

            JsonNode response = restClient.post()
                    .uri(properties.getHfApiUrl() + "/" + properties.getHfSummaryModel())
                    .header("Authorization", "Bearer " + properties.getHfApiToken())
                    .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                    .body(Objects.requireNonNull(body))
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null) {
                return fallbackSummary(input);
            }
            if (response.isArray() && response.size() > 0) {
                JsonNode first = response.get(0);
                if (first.has("summary_text")) {
                    return first.get("summary_text").asText();
                }
                if (first.has("generated_text")) {
                    return first.get("generated_text").asText();
                }
            }
            if (response.has("summary_text")) {
                return response.get("summary_text").asText();
            }
            if (response.has("generated_text")) {
                return response.get("generated_text").asText();
            }
            return fallbackSummary(input);
        } catch (Exception e) {
            log.warn("HF summarization failed, using fallback: {}", e.getMessage());
            return fallbackSummary(input);
        }
    }

    @Override
    public List<String> extractKeywords(String content, int maxKeywords) {
        if (content == null || content.isBlank()) {
            return List.of();
        }

        try {
            Map<String, Object> body = Map.of(
                    "text", content,
                    "maxKeywords", maxKeywords);

            JsonNode response = restClient.post()
                    .uri(properties.getNlpServiceUrl() + "/keywords")
                    .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                    .body(Objects.requireNonNull(body))
                    .retrieve()
                    .body(JsonNode.class);

            if (response != null && response.has("keywords")) {
                List<String> keywords = new ArrayList<>();
                response.get("keywords").forEach(k -> {
                    String keyword = normalizeKeyword(k.asText());
                    if (!isNoiseKeyword(keyword)) {
                        keywords.add(keyword);
                    }
                });
                if (!keywords.isEmpty()) {
                    return keywords;
                }
            }
        } catch (Exception e) {
            log.warn("NLP Service failed, using local extraction fallback: {}", e.getMessage());
        }

        // Local extraction fallback (improved with stop words and blacklist)
        Map<String, Long> freq = new HashMap<>();
        var matcher = WORD.matcher(content);

        while (matcher.find()) {
            String originalWord = matcher.group();
            String word = normalizeKeyword(originalWord);

            if (isNoiseKeyword(word)) {
                continue;
            }

            boolean isCapitalized = Character.isUpperCase(originalWord.charAt(0));
            long weight = isCapitalized ? 5 : 1;

            if (!isCapitalized) {
                if (word.endsWith("ing") || word.endsWith("edly") || word.endsWith("able") || word.endsWith("ious")) {
                    weight = 0;
                }
            }

            if (weight > 0) {
                freq.merge(word, weight, (a, b) -> a + b);
            }
        }

        return freq.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(maxKeywords)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private String fallbackSummary(String text) {
        String[] sentences = text.split("(?<=[.!?])\\s+");
        StringBuilder sb = new StringBuilder();
        int count = 0;
        for (String s : sentences) {
            if (s.isBlank())
                continue;
            sb.append(s.trim()).append(" ");
            if (++count >= 3)
                break;
        }
        String result = sb.toString().trim();
        return result.isEmpty() ? text.substring(0, Math.min(200, text.length())) : result;
    }
}
