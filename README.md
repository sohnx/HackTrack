# 🚀 HackTrack

HackTrack is a full-stack platform for discovering, tracking, and managing hackathons with Telegram notifications and deadline reminders.

## ✨ Features

* 🔐 JWT Authentication (Register/Login)
* 📋 Personal dashboard for tracked hackathons
* 🔎 Automatic hackathon discovery from multiple sources
* 🤖 Telegram bot integration
* 🔔 Deadline reminders and notifications
* 👥 Team management
* 🏷️ Tags and categorization
* 📚 Resources and milestones
* ⚡ FastAPI backend
* 🎨 Next.js frontend
* 🐘 PostgreSQL database
* 🔄 Alembic migrations

---

# 🏗️ Tech Stack

### Backend

* FastAPI
* SQLAlchemy
* PostgreSQL
* Alembic
* Python Telegram Bot
* JWT Authentication
* Pydantic

### Frontend

* Next.js 15
* TypeScript
* React Query
* Axios
* Zustand
* Tailwind CSS

---

# 📁 Project Structure

```text
hacktrack/
│
├── backend/
│   ├── alembic/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── scrapers/
│   │   │   └── telegram/
│   │   └── main.py
│   └── tests/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── store/
│   ├── lib/
│   └── types/
│
└── README.md
```

---

# ⚙️ Setup

## 1. Clone Repository

```bash
git clone https://github.com/<username>/hacktrack.git
cd hacktrack
```

---

# Backend Setup

## Create Virtual Environment

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/hacktrack

SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

TELEGRAM_BOT_TOKEN=your_bot_token
```

---

## Database Migration

```bash
alembic upgrade head
```

---

## Run Backend

```bash
uvicorn app.main:app --reload
```

Backend:

```
http://localhost:8000
```

Swagger Docs:

```
http://localhost:8000/docs
```

---

# Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

Frontend:

```
http://localhost:3000
```

---

# Telegram Bot Setup

Create a bot using BotFather:

```
https://t.me/BotFather
```

Add the bot token to `.env`:

```env
TELEGRAM_BOT_TOKEN=xxxxxxxxxxxxxxxx
```

Start backend:

```bash
uvicorn app.main:app --reload
```

Generate Telegram link:

```
POST /api/telegram/link
```

Open the generated URL:

```
https://t.me/<bot_username>?start=<token>
```

Press **Start** to link your Telegram account.

---

# Available Scrapers

* Unstop
* Hack2Skill
* Devfolio
* MLH
* HackerEarth
* ETHGlobal
* Kaggle
* Reskilll

---

# API Endpoints

### Authentication

* POST `/api/auth/register`
* POST `/api/auth/login`
* GET `/api/auth/me`

### Hackathons

* GET `/api/hackathons`
* POST `/api/sync/run`

### Notifications

* POST `/api/notifications/test-telegram`
* POST `/api/notifications/test-deadline-reminders`

### Telegram

* POST `/api/telegram/link`

---

# Database Models

* User
* Hackathon
* DiscoveredHackathon
* Team
* TeamMember
* Tag
* Milestone
* Resource
* Notification

---

# Future Improvements

* Email notifications
* Calendar integration
* AI-based hackathon recommendations
* Bookmarking and favorites
* Team collaboration features
* Mobile app
* Docker deployment
* CI/CD pipeline

---

# Author

**Sohan Chaudhuri**

B.Tech CSE Student

---

# License

MIT License
