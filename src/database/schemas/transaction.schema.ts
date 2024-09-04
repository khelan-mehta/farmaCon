import { Schema, Document, Types } from "mongoose";
import { TransactionDto } from "src/dto/transaction.dto";

export const TransactionSchema = new Schema<TransactionDto & Document>({
    amount: {type: Number, required: true},
    source: {type: String, default: "cash", required: true},
    createdAt: {type: Date, default: Date.now(), required: true},
    retailerId: Types.ObjectId,
});
