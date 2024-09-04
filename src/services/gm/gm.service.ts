import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GM } from '../../database/schemas/gm.schema';
import { CreateGmDto, UpdateGmDto } from '../../dto/gm.dto';
import { LoggerService } from '../logger.service';
import { Order } from '../../dto/interfaces/order.interface';
import { User } from 'src/dto/interfaces/user.interface';
import {
  RetailerDocument,
  RetailerModelName,
} from '../../database/schemas/retailer.schema';
import {
  WorkerDocument,
  WorkerModelName,
} from '../../database/models/worker.model';
import { SearchOrdersDto, UpdateOrderDto } from 'src/dto/order.dto';
import {
  DesignCodeDocument,
  DesignCodeModel,
  DesignCodeModelName,
} from 'src/database/models/designcode.model';
import { MailerService } from '../mailer/mailer.service';
import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';
import axios from 'axios';

@Injectable()
export class GmService {
  constructor(
    @InjectModel(GM.name) private gmModel: Model<GM>,
    @InjectModel('Order') private readonly orderModel: Model<any>,
    @InjectModel(DesignCodeModelName)
    private readonly designCodeModel: Model<DesignCodeDocument>,
    // @InjectModel('Order') private readonly orderModel: Model<Order>,
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel(RetailerModelName)
    private readonly retailerModel: Model<RetailerDocument>,
    @InjectModel(WorkerModelName)
    private readonly workerModel: Model<WorkerDocument>, // Ensure correct model name
    private logger: LoggerService,
    private mailerService: MailerService,
  ) {}

