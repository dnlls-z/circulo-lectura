"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function closeSession() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/backend/auth/logout", { method: "POST" });

      if (!response.ok) {
        setError("No se pudo cerrar la sesión. Intenta de nuevo.");
        return;
      }

      window.location.replace("/login");
    } catch {
      setError("No se pudo conectar con la API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={closeSession} disabled={loading}>
        {loading ? "Cerrando sesión…" : "Cerrar sesión"}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}