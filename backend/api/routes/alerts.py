from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime

from core.database import get_db
from core.auth import get_current_user
from core.logger import log_action
from models.user import User
from models.crop import Alert

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


class AlertOut(BaseModel):
    id: int
    title: str
    message: str
    severity: str
    is_resolved: int
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[AlertOut])
def list_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(Alert)
        .filter(Alert.user_id == current_user.id)
        .order_by(Alert.created_at.desc())
        .all()
    )


@router.patch("/{alert_id}/resolve", response_model=AlertOut)
def resolve_alert(alert_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user.id).first()
    if not alert:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_resolved = 1
    db.commit()
    db.refresh(alert)
    log_action(current_user.email, "ALERT_RESOLVE", str(alert_id))
    return alert
