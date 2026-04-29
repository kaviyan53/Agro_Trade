from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from core.database import get_db
from core.auth import get_current_user
from core.logger import log_action
from models.user import User
from models.crop import CropField, Prediction

router = APIRouter(prefix="/api/fields", tags=["Crop Fields"])

DEFAULT_FARM_CENTER = {"lat": 11.0168, "lng": 76.9558}
CITY_COORDS = {
    "chennai": {"lat": 13.0827, "lng": 80.2707},
    "coimbatore": {"lat": 11.0168, "lng": 76.9558},
    "madurai": {"lat": 9.9252, "lng": 78.1198},
    "trichy": {"lat": 10.7905, "lng": 78.7047},
    "salem": {"lat": 11.6643, "lng": 78.1460},
    "erode": {"lat": 11.3410, "lng": 77.7172},
}


class FieldCreate(BaseModel):
    field_name: str
    crop_type: str
    location_city: str
    area_acres: Optional[float] = None
    soil_condition: str   # dry | moist | waterlogged
    irrigation_type: str  # drip | sprinkler | flood | none
    irrigation_frequency_days: Optional[int] = 3
    notes: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    moisture: Optional[float] = None
    nitrogen: Optional[float] = None
    phosphorus: Optional[float] = None
    sensor_ids: Optional[str] = None


class FieldOut(BaseModel):
    id: int
    field_name: str
    crop_type: str
    location_city: str
    area_acres: Optional[float]
    soil_condition: str
    irrigation_type: str
    irrigation_frequency_days: Optional[int]
    notes: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    moisture: Optional[float]
    nitrogen: Optional[float]
    phosphorus: Optional[float]
    sensor_ids: Optional[str]
    updated_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class FieldMapOut(BaseModel):
    id: str
    field_id: int
    name: str
    crop: str
    score: int
    status: str
    updated: str
    updated_at: datetime
    area: str
    lat: float
    lng: float
    moisture: float
    nitrogen: float
    phosphorus: float
    info: str
    sensors: List[str]
    location_city: str


def _relative_time(timestamp: datetime) -> str:
    delta = datetime.utcnow() - timestamp
    seconds = max(0, int(delta.total_seconds()))
    if seconds < 60:
        return f"{seconds}s ago"
    if seconds < 3600:
        return f"{seconds // 60}m ago"
    if seconds < 86400:
        return f"{seconds // 3600}h ago"
    return f"{seconds // 86400}d ago"


def _sensor_list(sensor_ids: Optional[str]) -> List[str]:
    if not sensor_ids:
        return []
    return [item.strip() for item in sensor_ids.split(",") if item.strip()]


def _fallback_coords(field: CropField, index: int) -> tuple[float, float]:
    if field.latitude is not None and field.longitude is not None:
        return field.latitude, field.longitude

    city = CITY_COORDS.get((field.location_city or "").strip().lower(), DEFAULT_FARM_CENTER)
    offset_seed = field.id or index + 1
    lat_offset = (((offset_seed * 7) % 5) - 2) * 0.0042
    lng_offset = (((offset_seed * 11) % 5) - 2) * 0.0048
    return city["lat"] + lat_offset, city["lng"] + lng_offset


def _fallback_metric(value: Optional[float], default: float) -> float:
    if value is None:
        return default
    return max(0.0, min(100.0, float(value)))


def _fallback_score(field: CropField) -> int:
    soil_modifier = {"moist": 8, "dry": -8, "waterlogged": -12}.get(field.soil_condition, 0)
    irrigation_modifier = {"drip": 4, "sprinkler": 2, "flood": -1, "none": -5}.get(field.irrigation_type, 0)
    moisture = _fallback_metric(field.moisture, 76 if field.soil_condition == "moist" else 48 if field.soil_condition == "dry" else 38)
    nitrogen = _fallback_metric(field.nitrogen, 74)
    phosphorus = _fallback_metric(field.phosphorus, 69)
    score = round((moisture * 0.38) + (nitrogen * 0.34) + (phosphorus * 0.28) + soil_modifier + irrigation_modifier)
    return max(0, min(100, score))


def _score_status(score: int) -> str:
    if score < 40:
        return "critical"
    if score < 75:
        return "warning"
    return "healthy"


