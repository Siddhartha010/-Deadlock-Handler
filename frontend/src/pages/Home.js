import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import LiveBackground from '../components/LiveBackground';

const Home = () => {
  const features = [
    {
      title: "Banker's Algorithm",
      description: "Deadlock avoidance with safe state checking",
      icon: "🏦",
      color: "#4CAF50"
    },
    {
      title: "Wait-for Graph",
      description: "Deadlock detection using graph algorithms",
      icon: "🕸️",
      color: "#2196F3"
    },
    {
      title: "Prevention Strategies",
      description: "Eliminate deadlock conditions systematically",
      icon: "🚫",
      color: "#FF9800"
    },
    {
      title: "Real-Time Systems",
      description: "Simulate actual OS deadlock scenarios",
      icon: "🖥️",
      color: "#9C27B0"
    }
  ];

  return (
    <div className="home">
      <LiveBackground />
      <motion.section 
        className="hero"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1>Deadlock Handling System</h1>
        <p>Master operating system deadlock concepts through interactive simulations</p>
        <div className="hero-buttons">
          <Link to="/simulation" className="btn btn-primary">Algorithm Simulation</Link>
          <Link to="/realtime" className="btn btn-secondary">Real-Time System</Link>
        </div>
      </motion.section>

      <motion.section 
        className="features"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <h2>Features</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              style={{ borderColor: feature.color }}
              whileHover={{ scale: 1.05, boxShadow: `0 10px 30px ${feature.color}30` }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <div className="feature-icon" style={{ color: feature.color }}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default Home;