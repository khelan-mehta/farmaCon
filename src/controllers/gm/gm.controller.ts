import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Res,
  HttpStatus,
  NotFoundException,
  Logger,
  InternalServerErrorException,
  Query,
  ParseIntPipe,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { GmService } from '../../services/gm/gm.service';
import { CreateGmDto, UpdateGmDto } from '../../dto/gm.dto';
import { Response } from 'express';
import { SearchOrdersDto, UpdateOrderDto } from 'src/dto/order.dto';
import { Order } from '../../dto/interfaces/order.interface'; // Adjust the import path as needed
import { JwtAuthGuard } from 'src/jwt-auth.guard';
import { AuthService } from 'src/services/auth/auth.service';
import { GM } from 'src/database/schemas/gm.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Controller('gm')
export class GmController {
  private logger = new Logger('GmController'); // Initialize logger

  constructor(
    @InjectModel(GM.name) private readonly gmModel: Model<GM>,
    private readonly gmService: GmService,
    private readonly authService: AuthService, // Inject AuthService
  ) {}

  @Post('create-gm/:creatorId')
  @UseGuards(JwtAuthGuard)
  async create(
    @Param('creatorId') creatorId: string,
    @Body() createGmDto: CreateGmDto,
  ) {
    // Fetch the GM based on creatorId
    const creator = await this.gmModel.findById(creatorId);

    if (!creator) {
      throw new UnauthorizedException('Creator GM not found');
    }

    // Optionally: validate token or add additional checks if needed
    // e.g., if the GM is suspended or deleted, throw an error
    if (creator.isSuspended || creator.isDeleted) {
      throw new UnauthorizedException('Invalid GM credentials');
    }

    // Proceed with GM creation if the creator is valid
    return this.gmService.create(createGmDto, creatorId);
  }

  @Put('suspend/:gmId/:suspenderId')
  async suspendGm(
    @Param('gmId') gmId: string,
    @Param('suspenderId') suspenderId: string,
  ) {
    return this.gmService.suspendGm(gmId, suspenderId);
  }

  @Get()
  async findAll() {
    return this.gmService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.gmService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateGmDto: UpdateGmDto) {
    return this.gmService.update(id, updateGmDto);
  }

