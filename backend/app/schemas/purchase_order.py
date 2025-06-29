from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from enum import Enum


class PurchaseOrderStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    ORDERED = "ordered"
    PARTIALLY_RECEIVED = "partially_received"
    RECEIVED = "received"
    CANCELLED = "cancelled"


class PurchaseOrderItemBase(BaseModel):
    product_id: int
    quantity: int
    unit_cost: float
    total_cost: float
    received_quantity: int = 0


class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass


class PurchaseOrderItemUpdate(BaseModel):
    quantity: Optional[int] = None
    unit_cost: Optional[float] = None
    total_cost: Optional[float] = None
    received_quantity: Optional[int] = None


class PurchaseOrderItemInDB(PurchaseOrderItemBase):
    id: int
    purchase_order_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PurchaseOrderItem(PurchaseOrderItemInDB):
    pass


class PurchaseOrderBase(BaseModel):
    po_number: str
    supplier_id: int
    status: PurchaseOrderStatus = PurchaseOrderStatus.DRAFT
    order_date: datetime
    expected_delivery: Optional[datetime] = None
    subtotal: float = 0.0
    tax_amount: float = 0.0
    shipping_amount: float = 0.0
    discount_amount: float = 0.0
    total_amount: float = 0.0
    shipping_address: Optional[str] = None
    shipping_method: Optional[str] = None
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    notes: Optional[str] = None
    terms_conditions: Optional[str] = None
    created_by: Optional[int] = None


class PurchaseOrderCreate(PurchaseOrderBase):
    items: List[PurchaseOrderItemCreate]


class PurchaseOrderUpdate(BaseModel):
    po_number: Optional[str] = None
    supplier_id: Optional[int] = None
    status: Optional[PurchaseOrderStatus] = None
    order_date: Optional[datetime] = None
    expected_delivery: Optional[datetime] = None
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    shipping_amount: Optional[float] = None
    discount_amount: Optional[float] = None
    total_amount: Optional[float] = None
    shipping_address: Optional[str] = None
    shipping_method: Optional[str] = None
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    notes: Optional[str] = None
    terms_conditions: Optional[str] = None


class PurchaseOrderInDB(PurchaseOrderBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[PurchaseOrderItem] = []

    class Config:
        from_attributes = True


class PurchaseOrder(PurchaseOrderInDB):
    pass


class PurchaseOrderSummary(BaseModel):
    id: int
    po_number: str
    supplier_id: int
    status: PurchaseOrderStatus
    order_date: datetime
    expected_delivery: Optional[datetime] = None
    total_amount: float
    created_at: datetime

    class Config:
        from_attributes = True 