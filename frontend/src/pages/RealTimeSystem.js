import React from 'react';
import { motion } from 'framer-motion';
import RealTimeSystemSimulator from '../components/RealTimeSystemSimulator';
import SystemMetrics from '../components/SystemMetrics';

const RealTimeSystem = () => {
  return (
    <div className="realtime-page">
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Real-Time System Deadlock Analysis</h1>
        <p>Simulate and analyze deadlock scenarios in real-time operating systems</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <RealTimeSystemSimulator />
      </motion.div>

      <motion.div 
        className="realtime-info card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3>Real-Time System Characteristics</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>Process Priorities</h4>
            <ul>
              <li><span className="priority high">High</span> - Critical system processes</li>
              <li><span className="priority medium">Medium</span> - Standard operations</li>
              <li><span className="priority low">Low</span> - Background tasks</li>
            </ul>
          </div>
          
          <div className="info-item">
            <h4>Resource Types</h4>
            <ul>
              <li><strong>CPU:</strong> Processing units</li>
              <li><strong>Memory:</strong> RAM blocks</li>
              <li><strong>I/O:</strong> Disk drives, network ports</li>
              <li><strong>Devices:</strong> Printers, scanners</li>
            </ul>
          </div>
          
          <div className="info-item">
            <h4>Deadlock Impact</h4>
            <ul>
              <li>System freeze and unresponsiveness</li>
              <li>Missed real-time deadlines</li>
              <li>Resource waste and inefficiency</li>
              <li>Potential system crash</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RealTimeSystem;