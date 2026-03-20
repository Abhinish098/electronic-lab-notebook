from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.models import models
from app.schemas import schemas
from app.db.database import get_db

router = APIRouter()


@router.get("/", response_model=List[schemas.ExperimentOut])
def list_experiments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Return all experiments, newest first."""
    return (
        db.query(models.Experiment)
        .order_by(models.Experiment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{experiment_id}", response_model=schemas.ExperimentOut)
def get_experiment(experiment_id: int, db: Session = Depends(get_db)):
    """Return a single experiment by ID."""
    exp = db.query(models.Experiment).filter(models.Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return exp


@router.post("/", response_model=schemas.ExperimentOut, status_code=201)
def create_experiment(payload: schemas.ExperimentCreate, db: Session = Depends(get_db)):
    """Create a new experiment record."""
    exp = models.Experiment(**payload.model_dump())
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


@router.patch("/{experiment_id}", response_model=schemas.ExperimentOut)
def update_experiment(
    experiment_id: int, payload: schemas.ExperimentUpdate, db: Session = Depends(get_db)
):
    """Partially update an experiment."""
    exp = db.query(models.Experiment).filter(models.Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(exp, field, value)
    db.commit()
    db.refresh(exp)
    return exp


@router.delete("/{experiment_id}", status_code=204)
def delete_experiment(experiment_id: int, db: Session = Depends(get_db)):
    """Delete an experiment."""
    exp = db.query(models.Experiment).filter(models.Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    db.delete(exp)
    db.commit()
