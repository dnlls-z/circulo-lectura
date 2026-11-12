import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function fetchCatalog(path: string) {
  const session = (await cookies()).get("session");

  if (!session) {
    redirect("/login");
  }

  const apiUrl = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:8000";
  const response = await fetch(`${apiUrl}${path}`, {
    headers: { Cookie: `session=${session.value}` },
    cache: "no-store",
  }).catch(() => null);

  if (response?.status === 401) {
    redirect("/login");
  }

  return response;
}