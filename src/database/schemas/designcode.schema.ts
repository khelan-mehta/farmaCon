import { Schema, Document, model } from 'mongoose';

export interface DesignCodeDocument extends Document {
  designId: string;
  designName: string;
  deviceId: string;
  isDeleted: boolean;
  password: string;
  token: string;
  isSuspended: boolean;
  isMaster: boolean;
  totalOrders: number;
  isPremium: boolean;
  images: string[]; // Array to store image URLs (maximum 2)
  description: string;
  fabricType: string;
  designCodePrice: number;
  category : string;
}

export const DesignCodeSchema = new Schema<DesignCodeDocument>({
  designId: { type: String, required: true },
  designName: { type: String, required: true },
  deviceId: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  password: { type: String, required: true },
  token: { type: String, required: true },
  isSuspended: { type: Boolean, default: false },
  isMaster: { type: Boolean, default: false },
  totalOrders: { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false },
  images: { type: [String], validate: [arrayLimit, '{PATH} exceeds the limit of 2'] }, // Array for image URLs, with a max of 2
  description: { type: String, required: true },
  fabricType: { type: String, required: true },
  designCodePrice: { type: Number, required: true },
  category  : {type: String, required: true }
});

function arrayLimit(val: string[]) {
  return val.length <= 2;
}

// Mongoose Model for DesignCode
export const DesignCodeModel = model<DesignCodeDocument>('DesignCode', DesignCodeSchema);
