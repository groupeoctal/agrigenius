from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserRole
from app.models.diagnostic import Diagnostic
from app.models.formation import Cours, Progression
from app.models.marketplace import Annonce, Commande
from app.models.notification import Notification
from datetime import datetime, timedelta

router = APIRouter(prefix="/admin", tags=["Administration"])

def require_admin(current_user: User = Depends(get_current_user)):
    """Middleware pour vérifier que l'utilisateur est admin"""
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    return current_user

# ============= DASHBOARD ADMIN =============

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Statistiques globales de la plateforme"""

    # Utilisateurs
    total_users = db.query(User).count()
    users_actifs = db.query(User).filter(User.is_active == True).count()

    # Répartition par rôle
    users_by_role = {}
    for role in UserRole:
        count = db.query(User).filter(User.role == role).count()
        users_by_role[role.value] = count

    # Nouveaux utilisateurs (30 derniers jours)
    debut_mois = datetime.now() - timedelta(days=30)
    nouveaux_users = db.query(User).filter(User.created_at >= debut_mois).count()

    # Diagnostics
    total_diagnostics = db.query(Diagnostic).count()
    diagnostics_phyto = db.query(Diagnostic).filter(Diagnostic.type == "phytosanitaire").count()
    diagnostics_sol = db.query(Diagnostic).filter(Diagnostic.type == "pedologique").count()

    # Diagnostics ce mois
    diagnostics_mois = db.query(Diagnostic).filter(Diagnostic.created_at >= debut_mois).count()

    # Cours
    total_cours = db.query(Cours).count()
    cours_actifs = db.query(Cours).filter(Cours.statut == "publie").count()
    total_progressions = db.query(Progression).count()
    progressions_completes = db.query(Progression).filter(Progression.completed == True).count()

    # Marketplace
    total_annonces = db.query(Annonce).count()
    annonces_actives = db.query(Annonce).filter(Annonce.statut == "active").count()
    total_commandes = db.query(Commande).count()

    # Commandes ce mois
    commandes_mois = db.query(Commande).filter(Commande.created_at >= debut_mois).count()

    # Chiffre d'affaires estimé (somme des commandes)
    ca_total = db.query(func.sum(Commande.prix_total)).scalar() or 0

    # Notifications
    total_notifications = db.query(Notification).count()
    notifs_non_lues = db.query(Notification).filter(Notification.lu == False).count()

    return {
        "utilisateurs": {
            "total": total_users,
            "actifs": users_actifs,
            "inactifs": total_users - users_actifs,
            "nouveaux_ce_mois": nouveaux_users,
            "par_role": users_by_role,
        },
        "diagnostics": {
            "total": total_diagnostics,
            "phytosanitaires": diagnostics_phyto,
            "pedologiques": diagnostics_sol,
            "ce_mois": diagnostics_mois,
        },
        "formation": {
            "total_cours": total_cours,
            "cours_actifs": cours_actifs,
            "total_inscriptions": total_progressions,
            "cours_completes": progressions_completes,
            "taux_completion": round((progressions_completes / total_progressions * 100) if total_progressions > 0 else 0, 1),
        },
        "marketplace": {
            "total_annonces": total_annonces,
            "annonces_actives": annonces_actives,
            "total_commandes": total_commandes,
            "commandes_ce_mois": commandes_mois,
            "ca_total": float(ca_total),
        },
        "notifications": {
            "total": total_notifications,
            "non_lues": notifs_non_lues,
        }
    }

@router.get("/activite-recente")
def get_admin_activity(
    limit: int = 20,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Activité récente sur la plateforme"""

    activites = []

    # Derniers utilisateurs inscrits
    derniers_users = db.query(User).order_by(desc(User.created_at)).limit(5).all()
    for user in derniers_users:
        activites.append({
            "type": "user_registered",
            "icon": "user",
            "text": f"Nouvel utilisateur : {user.prenom} {user.nom}",
            "details": f"Rôle : {user.role}",
            "timestamp": user.created_at.isoformat(),
        })

    # Derniers diagnostics
    derniers_diags = db.query(Diagnostic).order_by(desc(Diagnostic.created_at)).limit(5).all()
    for diag in derniers_diags:
        activites.append({
            "type": "diagnostic",
            "icon": "microscope" if diag.type == "phytosanitaire" else "globe",
            "text": f"Diagnostic {diag.type}",
            "details": f"Culture : {diag.culture or diag.texture}",
            "timestamp": diag.created_at.isoformat(),
        })

    # Dernières commandes
    dernieres_commandes = db.query(Commande).order_by(desc(Commande.created_at)).limit(5).all()
    for cmd in dernieres_commandes:
        activites.append({
            "type": "commande",
            "icon": "shopping-bag",
            "text": f"Nouvelle commande",
            "details": f"Montant : {cmd.prix_total} FCFA",
            "timestamp": cmd.created_at.isoformat(),
        })

    # Trier par date décroissante
    activites.sort(key=lambda x: x["timestamp"], reverse=True)

    return activites[:limit]

