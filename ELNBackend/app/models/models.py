from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.db.database import Base


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    author = Column(String(100), nullable=False)
    status = Column(String(50), default="draft")  # draft | active | completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
