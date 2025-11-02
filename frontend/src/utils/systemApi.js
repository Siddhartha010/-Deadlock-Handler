import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/system';

export const getSystemProcesses = async () => {
  return await axios.get(`${API_BASE_URL}/processes`);
};

export const getSystemResources = async () => {
  return await axios.get(`${API_BASE_URL}/resources`);
};