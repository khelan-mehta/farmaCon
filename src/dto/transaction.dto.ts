import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Types } from "mongoose";

export class TransactionDto {
    @IsNumber({maxDecimalPlaces: 2})
    @IsNotEmpty()
    readonly amount: number;
    @IsString()
    @IsNotEmpty()
    readonly source: string;
    @IsDate()
    createdAt: Date;
    @IsNotEmpty()
    @IsString()
    readonly retailerId: Types.ObjectId;
}