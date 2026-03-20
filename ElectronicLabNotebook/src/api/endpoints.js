/**
 * endpoints.js
 * Single source of truth for every FastAPI route consumed by the frontend.
 * Update BASE_URL via the VITE_API_BASE_URL env-variable at build time.
 *
 * Usage:
 *   import { ENDPOINTS } from '@/api/endpoints';
 *   const res = await fetch(ENDPOINTS.AUTOCOMPLETE, { method: 'POST', body: ... });
 */

export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const ENDPOINTS = {
  // ── Notebook Agents ──────────────────────────────────────────────────────
  AUTOCOMPLETE:    `${BASE_URL}/api/agents/autocomplete`,
  TEXT_TO_IMAGE:   `${BASE_URL}/api/agents/text-to-image`,
  TEXT_TO_TABLE:   `${BASE_URL}/api/agents/text-to-table`,

  // ── Calculator ────────────────────────────────────────────────────────────
  PROTEIN_ANALYZE: `${BASE_URL}/api/calc/protein-analyze`,
  MOL_WEIGHT:      `${BASE_URL}/api/calc/mol-weight`,
  DILUTION:        `${BASE_URL}/api/calc/dilution`,

  // ── Dashboard ─────────────────────────────────────────────────────────────
  UPLOAD_DATASET:  `${BASE_URL}/api/dashboard/upload`,
  CHART_DATA:      `${BASE_URL}/api/dashboard/chart`,
};