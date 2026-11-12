# Círculo de Lectura

Catálogo de libros para la prueba técnica de Tractoandes. Permite registrar
usuarios, iniciar y cerrar sesión, y consultar, crear, editar y eliminar libros
desde una interfaz web.

## Requisitos

- Git.
- Docker con Docker Compose. En Windows, se puede usar Docker Desktop.

## Arranque local

Clona el repositorio y entra en la carpeta:

```bash
git clone https://github.com/dnlls-z/circulo-lectura.git
cd circulo-lectura
```

Crea el archivo `.env` a partir de `.env.example`. En PowerShell:

```powershell
Copy-Item .env.example .env
```

En macOS o Linux:

```bash
cp .env.example .env
```

Arranca los servicios:

```bash
docker compose up --build
```

Abre [http://localhost:3000](http://localhost:3000). En el primer arranque,
la API aplica las migraciones y prepara dos libros y una cuenta de demostración.

| Campo | Valor de demostración |
| --- | --- |
| Correo | `demo@example.com` |
| Contraseña | `LecturaDemo2026!` |

La documentación interactiva de la API está en
[http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs).

Para detener el entorno, usa `docker compose down`. El volumen de PostgreSQL
conserva los datos. El archivo `.env` es local y está excluido de Git.

## Arquitectura y decisiones

- **Next.js con App Router y TypeScript** organiza las pantallas del catálogo.
  El formulario de libros se comparte entre alta y edición.
- **FastAPI** recibe las peticiones. Elegí Python porque podía aprovechar mi
  experiencia con ese lenguaje y con SQL. Pydantic valida los datos de entrada.
- **PostgreSQL y Psycopg** almacenan y consultan los datos con SQL parametrizado.
  La base de datos aplica la restricción de ISBN único.
- **Sesiones en PostgreSQL.** Las contraseñas se guardan como hashes Argon2.
  El navegador recibe una cookie de sesión y PostgreSQL guarda el hash del
  token y su fecha de expiración. Al cerrar sesión, la API revoca esa sesión.
- **Docker Compose** coordina `db`, `api` y `web`. La API espera a PostgreSQL,
  aplica los archivos SQL pendientes y prepara la cuenta de demostración.
  Next.js reenvía las peticiones `/backend/*` a FastAPI.

## Endpoints

Las rutas del catálogo requieren una sesión válida.

| Método | Ruta | Operación |
| --- | --- | --- |
| GET | `/health` | Comprobar que la API responde |
| POST | `/auth/register` | Registrar un usuario |
| POST | `/auth/login` | Iniciar sesión |
| GET | `/auth/me` | Consultar el usuario de la sesión |
| POST | `/auth/logout` | Cerrar sesión |
| GET | `/books` | Listar libros |
| GET | `/books/{book_id}` | Consultar un libro |
| POST | `/books` | Crear un libro |
| PUT | `/books/{book_id}` | Editar un libro |
| DELETE | `/books/{book_id}` | Eliminar un libro |

La API devuelve `400` para datos inválidos, `401` si falta una sesión válida,
`404` si el libro no existe y `409` si el ISBN o el correo ya están registrados.

## Cómo probar el flujo

1. Abre el catálogo en incógnito y confirma que redirige al inicio de sesión.
2. Registra una cuenta o entra con la cuenta de demostración.
3. Crea un libro, abre su ficha y edita sus páginas.
4. Intenta guardar otro libro con el mismo ISBN y comprueba el mensaje.
5. Prueba cancelar el borrado y luego confirma que el libro se puede eliminar.
6. Cierra sesión y comprueba que el catálogo vuelve a pedir acceso.

## Mejoras futuras

Agregaría pruebas automatizadas del flujo completo y paginación para catálogos
grandes. Para un despliegue público configuraría HTTPS, cookies `Secure`
y credenciales propias.