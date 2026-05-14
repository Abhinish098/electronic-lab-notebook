// src/components/SimilarityCall.jsx
import { useEffect, useState } from 'react';

const SimilarityCall = ({ smilesA, smilesB }) => {
  const [similarity, setSimilarity] = useState(null);
  const [fps, setFps] = useState({ a: '', b: '' });
  const [copied, setCopied] = useState('');

  const calculateTanimoto = (fp1, fp2) => {
    let common = 0;
    let total = 0;
    for (let i = 0; i < fp1.length; i++) {
      if (fp1[i] === '1' && fp2[i] === '1') common++;
      if (fp1[i] === '1' || fp2[i] === '1') total++;
    }
    return total === 0 ? 0 : common / total;
  };

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(''), 2000); // Reset feedback after 2s
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  useEffect(() => {
    if (!window.RDKit || !smilesA || !smilesB) return;
    const molA = window.RDKit.get_mol(smilesA);
    const molB = window.RDKit.get_mol(smilesB);

    if (molA && molB) {
      const fpA = molA.get_morgan_fp();
      const fpB = molB.get_morgan_fp();
      setSimilarity(calculateTanimoto(fpA, fpB).toFixed(3));
      setFps({ a: fpA, b: fpB });
      molA.delete();
      molB.delete();
    }
  }, [smilesA, smilesB]);

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px'
  };

  const copyBtnStyle = {
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  // Simple copy icon: 2 overlapping translucent boxes
  const CopyIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
      <rect x="8" y="8" width="12" height="12" rx="2" fill="rgba(100,100,100,0.3)" />
      <rect x="4" y="4" width="12" height="12" rx="2" fill="rgba(100,100,100,0.3)" />
    </svg>
  );

  // Checkmark icon for copied state
  const CheckIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  return (
    <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', maxWidth: '500px' }}>
      <h4>Tanimoto Similarity: <span style={{ color: '#2ecc71' }}>{similarity}</span></h4>

      <div style={{ marginTop: '20px' }}>
        <div style={headerStyle}>
          <strong>Fingerprint A ({smilesA})</strong>
          <button style={copyBtnStyle} onClick={() => handleCopy(fps.a, 'A')} title="Copy fingerprint">
            {copied === 'A' ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>
        
        <div style={headerStyle}>
          <strong>Fingerprint B ({smilesB})</strong>
          <button style={copyBtnStyle} onClick={() => handleCopy(fps.b, 'B')} title="Copy fingerprint">
            {copied === 'B' ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimilarityCall;
