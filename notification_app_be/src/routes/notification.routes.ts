import { Router } from 'express';
import { 
  getNotifications, 
  getPriorityNotifications, 
  markAsRead 
} from '../controllers/notification.controller';

const router = Router();

router.get('/', getNotifications);
router.get('/priority', getPriorityNotifications);
router.patch('/:id/read', markAsRead);

export default router;
