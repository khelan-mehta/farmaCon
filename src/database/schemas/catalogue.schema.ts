import { Schema } from 'mongoose';
import { CatalogueDocument } from '../../dto/interfaces/catalogue.interface';
import { DesignCodeModel } from '../../database/models/designcode.model'; // Adjust the import path as necessary

// Mongoose Schema for Catalogue
export const CatalogueSchema = new Schema<CatalogueDocument>({
  designCode: { type: Schema.Types.ObjectId, ref: 'DesignCode', required: true },  // Foreign key reference to DesignCode
  designName: { type: String, required: true },
  description: { type: String, required: true },
  imgUrls: [{ type: String, required: true }],  // Array of strings
  price: { type: Number, required: true },
}, { timestamps: true });

export { CatalogueDocument };
