import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StepByStepViewer = ({ steps, algorithm }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);

  useEffect(() => {
    let interval;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, speed);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, speed]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetSteps = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  if (!steps || steps.length === 0) {
    return (
      <div className="step-viewer card">
        <h3>Step-by-Step Execution</h3>
        <p>Run a simulation with step-by-step mode enabled to see algorithm execution.</p>
      </div>
    );
  }

  const step = steps[currentStep];

  return (
    <div className="step-viewer card">
      <div className="step-header">
        <h3>Step-by-Step: {algorithm}</h3>
        <div className="step-counter">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>

      <div className="step-controls">
        <button 
          className="btn btn-small"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          ⏮️ Previous
        </button>
        
        <button 
          className="btn btn-small"
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={currentStep >= steps.length - 1}
        >
          {isPlaying ? '⏸️ Pause' : '▶️ Play'}
        </button>
        
        <button 
          className="btn btn-small"
          onClick={nextStep}
          disabled={currentStep >= steps.length - 1}
        >
          Next ⏭️
        </button>
        
        <button 
          className="btn btn-small"
          onClick={resetSteps}
        >
          🔄 Reset
        </button>
      </div>

      <div className="speed-control">
        <label>Speed: </label>
        <select 
          value={speed} 
          onChange={(e) => setSpeed(parseInt(e.target.value))}
        >
          <option value={2000}>Slow</option>
          <option value={1000}>Normal</option>
          <option value={500}>Fast</option>
        </select>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          className="step-content"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <div className="step-description">
            <h4>Step {step.step}: {step.action?.replace('_', ' ').toUpperCase()}</h4>
            <p>{step.description}</p>
          </div>

          {step.process !== undefined && (
            <div className="step-process">
              <strong>Process: P{step.process}</strong>
            </div>
          )}

          {step.work_before && step.work_after && (
            <div className="step-work">
              <div className="work-comparison">
                <div className="work-before">
                  <h5>Work Before:</h5>
                  <div className="resource-array">
                    {step.work_before.map((val, idx) => (
                      <span key={idx} className="resource-value">
                        R{idx}: {val}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="arrow">→</div>
                <div className="work-after">
                  <h5>Work After:</h5>
                  <div className="resource-array">
                    {step.work_after.map((val, idx) => (
                      <span key={idx} className="resource-value">
                        R{idx}: {val}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step.need && (
            <div className="step-need">
              <h5>Process Need:</h5>
              <div className="resource-array">
                {step.need.map((val, idx) => (
                  <span key={idx} className="resource-value">
                    R{idx}: {val}
                  </span>
                ))}
              </div>
            </div>
          )}

          {step.finish && (
            <div className="step-finish">
              <h5>Process Status:</h5>
              <div className="finish-array">
                {step.finish.map((finished, idx) => (
                  <span 
                    key={idx} 
                    className={`process-status ${finished ? 'finished' : 'waiting'}`}
                  >
                    P{idx}: {finished ? '✅' : '⏳'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {step.safe_sequence && step.safe_sequence.length > 0 && (
            <div className="step-sequence">
              <h5>Safe Sequence So Far:</h5>
              <div className="sequence-display">
                {step.safe_sequence.map((processId, index) => (
                  <span key={index} className="sequence-item">
                    P{processId}
                    {index < step.safe_sequence.length - 1 && ' → '}
                  </span>
                ))}
              </div>
            </div>
          )}

          {step.deadlocked_processes && (
            <div className="step-deadlock">
              <h5>Deadlocked Processes:</h5>
              <div className="deadlock-processes">
                {step.deadlocked_processes.map((processId, index) => (
                  <span key={index} className="deadlock-process">
                    P{processId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="step-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        <div className="progress-text">
          Progress: {Math.round(((currentStep + 1) / steps.length) * 100)}%
        </div>
      </div>
    </div>
  );
};

export default StepByStepViewer;