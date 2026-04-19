import os
import base64
import random
import urllib.parse
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models import models
from app.schemas import schemas
from app.db.database import get_db

router = APIRouter()

MODEL = os.getenv("MODEL", "pollinations/flux")
POLLINATIONS_BASE = os.getenv("POLLINATIONS_BASE", "https://api.pollinations.ai/generate?prompt={prompt}&w={w}&h={h}&seed={seed}&model=" + MODEL)
SCIENCE_PREFIX = (
    "Scientific illustration, high detail, medical visualization, "
    "clean white background, labeled diagram: "
)


async def _generate(prompt: str, width: int, height: int, seed: int) -> bytes:
    full_prompt  = SCIENCE_PREFIX + prompt
    encoded      = urllib.parse.quote(full_prompt)
    if POLLINATIONS_BASE is None:
        raise HTTPException(status_code=500, detail="POLLINATIONS_BASE environment variable not set")
    url          = POLLINATIONS_BASE.format(
        prompt=encoded,
        w=min(width, 512),
        h=min(height, 512),
        seed=seed,
    )

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.get(url, follow_redirects=True)

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Pollinations error: {response.text[:200]}",
        )

    return response.content


@router.post(
    "/generate",
    response_model=schemas.ImageGenerationOut,
    status_code=201,
    summary="Generate a medical/scientific image (Pollinations FLUX — free, no key)",
)
async def generate_image(
    payload: schemas.ImageGenerationRequest,
    db: Session = Depends(get_db),
):
    seed = payload.seed if payload.seed is not None else random.randint(0, 2**31 - 1)

    image_bytes = await _generate(
        payload.prompt,
        payload.width or 1024,
        payload.height or 1024,
        seed,
    )

    b64 = "data:image/jpeg;base64," + base64.b64encode(image_bytes).decode("utf-8")

    record = models.GeneratedImage(
        prompt=payload.prompt,
        image_b64=b64,
        model_used=MODEL,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get(
    "/history",
    response_model=list[schemas.ImageGenerationOut],
    summary="List previously generated images, newest first",
)
def list_generated_images(
    skip: int = 0, limit: int = 20, db: Session = Depends(get_db)
):
    return (
        db.query(models.GeneratedImage)
        .order_by(models.GeneratedImage.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get(
    "/{image_id}",
    response_model=schemas.ImageGenerationOut,
    summary="Get a specific generated image by ID",
)
def get_generated_image(image_id: int, db: Session = Depends(get_db)):
    img = db.query(models.GeneratedImage).filter(
        models.GeneratedImage.id == image_id
    ).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    return img