from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id          = Column(Integer, primary_key=True, index=True)
    cours_id    = Column(Integer, ForeignKey("cours.id"), nullable=False)
    question    = Column(Text, nullable=False)
    option_a    = Column(String(300), nullable=False)
    option_b    = Column(String(300), nullable=False)
    option_c    = Column(String(300), nullable=False)
    option_d    = Column(String(300), nullable=True)
    bonne_reponse = Column(String(1), nullable=False)   # "a", "b", "c" ou "d"
    explication = Column(Text, nullable=True)           # Explication de la bonne réponse
    ordre       = Column(Integer, default=0)

    cours = relationship("Cours", backref="questions")

class QuizResultat(Base):
    __tablename__ = "quiz_resultats"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    cours_id    = Column(Integer, ForeignKey("cours.id"), nullable=False)
    score       = Column(Float, nullable=False)         # % de bonnes réponses
    nb_correct  = Column(Integer, nullable=False)
    nb_total    = Column(Integer, nullable=False)
    passed      = Column(Boolean, default=False)        # >= 70% pour valider
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

class Badge(Base):
    __tablename__ = "badges"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    type        = Column(String(50), nullable=False)    # "cours_complete", "premier_diagnostic", etc.
    titre       = Column(String(100), nullable=False)
    description = Column(String(300), nullable=True)
    emoji       = Column(String(10), nullable=True)
    cours_id    = Column(Integer, ForeignKey("cours.id"), nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
