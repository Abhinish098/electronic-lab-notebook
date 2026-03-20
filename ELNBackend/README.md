# ELNBackend — FastAPI + PostgreSQL

Backend for the Electronic Lab Notebook React app.

## Setup

```bash
# 1. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy and fill in your env
cp .env.example .env
# Edit .env: set DATABASE_URL=postgresql://user:pass@localhost:5432/elndb

# 4. Create the database in psql
createdb elndb

# 5. Initialise Alembic (first time only)
alembic init alembic
# In alembic/env.py, replace:
#   target_metadata = None
# with:
#   from app.models import Base
#   target_metadata = Base.metadata
# Also set sqlalchemy.url in alembic.ini to use env var or hardcode for local dev.

# 6. Generate and run the first migration
alembic revision --autogenerate -m "initial tables"
alembic upgrade head

# 7. Start the dev server
python run.py
# API docs auto-generated at: http://localhost:8000/docs
```

## Project structure

```
app/
  main.py          FastAPI app + CORS middleware
  database.py      SQLAlchemy engine, session, Base
  models.py        Table definitions (ORM models)
  schemas.py       Pydantic request/response shapes
  routers/
    experiments.py GET, POST, PATCH, DELETE for experiments
```

## Connecting the React frontend

1. Add `elnApi.js` to `ElectronicLabNotebook/src/api/`
2. Add to `ElectronicLabNotebook/.env.local`:
   ```
   VITE_API_URL=http://localhost:8000
   ```
3. For the GitHub Pages deployment add a GitHub Actions secret:
   `VITE_API_URL=https://your-deployed-backend.com`
   and pass it as an env var in your existing build workflow step.

## Adding a new resource

1. Add a model class to `app/models.py`
2. Add Pydantic schemas to `app/schemas.py`
3. Create `app/routers/your_resource.py`
4. Register the router in `app/main.py`:
   ```python
   from app.routers import your_resource
   app.include_router(your_resource.router, prefix="/api/your-resource", tags=["your-resource"])
   ```
5. Run `alembic revision --autogenerate -m "add your_resource"` then `alembic upgrade head`
