import express from 'express';
import {
  handleSearchFriend,
  handleSendFriendRequest,
} from '../controllers/friend.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';
const router = express.Router();

router.get('/search-friend', isAuthenticated, handleSearchFriend);
router.post('/send-friend-request', isAuthenticated, handleSendFriendRequest);

export default router;
