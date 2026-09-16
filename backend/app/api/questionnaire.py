import json
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(prefix="/questionnaire", tags=["questionnaire"])

@router.get("/items")
async def get_items_bank():
    path = settings.DATA_DIR / "items_bank.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("/background-fields")
async def get_background_fields():
    path = settings.DATA_DIR / "background_fields.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)
