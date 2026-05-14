/**
 * ChemInformatics.jsx
 * Chem-Informatics tool — same layout pattern as MolWeightCalc.jsx.
 *
 * Architecture:
 *   – MODULES registry (mirrors TOOLS in CalculatorApp) — one entry per operation.
 *   – Each operation lives in its own file under Modules_ChemInfo/.
 *   – Dynamic molecule inputs (start with 2, add/remove freely).
 *   – Module chosen via a simple <select> dropdown.
 *   – On "Run", committed state triggers the selected operation component.
 *
 * To add a new operation:
 *   1. Create Op_YourOp.jsx in Modules_ChemInfo/.
 *   2. Import it here and push a new entry into MODULES.
 */

import { useState } from 'react';
import SectionHeader from '@/components/SectionHeader';

import Op_Render      from './Modules_ChemInfo/Op_Render';
import Op_Descriptors from './Modules_ChemInfo/Op_Descriptors';
import Op_Similarity  from './Modules_ChemInfo/Op_Similarity';
import Op_Substructure from './Modules_ChemInfo/Op_Substructure';
import Op_Viewer3D    from './Modules_ChemInfo/Op_Viewer3D';

/* ─────────────────────────────────────────────────────────────────────────────
   MODULE REGISTRY — mirrors TOOLS in CalculatorApp.jsx.
   To add a new operation: create its Op_*.jsx file and push an entry here.
───────────────────────────────────────────────────────────────────────────── */
const MODULES = [
  { id: 'descriptors',  label: 'Molecular Descriptors', component: Op_Descriptors,  needsQuery: false },
  { id: 'similarity',   label: 'Tanimoto Similarity',   component: Op_Similarity,   needsQuery: false },
  { id: 'substructure', label: 'Substructure Search',   component: Op_Substructure, needsQuery: true  },
  { id: 'render',       label: '2D Structure Render',   component: Op_Render,       needsQuery: false },
  { id: 'viewer3d',     label: '3D Conformation',       component: Op_Viewer3D,     needsQuery: false },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Shared micro-styles (scoped to this file only)
───────────────────────────────────────────────────────────────────────────── */
const fieldLabelStyle = {
  fontSize: 11,
  color: '#8080a0',
  marginBottom: 5,
  fontWeight: 600,
};

/* ─────────────────────────────────────────────────────────────────────────────
   Initial state
───────────────────────────────────────────────────────────────────────────── */
const INITIAL_MOLECULES = [
  { smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C', label: 'Caffeine' },
  { smiles: 'CC(=O)Oc1ccccc1C(=O)O',         label: 'Aspirin'  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   ChemInformatics — root component
───────────────────────────────────────────────────────────────────────────── */
const ChemInformatics = () => {
  const [molecules,  setMolecules]  = useState(INITIAL_MOLECULES);
  const [activeId,   setActiveId]   = useState('descriptors');
  const [query,      setQuery]      = useState('c1ccccc1');
  const [committed,  setCommitted]  = useState(null);
  const [runKey,     setRunKey]     = useState(0);
  const [error,      setError]      = useState('');

  /* ── Molecule CRUD ── */
  const updateMolecule = (idx, field, value) =>
    setMolecules(prev => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));

  const addMolecule = () =>
    setMolecules(prev => [...prev, { smiles: '', label: `Molecule ${prev.length + 1}` }]);

  const removeMolecule = (idx) =>
    setMolecules(prev => prev.filter((_, i) => i !== idx));

  /* ── Run ── */
  const run = () => {
    setError('');
    const valid = molecules.filter(m => m.smiles);
    if (!valid.length) { setError('Enter at least one valid SMILES string.'); return; }
    if (activeId === 'similarity' && valid.length < 2) {
      setError('Similarity requires at least 2 molecules.'); return;
    }
    setRunKey(k => k + 1);
    setCommitted({ molecules: valid, moduleId: activeId, query });
  };

  const activeModule = MODULES.find(m => m.id === activeId);
  const ActiveOutput = activeModule?.component ?? null;
  const showQuery    = activeModule?.needsQuery;

  /* ─── render ─── */
  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflowY: 'auto' }}>

      {/* Header */}
      <SectionHeader
        icon="🧪"
        title="Chem Informatics"
        subtitle="Structure rendering · Descriptors · Similarity · Substructure search · 3D viewer"
        accentColor="#4ecdc4"
      />

      {/* ── Module selector ── */}
      <div>
        <div style={fieldLabelStyle}>Operation</div>
        <select
          id="cheminf-module-select"
          value={activeId}
          onChange={e => { setActiveId(e.target.value); setCommitted(null); setError(''); }}
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: 8,
            border: '1px solid rgba(100,80,200,0.22)',
            background: 'rgba(10,10,22,0.85)',
            color: '#b0a8d8',
            fontSize: 13,
            fontFamily: 'inherit',
            cursor: 'pointer',
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237c6af7' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            paddingRight: 30,
          }}
        >
          {MODULES.map(m => (
            <option key={m.id} value={m.id} style={{ background: '#0a0a16', color: '#b0a8d8' }}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Molecule inputs ── */}
      <div>
        <div style={{ ...fieldLabelStyle, marginBottom: 8 }}>
          Molecules
          <span style={{
            marginLeft: 8, fontSize: 9,
            background: 'rgba(78,205,196,0.12)', color: '#4ecdc4',
            borderRadius: 4, padding: '2px 6px', fontWeight: 700,
          }}>
            {molecules.filter(m => m.smiles).length} valid
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 4, paddingRight: molecules.length > 1 ? 34 : 0 }}>
          <div style={{ flex: 1, fontSize: 10, color: '#6060a0', fontWeight: 600 }}>SMILES</div>
          <div style={{ width: 120, fontSize: 10, color: '#6060a0', fontWeight: 600 }}>Label</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {molecules.map((mol, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                id={`cheminf-smiles-${idx}`}
                className="eln-input"
                value={mol.smiles}
                onChange={e => updateMolecule(idx, 'smiles', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && run()}
                placeholder={`SMILES for molecule ${idx + 1}`}
                style={{ flex: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
              />
              <input
                id={`cheminf-label-${idx}`}
                className="eln-input"
                value={mol.label}
                onChange={e => updateMolecule(idx, 'label', e.target.value)}
                placeholder={`Label ${idx + 1}`}
                style={{ width: 120, fontSize: 12 }}
              />
              {molecules.length > 1 && (
                <button
                  onClick={() => removeMolecule(idx)}
                  title="Remove molecule"
                  style={{
                    width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                    border: '1px solid rgba(247,106,106,0.3)',
                    background: 'rgba(247,106,106,0.06)',
                    color: '#f76a6a', cursor: 'pointer', fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <button
            id="cheminf-add-molecule"
            onClick={addMolecule}
            style={{
              alignSelf: 'flex-start',
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px',
              border: '1px dashed rgba(78,205,196,0.35)',
              borderRadius: 8,
              background: 'transparent',
              color: '#4ecdc4',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Molecule
          </button>
        </div>
      </div>

      {/* ── Substructure query (visible only for Substructure Search) ── */}
      {showQuery && (
        <div>
          <div style={fieldLabelStyle}>SMARTS / SMILES Query</div>
          <input
            id="cheminf-query"
            className="eln-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && run()}
            placeholder="e.g. c1ccccc1 for benzene ring"
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ fontSize: 12, color: '#f76a6a', background: 'rgba(247,106,106,0.08)', borderRadius: 8, padding: '7px 12px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Run button */}
      <button
        id="cheminf-run"
        className="eln-btn eln-btn-teal"
        onClick={run}
        style={{ alignSelf: 'flex-start' }}
      >
        🔬 Run {activeModule?.label}
      </button>

      {/* ── Output ── */}
      {committed?.moduleId === activeId && ActiveOutput && (
        <div className="eln-window" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 11, color: '#4ecdc4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {activeModule?.label} · Results
          </div>
          <ActiveOutput
            key={runKey}
            molecules={committed.molecules}
            query={committed.query}
          />
        </div>
      )}

    </div>
  );
};

export default ChemInformatics;