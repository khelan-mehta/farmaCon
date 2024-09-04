import { model } from 'mongoose';
import { CatalogueDocument } from '../schemas/catalogue.schema';
import { CatalogueSchema } from '../../database/schemas/catalogue.schema';

// Mongoose Model for Catalogue
export const CatalogueModel = model<CatalogueDocument>('Catalogue', CatalogueSchema);
