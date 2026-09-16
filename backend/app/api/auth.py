from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.security import verify_password, create_access_token, hash_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import LoginRequest, Token, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest, session: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == credentials.email.lower().strip())
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    token_payload = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "name": user.name
    }
    access_token = create_access_token(token_payload)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)

@router.post("/seed-demo-users")
async def seed_demo_users(session: AsyncSession = Depends(get_db)):
    """Seed initial demo accounts for Student, Counselor, and Admin roles."""
    demo_users = [
        {
            "email": "student@manara.school",
            "name": "طالب تجريبي (Demo Student)",
            "role": "student",
            "password": "Password123!"
        },
        {
            "email": "counselor@manara.school",
            "name": "أ. سارة المرشدة (Counselor Sarah)",
            "role": "counselor",
            "password": "Password123!"
        },
        {
            "email": "admin@manara.school",
            "name": "مدير النظام (System Admin)",
            "role": "admin",
            "password": "Password123!"
        }
    ]
    
    created = []
    for u in demo_users:
        stmt = select(User).where(User.email == u["email"])
        res = await session.execute(stmt)
        existing = res.scalar_one_or_none()
        if not existing:
            new_user = User(
                email=u["email"],
                name=u["name"],
                role=u["role"],
                hashed_password=hash_password(u["password"])
            )
            session.add(new_user)
            created.append(u["email"])
    
    await session.commit()
    return {"message": "Demo users seeded successfully", "created": created}
