# Vijay Agro Trade

Vijay Agro Trade is a full-stack smart agriculture platform built with FastAPI and React. It helps farmers manage crop fields, check weather, review predictions and alerts, inspect analytics, and chat with an agriculture-focused assistant.

## Features

- JWT authentication for register, login, and current-user access
- Crop field management with crop type, location, soil condition, irrigation, acreage, and notes
- Current weather and forecast data
- Rules-based crop prediction and advisory generation
- Automated alerts for common farm risks
- Dashboard analytics for field and prediction insights
- Full-screen agriculture chatbot with image analysis support
- Demo seed data for quick local testing

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Python, FastAPI, SQLAlchemy |
| Frontend | React, Vite, React Router |
| Styling | CSS, Tailwind tooling |
| Auth | JWT, passlib/bcrypt |
| Database | SQLite |
| Weather | OpenWeatherMap |
| AI Chat | Groq API |
| Charts | Recharts |

## Project Structure

```text
agrotrade/
|-- backend/
|   |-- api/routes/      # auth, weather, fields, predictions, alerts, analytics, chatbot
|   |-- core/            # config, database, auth, logging
|   |-- models/          # SQLAlchemy models
|   |-- services/        # weather, predictions, chatbot integrations
|   |-- main.py          # FastAPI entry point
|   |-- seed.py          # demo user and sample data
|   |-- requirements.txt
|   `-- .env.example
|-- frontend/
|   |-- src/
|   |   |-- components/  # layout, landing, chatbot components
|   |   |-- pages/       # auth, dashboard, weather, crop health, alerts, analytics
|   |   |-- services/    # API client
|   |   `-- store/       # auth context
|   |-- public/
|   |-- package.json
|   `-- vite.config.js
|-- landing.html         # standalone landing page reference
`-- start-all.bat        # Windows helper to start both services
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm

## Local Setup

### 1. Start the backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python seed.py
python -m uvicorn main:app --reload
```

Backend URLs:

- API: `http://127.0.0.1:8000`
- Docs: `http://127.0.0.1:8000/docs`

On macOS or Linux, activate the virtual environment with `source venv/bin/activate`.

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- App: `http://localhost:5173`

The Vite dev server proxies `/api` requests to `http://localhost:8000`.

## One-Click Windows Start

From the project root:

```bat
start-all.bat
```

This opens backend and frontend in separate terminal windows, installs dependencies if needed, seeds demo data, and starts both services.

If your Windows environment blocks `uvicorn.exe` directly, use the `python -m uvicorn ...` form above. It launches the same server through Python and avoids the blocked executable.

## Environment Variables

Create `backend/.env` from `backend/.env.example` and configure:

```env
OPENWEATHER_API_KEY=your_openweather_api_key_here
SECRET_KEY=your_super_secret_key_here
DATABASE_URL=sqlite:///./agrotrade.db
ACCESS_TOKEN_EXPIRE_MINUTES=60
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_TEXT_MODEL=groq/compound-mini
GROQ_STRUCTURED_MODEL=openai/gpt-oss-20b
GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
GROQ_MODERATION_MODEL=openai/gpt-oss-safeguard-20b
```

Notes:

- `OPENWEATHER_API_KEY=demo` enables built-in demo weather data.
- `GROQ_API_KEY` is required for chatbot requests.
- `GROQ_TEXT_MODEL` is the first-choice text model for agriculture chat.
- `GROQ_VISION_MODEL` handles image analysis requests.
- `GROQ_MODERATION_MODEL` screens user text before the assistant responds.

## Demo Login

After running `python seed.py`, use:

- Email: `demo@agrotrade.com`
- Password: `demo1234`

## Frontend Routes

- `/` - landing page
- `/login` - login page
- `/register` - registration page
- `/dashboard` - dashboard home
- `/dashboard/weather` - weather screen
- `/dashboard/crop-health` - field list
- `/dashboard/crop-health/add` - add field form
- `/dashboard/predictions` - prediction center
- `/dashboard/alerts` - alert management
- `/dashboard/analytics` - analytics charts

## API Overview

Public endpoints:

- `GET /`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/chatbot/chat`

Authenticated requests must include:

```text
Authorization: Bearer <token>
```

Protected route groups:

- Auth: `GET /api/auth/me`
- Weather: `GET /api/weather/current`, `GET /api/weather/forecast`
- Fields: `POST /api/fields/`, `GET /api/fields/`, `GET /api/fields/{field_id}`, `PUT /api/fields/{field_id}`, `DELETE /api/fields/{field_id}`
- Predictions: `POST /api/predictions/run/{field_id}`, `GET /api/predictions/history`
- Alerts: `GET /api/alerts/`, `PATCH /api/alerts/{alert_id}/resolve`
- Analytics: `GET /api/analytics/summary`, `GET /api/analytics/field-health`, `GET /api/analytics/prediction-history-chart`

## Notes

- The prediction engine is explainable and rules-based.
- The chatbot is agriculture-focused and is not intended to be a general-purpose assistant.
- `landing.html` is a standalone reference page and is not part of the Vite routing.
- This repo currently includes local runtime artifacts such as `backend/venv`, `frontend/node_modules`, and SQLite database files.

## Next Steps

- Add automated tests for backend routes and prediction logic
- Add production deployment setup
- Move from SQLite to PostgreSQL for multi-user production use
- Clean up local runtime artifacts with a `.gitignore` pass
