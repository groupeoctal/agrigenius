from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os, shutil, time, json
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.marketplace import Annonce, Commande, StatutAnnonce, TypeVente

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])

UPLOAD_DIR = "uploads/marketplace"
os.makedirs(UPLOAD_DIR, exist_ok=True)

CULTURES_DISPO = [
    "Cacao","Café","Banane plantain","Manioc","Maïs","Palmier à huile",
    "Tomate","Arachide","Soja","Ananas","Patate douce","Gombo","Piment",
    "Haricot","Niébé","Igname","Macabo","Plantain","Aubergine","Concombre"
]

# ─── ANNONCES ─────────────────────────────────────────────────────────────────

@router.get("/annonces")
def list_annonces(
    culture: Optional[str] = None,
    region: Optional[str] = None,
    type_vente: Optional[str] = None,
    prix_max: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Annonce).filter(Annonce.statut == StatutAnnonce.active)
    if culture:    query = query.filter(Annonce.culture.ilike(f"%{culture}%"))
    if region:     query = query.filter(Annonce.region == region)
    if type_vente: query = query.filter(Annonce.type_vente == type_vente)
    if prix_max:   query = query.filter(Annonce.prix <= prix_max)
    annonces = query.order_by(Annonce.created_at.desc()).all()

    return [_serialize_annonce(a, db) for a in annonces]

