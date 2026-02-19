from pydantic import BaseModel
from typing import Optional
import datetime


# ── Auth ──────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool
    is_active: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── Expenses ──────────────────────────────────────────
class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    date: datetime.date
    note: Optional[str] = None


class ExpenseOut(ExpenseCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True
