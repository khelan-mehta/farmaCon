import { Schema, Document } from 'mongoose';

export interface WorkerDocument extends Document {
  mobileNo: number;
  workerName: {
    first: string;
    last: string;
  };
  deviceId: string;
  isDeleted: boolean;
  isVerified: boolean;
  password: string;
  token: string;
  isSuspended: boolean;
  isMaster: boolean;
  totalOrders: number;
}

export const WorkerSchema = new Schema<WorkerDocument>({
  mobileNo: { type: Number, required: true, maxlength: 10 },
  workerName: {
    first: { type: String, required: true },
    last: { type: String, required: true },
  },
  deviceId: { type: String, maxlength: 250 },
  isDeleted: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  password: { type: String, required: true, maxlength: 256 },
  token: { type: String, maxlength: 256 },
  isSuspended: { type: Boolean, default: false },
  isMaster: { type: Boolean, default: false },
  totalOrders: { type: Number, default: 0, maxlength: 16 },
});
