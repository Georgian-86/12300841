import { Request, Response } from 'express';
import { Log } from '../../../logging_middleware/src/logger';
import { getTopNotifications } from '../utils/priorityNotifications';

// Mock data for demonstration as per Stage 7 requirements
const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'Placement', message: 'New Job at Microsoft', createdAt: new Date().toISOString(), is_read: false },
  { id: '2', type: 'Result', message: 'Semester 4 Results Out', createdAt: new Date(Date.now() - 86400000).toISOString(), is_read: true },
  { id: '3', type: 'Event', message: 'Hackathon Registration Open', createdAt: new Date(Date.now() - 172800000).toISOString(), is_read: false },
  { id: '4', type: 'Placement', message: 'Amazon Interview Scheduled', createdAt: new Date(Date.now() - 3600000).toISOString(), is_read: false },
  { id: '5', type: 'Event', message: 'Workshop on AI', createdAt: new Date(Date.now() - 432000000).toISOString(), is_read: false },
];

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    await Log('backend', 'info', 'controller', 'Fetching all notifications');

    let filtered = MOCK_NOTIFICATIONS;
    if (type) {
      filtered = MOCK_NOTIFICATIONS.filter(n => n.type === type);
    }

    // Simple pagination
    const start = (Number(page) - 1) * Number(limit);
    const paginated = filtered.slice(start, start + Number(limit));

    res.json({
      success: true,
      data: paginated,
      pagination: {
        total: filtered.length,
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error: any) {
    await Log('backend', 'error', 'controller', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPriorityNotifications = async (req: Request, res: Response) => {
  try {
    await Log('backend', 'info', 'controller', 'Fetching priority notifications');
    const top = getTopNotifications(MOCK_NOTIFICATIONS, 10);
    res.json({ success: true, data: top });
  } catch (error: any) {
    await Log('backend', 'error', 'controller', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Log('backend', 'info', 'controller', `Marking notification ${id} as read`);
    
    // Logic to update DB would go here
    const notif = MOCK_NOTIFICATIONS.find(n => n.id === id);
    if (notif) notif.is_read = true;

    res.json({ success: true, message: 'Marked as read' });
  } catch (error: any) {
    await Log('backend', 'error', 'controller', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
