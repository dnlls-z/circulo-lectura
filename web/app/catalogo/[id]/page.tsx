import Link from "next/link";

import { fetchCatalog } from "../catalogApi";

type BookDetail = {
  isbn: string;
  titulo: string;
  autor: string;
  genero: string;
  anio_publicacion: number;
  paginas: number;
  sinopsis: string | null;
};

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bookId = encodeURIComponent(id);
  const response = await fetchCatalog(`/books/${bookId}`);

  if (!response?.ok) {
    const message =
      response?.status === 404
        ? "El libro no existe."
        : response?.status === 400
          ? "El ID del libro no es válido."
          : "No se pudo cargar el libro. Intenta de nuevo.";

    return (
      <main>
        <p role="alert">{message}</p>
        <Link href="/catalogo">Volver al catálogo</Link>
      </main>
    );
  }

  const book: BookDetail = await response.json();

  return (
    <main>
      <Link href="/catalogo">Volver al catálogo</Link>
      <h1>{book.titulo}</h1>

      <p>
        <Link href={`/catalogo/${bookId}/editar`}>Editar libro</Link>
      </p>

      <p><strong>Autor:</strong> {book.autor}</p>
      <p><strong>ISBN:</strong> {book.isbn}</p>
      <p><strong>Género:</strong> {book.genero}</p>
      <p><strong>Año de publicación:</strong> {book.anio_publicacion}</p>
      <p><strong>Páginas:</strong> {book.paginas}</p>

      {book.sinopsis && (
        <section>
          <h2>Sinopsis</h2>
          <p>{book.sinopsis}</p>
        </section>
      )}
    </main>
  );
}