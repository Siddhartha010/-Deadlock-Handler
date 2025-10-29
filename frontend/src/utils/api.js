import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const simulateDeadlock = async (algorithm, config) => {
  const endpoints = {
    bankers: '/bankers',
    detection: '/detection',
    prevention: '/prevention/simulate',
    recovery: '/recovery-options'
  };
  
  return api.post(endpoints[algorithm] || endpoints.bankers, config);
};

export const requestResources = async (config) => {
  return api.post('/request-resources', config);
};

export const getRecoveryOptions = async (config) => {
  return api.post('/recovery-options', config);
};

export const runFullSimulation = async (config) => {
  return api.post('/simulate', config);
};

export default api;