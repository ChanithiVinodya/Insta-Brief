# InstaBrief 📰✨

InstaBrief is a full-stack web application that aggregates news articles from multiple sources, generates AI-powered summaries, and delivers a personalized feed based on user interests and trending topics.

The project focuses on combining API integration, NLP, and personalization logic using a scalable backend architecture.

> ⚠️ Status: Work in progress – core features are implemented, with ongoing improvements to feed ranking and UI.

---

## 🚀 Features

- 🔎 Aggregate articles from multiple external news APIs
- 🧠 AI-powered article summarization using NLP models
- 🏷️ Keyword extraction for topic tagging
- 🎯 Personalized news feed based on user interests
- 📈 Trending topic detection
- 🔐 JWT-based authentication
- ⚡ Microservices-inspired backend architecture

---

## 🛠️ Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- Axios

### Backend
- **API Gateway**
  - Node.js
  - Express.js
  - JWT Authentication
- **AI Service**
  - Java
  - Spring Boot
  - NLP / AI Inference (OpenAI / Hugging Face)

### Database
- PostgreSQL (shared database)

### Infrastructure
- Docker (PostgreSQL container)
- Environment-based configuration using `.env`

---

## 🧱 Architecture Overview

- **Frontend** handles UI and user interaction
- **Node.js API Gateway** manages authentication, users, and feed delivery
- **Spring Boot AI Service** handles article fetching, summarization, and keyword extraction
- **PostgreSQL** stores users, articles, summaries, and interactions

This separation allows compute-heavy AI tasks to be isolated from user-facing APIs.

---

## ⚙️ Current Challenges & Improvements

- Feed ranking optimization (balancing relevance, recency, and trending topics)
- Sorting and weighting logic refinement
- UI/UX improvements for readability and engagement
- Better content diversity in personalized feeds

These are active areas of development.

---

## 🧪 Setup Overview (High-Level)

1. Start PostgreSQL (Docker or local)
2. Configure environment variables for API keys
3. Run AI Service (Spring Boot)
4. Run API Gateway (Node.js)
5. Start Frontend (React)

> Detailed setup instructions will be added as the project stabilizes.

---

## 📌 Future Enhancements

- Engagement-based ranking (clicks, reads)
- Caching summarized articles
- User-controlled feed preferences
- Advanced recommendation logic
- Improved UI animations and accessibility

---
<img width="1806" height="824" alt="image" src="https://github.com/user-attachments/assets/3f1750fc-6d00-4433-9635-8b01e558fae4" />

## 👩‍💻 Author

Built by **Chanithi Vinodya**  
Software Engineering Undergraduate  
