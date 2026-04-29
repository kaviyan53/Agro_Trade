from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.database import Base, engine, ensure_sqlite_schema
from core.logger import logger

# Import all models so SQLAlchemy creates their tables
import models.crop  # noqa
import models.user  # noqa
from api.routes import alerts, analytics, auth, chatbot, fields, predictions, weather

# Create all tables on startup
Base.metadata.create_all(bind=engine)
ensure_sqlite_schema()

app = FastAPI(
    title="Vijay Agro Trade - OpenFarm API",
    description="""
## Smart Agriculture Intelligence Platform

A complete AI-powered system for crop monitoring and advisory.

### Features
- Weather - Real-time weather via OpenWeatherMap
- Crop Health - Manage fields with soil and irrigation data
- Predictions - AI advisory combining weather and field data
- Alerts - Automated risk notifications
- Analytics - Health trends and field summaries
- Auth - JWT-based user authentication

### Getting Started
1. Register via `POST /api/auth/register`
2. Login via `POST /api/auth/login` to get your token
3. Use the token as `Bearer <token>` in the Authorize button above
    """,
    version="1.0.0",
    contact={"name": "Vijay Agro Trade", "email": "support@agrotrade.ai"},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(weather.router)
app.include_router(fields.router)
app.include_router(predictions.router)
app.include_router(alerts.router)
app.include_router(analytics.router)
app.include_router(chatbot.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "app": "Vijay Agro Trade API", "docs": "/docs"}


@app.on_event("startup")
async def startup():
    ensure_sqlite_schema()
    logger.info("Vijay Agro Trade API started successfully")
