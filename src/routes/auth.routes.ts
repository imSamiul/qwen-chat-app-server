import express from 'express';
import {
  handleLogin,
  handleLogout,
  handleProfile,
  handleRefreshToken,
  handleSignUp,
} from '../controllers/auth.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';
const router = express.Router();

router.get('/profile', isAuthenticated, handleProfile);

router.post('/signup', handleSignUp);
router.post('/login', handleLogin);
router.post('/logout', isAuthenticated, handleLogout);
router.post('/refresh-token', handleRefreshToken);

export default router;
