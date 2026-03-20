/**
 * DashboardApp.jsx
 * Data visualisation dashboard.
 * Features:
 *   • Bar / Line / Pie chart switching via Recharts
 *   • Dynamic X-axis field selector
 *   • Multi-select Y-axis fields (checkbox per numeric column)
 *   • CSV import with live re-render
 *   • Inline scrollable data table
 *   • Summary stat cards
 *
 * Swap the DEFAULT_DATA constant for a fetch to ENDPOINTS.CHART_DATA once
 * the FastAPI backend is ready.
 */

import { useState } from 'react';
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import StatCard  from '@/components/StatCard';
import ApiNote   from '@/components/ApiNote';
import { colorAt }  from '@/utils/chartColors';
import { ENDPOINTS } from '@/api/endpoints';

/* ── Seed data ──────────────────────────────────────────────────────────────── */
const DEFAULT_DATA = [
  { name: 'Week 1', absorbance: 0.42, viability: 91.2, yield: 74.5 },
  { name: 'Week 2', absorbance: 0.68, viability: 87.9, yield: 81.3 },
  { name: 'Week 3', absorbance: 0.55, viability: 93.1, yield: 78.6 },
  { name: 'Week 4', absorbance: 0.91, viability: 89.4, yield: 85.2 },
  { name: 'Week 5', absorbance: 0.73, viability: 95.8, yield: 88.9 },
  { name: 'Week 6', absorbance: 1.02, viability: 92.3, yield: 91.4 },
  { name: 'Week 7', absorbance: 0.87, viability: 97.1, yield: 93.7 },
];

/* ── Shared Recharts props ──────────────────────────────────────────────────── */
const TOOLTIP_STYLE = {
  contentStyle: { background: '#0a0a1a', border: '1px solid rgba(124,106,247,0.2)', borderRadius: 8, fontSize: 11 },
};
const LEGEND_STYLE  = { wrapperStyle: { fontSize: 11 } };
const AXIS_PROPS    = { stroke: '#5050a0', tick: { fontSize: 10, fill: '#5050a0' } };
const GRID_PROPS    = { strokeDasharray: '3 3', stroke: 'rgba(100,80,200,0.08)' };

/* ── Helpers ────────────────────────────────────────────────────────────────── */
const numericStats = (data, field) => {
  const vals = data.map(d => d[field]).filter(v => typeof v === 'number');
  if (!vals.length) return { max: '—', min: '—', avg: '—' };
  return {
    max: Math.max(...vals).toFixed(2),
    min: Math.min(...vals).toFixed(2),
    avg: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2),
  };
};

const parseCSV = (raw) => {
  const lines   = raw.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return null;
  const headers = lines[0].split(',').map(h => h.trim());
  const rows    = lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim());
    const obj  = {};
    headers.forEach((h, i) => {
      obj[h] = vals[i] !== undefined && !isNaN(Number(vals[i])) && vals[i] !== ''
        ? parseFloat(vals[i])
        : vals[i] ?? '';
    });
    return obj;
  });
  return { headers, rows };
};

