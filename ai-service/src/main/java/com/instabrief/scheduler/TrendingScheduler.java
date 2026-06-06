package com.instabrief.scheduler;

import com.instabrief.service.TrendingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class TrendingScheduler {

    private static final Logger log = LoggerFactory.getLogger(TrendingScheduler.class);

    private final TrendingService trendingService;

    public TrendingScheduler(TrendingService trendingService) {
        this.trendingService = trendingService;
    }

    @Scheduled(fixedDelayString = "${instabrief.trending-fixed-delay-ms:900000}", initialDelay = 60000)
    public void runTrendingJob() {
        log.info("Starting scheduled trending recompute");
        trendingService.recomputeTrending();
    }
}
