import express from 'express';
import { handleGetNotifications } from '../controllers/notification.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';
const router = express.Router();

router.get('/get-notifications', isAuthenticated, handleGetNotifications);

export default router;
