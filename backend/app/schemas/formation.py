from pydantic import BaseModel
from typing import Optional

class CoursCreate(BaseModel):
    titre: str
    description: Optional[str] = None
    filiere: str
    niveau: str = "débutant"
    duree: Optional[int] = None
    image: Optional[str] = None
    is_active: bool = True
    ordre: int = 0

class CoursUpdate(BaseModel):
    titre: Optional[str] = None
    description: Optional[str] = None
    filiere: Optional[str] = None
    niveau: Optional[str] = None
    duree: Optional[int] = None
    image: Optional[str] = None
    is_active: Optional[bool] = None
    ordre: Optional[int] = None

class ModuleCoursCreate(BaseModel):
    titre: str
    contenu: Optional[str] = None
    video_url: Optional[str] = None
    ordre: int = 0
