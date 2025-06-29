from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime


class SupplierBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    tax_id: Optional[str] = None
    payment_terms: Optional[str] = None
    credit_limit: float = 0.0
    rating: float = 0.0
    is_preferred: bool = False


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    tax_id: Optional[str] = None
    payment_terms: Optional[str] = None
    credit_limit: Optional[float] = None
    rating: Optional[float] = None
    is_preferred: Optional[bool] = None
    is_active: Optional[bool] = None


class SupplierInDB(SupplierBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class Supplier(SupplierInDB):
    pass


class SupplierSummary(BaseModel):
    id: int
    name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    rating: float
    is_preferred: bool
    is_active: bool
    
    class Config:
        from_attributes = True 