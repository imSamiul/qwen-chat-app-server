import { Request, Response } from 'express';
import { z } from 'zod';
import UserModel from '../models/user.model';
import { ApiError, handleApiError } from '../utils/apiError';

const searchFriendSchema = z.object({
  uniqueId: z.string().min(1),
});

// GET: search for friend
export async function searchFriend(req: Request, res: Response) {
  const senderId = req.user!._id;
  console.log(req.user);

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
