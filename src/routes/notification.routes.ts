import express from 'express';
import {
  handleGetNotifications,
  handleMarkNotificationRead,
} from '../controllers/notification.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';
const router = express.Router();

router.get('/get-notifications', isAuthenticated, handleGetNotifications);

router.patch(
  '/mark-notifications-read',
  isAuthenticated,
  handleMarkNotificationRead
);

export default router;
