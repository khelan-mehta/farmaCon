// src/controllers/orders/order.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, Res, Query, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from '../../dto/interfaces/order.interface'; // Import the Order interface
import { Response } from 'express';
import { AppService } from '../../services/app.service'; // Adjust kit the path as per your actual file structure
import { CreateInvoiceDto, CreateOrderDto } from 'src/dto/order.dto';
import { LoggerService } from '../../services/logger.service'; // Import LoggerService
import PDFDocument from 'pdfkit-table';
import { UploadService } from '../../services/upload.service';
import { CreateSlipDto } from '../../dto/order.dto';
import { PaginationService } from '../../services/pagination.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DesignCode } from '../../dto/interfaces/designcode.interface';
import { RetailerService } from '../../services/retailer/retailer.service';
// import { FilesInterceptor } from '@nestjs/platform-express';
import { Buffer } from 'buffer';
import { Retailer } from 'src/dto/interfaces/retailer.interface';
@Controller('order')
export class OrderController {
  gmService: any;
    constructor(
        @InjectModel('Order') private readonly orderModel: Model<any>,
        @InjectModel('Product') private readonly productModel: Model<any>,
        private readonly uploadService: UploadService,
        private readonly logger: LoggerService,
        private readonly retailerService: RetailerService,
        private readonly paginationService: PaginationService,
        @InjectModel('Retailer') private readonly retailerModel: Model<Retailer>,
        @InjectModel('DesignCode') private readonly designCodeModel: Model<DesignCode>, 
    ) {}

//     @Post()
// async createOrder(@Body() body: any, @Res() res: Response): Promise<Response> {
//   try {
//     console.log('createOrder call');
    
//     const { imgUrl, audioFileUrl, ...orderDetails } = body;
//     console.log('imgUrl:', imgUrl);
//     console.log('audioFileUrl:', audioFileUrl);

//     // Use static URLs for images and audio files
//     const staticImageUrls = ['https://example.com/static/image1.jpg', 'https://example.com/static/image2.jpg'];
//     const staticAudioUrl = 'https://example.com/static/audio.mp3';
    
//     // Update the order details with the static URLs
//     const order = new this.orderModel({
//       ...orderDetails,
//       imgUrl: staticImageUrls,
//       audioFileUrl: staticAudioUrl,
//     });

//     // Save the order to the database
//     const result = await order.save();
//     return res.status(201).json(result);
//   } catch (error) {
//     console.error('Error creating order:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// }

private extractBase64Data(base64String: string): { mimeType: string, base64Data: string } {
  const matches = base64String.match(/^data:(\w+\/\w+);base64,(.+)$/);
  if (matches) {
    return {
      mimeType: matches[1], // The MIME type (e.g., image/jpeg, audio/mp3)
      base64Data: matches[2], // The actual base64-encoded data
    };
  } else {
    throw new BadRequestException('Invalid base64 string');
  }
}



@Get('recent')
async getRecentOrders(@Res() res: Response) {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const recentOrders = await this.orderModel
      .find({
        createdAt: { $gte: tenMinutesAgo },
        gmId: { $exists: false }, // Exclude orders with gmId
        editedAt: { $exists: false }, // Exclude orders with editedAt
      })
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order to get recent orders first
      .exec();

    if (!recentOrders || recentOrders.length === 0) {
      throw new NotFoundException('No orders found in the last 10 minutes.');
    }

    return res.status(200).json(recentOrders);
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred.', error });
  }
}



