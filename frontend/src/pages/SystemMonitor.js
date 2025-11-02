import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getSystemProcesses, getSystemResources } from '../utils/systemApi';
import '../styles/SystemMonitor.css';

const SystemMonitor = () => {
  const [processes, setProcesses] = useState([]);
  const [resources, setResources] = useState([]);
  const [deadlockInfo, setDeadlockInfo] = useState(null);

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const [processesRes, resourcesRes] = await Promise.all([
          getSystemProcesses(),
          getSystemResources()
        ]);
        
        setProcesses(processesRes.data.processes);
        setResources(resourcesRes.data.resources);
        
        // Simple deadlock detection based on high resource usage
        const highCpuProcesses = processesRes.data.processes.filter(p => p.cpu > 50);
        const memoryUsage = resourcesRes.data.resources.find(r => r.name === 'Memory');
        
        if (highCpuProcesses.length >= 2 && memoryUsage && memoryUsage.usage / memoryUsage.total > 0.9) {
          setDeadlockInfo({
            detected: true,
            processes: highCpuProcesses.map(p => p.name),
            resources: ['CPU', 'Memory'],
            cycle: `High resource contention detected among: ${highCpuProcesses.map(p => p.name).join(' ↔ ')}`
          });
        } else {
          setDeadlockInfo(null);
        }
      } catch (error) {
        console.error('Failed to fetch system data:', error);
      }
    };

    fetchSystemData();
    const interval = setInterval(fetchSystemData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="system-monitor">
      <motion.div 
        className="monitor-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>🖥️ System Monitor</h1>
        <p>Real-time OS processes and resource monitoring (Your actual system)</p>
      </motion.div>

      {deadlockInfo && (
        <motion.div 
          className="deadlock-alert"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h3>⚠️ DEADLOCK DETECTED</h3>
          <p>Cycle: {deadlockInfo.cycle}</p>
          <p>Affected Processes: {deadlockInfo.processes.join(', ')}</p>
        </motion.div>
      )}

      <div className="monitor-grid">
        <motion.div 
          className="processes-section card"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3>Running Processes</h3>
          <div className="processes-table">
            <div className="table-header">
              <span>ID</span>
              <span>Process Name</span>
              <span>CPU %</span>
              <span>Memory (MB)</span>
              <span>Status</span>
            </div>
            {processes.map(proc => (
              <div key={proc.pid} className="table-row">
                <span>{proc.pid}</span>
                <span>{proc.name}</span>
                <span>{proc.cpu}%</span>
                <span>{proc.memory}</span>
                <span className={`status ${proc.status}`}>
                  {proc.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="resources-section card"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3>System Resources</h3>
          {resources.map((resource, index) => (
            <div key={index} className="resource-item">
              <div className="resource-header">
                <span>{resource.name}</span>
                <span>{resource.usage}/{resource.total} {resource.unit}</span>
              </div>
              <div className="resource-bar">
                <div 
                  className="resource-fill"
                  style={{ 
                    width: `${(resource.usage / resource.total) * 100}%`,
                    backgroundColor: resource.usage / resource.total > 0.8 ? '#f44336' : '#4caf50'
                  }}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default SystemMonitor;