import { model, Schema } from 'mongoose';
import { Notification } from '../types/notification.type';

// Define the Notification schema
const notificationSchema = new Schema<Notification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: ['friend_request', 'new_message', 'group_invite', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Schema.Types.Mixed, // Flexible key-value pairs for additional context
      default: {},
    },
  },
  {
    timestamps: true, // Automatically add `createdAt` and `updatedAt` fields
  }
);

// Compound index for efficient querying of unread notifications for a user
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// Create the model
const NotificationModel = model<Notification>(
  'Notification',
  notificationSchema
);

export default NotificationModel;
