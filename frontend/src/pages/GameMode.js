import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameStats from '../components/GameStats';
import ResourceRequest from '../components/ResourceRequest';
import GameVisualization from '../components/GameVisualization';

const GameMode = () => {
  const [gameState, setGameState] = useState({
    score: 0,
    level: 1,
    lives: 3,
    resources: { A: 3, B: 3, C: 2 },
    available: { A: 3, B: 3, C: 2 },
    processes: []
  });
  
  const [currentRequest, setCurrentRequest] = useState(null);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showDeadlock, setShowDeadlock] = useState(false);

  const generateRequest = useCallback(() => {
    const processId = Math.floor(Math.random() * 5);
    const resourceType = ['A', 'B', 'C'][Math.floor(Math.random() * 3)];
    const amount = Math.floor(Math.random() * 2) + 1;
    
    setCurrentRequest({
      processId,
      resourceType,
      amount,
      timestamp: Date.now()
    });
  }, []);

  const handleDecision = (decision) => {
    if (!currentRequest) return;

    let newScore = gameState.score;
    let newAvailable = { ...gameState.available };
    let newLives = gameState.lives;

    if (decision === 'grant') {
      if (newAvailable[currentRequest.resourceType] >= currentRequest.amount) {
        newAvailable[currentRequest.resourceType] -= currentRequest.amount;
        newScore += 10;
        
        // Check for deadlock (simplified)
        if (Math.random() < 0.15) {
          setShowDeadlock(true);
          newLives -= 1;
          newScore -= 50;
        }
      } else {
        newScore -= 20;
        newLives -= 1;
      }
    } else {
      newScore += 5; // Safe decision
    }

    setGameState(prev => ({
      ...prev,
      score: newScore,
      available: newAvailable,
      lives: newLives
    }));

    setCurrentRequest(null);
    
    if (newLives <= 0) {
      setGameActive(false);
    } else {
      setTimeout(generateRequest, 1000);
    }
  };

  const startGame = () => {
    setGameActive(true);
    setTimeLeft(30);
    setGameState({
      score: 0,
      level: 1,
      lives: 3,
      resources: { A: 3, B: 3, C: 2 },
      available: { A: 3, B: 3, C: 2 },
      processes: []
    });
    generateRequest();
  };

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameActive(false);
    }
  }, [gameActive, timeLeft]);

  return (
    <div className="game-mode">
      <motion.div 
        className="game-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>🎮 Resource Manager Game</h1>
        <p>Allocate resources wisely to avoid deadlock!</p>
      </motion.div>

      <div className="game-content">
        <div className="game-left">
          <GameStats 
            gameState={gameState}
            timeLeft={timeLeft}
            gameActive={gameActive}
          />
          
          {!gameActive && (
            <motion.button
              className="btn btn-primary start-game"
              onClick={startGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {gameState.lives <= 0 ? 'Restart Game' : 'Start Game'}
            </motion.button>
          )}
        </div>

        <div className="game-center">
          <GameVisualization 
            gameState={gameState}
            currentRequest={currentRequest}
          />
          
          <AnimatePresence>
            {currentRequest && gameActive && (
              <ResourceRequest
                request={currentRequest}
                onDecision={handleDecision}
                available={gameState.available}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="game-right">
          <div className="resource-status">
            <h3>Available Resources</h3>
            {Object.entries(gameState.available).map(([type, count]) => (
              <div key={type} className="resource-item">
                <span className="resource-type">{type}:</span>
                <span className="resource-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDeadlock && (
          <motion.div
            className="deadlock-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="modal-content">
              <h2>⚠️ Deadlock Detected!</h2>
              <p>Your allocation caused a deadlock. Choose recovery option:</p>
              <div className="recovery-options">
                <button 
                  className="btn btn-warning"
                  onClick={() => setShowDeadlock(false)}
                >
                  Terminate Process
                </button>
                <button 
                  className="btn btn-info"
                  onClick={() => setShowDeadlock(false)}
                >
                  Preempt Resources
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameMode;