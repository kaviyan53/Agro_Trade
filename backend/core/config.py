from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    openweather_api_key: str = "demo"
    secret_key: str = "dev-secret-key-change-in-production"
    database_url: str = "sqlite:///./agrotrade.db"
    access_token_expire_minutes: int = 60
    algorithm: str = "HS256"
    app_name: str = "Vijay Agro Trade"
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    groq_text_model: str = "groq/compound-mini"
    groq_structured_model: str = "openai/gpt-oss-20b"
    groq_vision_model: str = "meta-llama/llama-4-scout-17b-16e-instruct"
    groq_moderation_model: str = "openai/gpt-oss-safeguard-20b"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
