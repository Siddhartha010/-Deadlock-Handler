import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { initRealTimeSystem, requestResourceRT, releaseResourceRT, getRealTimeStatus, autoResolveDeadlock, getPerformanceMetrics, getFullSimulationLog } from '../utils/realtimeApi';
import PerformancePanel from './PerformancePanel';

const RealTimeSystemSimulator = () => {
  const [systemState, setSystemState] = useState({
    processes: [
      { id: 0, name: 'Database Manager', priority: 'High', resources: [], waiting: [] },
      { id: 1, name: 'File System', priority: 'Medium', resources: [], waiting: [] },
      { id: 2, name: 'Network Handler', priority: 'High', resources: [], waiting: [] },
      { id: 3, name: 'Print Spooler', priority: 'Low', resources: [], waiting: [] }
    ],
    resources: [
      { id: 0, name: 'CPU', total: 2, available: 2, holders: [] },
      { id: 1, name: 'Memory Block', total: 3, available: 3, holders: [] },
      { id: 2, name: 'Disk Drive', total: 1, available: 1, holders: [] },
      { id: 3, name: 'Network Port', total: 2, available: 2, holders: [] }
    ]
  });
  
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [deadlockDetected, setDeadlockDetected] = useState(false);
  const [systemLog, setSystemLog] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    requests_processed: 0,
    deadlocks_detected: 0,
    avg_response_time: 0,
    throughput: 0
  });
  const [autoResolve, setAutoResolve] = useState(true);

  useEffect(() => {
    // Initialize real-time system on component mount
    const initSystem = async () => {
      try {
        await initRealTimeSystem({
          processes: systemState.processes.map(p => ({
            id: p.id,
            name: p.name,
            priority: p.priority
          })),
          resources: systemState.resources.map(r => ({
            id: r.id,
            name: r.name,
            total: r.total
          }))
        });
      } catch (error) {
        console.error('Failed to initialize real-time system:', error);
      }
    };
    
    initSystem();
  }, []);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
        simulateSystemActivity();
        updatePerformanceMetrics();
      }, 500); // Faster updates for better responsiveness
    }
    return () => clearInterval(interval);
  }, [isRunning]);
  
  const updatePerformanceMetrics = async () => {
    try {
      const response = await getPerformanceMetrics();
      setPerformanceMetrics(response.data);
    } catch (error) {
      console.error('Failed to update metrics:', error);
    }
  };
  
  const handleAutoResolve = async () => {
    try {
      const response = await autoResolveDeadlock();
      const { resolved, message, system_state } = response.data;
      
      if (resolved) {
        addLog(message);
        updateSystemStateFromBackend(system_state);
        setDeadlockDetected(false);
        setIsRunning(true);
      }
    } catch (error) {
      console.error('Auto-resolve failed:', error);
    }
  };

  const simulateSystemActivity = () => {
    // More intelligent simulation based on process priorities
    const activeProcesses = systemState.processes.filter(p => p.waiting.length === 0);
    if (activeProcesses.length === 0) return;
    
    // Higher priority processes get more frequent resource requests
    const weightedProcesses = [];
    systemState.processes.forEach(p => {
      const weight = p.priority === 'High' ? 3 : p.priority === 'Medium' ? 2 : 1;
      for (let i = 0; i < weight; i++) {
        weightedProcesses.push(p.id);
      }
    });
    
    const selectedProcess = weightedProcesses[Math.floor(Math.random() * weightedProcesses.length)];
    const availableResources = systemState.resources.filter(r => r.available > 0);
    
    if (availableResources.length > 0) {
      const selectedResource = availableResources[Math.floor(Math.random() * availableResources.length)];
      requestResource(selectedProcess, selectedResource.id);
    }
    
    // Occasionally release resources
    if (Math.random() < 0.3) {
      const processesWithResources = systemState.processes.filter(p => p.resources.length > 0);
      if (processesWithResources.length > 0) {
        const proc = processesWithResources[Math.floor(Math.random() * processesWithResources.length)];
        const resource = proc.resources[Math.floor(Math.random() * proc.resources.length)];
        releaseResource(proc.id, resource);
      }
    }
  };

  const requestResource = async (processId, resourceId) => {
    try {
      const response = await requestResourceRT(processId, resourceId);
      const { success, message, has_deadlock, system_state } = response.data;
      
      addLog(message);
      
      if (has_deadlock) {
        setDeadlockDetected(true);
        setIsRunning(false);
      }
      
      // Update local state from backend
      updateSystemStateFromBackend(system_state);
    } catch (error) {
      console.error('Resource request failed:', error);
      addLog('Error: Resource request failed');
    }
  };

  const releaseResource = async (processId, resourceId) => {
    try {
      const response = await releaseResourceRT(processId, resourceId);
      const { success, message, system_state } = response.data;
      
      addLog(message);
      updateSystemStateFromBackend(system_state);
    } catch (error) {
      console.error('Resource release failed:', error);
      addLog('Error: Resource release failed');
    }
  };
  
  const updateSystemStateFromBackend = (backendState) => {
    setSystemState(prev => {
      const newState = { ...prev };
      
      // Update processes
      Object.keys(backendState.processes).forEach(pid => {
        const processIndex = newState.processes.findIndex(p => p.id === parseInt(pid));
        if (processIndex !== -1) {
          newState.processes[processIndex].resources = backendState.processes[pid].resources;
          newState.processes[processIndex].waiting = backendState.processes[pid].waiting_for;
        }
      });
      
      // Update resources
      Object.keys(backendState.resources).forEach(rid => {
        const resourceIndex = newState.resources.findIndex(r => r.id === parseInt(rid));
        if (resourceIndex !== -1) {
          newState.resources[resourceIndex].available = backendState.resources[rid].available;
          newState.resources[resourceIndex].holders = backendState.resources[rid].holders;
        }
      });
      
      return newState;
    });
  };

  const checkForDeadlock = () => {
    // Simple deadlock detection: check for circular wait
    const waitingProcesses = systemState.processes.filter(p => p.waiting.length > 0);
    
    if (waitingProcesses.length >= 2) {
      // Check if processes are waiting for resources held by each other
      for (let i = 0; i < waitingProcesses.length; i++) {
        for (let j = i + 1; j < waitingProcesses.length; j++) {
          const p1 = waitingProcesses[i];
          const p2 = waitingProcesses[j];
          
          const p1WantsFromP2 = p1.waiting.some(resId => p2.resources.includes(resId));
          const p2WantsFromP1 = p2.waiting.some(resId => p1.resources.includes(resId));
          
          if (p1WantsFromP2 && p2WantsFromP1) {
            setDeadlockDetected(true);
            addLog(`DEADLOCK DETECTED: P${p1.id} and P${p2.id} in circular wait`);
            setIsRunning(false);
            return;
          }
        }
      }
    }
  };

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setSystemLog(prev => [...prev.slice(-9), `[${timestamp}] ${message}`]);
  };

  const saveCurrentSession = async () => {
    if (currentTime > 0 || performanceMetrics.requests_processed > 0) {
      try {
        const fullLogResponse = await getFullSimulationLog();
        const fullLog = fullLogResponse.data;

        const sessionData = {
          id: Date.now(),
          type: 'Real-Time System',
          result: deadlockDetected ? 'Deadlock Detected' : 'Completed',
          time: new Date().toLocaleString(),
          duration: (currentTime / 60).toFixed(1),
          metrics: fullLog.performance_metrics || performanceMetrics,
          events: fullLog.events || [],
          deadlocks: fullLog.deadlock_history || [],
          totalEvents: fullLog.total_events || (fullLog.events ? fullLog.events.length : systemLog.length)
        };

        if (window.saveSimulationToHistory) {
          window.saveSimulationToHistory(sessionData);
        }
      } catch (e) {
        const sessionData = {
          id: Date.now(),
          type: 'Real-Time System',
          result: deadlockDetected ? 'Deadlock Detected' : 'Completed',
          time: new Date().toLocaleString(),
          duration: (currentTime / 60).toFixed(1),
          metrics: performanceMetrics,
          events: systemLog.map(msg => ({ type: 'LOG', message: msg, timestamp: Date.now()/1000 })),
          deadlocks: [],
          totalEvents: systemLog.length
        };
        if (window.saveSimulationToHistory) {
          window.saveSimulationToHistory(sessionData);
        }
      }
    }
  };

  const handleStartStop = async () => {
    if (isRunning) {
      // Stopping: persist session to Completed Simulations
      await saveCurrentSession();
      setIsRunning(false);
    } else {
      setIsRunning(true);
    }
  };

  const resetSystem = async () => {
    // Save current session before reset
    await saveCurrentSession();
    
    setIsRunning(false);
    setDeadlockDetected(false);
    setCurrentTime(0);
    setSystemLog([]);
    setPerformanceMetrics({
      requests_processed: 0,
      deadlocks_detected: 0,
      avg_response_time: 0,
      throughput: 0
    });
    
    // Reset local state
    setSystemState(prev => ({
      ...prev,
      processes: prev.processes.map(p => ({ ...p, resources: [], waiting: [] })),
      resources: prev.resources.map(r => ({ ...r, available: r.total, holders: [] }))
    }));
    
    // Reinitialize backend system
    try {
      await initRealTimeSystem({
        processes: systemState.processes.map(p => ({
          id: p.id,
          name: p.name,
          priority: p.priority
        })),
        resources: systemState.resources.map(r => ({
          id: r.id,
          name: r.name,
          total: r.total
        }))
      });
      addLog('System reset and reinitialized');
    } catch (error) {
      console.error('Failed to reset system:', error);
      addLog('Error: System reset failed');
    }
  };

  return (
    <div className="realtime-simulator">
      <div className="simulator-header">
        <h2>Real-Time System Deadlock Simulator</h2>
        <div className="system-controls">
          <button 
            className={`btn ${isRunning ? 'btn-danger' : 'btn-primary'}`}
            onClick={handleStartStop}
            disabled={deadlockDetected}
          >
            {isRunning ? 'Stop System' : 'Start System'}
          </button>
          <button className="btn btn-secondary" onClick={resetSystem}>
            🔄 Reset System
          </button>
          <div className="system-time">Time: {currentTime}s</div>
        </div>
      </div>

      {deadlockDetected && (
        <motion.div 
          className="deadlock-alert"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="alert-content">
            <span>⚠️ DEADLOCK DETECTED - System Halted</span>
            <button 
              className="btn btn-warning"
              onClick={handleAutoResolve}
            >
              Auto Resolve
            </button>
          </div>
        </motion.div>
      )}

      <div className="simulator-content">
        <div className="processes-panel">
          <h3>System Processes</h3>
          {systemState.processes.map(process => (
            <motion.div 
              key={process.id}
              className={`process-card ${process.waiting.length > 0 ? 'waiting' : ''}`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="process-header">
                <span className="process-name">P{process.id}: {process.name}</span>
                <span className={`priority ${process.priority.toLowerCase()}`}>
                  {process.priority}
                </span>
              </div>
              
              <div className="process-resources">
                <div className="held-resources">
                  <strong>Holding:</strong>
                  {process.resources.length > 0 ? (
                    process.resources.map(resId => (
                      <span key={resId} className="resource-tag held">
                        {systemState.resources[resId].name}
                        <button 
                          className="release-btn"
                          onClick={() => releaseResource(process.id, resId)}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="no-resources">None</span>
                  )}
                </div>
                
                <div className="waiting-resources">
                  <strong>Waiting for:</strong>
                  {process.waiting.length > 0 ? (
                    process.waiting.map(resId => (
                      <span key={resId} className="resource-tag waiting">
                        {systemState.resources[resId].name}
                      </span>
                    ))
                  ) : (
                    <span className="no-resources">None</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="resources-panel">
          <h3>System Resources</h3>
          {systemState.resources.map(resource => (
            <div key={resource.id} className="resource-card">
              <div className="resource-header">
                <span className="resource-name">{resource.name}</span>
                <span className="resource-count">
                  {resource.available}/{resource.total} available
                </span>
              </div>
              
              <div className="resource-holders">
                <strong>Held by:</strong>
                {resource.holders.length > 0 ? (
                  resource.holders.map(processId => (
                    <span key={processId} className="holder-tag">
                      P{processId}
                    </span>
                  ))
                ) : (
                  <span className="no-holders">None</span>
                )}
              </div>
              
              <div className="manual-controls">
                {systemState.processes.map(process => (
                  <button
                    key={process.id}
                    className="btn btn-small"
                    onClick={() => requestResource(process.id, resource.id)}
                    disabled={isRunning || process.resources.includes(resource.id)}
                  >
                    P{process.id} Request
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="right-panel">
          <PerformancePanel metrics={performanceMetrics} />
          
          <div className="system-log">
            <h3>System Log</h3>
            <div className="log-content">
              {systemLog.map((entry, index) => (
                <div key={index} className="log-entry">
                  {entry}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeSystemSimulator;