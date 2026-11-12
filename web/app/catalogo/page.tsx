import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type Book = {
  id: number;
  isbn: string;
  titulo: string;
  autor: string;
  genero: string;
  anio_publicacion: number;
  paginas: number;
};

export default async function CatalogoPage() {
  const session = (await cookies()).get("session");

  if (!session) {
    redirect("/login");
  }

  const apiUrl = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:8000";

  const response = await fetch(`${apiUrl}/books`, {
    headers: { Cookie: `session=${session.value}` },
    cache: "no-store",
  }).catch(() => null);

  if (response?.status === 401) {
    redirect("/login");
  }

  if (!response?.ok) {
    return (
      <main>
        <h1>Catálogo de libros</h1>
        <p role="alert">No se pudo cargar el catálogo. Revisa que FastAPI esté corriendo y recarga la página.</p>
      </main>
    );
  }

  const books: Book[] = await response.json();

  return (
    <main>
      <h1>Catálogo de libros</h1>

      {books.length === 0 ? (
        <p>Todavía no hay libros en el catálogo.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">Título</th>
              <th scope="col">Autor</th>
              <th scope="col">ISBN</th>
              <th scope="col">Género</th>
              <th scope="col">Año</th>
              <th scope="col">Páginas</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.titulo}</td>
                <td>{book.autor}</td>
                <td>{book.isbn}</td>
                <td>{book.genero}</td>
                <td>{book.anio_publicacion}</td>
                <td>{book.paginas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}