def _prediction_status(prediction: Optional[Prediction], fallback_score: int) -> str:
    if prediction and prediction.risk_level:
        risk = prediction.risk_level.lower()
        if risk == "high":
            return "critical"
        if risk == "medium":
            return "warning"
        if risk == "low":
            return "healthy"
    return _score_status(fallback_score)


def _map_info(field: CropField, prediction: Optional[Prediction], status: str, moisture: float, nitrogen: float, phosphorus: float) -> str:
    if prediction and prediction.advice:
        return prediction.advice.strip()

    if status == "critical":
        if moisture < 40:
            return "Pest risk and low field vitality detected. Intervention needed within 48 hours."
        return "Field health is in the critical range. Dispatch a scout team and review nutrient balance."
    if status == "warning":
        if nitrogen < 65 or phosphorus < 65:
            return "Slight nutrient deficiency detected. Review fertilizer timing and monitor closely."
        return "Field needs monitoring today. Moisture or nutrient levels are outside the ideal band."
    return "Optimal conditions. Continue routine monitoring and keep an eye on weather exposure."


def _map_record(field: CropField, prediction: Optional[Prediction], index: int) -> FieldMapOut:
    score = prediction.health_score if prediction and prediction.health_score is not None else _fallback_score(field)
    status = _prediction_status(prediction, score)
    updated_at = prediction.created_at if prediction else (field.updated_at or field.created_at)
    lat, lng = _fallback_coords(field, index)
    moisture = round(_fallback_metric(field.moisture, 72 if status == "healthy" else 58 if status == "warning" else 34), 1)
    nitrogen = round(_fallback_metric(field.nitrogen, 82 if status == "healthy" else 66 if status == "warning" else 39), 1)
    phosphorus = round(_fallback_metric(field.phosphorus, 76 if status == "healthy" else 62 if status == "warning" else 43), 1)

    return FieldMapOut(
        id=f"FIELD-{field.id:03d}",
        field_id=field.id,
        name=field.field_name,
        crop=field.crop_type,
        score=score,
        status=status,
        updated=_relative_time(updated_at),
        updated_at=updated_at,
        area=f"{field.area_acres:.1f} acres" if field.area_acres is not None else "Area not set",
        lat=lat,
        lng=lng,
        moisture=moisture,
        nitrogen=nitrogen,
        phosphorus=phosphorus,
        info=_map_info(field, prediction, status, moisture, nitrogen, phosphorus),
        sensors=_sensor_list(field.sensor_ids),
        location_city=field.location_city,
    )


def _map_sort_key(item: FieldMapOut):
    order = {"critical": 0, "warning": 1, "healthy": 2}
    return (order.get(item.status, 99), -item.score, item.name.lower())


@router.post("/", response_model=FieldOut, status_code=201)
def create_field(req: FieldCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    field = CropField(**req.model_dump(), user_id=current_user.id)
    db.add(field)
    db.commit()
    db.refresh(field)
    log_action(current_user.email, "FIELD_CREATE", field.field_name)
    return field


@router.get("/", response_model=List[FieldOut])
def list_fields(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(CropField).filter(CropField.user_id == current_user.id).all()


@router.get("/map", response_model=List[FieldMapOut])
def list_fields_for_map(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fields = (
        db.query(CropField)
        .filter(CropField.user_id == current_user.id)
        .order_by(CropField.created_at.asc())
        .all()
    )

    output = []
    for index, field in enumerate(fields):
        latest_prediction = (
            db.query(Prediction)
            .filter(Prediction.field_id == field.id)
            .order_by(Prediction.created_at.desc())
            .first()
        )
        output.append(_map_record(field, latest_prediction, index))

    return sorted(output, key=_map_sort_key)


@router.get("/{field_id}", response_model=FieldOut)
def get_field(field_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    field = db.query(CropField).filter(CropField.id == field_id, CropField.user_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return field


@router.put("/{field_id}", response_model=FieldOut)
def update_field(field_id: int, req: FieldCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    field = db.query(CropField).filter(CropField.id == field_id, CropField.user_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    for k, v in req.model_dump().items():
        setattr(field, k, v)
    db.commit()
    db.refresh(field)
    log_action(current_user.email, "FIELD_UPDATE", field.field_name)
    return field


@router.delete("/{field_id}", status_code=204)
def delete_field(field_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    field = db.query(CropField).filter(CropField.id == field_id, CropField.user_id == current_user.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    db.delete(field)
    db.commit()
    log_action(current_user.email, "FIELD_DELETE", str(field_id))
