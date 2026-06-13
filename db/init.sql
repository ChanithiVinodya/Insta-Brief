-- InstaBrief PostgreSQL schema (single source of truth)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

-- User interests (onboarding)
CREATE TABLE user_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    interest VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, interest)
);

CREATE INDEX idx_user_interests_user_id ON user_interests (user_id);
CREATE INDEX idx_user_interests_interest ON user_interests (interest);

-- Articles (ingested and processed by AI service)
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(255),
    source VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    url TEXT NOT NULL UNIQUE,
    content TEXT,
    summary TEXT,
    author VARCHAR(255),
    image_url TEXT,
    published_at TIMESTAMPTZ,
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    trending_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_articles_source_external ON articles (source, external_id)
    WHERE external_id IS NOT NULL;
CREATE INDEX idx_articles_published_at ON articles (published_at DESC);
CREATE INDEX idx_articles_trending_score ON articles (trending_score DESC);
CREATE INDEX idx_articles_ingested_at ON articles (ingested_at DESC);

-- Article keywords (NLP extraction)
CREATE TABLE article_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles (id) ON DELETE CASCADE,
    keyword VARCHAR(100) NOT NULL,
    weight DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (article_id, keyword)
);

CREATE INDEX idx_article_keywords_article_id ON article_keywords (article_id);
CREATE INDEX idx_article_keywords_keyword ON article_keywords (keyword);

-- User interactions (engagement signals)
CREATE TABLE user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles (id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('view', 'bookmark', 'like')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_interactions_user_id ON user_interactions (user_id);
CREATE INDEX idx_user_interactions_article_id ON user_interactions (article_id);
CREATE INDEX idx_user_interactions_created_at ON user_interactions (created_at DESC);

-- Trending topics (computed by AI service)
CREATE TABLE trending_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic VARCHAR(200) NOT NULL,
    score DOUBLE PRECISION NOT NULL DEFAULT 0,
    article_count INTEGER NOT NULL DEFAULT 0,
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    summary TEXT,
    image_url VARCHAR(1000),
    category VARCHAR(50)
);

CREATE INDEX idx_trending_topics_score ON trending_topics (score DESC, window_end DESC);
CREATE INDEX idx_trending_topics_topic ON trending_topics (topic);
