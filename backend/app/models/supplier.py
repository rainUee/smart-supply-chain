from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    contact_person = Column(String(200))
    email = Column(String(255), index=True)
    phone = Column(String(20))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100))
    postal_code = Column(String(20))
    
    # Business information
    tax_id = Column(String(100))
    payment_terms = Column(String(100))
    credit_limit = Column(Float, default=0.0)
    rating = Column(Float, default=0.0)  # 1-5 rating
    
    # Status
    is_active = Column(Boolean, default=True)
    is_preferred = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    products = relationship("Product", back_populates="supplier")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier") 