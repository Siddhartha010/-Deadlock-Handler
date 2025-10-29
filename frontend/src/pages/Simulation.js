import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProcessVisualizer from '../components/ProcessVisualizer';
import ResourceMatrix from '../components/ResourceMatrix';
import AlgorithmSelector from '../components/AlgorithmSelector';
import ResultsPanel from '../components/ResultsPanel';
import StepByStepViewer from '../components/StepByStepViewer';
import ConceptExplainer from '../components/ConceptExplainer';
import { simulateDeadlock } from '../utils/api';

const Simulation = () => {
  const [config, setConfig] = useState({
    processes: 5,
    resources: 3,
    allocation: [[0, 1, 0], [2, 0, 0], [3, 0, 2], [2, 1, 1], [0, 0, 2]],
    maxNeed: [[7, 5, 3], [3, 2, 2], [9, 0, 2], [2, 2, 2], [4, 3, 3]],
    available: [3, 3, 2]
  });
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bankers');
  const [error, setError] = useState(null);
  const [stepByStep, setStepByStep] = useState(false);

  const generateRequestMatrix = () => {
    // Generate a request matrix based on the difference between maxNeed and allocation
    const request = [];
    for (let i = 0; i < config.processes; i++) {
      const processRequest = [];
      for (let j = 0; j < config.resources; j++) {
        // Request is a portion of the remaining need (maxNeed - allocation)
        const remainingNeed = config.maxNeed[i][j] - config.allocation[i][j];
        const requestAmount = Math.floor(Math.random() * (remainingNeed + 1));
        processRequest.push(requestAmount);
      }
      request.push(processRequest);
    }
    return request;
  };

  const generateDeadlockCycle = () => {
    // Generate a sample deadlock cycle for recovery simulation
    const numProcesses = Math.min(config.processes, 4); // Limit cycle size
    const cycle = [];
    for (let i = 0; i < numProcesses; i++) {
      cycle.push(i);
    }
    return cycle;
  };

  const buildRecoverySteps = (data, cycle) => {
    const steps = [];
    let stepNo = 1;

    if (Array.isArray(cycle) && cycle.length > 0) {
      steps.push({
        step: stepNo++,
        action: 'deadlock_cycle_identified',
        description: `Deadlock cycle detected among processes: ${cycle.map(p => `P${p}`).join(' → ')}`,
        deadlocked_processes: cycle
      });
    }

    if (data.termination_options) {
      Object.entries(data.termination_options).forEach(([strategy, info]) => {
        steps.push({
          step: stepNo++,
          action: 'termination_strategy',
          description: `${strategy.replace('_', ' ')} suggests terminating P${info.terminated_process} (${info.reason}), cost ${info.cost}`,
          process: info.terminated_process
        });
      });
    }

    if (data.preemption_options) {
      data.preemption_options.forEach(plan => {
        const details = (plan.preemptable_resources || [])
          .map(res => `R${res.resource_type} x${res.amount} (cost ${res.preemption_cost})`)
          .join(', ');
        steps.push({
          step: stepNo++,
          action: 'preemption_plan',
          description: details ? `Preempt resources from P${plan.process}: ${details}` : `No preemptable resources for P${plan.process}`,
          process: plan.process
        });
      });
    }

    return steps;
  };

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      let requestData = { ...config, step_by_step: stepByStep };
      
      // Add missing parameters based on algorithm type
      if (selectedAlgorithm === 'detection') {
        requestData.request = generateRequestMatrix();
      } else if (selectedAlgorithm === 'recovery') {
        requestData.deadlock_cycle = generateDeadlockCycle();
      }
      
      const response = await simulateDeadlock(selectedAlgorithm, requestData);
      const data = response.data;
      if (selectedAlgorithm === 'recovery' && stepByStep) {
        const cycle = requestData.deadlock_cycle || data.deadlock_cycle || [];
        const steps = buildRecoverySteps(data, cycle);
        setResults({ ...data, steps });
      } else {
        setResults(data);
      }
    } catch (error) {
      console.error('Simulation error:', error);
      setError(error.response?.data?.error || 'Simulation failed');
    }
    setLoading(false);
  };

  return (
    <div className="simulation">
      <motion.div 
        className="simulation-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Deadlock Simulation</h1>
        <div className="controls">
          <AlgorithmSelector 
            selected={selectedAlgorithm}
            onChange={setSelectedAlgorithm}
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={stepByStep}
              onChange={(e) => setStepByStep(e.target.checked)}
            />
            Step-by-step execution
          </label>
          <button 
            className="btn btn-primary"
            onClick={runSimulation}
            disabled={loading}
          >
            {loading ? 'Running...' : 'Run Simulation'}
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}
      </motion.div>
      
      <motion.div 
        className="simulation-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="controls">
        </div>
      </motion.div>

      <div className="simulation-content">
        <div className="left-panel">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ResourceMatrix 
              config={config}
              onChange={setConfig}
            />
          </motion.div>
          
          {/* Moved ConceptExplainer to right panel to utilize space */}
        </div>

        <div className="center-panel">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ProcessVisualizer 
              processes={config.processes}
              allocation={config.allocation}
              results={results}
            />
          </motion.div>
          
          {stepByStep && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {(() => {
                const steps = selectedAlgorithm === 'detection' 
                  ? results?.detection_result?.steps 
                  : results?.steps;
                return steps ? (
                  <StepByStepViewer 
                    steps={steps}
                    algorithm={selectedAlgorithm}
                  />
                ) : null;
              })()}
            </motion.div>
          )}
        </div>

        <div className="right-panel">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ResultsPanel 
              results={results}
              algorithm={selectedAlgorithm}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <ConceptExplainer />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Simulation;