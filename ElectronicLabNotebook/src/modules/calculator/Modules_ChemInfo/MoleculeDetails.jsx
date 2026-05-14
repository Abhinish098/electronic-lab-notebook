import { useEffect, useState } from 'react';

const MoleculeDetails = ({ smiles }) => {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!window.RDKit || !smiles) return;

    const mol = window.RDKit.get_mol(smiles);
    if (mol) {
      // get_descriptors() returns a JSON string of chemical properties
      const desc = JSON.parse(mol.get_descriptors());
      
      setDetails({
        logP: desc.MolLogP?.toFixed(2),
        tpsa: desc.tpsa?.toFixed(2),
        rotatableBonds: desc.NumRotatableBonds,
        mw: desc.amw?.toFixed(2)
      });

      mol.delete(); // Clean up WASM memory
    }
  }, [smiles]);

  if (!details) return null;

  return (
    <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px' }}>
      <li><strong>LogP:</strong> {details.logP}</li>
      <li><strong>TPSA:</strong> {details.tpsa} Å²</li>
      <li><strong>Rotatable Bonds:</strong> {details.rotatableBonds}</li>
      <li><strong>Mol. Weight:</strong> {details.mw} g/mol</li>
    </ul>
  );
};

export default MoleculeDetails;