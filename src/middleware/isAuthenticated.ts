import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/jwt.type';

const { ACCESS_TOKEN_SECRET } = process.env;

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authToken = req.get('x-auth-token');

    if (!authToken) {
      return res.status(401).json({ error: 'No access token found' });
    }

    try {
      const payload = jwt.verify(
        authToken,
        ACCESS_TOKEN_SECRET as string
      ) as JwtPayload;
      req.user = payload.user;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        // Don't clear refresh token, just return 401
        return res.status(401).json({ error: 'Access token expired' });
      } else if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: 'Invalid token' });
      } else {
        console.error(error);
        return res.status(400).json({ error: 'An unexpected error occurred' });
      }
    }
  } catch (error) {
    return res.status(403).json({
      error: error instanceof Error ? error.message : 'Authentication failed',
    });
  }
}
