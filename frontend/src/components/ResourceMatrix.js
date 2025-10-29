import React from 'react';
import { motion } from 'framer-motion';

const ResourceMatrix = ({ config, onChange }) => {
  const updateMatrix = (matrix, row, col, value) => {
    const newMatrix = [...matrix];
    newMatrix[row] = [...newMatrix[row]];
    newMatrix[row][col] = parseInt(value) || 0;
    return newMatrix;
  };

  const updateAllocation = (row, col, value) => {
    const newAllocation = updateMatrix(config.allocation, row, col, value);
    onChange({ ...config, allocation: newAllocation });
  };

  const updateMaxNeed = (row, col, value) => {
    const newMaxNeed = updateMatrix(config.maxNeed, row, col, value);
    onChange({ ...config, maxNeed: newMaxNeed });
  };

  const updateAvailable = (index, value) => {
    const newAvailable = [...config.available];
    newAvailable[index] = parseInt(value) || 0;
    onChange({ ...config, available: newAvailable });
  };

  return (
    <div className="resource-matrix">
      <motion.div 
        className="matrix-section"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h3>Allocation Matrix</h3>
        <div className="matrix">
          <div className="matrix-header">
            <div className="cell">Process</div>
            {Array.from({ length: config.resources }, (_, i) => (
              <div key={i} className="cell">R{i}</div>
            ))}
          </div>
          {config.allocation.map((row, rowIndex) => (
            <div key={rowIndex} className="matrix-row">
              <div className="cell process-label">P{rowIndex}</div>
              {row.map((value, colIndex) => (
                <div key={colIndex} className="cell">
                  <input
                    type="number"
                    min="0"
                    value={value}
                    onChange={(e) => updateAllocation(rowIndex, colIndex, e.target.value)}
                    className="matrix-input"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        className="matrix-section"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3>Maximum Need Matrix</h3>
        <div className="matrix">
          <div className="matrix-header">
            <div className="cell">Process</div>
            {Array.from({ length: config.resources }, (_, i) => (
              <div key={i} className="cell">R{i}</div>
            ))}
          </div>
          {config.maxNeed.map((row, rowIndex) => (
            <div key={rowIndex} className="matrix-row">
              <div className="cell process-label">P{rowIndex}</div>
              {row.map((value, colIndex) => (
                <div key={colIndex} className="cell">
                  <input
                    type="number"
                    min="0"
                    value={value}
                    onChange={(e) => updateMaxNeed(rowIndex, colIndex, e.target.value)}
                    className="matrix-input"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        className="matrix-section"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3>Available Resources</h3>
        <div className="available-resources">
          {config.available.map((value, index) => (
            <div key={index} className="resource-input">
              <label>R{index}:</label>
              <input
                type="number"
                min="0"
                value={value}
                onChange={(e) => updateAvailable(index, e.target.value)}
                className="matrix-input"
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ResourceMatrix;