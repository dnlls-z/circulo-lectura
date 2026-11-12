import os

from api.auth import password_hasher
from api.db import connect_db


def seed_demo_user():
    email = os.environ["SEED_EMAIL"].strip().lower()
    password = os.environ["SEED_PASSWORD"]

    with connect_db() as connection:
        connection.execute(
            """
            INSERT INTO users (name, email, password_hash)
            VALUES (%s, %s, %s)
            ON CONFLICT (email) DO NOTHING
            """,
            ("Lector de demostración", email, password_hasher.hash(password)),
        )

    print("Cuenta de demostración lista.")


if __name__ == "__main__":
    seed_demo_user()