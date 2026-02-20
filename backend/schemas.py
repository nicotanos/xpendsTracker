from pydantic import BaseModel
from typing import Optional
import datetime


# ── Auth ──────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── Persons ────────────────────────────────────────────
PERSON_TYPES = ["Individual", "Company", "Government"]


class PersonCreate(BaseModel):
    name: str
    type: str
    rut: str


class PersonOut(PersonCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True


# ── Users ──────────────────────────────────────────────
class UserOut(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool
    is_active: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class UserMeOut(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool
    profile_person_id: Optional[int] = None
    profile_person: Optional[PersonOut] = None

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    name: str
    type: str
    rut: str


# ── Expenses ──────────────────────────────────────────
class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    date: datetime.date
    note: Optional[str] = None
    provider_id: int
    recipient_id: int


class ExpenseOut(BaseModel):
    id: int
    user_id: int
    title: str
    amount: float
    category: str
    date: datetime.date
    note: Optional[str] = None
    provider_id: int
    recipient_id: int
    provider: PersonOut
    recipient: PersonOut

    class Config:
        from_attributes = True


# ── Categories ─────────────────────────────────────────
class CategoryCreate(BaseModel):
    name: str
    color: str = "#6366f1"


class CategoryOut(CategoryCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True
