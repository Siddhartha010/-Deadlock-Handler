import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { initRealTimeSystem, requestResourceRT, releaseResourceRT, getRealTimeStatus, autoResolveDeadlock, getPerformanceMetrics, getFullSimulationLog } from '../utils/realtimeApi';
import PerformancePanel from './PerformancePanel';
import DeadlockChatbot from './DeadlockChatbot';
import '../styles/DeadlockChatbot.css';

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
  const [deadlockState, setDeadlockState] = useState({ deadlocked: false, processes: [] });
  const [systemLog, setSystemLog] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    requests_processed: 0,
    deadlocks_detected: 0,
    avg_response_time: 0,
    throughput: 0
  });
  const [autoResolve, setAutoResolve] = useState(true);
  const [lastDeadlockCycle, setLastDeadlockCycle] = useState(null);
  
  const playWarningSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

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
      interval = setInterval(async () => {
        setCurrentTime(prev => prev + 1);
        await simulateSystemActivity();
        if (Math.random() < 0.7) {
          await simulateSystemActivity();
        }
        updatePerformanceMetrics();
      }, 300);
    } else {
      if (interval) {
        clearInterval(interval);
      }
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, systemState]);
  
  const checkForDeadlock = async () => {
    try {
      // Get status from backend to check for deadlocks
      const response = await getRealTimeStatus();
      const { has_deadlock, deadlock_cycle, system_state } = response.data;
      
      if (has_deadlock) {
        setDeadlockDetected(true);
        if (deadlock_cycle && deadlock_cycle.length > 0) {
          const cycleStr = deadlock_cycle.join(' → ');
          addLog(`DEADLOCK DETECTED: Cycle found: ${cycleStr}`);
        } else {
          addLog('DEADLOCK DETECTED: System halted');
        }
        setIsRunning(false);
        updateSystemStateFromBackend(system_state);
        return true;
      }
      
      // Fallback to client-side detection if backend doesn't detect deadlock
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
              playWarningSound();
              setLastDeadlockCycle([`P${p1.id}`, `P${p2.id}`]);
              addLog(`DEADLOCK DETECTED: P${p1.id} and P${p2.id} in circular wait`);
              setIsRunning(false);
              return true;
            }
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking for deadlock:', error);
      return false;
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
      } else {
        // Fallback: terminate lowest priority process in deadlock
        const waitingProcesses = systemState.processes.filter(p => p.waiting.length > 0);
        if (waitingProcesses.length > 0) {
          const lowestPriority = waitingProcesses.reduce((min, p) => {
            const priorities = { 'High': 3, 'Medium': 2, 'Low': 1 };
            return priorities[p.priority] < priorities[min.priority] ? p : min;
          });
          
          // Release all resources from lowest priority process
          const resourcesToRelease = [...lowestPriority.resources];
          for (const resId of resourcesToRelease) {
            await releaseResource(lowestPriority.id, resId);
          }
          
          // Clear waiting requests
          setSystemState(prev => ({
            ...prev,
            processes: prev.processes.map(p => 
              p.id === lowestPriority.id ? { ...p, waiting: [] } : p
            )
          }));
          
          addLog(`Auto-resolved: Terminated P${lowestPriority.id} (${lowestPriority.name})`);
          setDeadlockDetected(false);
        }
      }
    } catch (error) {
      console.error('Auto-resolve failed:', error);
      addLog('Auto-resolve failed, trying manual resolution...');
      
      // Manual fallback resolution
      const waitingProcesses = systemState.processes.filter(p => p.waiting.length > 0);
      if (waitingProcesses.length > 0) {
        const processToTerminate = waitingProcesses[0];
        
        setSystemState(prev => ({
          ...prev,
          processes: prev.processes.map(p => 
            p.id === processToTerminate.id ? { ...p, resources: [], waiting: [] } : p
          ),
          resources: prev.resources.map(r => ({
            ...r,
            available: r.total - prev.processes.reduce((sum, p) => 
              p.id !== processToTerminate.id ? sum + p.resources.filter(res => res === r.id).length : sum, 0
            ),
            holders: r.holders.filter(h => h !== processToTerminate.id)
          }))
        }));
        
        addLog(`Manual resolution: Terminated P${processToTerminate.id}`);
        setDeadlockDetected(false);
      }
    }
  };

  const simulateSystemActivity = async () => {
    const hasDeadlock = await checkForDeadlock();
    if (hasDeadlock || !isRunning) return;
    
    const runningProcesses = systemState.processes.filter(p => p.resources.length > 0 && p.waiting.length === 0);
    const idleProcesses = systemState.processes.filter(p => p.resources.length === 0 && p.waiting.length === 0);
    const availableResources = systemState.resources.filter(r => r.available > 0);
    
    // Auto-start all idle processes when system starts
    if (runningProcesses.length === 0 && idleProcesses.length > 0 && availableResources.length > 0) {
      // Start multiple processes simultaneously to increase deadlock probability
      const processesToStart = Math.min(idleProcesses.length, availableResources.length, 3);
      
      for (let i = 0; i < processesToStart; i++) {
        const process = idleProcesses[i];
        const resource = availableResources[i % availableResources.length];
        await requestResource(process.id, resource.id);
      }
      return;
    }
    
    // Running processes request additional resources (higher chance for deadlock)
    if (runningProcesses.length > 0 && Math.random() < 0.8) {
      const process = runningProcesses[Math.floor(Math.random() * runningProcesses.length)];
      if (availableResources.length > 0) {
        const resource = availableResources[Math.floor(Math.random() * availableResources.length)];
        await requestResource(process.id, resource.id);
      }
    }
    
    // Start remaining idle processes
    if (idleProcesses.length > 0 && availableResources.length > 0 && Math.random() < 0.6) {
      const process = idleProcesses[Math.floor(Math.random() * idleProcesses.length)];
      const resource = availableResources[Math.floor(Math.random() * availableResources.length)];
      await requestResource(process.id, resource.id);
    }
    
    // Running processes can release resources (simulating task completion)
    if (Math.random() < 0.15) {
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
      const { success, message, has_deadlock, deadlock_cycle, system_state } = response.data;
      
      addLog(message);
      
      if (has_deadlock) {
        setDeadlockDetected(true);
        setIsRunning(false);
        playWarningSound();
        if (deadlock_cycle && deadlock_cycle.length > 0) {
          const cycleStr = deadlock_cycle.join(' → ');
          setLastDeadlockCycle(deadlock_cycle);
          addLog(`DEADLOCK DETECTED: Cycle found: ${cycleStr}`);
        } else {
          addLog('DEADLOCK DETECTED: System halted');
        }
      }
      
      // Update local state from backend
      updateSystemStateFromBackend(system_state);
      
      // Always check for deadlock after resource request (even if backend didn't detect it)
      await checkForDeadlock();
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

  // Function to force a deadlock scenario is defined later in the code

  const updatePerformanceMetrics = async () => {
    try {
      const response = await getPerformanceMetrics();
      setPerformanceMetrics(response.data);
    } catch (error) {
      console.error('Failed to update metrics:', error);
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
      await saveCurrentSession();
      setIsRunning(false);
      addLog('System stopped by user');
    } else {
      setIsRunning(true);
      addLog('System started');
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


  const forceDeadlock = () => {
    // Reset any existing deadlock state
    setDeadlockDetected(false);
    setIsRunning(false);
    
    // Create a clean state to work with
    const updatedState = {...systemState};
    
    // First clear any existing allocations
    updatedState.processes.forEach(p => {
      p.resources = [];
      p.waiting = [];
    });
    
    updatedState.resources.forEach(r => {
      r.available = r.total;
      r.holders = [];
    });
    
    // Set up the deadlock scenario
    // P0 holds Disk Drive (R2)
    updatedState.processes[0].resources = [2];
    updatedState.resources[2].available = 0;
    updatedState.resources[2].holders = [0];
    
    // P1 holds Network Port (R3)
    updatedState.processes[1].resources = [3];
    updatedState.resources[3].available = 1; // There are 2 total, so 1 is still available
    updatedState.resources[3].holders = [1];
    
    // P0 wants Network Port
    updatedState.processes[0].waiting = [3];
    
    // P1 wants Disk Drive
    updatedState.processes[1].waiting = [2];
    
    setSystemState(updatedState);
    addLog("DEADLOCK SCENARIO CREATED: P0 and P1 are in a circular wait");
    
    // Check for deadlock after a short delay to allow state update
    setTimeout(async () => {
      await checkForDeadlock();
    }, 500);
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
          <button 
            className="btn btn-danger"
            onClick={forceDeadlock}
            disabled={isRunning || deadlockDetected}
          >
            ⚠️ Force Deadlock
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
          <div className="processes-grid">
            {systemState.processes.map(process => (
              <motion.div 
                key={process.id}
                className={`process-card ${process.waiting.length > 0 ? 'waiting' : ''} ${process.waiting.length > 0 && deadlockState.deadlocked ? 'deadlocked' : ''}`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="process-header">
                  <span className="process-name">P{process.id}: {process.name}</span>
                  <span className={`priority ${process.priority.toLowerCase()}`}>
                    {process.priority}
                  </span>
                </div>
                
                <div className="process-resources">
                  <div className="resource-row">
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
                  
                  <div className="resource-row">
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
                
                {process.waiting.length > 0 && deadlockState.deadlocked && (
                  <div className="deadlock-indicator">DEADLOCKED</div>
                )}
              </motion.div>
            ))}
          </div>
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
      
      <DeadlockChatbot 
        deadlockDetected={deadlockDetected}
        lastDeadlockCycle={lastDeadlockCycle}
      />
    </div>
  );
};

export default RealTimeSystemSimulator;