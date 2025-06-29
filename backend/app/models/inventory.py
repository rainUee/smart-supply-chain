from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.db.database import Base


class TransactionType(enum.Enum):
    IN = "in"
    OUT = "out"
    ADJUSTMENT = "adjustment"
    TRANSFER = "transfer"


class InventoryItem(Base):
    __tablename__ = "inventory_items"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    
    # Location tracking
    warehouse_location = Column(String(100))
    shelf_location = Column(String(100))
    
    # Reference information
    reference_number = Column(String(100))  # PO number, SO number, etc.
    reference_type = Column(String(50))  # purchase_order, sales_order, adjustment
    
    # Cost tracking
    unit_cost = Column(Float)
    total_cost = Column(Float)
    
    # Quality and condition
    batch_number = Column(String(100))
    expiry_date = Column(DateTime)
    condition = Column(String(50), default="good")  # good, damaged, expired
    
    # Notes
    notes = Column(Text)
    
    # User who created the transaction
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="inventory_items")
    created_by_user = relationship("User", back_populates="inventory_items") 