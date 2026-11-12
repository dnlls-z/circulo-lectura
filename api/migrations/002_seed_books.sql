INSERT INTO books (isbn, titulo, autor, genero, anio_publicacion, paginas)
VALUES
    ('CLUB-001', 'El mapa perdido', 'Ana Torres', 'Aventura', 2020, 180),
    ('CLUB-002', 'La ciudad de las nubes', 'Luis Rivera', 'Fantasia', 2023, 240)
ON CONFLICT (isbn) DO NOTHING;