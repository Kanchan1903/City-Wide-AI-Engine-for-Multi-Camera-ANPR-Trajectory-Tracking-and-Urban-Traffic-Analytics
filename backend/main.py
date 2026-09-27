from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings
import logging

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./sih_anpr.db"
    SECRET_KEY: str = "supersecretjwtkey_replace_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="City-Wide AI Engine for Multi-Camera ANPR",
    description="Backend API for Smart India Hackathon (SIH 2026) Problem Statement 26127",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from api.auth import router as auth_router
from api.core_api import router as core_router
from api.demo_api import router as demo_router
from api.ai_processing import router as ai_router
from api.analytics_api import router as analytics_router
from api.trajectory_api import router as trajectory_router
from api.alerts_api import router as alerts_router
from api.anpr_api import router as anpr_router

app.include_router(auth_router)
app.include_router(core_router)
app.include_router(demo_router)
app.include_router(ai_router)
app.include_router(analytics_router)
app.include_router(trajectory_router)
app.include_router(alerts_router)
app.include_router(anpr_router)

# Mount data folder for serving uploads securely
import os
data_dir = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(data_dir, exist_ok=True)
app.mount("/data", StaticFiles(directory=data_dir), name="data")

@app.get("/")
def read_root():
    return {"message": "Welcome to the City-Wide AI Engine API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
