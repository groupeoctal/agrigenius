from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NotificationBase(BaseModel):
    titre: str
    message: str
    type: str
    lien: Optional[str] = None

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationOut(NotificationBase):
    id: int
    user_id: int
    lu: bool
    created_at: datetime

    class Config:
        from_attributes = True
