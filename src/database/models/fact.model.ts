import mongoose, { Document, Model, Types } from 'mongoose';
import { FactsSchema } from '../../database/schemas/facts.schema';

export interface Fact extends Document {
  _nm: string;
  _gc: Record<string, any>;
  _add: string;
  createdBy: string | Types.ObjectId;
  isSuspended: boolean;
  wod?: Number;
  wafc?: Number;
  wc?: Number;
  dd?: Number;
  dn?: Number;
  ddistro?: Number;
  pests?: Number;
  greenery?: Number;
}

export const FactModel: Model<Fact> = mongoose.model('Fact', FactsSchema);