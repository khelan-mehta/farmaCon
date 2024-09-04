import mongoose, { Document, Model } from 'mongoose';
import { GMSchema } from '../../database/schemas/gm.schema';

export interface GM extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  isSuspended: boolean;
  isPremium: boolean;
  isDeleted: boolean; // Added isDeleted property
}

export const GMModel: Model<GM> = mongoose.model('GM', GMSchema);
