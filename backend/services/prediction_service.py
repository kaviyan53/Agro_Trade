"""
Simple, explainable AI decision logic for crop advisory.
Rules-based system combining weather data + user field input.
"""

from models.crop import CropField


CROP_THRESHOLDS = {
    "corn":     {"temp_max": 35, "temp_min": 10, "humidity_ideal": (50, 80), "water_days": 3},
    "wheat":    {"temp_max": 30, "temp_min": 5,  "humidity_ideal": (40, 70), "water_days": 5},
    "soybeans": {"temp_max": 32, "temp_min": 12, "humidity_ideal": (55, 80), "water_days": 4},
    "rice":     {"temp_max": 38, "temp_min": 15, "humidity_ideal": (70, 95), "water_days": 2},
    "barley":   {"temp_max": 28, "temp_min": 4,  "humidity_ideal": (45, 70), "water_days": 6},
    "default":  {"temp_max": 33, "temp_min": 8,  "humidity_ideal": (50, 80), "water_days": 4},
}


def generate_prediction(field: CropField, weather: dict) -> dict:
    """
    Core advisory engine. Returns structured advice based on:
    - Field data (crop type, soil condition, irrigation)
    - Current weather (temperature, rain, humidity)
    """
    crop_key = field.crop_type.lower() if field.crop_type.lower() in CROP_THRESHOLDS else "default"
    thresholds = CROP_THRESHOLDS[crop_key]

    temp = weather.get("temperature", 25)
    humidity = weather.get("humidity", 60)
    rain_expected = weather.get("rain_expected", False)
    soil = field.soil_condition.lower()

    advice_items = []
    alerts = []
    health_score = 85
    risk_level = "Low"

    # ── IRRIGATION LOGIC ────────────────────────────────────────────────────
    if rain_expected:
        irrigation_advice = "Skip irrigation today — rain is expected in your area."
        advice_items.append("🌧 Rain forecast detected. Skipping manual irrigation will save water.")
    elif soil == "dry":
        irrigation_advice = "Irrigate today — soil is dry and no rain is expected."
        advice_items.append("💧 Soil is dry. Irrigate your crop as soon as possible.")
        health_score -= 10
    elif soil == "waterlogged":
        irrigation_advice = "Do NOT irrigate — soil is already waterlogged."
        advice_items.append("⚠️ Waterlogged soil detected. Pause irrigation and check drainage.")
        alerts.append({"title": "Waterlogging Risk", "message": "Excess water can cause root rot. Improve field drainage.", "severity": "warning"})
        health_score -= 15
        risk_level = "Medium"
    else:
        irrigation_advice = "Soil moisture is adequate. Monitor and irrigate in 2–3 days."
        advice_items.append("✅ Soil moisture is at a good level. No immediate irrigation needed.")

    # ── TEMPERATURE LOGIC ──────────────────────────────────────────────────
    if temp > thresholds["temp_max"]:
        advice_items.append(f"🌡 High temperature ({temp}°C) detected. Increase irrigation frequency to prevent heat stress.")
        alerts.append({"title": "Heat Stress Alert", "message": f"Temperature {temp}°C exceeds safe limit for {field.crop_type}. Consider early morning irrigation.", "severity": "critical"})
        health_score -= 12
        risk_level = "High"
    elif temp < thresholds["temp_min"]:
        advice_items.append(f"❄️ Cold temperature ({temp}°C) detected. Protect crops from frost damage.")
        alerts.append({"title": "Frost Warning", "message": f"Temperature {temp}°C is below the safe range for {field.crop_type}.", "severity": "warning"})
        health_score -= 8
        risk_level = "Medium"
    else:
        advice_items.append(f"🌤 Temperature ({temp}°C) is within safe range for {field.crop_type}.")

    # ── HUMIDITY LOGIC ────────────────────────────────────────────────────
    h_min, h_max = thresholds["humidity_ideal"]
    if humidity < h_min:
        advice_items.append(f"💨 Low humidity ({humidity}%). Consider mist irrigation or mulching to retain moisture.")
        health_score -= 5
    elif humidity > h_max:
        advice_items.append(f"🌫 High humidity ({humidity}%). Watch for fungal diseases — ensure good air circulation.")
        alerts.append({"title": "Fungal Risk", "message": f"Humidity at {humidity}% may promote fungal infections on {field.crop_type}.", "severity": "warning"})
        health_score -= 7

    # ── FERTILIZER ADVICE ─────────────────────────────────────────────────
    fertilizer_map = {
        "corn": "Apply nitrogen-rich fertilizer (urea) every 3 weeks during vegetative stage.",
        "wheat": "Apply NPK 20-20-0 at sowing; top-dress with urea at tillering stage.",
        "soybeans": "Soybeans fix nitrogen; apply phosphorus and potassium at planting.",
        "rice": "Apply basal dose of NPK before transplanting; urea top-dress at tillering.",
        "barley": "Apply nitrogen at sowing and once more 4 weeks later.",
        "default": "Apply a balanced NPK fertilizer based on soil test results.",
    }
    fertilizer_advice = fertilizer_map.get(crop_key, fertilizer_map["default"])

    # Clamp health score
    health_score = max(20, min(100, health_score))
    if health_score < 50:
        risk_level = "High"
    elif health_score < 70:
        risk_level = "Medium"

    summary = f"Overall crop status for {field.crop_type} at {field.location_city}: "
    if risk_level == "Low":
        summary += "Conditions are favorable. Follow standard care."
    elif risk_level == "Medium":
        summary += "Some concerns noted. Take corrective action."
    else:
        summary += "High risk detected. Immediate action recommended."

    return {
        "advice": summary,
        "advice_items": advice_items,
        "irrigation_advice": irrigation_advice,
        "fertilizer_advice": fertilizer_advice,
        "health_score": health_score,
        "risk_level": risk_level,
        "alerts": alerts,
        "weather_summary": f"{weather.get('description', 'N/A')}, {temp}°C, Humidity {humidity}%",
    }
