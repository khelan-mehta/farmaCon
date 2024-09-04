import { Document, Schema } from 'mongoose';
import { Retailer } from '../../dto/interfaces/retailer.interface'; // Import Retailer interface

export type RetailerDocument = Retailer & Document; // Combine Retailer interface with Mongoose Document

const AddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
});

export const RetailerSchema = new Schema<RetailerDocument>({
  retailerID: { type: String, required: true },
  mobileNo: { type: Number, required: true },
  officeNo: { type: Number, required: true },
  firmName: { type: String, required: true },
  ownerName: {
    first: { type: String, required: true },
    last: { type: String, required: true },
  },
  isVerified: { type: Boolean, default: false },
  deviceID: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  password: { type: String, required: true },
  token: { type: String, required: true },
  isSuspended: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false },
  address: { type: AddressSchema, required: true },
  email: { type: String, required: true, unique: true },
  outstandingBalance: { type: Number, default: 0 },
});

export const RetailerModelName = 'Retailer';
