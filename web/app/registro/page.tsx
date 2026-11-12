"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function RegistroPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/backend/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(
          typeof data?.detail === "string"
            ? data.detail
            : "No se pudo crear la cuenta.",
        );
        return;
      }

      window.location.assign("/login");
    } catch {
      setError("No se pudo conectar con la API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Crear una cuenta</h1>

      <form onSubmit={handleSubmit}>
        <p>
          <label htmlFor="name">Nombre</label>
          <br />
          <input id="name" name="name" autoComplete="name" maxLength={100} required />
        </p>

        <p>
          <label htmlFor="email">Correo electrónico</label>
          <br />
          <input id="email" name="email" type="email" autoComplete="email" required />
        </p>

        <p>
          <label htmlFor="password">Contraseña (mínimo 8 caracteres)</label>
          <br />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
          />
        </p>

        <button type="submit" disabled={loading}>
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}
      <p><Link href="/login">Ya tengo una cuenta</Link></p>
    </main>
  );
}