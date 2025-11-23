export async function fetchData<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"}/${endpoint}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}