@Get('aggregate-worker-rate')
  async aggregateWorkerRate(
    @Query('workerId') workerId: string,
    @Res() res: Response
  ): Promise<void> {
    try {
      this.logger.log(`Aggregating worker rate for workerId: ${workerId}`);

      // Verify workerId format
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(workerId);
      if (!isValidObjectId) {
        this.logger.error(`Invalid workerId format: ${workerId}`);
        res.status(400).json({ message: 'Invalid workerId format.' });
        return;
      }

      // Log orders matching the query before aggregation
      const orders = await this.orderModel.find({ worker: workerId, isCompleted: false }).exec();
      this.logger.log('Matching Orders:', JSON.stringify(orders, null, 2));

      if (orders.length === 0) {
        this.logger.log('No incomplete orders found for the specified worker.');
        res.status(404).json({ message: 'No incomplete orders found for the specified worker.' });
        return;
      }

      // Calculate total worker rate
      const totalRate = orders.reduce((sum, order) => sum + order.workerRate, 0);
      const averageRate = totalRate / orders.length;

      const result = {
        worker: workerId,
        totalRate,
        averageRate
      };

      this.logger.log('Aggregation result:', result);
      res.status(200).json(result);
    } catch (error) {
      this.logger.error(`Failed to aggregate worker rate: ${error.message}`, error.stack);
      res.status(500).json({ message: 'Failed to aggregate worker rate.' });
    }
  }
  @Get('aggregate-retailer-worker-rate')
  async aggregateRetailerWorkerRate(
    @Query('retailerId') retailerId: string,
    @Res() res: Response
  ): Promise<void> {
    try {
      this.logger.log(`Aggregating retailer rate for retailerId: ${retailerId}`);
  
      // Verify retailerId format
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(retailerId);
      if (!isValidObjectId) {
        this.logger.error(`Invalid retailerId format: ${retailerId}`);
        res.status(400).json({ message: 'Invalid retailerId format.' });
        return;
      }
  
      // Fetch the retailer to get outstandingBalance
      const retailer = await this.retailerModel.findById(retailerId).exec();
      if (!retailer) {
        this.logger.error(`Retailer not found for retailerId: ${retailerId}`);
        res.status(404).json({ message: 'Retailer not found.' });
        return;
      }
  
      // Find all incomplete orders for the retailer
      const orders = await this.orderModel.find({ createdBy: retailerId, isCompleted: false }).exec();
      this.logger.log('Matching Orders:', JSON.stringify(orders, null, 2));
  
      if (orders.length === 0) {
        this.logger.log('No incomplete orders found for the specified retailer.');
        res.status(404).json({ message: 'No incomplete orders found for the specified retailer.' });
        return;
      }
  
      // Calculate total worker rate
      const totalRate = orders.reduce((sum, order) => sum + order.workerRate, 0);
      const averageRate = totalRate / orders.length;
  
      // Count total orders associated with the retailer
      const totalOrders = await this.orderModel.countDocuments({ createdBy: retailerId }).exec();
  
      const result = {
        retailer: retailerId,
        totalRate,
        averageRate,
        totalOrders,  // Include total orders in the response
        outstandingBalance: retailer.outstandingBalance,  // Include outstandingBalance
      };
  
      this.logger.log('Aggregation result:', result);
      res.status(200).json(result);
    } catch (error) {
      this.logger.error(`Failed to aggregate worker rate for retailer: ${error.message}`, error.stack);
      res.status(500).json({ message: 'Failed to aggregate worker rate for retailer.' });
    }
  }
  

