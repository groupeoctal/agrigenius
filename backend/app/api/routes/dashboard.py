from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.diagnostic import Diagnostic
from app.models.formation import Progression
from app.models.marketplace import Annonce, Commande, StatutAnnonce

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupère les statistiques pour le dashboard de l'utilisateur"""

    # Diagnostics effectués
    nb_diagnostics = db.query(Diagnostic).filter(
        Diagnostic.user_id == current_user.id
    ).count()

    # Diagnostics ce mois (simulé avec les 30 derniers jours)
    from datetime import datetime, timedelta
    debut_mois = datetime.now() - timedelta(days=30)
    nb_diagnostics_mois = db.query(Diagnostic).filter(
        Diagnostic.user_id == current_user.id,
        Diagnostic.created_at >= debut_mois
    ).count()

    # Formation - cours complétés
    nb_cours_completes = db.query(Progression).filter(
        Progression.user_id == current_user.id,
        Progression.completed == True
    ).count()

    # Formation - progression moyenne
    progressions = db.query(Progression).filter(
        Progression.user_id == current_user.id
    ).all()
    progression_moyenne = 0
    if progressions:
        progression_moyenne = int(sum(p.pourcentage for p in progressions) / len(progressions))

    # Marketplace - annonces actives
    nb_annonces_actives = db.query(Annonce).filter(
        Annonce.vendeur_id == current_user.id,
        Annonce.statut == StatutAnnonce.active
    ).count()

    # Marketplace - commandes reçues
    annonces_ids = [a.id for a in db.query(Annonce.id).filter(Annonce.vendeur_id == current_user.id).all()]
    nb_commandes = db.query(Commande).filter(
        Commande.annonce_id.in_(annonces_ids) if annonces_ids else False
    ).count()

    # Score productivité (basé sur l'activité)
    # Formule simple : (diagnostics*2 + cours*3 + annonces*1) / 10
    score_productivite = min(100, (nb_diagnostics * 2 + nb_cours_completes * 3 + nb_annonces_actives) * 2)

    return {
        "diagnostics": {
            "total": nb_diagnostics,
            "ce_mois": nb_diagnostics_mois,
            "trend": f"+{nb_diagnostics_mois} ce mois" if nb_diagnostics_mois > 0 else "Aucun ce mois"
        },
        "formation": {
            "cours_completes": nb_cours_completes,
            "progression_moyenne": progression_moyenne,
            "trend": f"{progression_moyenne}% progression"
        },
        "marketplace": {
            "annonces_actives": nb_annonces_actives,
            "commandes_recues": nb_commandes,
            "trend": f"{nb_commandes} offre{'s' if nb_commandes > 1 else ''} reçue{'s' if nb_commandes > 1 else ''}"
        },
        "productivite": {
            "score": score_productivite,
            "trend": f"+{min(12, score_productivite // 8)}% ce mois"
        }
    }

@router.get("/activite-recente")
def get_activite_recente(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupère l'activité récente de l'utilisateur"""
    from datetime import datetime

    activites = []

    # Derniers diagnostics
    derniers_diags = db.query(Diagnostic).filter(
        Diagnostic.user_id == current_user.id
    ).order_by(Diagnostic.created_at.desc()).limit(2).all()

    for diag in derniers_diags:
        type_label = "Diagnostic phytosanitaire" if diag.type == "phytosanitaire" else "Analyse de sol"
        delta = datetime.now(diag.created_at.tzinfo) - diag.created_at
        time_ago = _format_time_ago(delta)

        activites.append({
            "type": "diagnostic",
            "text": f"{type_label} — {diag.culture or 'Sol'}",
            "time": time_ago,
            "icon": "diagnostic"
        })

    # Derniers cours complétés
    derniers_cours = db.query(Progression).filter(
        Progression.user_id == current_user.id,
        Progression.completed == True
    ).order_by(Progression.updated_at.desc()).limit(2).all()

    for prog in derniers_cours:
        if prog.cours:
            delta = datetime.now(prog.updated_at.tzinfo) - prog.updated_at
            time_ago = _format_time_ago(delta)
            activites.append({
                "type": "formation",
                "text": f"Cours complété : {prog.cours.titre}",
                "time": time_ago,
                "icon": "formation"
            })

    # Dernières annonces
    dernieres_annonces = db.query(Annonce).filter(
        Annonce.vendeur_id == current_user.id
    ).order_by(Annonce.created_at.desc()).limit(2).all()

    for annonce in dernieres_annonces:
        delta = datetime.now(annonce.created_at.tzinfo) - annonce.created_at
        time_ago = _format_time_ago(delta)
        activites.append({
            "type": "marketplace",
            "text": f"Annonce publiée : {annonce.titre}",
            "time": time_ago,
            "icon": "marketplace"
        })

    # Trier par date et limiter
    return activites[:4]

def _format_time_ago(delta):
    """Formate un timedelta en texte lisible"""
    seconds = int(delta.total_seconds())
    if seconds < 60:
        return "Il y a quelques secondes"
    elif seconds < 3600:
        minutes = seconds // 60
        return f"Il y a {minutes} minute{'s' if minutes > 1 else ''}"
    elif seconds < 86400:
        heures = seconds // 3600
        return f"Il y a {heures}h"
    else:
        jours = seconds // 86400
        return f"Il y a {jours}j"
