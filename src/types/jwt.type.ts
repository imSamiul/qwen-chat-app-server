import { Types } from 'mongoose';

export type UserPayload = {
  _id: Types.ObjectId;
  uniqueId: string;
};
export type JwtPayload = {
  user: UserPayload;
};
