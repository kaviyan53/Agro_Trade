from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime

from core.database import get_db
from core.auth import get_current_user
from core.logger import log_action
from models.user import User
from models.crop import CropField, Prediction, Alert
from services.weather_service import get_current_weather
from services.prediction_service import generate_prediction

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])


class PredictionOut(BaseModel):
    id: int
    field_id: int
    advice: str
    irrigation_advice: str | None
    fertilizer_advice: str | None
    health_score: int | None
    risk_level: str | None
    weather_summary: str | None
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/run/{field_id}")
async def run_prediction(
    field_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    field = db.query(CropField).filter(CropField.id == field_id, CropField.user_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")

    # Fetch real weather for field's city
    weather = await get_current_weather(field.location_city)

    # Run AI advisory engine
    result = generate_prediction(field, weather)

    # Save prediction to DB
    prediction = Prediction(
        user_id=current_user.id,
        field_id=field.id,
        advice=result["advice"],
        irrigation_advice=result["irrigation_advice"],
        fertilizer_advice=result["fertilizer_advice"],
        health_score=result["health_score"],
        risk_level=result["risk_level"],
        weather_summary=result["weather_summary"],
    )
    db.add(prediction)

    # Save any generated alerts
    for alert_data in result.get("alerts", []):
        alert = Alert(
            user_id=current_user.id,
            title=alert_data["title"],
            message=alert_data["message"],
            severity=alert_data["severity"],
        )
        db.add(alert)

    db.commit()
    db.refresh(prediction)
    log_action(current_user.email, "PREDICTION_RUN", f"field_id={field_id}, score={result['health_score']}")

    return {
        **PredictionOut.from_orm(prediction).model_dump(),
        "advice_items": result["advice_items"],
        "weather": weather,
    }


@router.get("/history", response_model=List[PredictionOut])
def prediction_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .limit(50)
        .all()
    )
