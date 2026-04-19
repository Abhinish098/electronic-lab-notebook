/**
 * windowRegistry.js
 * Declarative map of every application window.
 * Adding a new module requires only a new entry here + a component import.
 *
 * Fields:
 *   title       — shown in the window title bar
 *   icon        — emoji used in title bar and taskbar
 *   component   — lazy-imported React component (swap to React.lazy if needed)
 *   defaultPos  — { x, y } initial top-left corner in pixels
 *   defaultSize — { w, h } initial window dimensions in pixels
 *   taskbar     — whether the app appears in the taskbar
 */

import { lazy } from 'react';

const NotebookApp   = lazy(() => import('@/modules/notebook/NotebookApp'));
const CalculatorApp = lazy(() => import('@/modules/calculator/CalculatorApp'));
const DashboardApp  = lazy(() => import('@/modules/dashboard/DashboardApp'));

export const WINDOW_REGISTRY = {
  notebook: {
    title:       'Lab Notebook',
    icon:        '📓',
    component:   NotebookApp,
    defaultPos:  { x: 55,  y: 28 },
    defaultSize: { w: 1000, h: 620 },
    taskbar:     true,
  },
  calculator: {
    title:       'Bio Calculator',
    icon:        '🧮',
    component:   CalculatorApp,
    defaultPos:  { x: 130, y: 48 },
    defaultSize: { w: 860,  h: 580 },
    taskbar:     true,
  },
  dashboard: {
    title:       'Data Dashboard',
    icon:        '📊',
    component:   DashboardApp,
    defaultPos:  { x: 75,  y: 38 },
    defaultSize: { w: 980,  h: 610 },
    taskbar:     true,
  },
};

/** Ordered list of taskbar apps (only those with taskbar: true). */
export const TASKBAR_APPS = Object.entries(WINDOW_REGISTRY)
  .filter(([, cfg]) => cfg.taskbar)
  .map(([id, cfg]) => ({ id, label: cfg.title, icon: cfg.icon }));