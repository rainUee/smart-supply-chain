from typing import Optional
from pydantic import BaseModel, EmailStr, validator
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    name: str
    full_name: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    role: str = "user"


class UserCreate(UserBase):
    password: str

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long")
        return v


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    full_name: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserInDB(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class User(UserInDB):
    pass


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    refresh_token: Optional[str] = None


class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
