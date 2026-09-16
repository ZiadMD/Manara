from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str
    contact_phone: str | None = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    sub: str | None = None
    role: str | None = None
    email: str | None = None
