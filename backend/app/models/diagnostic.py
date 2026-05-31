from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class DiagnosticType(str, enum.Enum):
    phytosanitaire = "phytosanitaire"
    pedologique    = "pedologique"

class Diagnostic(Base):
    __tablename__ = "diagnostics"

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id"), nullable=False)
    type           = Column(Enum(DiagnosticType), nullable=False)

    # Phytosanitaire
    image_path     = Column(String(500), nullable=True)
    culture        = Column(String(100), nullable=True)
    maladie        = Column(String(200), nullable=True)
    confiance      = Column(Float, nullable=True)        # % de confiance IA

    # Pédologique
    ph             = Column(Float, nullable=True)
    texture        = Column(String(50), nullable=True)
    humidite       = Column(String(50), nullable=True)
    drainage       = Column(String(50), nullable=True)

    # Résultats communs
    recommandations = Column(Text, nullable=True)        # JSON string
    region         = Column(String(100), nullable=True)
    parcelle       = Column(String(200), nullable=True)

    created_at     = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="diagnostics")
