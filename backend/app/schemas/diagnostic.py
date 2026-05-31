from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.diagnostic import DiagnosticType

class DiagnosticPhytoCreate(BaseModel):
    culture: str
    region: Optional[str] = None
    parcelle: Optional[str] = None

class DiagnosticPedoCreate(BaseModel):
    ph: float
    texture: str
    humidite: str
    drainage: str
    region: Optional[str] = None
    parcelle: Optional[str] = None

class DiagnosticOut(BaseModel):
    id: int
    type: DiagnosticType
    culture: Optional[str]
    maladie: Optional[str]
    confiance: Optional[float]
    ph: Optional[float]
    texture: Optional[str]
    recommandations: Optional[str]
    region: Optional[str]
    parcelle: Optional[str]
    image_path: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
