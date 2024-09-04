import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

export const UserSchema = new mongoose.Schema({
  name: {type: String, require:true},
  email: { type: String, unique: true },
  password: { type: String },
  isVerified: { type: Boolean, default: false },
  isSuspend: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false },
});
