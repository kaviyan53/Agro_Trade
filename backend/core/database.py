from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from core.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

SQLITE_CROP_FIELD_COLUMNS = {
    "latitude": "FLOAT",
    "longitude": "FLOAT",
    "moisture": "FLOAT",
    "nitrogen": "FLOAT",
    "phosphorus": "FLOAT",
    "sensor_ids": "TEXT",
}


def ensure_sqlite_schema():
    if "sqlite" not in settings.database_url:
        return

    with engine.begin() as conn:
        tables = {row[0] for row in conn.exec_driver_sql(
            "SELECT name FROM sqlite_master WHERE type='table'"
        ).fetchall()}
        if "crop_fields" not in tables:
            return

        existing_columns = {
            row[1] for row in conn.exec_driver_sql("PRAGMA table_info(crop_fields)").fetchall()
        }

        for column_name, column_type in SQLITE_CROP_FIELD_COLUMNS.items():
            if column_name not in existing_columns:
                conn.exec_driver_sql(
                    f"ALTER TABLE crop_fields ADD COLUMN {column_name} {column_type}"
                )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
