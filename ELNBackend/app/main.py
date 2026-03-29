from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.router import experiment, notebook, image_gen

# Create all tables on startup
# NOTE: for new tables (notebook_pages, generated_images) also run:
#   alembic revision --autogenerate -m "add notebook pages and generated images"
#   alembic upgrade head
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Electronic Lab Notebook API",
    description="Backend API for the ELN React app",
    version="0.2.0",
)

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://Abhinish098.github.io",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "message": "ELN Backend is running", "version": "0.2.0"}


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(
    experiment.router,
    prefix="/api/experiment",
    tags=["experiments"],
)

app.include_router(
    notebook.router,
    prefix="/api/notebook",
    tags=["notebook-pages"],
)

app.include_router(
    image_gen.router,
    prefix="/api/images",
    tags=["text-to-image"],
)