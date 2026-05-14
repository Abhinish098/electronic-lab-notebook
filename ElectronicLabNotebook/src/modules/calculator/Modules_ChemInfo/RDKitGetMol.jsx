import { useEffect, useState } from 'react';

const RDKitGetMol = ({ smiles }) => {
  const [svg, setSvg] = useState('');

  useEffect(() => {
    // Only proceed if RDKit is globally available
    if (!window.RDKit) return;

    const mol = window.RDKit.get_mol(smiles || "");
    if (mol) {
      setSvg(mol.get_svg());
      
      // Cleanup: Free WASM memory when component unmounts or SMILES changes
      return () => {
        mol.delete();
      };
    }
  }, [smiles]);

  if (!svg) return <span>Invalid Molecule</span>;

  return (
    <div 
      className="molecule-container" 
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
};

export default RDKitGetMol;