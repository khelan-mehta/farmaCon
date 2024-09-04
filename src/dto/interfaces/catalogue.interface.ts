import { Document, Types } from 'mongoose';

export interface CatalogueDocument extends Document {
  designCode: Types.ObjectId;  // Use Types.ObjectId to reference the ObjectId type
  designName: string;
  description: string;
  imgUrls: string[];
  price: number;
}
