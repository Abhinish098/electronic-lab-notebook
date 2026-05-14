// src/components/MolDetailCall.jsx
import { useEffect, useState } from 'react';

const MolDetailCall = ({ smiles }) => {
  const [data, setData] = useState({ svg: '', details: null });

  useEffect(() => {
    if (!window.RDKit || !smiles) return;

    const mol = window.RDKit.get_mol(smiles);
    if (mol) {
      const desc = JSON.parse(mol.get_descriptors());
      
      setData({
        svg: mol.get_svg(),
        details: {
          logP: desc.MolLogP?.toFixed(2),
          tpsa: desc.tpsa?.toFixed(2),
          rotatableBonds: desc.NumRotatableBonds,
          mw: desc.amw?.toFixed(2)
        }
      });

      mol.delete(); // Crucial memory cleanup
    }
  }, [smiles]);

  if (!data.details) return <p>Invalid SMILES</p>;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
      {/* Visual Render */}
      <div dangerouslySetInnerHTML={{ __html: data.svg }} style={{ width: '200px' }} />
      
      {/* Property List */}
      <div style={{ borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li><strong>LogP:</strong> {data.details.logP}</li>
          <li><strong>TPSA:</strong> {data.details.tpsa}</li>
          <li><strong>Rot. Bonds:</strong> {data.details.rotatableBonds}</li>
          <li><strong>MW:</strong> {data.details.mw}</li>
        </ul>
      </div>
    </div>
  );
};

export default MolDetailCall;
