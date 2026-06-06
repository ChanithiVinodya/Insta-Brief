# InstaBrief

AI-powered news aggregation and personalized summarization platform with a microservices-inspired architecture.

---

## Table of contents

1. [What you are running](#what-you-are-running)
2. [Prerequisites](#prerequisites)
3. [Get API keys](#get-api-keys)
4. [Option A — Docker (recommended)](#option-a--docker-recommended)
5. [Option B — Local development](#option-b--local-development)
6. [Using the application](#using-the-application)
7. [Verify everything works](#verify-everything-works)
8. [Environment variables reference](#environment-variables-reference)
9. [Troubleshooting](#troubleshooting)
10. [Stopping and resetting](#stopping-and-resetting)

---

## What you are running

| Service | Port | URL / endpoint | Role |
|---------|------|----------------|------|
| **frontend** | 5174 | http://localhost:5174 | React UI (login, feed, trending, dark/light mode) |
| **api-gateway** | 3000 | http://localhost:3000 | Auth, personalized feed, reads DB only |
| **ai-service** | 8081 | http://localhost:8081/actuator/health | Fetches news, NLP summaries, writes to DB |
| **postgres** | 5432 | `localhost:5432` | Shared database; schema from `db/init.sql` |

**Data flow:** NewsAPI + RSS → **ai-service** → PostgreSQL ← **api-gateway** ← **frontend**

The frontend never talks to the AI service directly. After signup, wait for the AI service to ingest articles (first batch ~30 seconds after startup, then every 30 minutes by default).

---

## Prerequisites

### Required (Docker path)

- **Docker Desktop** (Windows/Mac) or Docker Engine + Compose (Linux)  
  - [Install Docker](https://docs.docker.com/get-docker/)
- **Git** (optional, if cloning the repo)
- Free API keys (see below):
  - [NewsAPI](https://newsapi.org/register)
  - [Hugging Face](https://huggingface.co/join) inference token

### Required (local dev path)

Everything above, plus:

| Tool | Version | Used for |
|------|---------|----------|
| **Node.js** | 18+ | api-gateway, frontend |
| **npm** | comes with Node | install JS dependencies |
| **Java JDK** | 17+ | ai-service |
| **Maven** | 3.9+ | build/run ai-service |
| **PostgreSQL client** | optional | run `init.sql` manually |

Check installs:

```powershell
docker --version
docker compose version
node --version
java -version
mvn -version
```

---

## Get API keys

### 1. NewsAPI

1. Go to https://newsapi.org/register and create an account.
2. Copy your **API Key** from the dashboard.
3. Free tier limits apply (e.g. developer plan: headlines only, rate limits). Use `NEWS_API_COUNTRY=us` as in the example.

### 2. Hugging Face

1. Go to https://huggingface.co/settings/tokens
2. Create a token with **Read** access (for Inference API).
3. Copy the token into `HF_API_TOKEN`.
4. Default summarization model: `facebook/bart-large-cnn`. First request may be slow while the model loads on HF servers.

### 3. JWT secret (API gateway)

Generate a long random string (do not commit it). Example in PowerShell:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## Option A — Docker (recommended)

Best for a full stack with one command. All services share the Docker network; Postgres data persists in a volume.

### Step 1 — Open the project folder

```powershell
cd C:\Users\Chani\Desktop\Instabrief
```

(Use your actual path if different.)

### Step 2 — Create environment files

**PowerShell:**

```powershell
Copy-Item ai-service\.env.example ai-service\.env
Copy-Item api-gateway\.env.example api-gateway\.env
Copy-Item frontend\.env.example frontend\.env
```

**macOS / Linux:**

```bash
cp ai-service/.env.example ai-service/.env
cp api-gateway/.env.example api-gateway/.env
cp frontend/.env.example frontend/.env
```

### Step 3 — Edit `ai-service\.env`

Open `ai-service/.env` and set:

```env
NEWS_API_KEY=paste_your_newsapi_key_here
HF_API_TOKEN=paste_your_huggingface_token_here
```

Leave database settings as-is for Docker (compose overrides the JDBC URL to use hostname `postgres`).

Optional: add more RSS feeds (comma-separated, no spaces):

```env
RSS_FEED_URLS=https://feeds.bbci.co.uk/news/rss.xml,https://www.theguardian.com/world/rss
```

### Step 4 — Edit `api-gateway\.env`

Set a strong secret:

```env
JWT_SECRET=your_long_random_secret_here
```

`DATABASE_URL` in the file can stay as-is; Docker Compose also injects the correct URL for the container network.

### Step 5 — Edit `frontend\.env` (usually no change)

For Docker, this is only used if you rebuild the frontend image:

```env
VITE_API_BASE_URL=http://localhost:3000
```

The browser calls the API on your machine at port 3000, not inside Docker.

### Step 6 — Build and start

```powershell
docker compose up --build
```

First run downloads images and builds three apps (Java Maven build for ai-service takes several minutes).

Run in background:

```powershell
docker compose up --build -d
```

View logs:

```powershell
docker compose logs -f
docker compose logs -f ai-service
```

### Step 7 — Open the app

| What | URL |
|------|-----|
| **Web app** | http://localhost:5174 |
| API health | http://localhost:3000/health |
| AI service health | http://localhost:8081/actuator/health |

### Step 8 — First-time usage

1. Click **Create account** / register with email, password, display name.
2. Select **at least 3 interests** on onboarding → **Continue to feed**.
3. Wait **30–90 seconds** for the AI service to ingest and summarize articles.
4. Refresh the feed if it is empty at first.
5. Use the **sun/moon button** in the header to toggle dark/light mode.

---

## Option B — Local development

Run each service in a separate terminal for faster frontend/API iteration. Postgres can still run in Docker.

### Step 1 — Start PostgreSQL only

```powershell
cd C:\Users\Chani\Desktop\Instabrief
docker compose up postgres -d
```

Schema runs automatically from `db/init.sql` on **first** volume creation.

If Postgres was already initialized without schema, reset the volume (see [Stopping and resetting](#stopping-and-resetting)) or apply SQL manually:

```powershell
docker exec -i instabrief-postgres psql -U instabrief -d instabrief < db\init.sql
```

### Step 2 — API Gateway (terminal 1)

```powershell
cd api-gateway
npm install
Copy-Item .env.example .env
```

Edit `api-gateway/.env` for **localhost**:

```env
PORT=3000
DATABASE_URL=postgresql://instabrief:instabrief_secret@localhost:5432/instabrief
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5174
```

Start:

```powershell
npm run dev
```

Expect: `API Gateway listening on port 3000`

### Step 3 — AI Service (terminal 2)

```powershell
cd ai-service
Copy-Item .env.example .env
```

Edit `ai-service/.env` for **localhost**:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/instabrief
SPRING_DATASOURCE_USERNAME=instabrief
SPRING_DATASOURCE_PASSWORD=instabrief_secret
SERVER_PORT=8081
NEWS_API_KEY=your_newsapi_key
HF_API_TOKEN=your_huggingface_token
RSS_FEED_URLS=https://feeds.bbci.co.uk/news/rss.xml
INGESTION_ENABLED=true
INGESTION_FIXED_DELAY_MS=1800000
```

Start:

```powershell
mvn spring-boot:run
```

Expect: Spring Boot started on port **8081**. Ingestion runs ~30s after startup.

### Step 4 — Frontend (terminal 3)

```powershell
cd frontend
npm install
Copy-Item .env.example .env
```

Ensure `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Start:

```powershell
npm run dev
```

Open http://localhost:5174 (Vite dev server).

---

## Using the application

### Pages

| Route | Description |
|-------|-------------|
| `/register` | Create account |
| `/login` | Sign in |
| `/onboarding` | Pick interests (required before feed) |
| `/` | Personalized feed (ranked by interests, keywords, recency, trending) |
| `/articles/:id` | Full article + AI summary |
| `/trending` | Trending topics from AI service |

### Typical workflow

1. Register → onboarding (3+ interests) → feed.
2. Click an article card → view summary → **Read original source** opens publisher URL.
3. Views are recorded automatically for personalization/trending.
4. Trending page updates after the AI service’s trending job (default every 15 minutes).

### Feed empty?

- AI service must be running and healthy.
- `NEWS_API_KEY` must be valid.
- Wait for first scheduled ingestion (~30s after ai-service start).
- Check logs: `docker compose logs ai-service` or the Maven terminal.

---

## Verify everything works

### Health checks

```powershell
# API Gateway
curl http://localhost:3000/health

# AI Service
curl http://localhost:8081/actuator/health
```

Expected gateway response:

```json
{"status":"ok","db":"connected"}
```

### Register via API (optional)

```powershell
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"password123","displayName":"Test User"}'
```

### Docker service status

```powershell
docker compose ps
```

All services should show `healthy` or `running` after a few minutes.

---

## Environment variables reference

### `ai-service/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `SPRING_DATASOURCE_URL` | Yes | JDBC URL (`postgres` hostname in Docker, `localhost` locally) |
| `SPRING_DATASOURCE_USERNAME` | Yes | DB user (`instabrief`) |
| `SPRING_DATASOURCE_PASSWORD` | Yes | DB password |
| `NEWS_API_KEY` | Yes | NewsAPI key |
| `HF_API_TOKEN` | Yes | Hugging Face token |
| `RSS_FEED_URLS` | No | Comma-separated RSS URLs |
| `HF_SUMMARY_MODEL` | No | Default `facebook/bart-large-cnn` |
| `INGESTION_FIXED_DELAY_MS` | No | Default `1800000` (30 min) |
| `TRENDING_FIXED_DELAY_MS` | No | Default `900000` (15 min) |
| `INGESTION_ENABLED` | No | `true` / `false` |

### `api-gateway/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Signs auth tokens |
| `JWT_EXPIRES_IN` | No | Default `7d` |
| `PORT` | No | Default `3000` |
| `CORS_ORIGIN` | No | Frontend origin(s), comma-separated. Default `http://localhost:5174` |
| `FEED_W_*` | No | Feed ranking weights (see `.env.example`) |

### `frontend/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Gateway URL (browser-accessible) |

---

## Troubleshooting

### `env file ai-service/.env not found`

Create it from the example (Step 2 in Docker setup). Compose requires the file to exist.

### AI service exits on startup: `NEWS_API_KEY is required` / `HF_API_TOKEN is required`

Edit `ai-service/.env` with real keys, then restart:

```powershell
docker compose up ai-service --build
```

### API gateway: `FATAL: Missing required environment variable`

Ensure `api-gateway/.env` exists with `DATABASE_URL` and `JWT_SECRET`.

### `FATAL: Database connection failed`

- Postgres not ready: wait for healthy postgres, restart gateway.
- Wrong `DATABASE_URL`: use `@postgres:5432` in Docker, `@localhost:5432` locally.
- Fresh DB: ensure `init.sql` ran (reset volume if needed).

### Frontend cannot login / network error

- Gateway running on port 3000?
- `CORS_ORIGIN` must match frontend URL (`http://localhost:5174` for Docker).
- Docker frontend was built with `VITE_API_BASE_URL=http://localhost:3000` (default in compose).

### Feed always empty

1. Check ai-service logs for NewsAPI/HF errors.
2. NewsAPI free tier: some requests fail outside allowed use — check https://newsapi.org/docs/errors
3. HF model loading: first summary may timeout; check logs for retries.
4. Query DB: `docker exec -it instabrief-postgres psql -U instabrief -d instabrief -c "SELECT COUNT(*) FROM articles;"`

### Port already in use

Stop conflicting apps or change ports in `docker-compose.yml` (e.g. `"3001:3000"` for gateway).

### Maven not found (local AI service)

Install Maven or use Docker for ai-service only:

```powershell
docker compose up postgres api-gateway frontend -d
docker compose up ai-service --build
```

### Windows: `cp` command not found

Use `Copy-Item` as shown in the PowerShell examples.

---

## Stopping and resetting

### Stop all containers

```powershell
docker compose down
```

### Stop and delete database data (full reset)

```powershell
docker compose down -v
```

Then `docker compose up --build` again. Schema is reapplied from `db/init.sql` on a new volume.

### Rebuild one service after code changes

```powershell
docker compose up --build api-gateway
docker compose up --build ai-service
docker compose up --build frontend
```

---

## API endpoints (Gateway)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Service + DB health |
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | JWT | Current user |
| PUT | `/api/users/me/interests` | JWT | Set interests |
| GET | `/api/users/me/interests` | JWT | List interests |
| PATCH | `/api/users/me/onboarding` | JWT | Mark onboarding done |
| GET | `/api/feed?page&limit` | JWT | Personalized feed |
| GET | `/api/articles/:id` | JWT | Article detail |
| POST | `/api/interactions` | JWT | `view` / `bookmark` / `like` |
| GET | `/api/trending` | JWT | Trending topics |

---

## Engineering rules

- Database schema only in `db/init.sql` (no Sequelize sync, no Hibernate DDL auto-update)
- API gateway does not fetch news or run NLP
- Secrets only in `.env` files (never commit `.env`)
- Health endpoints: `/health` (gateway), `/actuator/health` (ai-service)

## License

MIT
