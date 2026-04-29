from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from core.database import get_db
from core.auth import get_current_user
from models.user import User
from models.crop import CropField, Prediction, Alert

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/summary")
def analytics_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_fields = db.query(CropField).filter(CropField.user_id == current_user.id).count()
    total_predictions = db.query(Prediction).filter(Prediction.user_id == current_user.id).count()
    total_alerts = db.query(Alert).filter(Alert.user_id == current_user.id, Alert.is_resolved == 0).count()

    avg_health = db.query(func.avg(Prediction.health_score)).filter(
        Prediction.user_id == current_user.id,
        Prediction.health_score.isnot(None)
    ).scalar()

    return {
        "total_fields": total_fields,
        "total_predictions": total_predictions,
        "active_alerts": total_alerts,
        "avg_health_score": round(avg_health, 1) if avg_health else None,
    }


@router.get("/field-health")
def field_health_chart(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return latest health score per field for charting."""
    fields = db.query(CropField).filter(CropField.user_id == current_user.id).all()
    result = []
    for field in fields:
        latest = (
            db.query(Prediction)
            .filter(Prediction.field_id == field.id)
            .order_by(Prediction.created_at.desc())
            .first()
        )
        result.append({
            "field_name": field.field_name,
            "crop_type": field.crop_type,
            "health_score": latest.health_score if latest else None,
            "risk_level": latest.risk_level if latest else "Unknown",
        })
    return result


@router.get("/prediction-history-chart")
def prediction_history_chart(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return last 10 predictions for trend chart."""
    preds = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.asc())
        .limit(20)
        .all()
    )
    return [
        {
            "date": p.created_at.strftime("%b %d"),
            "health_score": p.health_score,
            "field_id": p.field_id,
        }
        for p in preds
    ]
