"use client";

import { useState } from "react";

type Props = {
  bookId: number;
  title: string;
};

export default function DeleteBookButton({ bookId, title }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function deleteBook() {
    const confirmed = window.confirm(`¿Eliminar «${title}» del catálogo?`);

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/backend/books/${bookId}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        window.location.replace("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(
          typeof data?.detail === "string"
            ? data.detail
            : "No se pudo eliminar el libro. Intenta de nuevo.",
        );
        return;
      }

      window.location.replace("/catalogo");
    } catch {
      setError("No se pudo conectar con la API. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={deleteBook} disabled={loading}>
        {loading ? "Eliminando…" : "Eliminar libro"}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}