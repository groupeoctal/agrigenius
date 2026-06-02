from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.database import engine, Base
from app.models import *  # importer tous les modèles pour la création des tables

from app.api.routes import auth, users, diagnostics, marketplace, formation, notifications, dashboard, admin

# Créer les tables en base de données
Base.metadata.create_all(bind=engine)

# Créer les dossiers d'upload
os.makedirs("uploads/diagnostics", exist_ok=True)
os.makedirs("uploads/marketplace", exist_ok=True)
os.makedirs("uploads/profile_photos", exist_ok=True)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API REST d'AgriGenius — Plateforme intelligente de digitalisation agricole au Cameroun",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — autoriser le frontend Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes API (AVANT le montage des fichiers statiques)
app.include_router(auth.router,          prefix="/api")
app.include_router(users.router,         prefix="/api")
app.include_router(diagnostics.router,   prefix="/api")
app.include_router(marketplace.router,   prefix="/api")
app.include_router(formation.router,     prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(dashboard.router,     prefix="/api")
app.include_router(admin.router,         prefix="/api")

# Servir les fichiers uploadés (APRÈS les routes API)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "✅ API opérationnelle",
        "docs": "/docs",
    }

@app.get("/health")
def health():
    return {"status": "ok"}
