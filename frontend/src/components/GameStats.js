import React from 'react';
import { motion } from 'framer-motion';

const GameStats = ({ gameState, timeLeft, gameActive }) => {
  return (
    <motion.div 
      className="game-stats card"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h3>Game Statistics</h3>
      
      <div className="stat-item">
        <span className="stat-label">Score:</span>
        <span className="stat-value score">{gameState.score}</span>
      </div>
      
      <div className="stat-item">
        <span className="stat-label">Level:</span>
        <span className="stat-value">{gameState.level}</span>
      </div>
      
      <div className="stat-item">
        <span className="stat-label">Lives:</span>
        <span className="stat-value lives">
          {'❤️'.repeat(gameState.lives)}
          {'🤍'.repeat(3 - gameState.lives)}
        </span>
      </div>
      
      {gameActive && (
        <div className="stat-item">
          <span className="stat-label">Time Left:</span>
          <span className={`stat-value timer ${timeLeft <= 10 ? 'warning' : ''}`}>
            {timeLeft}s
          </span>
        </div>
      )}
      
      <div className="game-tips">
        <h4>Tips:</h4>
        <ul>
          <li>Grant requests carefully to avoid deadlock</li>
          <li>Monitor resource availability</li>
          <li>Denying requests is sometimes safer</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default GameStats;