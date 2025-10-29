import React from 'react';

const AlgorithmSelector = ({ selected, onChange }) => {
  const algorithms = [
    { value: 'bankers', label: 'Banker\'s Algorithm', description: 'Deadlock Avoidance' },
    { value: 'detection', label: 'Wait-for Graph', description: 'Deadlock Detection' },
    { value: 'recovery', label: 'Recovery Methods', description: 'Deadlock Recovery' }
  ];

  return (
    <div className="algorithm-selector">
      <select 
        value={selected} 
        onChange={(e) => onChange(e.target.value)}
        className="algorithm-select"
      >
        {algorithms.map(algo => (
          <option key={algo.value} value={algo.value}>
            {algo.label} - {algo.description}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AlgorithmSelector;