from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.router import experiment

# Create all tables on startup (use Alembic in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Electronic Lab Notebook API",
    description="Backend API for the ELN React app",
    version="0.1.0",
)

# Allow your GitHub Pages frontend (and local dev) to reach the API
origins = [
    "http://localhost:5173",          # Vite dev server
    "http://localhost:3000",
    "https://<YOUR_GITHUB_USERNAME>.github.io",  # replace this
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
    return {"status": "ok", "message": "ELN Backend is running"}

app.include_router(experiment.router, prefix="/api/experiment", tags=["experiment"])



