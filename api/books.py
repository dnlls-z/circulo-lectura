from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path
from pydantic import BaseModel, Field, StringConstraints, field_validator

from api.auth import current_user
from api.db import connect_db


router = APIRouter(
    prefix="/books",
    tags=["Libros"],
    dependencies=[Depends(current_user)],
)

RequiredText = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True,
        min_length=1,
        max_length=250,
        pattern=r"^[^\x00]+$",
    ),
]

OptionalText = Annotated[
    str,
    StringConstraints(strip_whitespace=True, max_length=4000, pattern=r"^[^\x00]*$"),
]


class BookRequest(BaseModel):
    isbn: RequiredText
    titulo: RequiredText
    autor: RequiredText
    genero: RequiredText
    anio_publicacion: int = Field(strict=True, ge=-2147483648, le=2147483647)
    paginas: int = Field(strict=True, gt=0, le=2147483647)
    sinopsis: OptionalText | None = None

    @field_validator("anio_publicacion")
    @classmethod
    def check_year(cls, year: int) -> int:
        if year > date.today().year:
            raise ValueError("El año de publicación no puede ser futuro.")
        return year


@router.get("")
def list_books():
    with connect_db() as connection:
        books = connection.execute(
            """
            SELECT id, isbn, titulo, autor, genero, anio_publicacion, paginas,
                   sinopsis, created_at, updated_at
            FROM books
            ORDER BY id
            """
        ).fetchall()

    return books


@router.post("", status_code=201)
def create_book(data: BookRequest):
    with connect_db() as connection:
        book = connection.execute(
            """
            INSERT INTO books (
                isbn, titulo, autor, genero, anio_publicacion, paginas, sinopsis
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (isbn) DO NOTHING
            RETURNING id, isbn, titulo, autor, genero, anio_publicacion, paginas,
                      sinopsis, created_at, updated_at
            """,
            (
                data.isbn,
                data.titulo,
                data.autor,
                data.genero,
                data.anio_publicacion,
                data.paginas,
                data.sinopsis or None,
            ),
        ).fetchone()

    if book is None:
        raise HTTPException(status_code=409, detail="Ya existe un libro con ese ISBN.")

    return book


@router.get("/{book_id}")
def get_book(book_id: Annotated[int, Path(ge=1, le=2147483647)]):
    with connect_db() as connection:
        book = connection.execute(
            """
            SELECT id, isbn, titulo, autor, genero, anio_publicacion, paginas,
                   sinopsis, created_at, updated_at
            FROM books
            WHERE id = %s
            """,
            (book_id,),
        ).fetchone()

    if book is None:
        raise HTTPException(status_code=404, detail="El libro no existe.")

    return book