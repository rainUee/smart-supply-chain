from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.db.database import Base


class OrderStatus(enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class PaymentStatus(enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    PARTIAL = "partial"
    REFUNDED = "refunded"


class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(100), unique=True, index=True, nullable=False)
    customer_name = Column(String(200), nullable=False)
    customer_email = Column(String(255))
    customer_phone = Column(String(20))
    customer_address = Column(Text)
    
    # Order details
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    
    # Financial
    subtotal = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    shipping_amount = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    
    # Shipping
    shipping_method = Column(String(100))
    tracking_number = Column(String(100))
    estimated_delivery = Column(DateTime)
    actual_delivery = Column(DateTime)
    
    # Notes
    notes = Column(Text)
    
    # User who created the order
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    # Item details
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items") 