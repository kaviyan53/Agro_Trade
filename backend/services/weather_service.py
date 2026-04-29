from datetime import datetime, timezone

import httpx
from core.config import get_settings
from core.logger import logger

settings = get_settings()

OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5"


def _to_local_time(timestamp: int, offset_seconds: int) -> str:
    local_time = datetime.fromtimestamp(timestamp + offset_seconds, tz=timezone.utc)
    return local_time.strftime("%I:%M %p")


def _format_daylight_minutes(start: int, end: int) -> str:
    total_minutes = max(0, (end - start) // 60)
    hours, minutes = divmod(total_minutes, 60)
    return f"{hours}h {minutes}m"


def _wind_heading(degrees: float | None) -> str | None:
    if degrees is None:
        return None

    directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    index = round(degrees / 45) % len(directions)
    return directions[index]


async def get_current_weather(city: str) -> dict:
    """Fetch current weather from OpenWeatherMap API."""
    api_key = settings.openweather_api_key

    # Return demo data if no real key configured
    if api_key == "demo":
        return _demo_weather(city)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{OPENWEATHER_BASE}/weather",
                params={"q": city, "appid": api_key, "units": "metric"}
            )
            response.raise_for_status()
            data = response.json()

        return {
            "city": data["name"],
            "country": data["sys"]["country"],
            "temperature": round(data["main"]["temp"], 1),
            "feels_like": round(data["main"]["feels_like"], 1),
            "humidity": data["main"]["humidity"],
            "wind_speed": round(data["wind"]["speed"] * 3.6, 1),  # m/s to km/h
            "wind_direction": _wind_heading(data.get("wind", {}).get("deg")),
            "description": data["weather"][0]["description"].title(),
            "icon": data["weather"][0]["icon"],
            "rain_expected": "rain" in data["weather"][0]["main"].lower(),
            "uv_index": None,  # requires separate call in free tier
            "sunrise": _to_local_time(data["sys"]["sunrise"], data.get("timezone", 0)),
            "sunset": _to_local_time(data["sys"]["sunset"], data.get("timezone", 0)),
            "daylight": _format_daylight_minutes(data["sys"]["sunrise"], data["sys"]["sunset"]),
            "updated_at": _to_local_time(data["dt"], data.get("timezone", 0)),
        }
    except httpx.HTTPStatusError as e:
        logger.error(f"Weather API HTTP error for {city}: {e}")
        return _demo_weather(city)
    except Exception as e:
        logger.error(f"Weather API error for {city}: {e}")
        return _demo_weather(city)


async def get_forecast(city: str) -> list:
    """Fetch 5-day / 3-hour forecast and return daily summary."""
    api_key = settings.openweather_api_key

    if api_key == "demo":
        return _demo_forecast()

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{OPENWEATHER_BASE}/forecast",
                params={"q": city, "appid": api_key, "units": "metric", "cnt": 40}
            )
            response.raise_for_status()
            data = response.json()

        # Group by day, pick noon reading
        days = {}
        for item in data["list"]:
            date = item["dt_txt"].split(" ")[0]
            hour = item["dt_txt"].split(" ")[1]
            if date not in days or hour == "12:00:00":
                days[date] = {
                    "date": date,
                    "temp_max": round(item["main"]["temp_max"], 1),
                    "temp_min": round(item["main"]["temp_min"], 1),
                    "description": item["weather"][0]["description"].title(),
                    "icon": item["weather"][0]["icon"],
                    "rain": "rain" in item["weather"][0]["main"].lower(),
                    "humidity": item["main"]["humidity"],
                }

        return list(days.values())[:7]

    except Exception as e:
        logger.error(f"Forecast API error for {city}: {e}")
        return _demo_forecast()


def _demo_weather(city: str) -> dict:
    return {
        "city": city,
        "country": "IN",
        "temperature": 28.4,
        "feels_like": 30.0,
        "humidity": 64,
        "wind_speed": 12.5,
        "wind_direction": "NW",
        "description": "Partly Cloudy",
        "icon": "02d",
        "rain_expected": False,
        "uv_index": 7.2,
        "sunrise": "05:12 AM",
        "sunset": "06:54 PM",
        "daylight": "13h 42m",
        "updated_at": "Updated just now",
        "_demo": True,
    }


def _demo_forecast() -> list:
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    descs = ["Sunny", "Partly Cloudy", "Showers", "Partly Cloudy", "Sunny", "Sunny", "Cloudy"]
    icons = ["01d", "02d", "10d", "02d", "01d", "01d", "03d"]
    rains = [False, False, True, False, False, False, False]
    highs = [30, 28, 24, 26, 31, 33, 29]
    lows = [18, 17, 16, 15, 19, 20, 18]

    from datetime import date, timedelta
    result = []
    for i, day in enumerate(days):
        d = date.today() + timedelta(days=i)
        result.append({
            "date": d.isoformat(),
            "temp_max": highs[i],
            "temp_min": lows[i],
            "description": descs[i],
            "icon": icons[i],
            "rain": rains[i],
            "humidity": 60 + i * 2,
        })
    return result
