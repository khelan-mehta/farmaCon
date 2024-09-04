import { model } from 'mongoose';
import { RetailerSchema } from '../schemas/retailer.schema';

export const RetailerModel = model('Retailer', RetailerSchema);
