from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationOut, NotificationCreate

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=List[NotificationOut])
def list_notifications(
    non_lues_uniquement: Optional[bool] = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Liste les notifications de l'utilisateur connecté"""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)

    if non_lues_uniquement:
        query = query.filter(Notification.lu == False)

    notifications = query.order_by(Notification.created_at.desc()).all()
    return notifications

@router.get("/non-lues/count")
def count_non_lues(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Compte les notifications non lues"""
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.lu == False
    ).count()
    return {"count": count}

@router.put("/{notification_id}/lire")
def marquer_comme_lue(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Marque une notification comme lue"""
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notif:
        raise HTTPException(status_code=404, detail="Notification introuvable")

    notif.lu = True
    db.commit()
    return {"message": "Notification marquée comme lue"}

@router.put("/tout-lire")
def tout_marquer_comme_lu(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Marque toutes les notifications comme lues"""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.lu == False
    ).update({"lu": True})
    db.commit()
    return {"message": "Toutes les notifications ont été marquées comme lues"}

@router.delete("/{notification_id}")
def supprimer_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Supprime une notification"""
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notif:
        raise HTTPException(status_code=404, detail="Notification introuvable")

    db.delete(notif)
    db.commit()
    return {"message": "Notification supprimée"}

# Fonction helper pour créer des notifications (utilisée par d'autres routes)
def creer_notification(
    db: Session,
    user_id: int,
    type_notif: str,
    titre: str,
    message: str,
    lien: Optional[str] = None
):
    """Crée une nouvelle notification pour un utilisateur"""
    notification = Notification(
        user_id=user_id,
        type=type_notif,
        titre=titre,
        message=message,
        lien=lien
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
