"use client";
import Link from "next/link";

import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/backend/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.detail ?? "No se pudo iniciar sesión.");
        return;
      }

      window.location.assign("/catalogo");
    } catch {
      setError("No se pudo conectar con la API. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Iniciar sesión</h1>

      <form onSubmit={handleSubmit}>
        <p>
          <label htmlFor="email">Correo electrónico</label>
          <br />
          <input id="email" name="email" type="email" autoComplete="email" required />
        </p>

        <p>
          <label htmlFor="password">Contraseña</label>
          <br />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </p>

        <button type="submit" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p><Link href="/registro">Crear una cuenta</Link></p>

      {error && <p role="alert">{error}</p>}
    </main>
  );
}



