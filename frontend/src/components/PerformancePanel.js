import React from 'react';
import { motion } from 'framer-motion';

const PerformancePanel = ({ metrics }) => {
  return (
    <motion.div 
      className="performance-panel card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3>Real-Time Performance</h3>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{metrics.requests_processed}</div>
          <div className="metric-label">Requests Processed</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value">{metrics.deadlocks_detected}</div>
          <div className="metric-label">Deadlocks Detected</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value">
            {(metrics.avg_response_time * 1000).toFixed(1)}ms
          </div>
          <div className="metric-label">Avg Response Time</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value">
            {metrics.throughput.toFixed(1)}/s
          </div>
          <div className="metric-label">Throughput</div>
        </div>
      </div>
      
      <div className="efficiency-indicator">
        <div className="efficiency-bar">
          <div 
            className="efficiency-fill"
            style={{ 
              width: `${Math.max(0, 100 - (metrics.deadlocks_detected * 10))}%`,
              backgroundColor: metrics.deadlocks_detected > 5 ? '#F44336' : 
                             metrics.deadlocks_detected > 2 ? '#FF9800' : '#4CAF50'
            }}
          />
        </div>
        <span className="efficiency-label">System Efficiency</span>
      </div>
    </motion.div>
  );
};

export default PerformancePanel;