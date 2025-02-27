import { Request, Response } from 'express';
import { z } from 'zod';
import UserModel from '../models/user.model';
import { ApiError, handleApiError } from '../utils/apiError';
import { send } from 'process';
import mongoose from 'mongoose';

const searchFriendSchema = z.object({
  uniqueId: z.string().min(1),
});
const sendFriendRequestSchema = z.object({
  senderId:z.instanceof(mongoose.Types.ObjectId),
  recipientId: z.instanceof(mongoose.Types.ObjectId)
})

// GET: search for friend
export async function searchFriend(req: Request, res: Response) {
  const senderId = req.user!._id;


  try {
    // validate input
    const { uniqueId } = searchFriendSchema.parse(req.query);
    // Search for friend
    const recipient = await UserModel.findOne(
      { uniqueId: { $regex: uniqueId, $options: 'i' } },
      { username: 1, uniqueId: 1, avatar: 1, friendRequests: 1, friends: 1 }
    );
    if (!recipient) {
      throw new ApiError(404, 'User not found');
    }
    const hasSentRequest = recipient.friendRequests.includes(senderId);
    const isFriend = recipient.friends.includes(senderId);

    res.json({
      user: recipient,
      hasSentRequest, // True if sender's ID is in recipient's messageRequests
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
export const handleFriendRequest = (req: Request, res: Response) => {
 try {
    // validate input
    const { senderId, recipientId } = sendFriendRequestSchema.parse(req.query);
      const recipient = await UserModel.findById(recipientId);
      if (!recipient) {
        throw new ApiError(404, 'Recipient not found');
      }
      // Check if recipient has already received a friend request from sender
      
        if (!recipient?.friendRequests.includes(senderId)) {
          recipient?.friendRequests.push(senderId);
          await recipient?.save();
        }

  socket.on(
    'sendFriendRequest',
    async (data: { senderId: Types.ObjectId; recipientId: string }) => {
      console.log(data);

      try {
        const { senderId, recipientId } = data;
        if (socket.user?._id !== senderId) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }
        // Save to database (your logic here)
        console.log(`Friend request from ${senderId} to ${recipientId}`);

      
        // Emit real-time notification to the recipient
        socketStore.emitToUser(recipientId, 'newFriendRequest', {
          senderId,
          senderName: (await UserModel.findById(senderId))?.username,
          createdAt: new Date(),
        });
      } catch (error) {
        console.error('Error handling friend request:', error);
      }
    }
  );
};
