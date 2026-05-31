from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import os, shutil, time
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.formation import Cours, ModuleCours, Progression
from app.models.quiz import QuizQuestion, QuizResultat, Badge

router = APIRouter(prefix="/formation", tags=["Formation"])

UPLOAD_DIR = "uploads/formation"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ─── COURS ────────────────────────────────────────────────────────────────────

@router.get("/cours")
def list_cours(
    filiere: Optional[str] = None,
    niveau: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Cours).filter(Cours.is_active == True)
    if filiere: query = query.filter(Cours.filiere == filiere)
    if niveau:  query = query.filter(Cours.niveau == niveau)
    cours = query.order_by(Cours.ordre).all()
    return [
        {
            "id": c.id, "titre": c.titre, "description": c.description,
            "filiere": c.filiere, "niveau": c.niveau, "duree": c.duree,
            "image": c.image, "ordre": c.ordre,
            "nb_modules": len(c.modules),
            "nb_questions": len(c.questions),
        }
        for c in cours
    ]

@router.get("/cours/{cours_id}")
def get_cours(
    cours_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cours = db.query(Cours).filter(Cours.id == cours_id, Cours.is_active == True).first()
    if not cours:
        raise HTTPException(status_code=404, detail="Cours introuvable")

    progression = db.query(Progression).filter(
        Progression.user_id == current_user.id,
        Progression.cours_id == cours_id
    ).first()

    quiz_resultat = db.query(QuizResultat).filter(
        QuizResultat.user_id == current_user.id,
        QuizResultat.cours_id == cours_id
    ).order_by(QuizResultat.created_at.desc()).first()

    return {
        "id": cours.id, "titre": cours.titre, "description": cours.description,
        "filiere": cours.filiere, "niveau": cours.niveau, "duree": cours.duree,
        "image": cours.image,
        "modules": [
            {
                "id": m.id, "titre": m.titre, "contenu": m.contenu,
                "video_url": m.video_url, "ordre": m.ordre
            }
            for m in sorted(cours.modules, key=lambda x: x.ordre)
        ],
        "nb_questions": len(cours.questions),
        "progression": {
            "module_actuel": progression.module_actuel if progression else 0,
            "pourcentage": progression.pourcentage if progression else 0.0,
            "completed": progression.completed if progression else False,
        },
        "quiz_resultat": {
            "score": quiz_resultat.score,
            "passed": quiz_resultat.passed,
            "nb_correct": quiz_resultat.nb_correct,
            "nb_total": quiz_resultat.nb_total,
        } if quiz_resultat else None,
    }

@router.post("/cours/{cours_id}/progression")
def update_progression(
    cours_id: int,
    module_actuel: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cours = db.query(Cours).filter(Cours.id == cours_id).first()
    if not cours:
        raise HTTPException(status_code=404, detail="Cours introuvable")

    nb_modules = len(cours.modules)
    pourcentage = round((module_actuel / nb_modules) * 100, 1) if nb_modules > 0 else 0

    prog = db.query(Progression).filter(
        Progression.user_id == current_user.id,
        Progression.cours_id == cours_id
    ).first()

    if prog:
        prog.module_actuel = max(prog.module_actuel, module_actuel)
        prog.pourcentage = round((prog.module_actuel / nb_modules) * 100, 1)
        prog.completed = prog.module_actuel >= nb_modules
    else:
        prog = Progression(
            user_id=current_user.id, cours_id=cours_id,
            module_actuel=module_actuel, pourcentage=pourcentage,
            completed=module_actuel >= nb_modules
        )
        db.add(prog)

    db.commit()
    return {"message": "Progression mise à jour", "pourcentage": prog.pourcentage}

@router.get("/mes-progressions")
def mes_progressions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    progs = db.query(Progression).filter(Progression.user_id == current_user.id).all()
    return [
        {
            "cours_id": p.cours_id, "module_actuel": p.module_actuel,
            "pourcentage": p.pourcentage, "completed": p.completed,
        }
        for p in progs
    ]

# ─── QUIZ ─────────────────────────────────────────────────────────────────────

@router.get("/cours/{cours_id}/quiz")
def get_quiz(
    cours_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    questions = db.query(QuizQuestion).filter(
        QuizQuestion.cours_id == cours_id
    ).order_by(QuizQuestion.ordre).all()

    if not questions:
        raise HTTPException(status_code=404, detail="Aucune question pour ce cours")

    # On ne renvoie PAS la bonne réponse au frontend
    return [
        {
            "id": q.id, "question": q.question, "ordre": q.ordre,
            "option_a": q.option_a, "option_b": q.option_b,
            "option_c": q.option_c, "option_d": q.option_d,
        }
        for q in questions
    ]

@router.post("/cours/{cours_id}/quiz/soumettre")
def soumettre_quiz(
    cours_id: int,
    reponses: dict,   # {"question_id": "a", ...}
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    questions = db.query(QuizQuestion).filter(QuizQuestion.cours_id == cours_id).all()
    if not questions:
        raise HTTPException(status_code=404, detail="Quiz introuvable")

    nb_correct = 0
    corrections = []

    for q in questions:
        reponse_user = reponses.get(str(q.id), "").lower()
        correct = reponse_user == q.bonne_reponse.lower()
        if correct: nb_correct += 1
        corrections.append({
            "question_id": q.id,
            "question": q.question,
            "reponse_user": reponse_user,
            "bonne_reponse": q.bonne_reponse,
            "correct": correct,
            "explication": q.explication,
        })

    score = round((nb_correct / len(questions)) * 100, 1)
    passed = score >= 70

    # Sauvegarder le résultat
    resultat = QuizResultat(
        user_id=current_user.id, cours_id=cours_id,
        score=score, nb_correct=nb_correct,
        nb_total=len(questions), passed=passed
    )
    db.add(resultat)

    # Attribuer badge si réussi
    badge_data = None
    if passed:
        cours = db.query(Cours).filter(Cours.id == cours_id).first()
        existing_badge = db.query(Badge).filter(
            Badge.user_id == current_user.id,
            Badge.cours_id == cours_id,
            Badge.type == "quiz_reussi"
        ).first()

        if not existing_badge:
            badge = Badge(
                user_id=current_user.id,
                cours_id=cours_id,
                type="quiz_reussi",
                titre=f"Quiz validé — {cours.titre if cours else 'Cours'}",
                description=f"Score obtenu : {score}%",
                emoji="🏆" if score >= 90 else "🎓" if score >= 80 else "✅",
            )
            db.add(badge)
            badge_data = {
                "titre": badge.titre,
                "emoji": badge.emoji,
                "score": score,
            }

    db.commit()

    return {
        "score": score,
        "passed": passed,
        "nb_correct": nb_correct,
        "nb_total": len(questions),
        "corrections": corrections,
        "badge": badge_data,
    }

# ─── BADGES ───────────────────────────────────────────────────────────────────

@router.get("/mes-badges")
def mes_badges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    badges = db.query(Badge).filter(Badge.user_id == current_user.id).order_by(Badge.created_at.desc()).all()
    return [
        {
            "id": b.id, "type": b.type, "titre": b.titre,
            "description": b.description, "emoji": b.emoji,
            "cours_id": b.cours_id, "created_at": b.created_at,
        }
        for b in badges
    ]
