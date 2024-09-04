import { Document, Types } from 'mongoose';

interface Measurement {
  upperBody: Map<string, number>;
  lowerBody: Map<string, number>;
}

export interface Order extends Document {
  orderName: string;
  createdAt: Date;
  createdBy: Types.ObjectId;
  desc?: string;
  imgUrl: string[];
  audioFileUrl: string;
  worker: Types.ObjectId;
  workerRate: number;
  designId: string;
  trackingCode?: string;
  measurements: Measurement;
  deleted: boolean;
  price: number;
  isCompleted: boolean;
  gmId?: string;
  editedAt?: Date;
}
