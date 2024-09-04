import {
  Body,
  Controller,
  Post,
  Get,
  InternalServerErrorException,
  NotAcceptableException,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TransactionModel } from 'src/database/models/transaction.model';
import { Model } from 'mongoose';
import { isString } from 'class-validator';
import { Response } from 'express';
import { RetailerDocument } from 'src/database/schemas/retailer.schema';

@Controller('transactions')
export class TransactionsController {
  constructor(
    @InjectModel('Transactions')
    private readonly transactionModel: Model<typeof TransactionModel>,
    @InjectModel('Retailer')
    private readonly retailerModel: Model<RetailerDocument>,
  ) {}

  @Get(':_rid')
  async listTransactions(
    @Param('_rid') retailerId: string,
    @Res() res: Response,
  ) {
    const payload = { status: false, msg: '', error: null, data: null };

    try {
      // Validate retailerId
      if (!retailerId || typeof retailerId !== 'string') {
        throw new NotAcceptableException('Invalid retailer ID format');
      }

      // Fetch transactions
      const transactions = await this.transactionModel
        .find({ retailerId })
        .sort({ createdAt: -1 })
        .limit(30)
        .exec();

      // Check if transactions exist
      if (transactions.length > 0) {
        payload.data = transactions;
        payload.status = true;
        payload.msg = 'Successfully fetched transactions';
        return res.status(200).json(payload);
      } else {
        payload.msg = 'No transactions found, try again!';
        return res.status(404).json(payload);
      }
    } catch (e) {
      payload.error = e.message || e;
      throw new InternalServerErrorException(payload);
    }
  }

  @Post(':_rid/create')
  async createTransaction(
    @Param('_rid') retailerId: string,
    @Body('amount') amount: number,
    @Body('source') source: string,
    @Res() res: Response,
  ) {
    const payload = { status: false, msg: '', error: null, data: null };

    try {
      if (!retailerId || typeof retailerId !== 'string') {
        throw new NotAcceptableException('Invalid retailer ID format');
      }

      const session = await this.transactionModel.startSession();
      session.startTransaction();

      try {
        const retailer = await this.retailerModel
          .findById(retailerId)
          .session(session);

        if (!retailer) {
          throw new NotFoundException('Retailer not found');
        }

        // Update outstanding balance
        retailer.outstandingBalance -= amount;
        if (retailer.outstandingBalance < 0) {
          retailer.outstandingBalance = 0;
        }

        await retailer.save({ session });

        // Create a new transaction
        const transaction = await this.transactionModel.create(
          [{ retailerId, amount, source }],
          { session },
        );

        await session.commitTransaction();
        session.endSession();

        payload.status = true;
        payload.msg = 'Transaction successfully created';
        payload.data = transaction;

        return res.status(200).send(payload);
      } catch (error) {
        await session.abortTransaction();
        session.endSession();

        payload.error = error.message || error;
        throw new InternalServerErrorException(payload);
      }
    } catch (e) {
      payload.error = e.message || e;
      throw new InternalServerErrorException(payload);
    }
  }
}