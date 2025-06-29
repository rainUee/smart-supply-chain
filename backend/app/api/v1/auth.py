from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
    verify_refresh_token
)
from app.db.database import get_async_db
from app.models.user import User
from app.schemas.user import UserCreate, User as UserSchema, Token, UserLogin

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(
    user_credentials: UserLogin,
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # Find user by email
    result = await db.execute(select(User).where(User.email == user_credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(subject=user.email)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "refresh_token": refresh_token,
    }


@router.post("/register", response_model=UserSchema)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    """
    Register a new user
    """
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
    
    result = await db.execute(select(User).where(User.name == user_in.name))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this name already exists"
        )
    
    # Create new user
    user = User(
        email=user_in.email,
        name=user_in.name,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        company=user_in.company,
        phone=user_in.phone,
        role=user_in.role,
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    """
    Refresh access token using refresh token
    """
    email = verify_refresh_token(refresh_token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create new access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "refresh_token": refresh_token,
    } 