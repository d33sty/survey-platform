from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth import decode_access_token

bearer = HTTPBearer()


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> str:
    token = credentials.credentials
    subject = decode_access_token(token)
    if subject != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    return subject
