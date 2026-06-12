package com.instabrief.config;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "instabrief")
public class InstaBriefProperties {

    private String newsApiKey;
    private String newsApiUrl;
    private String newsApiCountry;
    private int newsApiPageSize;
    private String rssFeedUrls;
    private String hfApiToken;
    private String hfSummaryModel;
    private String hfApiUrl;
    private boolean ingestionEnabled = true;
    private long ingestionFixedDelayMs = 1_800_000;
    private long trendingFixedDelayMs = 900_000;
    private int maxKeywords = 8;
    private int summaryMaxLength = 1024;
    private String nlpServiceUrl = "http://nlp-service:3005";

    @PostConstruct
    public void validate() {
        boolean hasRss = rssFeedUrls != null && !rssFeedUrls.isBlank();
        boolean hasNewsApi = newsApiKey != null && !newsApiKey.isBlank()
                && !newsApiKey.startsWith("your_");
        if (!hasRss && !hasNewsApi) {
            throw new IllegalStateException(
                    "Configure at least one source: NEWS_API_KEY or RSS_FEED_URLS");
        }
        if (hfApiToken == null || hfApiToken.isBlank() || hfApiToken.startsWith("your_")) {
            throw new IllegalStateException("HF_API_TOKEN is required");
        }
    }

    public String getNewsApiKey() {
        return newsApiKey;
    }

    public void setNewsApiKey(String newsApiKey) {
        this.newsApiKey = newsApiKey;
    }

    public String getNewsApiUrl() {
        return newsApiUrl;
    }

    public void setNewsApiUrl(String newsApiUrl) {
        this.newsApiUrl = newsApiUrl;
    }

    public String getNewsApiCountry() {
        return newsApiCountry;
    }

    public void setNewsApiCountry(String newsApiCountry) {
        this.newsApiCountry = newsApiCountry;
    }

    public int getNewsApiPageSize() {
        return newsApiPageSize;
    }

    public void setNewsApiPageSize(int newsApiPageSize) {
        this.newsApiPageSize = newsApiPageSize;
    }

    public String getRssFeedUrls() {
        return rssFeedUrls;
    }

    public void setRssFeedUrls(String rssFeedUrls) {
        this.rssFeedUrls = rssFeedUrls;
    }

    public String getHfApiToken() {
        return hfApiToken;
    }

    public void setHfApiToken(String hfApiToken) {
        this.hfApiToken = hfApiToken;
    }

    public String getHfSummaryModel() {
        return hfSummaryModel;
    }

    public void setHfSummaryModel(String hfSummaryModel) {
        this.hfSummaryModel = hfSummaryModel;
    }

    public String getHfApiUrl() {
        return hfApiUrl;
    }

    public void setHfApiUrl(String hfApiUrl) {
        this.hfApiUrl = hfApiUrl;
    }

    public boolean isIngestionEnabled() {
        return ingestionEnabled;
    }

    public void setIngestionEnabled(boolean ingestionEnabled) {
        this.ingestionEnabled = ingestionEnabled;
    }

    public long getIngestionFixedDelayMs() {
        return ingestionFixedDelayMs;
    }

    public void setIngestionFixedDelayMs(long ingestionFixedDelayMs) {
        this.ingestionFixedDelayMs = ingestionFixedDelayMs;
    }

    public long getTrendingFixedDelayMs() {
        return trendingFixedDelayMs;
    }

    public void setTrendingFixedDelayMs(long trendingFixedDelayMs) {
        this.trendingFixedDelayMs = trendingFixedDelayMs;
    }

    public int getMaxKeywords() {
        return maxKeywords;
    }

    public void setMaxKeywords(int maxKeywords) {
        this.maxKeywords = maxKeywords;
    }

    public int getSummaryMaxLength() {
        return summaryMaxLength;
    }

    public void setSummaryMaxLength(int summaryMaxLength) {
        this.summaryMaxLength = summaryMaxLength;
    }

    public String getNlpServiceUrl() {
        return nlpServiceUrl;
    }

    public void setNlpServiceUrl(String nlpServiceUrl) {
        this.nlpServiceUrl = nlpServiceUrl;
    }
}
