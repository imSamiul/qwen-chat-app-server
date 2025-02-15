import { model, Schema } from 'mongoose';

import { Token, TokenMethods, TokenModel } from '../types/token.type';
import { convertMs } from '../utils/convertMs';

// Define base UserType schema
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE
  ? process.env.REFRESH_TOKEN_LIFE
  : '7d';
const expiresIn = convertMs(refreshTokenLife) as number;
const tokenSchema = new Schema<Token, TokenModel, TokenMethods>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    expirationTime: {
      type: Date,
      expires: expiresIn / 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Create the base model
const TokenModel = model<Token, TokenModel>('Token', tokenSchema);

export default TokenModel;
