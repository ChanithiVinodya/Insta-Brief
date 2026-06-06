package com.instabrief.nlp;

import com.fasterxml.jackson.databind.JsonNode;
import com.instabrief.config.InstaBriefProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Component
public class HuggingFaceNlpClient implements NlpClient {

    private static final Logger log = LoggerFactory.getLogger(HuggingFaceNlpClient.class);
    private static final Pattern WORD = Pattern.compile("[a-zA-Z]{4,}");

    private final RestClient restClient;
    private final InstaBriefProperties properties;

    public HuggingFaceNlpClient(RestClient restClient, InstaBriefProperties properties) {
        this.restClient = restClient;
        this.properties = properties;
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
                            "do_sample", false
                    )
            );

            JsonNode response = restClient.post()
                    .uri(properties.getHfApiUrl() + "/" + properties.getHfSummaryModel())
                    .header("Authorization", "Bearer " + properties.getHfApiToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
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
        // Keyword extraction via frequency analysis (HF NER models vary; keep predictable)
        Map<String, Long> freq = new HashMap<>();
        var matcher = WORD.matcher(content.toLowerCase());
        Set<String> stop = Set.of("that", "this", "with", "from", "have", "been", "will", "their", "about", "which", "when", "there", "would", "could", "should", "after", "before", "other", "into", "over", "under", "between", "through", "during", "without", "within", "against", "among", "while", "where", "these", "those", "because", "since", "until", "although", "however", "article", "news", "said", "says");

        while (matcher.find()) {
            String word = matcher.group();
            if (!stop.contains(word)) {
                freq.merge(word, 1L, Long::sum);
            }
        }

        return freq.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(maxKeywords)
                .map(e -> e.getKey())
                .collect(Collectors.toList());
    }

    private String fallbackSummary(String text) {
        String[] sentences = text.split("(?<=[.!?])\\s+");
        StringBuilder sb = new StringBuilder();
        int count = 0;
        for (String s : sentences) {
            if (s.isBlank()) continue;
            sb.append(s.trim()).append(" ");
            if (++count >= 3) break;
        }
        String result = sb.toString().trim();
        return result.isEmpty() ? text.substring(0, Math.min(200, text.length())) : result;
    }
}
