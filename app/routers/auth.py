from fastapi import APIRouter, HTTPException, status

from app.auth import create_access_token
from app.config import settings
from app.schemas.admin import LoginRequest, TokenOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenOut)
async def login(payload: LoginRequest):
    if payload.key != settings.ADMIN_SECRET_KEY:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid key")
    return TokenOut(access_token=create_access_token("admin"))


@router.post("/user-login", response_model=TokenOut)
async def user_login(payload: LoginRequest):
    if payload.key != settings.USER_SECRET_KEY:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid key")
    return TokenOut(access_token=create_access_token("user"))
