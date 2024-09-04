import { Document } from 'mongoose';

export interface User extends Document {
  name: string,
  email: string;
  password: string;
  isVerified:boolean,
  isSuspend: boolean;
  isDeleted: boolean;
  isPremium: boolean;
}
