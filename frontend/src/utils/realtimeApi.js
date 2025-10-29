import api from './api';

export const initRealTimeSystem = async (systemConfig) => {
  return api.post('/realtime/init', systemConfig);
};

export const requestResourceRT = async (processId, resourceId) => {
  return api.post('/realtime/request', {
    process_id: processId,
    resource_id: resourceId
  });
};

export const releaseResourceRT = async (processId, resourceId) => {
  return api.post('/realtime/release', {
    process_id: processId,
    resource_id: resourceId
  });
};

export const getRealTimeStatus = async () => {
  return api.get('/realtime/status');
};

export const autoResolveDeadlock = async () => {
  return api.post('/realtime/auto-resolve');
};

export const getPerformanceMetrics = async () => {
  return api.get('/realtime/metrics');
};

export const getFullSimulationLog = async () => {
  return api.get('/realtime/full-log');
};