import { Request, Response } from 'express';
import { z } from 'zod';
import UserModel from '../models/user.model';
import * as socketStore from '../socket/socketStore';
import { ApiError, handleApiError } from '../utils/apiError';

const searchFriendSchema = z.object({
  uniqueId: z
    .string()
    .min(1, { message: 'Search query must be at least 1 character long' }),
});
// const sendFriendRequestSchema = z.object({
//   senderId: z.instanceof(mongoose.Types.ObjectId),
//   recipientId: z.instanceof(mongoose.Types.ObjectId),
// });
// GET: search for friend
export async function handleSearchFriend(req: Request, res: Response) {
  const senderId = req.user!._id;

  try {
    // validate input
    const { uniqueId } = searchFriendSchema.parse(req.query);
    // Search for friend
    const recipient = await UserModel.findOne(
      { uniqueId: { $regex: uniqueId, $options: 'i' } },
      { username: 1, uniqueId: 1, avatar: 1, friendRequests: 1, friends: 1 }
    );
    const sender = await UserModel.findById(senderId);

    if (!recipient) {
      throw new ApiError(404, 'User not found');
    }
    const hasSentRequest = recipient.friendRequests.includes(senderId);
    const hasReceiveRequest = sender?.friendRequests.includes(recipient._id);
    const isFriend = recipient.friends.includes(senderId);

    res.json({
      user: recipient,
      hasSentRequest, // True if sender's ID is in recipient's messageRequests
      hasReceiveRequest, // True if recipient's ID is in sender's messageRequests
      isFriend,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return res.status(422).json({
        message: firstError.message,
        field: firstError.path.join('.'),
      });
    }
    handleApiError(res, error);
  }
}
//POST: send friend request
export async function handleSendFriendRequest(req: Request, res: Response) {
  try {
    // validate input
    const { recipientId } = req.body;
    const senderId = req.user!._id;

    const recipient = await UserModel.findById(recipientId);
    const sender = await UserModel.findById(senderId);
    if (!recipient) {
      throw new ApiError(404, 'Recipient not found');
    }
    // Check if recipient has already received a friend request from sender

    if (!recipient?.friendRequests.includes(senderId)) {
      recipient?.friendRequests.push(senderId);
      await recipient?.save();
    }

    // Emit real-time notification to the recipient

    socketStore.emitToUser(recipientId, 'newFriendRequest', {
      senderId: senderId,
      senderName: sender?.username,
      createdAt: new Date(),
    });

    // Send success response
    res.status(200).json({ message: 'Friend request sent successfully' });
  } catch (error) {
    handleApiError(res, error);
  }
}
