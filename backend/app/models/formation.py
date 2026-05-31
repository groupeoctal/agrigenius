from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Cours(Base):
    __tablename__ = "cours"

    id          = Column(Integer, primary_key=True, index=True)
    titre       = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    filiere     = Column(String(100), nullable=False)   # cacao, manioc, palmier...
    niveau      = Column(String(50), default="débutant") # débutant, intermédiaire, avancé
    duree       = Column(Integer, nullable=True)         # minutes
    image       = Column(String(500), nullable=True)
    is_active   = Column(Boolean, default=True)
    ordre       = Column(Integer, default=0)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    modules = relationship("ModuleCours", backref="cours", cascade="all, delete")

class ModuleCours(Base):
    __tablename__ = "modules_cours"

    id          = Column(Integer, primary_key=True, index=True)
    cours_id    = Column(Integer, ForeignKey("cours.id"), nullable=False)
    titre       = Column(String(255), nullable=False)
    contenu     = Column(Text, nullable=True)
    video_url   = Column(String(500), nullable=True)
    ordre       = Column(Integer, default=0)

class Progression(Base):
    __tablename__ = "progressions"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False)
    cours_id        = Column(Integer, ForeignKey("cours.id"), nullable=False)
    module_actuel   = Column(Integer, default=0)
    pourcentage     = Column(Float, default=0.0)
    completed       = Column(Boolean, default=False)
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
