import { useEffect, useRef } from 'react';

const MolViewer3D = ({ smiles }) => {
  const viewerRef = useRef(null);

  useEffect(() => {
    // 3Dmol attaches to window.$3Dmol
    if (!window.RDKit || !smiles || !window.$3Dmol || !viewerRef.current) return;

    const mol = window.RDKit.get_mol(smiles);
    if (mol) {
      const molBlock = mol.get_molblock();
      
      // Initialize the viewer manually
      const viewer = window.$3Dmol.createViewer(viewerRef.current, {
        backgroundColor: '#1a1a1a'
      });

      viewer.addModel(molBlock, "sdf"); // SDF/Mol format
      viewer.setStyle({}, { stick: { radius: 0.2 }, sphere: { scale: 0.3 } });
      viewer.zoomTo();
      viewer.render();

      mol.delete();
      return () => viewer.clear();
    }
  }, [smiles]);

  return (
    <div 
      ref={viewerRef} 
      style={{ width: '400px', height: '400px', position: 'relative' }} 
    />
  );
};

export default MolViewer3D;
