// src/components/SubstructureSearching&Highlighting/SubstructureCall.jsx
import MolHighlight from './MolHighlight';

const SubstructureCall = ({ smiles, query }) => {
  return (
    <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
      <h4>Highlighting Pattern: <code style={{color: 'red'}}>{query}</code></h4>
      <MolHighlight smiles={smiles} substructure={query} />
    </div>
  );
};

export default SubstructureCall;
