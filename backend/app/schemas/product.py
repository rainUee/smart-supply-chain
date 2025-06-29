from typing import Optional
from pydantic import BaseModel, validator
from datetime import datetime


class ProductBase(BaseModel):
    name: str
    sku: str
    description: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    cost_price: float
    selling_price: float
    wholesale_price: Optional[float] = None
    current_stock: int = 0
    min_stock_level: int = 0
    max_stock_level: Optional[int] = None
    reorder_point: int = 0
    unit_of_measure: str = "pcs"
    weight: Optional[float] = None
    dimensions: Optional[str] = None
    is_featured: bool = False
    supplier_id: Optional[int] = None


class ProductCreate(ProductBase):
    @validator('cost_price', 'selling_price')
    def validate_prices(cls, v):
        if v < 0:
            raise ValueError('Price cannot be negative')
        return v
    
    @validator('current_stock', 'min_stock_level', 'reorder_point')
    def validate_stock_levels(cls, v):
        if v < 0:
            raise ValueError('Stock levels cannot be negative')
        return v


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None
    wholesale_price: Optional[float] = None
    current_stock: Optional[int] = None
    min_stock_level: Optional[int] = None
    max_stock_level: Optional[int] = None
    reorder_point: Optional[int] = None
    unit_of_measure: Optional[str] = None
    weight: Optional[float] = None
    dimensions: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    supplier_id: Optional[int] = None


class ProductInDB(ProductBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class Product(ProductInDB):
    pass


class ProductSummary(BaseModel):
    id: int
    name: str
    sku: str
    category: Optional[str] = None
    current_stock: int
    selling_price: float
    is_active: bool
    
    class Config:
        from_attributes = True


class ProductWithSupplier(Product):
    supplier_name: Optional[str] = None 