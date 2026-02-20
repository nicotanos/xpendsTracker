from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Person, User
from schemas import PersonCreate, PersonOut
from auth import get_current_user

router = APIRouter(prefix="/persons", tags=["persons"])


@router.get("", response_model=List[PersonOut])
def get_persons(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Person).filter(Person.user_id == current_user.id).order_by(Person.name).all()


@router.post("", response_model=PersonOut, status_code=201)
def create_person(person: PersonCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_person = Person(**person.model_dump(), user_id=current_user.id)
    db.add(db_person)
    db.commit()
    db.refresh(db_person)
    return db_person


@router.put("/{person_id}", response_model=PersonOut)
def update_person(person_id: int, person: PersonCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_person = db.query(Person).filter(Person.id == person_id).first()
    if not db_person:
        raise HTTPException(status_code=404, detail="Person not found")
    if db_person.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    for key, value in person.model_dump().items():
        setattr(db_person, key, value)
    db.commit()
    db.refresh(db_person)
    return db_person


@router.delete("/{person_id}", status_code=204)
def delete_person(person_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_person = db.query(Person).filter(Person.id == person_id).first()
    if not db_person:
        raise HTTPException(status_code=404, detail="Person not found")
    if db_person.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(db_person)
    db.commit()
