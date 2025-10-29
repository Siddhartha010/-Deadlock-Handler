import React from 'react';
import { motion } from 'framer-motion';

const SystemMetrics = ({ systemState, currentTime, deadlockDetected }) => {
  const calculateMetrics = () => {
    const totalProcesses = systemState.processes.length;
    const waitingProcesses = systemState.processes.filter(p => p.waiting.length > 0).length;
    const totalResources = systemState.resources.reduce((sum, r) => sum + r.total, 0);
    const availableResources = systemState.resources.reduce((sum, r) => sum + r.available, 0);
    const resourceUtilization = ((totalResources - availableResources) / totalResources * 100).toFixed(1);
    
    return {
      totalProcesses,
      waitingProcesses,
      activeProcesses: totalProcesses - waitingProcesses,
      resourceUtilization,
      systemUptime: currentTime,
      systemStatus: deadlockDetected ? 'DEADLOCKED' : 'RUNNING'
    };
  };

  const metrics = calculateMetrics();

  return (
    <motion.div 
      className="system-metrics card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3>System Metrics</h3>
      
      <div className="metrics-grid">
        <div className="metric-item">
          <div className="metric-value">{metrics.totalProcesses}</div>
          <div className="metric-label">Total Processes</div>
        </div>
        
        <div className="metric-item">
          <div className="metric-value">{metrics.activeProcesses}</div>
          <div className="metric-label">Active Processes</div>
        </div>
        
        <div className="metric-item">
          <div className="metric-value">{metrics.waitingProcesses}</div>
          <div className="metric-label">Waiting Processes</div>
        </div>
        
        <div className="metric-item">
          <div className="metric-value">{metrics.resourceUtilization}%</div>
          <div className="metric-label">Resource Utilization</div>
        </div>
        
        <div className="metric-item">
          <div className="metric-value">{metrics.systemUptime}s</div>
          <div className="metric-label">System Uptime</div>
        </div>
        
        <div className="metric-item">
          <div className={`metric-value status ${metrics.systemStatus.toLowerCase()}`}>
            {metrics.systemStatus}
          </div>
          <div className="metric-label">System Status</div>
        </div>
      </div>
      
      <div className="resource-breakdown">
        <h4>Resource Breakdown</h4>
        {systemState.resources.map(resource => (
          <div key={resource.id} className="resource-metric">
            <span className="resource-name">{resource.name}</span>
            <div className="resource-bar">
              <div 
                className="resource-used"
                style={{ 
                  width: `${((resource.total - resource.available) / resource.total) * 100}%` 
                }}
              />
            </div>
            <span className="resource-text">
              {resource.total - resource.available}/{resource.total}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SystemMetrics;