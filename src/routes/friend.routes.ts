import express from 'express';
import { searchFriend } from '../controllers/friend.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';
const router = express.Router();

router.get('/search-friend', isAuthenticated, searchFriend);

export default router;
