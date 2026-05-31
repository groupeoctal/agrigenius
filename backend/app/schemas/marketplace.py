from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.marketplace import StatutAnnonce, TypeVente

class AnnonceCreate(BaseModel):
    titre: str
    description: Optional[str] = None
    culture: str
    quantite: float
    unite: str = "kg"
    prix: float
    region: Optional[str] = None
    localite: Optional[str] = None
    type_vente: TypeVente = TypeVente.recolte

class AnnonceOut(BaseModel):
    id: int
    titre: str
    description: Optional[str]
    culture: str
    quantite: float
    unite: str
    prix: float
    region: Optional[str]
    localite: Optional[str]
    type_vente: TypeVente
    statut: StatutAnnonce
    image: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class CommandeCreate(BaseModel):
    annonce_id: int
    quantite: float
    message: Optional[str] = None
