from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.router import experiment, notebook, image_gen

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Electronic Lab Notebook API",
    description="Backend API for the ELN React app",
    version="0.2.0",
)

# CORS must be added FIRST before any routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://abhinish098.github.io",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "message": "ELN Backend is running", "version": "0.2.0"}

app.include_router(experiment.router, prefix="/api/experiment", tags=["experiments"])
app.include_router(notebook.router,   prefix="/api/notebook",   tags=["notebook-pages"])
app.include_router(image_gen.router,  prefix="/api/images",     tags=["text-to-image"])