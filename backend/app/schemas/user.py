# backend/app/schemas/user.py

from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    username: str
    avatar_url: str | None = None

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut