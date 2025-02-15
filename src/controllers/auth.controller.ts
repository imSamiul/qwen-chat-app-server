import { Request, Response } from 'express';
import UserModel from '../models/user.model';
import { convertMs } from '../utils/convertMs';

// POST: Create a new user
export async function handleSignUp(req: Request, res: Response) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(422).json({ message: 'Missing required fields' });
  }
  try {
    //check if username is already taken:
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is taken.' });
    }

    const newUser = new UserModel({
      username,
      email,
      password,
    });

    if (!newUser) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    try {
      const savedUser = await newUser.save();
      const accessToken = await newUser.createAccessToken();
      const refreshToken = await newUser.createRefreshToken();

      const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE ?? '7d';
      const jwtCookieExpire = convertMs(refreshTokenLife) as number; // Converts '7d' to milliseconds
      const options: {
        expires: Date;
        httpOnly: boolean;
        secure: boolean;
        sameSite: 'strict';
      } = {
        expires: new Date(Date.now() + jwtCookieExpire),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      };

      res.status(201).cookie('refreshToken', refreshToken, options).json({
        user: savedUser,
        accessToken,
      });
      return;
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      return res.status(500).json({
        message: 'Error creating account',
        error: saveError instanceof Error ? saveError.message : 'Unknown error',
      });
    }
  } catch (error) {
    console.error('SignUp Error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create account';
    res.status(500).json({ message: errorMessage });
    return;
  }
}
// POST: Login user
export async function handleLogin(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ message: 'Missing required fields' });
  }
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const accessToken = await user.createAccessToken();
    const refreshToken = await user.createRefreshToken();

    const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE ?? '7d';
    const jwtCookieExpire = convertMs(refreshTokenLife) as number; // Converts '7d' to milliseconds
    const options: {
      expires: Date;
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'strict';
    } = {
      expires: new Date(Date.now() + jwtCookieExpire),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    };

    res.status(200).cookie('refreshToken', refreshToken, options).json({
      user,
      accessToken,
    });
  } catch (error) {
    console.error('SignIn Error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to sign in';
    res.status(500).json({ message: errorMessage });
  }
}
