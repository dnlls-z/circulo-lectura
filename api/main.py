from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from api.auth import router as auth_router
from api.books import router as books_router


app = FastAPI()
app.include_router(auth_router)
app.include_router(books_router)


@app.exception_handler(RequestValidationError)
def handle_validation_error(_request: Request, error: RequestValidationError):
    fields = [
        {
            "campo": ".".join(str(part) for part in item["loc"]),
            "mensaje": item["msg"],
        }
        for item in error.errors()
    ]

    return JSONResponse(
        status_code=400,
        content={"detail": "Revisa los datos ingresados.", "fields": fields},
    )


@app.get("/health")
def health():
    return {"status": "ok"}