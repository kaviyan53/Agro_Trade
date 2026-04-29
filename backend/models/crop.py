from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base
import enum


class SoilCondition(str, enum.Enum):
    dry = "dry"
    moist = "moist"
    waterlogged = "waterlogged"


class IrrigationType(str, enum.Enum):
    drip = "drip"
    sprinkler = "sprinkler"
    flood = "flood"
    none = "none"


class CropField(Base):
    __tablename__ = "crop_fields"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    field_name = Column(String, nullable=False)
    crop_type = Column(String, nullable=False)
    location_city = Column(String, nullable=False)
    area_acres = Column(Float, nullable=True)
    soil_condition = Column(String, nullable=False)
    irrigation_type = Column(String, nullable=False)
    irrigation_frequency_days = Column(Integer, nullable=True, default=3)
    notes = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    moisture = Column(Float, nullable=True)
    nitrogen = Column(Float, nullable=True)
    phosphorus = Column(Float, nullable=True)
    sensor_ids = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="fields")
    predictions = relationship("Prediction", back_populates="field")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    field_id = Column(Integer, ForeignKey("crop_fields.id"), nullable=False)
    advice = Column(Text, nullable=False)
    irrigation_advice = Column(String, nullable=True)
    fertilizer_advice = Column(String, nullable=True)
    health_score = Column(Integer, nullable=True)
    risk_level = Column(String, nullable=True)
    weather_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="predictions")
    field = relationship("CropField", back_populates="predictions")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String, nullable=False, default="info")  # info, warning, critical
    is_resolved = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="alerts")
