from hashlib import sha256
from secrets import token_urlsafe
from typing import Annotated

from fastapi import APIRouter, Cookie, HTTPException, Response
from pwdlib import PasswordHash
from pydantic import BaseModel, EmailStr, Field, StringConstraints

from api.db import connect_db


router = APIRouter(prefix="/auth")
password_hasher = PasswordHash.recommended()


class RegisterRequest(BaseModel):
    name: Annotated[
        str,
        StringConstraints(strip_whitespace=True, min_length=1, max_length=100),
    ]
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


def hash_token(token: str) -> str:
    return sha256(token.encode("utf-8")).hexdigest()


@router.post("/register", status_code=201)
def register(data: RegisterRequest):
    email = data.email.lower()
    password_hash = password_hasher.hash(data.password)

    with connect_db() as connection:
        user = connection.execute(
            """
            INSERT INTO users (name, email, password_hash)
            VALUES (%s, %s, %s)
            ON CONFLICT (email) DO NOTHING
            RETURNING id, name, email
            """,
            (data.name, email, password_hash),
        ).fetchone()

    if user is None:
        raise HTTPException(
            status_code=409,
            detail="Ese correo ya está registrado.",
        )

    return user


@router.post("/login")
def login(data: LoginRequest, response: Response):
    with connect_db() as connection:
        user = connection.execute(
            """
            SELECT id, name, email, password_hash
            FROM users
            WHERE email = %s
            """,
            (data.email.lower(),),
        ).fetchone()

        if user is None or not password_hasher.verify(
            data.password, user["password_hash"]
        ):
            raise HTTPException(
                status_code=401,
                detail="Correo o contraseña incorrectos.",
            )

        token = token_urlsafe(32)
        connection.execute(
            """
            INSERT INTO sessions (token_hash, user_id, expires_at)
            VALUES (%s, %s, NOW() + INTERVAL '8 hours')
            """,
            (hash_token(token), user["id"]),
        )

    response.set_cookie(
        key="session",
        value=token,
        max_age=8 * 60 * 60,
        httponly=True,
        samesite="lax",
        path="/",
    )

    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
    }


@router.get("/me")
def current_user(session: Annotated[str | None, Cookie()] = None):
    if not session:
        raise HTTPException(
            status_code=401,
            detail="Inicia sesión para continuar.",
        )

    with connect_db() as connection:
        user = connection.execute(
            """
            SELECT users.id, users.name, users.email
            FROM sessions
            JOIN users ON users.id = sessions.user_id
            WHERE sessions.token_hash = %s
              AND sessions.expires_at > NOW()
            """,
            (hash_token(session),),
        ).fetchone()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="La sesión no es válida o expiró.",
        )

    return user


@router.post("/logout", status_code=204)
def logout(session: Annotated[str | None, Cookie()] = None):
    if session:
        with connect_db() as connection:
            connection.execute(
                "DELETE FROM sessions WHERE token_hash = %s",
                (hash_token(session),),
            )

    response = Response(status_code=204)
    response.delete_cookie(key="session", path="/")
    return response