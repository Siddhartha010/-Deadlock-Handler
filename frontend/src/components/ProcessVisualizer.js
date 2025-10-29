import React from 'react';
import { motion } from 'framer-motion';

const ProcessVisualizer = ({ processes, allocation, results }) => {
  const getProcessColor = (index) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    return colors[index % colors.length];
  };

  const getProcessStatus = (index) => {
    if (!results) return 'idle';
    
    // Handle Banker's Algorithm results
    if (results.is_safe !== undefined) {
      if (results.safe_sequence && results.safe_sequence.includes(index)) {
        return 'safe';
      }
      return results.is_safe ? 'safe' : 'unsafe';
    }
    
    // Handle Detection Algorithm results
    if (results.detection_result) {
      const detectionResult = results.detection_result;
      if (detectionResult.has_deadlock) {
        if (detectionResult.deadlocked_processes && detectionResult.deadlocked_processes.includes(index)) {
          return 'deadlocked';
        }
        // Process completed successfully before deadlock was detected
        if (detectionResult.final_state && detectionResult.final_state.finish && detectionResult.final_state.finish[index]) {
          return 'completed';
        }
        return 'safe';
      } else {
        // No deadlock - check if process completed
        if (detectionResult.final_state && detectionResult.final_state.finish && detectionResult.final_state.finish[index]) {
          return 'completed';
        }
        return 'safe';
      }
    }
    
    // Handle Recovery Methods results
    if (results.termination_options || results.preemption_options) {
      // For recovery, we assume all processes in the provided deadlock_cycle are deadlocked
      if (results.deadlock_cycle && results.deadlock_cycle.includes(index)) {
        return 'deadlocked';
      }
      return 'safe';
    }
    
    // Handle Wait-for Graph results (legacy)
    if (results.deadlock_cycle && results.deadlock_cycle.includes(index)) {
      return 'deadlocked';
    }
    if (results.safe_sequence && results.safe_sequence.includes(index)) {
      return 'safe';
    }
    
    // Default fallback
    return 'idle';
  };

  return (
    <div className="process-visualizer">
      <h3>Process States</h3>
      <div className="processes-container">
        {Array.from({ length: processes }, (_, index) => (
          <motion.div
            key={index}
            className={`process-node ${getProcessStatus(index)}`}
            style={{ backgroundColor: getProcessColor(index) }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.1 }}
          >
            <div className="process-id">P{index}</div>
            <div className="process-resources">
              {allocation[index] && allocation[index].map((count, rIndex) => (
                <div key={rIndex} className="resource-allocation">
                  R{rIndex}: {count}
                </div>
              ))}
            </div>
            <div className="process-status">
              {getProcessStatus(index)}
            </div>
          </motion.div>
        ))}
      </div>
      
      {results && results.safe_sequence && (
        <motion.div 
          className="safe-sequence"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4>Safe Execution Sequence:</h4>
          <div className="sequence">
            {results.safe_sequence.map((processId, index) => (
              <motion.span
                key={index}
                className="sequence-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                P{processId}
                {index < results.safe_sequence.length - 1 && ' → '}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProcessVisualizer;