import { Controller, Get, Post, Body, Param, NotFoundException, Res, HttpStatus, Query } from '@nestjs/common';
import { RetailerService } from '../../services/retailer/retailer.service';
import { CreateRetailerDto } from '../../dto/create-retailer.dto';
import { CreateLoginDto } from '../../dto/create-login.dto';
import { Response } from 'express';
import { LoggerService } from '../../services/logger.service'; // Adjust the import path based on your project structure
import { RetailerDocument } from 'src/database/schemas/retailer.schema';

@Controller('retailers')
export class RetailerController {
  constructor(
    private readonly retailerService: RetailerService,
    private readonly loggerService: LoggerService
  ) {}

  @Post()
  async create(@Body() createRetailerDto: CreateRetailerDto, @Res() res: Response) {
    this.loggerService.logRouteCall('retailers', 'POST');
    const retailer = await this.retailerService.create(createRetailerDto);
    return res.status(HttpStatus.CREATED).json({
      message: 'Retailer successfully created',
      retailer
    });
  }

  @Get()
  async findAll(@Res() res: Response) {
    this.loggerService.logRouteCall('retailers', 'GET');
    const retailers = await this.retailerService.findAll();
    return res.status(HttpStatus.OK).json(retailers);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    this.loggerService.logRouteCall(`retailers/${id}`, 'GET');
    const retailer = await this.retailerService.findOne(id);
    if (!retailer) {
      this.loggerService.warn(`Retailer not found with id: ${id}`);
      throw new NotFoundException('Retailer not found');
    }
    return res.status(HttpStatus.OK).json(retailer);
  }

  @Post('login')
  async login(@Body() createLoginDto: CreateLoginDto, @Res() res: Response) {
    this.loggerService.logRouteCall('retailers/login', 'POST');
    const result = await this.retailerService.login(createLoginDto);
    return res.status(HttpStatus.OK).json({ result });
  }

  @Get('search/firstName')
  async searchByFirstName(@Query('firstName') firstName: string, @Res() res: Response) {
    this.loggerService.logRouteCall('retailers/search/firstName', 'GET');
    const retailers = await this.retailerService.searchByFirstName(firstName);
    return res.status(HttpStatus.OK).json(retailers);
  }

  @Get('search/lastName')
  async searchByLastName(@Query('lastName') lastName: string, @Res() res: Response) {
    this.loggerService.logRouteCall('retailers/search/lastName', 'GET');
    const retailers = await this.retailerService.searchByLastName(lastName);
    return res.status(HttpStatus.OK).json(retailers);
  }

  @Get('search/mobileNo')
  async searchByMobileNo(@Query('mobileNo') mobileNo: number, @Res() res: Response) {
    this.loggerService.logRouteCall('retailers/search/mobileNo', 'GET');
    const retailers = await this.retailerService.searchByMobileNo(mobileNo);
    return res.status(HttpStatus.OK).json(retailers);
  }

  @Get(':id/design-codes')
  async getDesignCodes(@Param('id') id: string) {
    return this.retailerService.getDesignCodesForRetailer(id);
  }
  @Post('search')
  async searchRetailers(@Body() searchCriteria: any): Promise<RetailerDocument[]> {
    return this.retailerService.searchRetailers(searchCriteria);
  }
}
