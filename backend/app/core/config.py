from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


PROJECT_ROOT = Path(__file__).resolve().parents[3]
load_dotenv(PROJECT_ROOT / ".env")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=PROJECT_ROOT / ".env", extra="ignore")

    database_url: str = Field(default="", alias="DATABASE_URL")
    supabase_url: str = Field(default="", alias="SUPABASE_URL")
    supabase_service_role_key: str = Field(default="", alias="SUPABASE_SERVICE_ROLE_KEY")
    face_match_threshold: float = Field(default=0.6, alias="FACE_MATCH_THRESHOLD")
    face_model_pack: str = Field(default="buffalo_s", alias="FACE_MODEL_PACK")
    face_detection_size_value: str = Field(default="320,320", alias="FACE_DETECTION_SIZE")
    face_providers: list[str] = ["CPUExecutionProvider"]

    @property
    def face_detection_size(self) -> tuple[int, int]:
        try:
            width, height = [int(part.strip()) for part in self.face_detection_size_value.split(",", 1)]
            return width, height
        except ValueError:
            return 320, 320


@lru_cache
def get_settings() -> Settings:
    return Settings()
