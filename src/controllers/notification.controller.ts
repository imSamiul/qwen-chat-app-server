import { Request, Response } from 'express';
import NotificationModel from '../models/notification.model';
import { handleApiError } from '../utils/apiError';

export async function handleGetNotifications(req: Request, res: Response) {
  try {
    const userId = req.user!._id;
    const notifications = await NotificationModel.find({
      recipient: userId,
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    handleApiError(res, error);
  }
}
