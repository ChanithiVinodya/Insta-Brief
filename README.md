<div align="center">

# 📰 InstaBrief

**AI-powered news aggregation and personalized summarization platform**

*Stop scrolling. Start knowing.*

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.java.com/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## 🧠 What is InstaBrief?

InstaBrief is a full-stack, production-grade web application that aggregates news from across the internet and uses AI to deliver what actually matters — summarized, personalized, and ranked for each user.

The platform:
- **Ingests** articles from NewsAPI, RSS feeds, and configurable sources in real time
- **Summarizes** each article into 2–5 clean sentences using NLP (Hugging Face / OpenAI)
- **Extracts** keywords and computes trending topics from engagement and recency signals
- **Personalizes** each user's feed using a weighted ranking algorithm based on interests, behavior, and trends
- **Scales** via a microservices architecture — a dedicated AI service handles all NLP; an API gateway handles all user-facing logic

> Built as a portfolio-grade engineering project demonstrating real-world system design, AI integration, and full-stack development across two languages and three infrastructure layers.

---

## ✨ Core Features

| Feature | Description |
|---|---|
| 🔐 JWT Auth | Secure register/login with bcrypt password hashing and protected routes |
| 📡 Multi-source Aggregation | Fetches and deduplicates articles from NewsAPI, RSS feeds, and more |
| 🤖 AI Summarization | 2–5 sentence summaries generated via Hugging Face or OpenAI APIs |
| 🏷️ Keyword Extraction | NLP-powered extraction of key topics per article |
| 🎯 Personalized Feed | Weighted scoring: user interests × keyword relevance × recency × trending score |
| 🔥 Trending Topics | Computed from keyword frequency, article recency, and user engagement |
| 📱 Responsive UI | Clean, modern interface with smooth loading states and error handling |

---

## 🏗️ System Architecture

InstaBrief uses a **microservices-inspired architecture** with strict service separation. Two independent backend services communicate only through a shared PostgreSQL database — keeping concerns cleanly decoupled and each service independently deployable.

```
┌──────────────────────────────────────────────────────────────────┐
│                        React Frontend (Vite)                     │
│              Feed · Article View · Trending · Auth               │
└───────────────────────────┬──────────────────────────────────────┘
                            │  REST / JSON
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│               API Gateway  ·  Node.js + Express.js               │
│                                                                  │
│   JWT Auth  ·  User Management  ·  Feed API  ·  Interactions     │
│                                                                  │
│      ⛔ No NLP   ⛔ No article fetching   ⛔ No summarization     │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                   ┌────────▼────────┐
                   │   PostgreSQL    │
                   │  Shared schema  │
                   │  SQL-managed    │
                   └────────▲────────┘
                            │
┌──────────────────────────────────────────────────────────────────┐
│              AI Service  ·  Java + Spring Boot                   │
│                                                                  │
│   Article Ingestion  ·  NLP  ·  Summarization  ·  Trending       │
│                                                                  │
│      ⛔ No user auth   ⛔ No frontend APIs   ⛔ No user data      │
└──────────────────────────────────────────────────────────────────┘
```

**Why this matters:** The API Gateway and AI Service can be scaled, updated, and redeployed independently. NLP workloads never block user-facing requests. This mirrors how production news platforms are built at scale.

---

## 🛠️ Tech Stack

### Frontend
| | Technology | Purpose |
|---|---|---|
| ⚛️ | React.js (Vite) | UI framework with fast HMR dev experience |
| 🎨 | Tailwind CSS | Utility-first responsive styling |
| 🔗 | Axios | HTTP client for REST API calls |

### API Gateway
| | Technology | Purpose |
|---|---|---|
| 🟢 | Node.js + Express.js | REST API server, routing, middleware |
| 🔑 | JWT + bcrypt | Stateless auth and password security |
| 🗃️ | Sequelize ORM | PostgreSQL interaction (no sync — SQL-only schema) |

### AI Service
| | Technology | Purpose |
|---|---|---|
| ☕ | Java + Spring Boot | High-throughput article processing pipeline |
| 🤗 | Hugging Face / OpenAI | NLP summarization and keyword extraction |
| 🗃️ | JPA / Hibernate | Database access (ddl-auto disabled — SQL-only) |

