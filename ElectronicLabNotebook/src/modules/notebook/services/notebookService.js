/**
 * notebookService.js
 * API service layer for the Notebook module.
 *
 * ─── Storage design (PostgreSQL) ─────────────────────────────────────────────
 *
 * Table: notebooks
 *   id          UUID  PK
 *   name        TEXT
 *   created_at  TIMESTAMPTZ
 *   updated_at  TIMESTAMPTZ
 *
 * Table: pages
 *   id           UUID  PK
 *   notebook_id  UUID  FK → notebooks.id  ON DELETE CASCADE
 *   title        TEXT  NOT NULL  DEFAULT 'Untitled'
 *   position     INT   NOT NULL  DEFAULT 0          -- for manual ordering
 *   created_at   TIMESTAMPTZ
 *   updated_at   TIMESTAMPTZ
 *
 * Table: page_contents
 *   page_id      UUID  PK  FK → pages.id  ON DELETE CASCADE
 *   content      TEXT  NOT NULL  DEFAULT ''
 *   content_type VARCHAR(32)  DEFAULT 'html/v1'
 *   updated_at   TIMESTAMPTZ
 *
 *   Rationale: content is stored in its own table so the `pages` list query
 *   (which only needs title + metadata) stays lightweight. The full HTML blob
 *   is fetched lazily when the user opens a page.
 *
 *   content_type values:
 *     'html/v1'  — raw innerHTML string (current)
 *     'html/v2'  — future sanitised + normalised HTML
 *     'json/tiptap' — if migrated to TipTap JSON schema
 *
 * Table: page_attachments
 *   id          UUID  PK
 *   page_id     UUID  FK → pages.id  ON DELETE CASCADE
 *   filename    TEXT
 *   mime_type   TEXT
 *   storage_url TEXT            -- S3 / MinIO presigned URL
 *   created_at  TIMESTAMPTZ
 *
 *   Images inserted by the Text→Image tool are referenced here.
 *   The <img src="..."> in the HTML content points to storage_url.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * To connect to FastAPI:
 *   1. Set USE_MOCK = false  (or set VITE_USE_MOCK=false in .env)
 *   2. Ensure vite.config.js proxies /api → http://127.0.0.1:8000
 *   3. Implement the matching FastAPI routers (see endpoint comments above)
 */

import { ENDPOINTS } from '@/api/endpoints';

// ── Feature flag ─────────────────────────────────────────────────────────────
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// ── Mock seed data ────────────────────────────────────────────────────────────
const MOCK_NOTEBOOK_ID = 'notebook-001';

let mockPages = [
  { id: 'page-1', notebook_id: MOCK_NOTEBOOK_ID, title: 'Buffer Optimisation Study', position: 0, created_at: '2025-01-15T09:00:00Z', updated_at: '2025-01-15T09:00:00Z' },
  { id: 'page-2', notebook_id: MOCK_NOTEBOOK_ID, title: 'Cell Viability Assay',      position: 1, created_at: '2025-01-18T11:00:00Z', updated_at: '2025-01-18T11:00:00Z' },
  { id: 'page-3', notebook_id: MOCK_NOTEBOOK_ID, title: 'Crystallisation Protocol',  position: 2, created_at: '2025-01-22T14:00:00Z', updated_at: '2025-01-22T14:00:00Z' },
];

// content_type: 'html/v1' — raw innerHTML
const mockContents = {
  'page-1':
    '<h3>Objective</h3>' +
    '<p>Determine the optimal buffer conditions for enzyme assay at varying pH levels (6.0 – 8.5).</p>' +
    '<h3>Materials</h3>' +
    '<p>PBS buffer, Tris-HCl, sodium acetate, enzyme stock solution (2 mg/mL).</p>' +
    '<h3>Observations</h3>' +
    '<p>Maximum activity observed at pH 7.4 with Tris-HCl buffer. Significant reduction in activity below pH 6.5.</p>',

  'page-2':
    '<h3>Procedure</h3>' +
    '<p>MTT assay performed on HeLa cells at passage 12. Cells seeded at 1×10⁴ per well in 96-well plate.</p>',

  'page-3':
    '<h3>Hanging Drop Setup</h3>' +
    '<p>Reservoir solution: 20% PEG 4000, 0.1 M HEPES pH 7.5, 0.2 M MgCl₂.</p>',
};

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// ── Mock implementations ──────────────────────────────────────────────────────

const mock = {
  async fetchPages(/* notebookId */) {
    await delay(120);
    // Return metadata only — no content blobs in the list
    return [...mockPages].sort((a, b) => a.position - b.position);
  },

  async fetchPageContent(pageId) {
    await delay(80);
    return {
      content:      mockContents[pageId] ?? '<p></p>',
      content_type: 'html/v1',
    };
  },

  async createPage(notebookId, { title }) {
    await delay(100);
    const newPage = {
      id:          `page-${Date.now()}`,
      notebook_id: notebookId,
      title:       title ?? 'Untitled',
      position:    mockPages.length,
      created_at:  new Date().toISOString(),
      updated_at:  new Date().toISOString(),
    };
    mockPages.push(newPage);
    mockContents[newPage.id] = '<p></p>';
    return newPage;
  },

  async updatePageMeta(pageId, { title, position }) {
    await delay(80);
    mockPages = mockPages.map(p =>
      p.id === pageId
        ? { ...p, title: title ?? p.title, position: position ?? p.position, updated_at: new Date().toISOString() }
        : p
    );
    return mockPages.find(p => p.id === pageId);
  },

  async updatePageContent(pageId, content) {
    await delay(90);
    mockContents[pageId] = content;
    return { ok: true, updated_at: new Date().toISOString() };
  },

  async deletePage(pageId) {
    await delay(80);
    mockPages = mockPages.filter(p => p.id !== pageId);
    delete mockContents[pageId];
    return { ok: true };
  },
};

// ── Real FastAPI implementations (uncomment when backend is ready) ─────────────

const real = {
  async fetchPages(notebookId) {
    const res = await fetch(`${ENDPOINTS.PAGES}?notebook_id=${notebookId}`);
    if (!res.ok) throw new Error(`fetchPages failed: ${res.status}`);
    return res.json();
  },

  async fetchPageContent(pageId) {
    const res = await fetch(ENDPOINTS.PAGE_CONTENT(pageId));
    if (!res.ok) throw new Error(`fetchPageContent failed: ${res.status}`);
    return res.json();   // { content: string, content_type: string }
  },

  async createPage(notebookId, data) {
    const res = await fetch(ENDPOINTS.PAGES, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ notebook_id: notebookId, ...data }),
    });
    if (!res.ok) throw new Error(`createPage failed: ${res.status}`);
    return res.json();
  },

  async updatePageMeta(pageId, data) {
    const res = await fetch(ENDPOINTS.PAGE_BY_ID(pageId), {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`updatePageMeta failed: ${res.status}`);
    return res.json();
  },

  async updatePageContent(pageId, content) {
    const res = await fetch(ENDPOINTS.PAGE_CONTENT(pageId), {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ content, content_type: 'html/v1' }),
    });
    if (!res.ok) throw new Error(`updatePageContent failed: ${res.status}`);
    return res.json();
  },

  async deletePage(pageId) {
    const res = await fetch(ENDPOINTS.PAGE_BY_ID(pageId), { method: 'DELETE' });
    if (!res.ok) throw new Error(`deletePage failed: ${res.status}`);
    return res.json();
  },
};

// ── Exported service (automatically switches based on USE_MOCK flag) ───────────
export const notebookService = USE_MOCK ? mock : real;

export { MOCK_NOTEBOOK_ID };