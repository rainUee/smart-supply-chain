from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text)
    category = Column(String(100), index=True)
    brand = Column(String(100))
    
    # Pricing
    cost_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    wholesale_price = Column(Float)
    
    # Inventory
    current_stock = Column(Integer, default=0)
    min_stock_level = Column(Integer, default=0)
    max_stock_level = Column(Integer)
    reorder_point = Column(Integer, default=0)
    
    # Units
    unit_of_measure = Column(String(20), default="pcs")
    weight = Column(Float)  # in kg
    dimensions = Column(String(100))  # LxWxH in cm
    
    # Status
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    
    # Supplier relationship
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    supplier = relationship("Supplier", back_populates="products")
    inventory_items = relationship("InventoryItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product") 