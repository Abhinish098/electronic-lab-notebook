/**
 * ProteinAnalyzer.jsx
 * Accepts a .pdb file (RMSD) or .xtc + .tpr files (MD stability).
 * "demo" mode runs the analysis without requiring an upload.
 * Swap mockProteinAnalysis() for a real POST to ENDPOINTS.PROTEIN_ANALYZE.
 */

import { useRef, useState } from 'react';
import {
  CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import SectionHeader         from '@/components/SectionHeader';
import LoadingBar            from '@/components/LoadingBar';
import StatCard              from '@/components/StatCard';
import ApiNote               from '@/components/ApiNote';
import { mockProteinAnalysis } from '@/services/mockServices';
import { ENDPOINTS }           from '@/api/endpoints';

const MODES = [
  { id: 'pdb',     label: 'PDB',     description: 'RMSD from .pdb' },
  { id: 'xtc+tpr', label: 'XTC+TPR', description: 'MD stability'    },
  { id: 'demo',    label: 'Demo',    description: 'No upload needed' },
];

const ProteinAnalyzer = () => {
  const [mode,     setMode]     = useState('demo');
  const [fileName, setFileName] = useState(null);
  const [results,  setResults]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const fileRef = useRef(null);

  const analyze = async () => {
    setLoading(true);
    setResults(null);
    const type = mode === 'demo' ? 'pdb' : mode;
    const res  = await mockProteinAnalysis(type);
    setResults(res);
    setLoading(false);
  };

  const isRMSD = results?.analysisType === 'RMSD Analysis';

  return (
    <div style={{ padding: 20, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <SectionHeader
        icon="🧬"
        title="Protein Structure Analyser"
        subtitle="RMSD analysis from PDB · Stability analysis from XTC + TPR"
        accentColor="#4ecdc4"
      />

      {/* ── Mode selector ── */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, color: '#8080a0', marginBottom: 7, fontWeight: 600 }}>Analysis Mode</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {MODES.map(m => (
              <button
                key={m.id}
                className={`eln-btn ${mode === m.id ? 'eln-btn-teal' : ''}`}
                onClick={() => { setMode(m.id); setFileName(null); setResults(null); }}
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
                title={m.description}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {mode !== 'demo' && (
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, color: '#8080a0', marginBottom: 7, fontWeight: 600 }}>Upload File</div>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: '2px dashed rgba(78,205,196,0.22)',
                borderRadius: 10,
                padding: '10px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: fileName ? 'rgba(78,205,196,0.06)' : 'transparent',
                transition: 'border-color .18s',
              }}
            >
              <span style={{ fontSize: 18 }}>📁</span>
              <span style={{ fontSize: 13, color: fileName ? '#4ecdc4' : '#5050a0' }}>
                {fileName ?? `Upload .${mode.includes('+') ? mode.split('+')[0] : mode} file`}
              </span>
            </div>
            <input
              ref={fileRef}
              type="file"
              style={{ display: 'none' }}
              onChange={e => setFileName(e.target.files?.[0]?.name ?? null)}
            />
          </div>
        )}
      </div>

      <button
        className="eln-btn eln-btn-teal"
        onClick={analyze}
        disabled={loading}
        style={{ alignSelf: 'flex-start' }}
      >
        {loading ? '⚙️ Running Analysis…' : '🔬 Run Analysis'}
      </button>

      {loading && <LoadingBar label="Running molecular dynamics computation" />}

      {/* ── Results ── */}
      {results && (
        <div className="eln-window" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
            {isRMSD ? (
              <>
                <StatCard label="RMSD"       value={`${results.rmsd} Å`}        color="#7c6af7" icon="📐" />
                <StatCard label="Residues"   value={results.residues}            color="#4ecdc4" icon="🔗" />
                <StatCard label="Chains"     value={results.chains.join(', ')}  color="#f7c66a" icon="🧬" />
                <StatCard label="Resolution" value={`${results.resolution} Å`}  color="#f76a6a" icon="🔭" />
              </>
            ) : (
              <>
                <StatCard label="Avg RMSF"          value={`${results.avgRMSF} Å`}                  color="#7c6af7" icon="📐" />
                <StatCard label="Radius of Gyration" value={`${results.Rg} nm`}                     color="#4ecdc4" icon="📏" />
                <StatCard label="Total Frames"       value={results.totalFrames.toLocaleString()}    color="#f7c66a" icon="🎞️" />
              </>
            )}
          </div>

          {/* Line Chart */}
          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(100,80,200,0.1)' }}>
            <div style={{ fontSize: 11, color: '#7c6af7', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {isRMSD ? 'RMSD vs Frame Number' : 'RMSF & Rg Over Simulation Time (ns)'}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={results.data} margin={{ top: 4, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,100,255,0.08)" />
                <XAxis
                  dataKey={isRMSD ? 'frame' : 'time'}
                  stroke="#5050a0"
                  tick={{ fontSize: 10, fill: '#5050a0' }}
                />
                <YAxis stroke="#5050a0" tick={{ fontSize: 10, fill: '#5050a0' }} />
                <Tooltip
                  contentStyle={{ background: '#0a0a1a', border: '1px solid rgba(124,106,247,0.2)', borderRadius: 8, fontSize: 11 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey={isRMSD ? 'rmsd' : 'rmsf'}
                  stroke="#7c6af7"
                  strokeWidth={2}
                  dot={false}
                  name={isRMSD ? 'RMSD (Å)' : 'RMSF (Å)'}
                />
                {!isRMSD && (
                  <Line type="monotone" dataKey="rg" stroke="#4ecdc4" strokeWidth={2} dot={false} name="Rg (nm)" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <ApiNote endpoint={ENDPOINTS.PROTEIN_ANALYZE} />
        </div>
      )}
    </div>
  );
};

export default ProteinAnalyzer;