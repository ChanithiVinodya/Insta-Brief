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
## 📸 Screenshots
<table>
<tr>
<td><img width="1907" height="982" alt="image" src="https://github.com/user-attachments/assets/a7e4e039-e028-4a2a-adbb-3a608d9b3e6b" /></td>
<td><img width="1900" height="983" alt="Screenshot 2026-06-23 003903" src="https://github.com/user-attachments/assets/3834dbf4-171e-4aee-81be-f33b502cd185" /></td>
<td><img width="1897" height="987" alt="Screenshot 2026-06-23 001938" src="https://github.com/user-attachments/assets/6eb1787c-dfc2-474a-a3a5-6e92c464a4ed" /></td>
</tr>
<tr>
<td><img width="1900" height="847" alt="Screenshot 2026-06-23 002247" src="https://github.com/user-attachments/assets/7a4b6ad2-e236-49ce-8246-7657ced2ca59" /></td>
<td><img width="1896" height="946" alt="Screenshot 2026-06-23 002307" src="https://github.com/user-attachments/assets/f23bf058-9d5e-42fd-b9d0-71fede4b8600" /></td>
<td><img width="1900" height="986" alt="Screenshot 2026-06-23 002332" src="https://github.com/user-attachments/assets/db7e9fc5-6321-4737-9f9e-b35a6b44c4e8" /></td>
</tr>
<tr>
<td><img width="1918" height="990" alt="Screenshot 2026-06-23 002345" src="https://github.com/user-attachments/assets/ca3572dd-1971-4661-951d-392ff951cc98" /></td>
<td><img width="1895" height="987" alt="Screenshot 2026-06-23 005027" src="https://github.com/user-attachments/assets/448b50ea-d109-4b3a-a655-d8764886770d" /></td>
<td><img width="1896" height="922" alt="Screenshot 2026-06-23 005040" src="https://github.com/user-attachments/assets/952bdbae-6253-41a1-b2eb-1c553cc39a91" /></td>
</tr>
</table>
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
