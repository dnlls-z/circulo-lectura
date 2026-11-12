from fastapi import Depends, FastAPI

from api.db import connect_db

from api.auth import current_user
from api.auth import router as auth_router

app = FastAPI()

app.include_router(auth_router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/books", dependencies=[Depends(current_user)])
def list_books():
    with connect_db() as connection:
        books = connection.execute(
            """
            SELECT id, isbn, titulo, autor, genero, anio_publicacion, paginas
            FROM books
            ORDER BY id
            """
        ).fetchall()

    return books