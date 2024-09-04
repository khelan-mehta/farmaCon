// src/design-codes/models/design-code.model.ts

import { model, Document, Model } from 'mongoose';
import { DesignCodeDocument, DesignCodeSchema } from '../schemas/designcode.schema';
import { DesignCode } from '../../dto/interfaces/designcode.interface';

export interface DesignCodeModel extends DesignCode, Document {}

export const DesignCodeModelName = 'DesignCode'; // Model name for consistent reference
export const DesignCodeModel: Model<DesignCodeDocument> = model<DesignCodeDocument>(DesignCodeModelName, DesignCodeSchema);
export { DesignCodeDocument, DesignCodeSchema };
