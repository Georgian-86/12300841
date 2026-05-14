import axios from 'axios';
import { Log } from '@/utils/logger';

export interface Notification {
  ID: string;
  Type: 'Placement' | 'Result' | 'Event';
  Message: string;
  Timestamp: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export const fetchNotifications = async (
  page: number = 1,
  notification_type: string = '',
  limit: number = 10
): Promise<NotificationsResponse> => {
  try {
    await Log('frontend', 'info', 'api', `Fetching notifications page=${page} type=${notification_type}`);
    const params: Record<string, any> = { page, limit };
    if (notification_type) params.notification_type = notification_type;
    
    // Call the local Next.js proxy route to bypass CORS
    const response = await axios.get(`/api/notifications`, {
      params,
    });
    
    await Log('frontend', 'info', 'api', 'Notifications fetched successfully');
    return response.data;
  } catch (error: any) {
    await Log('frontend', 'error', 'api', `fetchNotifications failed: ${error.message}`);
    throw error;
  }
};
