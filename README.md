# Círculo de Lectura

Catálogo de libros para la prueba técnica de Tractoandes. La aplicación permite
registrar usuarios, iniciar y cerrar sesión, y consultar, crear, editar y eliminar
libros desde una interfaz web.

## Requisitos

- Git.
- Docker con Docker Compose. Si utiliza Windows, puede usar Docker Desktop.

## Arranque local

Con Docker iniciado, ejecute:

```bash
git clone https://github.com/dnlls-z/circulo-lectura.git
cd circulo-lectura
docker compose up --build
```

Abra [http://localhost:3000](http://localhost:3000). En el primer arranque,
la API aplica las migraciones pendientes, carga dos libros de ejemplo y prepara
la cuenta de demostración.

| Campo | Valor de demostración |
| --- | --- |
| Correo | `demo@example.com` |
| Contraseña | `LecturaDemo2026!` |

Puede consultar la documentación interactiva de la API en
[http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs).

### Configuración opcional

Docker Compose usa valores locales de demostración por defecto. Si desea
personalizarlos, copie `.env.example` a `.env` y edite sus valores. En PowerShell,
ejecute `Copy-Item .env.example .env`. En macOS o Linux, ejecute
`cp .env.example .env`. Git excluye `.env`.

### Detener la aplicación

Presione `Ctrl+C` en la terminal donde se ejecuta Compose. También puede
ejecutar `docker compose down` desde la carpeta del proyecto. El volumen de
PostgreSQL conserva los datos entre arranques.

## Arquitectura y decisiones

- **Next.js con App Router y TypeScript** organiza las pantallas de registro,
  inicio de sesión y catálogo. El mismo formulario sirve para crear y editar
  libros.
- **FastAPI** implementa la API como un servicio independiente. Elegí Python
  para aprovechar mi experiencia con ese lenguaje y con SQL. Pydantic valida
  los datos de entrada.
- **PostgreSQL y Psycopg** permiten consultar y guardar los datos con SQL
  parametrizado. PostgreSQL garantiza que cada ISBN sea único.
- **Sesiones en PostgreSQL.** Las contraseñas se guardan como hashes Argon2.
  Al iniciar sesión, el navegador recibe una cookie y PostgreSQL guarda el hash
  del token junto con su caducidad. Elegí sesiones para poder revocar el acceso
  desde el servidor al cerrar sesión.
- **Docker Compose** coordina los servicios `db`, `api` y `web`. FastAPI espera
  a que PostgreSQL acepte conexiones antes de aplicar las migraciones y
  preparar la cuenta de demostración. Next.js reenvía las peticiones
  `/backend/*` a FastAPI.

## Endpoints

Las rutas de libros requieren una sesión válida.

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

La API devuelve `400` para datos inválidos, `401` cuando falta una sesión válida
o las credenciales son incorrectas, `404` si el libro no existe y `409` si el
ISBN o el correo ya están registrados.

## Cómo probar el flujo

1. Abra [el catálogo](http://localhost:3000/catalogo) en una ventana de incógnito
   y confirme que la aplicación lo redirige a `/login`.
2. Registre una cuenta o inicie sesión con la cuenta de demostración.
3. Cree un libro, abra su ficha y edite el número de páginas. Recargue la ficha
   y compruebe que se guardó el cambio.
4. Intente crear otro libro con el mismo ISBN y verifique que la interfaz
   muestre el error.
5. Pulse **Eliminar libro** y cancele la operación. Compruebe que el libro
   sigue en la ficha. Repita la operación y confirme el borrado. El libro
   debe desaparecer del catálogo.
6. Cierre sesión y vuelva a abrir `/catalogo`. La aplicación debe redirigirlo
   nuevamente al inicio de sesión.

## Mejoras futuras

Agregaría pruebas automatizadas del recorrido completo y paginación para
catálogos grandes. Para un despliegue público, configuraría HTTPS, cookies
`Secure` y credenciales propias.