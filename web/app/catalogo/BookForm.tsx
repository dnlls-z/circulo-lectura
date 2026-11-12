"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export type Book = {
  id: number;
  isbn: string;
  titulo: string;
  autor: string;
  genero: string;
  anio_publicacion: number;
  paginas: number;
  sinopsis: string | null;
};

export default function BookForm({ book }: { book?: Book }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const values = {
      isbn: form.get("isbn"),
      titulo: form.get("titulo"),
      autor: form.get("autor"),
      genero: form.get("genero"),
      anio_publicacion: Number(form.get("anio_publicacion")),
      paginas: Number(form.get("paginas")),
      sinopsis: form.get("sinopsis"),
    };

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        book ? `/backend/books/${book.id}` : "/backend/books",
        {
          method: book ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );

      if (response.status === 401) {
        window.location.replace("/login");
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = data?.fields?.[0]?.mensaje ?? data?.detail;
        setError(typeof message === "string" ? message : "No se pudo guardar el libro.");
        return;
      }

      window.location.assign(`/catalogo/${data.id}`);
    } catch {
      setError("No se pudo conectar con la API. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>
        <label htmlFor="titulo">Título</label><br />
        <input id="titulo" name="titulo" defaultValue={book?.titulo} maxLength={250} required />
      </p>
      <p>
        <label htmlFor="autor">Autor</label><br />
        <input id="autor" name="autor" defaultValue={book?.autor} maxLength={250} required />
      </p>
      <p>
        <label htmlFor="isbn">ISBN</label><br />
        <input id="isbn" name="isbn" defaultValue={book?.isbn} maxLength={250} required />
      </p>
      <p>
        <label htmlFor="genero">Género</label><br />
        <input id="genero" name="genero" defaultValue={book?.genero} maxLength={250} required />
      </p>
      <p>
        <label htmlFor="anio_publicacion">Año de publicación</label><br />
        <input
          id="anio_publicacion"
          name="anio_publicacion"
          type="number"
          step={1}
          max={new Date().getFullYear()}
          defaultValue={book?.anio_publicacion}
          required
        />
      </p>
      <p>
        <label htmlFor="paginas">Páginas</label><br />
        <input id="paginas" name="paginas" type="number" min={1} step={1} defaultValue={book?.paginas} required />
      </p>
      <p>
        <label htmlFor="sinopsis">Sinopsis (opcional)</label><br />
        <textarea id="sinopsis" name="sinopsis" defaultValue={book?.sinopsis ?? ""} maxLength={4000} />
      </p>

      {error && <p role="alert">{error}</p>}

      <p>
        <button type="submit" disabled={loading}>
          {loading ? "Guardando…" : "Guardar libro"}
        </button>{" "}
        <Link href={book ? `/catalogo/${book.id}` : "/catalogo"}>Cancelar</Link>
      </p>
    </form>
  );
}