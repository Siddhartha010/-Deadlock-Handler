import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getPerformanceMetrics, getFullSimulationLog } from '../utils/realtimeApi';
import { runFullSimulation } from '../utils/api';

const Dashboard = () => {
  const [comparisonData, setComparisonData] = useState([
    { strategy: 'Avoidance', efficiency: 85, pros: 3, cons: 2 },
    { strategy: 'Detection', efficiency: 60, pros: 2, cons: 2 },
    { strategy: 'Prevention', efficiency: 70, pros: 2, cons: 3 },
    { strategy: 'Recovery', efficiency: 45, pros: 1, cons: 3 }
  ]);
  
  useEffect(() => {
    loadCompletedSimulations();
  }, []);
  
  const loadCompletedSimulations = () => {
    // Load completed simulations from localStorage
    const stored = localStorage.getItem('completedSimulations');
    if (stored) {
      setRealtimeHistory(JSON.parse(stored));
    }
  };
  
  const saveCompletedSimulation = (simulationData) => {
    const stored = localStorage.getItem('completedSimulations');
    const existing = stored ? JSON.parse(stored) : [];
    const updated = [simulationData, ...existing.slice(0, 9)];
    localStorage.setItem('completedSimulations', JSON.stringify(updated));
    setRealtimeHistory(updated);
  };
  
  // Expose function globally for real-time system to call
  window.saveSimulationToHistory = saveCompletedSimulation;

  const [simulationHistory, setSimulationHistory] = useState([]);
  const [realtimeHistory, setRealtimeHistory] = useState([]);
  const [selectedSimulation, setSelectedSimulation] = useState(null);

  const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#F44336'];
  
  const viewSimulation = (simulation) => {
    setSelectedSimulation(simulation);
  };
  
  const exportSimulation = (simulation) => {
    const dataStr = JSON.stringify(simulation, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `simulation_${simulation.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const strategyDetails = {
    'Avoidance': {
      description: 'Banker\'s Algorithm prevents deadlock by checking safe states',
      pros: ['Prevents deadlock occurrence', 'Optimal resource utilization', 'No rollback needed'],
      cons: ['Requires advance knowledge', 'Conservative approach']
    },
    'Detection': {
      description: 'Wait-for Graph detects deadlock cycles in the system',
      pros: ['Detects actual deadlocks', 'No false positives'],
      cons: ['Reactive approach', 'Recovery overhead required']
    },
    'Prevention': {
      description: 'Resource ordering prevents circular wait conditions',
      pros: ['Guarantees no deadlock', 'Simple implementation'],
      cons: ['Reduced concurrency', 'May cause starvation', 'Inflexible resource ordering']
    },
    'Recovery': {
      description: 'Process termination and resource preemption resolve deadlocks',
      pros: ['Handles deadlock after occurrence'],
      cons: ['Work loss', 'System overhead', 'Complex recovery decisions']
    }
  };

  return (
    <div className="dashboard">
      <motion.div 
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>📊 Deadlock Strategies Dashboard</h1>
        <p>Compare and analyze different deadlock handling approaches</p>
      </motion.div>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <motion.div 
            className="chart-section card"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3>Strategy Efficiency Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="strategy" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="efficiency" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div 
            className="pie-section card"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3>Strategy Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={comparisonData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="efficiency"
                  label={({ strategy, efficiency }) => `${strategy}: ${efficiency}%`}
                >
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <motion.div 
          className="strategies-comparison card"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>Detailed Strategy Analysis</h3>
          <div className="strategies-grid">
            {Object.entries(strategyDetails).map(([strategy, details], index) => (
              <motion.div
                key={strategy}
                className="strategy-card"
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="strategy-header">
                  <h4 style={{ color: COLORS[index] }}>{strategy}</h4>
                  <div className="efficiency-badge" style={{ backgroundColor: COLORS[index] }}>
                    {comparisonData[index].efficiency}%
                  </div>
                </div>
                
                <p className="strategy-description">{details.description}</p>
                
                <div className="pros-cons">
                  <div className="pros">
                    <h5>✅ Pros:</h5>
                    <ul>
                      {details.pros.map((pro, i) => (
                        <li key={i}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="cons">
                    <h5>❌ Cons:</h5>
                    <ul>
                      {details.cons.map((con, i) => (
                        <li key={i}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="simulation-history card"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3>Completed Simulations</h3>
          <div className="history-table">
            <div className="table-header">
              <span>Type</span>
              <span>Status</span>
              <span>Duration</span>
              <span>Events</span>
              <span>Actions</span>
            </div>
            {realtimeHistory.map((sim) => (
              <div key={sim.id} className="table-row">
                <span>{sim.type}</span>
                <span className={`result ${sim.result.toLowerCase().split(' ').join('-')}`}>
                  {sim.result}
                </span>
                <span>{sim.duration}m</span>
                <span>{sim.events?.length || 0}</span>
                <span>
                  <button 
                    className="btn-small"
                    onClick={() => viewSimulation(sim)}
                  >
                    View
                  </button>
                  <button 
                    className="btn-small"
                    onClick={() => exportSimulation(sim)}
                  >
                    Export
                  </button>
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      
      {selectedSimulation && (
        <motion.div 
          className="simulation-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedSimulation(null)}
        >
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Simulation Details</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedSimulation(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-row">
                <strong>Type:</strong> {selectedSimulation.type}
              </div>
              <div className="detail-row">
                <strong>Status:</strong> {selectedSimulation.result}
              </div>
              <div className="detail-row">
                <strong>Start Time:</strong> {selectedSimulation.time}
              </div>
              <div className="detail-row">
                <strong>Duration:</strong> {selectedSimulation.duration} minutes
              </div>
              <div className="detail-row">
                <strong>Total Events:</strong> {selectedSimulation.events?.length || 0}
              </div>
              
              {selectedSimulation.events && selectedSimulation.events.length > 0 && (
                <div className="events-section">
                  <h4>Event Timeline</h4>
                  <div className="events-timeline">
                    {selectedSimulation.events.slice(-10).map((event, index) => (
                      <div key={index} className="event-item">
                        <span className="event-time">
                          {new Date(event.timestamp * 1000).toLocaleTimeString()}
                        </span>
                        <span className="event-type">{event.type}</span>
                        <span className="event-details">
                          {event.process_name} - {event.resource_name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedSimulation.deadlocks && selectedSimulation.deadlocks.length > 0 && (
                <div className="deadlocks-section">
                  <h4>Deadlock History</h4>
                  {selectedSimulation.deadlocks.map((deadlock, index) => (
                    <div key={index} className="deadlock-item">
                      <span className="deadlock-time">
                        {new Date(deadlock.timestamp * 1000).toLocaleTimeString()}
                      </span>
                      <span className="deadlock-cycle">
                        Cycle: {deadlock.cycle.map(p => `P${p}`).join(' → ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedSimulation.metrics && (
                <div className="metrics-section">
                  <h4>Performance Metrics</h4>
                  <div className="metrics-grid">
                    <div className="metric-item">
                      <span>Requests Processed:</span>
                      <span>{selectedSimulation.metrics.requests_processed}</span>
                    </div>
                    <div className="metric-item">
                      <span>Deadlocks Detected:</span>
                      <span>{selectedSimulation.metrics.deadlocks_detected}</span>
                    </div>
                    <div className="metric-item">
                      <span>Avg Response Time:</span>
                      <span>{(selectedSimulation.metrics.avg_response_time * 1000).toFixed(1)}ms</span>
                    </div>
                    <div className="metric-item">
                      <span>Throughput:</span>
                      <span>{selectedSimulation.metrics.throughput.toFixed(1)}/s</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-primary"
                onClick={() => exportSimulation(selectedSimulation)}
              >
                Export Data
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;