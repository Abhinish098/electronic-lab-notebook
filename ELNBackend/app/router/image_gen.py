import os
import base64
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models import models
from app.schemas import schemas
from app.db.database import get_db

router = APIRouter()

# ── HF Inference free tier — Stable Diffusion XL ─────────────────────────────
# Free with any HF read token. No credits required.
# Add to .env: HF_API_KEY=hf_xxxxxxxxxxxxxxxxxxxx
HF_API_KEY = os.getenv("HF_API_KEY", "")
HF_MODEL   = "stabilityai/stable-diffusion-xl-base-1.0"
HF_API_URL = f"https://router.huggingface.co/hf-inference/models/{HF_MODEL}"

SCIENCE_PREFIX = (
    "Scientific illustration, high detail, medical visualization, "
    "clean white background, labeled diagram: "
)


async def _generate(prompt: str, width: int, height: int) -> bytes:
    if not HF_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="HF_API_KEY not set. Add HF_API_KEY=hf_xxxx to your .env file.",
        )

    headers = {
        "Authorization": f"Bearer {HF_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "inputs": SCIENCE_PREFIX + prompt,
        "parameters": {
            "width":               min(width, 1024),
            "height":              min(height, 1024),
            "num_inference_steps": 30,
            "guidance_scale":      7.5,
        },
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(HF_API_URL, headers=headers, json=payload)

    if response.status_code == 503:
        raise HTTPException(
            status_code=503,
            detail="Model is loading on HF servers (~20s). Please retry.",
        )
    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"HF API error: {response.text[:300]}",
        )

    return response.content


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post(
    "/generate",
    response_model=schemas.ImageGenerationOut,
    status_code=201,
    summary="Generate a medical/scientific image from a text prompt",
)
async def generate_image(
    payload: schemas.ImageGenerationRequest,
    db: Session = Depends(get_db),
):
    """
    Uses HF Inference free tier (SD-XL) to generate scientific images.
    Result stored as base64 in generated_images table.

    Example prompts:
    - "DNA double helix with labeled base pairs"
    - "CRISPR-Cas9 gene editing mechanism"
    - "Mitochondria cross-section with labeled components"
    - "Simple Protein Structure"
    """
    image_bytes = await _generate(payload.prompt, payload.width or 512, payload.height or 512)

    b64 = "data:image/png;base64," + base64.b64encode(image_bytes).decode("utf-8")

    record = models.GeneratedImage(
        prompt=payload.prompt,
        image_b64=b64,
        model_used=HF_MODEL,
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
def list_generated_images(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
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