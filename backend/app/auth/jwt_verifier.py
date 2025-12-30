"""JWT verification using Better Auth JWKS endpoint."""

from typing import Optional
from dataclasses import dataclass

import jwt
from jwt import PyJWKClient
from fastapi import Header, HTTPException, Depends

from app.config import get_settings, Settings


@dataclass
class JWTClaims:
    """Parsed JWT claims."""
    user_id: str
    email: Optional[str] = None


class BetterAuthJWTVerifier:
    """Verifies JWTs issued by Better Auth using JWKS endpoint."""

    def __init__(self, settings: Settings):
        self.jwks_client = PyJWKClient(settings.JWKS_URL)
        self.issuer = settings.JWT_ISSUER
        self.audience = settings.JWT_AUDIENCE

    def verify(self, token: str) -> JWTClaims:
        """Verify JWT and extract claims.

        Args:
            token: JWT token string

        Returns:
            JWTClaims with user_id and optional email

        Raises:
            HTTPException: If token is invalid or expired
        """
        try:
            signing_key = self.jwks_client.get_signing_key_from_jwt(token)
            claims = jwt.decode(
                token,
                signing_key.key,
                algorithms=["EdDSA", "RS256", "ES256"],
                issuer=self.issuer,
                audience=self.audience,
            )
            return JWTClaims(
                user_id=claims.get("sub"),
                email=claims.get("email"),
            )
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Unable to verify token: {str(e)}")


# Singleton verifier instance
_verifier: Optional[BetterAuthJWTVerifier] = None


def get_verifier() -> BetterAuthJWTVerifier:
    """Get or create JWT verifier instance."""
    global _verifier
    if _verifier is None:
        _verifier = BetterAuthJWTVerifier(get_settings())
    return _verifier


async def get_current_user(
    authorization: Optional[str] = Header(default=None),
) -> JWTClaims:
    """FastAPI dependency for extracting authenticated user from JWT.

    Args:
        authorization: Authorization header value

    Returns:
        JWTClaims with user information

    Raises:
        HTTPException: 401 if missing or invalid token
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")

    token = authorization.split("Bearer ")[1]
    verifier = get_verifier()
    return verifier.verify(token)
