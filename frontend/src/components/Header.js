import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/simulation', label: 'Algorithm Simulation', icon: '⚙️' },
    { path: '/realtime', label: 'Real-Time System', icon: '🖥️' },
    { path: '/monitor', label: 'System Monitor', icon: '📡' },
    { path: '/dashboard', label: 'Analysis Dashboard', icon: '📊' }
  ];

  return (
    <motion.header 
      className="header"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="header-content">
        <div className="logo">
          <h1>🔒 Deadlock Handler</h1>
        </div>
        <nav className="nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;