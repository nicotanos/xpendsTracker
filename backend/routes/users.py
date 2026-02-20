from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User, Person
from schemas import UserOut, UserMeOut, ProfileUpdate
from auth import require_admin, get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserMeOut)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return current_user


@router.put("/me/profile", response_model=UserMeOut)
def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.profile_person_id:
        person = db.query(Person).filter(Person.id == current_user.profile_person_id).first()
        if person:
            person.name = data.name
            person.type = data.type
            person.rut = data.rut
            db.commit()
            db.refresh(current_user)
            return current_user

    # No profile person yet — create one
    person = Person(name=data.name, type=data.type, rut=data.rut, user_id=current_user.id)
    db.add(person)
    db.flush()  # get person.id before commit
    current_user.profile_person_id = person.id
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(User).order_by(User.created_at).all()


@router.patch("/{user_id}/activate", response_model=UserOut)
def toggle_active(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/role", response_model=UserOut)
def toggle_role(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_admin = not user.is_admin
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
