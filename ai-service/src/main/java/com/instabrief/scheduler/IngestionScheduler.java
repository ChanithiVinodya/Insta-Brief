package com.instabrief.scheduler;

import com.instabrief.config.InstaBriefProperties;
import com.instabrief.service.ArticleIngestionService;
import com.instabrief.service.ArticleProcessingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class IngestionScheduler {

    private static final Logger log = LoggerFactory.getLogger(IngestionScheduler.class);

    private final InstaBriefProperties properties;
    private final ArticleIngestionService ingestionService;
    private final ArticleProcessingService processingService;

    public IngestionScheduler(InstaBriefProperties properties,
                              ArticleIngestionService ingestionService,
                              ArticleProcessingService processingService) {
        this.properties = properties;
        this.ingestionService = ingestionService;
        this.processingService = processingService;
    }

    @Scheduled(fixedDelayString = "${instabrief.ingestion-fixed-delay-ms:1800000}", initialDelay = 15000)
    public void runIngestionPipeline() {
        if (!properties.isIngestionEnabled()) {
            return;
        }
        log.info("Starting scheduled ingestion pipeline");
        ingestionService.ingestAll();
        processingService.processUnprocessed();
    }
}
