import { UserPayload } from '../user.type';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
