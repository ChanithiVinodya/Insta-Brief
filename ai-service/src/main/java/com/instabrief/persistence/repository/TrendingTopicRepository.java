package com.instabrief.persistence.repository;

import com.instabrief.persistence.entity.TrendingTopicEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

public interface TrendingTopicRepository extends JpaRepository<TrendingTopicEntity, UUID> {

    @Modifying
    @Transactional
    @Query("DELETE FROM TrendingTopicEntity t WHERE t.windowEnd < :cutoff")
    void deleteOlderThan(Instant cutoff);

    @Modifying
    @Transactional
    @Query("DELETE FROM TrendingTopicEntity")
    void deleteAllTopics();
}