  async create(createGmDto: CreateGmDto, creatorId: string): Promise<GM> {
    try {
      this.logger.log(`Creating new GM by creator with ID: ${creatorId}`);

      const creator = await this.gmModel.findById(creatorId);
      if (!creator) {
        throw new NotFoundException('Creator GM not found');
      }

      if (!creator.isPremium) {
        throw new ForbiddenException('Only premium GMs can create new GMs');
      }

      const createdGm = new this.gmModel(createGmDto);
      return await createdGm.save();
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        error['code'] === 11000
      ) {
        this.logger.error('Email already exists');
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async createShippingSlip(orderId: string): Promise<Buffer> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const retailerId = order.createdBy;
    const retailerResponse = await axios.get(
      `http://localhost:3000/retailers/${retailerId}`,
    );
    const retailer = retailerResponse.data;

    if (!retailer) {
      throw new NotFoundException(`Retailer with ID ${retailerId} not found`);
    }

    const doc = new PDFDocument({ size: 'A6', margin: 50 });

    // Adding content to PDF
    doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .fillColor('#C71585')
      .text('URGENT', { align: 'center' });
    doc.moveDown();
    doc
      .fontSize(12)
      .fillColor('pink')
      .font('Helvetica-Bold')
      .fillColor('#C71585')
      .text('From: Mark Tailor', { align: 'left' })
      .font('Helvetica');
    doc.fontSize(12).fillColor('black').text('1234567890', { align: 'left' });
    doc.font('Helvetica-Bold').text('Ahmedabad', { align: 'left' });
    doc.moveDown();
    doc
      .fontSize(12)
      .fillColor('pink')
      .font('Helvetica-Bold')
      .fillColor('#C71585')
      .text('To:', { align: 'left' })
      .font('Helvetica');
    doc
      .fontSize(12)
      .fillColor('black')
      .font('Helvetica-Bold')
      .text(retailer.firmName, { align: 'left' })
      .font('Helvetica');
    doc.text(`${retailer.ownerName.first} ${retailer.ownerName.last}`, {
      align: 'left',
    });
    doc
      .font('Helvetica-Bold')
      .text(retailer.address.street, { align: 'left' })
      .font('Helvetica');
    doc
      .font('Helvetica-Bold')
      .text(retailer.address.city, { align: 'left' })
      .font('Helvetica');
    doc
      .font('Helvetica-Bold')
      .text(retailer.address.state, { align: 'left' })
      .font('Helvetica');
    doc
      .font('Helvetica-Bold')
      .text(retailer.address.zipCode, { align: 'left' })
      .font('Helvetica');
    doc
      .font('Helvetica-Bold')
      .text(retailer.mobileNo.toString(), { align: 'left' })
      .font('Helvetica');

    doc.end();

    // Collect the PDF content in a buffer
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));

    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
    });
  }

  async suspendGm(gmId: string, suspenderId: string): Promise<GM> {
    this.logger.log(
      `Suspending GM with ID: ${gmId} by suspender with ID: ${suspenderId}`,
    );

    const suspender = await this.gmModel.findById(suspenderId);
    if (!suspender) {
      throw new NotFoundException('Suspender GM not found');
    }

    if (!suspender.isPremium) {
      throw new ForbiddenException('Only premium GMs can suspend other GMs');
    }

    const gm = await this.gmModel.findById(gmId);
    if (!gm) {
      throw new NotFoundException('GM to be suspended not found');
    }

    gm.isSuspended = true;
    await gm.save();

    // Optionally send a notification email to the suspended GM
    await this.mailerService.sendMail(
      gm.email,
      'Account Suspended',
      `Your account has been suspended by ${suspender.name}.`,
    );

    return gm;
  }

  async findAll(): Promise<GM[]> {
    this.logger.log('Finding all GMs');
    return this.gmModel.find().exec();
  }

  async findOne(id: string): Promise<GM> {
    this.logger.log(`Finding GM by ID: ${id}`);
    const gm = await this.gmModel.findById(id).exec();
    if (!gm) {
      throw new NotFoundException(`GM with ID ${id} not found`);
    }
    return gm;
  }

  async update(id: string, updateGmDto: UpdateGmDto): Promise<GM> {
    this.logger.log(`Updating GM with ID: ${id}`);
    const updatedGm = await this.gmModel
      .findByIdAndUpdate(id, updateGmDto, { new: true })
      .exec();
    if (!updatedGm) {
      throw new NotFoundException(`GM with ID ${id} not found`);
    }
    return updatedGm;
  }

  async completeOrder(id: string): Promise<Order> {
    try {
      this.logger.log(`Updating order with ID: ${id} to completed`);
      const completedOrder = await this.orderModel
        .findByIdAndUpdate(id, { isCompleted: true }, { new: true })
        .exec();
      if (!completedOrder) {
        throw new NotFoundException('Order not found');
      }
      return completedOrder;
    } catch (error) {
      this.logger.error('Error updating order:', error);
      throw error;
    }
  }
  async deleteOrder(id: string): Promise<Order> {
    try {
      this.logger.log(`Deleting order with ID: ${id}`);
      const deletedOrder = await this.orderModel
        .findByIdAndUpdate(id, { deleted: true }, { new: true })
        .exec();
      if (!deletedOrder) {
        throw new NotFoundException('Order not found');
      }
      return deletedOrder;
    } catch (error) {
      this.logger.error('Error deleting order:', error);
      throw error; // Let the controller handle the error response
    }
  }
  async getOrdersByRetailerId(retailerId: string): Promise<Order[]> {
    return this.orderModel.find({ createdBy: retailerId }).exec();
  }
  async getOrdersByWorkerId(workerId: string): Promise<Order[]> {
    return this.orderModel.find({ worker: workerId }).exec();
  }

  async getOrdersByMonthAndYear(year: number, month: number): Promise<Order[]> {
    try {
      this.logger.log(`Filtering orders for year: ${year}, month: ${month}`);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      this.logger.log(`Start date: ${startDate}, End date: ${endDate}`);
      const orders = await this.orderModel
        .find({
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        })
        .exec();

      if (!orders || orders.length === 0) {
        throw new NotFoundException(
          'No orders found for the specified month and year.',
        );
      }

      return orders;
    } catch (error) {
      this.logger.error(
        `Failed to get orders by month and year: ${error.message}`,
        error.stack,
      );
      throw new ConflictException('Failed to get orders by month and year.');
    }
  }
  async getOrdersByDayMonthAndYear(
    year: number,
    month: number,
    day: number,
  ): Promise<Order[]> {
    try {
      this.logger.log(
        `Filtering orders for year: ${year}, month: ${month}, day: ${day}`,
      );
      const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);

      this.logger.log(
        `Start date: ${startDate.toISOString()}, End date: ${endDate.toISOString()}`,
      );
      const orders = await this.orderModel
        .find({
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        })
        .exec();

      this.logger.log(`Found orders: ${orders.length}`);
      if (!orders || orders.length === 0) {
        throw new NotFoundException(
          'No orders found for the specified day, month, and year.',
        );
      }

      return orders;
    } catch (error) {
      this.logger.error(
        `Failed to get orders by day, month, and year: ${error.message}`,
        error.stack,
      );
      throw new ConflictException(
        'Failed to get orders by day, month, and year.',
      );
    }
  }

  async suspendUser(id: string): Promise<User> {
    this.logger.log(`Suspending user with ID: ${id}`);
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.isSuspend = true;
    await user.save();

    // Send email notification
    await this.mailerService.sendMail(
      user.email,
      'Account Suspended',
      'Your account has been suspended.',
    );

    return user;
  }

  async deleteUser(id: string): Promise<User> {
    this.logger.log(`Deleting user with ID: ${id}`);
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.isDeleted = true;
    await user.save();

    const subject = 'Account Deletion Confirmation';
    const body = `
    Dear ${user.name},

    We regret to inform you that your account has been marked for deletion. If this was a mistake or you have any concerns, please contact our support team immediately at support@example.com.

    Best regards,
    The Brownion Team
  `;

    // Send email notification
    await this.mailerService.sendMail(user.email, subject, body);

    return user;
  }

  async verifyUser(id: string): Promise<User> {
    this.logger.log(`Verifying user with ID: ${id}`);
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.isVerified = true;
    await user.save();

    const subject = 'Your Account has been Verified';
    const body = `
      Dear ${user.name},
  
      We are pleased to inform you that your account has been successfully verified!
  
      You can now enjoy all the features and benefits of our platform.
  
      If you have any questions or need further assistance, please do not hesitate to contact our support team at support@example.com.
  
      Thank you for being a valued member of our community.
  
      Best regards,
      The Brownion Team
 
    `;

    // Send email notification
    await this.mailerService.sendMail(user.email, subject, body);

    return user;
  }

  async suspendRetailer(id: string): Promise<RetailerDocument> {
    this.logger.log(`Toggling suspension for retailer with ID: ${id}`);

    // Find the retailer by ID
    const retailer = await this.retailerModel.findById(id);
    if (!retailer) {
      throw new NotFoundException(`Retailer with ID ${id} not found`);
    }

    // Toggle the suspension status
    retailer.isSuspended = !retailer.isSuspended;

    // Save the updated retailer document
    await retailer.save();

    // Send an email notification based on the suspension status
    if (retailer.isSuspended) {
      // If the retailer is now suspended
      await this.mailerService.sendMail(
        retailer.email,
        'Retailer Account Suspended',
        'Dear Retailer,\n\nUnfortunately, your account has been suspended. If you believe this is an error, please contact our support team.\n\nBest regards,\nThe Team',
      );
    } else {
      // If the retailer is now unsuspended
      await this.mailerService.sendMail(
        retailer.email,
        'Retailer Account Unsuspended',
        'Dear Retailer,\n\nGood news! Your account has been unsuspended. You can now access our platform again.\n\nBest regards,\nThe Team',
      );
    }

    return retailer;
  }

  async deleteRetailer(id: string): Promise<RetailerDocument> {
    this.logger.log(`Deleting retailer with ID: ${id}`);
    const retailer = await this.retailerModel.findById(id);
    if (!retailer) {
      throw new NotFoundException(`Retailer with ID ${id} not found`);
    }
    retailer.isDeleted = true;
    await retailer.save();

    // Send email notification
    await this.mailerService.sendMail(
      retailer.email,
      'Retailer Account Deletion',
      'Dear Retailer,\n\nWe regret to inform you that your account has been marked for deletion. If this was a mistake or you have any concerns, please contact our support team.\n\nBest regards,\nThe Team',
    );

    return retailer;
  }

  async verifyRetailer(id: string): Promise<RetailerDocument> {
    this.logger.log(`Verifying retailer with ID: ${id}`);
    const retailer = await this.retailerModel.findById(id);
    if (!retailer) {
      throw new NotFoundException(`Retailer with ID ${id} not found`);
    }
    retailer.isVerified = true;
    await retailer.save();

    // Send email notification
    await this.mailerService.sendMail(
      retailer.email,
      'Retailer Account Verified',
      'Dear Retailer,\n\nYour account has been successfully verified! You can now enjoy all the features of our platform.\n\nBest regards,\nThe Team',
    );

    return retailer;
  }

  async suspendWorker(id: string): Promise<WorkerDocument> {
    this.logger.log(`Suspending worker with ID: ${id}`);
    const worker = await this.workerModel.findById(id);
    if (!worker) {
      throw new NotFoundException(`Worker with ID ${id} not found`);
    }
    worker.isSuspended = true;
    return worker.save();
  }
  async unsuspendWorker(id: string): Promise<WorkerDocument> {
    this.logger.log(`UnSuspending worker with ID: ${id}`);
    const worker = await this.workerModel.findById(id);
    if (!worker) {
      throw new NotFoundException(`Worker with ID ${id} not found`);
    }
    worker.isSuspended = false;
    return worker.save();
  }

  async deleteWorker(id: string): Promise<WorkerDocument> {
    this.logger.log(`Deleting worker with ID: ${id}`);
    const worker = await this.workerModel.findById(id);
    if (!worker) {
      throw new NotFoundException(`Worker with ID ${id} not found`);
    }
    worker.isDeleted = true;
    return worker.save();
  }

  async verifyWorker(id: string): Promise<WorkerDocument> {
    this.logger.log(`Verifying worker with ID: ${id}`);
    const worker = await this.workerModel.findById(id);
    if (!worker) {
      throw new NotFoundException(`Worker with ID ${id} not found`);
    }
    worker.isVerified = true;
    return worker.save();
  }

  async verifyGM(id: string): Promise<GM> {
    this.logger.log(`Verifying GM with ID: ${id}`);
    const gm = await this.gmModel.findById(id);
    if (!gm) {
      throw new NotFoundException(`GM with ID ${id} not found`);
    }
    gm.isVerified = true;
    return gm.save();
  }
  async updateOrder(
    orderId: string,
    updateOrderDto: UpdateOrderDto,
    gmId: string,
  ): Promise<Order> {
    this.logger.log(`Updating Order with ID: ${orderId}`);

    // Update the order with the GM ID and other fields
    const orderUpdate = {
      ...updateOrderDto, // Spread the properties of updateOrderDto
      gmId: gmId, // Attach the GM ID
      editedAt: new Date(), // Update the editedAt field
    };

    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(orderId, orderUpdate, { new: true })
      .exec();

    if (!updatedOrder) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return updatedOrder;
  }

  async getOrdersEditedByGM(gmId: string): Promise<Order[]> {
    // Ensure gmId is provided
    if (!gmId || gmId.trim() === '') {
      throw new NotFoundException('GM ID is required');
    }

    // Fetch and sort orders by the edited date in descending order
    const orders = await this.orderModel
      .find({ gmId })
      .sort({ editedAt: -1 }) // Sort by editedAt in descending order
      .exec();

    // Check if orders are found
    if (!orders || orders.length === 0) {
      throw new NotFoundException('No orders found for the given GM ID');
    }

    return orders;
  }

  async checkIfGMExists(gmId: string): Promise<boolean> {
    const gm = await this.gmModel.findById(gmId).exec();
    return !!gm;
  }

  async makeDesignPremium(id: string): Promise<void> {
    const designCode = await this.designCodeModel.findById(id).exec();
    if (!designCode) {
      throw new NotFoundException('Design code not found');
    }
    designCode.isPremium = true;
    await designCode.save();
  }
  async makeGMPremium(id: string): Promise<void> {
    const gm = await this.gmModel.findById(id).exec();
    if (!gm) {
      throw new NotFoundException('GM not found');
    }
    gm.isPremium != gm.isPremium;
    await gm.save();
  }
  async makeDesignSuspend(id: string): Promise<void> {
    const designCode = await this.designCodeModel.findById(id).exec();
    if (!designCode) {
      throw new NotFoundException('Design code not found');
    }
    designCode.isSuspended = true;
    await designCode.save();
  }
  async makeRetailerPremium(id: string): Promise<void> {
    const retailer = await this.retailerModel.findById(id).exec();
    if (!retailer) {
      throw new NotFoundException('Retailer not found');
    }

    // Toggle the premium status
    retailer.isPremium = !retailer.isPremium;
    await retailer.save();

    // Determine email content based on the new premium status
    if (retailer.isPremium) {
      // If the retailer is now premium
      const subject = 'Congratulations! Your Account is Now Premium';
      const body = `
        Dear ${retailer.ownerName.first},
  
        We are excited to inform you that your account has been successfully upgraded to Premium!
  
        As a Premium member, you now have access to the following exclusive features:
        - Feature 1: Browse Premium Design Codes.
        - Feature 2: You are now our first priority.
  
        We hope you enjoy the enhanced experience and make the most out of your Premium membership.
  
        If you have any questions or need assistance, please do not hesitate to contact our support team at support@example.com.
  
        Thank you for being a valued member of our community.
  
        Best regards,
        The MarkTailor Team
      `;
      await this.mailerService.sendMail(retailer.email, subject, body);
    } else {
      // If the retailer is no longer premium
      const subject = 'Your Premium Membership Has Been Revoked';
      const body = `
        Dear ${retailer.ownerName.first},
  
        We regret to inform you that your Premium membership has been revoked.
  
        You will no longer have access to Premium features, but you can still enjoy our standard services.
  
        If you believe this is a mistake or if you have any questions, please contact our support team at support@example.com.
  
        Thank you for your understanding.
  
        Best regards,
        The MarkTailor Team
      `;
      await this.mailerService.sendMail(retailer.email, subject, body);
    }
  }

  async makeUserPremium(id: string): Promise<void> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isPremium = true;
    await user.save();

    const subject = 'Congratulations! Your Account is Now Premium';
    const body = `
      Dear ${user.name},
  
      We are excited to inform you that your account has been successfully upgraded to Premium!
  
      As a Premium member, you now have access to the following exclusive features:
      - Feature 1: Now you can Browse Premium Design Codes.
      - Feature 2: Your are now our first priority
  
  
      We hope you enjoy the enhanced experience and make the most out of your Premium membership.
  
      If you have any questions or need assistance, please do not hesitate to contact our support team at support@example.com.
  
      Thank you for being a valued member of our community.
  
      Best regards,
      The MarkTailor Team
  

    `;

    // Send email notification
    await this.mailerService.sendMail(user.email, subject, body);
  }

  async deleteGm(gmId: string, deleterId: string): Promise<GM> {
    this.logger.log(
      `Deleting GM with ID: ${gmId} by deleter with ID: ${deleterId}`,
    );

    const deleter = await this.gmModel.findById(deleterId);
    if (!deleter) {
      throw new NotFoundException('Deleter GM not found');
    }

    if (!deleter.isPremium) {
      throw new ForbiddenException('Only premium GMs can delete other GMs');
    }

    const gm = await this.gmModel.findById(gmId);
    if (!gm) {
      throw new NotFoundException('GM to be deleted not found');
    }

    gm.isDeleted = true;
    await gm.save();

    // Optionally send a notification email to the deleted GM
    await this.mailerService.sendMail(
      gm.email,
      'Account Deleted',
      `Your account has been deleted by ${deleter.name}.`,
    );

    return gm;
  }
  async searchOrders(searchOrdersDto: SearchOrdersDto): Promise<Order[]> {
    const { firmName, ownerFirstName, ownerLastName, mobileNo } =
      searchOrdersDto;

    // Build the query to find retailers based on search criteria
    const retailerQuery: any = {};
    if (firmName) {
      retailerQuery['firmName'] = firmName;
    }
    if (ownerFirstName) {
      retailerQuery['ownerName.first'] = ownerFirstName;
    }
    if (ownerLastName) {
      retailerQuery['ownerName.last'] = ownerLastName;
    }
    if (mobileNo) {
      retailerQuery['mobileNo'] = mobileNo;
    }

    // Find matching retailers
    const retailers = await this.retailerModel.find(retailerQuery).exec();

    if (!retailers.length) {
      throw new NotFoundException('No retailers found matching the criteria');
    }

    // Extract retailer IDs
    const retailerIds = retailers.map((retailer) => retailer._id);

    // Find orders created by these retailers
    const orders = await this.orderModel
      .find({ createdBy: { $in: retailerIds } })
      .exec();

    if (!orders.length) {
      throw new NotFoundException('No orders found for the matching retailers');
    }

    return orders;
  }
}
