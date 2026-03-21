from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Experiment(Base):
    __tablename__ = "experiments"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    author      = Column(String(100), nullable=False)
    status      = Column(String(50), default="draft")
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())

    pages = relationship(
        "NotebookPage",
        back_populates="experiment",
        cascade="all, delete-orphan",
        order_by="NotebookPage.page_order",
    )


class NotebookPage(Base):
    __tablename__ = "notebook_pages"

    id            = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id", ondelete="CASCADE"), nullable=False, index=True)
    title         = Column(String(255), nullable=False, default="Untitled Page")
    page_order    = Column(Integer, default=0, nullable=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())

    experiment  = relationship("Experiment", back_populates="pages")
    content     = relationship("PageContent", back_populates="page", uselist=False, cascade="all, delete-orphan")
    attachments = relationship("PageAttachment", back_populates="page", cascade="all, delete-orphan")


class PageContent(Base):
    __tablename__ = "page_contents"

    page_id      = Column(Integer, ForeignKey("notebook_pages.id", ondelete="CASCADE"), primary_key=True)
    content_html = Column(Text, nullable=True, default="")
    content_type = Column(String(50), nullable=False, default="html/v1")
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())

    page = relationship("NotebookPage", back_populates="content")


class PageAttachment(Base):
    __tablename__ = "page_attachments"

    id          = Column(Integer, primary_key=True, index=True)
    page_id     = Column(Integer, ForeignKey("notebook_pages.id", ondelete="CASCADE"), nullable=False, index=True)
    storage_url = Column(Text, nullable=False)
    file_name   = Column(String(255), nullable=True)
    mime_type   = Column(String(100), nullable=True, default="image/png")
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    page = relationship("NotebookPage", back_populates="attachments")


class GeneratedImage(Base):
    __tablename__ = "generated_images"

    id         = Column(Integer, primary_key=True, index=True)
    prompt     = Column(Text, nullable=False)
    image_b64  = Column(Text, nullable=True)
    model_used = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())