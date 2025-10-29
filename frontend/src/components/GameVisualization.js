import React from 'react';
import { motion } from 'framer-motion';

const GameVisualization = ({ gameState, currentRequest }) => {
  const processes = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    active: currentRequest?.processId === i,
    resources: { A: 0, B: 0, C: 0 } // Simplified for game
  }));

  return (
    <div className="game-visualization card">
      <h3>System State</h3>
      
      <div className="processes-grid">
        {processes.map((process) => (
          <motion.div
            key={process.id}
            className={`game-process ${process.active ? 'requesting' : ''}`}
            animate={process.active ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, repeat: process.active ? Infinity : 0 }}
          >
            <div className="process-header">
              <span className="process-name">P{process.id}</span>
              {process.active && <span className="request-indicator">🔔</span>}
            </div>
            
            <div className="process-resources">
              {Object.entries(process.resources).map(([type, count]) => (
                <div key={type} className="resource-bar">
                  <span className="resource-type">{type}</span>
                  <div className="resource-visual">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div
                        key={i}
                        className={`resource-unit ${i < count ? 'allocated' : 'free'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="resource-pool">
        <h4>Available Resources</h4>
        <div className="resource-pool-grid">
          {Object.entries(gameState.available).map(([type, count]) => (
            <div key={type} className="pool-resource">
              <div className="pool-header">
                <span className="pool-type">Resource {type}</span>
                <span className="pool-count">{count}</span>
              </div>
              <div className="pool-visual">
                {Array.from({ length: gameState.resources[type] }, (_, i) => (
                  <motion.div
                    key={i}
                    className={`pool-unit ${i < count ? 'available' : 'allocated'}`}
                    animate={i < count ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.3 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {currentRequest && (
        <motion.div
          className="request-visualization"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="request-arrow">
            P{currentRequest.processId} → Resource {currentRequest.resourceType} ({currentRequest.amount})
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GameVisualization;