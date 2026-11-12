from getpass import getpass

import psycopg

with psycopg.connect(
    host="127.0.0.1",
    port=5433,
    dbname="circulo",
    user="circulo",
    password=getpass("Contraseña de PostgreSQL: "),
) as connection:
    result = connection.execute("SELECT current_database(), 2 + 2").fetchone()
    print(result)