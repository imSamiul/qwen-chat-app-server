import { Document, Model, Types } from 'mongoose';

export type User = Document & {
  _id: Types.ObjectId;
  uniqueID: string;
  username: string;
  email: string;
  password: string;
  friends: Types.ObjectId[];
  friendRequests: Types.ObjectId[];
};

export type UserMethods = {
  createAccessToken: () => Promise<string>;
  createRefreshToken: () => Promise<string>;
  comparePassword: (password: string) => Promise<boolean>;
};
export type UserModelType = Model<User, object, UserMethods>;
