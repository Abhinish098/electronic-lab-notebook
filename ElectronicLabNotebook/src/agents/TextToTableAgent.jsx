/**
 * TextToTableAgent.jsx
 * Converts free-form or delimited text into an editable structured table.
 * Swap mockTextToTable() for a real POST to ENDPOINTS.TEXT_TO_TABLE.
 */

import { useState } from 'react';
import SectionHeader from '@/components/SectionHeader';
import LoadingBar    from '@/components/LoadingBar';
import ApiNote       from '@/components/ApiNote';
import { mockTextToTable } from '@/services/mockServices';
import { ENDPOINTS } from '@/api/endpoints';

const TextToTableAgent = () => {
  const [text,     setText]     = useState('');
  const [table,    setTable]    = useState(null);
  const [editRows, setEditRows] = useState(null);
  const [loading,  setLoading]  = useState(false);

  const convert = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setTable(null);
    setEditRows(null);
    const res = await mockTextToTable(text);
    setTable(res);
    setEditRows(res ? res.rows.map(r => [...r]) : null);
    setLoading(false);
  };

  const updateCell = (r, c, v) =>
    setEditRows(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = v;
      return next;
    });

  const addRow = () => {
    if (!table) return;
    setEditRows(prev => [...prev, table.headers.map(() => '')]);
  };

  const copyCSV = () => {
    if (!table || !editRows) return;
    const csv = [table.headers.join(','), ...editRows.map(r => r.join(','))].join('\n');
    navigator.clipboard?.writeText(csv);
  };

  return (
    <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
      <SectionHeader
        icon="📊"
        title="Text → Table Agent"
        subtitle="Convert unstructured data into editable, structured tables"
        accentColor="#4ecdc4"
      />

      <textarea
        className="eln-input"
        rows={4}
        style={{ resize: 'none', fontSize: 13, lineHeight: 1.6, fontFamily: 'JetBrains Mono, monospace' }}
        placeholder={'Paste CSV-like or free-form data, e.g.:\nSample A, 1.234, mg/mL\nSample B, 5.678, μM\nControl,  0.010, mg/mL'}
        value={text}
        onChange={e => setText(e.target.value)}
      />

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="eln-btn eln-btn-teal" onClick={convert} disabled={loading || !text.trim()}>
          {loading ? 'Converting…' : '📊 Convert to Table'}
        </button>
        {editRows && (
          <button className="eln-btn" style={{ fontSize: 12 }} onClick={addRow}>+ Add Row</button>
        )}
        {editRows && (
          <button className="eln-btn" style={{ fontSize: 12 }} onClick={copyCSV}>📋 Copy CSV</button>
        )}
      </div>

      {loading && <LoadingBar label="Parsing and structuring data" />}

      {editRows && table && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, color: '#4ecdc4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
            Editable Output — {editRows.length} row{editRows.length !== 1 ? 's' : ''}
          </div>
          <table className="eln-table">
            <thead>
              <tr>{table.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {editRows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>
                      <input
                        style={{ background: 'transparent', border: 'none', color: '#c0c0e0', fontSize: 13, width: '100%', outline: 'none', fontFamily: 'Outfit, sans-serif' }}
                        value={cell}
                        onChange={e => updateCell(ri, ci, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ApiNote endpoint={ENDPOINTS.TEXT_TO_TABLE} />
    </div>
  );
};

export default TextToTableAgent;