from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import json, os, shutil, time
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.diagnostic import Diagnostic, DiagnosticType
from app.schemas.diagnostic import DiagnosticOut
from app.services.ia_phyto import analyser_image_plante
from app.services.ia_pedologie import analyser_sol

router = APIRouter(prefix="/diagnostics", tags=["Diagnostics"])

UPLOAD_DIR = "uploads/diagnostics"
os.makedirs(UPLOAD_DIR, exist_ok=True)

EXTENSIONS_AUTORISEES = {"jpg", "jpeg", "png", "webp", "bmp"}

@router.post("/phyto", response_model=DiagnosticOut)
async def diagnostic_phyto(
    culture: str = Form(...),
    region: Optional[str] = Form(None),
    parcelle: Optional[str] = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Vérifier l'extension
    ext = image.filename.split(".")[-1].lower() if image.filename else "jpg"
    if ext not in EXTENSIONS_AUTORISEES:
        raise HTTPException(status_code=400, detail=f"Format non supporté. Utilisez : {', '.join(EXTENSIONS_AUTORISEES)}")

    # Sauvegarder l'image
    filename = f"phyto_{current_user.id}_{int(time.time())}.{ext}"
    filepath = f"{UPLOAD_DIR}/{filename}"
    with open(filepath, "wb") as f:
        shutil.copyfileobj(image.file, f)

    # Analyse IA
    resultat = analyser_image_plante(filepath, culture)

    # Sérialiser les recommandations
    recommandations_json = json.dumps({
        "maladie": resultat["maladie"],
        "gravite": resultat["gravite"],
        "description": resultat["description"],
        "recommandations": resultat["recommandations"],
        "traitement_local": resultat["traitement_local"],
    }, ensure_ascii=False)

    diag = Diagnostic(
        user_id=current_user.id,
        type=DiagnosticType.phytosanitaire,
        culture=culture,
        image_path=f"/uploads/diagnostics/{filename}",
        maladie=resultat["maladie"],
        confiance=resultat["confiance"],
        recommandations=recommandations_json,
        region=region,
        parcelle=parcelle,
    )
    db.add(diag)
    db.commit()
    db.refresh(diag)
    return diag

@router.post("/pedologie", response_model=DiagnosticOut)
def diagnostic_pedologie(
    ph: float = Form(...),
    texture: str = Form(...),
    humidite: str = Form(...),
    drainage: str = Form(...),
    region: Optional[str] = Form(None),
    parcelle: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Analyse IA pédologique
    resultat_sol = analyser_sol(ph, texture, humidite, drainage, region or "")

    recommandations = json.dumps(resultat_sol, ensure_ascii=False)

    diag = Diagnostic(
        user_id=current_user.id,
        type=DiagnosticType.pedologique,
        ph=ph,
        texture=texture,
        humidite=humidite,
        drainage=drainage,
        recommandations=recommandations,
        region=region,
        parcelle=parcelle,
    )
    db.add(diag)
    db.commit()
    db.refresh(diag)
    return diag

@router.get("/", response_model=List[DiagnosticOut])
def get_mes_diagnostics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Diagnostic).filter(
        Diagnostic.user_id == current_user.id
    ).order_by(Diagnostic.created_at.desc()).all()

@router.get("/{diag_id}", response_model=DiagnosticOut)
def get_diagnostic(
    diag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    diag = db.query(Diagnostic).filter(
        Diagnostic.id == diag_id,
        Diagnostic.user_id == current_user.id
    ).first()
    if not diag:
        raise HTTPException(status_code=404, detail="Diagnostic introuvable")
    return diag
