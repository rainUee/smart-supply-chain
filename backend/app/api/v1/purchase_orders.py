from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.core.deps import get_current_active_user, get_current_superuser
from app.db.database import get_async_db
from app.models.purchase_order import PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus
from app.models.user import User
from app.schemas.purchase_order import (
    PurchaseOrder as PurchaseOrderSchema,
    PurchaseOrderCreate,
    PurchaseOrderUpdate,
    PurchaseOrderSummary
)

router = APIRouter()


@router.get("/", response_model=List[PurchaseOrderSummary])
async def read_purchase_orders(
    db: AsyncSession = Depends(get_async_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve purchase orders
    """
    result = await db.execute(
        select(PurchaseOrder)
        .offset(skip)
        .limit(limit)
        .order_by(PurchaseOrder.created_at.desc())
    )
    purchase_orders = result.scalars().all()
    return purchase_orders


@router.get("/{po_id}", response_model=PurchaseOrderSchema)
async def read_purchase_order(
    po_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db),
) -> Any:
    """
    Get a specific purchase order by id
    """
    result = await db.execute(select(PurchaseOrder).where(PurchaseOrder.id == po_id))
    purchase_order = result.scalar_one_or_none()
    
    if not purchase_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase order not found"
        )
    
    return purchase_order


@router.post("/", response_model=PurchaseOrderSchema)
async def create_purchase_order(
    purchase_order_in: PurchaseOrderCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db),
) -> Any:
    """
    Create new purchase order
    """
    # Create purchase order
    purchase_order = PurchaseOrder(
        po_number=purchase_order_in.po_number,
        supplier_id=purchase_order_in.supplier_id,
        status=purchase_order_in.status,
        order_date=purchase_order_in.order_date,
        expected_delivery=purchase_order_in.expected_delivery,
        subtotal=purchase_order_in.subtotal,
        tax_amount=purchase_order_in.tax_amount,
        shipping_amount=purchase_order_in.shipping_amount,
        discount_amount=purchase_order_in.discount_amount,
        total_amount=purchase_order_in.total_amount,
        shipping_address=purchase_order_in.shipping_address,
        shipping_method=purchase_order_in.shipping_method,
        notes=purchase_order_in.notes,
        terms_conditions=purchase_order_in.terms_conditions,
        created_by=current_user.id
    )
    
    db.add(purchase_order)
    await db.commit()
    await db.refresh(purchase_order)
    
    # Create purchase order items
    for item in purchase_order_in.items:
        po_item = PurchaseOrderItem(
            purchase_order_id=purchase_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_cost=item.unit_cost,
            total_cost=item.total_cost,
            received_quantity=item.received_quantity
        )
        db.add(po_item)
    
    await db.commit()
    await db.refresh(purchase_order)
    
    return purchase_order


@router.put("/{po_id}", response_model=PurchaseOrderSchema)
async def update_purchase_order(
    po_id: int,
    purchase_order_in: PurchaseOrderUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db),
) -> Any:
    """
    Update a purchase order
    """
    result = await db.execute(select(PurchaseOrder).where(PurchaseOrder.id == po_id))
    purchase_order = result.scalar_one_or_none()
    
    if not purchase_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase order not found"
        )
    
    # Update fields
    for field, value in purchase_order_in.dict(exclude_unset=True).items():
        setattr(purchase_order, field, value)
    
    await db.commit()
    await db.refresh(purchase_order)
    
    return purchase_order


@router.delete("/{po_id}")
async def delete_purchase_order(
    po_id: int,
    current_user: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_async_db),
) -> Any:
    """
    Delete a purchase order (admin only)
    """
    result = await db.execute(select(PurchaseOrder).where(PurchaseOrder.id == po_id))
    purchase_order = result.scalar_one_or_none()
    
    if not purchase_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase order not found"
        )
    
    await db.delete(purchase_order)
    await db.commit()
    
    return {"message": "Purchase order deleted successfully"}


@router.patch("/{po_id}/approve", response_model=PurchaseOrderSchema)
async def approve_purchase_order(
    po_id: int,
    current_user: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_async_db),
) -> Any:
    """
    Approve a purchase order (admin only)
    """
    result = await db.execute(select(PurchaseOrder).where(PurchaseOrder.id == po_id))
    purchase_order = result.scalar_one_or_none()
    
    if not purchase_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase order not found"
        )
    
    if purchase_order.status != PurchaseOrderStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Purchase order must be in submitted status to be approved"
        )
    
    purchase_order.status = PurchaseOrderStatus.APPROVED
    purchase_order.approved_by = current_user.id
    purchase_order.approved_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(purchase_order)
    
    return purchase_order


@router.patch("/{po_id}/receive", response_model=PurchaseOrderSchema)
async def receive_purchase_order(
    po_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db),
) -> Any:
    """
    Mark purchase order as received
    """
    result = await db.execute(select(PurchaseOrder).where(PurchaseOrder.id == po_id))
    purchase_order = result.scalar_one_or_none()
    
    if not purchase_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase order not found"
        )
    
    if purchase_order.status not in [PurchaseOrderStatus.APPROVED, PurchaseOrderStatus.ORDERED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Purchase order must be approved or ordered to be received"
        )
    
    # Check if all items are received
    all_received = all(
        item.received_quantity >= item.quantity 
        for item in purchase_order.items
    )
    
    if all_received:
        purchase_order.status = PurchaseOrderStatus.RECEIVED
    else:
        purchase_order.status = PurchaseOrderStatus.PARTIALLY_RECEIVED
    
    await db.commit()
    await db.refresh(purchase_order)
    
    return purchase_order 