from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class StatutAnnonce(str, enum.Enum):
    active   = "active"
    vendue   = "vendue"
    expiree  = "expiree"
    archivee = "archivee"

class TypeVente(str, enum.Enum):
    recolte     = "recolte"
    pre_recolte = "pre_recolte"

class Annonce(Base):
    __tablename__ = "annonces"

    id           = Column(Integer, primary_key=True, index=True)
    vendeur_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    titre        = Column(String(255), nullable=False)
    description  = Column(Text, nullable=True)
    culture      = Column(String(100), nullable=False)
    quantite     = Column(Float, nullable=False)
    unite        = Column(String(20), default="kg")
    prix         = Column(Float, nullable=False)
    region       = Column(String(100), nullable=True)
    localite     = Column(String(200), nullable=True)
    type_vente   = Column(Enum(TypeVente), default=TypeVente.recolte)
    statut       = Column(Enum(StatutAnnonce), default=StatutAnnonce.active)
    image        = Column(String(500), nullable=True)
    date_dispo   = Column(DateTime(timezone=True), nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())

    vendeur      = relationship("User", backref="annonces")
    commandes    = relationship("Commande", backref="annonce", cascade="all, delete")

class Commande(Base):
    __tablename__ = "commandes"

    id           = Column(Integer, primary_key=True, index=True)
    annonce_id   = Column(Integer, ForeignKey("annonces.id"), nullable=False)
    acheteur_id  = Column(Integer, ForeignKey("users.id"), nullable=False)
    quantite     = Column(Float, nullable=False)
    prix_total   = Column(Float, nullable=False)
    statut       = Column(String(50), default="en_attente")
    message      = Column(Text, nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    acheteur     = relationship("User", backref="commandes")
