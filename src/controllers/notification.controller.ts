import { Request, Response } from 'express';
import NotificationModel from '../models/notification.model';
import { handleApiError } from '../utils/apiError';

// get all notifications for a user
export async function handleGetNotifications(req: Request, res: Response) {
  try {
    const userId = req.user!._id;
    const notifications = await NotificationModel.find({
      recipient: userId,
    }).sort({ createdAt: -1, isRead: 1 });
    res.status(200).json(notifications);
  } catch (error) {
    handleApiError(res, error);
  }
}

// mark all the notification as read for a user
export async function handleMarkNotificationRead(req: Request, res: Response) {
  try {
    const userId = req.user!._id;

    await NotificationModel.updateMany(
      {
        recipient: userId,
        isRead: false,
      },
      { isRead: true }
    );

    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    handleApiError(res, error);
  }
}