  @Put(':id/completed')
  async completeOrder(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const completedOrder = await this.gmService.completeOrder(id);
      this.logger.log(`Order with ID ${id} successfully updated to completed`);
      res
        .status(HttpStatus.OK)
        .json({ message: 'Order updated to completed', completedOrder });
    } catch (error) {
      this.logger.error('Error updating order:', error);
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Internal server error' });
      }
    }
  }
  @Put('delete/:gmId/:deleterId')
  async deleteGm(
    @Param('gmId') gmId: string,
    @Param('deleterId') deleterId: string,
  ) {
    return this.gmService.deleteGm(gmId, deleterId);
  }

  @Put(':id/delete')
  async deleteOrder(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const deletedOrder = await this.gmService.deleteOrder(id);
      this.logger.log(`Order with ID ${id} successfully marked as deleted`);
      res
        .status(HttpStatus.OK)
        .json({ message: 'Order marked as deleted', deletedOrder });
    } catch (error) {
      this.logger.error('Error deleting order:', error);
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Internal server error' });
      }
    }
  }

  @Put(':id/suspend')
  async suspendUser(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const suspendedUser = await this.gmService.suspendUser(id);
      this.logger.log(`User with ID ${id} successfully suspended`);
      res
        .status(HttpStatus.OK)
        .json({ message: 'User suspended', suspendedUser });
    } catch (error) {
      this.logger.error('Error suspending user:', error);
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Internal server error' });
      }
    }
  }

  @Put(':id/delete-user')
  async deleteUser(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const deletedUser = await this.gmService.deleteUser(id);
      this.logger.log(`User with ID ${id} successfully marked as deleted`);
      res
        .status(HttpStatus.OK)
        .json({ message: 'User marked as deleted', deletedUser });
    } catch (error) {
      this.logger.error('Error deleting user:', error);
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Internal server error' });
      }
    }
  }

  @Put(':id/verify-user')
  async verifyUser(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const verifiedUser = await this.gmService.verifyUser(id);
      this.logger.log(`User with ID ${id} successfully marked as verified`);
      res
        .status(HttpStatus.OK)
        .json({ message: 'User marked as verified', verifiedUser });
    } catch (error) {
      this.logger.error('Error verifying user:', error);
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Internal server error' });
      }
    }
  }

  @Put(':id/suspend-retailer')
  async suspendRetailer(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const suspendedRetailer = await this.gmService.suspendRetailer(id);
      this.logger.log(`Retailer with ID ${id} successfully suspended`);
      res
        .status(HttpStatus.OK)
        .json({ message: 'Retailer suspended', suspendedRetailer });
    } catch (error) {
      this.logger.error('Error suspending retailer:', error);
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Internal server error' });
      }
    }
  }

  @Put(':id/delete-retailer')
  async deleteRetailer(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const deletedRetailer = await this.gmService.deleteRetailer(id);
      this.logger.log(`Retailer with ID ${id} successfully marked as deleted`);
      res
        .status(HttpStatus.OK)
        .json({ message: 'Retailer marked as deleted', deletedRetailer });
    } catch (error) {
      this.logger.error('Error deleting retailer:', error);
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Internal server error' });
      }
    }
  }

  @Put(':id/verify-retailer')
  async verifyRetailer(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const verifiedRetailer = await this.gmService.verifyRetailer(id);
      this.logger.log(`Retailer with ID ${id} successfully marked as verified`);
      res
        .status(HttpStatus.OK)
        .json({ message: 'Retailer marked as verified', verifiedRetailer });
    } catch (error) {
      this.logger.error('Error verifying retailer:', error);
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Internal server error' });
      }
    }
  }

  @Put(':id/suspend-worker')
  async suspendWorker(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const suspendedWorker = await this.gmService.suspendWorker(id);
      this.logger.log(`Worker with ID ${id} successfully suspended`);
      res
        .status(HttpStatus.OK)
        .json({ message: 'Worker suspended', suspendedWorker });
    } catch (error) {
      this.logger.error('Error suspending worker:', error);
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Internal server error' });
      }
    }
  }
  @Put(':id/unsuspend-worker')
  async unsuspendWorker(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const unsuspendedWorker = await this.gmService.unsuspendWorker(id);
      this.logger.log(`Worker with ID ${id} successfully unsuspended`);
      res
        .status(HttpStatus.OK)
        .json({ message: 'Worker unsuspended', unsuspendedWorker });
    } catch (error) {
      this.logger.error('Error suspending worker:', error);
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Internal server error' });
      }
    }
  }

  @Put(':id/delete-worker')
  async deleteWorker(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const deletedWorker = await this.gmService.deleteWorker(id);
      this.logger.log(`Worker with ID ${id} successfully marked as deleted`);
      res
        .status(HttpStatus.OK)
        .json({ message: 'Worker marked as deleted', deletedWorker });
    } catch (error) {
      this.logger.error('Error deleting worker:', error);
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Internal server error' });
      }
    }
  }

  @Put(':id/verify-worker')
  async verifyWorker(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const verifiedWorker = await this.gmService.verifyWorker(id);
      this.logger.log(`Worker with ID ${id} successfully marked as verified`);
      res
        .status(HttpStatus.OK)
        .json({ message: 'Worker marked as verified', verifiedWorker });
    } catch (error) {
      this.logger.error('Error verifying worker:', error);
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Internal server error' });
      }
    }
  }

  @Put(':id/verify-gm')
  async verifyGM(@Param('id') id: string, @Res() res: Response): Promise<void> {
    try {
      const verifiedGM = await this.gmService.verifyGM(id);
      this.logger.log(`GM with ID ${id} successfully marked as verified`);
      res
        .status(HttpStatus.OK)
        .json({ message: 'GM marked as verified', verifiedGM });
    } catch (error) {
      this.logger.error('Error verifying GM:', error);
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Internal server error' });
      }
    }
  }
  @Put('/update-order/:id')
  async updateOrder(
    @Param('id') id: string,
    @Body() body: { order: UpdateOrderDto; gmId: string },
    @Res() res: Response,
  ): Promise<void> {
    try {
      const { order, gmId } = body;

      // Pass the GM ID and order data to the service
      const updatedOrder = await this.gmService.updateOrder(id, order, gmId);

      this.logger.log(`Order with ID ${id} successfully updated`);
      res
        .status(HttpStatus.OK)
        .json({ message: 'Order updated successfully', updatedOrder });
    } catch (error) {
      this.logger.error('Error updating order:', error);
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Internal server error' });
      }
    }
  }

  @Put('design-code/:id/premium')
  async makeDesignPremium(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    try {
      await this.gmService.makeDesignPremium(id);
      return { message: 'Design code marked as premium successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Design code not found');
      } else {
        throw new InternalServerErrorException(
          'An error occurred while updating the design code',
        );
      }
    }
  }

  @Put('design-code/:id/suspend')
  async makeDesignSuspend(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    try {
      await this.gmService.makeDesignSuspend(id);
      return { message: 'Design code Suspended successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Design code not found');
      } else {
        throw new InternalServerErrorException(
          'An error occurred while updating the design code',
        );
      }
    }
  }

  @Put('user/:id/premium')
  async makeUserPremium(@Param('id') id: string): Promise<{ message: string }> {
    try {
      await this.gmService.makeUserPremium(id);
      return { message: 'User marked as premium successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('USer not found');
      } else {
        throw new InternalServerErrorException(
          'An error occurred while updating the design code',
        );
      }
    }
  }
  @Put(':id/premium-retailer')
  async makeRetailerPremium(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    try {
      await this.gmService.makeRetailerPremium(id);
      return { message: 'User marked as premium successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('USer not found');
      } else {
        throw new InternalServerErrorException(
          'An error occurred while updating the retailer premium',
        );
      }
    }
  }
  @Get('retailer/:id/orders')
  async getOrdersByRetailer(@Param('id') retailerId: string): Promise<Order[]> {
    return this.gmService.getOrdersByRetailerId(retailerId);
  }
  @Get('worker/:id/orders')
  async getOrdersByWorker(@Param('id') workerId: string): Promise<Order[]> {
    return this.gmService.getOrdersByWorkerId(workerId);
  }
  // Add the new method for filtering orders by date
  @Get('orders-by-date/search')
  async getOrdersByDate(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
    @Res() res: Response,
  ) {
    try {
      this.logger.log(
        `Received request for orders by date - Year: ${year}, Month: ${month}`,
      );
      const orders = await this.gmService.getOrdersByMonthAndYear(year, month);
      return res.status(HttpStatus.OK).json(orders);
    } catch (error) {
      this.logger.error(
        `Failed to get orders by date: ${error.message}`,
        error.stack,
      );
      if (error instanceof NotFoundException) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Failed to get orders by date' });
    }
  }
  @Get('by-day-month-year')
  async getOrdersByDayMonthAndYear(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('day', ParseIntPipe) day: number,
  ): Promise<Order[]> {
    console.log(
      `Received request for year: ${year}, month: ${month}, day: ${day}`,
    );
    return this.gmService.getOrdersByDayMonthAndYear(year, month, day);
  }
  @Get('shipping-slip/:orderId')
  async getShippingSlip(
    @Param('orderId') orderId: string,
    @Res() res: Response,
  ) {
    const pdfData = await this.gmService.createShippingSlip(orderId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=shipping-slip-${orderId}.pdf`,
      'Content-Length': pdfData.length,
    });
    res.end(pdfData);
  }
  @Get('/orders-edited/:gmId')
  async getOrdersByGmId(@Param('gmId') gmId: string) {
    try {
      const orders = await this.gmService.getOrdersEditedByGM(gmId);
      return { data: orders };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { message: error.message };
      } else {
        return { message: 'Internal server error' };
      }
    }
  }
  @Post('/searched/search-order-by-retailer')
  async searchOrders(@Body() searchOrdersDto: SearchOrdersDto) {
    return this.gmService.searchOrders(searchOrdersDto);
  }
  // Make a GM premium by ID
  @Put('manager/:id/premium')
  async makeGMPremium(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.gmService.makeGMPremium(id);
      this.logger.log(`GM with ID ${id} is now premium.`);
      return res.status(HttpStatus.OK).json({ message: 'GM is now premium.' });
    } catch (error) {
      this.logger.error(
        `Failed to make GM with ID ${id} premium.`,
        error.stack,
      );
      if (error instanceof NotFoundException) {
        throw new NotFoundException('GM not found');
      } else {
        throw new InternalServerErrorException('Failed to make GM premium');
      }
    }
  }
}
