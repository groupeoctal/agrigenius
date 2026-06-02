from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.models.password_reset import PasswordReset
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserOut
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import secrets

router = APIRouter(prefix="/auth", tags=["Authentification"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    # Vérifier si email existe déjà
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")

    user = User(
        nom=data.nom,
        prenom=data.prenom,
        email=data.email,
        password=hash_password(data.password),
        role=data.role,
        region=data.region,
        telephone=data.telephone,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))

@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Compte désactivé")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
def me(db: Session = Depends(get_db), credentials=None):
    # Géré via deps.py dans les routes protégées
    pass

# ============= RESET MOT DE PASSE =============

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Demande de réinitialisation de mot de passe.
    Génère un token valide 1h et le retourne (en production, envoyez par email).
    """
    # Vérifier que l'utilisateur existe
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        # Par sécurité, ne pas révéler si l'email existe ou non
        return {
            "success": True,
            "message": "Si cet email existe dans notre système, vous recevrez un lien de réinitialisation."
        }

    # Générer un token sécurisé
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(hours=1)

    # Créer l'enregistrement de reset
    reset = PasswordReset(
        email=data.email,
        token=token,
        expires_at=expires_at,
    )
    db.add(reset)
    db.commit()

    # En production, envoyer le token par email
    # Pour le développement, on le retourne directement
    return {
        "success": True,
        "message": "Un lien de réinitialisation a été généré.",
        "token": token,  # À SUPPRIMER EN PRODUCTION - Envoyer par email à la place
        "reset_link": f"/auth/reset-password?token={token}"  # Pour faciliter les tests
    }

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Réinitialise le mot de passe avec un token valide.
    """
    # Vérifier le token
    reset = db.query(PasswordReset).filter(
        PasswordReset.token == data.token
    ).first()

    if not reset:
        raise HTTPException(status_code=400, detail="Token invalide ou expiré")

    if not reset.is_valid():
        raise HTTPException(status_code=400, detail="Ce lien de réinitialisation a expiré ou a déjà été utilisé")

    # Trouver l'utilisateur
    user = db.query(User).filter(User.email == reset.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    # Mettre à jour le mot de passe
    user.password = hash_password(data.new_password)

    # Marquer le token comme utilisé
    reset.used = True

    db.commit()

    return {
        "success": True,
        "message": "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter."
    }
