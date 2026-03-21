from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


# ── Experiment ────────────────────────────────────────────────────────────────

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

    model_config = {"from_attributes": True}


# ── Notebook Pages ────────────────────────────────────────────────────────────

class NotebookPageBase(BaseModel):
    title: str
    page_order: Optional[int] = 0


class NotebookPageCreate(NotebookPageBase):
    """POST body to create a new page under an experiment."""
    content_html: Optional[str] = ""


class NotebookPageUpdate(BaseModel):
    """PATCH body — all fields optional."""
    title: Optional[str] = None
    content_html: Optional[str] = None
    page_order: Optional[int] = None


class NotebookPageSummary(NotebookPageBase):
    """Lightweight shape for the pages list — no content_html to keep payload small."""
    id: int
    experiment_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class NotebookPageDetail(NotebookPageSummary):
    """Full shape returned when user opens a specific page — includes HTML content."""
    content_html: Optional[str] = ""

    model_config = {"from_attributes": True}


# ── Text → Image ──────────────────────────────────────────────────────────────

class ImageGenerationRequest(BaseModel):
    prompt: str
    width: Optional[int] = 512
    height: Optional[int] = 512


class ImageGenerationOut(BaseModel):
    id: int
    prompt: str
    image_url: Optional[str] = None
    image_b64: Optional[str] = None   # base64 PNG, prefixed with data:image/png;base64,
    model_used: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}