@router.get("/stats/graphique")
def get_stats_graphique(
    periode: str = "30d",  # 7d, 30d, 90d, 1y
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Données pour les graphiques du dashboard"""

    # Calculer la période
    if periode == "7d":
        debut = datetime.now() - timedelta(days=7)
    elif periode == "90d":
        debut = datetime.now() - timedelta(days=90)
    elif periode == "1y":
        debut = datetime.now() - timedelta(days=365)
    else:  # 30d par défaut
        debut = datetime.now() - timedelta(days=30)

    # Inscriptions par jour
    inscriptions = []
    diagnostics = []
    commandes = []

    current = debut
    while current <= datetime.now():
        next_day = current + timedelta(days=1)

        nb_users = db.query(User).filter(
            User.created_at >= current,
            User.created_at < next_day
        ).count()

        nb_diags = db.query(Diagnostic).filter(
            Diagnostic.created_at >= current,
            Diagnostic.created_at < next_day
        ).count()

        nb_cmd = db.query(Commande).filter(
            Commande.created_at >= current,
            Commande.created_at < next_day
        ).count()

        inscriptions.append({
            "date": current.strftime("%Y-%m-%d"),
            "count": nb_users
        })
        diagnostics.append({
            "date": current.strftime("%Y-%m-%d"),
            "count": nb_diags
        })
        commandes.append({
            "date": current.strftime("%Y-%m-%d"),
            "count": nb_cmd
        })

        current = next_day

    return {
        "inscriptions": inscriptions,
        "diagnostics": diagnostics,
        "commandes": commandes,
    }

# ============= GESTION UTILISATEURS =============

@router.get("/users")
def list_all_users(
    skip: int = 0,
    limit: int = 50,
    role: str = None,
    search: str = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Liste tous les utilisateurs avec filtres"""
    query = db.query(User)

    if role:
        query = query.filter(User.role == role)

    if search:
        query = query.filter(
            (User.nom.contains(search)) |
            (User.prenom.contains(search)) |
            (User.email.contains(search))
        )

    total = query.count()
    users = query.order_by(desc(User.created_at)).offset(skip).limit(limit).all()

    return {
        "total": total,
        "users": users,
    }

@router.put("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Activer/désactiver un utilisateur"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    # Ne pas désactiver un admin
    if user.role == UserRole.admin:
        raise HTTPException(status_code=403, detail="Impossible de désactiver un administrateur")

    user.is_active = not user.is_active
    db.commit()

    return {
        "success": True,
        "message": f"Utilisateur {'activé' if user.is_active else 'désactivé'}",
        "is_active": user.is_active
    }

@router.put("/users/{user_id}/change-role")
def change_user_role(
    user_id: int,
    new_role: UserRole,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Changer le rôle d'un utilisateur"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    user.role = new_role
    db.commit()

    return {
        "success": True,
        "message": f"Rôle modifié en {new_role.value}",
        "role": new_role.value
    }

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Supprimer un utilisateur (DANGER - à utiliser avec précaution)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    # Ne pas supprimer un admin
    if user.role == UserRole.admin:
        raise HTTPException(status_code=403, detail="Impossible de supprimer un administrateur")

    # Supprimer l'utilisateur et toutes ses données associées
    # Note : Les contraintes de clés étrangères doivent être configurées avec CASCADE
    db.delete(user)
    db.commit()

    return {
        "success": True,
        "message": "Utilisateur supprimé"
    }

# ============= GESTION COURS =============

from app.schemas.formation import CoursCreate, CoursUpdate, ModuleCoursCreate
from app.models.formation import ModuleCours

@router.post("/cours")
def create_cours_admin(
    data: CoursCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Créer un nouveau cours"""
    cours = Cours(**data.model_dump())
    db.add(cours)
    db.commit()
    db.refresh(cours)
    return cours

@router.put("/cours/{cours_id}")
def update_cours_admin(
    cours_id: int,
    data: CoursUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Modifier un cours existant"""
    cours = db.query(Cours).filter(Cours.id == cours_id).first()
    if not cours:
        raise HTTPException(status_code=404, detail="Cours introuvable")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(cours, field, value)

    db.commit()
    db.refresh(cours)
    return cours

@router.delete("/cours/{cours_id}")
def delete_cours_admin(
    cours_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Supprimer un cours"""
    cours = db.query(Cours).filter(Cours.id == cours_id).first()
    if not cours:
        raise HTTPException(status_code=404, detail="Cours introuvable")

    db.delete(cours)
    db.commit()

    return {
        "success": True,
        "message": "Cours supprimé"
    }

@router.post("/cours/{cours_id}/modules")
def create_module_admin(
    cours_id: int,
    data: ModuleCoursCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Ajouter un module à un cours"""
    cours = db.query(Cours).filter(Cours.id == cours_id).first()
    if not cours:
        raise HTTPException(status_code=404, detail="Cours introuvable")

    module = ModuleCours(cours_id=cours_id, **data.model_dump())
    db.add(module)
    db.commit()
    db.refresh(module)
    return module

@router.put("/cours/{cours_id}/modules/{module_id}")
def update_module_admin(
    cours_id: int,
    module_id: int,
    data: ModuleCoursCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Modifier un module d'un cours"""
    module = db.query(ModuleCours).filter(
        ModuleCours.id == module_id,
        ModuleCours.cours_id == cours_id
    ).first()

    if not module:
        raise HTTPException(status_code=404, detail="Module introuvable")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(module, field, value)

    db.commit()
    db.refresh(module)
    return module

@router.delete("/modules/{module_id}")
def delete_module_admin(
    module_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Supprimer un module"""
    module = db.query(ModuleCours).filter(ModuleCours.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module introuvable")

    db.delete(module)
    db.commit()

    return {
        "success": True,
        "message": "Module supprimé"
    }

# ============= GESTION MARKETPLACE =============

from app.models.marketplace import StatutAnnonce

@router.get("/marketplace/annonces")
def list_all_annonces(
    skip: int = 0,
    limit: int = 50,
    statut: str = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Liste toutes les annonces"""
    query = db.query(Annonce)

    if statut:
        query = query.filter(Annonce.statut == statut)

    total = query.count()
    annonces = query.order_by(desc(Annonce.created_at)).offset(skip).limit(limit).all()

    return {
        "total": total,
        "annonces": annonces,
    }

@router.put("/marketplace/annonces/{annonce_id}/moderer")
def moderer_annonce(
    annonce_id: int,
    nouveau_statut: StatutAnnonce,
    motif: str = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Modérer une annonce (approuver, rejeter, archiver)"""
    annonce = db.query(Annonce).filter(Annonce.id == annonce_id).first()
    if not annonce:
        raise HTTPException(status_code=404, detail="Annonce introuvable")

    annonce.statut = nouveau_statut
    db.commit()

    # Optionnel : créer une notification pour le vendeur
    if motif:
        notif = Notification(
            user_id=annonce.vendeur_id,
            type="marketplace",
            titre=f"Annonce {nouveau_statut.value}",
            message=f"Votre annonce '{annonce.titre}' a été {nouveau_statut.value}. Motif : {motif}",
            lien=f"/dashboard/marketplace/mes-annonces"
        )
        db.add(notif)
        db.commit()

    return {
        "success": True,
        "message": f"Annonce {nouveau_statut.value}",
        "statut": nouveau_statut.value
    }

@router.delete("/marketplace/annonces/{annonce_id}")
def delete_annonce_admin(
    annonce_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Supprimer une annonce (modération)"""
    annonce = db.query(Annonce).filter(Annonce.id == annonce_id).first()
    if not annonce:
        raise HTTPException(status_code=404, detail="Annonce introuvable")

    db.delete(annonce)
    db.commit()

    return {
        "success": True,
        "message": "Annonce supprimée"
    }

@router.get("/marketplace/commandes")
def list_all_commandes(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Liste toutes les commandes"""
    total = db.query(Commande).count()
    commandes = db.query(Commande).order_by(desc(Commande.created_at)).offset(skip).limit(limit).all()

    return {
        "total": total,
        "commandes": commandes,
    }
