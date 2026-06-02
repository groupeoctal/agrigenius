from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate
from app.core.security import hash_password, verify_password
from pydantic import BaseModel
import os
import shutil
from pathlib import Path
import uuid

router = APIRouter(prefix="/users", tags=["Utilisateurs"])

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_me(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès refusé")
    return db.query(User).all()

# ============= CHANGEMENT DE MOT DE PASSE =============

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.put("/me/password")
def change_password(
    data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Permet à un utilisateur connecté de changer son mot de passe.
    Nécessite l'ancien mot de passe pour confirmation.
    """
    # Vérifier l'ancien mot de passe
    if not verify_password(data.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Mot de passe actuel incorrect")

    # Vérifier que le nouveau mot de passe est différent
    if verify_password(data.new_password, current_user.password):
        raise HTTPException(status_code=400, detail="Le nouveau mot de passe doit être différent de l'ancien")

    # Vérifier la longueur du nouveau mot de passe
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins 6 caractères")

    # Mettre à jour le mot de passe
    current_user.password = hash_password(data.new_password)
    db.commit()

    return {
        "success": True,
        "message": "Votre mot de passe a été modifié avec succès"
    }

# ============= UPLOAD DE PHOTO DE PROFIL =============

@router.put("/me/photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Permet à un utilisateur connecté de télécharger une photo de profil.
    Accepte uniquement les images (jpg, jpeg, png, gif, webp).
    Taille maximale : 5MB.
    """
    # Vérifier le type de fichier
    allowed_extensions = ["jpg", "jpeg", "png", "gif", "webp"]
    file_extension = file.filename.split(".")[-1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Format de fichier non supporté. Formats acceptés : {', '.join(allowed_extensions)}"
        )

    # Vérifier la taille du fichier (max 5MB)
    contents = await file.read()
    file_size = len(contents)
    if file_size > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(status_code=400, detail="La taille du fichier ne doit pas dépasser 5MB")

    # Créer le dossier uploads si nécessaire
    upload_dir = Path("uploads/profile_photos")
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Générer un nom de fichier unique
    unique_filename = f"{current_user.id}_{uuid.uuid4()}.{file_extension}"
    file_path = upload_dir / unique_filename

    # Sauvegarder le fichier
    with open(file_path, "wb") as f:
        f.write(contents)

    # Mettre à jour l'avatar de l'utilisateur
    # Supprimer l'ancien fichier s'il existe
    if current_user.avatar and current_user.avatar.startswith("/uploads/"):
        old_file_path = Path(current_user.avatar.lstrip("/"))
        if old_file_path.exists():
            old_file_path.unlink()

    # Mettre à jour l'URL de l'avatar
    current_user.avatar = f"/uploads/profile_photos/{unique_filename}"
    db.commit()
    db.refresh(current_user)

    return {
        "success": True,
        "message": "Photo de profil mise à jour avec succès",
        "avatar_url": current_user.avatar
    }
