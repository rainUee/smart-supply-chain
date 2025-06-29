from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.db.database import Base


class PurchaseOrderStatus(enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    ORDERED = "ordered"
    PARTIALLY_RECEIVED = "partially_received"
    RECEIVED = "received"
    CANCELLED = "cancelled"


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String(100), unique=True, index=True, nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    
    # Order details
    status = Column(Enum(PurchaseOrderStatus), default=PurchaseOrderStatus.DRAFT)
    order_date = Column(DateTime, nullable=False)
    expected_delivery = Column(DateTime)
    
    # Financial
    subtotal = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    shipping_amount = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    
    # Shipping
    shipping_address = Column(Text)
    shipping_method = Column(String(100))
    
    # Approval
    approved_by = Column(Integer, ForeignKey("users.id"))
    approved_at = Column(DateTime)
    
    # Notes
    notes = Column(Text)
    terms_conditions = Column(Text)
    
    # User who created the PO
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    supplier = relationship("Supplier", back_populates="purchase_orders")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order", cascade="all, delete-orphan")


class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    # Item details
    quantity = Column(Integer, nullable=False)
    unit_cost = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)
    
    # Receiving
    received_quantity = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    purchase_order = relationship("PurchaseOrder", back_populates="items")
    product = relationship("Product") 