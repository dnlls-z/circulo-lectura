import Link from "next/link";

import BookForm, { type Book } from "../../BookForm";
import { fetchCatalog } from "../../catalogApi";

export default async function EditarLibroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await fetchCatalog(`/books/${encodeURIComponent(id)}`);

  if (!response?.ok) {
    const message =
      response?.status === 404
        ? "El libro no existe."
        : response?.status === 400
          ? "El ID del libro no es válido."
          : "No se pudo cargar el libro para editarlo.";

    return (
      <main>
        <h1>Editar libro</h1>
        <p role="alert">{message}</p>
        <Link href="/catalogo">Volver al catálogo</Link>
      </main>
    );
  }

  const book: Book = await response.json();

  return (
    <main>
      <h1>Editar libro</h1>
      <BookForm book={book} />
    </main>
  );
}