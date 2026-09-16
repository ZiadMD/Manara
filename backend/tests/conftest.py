import pytest
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.user import User
from app.core.security import hash_password, create_access_token

# In-memory SQLite for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestAsyncSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(autouse=True)
async def prepare_database():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create test users
    async with TestAsyncSessionLocal() as session:
        student = User(
            id="student-1",
            email="student@test.local",
            name="Test Student",
            role="student",
            hashed_password=hash_password("Password123!")
        )
        counselor = User(
            id="counselor-1",
            email="counselor@test.local",
            name="Test Counselor",
            role="counselor",
            hashed_password=hash_password("Password123!")
        )
        admin = User(
            id="admin-1",
            email="admin@test.local",
            name="Test Admin",
            role="admin",
            hashed_password=hash_password("Password123!")
        )
        session.add_all([student, counselor, admin])
        await session.commit()
    
    yield
    
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestAsyncSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def student_token() -> str:
    return create_access_token({"sub": "student-1", "email": "student@test.local", "role": "student"})

@pytest.fixture
def counselor_token() -> str:
    return create_access_token({"sub": "counselor-1", "email": "counselor@test.local", "role": "counselor"})

@pytest.fixture
def admin_token() -> str:
    return create_access_token({"sub": "admin-1", "email": "admin@test.local", "role": "admin"})

@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
