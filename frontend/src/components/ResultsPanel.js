import React from 'react';
import { motion } from 'framer-motion';

const ResultsPanel = ({ results, algorithm }) => {
  if (!results) {
    return (
      <div className="results-panel card">
        <h3>Results</h3>
        <p>Run a simulation to see results</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="results-panel card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h3>Simulation Results</h3>
      
      {results.is_safe !== undefined && (
        <div className={`result-status ${results.is_safe ? 'safe' : 'unsafe'}`}>
          <h4>{results.is_safe ? '✅ Safe State' : '❌ Unsafe State'}</h4>
        </div>
      )}
      
      {results.safe_sequence && (
        <div className="safe-sequence-result">
          <h4>Safe Execution Sequence:</h4>
          <div className="sequence-display">
            {results.safe_sequence.map((process, index) => (
              <span key={index} className="process-badge">
                P{process}
                {index < results.safe_sequence.length - 1 && ' → '}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Detection Algorithm Details */}
      {algorithm === 'detection' && results.detection_result && (
        <div className="detection-results">
          <div className={`result-status ${results.detection_result.has_deadlock ? 'unsafe' : 'safe'}`}>
            <h4>{results.detection_result.has_deadlock ? '🚨 Deadlock Detected' : '✅ No Deadlock'}</h4>
          </div>

          {results.detection_result.deadlocked_processes && results.detection_result.deadlocked_processes.length > 0 && (
            <div className="deadlock-result">
              <h4>Deadlocked Processes:</h4>
              <div className="cycle-processes">
                {results.detection_result.deadlocked_processes.map((process, index) => (
                  <span key={index} className="deadlock-process">P{process}</span>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(results.available_resources) && (
            <div className="available-resources">
              <h4>Available Resources:</h4>
              <div className="sequence-display">
                {results.available_resources.map((val, idx) => (
                  <span key={idx} className="process-badge">R{idx}: {val}</span>
                ))}
              </div>
            </div>
          )}

          {results.wait_for_graph && (
            <div className="wait-for-graph">
              <h4>Wait-for Graph (Edges):</h4>
              <div className="sequence-display">
                {Object.entries(results.wait_for_graph).map(([from, toList]) => (
                  toList.map((to, idx) => (
                    <span key={`${from}-${to}-${idx}`} className="process-badge">P{from} → P{to}</span>
                  ))
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recovery Methods Details */}
      {algorithm === 'recovery' && (results.termination_options || results.preemption_options) && (
        <div className="recovery-results">
          {results.termination_options && (
            <div className="termination-options">
              <h4>Process Termination Strategies</h4>
              {Object.entries(results.termination_options).map(([strategy, info]) => (
                <div key={strategy} className="result-row">
                  <strong>{strategy.replace('_', ' ')}:</strong> Terminate P{info.terminated_process} ({info.reason}), Cost: {info.cost}
                </div>
              ))}
            </div>
          )}

          {results.preemption_options && (
            <div className="preemption-options">
              <h4>Resource Preemption Plan</h4>
              {results.preemption_options.map((plan, idx) => (
                <div key={idx} className="result-row">
                  <strong>Process P{plan.process}:</strong>
                  <div className="sequence-display">
                    {plan.preemptable_resources.map((res, rIdx) => (
                      <span key={rIdx} className="process-badge">R{res.resource_type} x{res.amount} (cost {res.preemption_cost})</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {results.has_deadlock && (
        <div className="deadlock-result">
          <h4>🚨 Deadlock Detected</h4>
          {results.deadlock_cycle && (
            <div className="cycle-display">
              <p>Deadlock Cycle:</p>
              <div className="cycle-processes">
                {results.deadlock_cycle.map((process, index) => (
                  <span key={index} className="deadlock-process">
                    P{process}
                    {index < results.deadlock_cycle.length - 1 && ' → '}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {results.current_state && (
        <div className="state-info">
          <h4>Current System State</h4>
          <div className="state-matrices">
            <div className="matrix-display">
              <h5>Available Resources:</h5>
              <div className="available-display">
                {results.current_state.available.map((count, index) => (
                  <span key={index} className="resource-count">
                    R{index}: {count}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="export-options">
        <button className="btn btn-secondary" onClick={() => window.print()}>
          📄 Export Report
        </button>
      </div>
    </motion.div>
  );
};

export default ResultsPanel;