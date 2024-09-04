import mongoose from 'mongoose';
import { TransactionSchema } from '../schemas/transaction.schema';

export const TransactionModel = mongoose.model('Transactions', TransactionSchema);