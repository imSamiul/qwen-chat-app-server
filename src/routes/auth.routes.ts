import express from 'express';
import {
  handleLogin,
  handleProfile,
  handleRefreshToken,
  handleSignUp,
} from '../controllers/auth.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';
const router = express.Router();

router.get('/profile', isAuthenticated, handleProfile);

router.post('/signup', handleSignUp);
router.post('/login', handleLogin);
router.post('/refresh-token', handleRefreshToken);

export default router;
