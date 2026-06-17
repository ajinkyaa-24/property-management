from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from db.base import Base

class Tenant(Base):
    __tablename__ = "tenants"

    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String, nullable=True)

    agreements = relationship("RentalAgreement", back_populates="tenant")