@router.get("/annonces/{annonce_id}")
def get_annonce(
    annonce_id: int,
    db: Session = Depends(get_db)
):
    a = db.query(Annonce).filter(Annonce.id == annonce_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Annonce introuvable")
    return _serialize_annonce(a, db, detail=True)

@router.post("/annonces")
async def create_annonce(
    titre: str = Form(...),
    culture: str = Form(...),
    quantite: float = Form(...),
    prix: float = Form(...),
    unite: str = Form("kg"),
    description: Optional[str] = Form(None),
    region: Optional[str] = Form(None),
    localite: Optional[str] = Form(None),
    type_vente: str = Form("recolte"),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    image_path = None
    if image and image.filename:
        ext = image.filename.split(".")[-1].lower()
        if ext in {"jpg", "jpeg", "png", "webp"}:
            filename = f"annonce_{current_user.id}_{int(time.time())}.{ext}"
            image_path = f"/uploads/marketplace/{filename}"
            with open(f"{UPLOAD_DIR}/{filename}", "wb") as f:
                shutil.copyfileobj(image.file, f)

    tv = TypeVente.recolte if type_vente == "recolte" else TypeVente.pre_recolte

    annonce = Annonce(
        vendeur_id=current_user.id,
        titre=titre, culture=culture,
        quantite=quantite, prix=prix, unite=unite,
        description=description, region=region,
        localite=localite, type_vente=tv,
        image=image_path,
    )
    db.add(annonce)
    db.commit()
    db.refresh(annonce)
    return _serialize_annonce(annonce, db)

@router.put("/annonces/{annonce_id}")
async def update_annonce(
    annonce_id: int,
    titre: Optional[str] = Form(None),
    quantite: Optional[float] = Form(None),
    prix: Optional[float] = Form(None),
    description: Optional[str] = Form(None),
    statut: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    a = db.query(Annonce).filter(Annonce.id == annonce_id, Annonce.vendeur_id == current_user.id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Annonce introuvable ou non autorisée")
    if titre:    a.titre = titre
    if quantite: a.quantite = quantite
    if prix:     a.prix = prix
    if description: a.description = description
    if statut:
        a.statut = StatutAnnonce(statut)
    db.commit()
    return {"message": "Annonce mise à jour"}

@router.delete("/annonces/{annonce_id}")
def delete_annonce(
    annonce_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    a = db.query(Annonce).filter(Annonce.id == annonce_id, Annonce.vendeur_id == current_user.id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Annonce introuvable")
    a.statut = StatutAnnonce.archivee
    db.commit()
    return {"message": "Annonce archivée"}

@router.get("/mes-annonces")
def mes_annonces(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    annonces = db.query(Annonce).filter(
        Annonce.vendeur_id == current_user.id
    ).order_by(Annonce.created_at.desc()).all()
    return [_serialize_annonce(a, db) for a in annonces]

# ─── COMMANDES ────────────────────────────────────────────────────────────────

@router.post("/commandes")
def passer_commande(
    annonce_id: int = Form(...),
    quantite: float = Form(...),
    message: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    annonce = db.query(Annonce).filter(Annonce.id == annonce_id).first()
    if not annonce or annonce.statut != StatutAnnonce.active:
        raise HTTPException(status_code=404, detail="Annonce non disponible")
    if annonce.vendeur_id == current_user.id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas commander votre propre annonce")
    if quantite > annonce.quantite:
        raise HTTPException(status_code=400, detail=f"Quantité demandée ({quantite} {annonce.unite}) supérieure au stock ({annonce.quantite} {annonce.unite})")

    commande = Commande(
        annonce_id=annonce_id,
        acheteur_id=current_user.id,
        quantite=quantite,
        prix_total=round(quantite * annonce.prix, 0),
        message=message,
    )
    db.add(commande)
    db.commit()
    db.refresh(commande)
    return {
        "id": commande.id,
        "prix_total": commande.prix_total,
        "message": "Votre demande a été envoyée au vendeur avec succès !"
    }

@router.get("/mes-commandes")
def mes_commandes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    commandes = db.query(Commande).filter(
        Commande.acheteur_id == current_user.id
    ).order_by(Commande.created_at.desc()).all()
    return [_serialize_commande(c) for c in commandes]

@router.get("/commandes-recues")
def commandes_recues(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    annonces_ids = [a.id for a in db.query(Annonce).filter(Annonce.vendeur_id == current_user.id).all()]
    commandes = db.query(Commande).filter(
        Commande.annonce_id.in_(annonces_ids)
    ).order_by(Commande.created_at.desc()).all()
    return [_serialize_commande(c) for c in commandes]

@router.put("/commandes/{commande_id}/statut")
def update_commande_statut(
    commande_id: int,
    statut: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    c = db.query(Commande).filter(Commande.id == commande_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    c.statut = statut
    db.commit()
    return {"message": "Statut mis à jour"}

# ─── STATS ────────────────────────────────────────────────────────────────────

@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    mes_annonces = db.query(Annonce).filter(Annonce.vendeur_id == current_user.id).all()
    annonces_actives = [a for a in mes_annonces if a.statut == StatutAnnonce.active]

    annonces_ids = [a.id for a in mes_annonces]
    commandes = db.query(Commande).filter(Commande.annonce_id.in_(annonces_ids)).all() if annonces_ids else []
    ca_total = sum(c.prix_total for c in commandes if c.statut == "acceptee")

    return {
        "nb_annonces_actives": len(annonces_actives),
        "nb_annonces_total": len(mes_annonces),
        "nb_commandes_recues": len(commandes),
        "nb_commandes_en_attente": len([c for c in commandes if c.statut == "en_attente"]),
        "ca_total": ca_total,
    }

@router.get("/cultures")
def get_cultures():
    return CULTURES_DISPO

# ─── HELPERS ──────────────────────────────────────────────────────────────────

def _serialize_annonce(a: Annonce, db: Session, detail: bool = False) -> dict:
    nb_commandes = db.query(Commande).filter(Commande.annonce_id == a.id).count()
    vendeur = a.vendeur
    data = {
        "id": a.id, "titre": a.titre, "description": a.description,
        "culture": a.culture, "quantite": a.quantite, "unite": a.unite,
        "prix": a.prix, "region": a.region, "localite": a.localite,
        "type_vente": a.type_vente.value if a.type_vente else "recolte",
        "statut": a.statut.value if a.statut else "active",
        "image": a.image, "created_at": a.created_at.isoformat() if a.created_at else None,
        "nb_commandes": nb_commandes,
        "vendeur": {
            "id": vendeur.id, "nom": vendeur.nom, "prenom": vendeur.prenom,
            "region": vendeur.region, "telephone": vendeur.telephone,
        } if vendeur else None,
    }
    return data

def _serialize_commande(c: Commande) -> dict:
    return {
        "id": c.id, "annonce_id": c.annonce_id,
        "quantite": c.quantite, "prix_total": c.prix_total,
        "statut": c.statut, "message": c.message,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }
