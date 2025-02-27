import { Types } from 'mongoose';

export type Notification = Document & {
  recipientId: Types.ObjectId; // ID of the user receiving the notification
  senderId?: Types.ObjectId; // ID of the user sending the notification (optional for system notifications)
  type: string; // Type of notification (e.g., 'friendRequest', 'message', 'groupInvite')
  content: string; // Optional content or message associated with the notification
  isRead: boolean; // Whether the notification has been read
  createdAt: Date; // Timestamp when the notification was created
  readAt?: Date; // Timestamp when the notification was read (optional)
};

export type UserMethods = {
  createAccessToken: () => Promise<string>;
  createRefreshToken: () => Promise<string>;
  comparePassword: (password: string) => Promise<boolean>;
};
export type UserModelType = Model<User, object, UserMethods>;
