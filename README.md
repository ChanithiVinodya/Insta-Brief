# 📰 InstaBrief

> AI-powered news aggregation and personalized summarization platform.

🧠 What is InstaBrief?
InstaBrief is a full-stack, production-grade web application that aggregates news from across the internet and uses AI to deliver what actually matters — summarized, personalized, and ranked for each user.
The platform:

Ingests articles from NewsAPI, RSS feeds, and configurable sources in real time
Summarizes each article into 2–5 clean sentences using NLP (Hugging Face / OpenAI)
Extracts keywords and computes trending topics from engagement and recency signals
Personalizes each user's feed using a weighted ranking algorithm based on interests, behavior, and trends
Scales via a microservices architecture — a dedicated AI service handles all NLP; an API gateway handles all user-facing logic

---

## ✨ Features

- **AI Summarization** — Generates concise 2–5 sentence summaries using Hugging Face or OpenAI APIs
- **Multi-source Aggregation** — Pulls articles from NewsAPI, RSS feeds, and other configurable sources
- **Keyword Extraction** — Identifies key topics from article content automatically
- **Personalized Feed** — Ranks articles using a weighted scoring system based on user interests, keyword relevance, recency, and trending score
- **Trending Topics** — Computes trending topics from keyword frequency, article recency, and engagement data
- **JWT Authentication** — Secure login/register with bcrypt password hashing and protected routes
- **Responsive UI** — Clean, modern React frontend with proper loading and error states

---

## 🏗️ Architecture

InstaBrief uses a **microservices-inspired architecture** with two backend services sharing a PostgreSQL database.

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                    │
└─────────────────────┬───────────────────────────────────┘
                      │ REST
┌─────────────────────▼───────────────────────────────────┐
│               API Gateway (Node.js / Express)            │
│   Auth · User Management · Personalized Feed · Interactions │
└─────────────────────┬───────────────────────────────────┘
                      │
              ┌───────▼────────┐
              │   PostgreSQL   │
              └───────▲────────┘
                      │
┌─────────────────────┴───────────────────────────────────┐
│              AI Service (Java / Spring Boot)             │
│   Article Ingestion · NLP · Summarization · Trending     │
└─────────────────────────────────────────────────────────┘
```

**Separation of concerns:**
- The **API Gateway** handles auth, user data, and serving the frontend — it never performs NLP or fetches external articles.
- The **AI Service** owns all article ingestion, NLP processing, and trending analysis — it writes processed data to the shared database.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), Tailwind CSS, Axios |
| API Gateway | Node.js, Express.js, Sequelize ORM |
| AI Service | Java, Spring Boot, JPA/Hibernate |
| Database | PostgreSQL |
| NLP | Hugging Face Transformers / OpenAI API |
| Infrastructure | Docker, Docker Compose |

## 🗄️ Database Schema

The schema is managed **exclusively through SQL initialization scripts** — no Sequelize sync, no Hibernate DDL auto-generation.

Core tables:

| Table | Description |
|---|---|
| `users` | User accounts (UUID PK, bcrypt hashed passwords) |
| `user_interests` | Many-to-many user ↔ topic interests |
| `articles` | Normalized articles with summaries and metadata |
| `article_keywords` | Extracted keywords per article |
| `user_interactions` | Reads, likes, shares — used for personalization |
| `trending_topics` | Computed trending topic scores |

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- A [NewsAPI](https://newsapi.org/) key
- A Hugging Face or OpenAI API key

### 1. Clone the repository

```bash
git clone https://github.com/your-username/instabrief.git
cd instabrief
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
# PostgreSQL
POSTGRES_DB=instabrief
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# API Gateway
JWT_SECRET=your_jwt_secret
DB_HOST=postgres
DB_PORT=5432

# AI Service
NEWS_API_KEY=your_newsapi_key
OPENAI_API_KEY=your_openai_key        # or use Hugging Face
HUGGINGFACE_API_KEY=your_hf_key
DB_HOST=postgres
DB_PORT=5432

# Frontend
VITE_API_BASE_URL=http://localhost:3000
```

## 📄 API Overview

The API Gateway exposes REST endpoints to the frontend. All responses return structured JSON with appropriate HTTP status codes.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and receive JWT |
| `GET` | `/feed` | Get personalized article feed |
| `GET` | `/articles/:id` | Get a single article |
| `GET` | `/trending` | Get trending topics |
| `POST` | `/interactions` | Log a user interaction |
| `PUT` | `/users/interests` | Update user interests |

---

## 🧪 Development Notes

- **No schema auto-generation** — always edit `db/init.sql` for schema changes
- **Strict service boundaries** — the API Gateway must not call NLP; the AI Service must not serve user-facing endpoints
- **Fail loudly** — missing env vars or failed DB/API connections throw immediately, never silently
- Code follows a modular folder structure; avoid giant files and magic values
## Screenshots
<img width="1903" height="986" alt="Screenshot 2026-06-10 200341" src="https://github.com/user-attachments/assets/ece44899-4e03-44f9-afb1-a6f06737153f" />
<img width="1898" height="960" alt="Screenshot 2026-06-10 200419" src="https://github.com/user-attachments/assets/36e80df9-ef88-42e4-ac1b-dad4daeb6d1e" />
<img width="1863" height="964" alt="image" src="https://github.com/user-attachments/assets/0e33ee5f-139b-4ae9-85c6-cc3bf53d3a46" />
<img width="1814" height="968" alt="image" src="https://github.com/user-attachments/assets/c8e34519-5e9c-49b0-be4e-e6c186bc4ca9" />


---

## 📜 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
