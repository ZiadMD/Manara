from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from app.core.config import settings
from app.core.security import hash_password
from app.db.base import Base
from app.db.session import engine, AsyncSessionLocal
from app.models.user import User
from app.api.auth import router as auth_router
from app.api.assessments import router as assessments_router
from app.api.safety_flags import router as safety_flags_router
from app.api.admin import router as admin_router
from app.api.questionnaire import router as questionnaire_router

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Auto-seed demo accounts if not existing
    async with AsyncSessionLocal() as session:
        demo_users = [
            ("student@manara.school", "طالب تجريبي (Demo Student)", "student", "Password123!"),
            ("counselor@manara.school", "أ. سارة المرشدة (Counselor Sarah)", "counselor", "Password123!"),
            ("admin@manara.school", "مدير النظام (System Admin)", "admin", "Password123!")
        ]
        for email, name, role, pwd in demo_users:
            stmt = select(User).where(User.email == email)
            res = await session.execute(stmt)
            if not res.scalar_one_or_none():
                user = User(
                    email=email,
                    name=name,
                    role=role,
                    hashed_password=hash_password(pwd)
                )
                session.add(user)
        await session.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(assessments_router, prefix=settings.API_V1_STR)
app.include_router(safety_flags_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(questionnaire_router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "manara-api"}
