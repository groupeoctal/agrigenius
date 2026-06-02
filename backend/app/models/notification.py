from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class TypeNotification(str, enum.Enum):
    diagnostic = "diagnostic"
    formation = "formation"
    marketplace = "marketplace"
    commande = "commande"
    systeme = "systeme"
    alerte = "alerte"

class Notification(Base):
    __tablename__ = "notifications"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    type         = Column(Enum(TypeNotification), nullable=False)
    titre        = Column(String(255), nullable=False)
    message      = Column(Text, nullable=False)
    lien         = Column(String(500), nullable=True)  # URL de redirection
    lu           = Column(Boolean, default=False)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    user         = relationship("User", backref="notifications")
