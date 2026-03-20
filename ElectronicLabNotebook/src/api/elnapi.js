// src/api/elnApi.js
// Drop this file into ElectronicLabNotebook/src/api/
// Set VITE_API_URL in your .env.local for local dev,
// and in GitHub Actions secrets for the deployed build.

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail?.detail ?? `API error ${res.status}`);
  }
  if (res.status === 204) return null; // DELETE
  return res.json();
}

// ── Experiments ──────────────────────────────────────────────────────────────

export const experimentsApi = {
  /** GET /api/experiments/ */
  list: (skip = 0, limit = 100) =>
    request(`/api/experiments/?skip=${skip}&limit=${limit}`),

  /** GET /api/experiments/:id */
  get: (id) => request(`/api/experiments/${id}`),

  /** POST /api/experiments/ */
  create: (payload) =>
    request("/api/experiments/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** PATCH /api/experiments/:id */
  update: (id, payload) =>
    request(`/api/experiments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  /** DELETE /api/experiments/:id */
  remove: (id) =>
    request(`/api/experiments/${id}`, { method: "DELETE" }),
};

// Usage example inside a React component:
//
// import { experimentsApi } from "../api/elnApi";
//
// const [experiments, setExperiments] = useState([]);
//
// useEffect(() => {
//   experimentsApi.list().then(setExperiments).catch(console.error);
// }, []);
//
// const handleCreate = async () => {
//   const newExp = await experimentsApi.create({
//     title: "My first experiment",
//     author: "Abhinish",
//     status: "active",
//   });
//   setExperiments((prev) => [newExp, ...prev]);
// };
