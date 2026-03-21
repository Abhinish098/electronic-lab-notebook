from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.models import models
from app.schemas import schemas
from app.db.database import get_db

router = APIRouter()


@router.get(
    "/experiment/{experiment_id}/pages",
    response_model=List[schemas.NotebookPageSummary],
    summary="List all notebook pages for an experiment",
)
def list_pages(experiment_id: int, db: Session = Depends(get_db)):
    exp = db.query(models.Experiment).filter(models.Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    pages = (
        db.query(models.NotebookPage)
        .filter(models.NotebookPage.experiment_id == experiment_id)
        .order_by(models.NotebookPage.page_order.asc(), models.NotebookPage.created_at.asc())
        .all()
    )
    return pages


@router.get(
    "/pages/{page_id}",
    response_model=schemas.NotebookPageDetail,
    summary="Get full content of a specific notebook page",
)
def get_page(page_id: int, db: Session = Depends(get_db)):
    page = db.query(models.NotebookPage).filter(models.NotebookPage.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return schemas.NotebookPageDetail(
        id=page.id,
        experiment_id=page.experiment_id,
        title=page.title,
        page_order=page.page_order,
        created_at=page.created_at,
        updated_at=page.updated_at,
        content_html=page.content.content_html if page.content else "",
    )


@router.post(
    "/experiment/{experiment_id}/pages",
    response_model=schemas.NotebookPageDetail,
    status_code=201,
    summary="Create a new notebook page under an experiment",
)
def create_page(experiment_id: int, payload: schemas.NotebookPageCreate, db: Session = Depends(get_db)):
    exp = db.query(models.Experiment).filter(models.Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    # Step 1: create metadata row (no content_html here — wrong table)
    page = models.NotebookPage(
        experiment_id=experiment_id,
        title=payload.title,
        page_order=payload.page_order,
    )
    db.add(page)
    db.flush()  # get page.id without committing

    # Step 2: create content row linked by page_id
    content = models.PageContent(
        page_id=page.id,
        content_html=payload.content_html or "",
        content_type="html/v1",
    )
    db.add(content)
    db.commit()
    db.refresh(page)

    return schemas.NotebookPageDetail(
        id=page.id,
        experiment_id=page.experiment_id,
        title=page.title,
        page_order=page.page_order,
        created_at=page.created_at,
        updated_at=page.updated_at,
        content_html=content.content_html,
    )


@router.patch(
    "/pages/{page_id}",
    response_model=schemas.NotebookPageDetail,
    summary="Update a notebook page title and/or content",
)
def update_page(page_id: int, payload: schemas.NotebookPageUpdate, db: Session = Depends(get_db)):
    page = db.query(models.NotebookPage).filter(models.NotebookPage.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    if payload.title is not None:
        page.title = payload.title
    if payload.page_order is not None:
        page.page_order = payload.page_order

    if payload.content_html is not None:
        if page.content:
            page.content.content_html = payload.content_html
        else:
            db.add(models.PageContent(page_id=page.id, content_html=payload.content_html, content_type="html/v1"))

    db.commit()
    db.refresh(page)

    return schemas.NotebookPageDetail(
        id=page.id,
        experiment_id=page.experiment_id,
        title=page.title,
        page_order=page.page_order,
        created_at=page.created_at,
        updated_at=page.updated_at,
        content_html=page.content.content_html if page.content else "",
    )


@router.delete("/pages/{page_id}", status_code=204, summary="Delete a notebook page")
def delete_page(page_id: int, db: Session = Depends(get_db)):
    page = db.query(models.NotebookPage).filter(models.NotebookPage.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    db.delete(page)
    db.commit()