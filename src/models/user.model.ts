import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Token } from '../types/token.type';
import { User, UserMethods, UserModelType } from '../types/user.type';
import { convertMs } from '../utils/convertMs';
import TokenModel from './token.model';
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

const userSchema = new mongoose.Schema<User, UserModelType, UserMethods>(
  {
    username: { type: String, required: true, unique: true },
    uniqueId: { type: String, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // List of friends
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Pending friend requests
  },
  {
    timestamps: true,
  }
);
const REFRESH_TOKEN_LIFE = process.env.REFRESH_TOKEN_LIFE ?? '7d';
const ACCESS_TOKEN_LIFE = process.env.ACCESS_TOKEN_LIFE ?? '15m';
const refreshTokenLife = convertMs(REFRESH_TOKEN_LIFE) as number;

userSchema.method('createAccessToken', async function createAccessToken() {
  try {
    const { _id, uniqueId } = this;
    const accessToken = jwt.sign(
      { user: { _id, uniqueId } },
      ACCESS_TOKEN_SECRET as Secret,
      {
        expiresIn: ACCESS_TOKEN_LIFE,
      } as SignOptions
    );
    return accessToken;
  } catch (error) {
    console.error(error);
    return;
  }
});
userSchema.method('createRefreshToken', async function createRefreshToken() {
  try {
    const { _id, uniqueId } = this;
    const refreshToken = jwt.sign(
      { user: { _id, uniqueId } },
      REFRESH_TOKEN_SECRET as Secret,
      {
        expiresIn: REFRESH_TOKEN_LIFE,
      } as SignOptions
    );
    const token = new TokenModel<Token>({
      userId: _id,
      refreshToken: refreshToken,
      expirationTime: new Date(Date.now() + refreshTokenLife),
    });
    await token.save();
    return refreshToken;
  } catch (error) {
    console.error(error);
    return;
  }
});

// //pre save hook to hash password before saving user into the database:
userSchema.pre('save', async function (next) {
  if (this.password && (this.isModified('password') || this.isNew)) {
    try {
      const salt = await bcrypt.genSalt(12); // generate hash salt of 12 rounds
      const hashedPassword = await bcrypt.hash(this.password, salt); // hash the current user's password
      this.password = hashedPassword;
    } catch (error) {
      console.error(error);
    }
  }
  if (!this.uniqueId) {
    const uuid = uuidv4();
    this.uniqueId = `U-${uuid.slice(0, 8)}`;
  }

  return next();
});

// // delete password field from user object before sending it to the client
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};
userSchema.methods.comparePassword = async function (password: string) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    console.error(error);
    return false;
  }
};

const UserModel = mongoose.model<User, UserModelType>('User', userSchema);
export default UserModel;
