from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class UserRole(str, enum.Enum):
    agriculteur = "agriculteur"
    acheteur    = "acheteur"
    expert      = "expert"
    admin       = "admin"

class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    nom        = Column(String(100), nullable=False)
    prenom     = Column(String(100), nullable=False)
    email      = Column(String(191), unique=True, index=True, nullable=False)
    telephone  = Column(String(20), nullable=True)
    region     = Column(String(100), nullable=True)
    role       = Column(Enum(UserRole), default=UserRole.agriculteur, nullable=False)
    password   = Column(String(255), nullable=False)
    is_active  = Column(Boolean, default=True)
    avatar     = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
