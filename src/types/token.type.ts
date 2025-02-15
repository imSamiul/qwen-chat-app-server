import mongoose, { Model } from 'mongoose';

export type Token = {
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  expirationTime: Date;
};

export type TokenMethods = object;

export type TokenModel = Model<Token, object, TokenMethods>;
