import { Schema, Types } from 'mongoose';

const MeasurementSchema = new Schema({
  upperBody: { type: Map, of: Number, required: true },
  lowerBody: { type: Map, of: Number, required: true }
}, { _id: false });

const OrderSchema = new Schema({
  orderName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Types.ObjectId, required: true, ref: 'Retailer' },
  desc: { type: String },
  imgUrl: [{ type: String }],
  audioFileUrl: { type: String},
  worker: { type: Types.ObjectId, required: true, ref: 'Worker' },
  workerRate: { type: Number, required: true },
  designId: { type: String, required: true },
  trackingCode: { type: String },
  measurements: { type: MeasurementSchema, required: true },
  deleted: { type: Boolean, default: false },
  price: { type: Number, required: true },
  isCompleted: { type: Boolean, default: false },
  gmId: { type: Types.ObjectId, ref: 'GM' }, // Include gmId as an optional field
  editedAt: { type: Date } // New field to track when the order is edited by a GM
});

export default OrderSchema;
