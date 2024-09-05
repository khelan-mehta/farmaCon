// src/schemas/vegetable.schema.ts

import mongoose, { Schema } from 'mongoose';

export const VegetableSchema = new Schema({
  imageUrl: { type: String, required: true },
  vegName: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  farmerName: { type: String, required: true },
  dateOfCreation: { type: Date, required: true },
});
