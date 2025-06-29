from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.deps import get_current_active_user, get_current_superuser
from app.db.database import get_async_db
from app.models.user import User
from app.schemas.user import User as UserSchema, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserSchema)
async def read_user_me(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get current user
    """
    return current_user


@router.put("/me", response_model=UserSchema)
async def update_user_me(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db),
) -> Any:
    """
    Update current user
    """
    # Update user fields
    for field, value in user_in.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.get("/", response_model=List[UserSchema])
async def read_users(
    db: AsyncSession = Depends(get_async_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_superuser),
) -> Any:
    """
    Retrieve users (admin only)
    """
    result = await db.execute(select(User).offset(skip).limit(limit))
    users = result.scalars().all()
    return users


@router.get("/{user_id}", response_model=UserSchema)
async def read_user_by_id(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db),
) -> Any:
    """
    Get a specific user by id
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Only superusers can access other users' data
    if user.id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user doesn't have enough privileges"
        )
    
    return user


@router.put("/{user_id}", response_model=UserSchema)
async def update_user(
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_async_db),
) -> Any:
    """
    Update a user (admin only)
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user fields
    for field, value in user_in.dict(exclude_unset=True).items():
        setattr(user, field, value)
    
    await db.commit()
    await db.refresh(user)
    return user 