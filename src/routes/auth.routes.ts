import express from 'express';
import {
  handleLogin,
  handleRefreshToken,
  handleSignUp,
} from '../controllers/auth.controller';
const router = express.Router();

router.post('/signup', handleSignUp);
router.post('/login', handleLogin);
router.post('/refresh-token', handleRefreshToken);

export default router;
