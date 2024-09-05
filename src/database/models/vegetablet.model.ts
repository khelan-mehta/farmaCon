// src/models/vegetable.model.ts

import mongoose from 'mongoose';
import { VegetableSchema } from '../schemas/vegetable.schema';
import { Vegetable } from 'src/dto/interfaces/vegetable.interface';

export const VegetableModel = mongoose.model<Vegetable>('Vegetable', VegetableSchema);
