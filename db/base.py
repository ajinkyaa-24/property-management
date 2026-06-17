import uuid
from datetime import datetime

# pyrefly: ignore [missing-import]
from sqlalchemy import Column, DateTime, func, Uuid

# pyrefly: ignore [missing-import]
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    deleted_at = Column(DateTime(timezone=True), nullable=True)
