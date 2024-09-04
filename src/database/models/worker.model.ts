import { model, Model } from 'mongoose';
import { WorkerDocument, WorkerSchema } from '../schemas/worker.schema';

export const WorkerModelName = 'Worker'; // Model name for consistent reference
export const WorkerModel: Model<WorkerDocument> = model<WorkerDocument>(WorkerModelName, WorkerSchema);
export { WorkerDocument };