### Infrastructure
| | Technology | Purpose |
|---|---|---|
| 🐘 | PostgreSQL | Shared relational DB with UUID PKs and FK constraints |
| 🐳 | Docker + Compose | Containerized multi-service local and cloud deployment |

---

## 🗄️ Database Design

The schema is defined **exclusively through SQL initialization scripts** — no ORM auto-generation, no `Sequelize sync`, no Hibernate `ddl-auto`. This enforces deliberate, stable schema design with full control over indexes, constraints, and foreign key relationships.

```
users ──────────────── user_interests
  │                         │
  │                    (topic tags)
  │
  ├──── user_interactions ──────── articles ─── article_keywords
  │         (reads, likes,
  │          shares)
  │
  └─────────────────────── trending_topics
```

Every table uses **UUID primary keys**. Indexed searchable fields and all relationships are defined explicitly in `db/init.sql`.

---

## 🚀 Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) and Docker Compose
- [NewsAPI key](https://newsapi.org/)
- Hugging Face or OpenAI API key

### 1. Clone

```bash
git clone https://github.com/your-username/instabrief.git
cd instabrief
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
# Database
POSTGRES_DB=instabrief
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# API Gateway
JWT_SECRET=your_jwt_secret
DB_HOST=postgres
DB_PORT=5432

# AI Service
NEWS_API_KEY=your_newsapi_key
OPENAI_API_KEY=your_openai_key
HUGGINGFACE_API_KEY=your_hf_key

# Frontend
VITE_API_BASE_URL=http://localhost:3000
```

> ⚠️ Both services will **fail loudly** on startup if any required environment variable is missing, the database connection fails, or an external API is unreachable. No silent failures.

### 3. Start all services

```bash
docker-compose up --build
```

Spins up four services on a shared Docker network:
- `postgres` — PostgreSQL with persistent volume, initialized from `db/init.sql`
- `api-gateway` — Node.js on port `3000`
- `ai-service` — Spring Boot on port `8080`
- `frontend` — React on port `5173`

### 4. Visit the app

```
http://localhost:5173
```

---

## 📄 REST API

The API Gateway exposes a clean REST interface with pagination, structured JSON responses, and consistent HTTP status codes.

```
POST   /auth/register          Register a new user
POST   /auth/login             Authenticate and receive JWT

GET    /feed                   Personalized article feed        [auth]
GET    /feed?page=2&limit=20   Paginated feed

GET    /articles/:id           Single article with summary      [auth]
POST   /interactions           Log a read, like, or share       [auth]

GET    /trending               Trending topics                  [auth]
PUT    /users/interests        Update interest profile          [auth]
```

---

## 📁 Project Structure

```
instabrief/
├── frontend/
│   └── src/
│       ├── components/        Reusable UI components
│       ├── pages/             Login · Register · Onboarding · Feed · Article · Trending
│       └── services/          Axios API clients
│
├── api-gateway/
│   └── src/
│       ├── routes/            Auth · feed · interaction endpoints
│       ├── middleware/         JWT verification · error handling
│       └── models/            Sequelize model definitions
│
├── ai-service/
│   └── src/main/java/
│       ├── ingestion/         NewsAPI + RSS fetchers
│       ├── nlp/               Summarization · keyword extraction
│       └── trending/          Trending score computation
│
├── db/
│   └── init.sql               Full schema — single source of truth
│
└── docker-compose.yml
```

---

## 🎯 Engineering Highlights

This project was designed to reflect real-world backend engineering practices:

- **Strict service boundaries** — NLP workloads fully decoupled from user-facing APIs, enforced at the architectural level
- **Schema-first database design** — explicit SQL migrations with FK constraints and indexes; no ORM magic
- **Personalization engine** — multi-factor weighted ranking algorithm, not a simple chronological feed
- **Fail-loud principle** — services crash immediately on misconfiguration; never silently degrade
- **Containerized from the start** — full Docker Compose stack, fully environment-driven configuration
- **Modular, maintainable code** — no god files, no tight coupling, no magic values throughout

---

## 📜 License

MIT — see [LICENSE](LICENSE) for details.
