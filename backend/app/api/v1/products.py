from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func, and_
from pydantic import BaseModel

from app.core.deps import get_current_active_user
from app.db.database import get_async_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product import Product as ProductSchema, ProductCreate, ProductUpdate, ProductSummary

router = APIRouter()


class PaginatedProductsResponse(BaseModel):
    items: List[ProductSchema]
    total: int
    page: int
    limit: int
    total_pages: int
    has_next: bool
    has_prev: bool


@router.get("/", response_model=PaginatedProductsResponse)
async def read_products(
    db: AsyncSession = Depends(get_async_db),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term for name, SKU, or description"),
    category: Optional[str] = Query(None, description="Filter by category"),
    stock_level: Optional[str] = Query(None, description="Filter by stock level: low, normal, high"),
    status: Optional[str] = Query(None, description="Filter by status: in-stock, low-stock, out-of-stock"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve products with optional search and filtering
    """
    skip = (page - 1) * limit
    
    # Build base query
    query = select(Product)
    count_query = select(func.count(Product.id))
    
    # Apply filters
    filters = []
    
    if search:
        search_filter = or_(
            Product.name.ilike(f"%{search}%"),
            Product.sku.ilike(f"%{search}%"),
            Product.description.ilike(f"%{search}%")
        )
        filters.append(search_filter)
    
    if category:
        category_filter = Product.category == category
        filters.append(category_filter)
    
    if stock_level:
        if stock_level == "low":
            stock_filter = Product.current_stock <= Product.reorder_point
        elif stock_level == "normal":
            stock_filter = and_(
                Product.current_stock > Product.reorder_point,
                Product.current_stock <= Product.reorder_point * 2
            )
        elif stock_level == "high":
            stock_filter = Product.current_stock > Product.reorder_point * 2
        else:
            stock_filter = None
        
        if stock_filter:
            filters.append(stock_filter)
    
    if status:
        if status == "out-of-stock":
            status_filter = Product.current_stock == 0
        elif status == "low-stock":
            status_filter = and_(
                Product.current_stock > 0,
                Product.current_stock <= Product.reorder_point
            )
        elif status == "in-stock":
            status_filter = Product.current_stock > Product.reorder_point
        else:
            status_filter = None
        
        if status_filter:
            filters.append(status_filter)
    
    # Apply filters to both queries
    if filters:
        query = query.where(and_(*filters))
        count_query = count_query.where(and_(*filters))
    
    # Get total count
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Get paginated results
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    products = result.scalars().all()
    
    # Calculate pagination info
    total_pages = (total + limit - 1) // limit
    has_next = page < total_pages
    has_prev = page > 1
    
    return PaginatedProductsResponse(
        items=products,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
        has_next=has_next,
        has_prev=has_prev
    )


@router.post("/", response_model=ProductSchema)
async def create_product(
    product_in: ProductCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create new product
    """
    # Check if product with same SKU already exists
    result = await db.execute(select(Product).where(Product.sku == product_in.sku))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A product with this SKU already exists"
        )
    
    # Create product with default values
    product_data = product_in.dict()
    product = Product(**product_data)
    
    db.add(product)
    await db.commit()
    await db.refresh(product)
    
    return product


@router.get("/{product_id}", response_model=ProductSchema)
async def read_product(
    product_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get product by ID
    """
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return product


@router.put("/{product_id}", response_model=ProductSchema)
async def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update product
    """
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if SKU is being updated and if it conflicts
    if product_in.sku and product_in.sku != product.sku:
        result = await db.execute(select(Product).where(Product.sku == product_in.sku))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A product with this SKU already exists"
            )
    
    # Update product fields
    update_data = product_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    await db.commit()
    await db.refresh(product)
    
    return product


@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Delete product
    """
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if product has associated inventory or orders
    if product.inventory_items or product.order_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete product with associated inventory or orders"
        )
    
    await db.delete(product)
    await db.commit()
    
    return {"message": "Product deleted successfully"}


@router.get("/categories/list")
async def get_categories(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get list of all product categories
    """
    result = await db.execute(select(Product.category).distinct().where(Product.category.isnot(None)))
    categories = result.scalars().all()
    return {"categories": [cat for cat in categories if cat]}


@router.get("/low-stock/list")
async def get_low_stock_products(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get list of products with low stock
    """
    query = select(Product).where(
        and_(
            Product.current_stock <= Product.reorder_point,
            Product.is_active == True
        )
    )
    result = await db.execute(query)
    products = result.scalars().all()
    return products


@router.get("/out-of-stock/list")
async def get_out_of_stock_products(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get list of products that are out of stock
    """
    query = select(Product).where(
        and_(
            Product.current_stock == 0,
            Product.is_active == True
        )
    )
    result = await db.execute(query)
    products = result.scalars().all()
    return products 