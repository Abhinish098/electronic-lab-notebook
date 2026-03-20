from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ExperimentBase(BaseModel):
    title: str
    description: Optional[str] = None
    author: str
    status: Optional[str] = "draft"


class ExperimentCreate(ExperimentBase):
    """Used for POST /experiments — body shape expected from the frontend."""
    pass


class ExperimentUpdate(BaseModel):
    """Used for PATCH — all fields optional."""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class ExperimentOut(ExperimentBase):
    """Returned to the frontend — includes DB-generated fields."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}  # Pydantic v2 (use orm_mode=True for v1)
