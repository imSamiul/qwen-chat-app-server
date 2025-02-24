import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { JwtPayload, UserPayload } from '../types/jwt.type';

export interface AuthenticatedSocket extends Socket {
  user?: UserPayload;
}

export const socketAuth = async (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
) => {
  try {
    const token =
      socket.handshake.auth.socket_token ||
      socket.handshake.headers?.socket_token;

    if (!token) {
      return next(new Error('Authentication error: Token not provided'));
    }
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || '';

    const payload = jwt.verify(token, accessTokenSecret) as JwtPayload;

    socket.user = payload.user;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};
