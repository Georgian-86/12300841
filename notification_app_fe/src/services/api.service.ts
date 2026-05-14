import axios from 'axios';
import { Log } from '../../../logging_middleware/src/logger';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const fetchNotifications = async (page = 1, type = '', limit = 10) => {
  try {
    await Log('frontend', 'info', 'api', `Fetching notifications page ${page}`);
    const response = await api.get('/notifications', {
      params: { page, type, limit }
    });
    return response.data;
  } catch (error: any) {
    await Log('frontend', 'error', 'api', error.message);
    throw error;
  }
};

export const fetchPriorityNotifications = async () => {
  try {
    await Log('frontend', 'info', 'api', 'Fetching priority notifications');
    const response = await api.get('/notifications/priority');
    return response.data;
  } catch (error: any) {
    await Log('frontend', 'error', 'api', error.message);
    throw error;
  }
};

export const markRead = async (id: string) => {
  try {
    await Log('frontend', 'info', 'api', `Marking notification ${id} as read`);
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  } catch (error: any) {
    await Log('frontend', 'error', 'api', error.message);
    throw error;
  }
};
