"""
Run this once to seed demo user and sample fields.
Usage: python seed.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from core.database import engine, SessionLocal, Base
from core.database import ensure_sqlite_schema
import models.user, models.crop  # noqa - register models
from models.user import User
from models.crop import CropField
from core.auth import get_password_hash

Base.metadata.create_all(bind=engine)
ensure_sqlite_schema()
db = SessionLocal()

# Demo user
if not db.query(User).filter(User.email == "demo@agrotrade.com").first():
    user = User(
        email="demo@agrotrade.com",
        full_name="Demo Farmer",
        farm_name="Green Valley Farm",
        farm_location="Chennai",
        hashed_password=get_password_hash("demo1234"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"[*] Demo user created: demo@agrotrade.com / demo1234")

    # Sample fields
    fields = [
        CropField(
            user_id=user.id,
            field_name="North Ridge A1",
            crop_type="Corn",
            location_city="Coimbatore",
            area_acres=12.4,
            soil_condition="moist",
            irrigation_type="drip",
            irrigation_frequency_days=3,
            latitude=11.0286,
            longitude=76.9494,
            moisture=68,
            nitrogen=82,
            phosphorus=74,
            sensor_ids="S-001, S-002, S-003",
            notes="Optimal conditions. Keep routine canopy checks in place.",
        ),
        CropField(
            user_id=user.id,
            field_name="Valley Basin",
            crop_type="Soybeans",
            location_city="Coimbatore",
            area_acres=8.7,
            soil_condition="dry",
            irrigation_type="sprinkler",
            irrigation_frequency_days=4,
            latitude=11.0121,
            longitude=76.9717,
            moisture=42,
            nitrogen=61,
            phosphorus=58,
            sensor_ids="S-004, S-005",
            notes="Moisture below threshold. Review irrigation timing this afternoon.",
        ),
        CropField(
            user_id=user.id,
            field_name="South Creek P2",
            crop_type="Wheat",
            location_city="Coimbatore",
            area_acres=15.2,
            soil_condition="dry",
            irrigation_type="flood",
            irrigation_frequency_days=5,
            latitude=10.9985,
            longitude=76.9624,
            moisture=28,
            nitrogen=35,
            phosphorus=40,
            sensor_ids="S-006, S-007, S-008",
            notes="Pest risk detected. Immediate scouting recommended within 48 hours.",
        ),
        CropField(
            user_id=user.id,
            field_name="East Hillside",
            crop_type="Corn",
            location_city="Coimbatore",
            area_acres=10.1,
            soil_condition="moist",
            irrigation_type="drip",
            irrigation_frequency_days=3,
            latitude=11.0235,
            longitude=76.9832,
            moisture=71,
            nitrogen=88,
            phosphorus=79,
            sensor_ids="S-009, S-010",
            notes="Good conditions. Monitor wind exposure on the upper slope.",
        ),
        CropField(
            user_id=user.id,
            field_name="Central Plateau",
            crop_type="Soybeans",
            location_city="Coimbatore",
            area_acres=9.3,
            soil_condition="moist",
            irrigation_type="sprinkler",
            irrigation_frequency_days=4,
            latitude=11.0168,
            longitude=76.9558,
            moisture=55,
            nitrogen=70,
            phosphorus=66,
            sensor_ids="S-011, S-012",
            notes="Slight nutrient deficiency. Review fertilizer schedule this week.",
        ),
    ]
    for f in fields:
        db.add(f)
    db.commit()
    print(f"[*] {len(fields)} sample fields created")
else:
    print("[i]  Demo user already exists. Skipping.")

db.close()
print("\n[*] Seed complete! Login with: demo@agrotrade.com / demo1234")
