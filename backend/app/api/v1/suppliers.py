from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.core.deps import get_current_active_user
from app.db.database import get_async_db
from app.models.supplier import Supplier
from app.models.user import User
from app.schemas.supplier import Supplier as SupplierSchema, SupplierCreate, SupplierUpdate, SupplierSummary

router = APIRouter()


@router.get("/", response_model=List[SupplierSummary])
async def read_suppliers(
    db: AsyncSession = Depends(get_async_db),
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve suppliers with optional search
    """
    query = select(Supplier)
    
    if search:
        query = query.where(
            or_(
                Supplier.name.ilike(f"%{search}%"),
                Supplier.contact_person.ilike(f"%{search}%"),
                Supplier.email.ilike(f"%{search}%")
            )
        )
    
    result = await db.execute(query.offset(skip).limit(limit))
    suppliers = result.scalars().all()
    return suppliers


@router.post("/", response_model=SupplierSchema)
async def create_supplier(
    supplier_in: SupplierCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create new supplier
    """
    # Check if supplier with same name already exists
    result = await db.execute(select(Supplier).where(Supplier.name == supplier_in.name))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A supplier with this name already exists"
        )
    
    supplier = Supplier(**supplier_in.dict())
    db.add(supplier)
    await db.commit()
    await db.refresh(supplier)
    return supplier


@router.get("/{supplier_id}", response_model=SupplierSchema)
async def read_supplier(
    supplier_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get supplier by ID
    """
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )
    
    return supplier


@router.put("/{supplier_id}", response_model=SupplierSchema)
async def update_supplier(
    supplier_id: int,
    supplier_in: SupplierUpdate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update supplier
    """
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )
    
    # Check if name is being updated and if it conflicts
    if supplier_in.name and supplier_in.name != supplier.name:
        result = await db.execute(select(Supplier).where(Supplier.name == supplier_in.name))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A supplier with this name already exists"
            )
    
    # Update supplier fields
    for field, value in supplier_in.dict(exclude_unset=True).items():
        setattr(supplier, field, value)
    
    await db.commit()
    await db.refresh(supplier)
    return supplier


@router.delete("/{supplier_id}")
async def delete_supplier(
    supplier_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Delete supplier
    """
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )
    
    # Check if supplier has associated products
    if supplier.products:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete supplier with associated products"
        )
    
    await db.delete(supplier)
    await db.commit()
    
    return {"message": "Supplier deleted successfully"} 