@Get()
async getOrders(
  @Res() res: Response,
  @Query() query: { page?: number; pageSize?: number },
): Promise<Response> {
  try {
    const { page = 1, pageSize = 20 } = query; // Provide default values for page and pageSize
    console.log(`Fetching non-deleted orders, page: ${page}, pageSize: ${pageSize}`);

    const { data, total } = await this.paginationService.paginate(
      this.orderModel,
      { deleted: false },
      { page, pageSize },
    );

    // Construct response object with pagination metadata
    const response = {
      total,
      page,
      pageSize,
      data,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching orders:', error); // Use console.error for errors
    return res.status(500).json({ message: 'Internal server error' });
  }
}


  @Get('/all')
  async getAllOrders(@Res() res: Response): Promise<Response> {
      try {
          this.logger.log('Fetching all orders');
          const orders = await this.productModel.find();
          return res.status(200).json(orders);
      } catch (error) {
          this.logger.error('Error fetching all orders:', error);
          return res.status(500).json({ message: 'Internal server error' });
      }
  }
  

    @Get('/:id')
    async getOrderById(@Param('id') id: string, @Res() res: Response): Promise<Response> {
        try {
            this.logger.log(`Fetching order with ID: ${id}`);
            const order = await this.orderModel.findById(id);
            if (!order) {
                throw new NotFoundException('Order not found');
            }
            return res.status(200).json(order);
        } catch (error) {
            this.logger.error('Error fetching order:', error);
            if (error instanceof NotFoundException) {
                return res.status(404).json({ message: error.message });
            } else {
                return res.status(500).json({ message: 'Internal server error' });
            }
        }
    }

    @Get('/getWorker/:id')
    async getOrderByWorkerId(
      @Param('id') worker: string,
      @Res() res: Response,
      @Query('page') queryPage: number = 1,
      @Query('pageSize') queryPageSize: number = 10,
      @Body() bodyParams: { page?: number; pageSize?: number },
    ): Promise<Response> {
      try {
        // Extract page and pageSize from query parameters
        const page = bodyParams?.page || queryPage;
      const pageSize = bodyParams?.pageSize || queryPageSize;
  
        console.log(`Fetching orders for worker ID: ${worker}, page: ${page}, pageSize: ${pageSize}`);
  
        const { data, total } = await this.paginationService.paginate(
          this.orderModel,
          { worker }, // Query to filter by worker ID
          { page, pageSize },
        );
  
        // If no orders found for the worker, throw NotFoundException
        if (!data || data.length === 0) {
          throw new NotFoundException('No orders found for this worker');
        }
  
        // Construct response object with pagination metadata
        const response = {
          total,
          page,
          pageSize,
          data,
        };
  
        return res.status(200).json(response);
      } catch (error) {
        console.error('Error fetching orders by worker ID:', error);
        if (error instanceof NotFoundException) {
          return res.status(404).json({ message: error.message });
        } else {
          return res.status(500).json({ message: 'Internal server error' });
        }
      }
    }

    @Put('/update-order/:id')
async updateOrder(@Param('id') id: string, @Body() body: Order, @Res() res: Response): Promise<Response> {
    try {
        this.logger.log(`Updating order with ID: ${id}`);
        body.editedAt = new Date(); // Set the editedAt field to the current date and time
        const updatedOrder = await this.orderModel.findByIdAndUpdate(id, body, { new: true });
        if (!updatedOrder) {
            throw new NotFoundException('Order not found');
        }
        return res.status(200).json(updatedOrder);
    } catch (error) {
        this.logger.error('Error updating order:', error);
        if (error instanceof NotFoundException) {
            return res.status(404).json({ message: error.message });
        } else {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}



    @Put('/retailer/:id')
    async updateOrderForRetailer(@Param('id') id: string, @Body() body: Order, @Res() res: Response): Promise<Response> {
        try {
            this.logger.log(`Updating order for retailer with ID: ${id}`);
            const role = 'retailer'; // Replace with actual logic to get user role

            const order = await this.orderModel.findById(id);
            if (!order) {
                throw new NotFoundException('Order not found');
            }

            if (role === 'retailer') {
                const currentTime = new Date();
                const thirtyMinutesAgo = new Date(currentTime.getTime() - 30 * 60 * 1000);

                if (order.createdAt < thirtyMinutesAgo) {
                    throw new Error('Order can only be updated within 30 minutes of creation');
                }
            }

            const allowedFields = ['orderName', 'desc', 'imgUrl', 'audioFileUrl', 'worker', 'workerRate', 'designCode', 'trackingCode', 'measurements'];
            allowedFields.forEach(field => {
                if (body[field] !== undefined) {
                    order[field] = body[field];
                }
            });

            const updatedOrder = await order.save();
            if (!updatedOrder) {
                throw new NotFoundException('Order not found');
            }

            return res.status(200).json(updatedOrder);
        } catch (error) {
            this.logger.error('Error updating order for retailer:', error);
            if (error instanceof NotFoundException || error.message.includes('Order can only be updated within 30 minutes')) {
                return res.status(404).json({ message: error.message });
            } else {
                return res.status(500).json({ message: 'Internal server error' });
            }
        }
    }

    @Delete('/:id')
    async deleteOrder(@Param('id') id: string, @Res() res: Response): Promise<Response> {
        try {
            this.logger.log(`Deleting order with ID: ${id}`);
            const deletedOrder = await this.orderModel.findByIdAndUpdate(id, { deleted: true }, { new: true });
            if (!deletedOrder) {
                throw new NotFoundException('Order not found');
            }
            return res.status(200).json(deletedOrder);
        } catch (error) {
            this.logger.error('Error deleting order:', error);
            if (error instanceof NotFoundException) {
                return res.status(404).json({ message: error.message });
            } else {
                return res.status(500).json({ message: 'Internal server error' });
            }
        }
    }

    @Post('/Challan')
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto, @Res() res: Response) {
    try {
      this.logger.log(`Creating invoice for orders: ${JSON.stringify(createInvoiceDto.orderIds)}`);
      const { orderIds } = createInvoiceDto;

      const orders = await this.orderModel.find({ _id: { $in: orderIds } });
      if (orders.length === 0) {
        throw new NotFoundException('No orders found for the provided IDs');
      }

      // Count occurrences of each order ID
      const orderCountMap = new Map<string, number>();
      orderIds.forEach(orderId => {
        const count = orderCountMap.get(orderId) || 0;
        orderCountMap.set(orderId, count + 1);
      });

      // Map order details and quantity
      const orderMap = new Map<string, any>();
      for (const order of orders) {
        const orderId = order._id.toString();
        const quantity = orderCountMap.get(orderId) || 1;

        if (orderMap.has(orderId)) {
          orderMap.get(orderId).quantity += quantity;
        } else {
          orderMap.set(orderId, {
            orderName: order.orderName,
            price: order.price || 0, // Use price or default to 0 if not found
            designCode: order.designCode,
            trackingCode: order.trackingCode,
            createdAt: order.createdAt,
            desc: order.desc,
            quantity
          });
        }
      }

      const invoiceDetails = Array.from(orderMap.values());

      const totalPrice = invoiceDetails.reduce((sum, order) => sum + (order.price * order.quantity), 0);

      const invoice = {
        orders: invoiceDetails,
        totalPrice,
        createdAt: new Date(),
      };

      // Generate PDF
      const doc = new PDFDocument({ size: 'A4', margin: 50 }); // Use A4 size and set margin

      // Setting the response type to PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');

      // Pipe PDF to response
      doc.pipe(res);

      // Define dark pink color
      const darkPink = '#C71585'; // Dark pink color code

      // Add header content to PDF
      doc.fontSize(26).fillColor(darkPink).text('Mark Tailor', { align: 'center', underline: true });
      doc.moveDown(0.5);

      doc.fontSize(20).fillColor(darkPink).text('Challan', { align: 'center' });
      doc.moveDown(0.5);

      // Add date, GSTIN, and Challan No. to the header
      const currentDate = new Date().toISOString().slice(0, 10);
      const gstin = '.................................................................'; // Dotted line for empty GSTIN
      const challanNo = '..........................................................'; // Dotted line for empty Challan No.
      const paymentType = "CASH / CREDIT MEMO / ORDER FROM ESTIMATE";
      doc.fontSize(12).fillColor(darkPink).text(`Date: ${currentDate}`, { align: 'left' });
      doc.text(`GSTIN: ${gstin}`, { align: 'left' });
      doc.text(`Challan No.: ${challanNo}`, { align: 'left' });
      doc.text(`Payment type: ${paymentType}`, { align: 'left' });
      doc.moveDown();

      // Add client name field with dotted line
      doc.fontSize(12).fillColor(darkPink).text('Mr/Ms Name: ........................................................', { align: 'left' });
      doc.moveDown(1.5);

      // Define table headers
      const tableHeaders = ['No.', 'Particulars (Order Name)', 'Quantity', 'Rate', 'Amount'];

      // Define table rows
      const tableRows = invoice.orders.map((order, index) => [
        `${index + 1}`,
        order.orderName,
        order.quantity.toString(),
        order.price.toString(), // Display price instead of workerRate
        (order.price * order.quantity).toString(), // Amount is price multiplied by quantity
      ]);

      // Add table for the order details
      const table = {
        headers: tableHeaders,
        rows: tableRows,
        options: {
          headerColor: '#FFD1DC', // Light pink background
          headerFontSize: 12,
          headerFont: 'Helvetica-Bold',
          headerFontColor: darkPink,
          cellFontSize: 10,
          cellFontColor: darkPink,
        }
      };

      doc.table(table, {
        prepareHeader: () => doc.font('Helvetica-Bold').fontSize(12).fillColor(darkPink),
        prepareRow: (row, i) => doc.font('Helvetica').fontSize(10).fillColor(darkPink),
        padding: [10, 10, 10, 10], // Specify padding as an array of numbers
        width: 500,
        x: 50,
      });

      doc.moveDown(); // Add some spacing

      // Add total price and created at
      doc.fontSize(16).fillColor(darkPink).text(`Total Price: ${invoice.totalPrice}`, { align: 'right' });
      doc.moveDown();
      doc.fontSize(12).fillColor(darkPink).text(`Created At: ${invoice.createdAt.toISOString().slice(0, 10)}`, { align: 'right' });
      doc.moveDown();

      // End the PDF document
      doc.end();
    } catch (error) {
      this.logger.error('Error creating invoice:', error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error('Internal server error');
      }
    }
  }
  @Post('/slip')
async createOrderSlip(@Body() createSlipDto: any, @Res() res: Response) {
  try {
    const { orderId } = createSlipDto;

    // Fetch order from MongoDB
    const order = await this.orderModel.findById(orderId);

    // Check if order exists
    if (!order) {
      throw new NotFoundException('No order found for the provided ID');
    }

    // Generate a random order number (e.g., alphanumeric)
    const orderNumber = Math.random().toString(36).substr(2, 8); // Example: Generates a random 8-character alphanumeric string
    console.log('Generated Order Number:', orderNumber);

    // Generate a unique slip ID
    const slipId = Math.floor(Math.random() * 1000000);
    const currentDate = new Date().toISOString().slice(0, 10);
    const customerName = '...........................................................'; // Dotted line for customer name
    const contactNo = '...........................................................'; // Dotted line for contact number

    // Create a new PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${orderNumber}-order-slip.pdf`);

    // Pipe the PDF document to the response stream
    doc.pipe(res);

    // Define colors and styling for the PDF content
    const darkPink = '#C71585'; // Dark pink color code
    const headerFontSize = 12;

    // Add header content to PDF
    doc.fontSize(26).fillColor(darkPink).text('Mark Tailor', { align: 'center', underline: true });
    doc.moveDown(0.5);

    doc.fontSize(20).fillColor(darkPink).text('Order Slip', { align: 'center' });
    doc.moveDown(0.5);

    // Add slip ID and date to the header
    doc.fontSize(headerFontSize).fillColor(darkPink).text(`Slip ID: ${slipId}`, { align: 'right' });
    doc.fontSize(headerFontSize).fillColor(darkPink).text(`Date: ${currentDate}`, { align: 'left' });
    doc.moveDown();

    // Add customer name and contact number with dotted lines
    doc.fontSize(headerFontSize).fillColor(darkPink).text(`Customer Name: ${customerName}`, { align: 'left' });
    doc.fontSize(headerFontSize).fillColor(darkPink).text(`Contact No: ${contactNo}`, { align: 'left' });
    doc.moveDown();

    // Add order details
    doc.fontSize(14).fillColor(darkPink).text(`Order Number: ${orderNumber}`, { align: 'left' });
    doc.fontSize(headerFontSize).fillColor(darkPink).text(`Description: ${order.desc}`, { align: 'left' });
    doc.moveDown();

    // Add measurements as a table
    const upperBodyMeasurements = order.measurements.upperBody || new Map();
    const lowerBodyMeasurements = order.measurements.lowerBody || new Map();

    // Table headers
    const tableHeaders = ['Measurement', 'Value'];
    // Set initial x and y positions for the table
    let tableX = 50;
    let tableY = doc.y + 10;

    // Draw table headers
    doc.font('Helvetica-Bold').fontSize(headerFontSize).fillColor(darkPink);
    tableHeaders.forEach((header, i) => {
      doc.text(header, tableX + i * 200, tableY, { align: 'left', width: 150 });
    });

    tableY += headerFontSize + 5;

    // Draw upper body measurements
    doc.font('Helvetica-Bold').fontSize(headerFontSize).fillColor(darkPink).text('Upper Body', tableX, tableY, { align: 'left', width: 150 });
    tableY += headerFontSize + 5;
    doc.font('Helvetica').fontSize(headerFontSize).fillColor(darkPink);
    upperBodyMeasurements.forEach((value, key) => {
      doc.text(key, tableX, tableY, { align: 'left', width: 150 });
      doc.text(value !== undefined ? `${value}` : 'NA', tableX + 200, tableY, { align: 'left', width: 150 });
      tableY += headerFontSize + 5;
    });

    tableY += headerFontSize + 10;

    // Draw lower body measurements
    doc.font('Helvetica-Bold').fontSize(headerFontSize).fillColor(darkPink).text('Lower Body', tableX, tableY, { align: 'left', width: 150 });
    tableY += headerFontSize + 5;
    doc.font('Helvetica').fontSize(headerFontSize).fillColor(darkPink);
    lowerBodyMeasurements.forEach((value, key) => {
      doc.text(key, tableX, tableY, { align: 'left', width: 150 });
      doc.text(value !== undefined ? `${value}` : 'NA', tableX + 200, tableY, { align: 'left', width: 150 });
      tableY += headerFontSize + 5;
    });

    doc.moveDown();

    // Add rate and amount
    doc.fontSize(15).fillColor(darkPink).text(`Amount: ${order.price}`, { align: 'left' });
    doc.moveDown();

    // Finalize the PDF document
    doc.end();

  } catch (error) {
    // Log the error and throw appropriate exceptions
    console.error('Error creating order slip:', error);
    if (error instanceof NotFoundException) {
      throw new NotFoundException(error.message);
    } else {
      throw new Error('Internal server error');
    }
  }
}


}
