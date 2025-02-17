import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserPayload } from '../types/user.type';

const { ACCESS_TOKEN_SECRET } = process.env;

interface JwtPayload {
  user: UserPayload;
}

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authToken = req.get('x-auth-token');

    if (!authToken) {
      throw new Error('No access token found');
    }
    try {
      //if the incoming request has a valid token, we extract the payload from the token and attach it to the request object.
      const payload = jwt.verify(
        authToken,
        ACCESS_TOKEN_SECRET as string
      ) as JwtPayload;
      req.user = payload.user;

      next();
    } catch (error) {
      // Explicitly assert the error as `Error` type
      if (error instanceof jwt.TokenExpiredError) {
        // clear the cookie and send a message to the client
        res.clearCookie('refreshToken');
        return res
          .status(401)
          .json({ error: 'Session timed out, please login again' });
      } else if (error instanceof jwt.JsonWebTokenError) {
        return res
          .status(401)
          .json({ error: 'Invalid token, please login again!' });
      } else {
        // Catch other unprecedented errors
        console.error(error);
        return res.status(400).json({ error: 'An unexpected error occurred' });
      }
    }
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(403).json({ message: errorMessage });
  }
}