/* ── Component ──────────────────────────────────────────────────────────────── */
const DashboardApp = () => {
  const [data,       setData]       = useState(DEFAULT_DATA);
  const [fields,     setFields]     = useState(['name', 'absorbance', 'viability', 'yield']);
  const [chartType,  setChartType]  = useState('bar');
  const [xField,     setXField]     = useState('name');
  const [yFields,    setYFields]    = useState(['absorbance']);
  const [csvText,    setCsvText]    = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importError, setImportError] = useState('');

  /* ── CSV import ── */
  const handleImport = () => {
    setImportError('');
    const parsed = parseCSV(csvText);
    if (!parsed) { setImportError('Need at least a header row and one data row.'); return; }
    setData(parsed.rows);
    setFields(parsed.headers);
    setXField(parsed.headers[0]);
    setYFields([parsed.headers.find(h => typeof parsed.rows[0]?.[h] === 'number') ?? parsed.headers[1]]);
    setShowImport(false);
    setCsvText('');
  };

  const toggleYField = (f) =>
    setYFields(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const numericFields = fields.filter(f => f !== xField && typeof data[0]?.[f] === 'number');

  /* ── Chart renderers ── */
  const commonProps = { data, margin: { top: 4, right: 12, bottom: 0, left: -10 } };

  const renderChart = () => {
    if (chartType === 'pie') {
      const pieData = data.map(d => ({ name: d[xField], value: d[yFields[0]] ?? 0 }));
      return (
        <PieChart>
          <Pie data={pieData} cx="50%" cy="50%" outerRadius="68%"
            dataKey="value" nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {pieData.map((_, i) => <Cell key={i} fill={colorAt(i)} />)}
          </Pie>
          <Tooltip {...TOOLTIP_STYLE} />
          <Legend {...LEGEND_STYLE} />
        </PieChart>
      );
    }

    const sharedAxes = (
      <>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey={xField} {...AXIS_PROPS} />
        <YAxis {...AXIS_PROPS} />
        <Tooltip {...TOOLTIP_STYLE} />
        <Legend {...LEGEND_STYLE} />
      </>
    );

    if (chartType === 'line') {
      return (
        <LineChart {...commonProps}>
          {sharedAxes}
          {yFields.map((f, i) => (
            <Line key={f} type="monotone" dataKey={f} stroke={colorAt(i)} strokeWidth={2} dot={{ r: 3 }} />
          ))}
        </LineChart>
      );
    }

    // bar (default)
    return (
      <BarChart {...commonProps}>
        {sharedAxes}
        {yFields.map((f, i) => (
          <Bar key={f} dataKey={f} fill={colorAt(i)} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>

      {/* ── Controls Panel ── */}
      <div style={{
        width: 210,
        borderRight: '1px solid rgba(100,80,200,0.1)',
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        overflowY: 'auto',
      }}>
        <div style={{ fontSize: 10, color: '#7c6af7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Visualisation
        </div>

        {/* Chart type */}
        <div>
          <div style={{ fontSize: 11, color: '#8080a0', marginBottom: 7, fontWeight: 600 }}>Chart Type</div>
          {[['bar', '📊 Bar'], ['line', '📈 Line'], ['pie', '🥧 Pie']].map(([t, l]) => (
            <button
              key={t}
              className="eln-btn"
              onClick={() => setChartType(t)}
              style={{
                display: 'block', width: '100%', textAlign: 'left', marginBottom: 4,
                background:   chartType === t ? 'rgba(124,106,247,0.18)' : 'transparent',
                borderColor:  chartType === t ? 'rgba(124,106,247,0.40)' : 'transparent',
                color:        chartType === t ? '#a590ff' : '#7070b0',
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* X-axis */}
        <div>
          <div style={{ fontSize: 11, color: '#8080a0', marginBottom: 6, fontWeight: 600 }}>X-Axis Field</div>
          <select
            className="eln-input"
            value={xField}
            onChange={e => setXField(e.target.value)}
            style={{ fontSize: 12 }}
          >
            {fields.map(f => (
              <option key={f} value={f} style={{ background: '#0a0a1a' }}>{f}</option>
            ))}
          </select>
        </div>

        {/* Y-axis fields */}
        <div>
          <div style={{ fontSize: 11, color: '#8080a0', marginBottom: 7, fontWeight: 600 }}>Y-Axis Field(s)</div>
          {numericFields.length === 0 && (
            <div style={{ fontSize: 12, color: '#404060' }}>No numeric fields found.</div>
          )}
          {numericFields.map((f, i) => (
            <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', marginBottom: 6 }}>
              <input
                type="checkbox"
                checked={yFields.includes(f)}
                onChange={() => toggleYField(f)}
                style={{ accentColor: colorAt(i), width: 14, height: 14, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 12, color: yFields.includes(f) ? colorAt(i) : '#6060a0' }}>{f}</span>
            </label>
          ))}
        </div>

        {/* Import */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button className="eln-btn" style={{ fontSize: 12 }} onClick={() => { setShowImport(v => !v); setImportError(''); }}>
            {showImport ? '✕ Close Import' : '📤 Import CSV'}
          </button>
          {showImport && (
            <>
              <textarea
                className="eln-input"
                rows={7}
                style={{ resize: 'none', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                placeholder={'name,val1,val2\nA,10,20\nB,30,40'}
                value={csvText}
                onChange={e => setCsvText(e.target.value)}
              />
              {importError && <div style={{ fontSize: 11, color: '#f76a6a' }}>⚠️ {importError}</div>}
              <button className="eln-btn eln-btn-solid" onClick={handleImport} disabled={!csvText.trim()}>
                Import
              </button>
              <button className="eln-btn" onClick={() => setData(DEFAULT_DATA)} style={{ fontSize: 11 }}>
                ↺ Reset to demo data
              </button>
            </>
          )}
        </div>

        <ApiNote endpoint={ENDPOINTS.CHART_DATA} />
      </div>

      {/* ── Chart + Table Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Stat cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(yFields.length + 1, 4)}, 1fr)`,
          gap: 8,
          padding: '10px 16px',
          borderBottom: '1px solid rgba(100,80,200,0.08)',
          flexShrink: 0,
        }}>
          <StatCard label="Data Points" value={data.length} color="#7c6af7" icon="📌" />
          {yFields.slice(0, 3).map((f, i) => {
            const s = numericStats(data, f);
            return <StatCard key={f} label={`${f} avg`} value={s.avg} color={colorAt(i)} icon="∅" />;
          })}
        </div>

        {/* Chart */}
        <div style={{ flex: 1, padding: '16px 18px 6px', minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {/* Data Table */}
        <div style={{ maxHeight: 140, overflowY: 'auto', borderTop: '1px solid rgba(100,80,200,0.08)', margin: '0 16px 10px' }}>
          <table className="eln-table" style={{ fontSize: 12 }}>
            <thead>
              <tr>{fields.map(f => <th key={f}>{f}</th>)}</tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  {fields.map(f => (
                    <td key={f} style={{ fontFamily: typeof row[f] === 'number' ? 'JetBrains Mono, monospace' : 'Outfit, sans-serif' }}>
                      {typeof row[f] === 'number' ? row[f] : row[f]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default DashboardApp;