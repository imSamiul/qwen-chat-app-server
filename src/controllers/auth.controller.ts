import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import mongoose from 'mongoose';
import { z } from 'zod';
import TokenModel from '../models/token.model';
import UserModel from '../models/user.model';
import { User } from '../types/user.type';
import { ApiError, handleApiError } from '../utils/apiError';
import { convertMs } from '../utils/convertMs';
import { createCookieOptions } from '../utils/cookieOptions';

const signupSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long' }), // Add a custom error message
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
});

//GET: get profile of the user
export async function handleProfile(req: Request, res: Response) {
  try {
    const user = req.user;
    const findUser = await UserModel.findById((user as User)._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ user: findUser });
  } catch (error) {
    console.error('Profile Error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to get profile';
    res.status(500).json({ message: errorMessage });
  }
}

// POST: Create a new user
export async function handleSignUp(req: Request, res: Response) {
  try {
    // Validate input
    const input = signupSchema.parse(req.body);

    // Check for existing user
    const existingUser = await UserModel.findOne({ email: input.email });
    if (existingUser) {
      throw new ApiError(409, 'Email already in use');
    }

    // Create and save new user
    const newUser = new UserModel(input);
    const savedUser = await newUser.save();

    // Generate tokens
    const [accessToken, refreshToken] = await Promise.all([
      newUser.createAccessToken(),
      newUser.createRefreshToken(),
    ]);

    // Set cookie and send response
    res
      .status(201)
      .cookie(
        'refreshToken',
        refreshToken,
        createCookieOptions(process.env.REFRESH_TOKEN_LIFE)
      )
      .json({
        user: savedUser,
        accessToken,
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

    res.status(201).cookie('refreshToken', refreshToken, options).json({
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
// POST: refresh token
export async function handleRefreshToken(req: Request, res: Response) {
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  const accessTokenLife = process.env.ACCESS_TOKEN_LIFE || '30m';

  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(403).json({ error: 'Access denied, token missing!' });
    }

    const tokenDoc = await TokenModel.findOne({ refreshToken });

    if (!tokenDoc) {
      return res.status(401).json({ error: 'Token expired!' });
    }

    // Type guard for the secret
    if (!accessTokenSecret) {
      throw new Error('ACCESS_TOKEN_SECRET is not configured');
    }

    const payload = jwt.verify(tokenDoc.refreshToken, refreshTokenSecret!) as {
      user: { _id: mongoose.Types.ObjectId; uniqueId: string };
    };

    const accessToken = jwt.sign(
      { user: payload?.user },
      accessTokenSecret as string,
      {
        expiresIn: accessTokenLife,
      } as SignOptions
    );

    return res.status(200).json({ accessToken });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to refresh token';

    res.status(403).json({ message: errorMessage });
  }
}
