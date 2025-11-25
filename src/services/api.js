const API_URL = import.meta.env.VITE_API_URL;

export async function getDashboardData() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Erro ao carregar API");
  return res.json();
}

