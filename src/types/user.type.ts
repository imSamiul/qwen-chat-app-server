import { Document, Model, Types } from 'mongoose';

export type User = Document & {
  _id: Types.ObjectId;
  uniqueId: string;
  username: string;
  email: string;
  password: string;
  friends: User[];
  friendRequests: User[];
};

export type UserPayload = {
  _id: Types.ObjectId;
  uniqueId: string;
};

export type UserMethods = {
  createAccessToken: () => Promise<string>;
  createRefreshToken: () => Promise<string>;
  comparePassword: (password: string) => Promise<boolean>;
};
export type UserModelType = Model<User, object, UserMethods>;
