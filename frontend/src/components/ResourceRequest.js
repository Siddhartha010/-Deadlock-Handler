import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ResourceRequest = ({ request, onDecision, available }) => {
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onDecision('deny'); // Auto-deny if time runs out
    }
  }, [timeLeft, onDecision]);

  const canGrant = available[request.resourceType] >= request.amount;

  return (
    <motion.div
      className="resource-request card"
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
    >
      <div className="request-header">
        <h3>🔔 Resource Request</h3>
        <div className={`timer ${timeLeft <= 3 ? 'critical' : ''}`}>
          {timeLeft}s
        </div>
      </div>
      
      <div className="request-details">
        <div className="request-info">
          <span className="process-id">Process P{request.processId}</span>
          <span className="request-text">
            requests <strong>{request.amount}</strong> units of 
            <strong> Resource {request.resourceType}</strong>
          </span>
        </div>
        
        <div className="availability-check">
          <span className="available-count">
            Available: {available[request.resourceType]}
          </span>
          <span className={`status ${canGrant ? 'can-grant' : 'insufficient'}`}>
            {canGrant ? '✅ Can Grant' : '❌ Insufficient'}
          </span>
        </div>
      </div>
      
      <div className="decision-buttons">
        <motion.button
          className="btn btn-success"
          onClick={() => onDecision('grant')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!canGrant}
        >
          ✅ Grant Request
        </motion.button>
        
        <motion.button
          className="btn btn-danger"
          onClick={() => onDecision('deny')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ❌ Deny Request
        </motion.button>
      </div>
      
      <div className="risk-assessment">
        <small>
          {canGrant 
            ? "⚠️ Granting may lead to deadlock. Consider carefully!"
            : "💡 Safe to deny - insufficient resources available."
          }
        </small>
      </div>
    </motion.div>
  );
};

export default ResourceRequest;