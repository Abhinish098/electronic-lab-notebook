/**
 * endpoints.js
 * Single source of truth for every FastAPI route consumed by the frontend.
 * Update BASE_URL via the VITE_API_BASE_URL env-variable at build time.
 *
 * FastAPI router prefixes expected:
 *   /api/notebook/...   ← NotebookRouter
 *   /api/agents/...     ← AgentsRouter
 *   /api/calc/...       ← CalculatorRouter
 *   /api/dashboard/...  ← DashboardRouter
 */

export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const ENDPOINTS = {
  // ── Notebook: Pages ───────────────────────────────────────────────────────
  // GET    /api/notebook/pages?notebook_id=<id>       → PageMeta[]
  // POST   /api/notebook/pages                        → PageMeta
  // PATCH  /api/notebook/pages/:id                    → PageMeta
  // DELETE /api/notebook/pages/:id                    → { ok: true }
  PAGES:               `${BASE_URL}/api/notebook/pages`,
  PAGE_BY_ID:  (id)  => `${BASE_URL}/api/notebook/pages/${id}`,

  // ── Notebook: Content (stored separately for large HTML blobs) ─────────────
  // GET    /api/notebook/pages/:id/content            → { content: string, content_type: string }
  // PUT    /api/notebook/pages/:id/content            → { ok: true, updated_at: string }
  PAGE_CONTENT:(id)  => `${BASE_URL}/api/notebook/pages/${id}/content`,

  // ── Notebook: Attachments (images / files embedded in pages) ──────────────
  // POST   /api/notebook/attachments                  → { url: string, id: string }
  ATTACHMENTS:         `${BASE_URL}/api/notebook/attachments`,

  // ── AI Agents ─────────────────────────────────────────────────────────────
  AUTOCOMPLETE:        `${BASE_URL}/api/agents/autocomplete`,
  TEXT_TO_IMAGE:       `${BASE_URL}/api/agents/text-to-image`,
  TEXT_TO_TABLE:       `${BASE_URL}/api/agents/text-to-table`,

  // ── Calculator ────────────────────────────────────────────────────────────
  PROTEIN_ANALYZE:     `${BASE_URL}/api/calc/protein-analyze`,
  MOL_WEIGHT:          `${BASE_URL}/api/calc/mol-weight`,
  DILUTION:            `${BASE_URL}/api/calc/dilution`,

  // ── Dashboard ─────────────────────────────────────────────────────────────
  UPLOAD_DATASET:      `${BASE_URL}/api/dashboard/upload`,
  CHART_DATA:          `${BASE_URL}/api/dashboard/chart`,
};