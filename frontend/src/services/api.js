const baseUrl = (import.meta.env.VITE_API_BASE_URL || "/api").replace(
  /\/$/,
  "",
);

async function get(path, signal) {
  const response = await fetch(`${baseUrl}${path}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok)
    throw new Error(
      `La API respondió con un error (${response.status}). Verifica que el backend esté disponible.`,
    );
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error("La API no devolvió JSON. Revisa la URL de conexión.");
  }
  return response.json();
}

export async function getDashboard(signal) {
  const [status, summary, alerts, devices, services] = await Promise.all([
    get("/status", signal),
    get("/summary", signal),
    get("/alerts", signal),
    get("/devices", signal),
    get("/services", signal),
  ]);
  return { status, summary, alerts, devices, services };
}
