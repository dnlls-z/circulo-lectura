from pathlib import Path

from api.db import connect_db


def migrate():
    migrations_folder = Path(__file__).resolve().parent / "migrations"

    with connect_db() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS schema_migrations (
                filename TEXT PRIMARY KEY
            )
            """
        )

        applied = connection.execute(
            "SELECT filename FROM schema_migrations"
        ).fetchall()
        applied_names = {row["filename"] for row in applied}

        for migration in sorted(migrations_folder.glob("*.sql")):
            if migration.name in applied_names:
                continue

            print(f"Aplicando {migration.name}...")
            connection.execute(migration.read_text(encoding="utf-8-sig"))
            connection.execute(
                "INSERT INTO schema_migrations (filename) VALUES (%s)",
                (migration.name,),
            )

    print("Migraciones al día.")


if __name__ == "__main__":
    migrate()