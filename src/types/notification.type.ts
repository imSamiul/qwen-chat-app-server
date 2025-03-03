import { Model, Types } from 'mongoose';

// Define the Notification type
export type NotificationType =
  | 'friend_request'
  | 'message'
  | 'group-message'
  | 'system';

export type Notification = Document & {
  recipient: Types.ObjectId; // ID of the user receiving the notification
  sender?: Types.ObjectId; // ID of the user sending the notification (optional for system notifications)
  type: NotificationType; // Type of notification
  content: string; // Optional content or message associated with the notification
  isRead: boolean; // Whether the notification has been read
  metadata?: Record<string, any>;
};

export type UserModelType = Model<Notification>;
