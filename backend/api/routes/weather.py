from fastapi import APIRouter, Depends, Query
from core.auth import get_current_user
from core.logger import log_action
from models.user import User
from services.weather_service import get_current_weather, get_forecast

router = APIRouter(prefix="/api/weather", tags=["Weather"])


@router.get("/current")
async def current_weather(
    city: str = Query(..., description="City name, e.g. Chennai"),
    current_user: User = Depends(get_current_user)
):
    log_action(current_user.email, "WEATHER_FETCH", city)
    return await get_current_weather(city)


@router.get("/forecast")
async def forecast(
    city: str = Query(..., description="City name"),
    current_user: User = Depends(get_current_user)
):
    log_action(current_user.email, "FORECAST_FETCH", city)
    return await get_forecast(city)
