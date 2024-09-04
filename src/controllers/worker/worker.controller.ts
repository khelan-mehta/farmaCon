import { Controller, Get, Post, Body, Param, Query, NotFoundException, Res, HttpStatus } from '@nestjs/common';
import { WorkerService } from '../../services/worker/worker.service';
import { CreateWorkerDto } from '../../dto/create-worker.dto';
import { Response } from 'express';
import { LoggerService } from '../../services/logger.service'; // Adjust path as needed
import { CreateLoginDto } from 'src/dto/create-login.dto';
import { WorkerDocument } from 'src/database/schemas/worker.schema';
import { SearchWorkersDto } from 'src/dto/worker.dto';

@Controller('workers')
export class WorkerController {
  constructor(
    private readonly workerService: WorkerService,
    private readonly loggerService: LoggerService
  ) {}

  @Post()
  async create(@Body() createWorkerDto: CreateWorkerDto, @Res() res: Response) {
    this.loggerService.logRouteCall('workers', 'POST');
    const worker = await this.workerService.create(createWorkerDto);
    return res.status(HttpStatus.CREATED).json({
      message: 'Worker successfully created',
      worker
    });
  }

  @Get()
  async findAll(@Res() res: Response) {
    this.loggerService.logRouteCall('workers', 'GET');
    const workers = await this.workerService.findAll();
    return res.status(HttpStatus.OK).json(workers);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    this.loggerService.logRouteCall(`workers/${id}`, 'GET');
    const worker = await this.workerService.findOne(id);
    if (!worker) {
      this.loggerService.warn(`Worker not found with id: ${id}`);
      throw new NotFoundException('Worker not found');
    }
    return res.status(HttpStatus.OK).json(worker);
  }

  @Get('search/by-firstname')
  async searchByFirstName(@Query('first') first: string, @Res() res: Response) {
    this.loggerService.logRouteCall(`workers/search/by-firstname?first=${first}`, 'GET');
    const workers = await this.workerService.findByFirstName(first);
    return res.status(HttpStatus.OK).json(workers);
  }

  @Get('search/by-lastname')
  async searchByLastName(@Query('last') last: string, @Res() res: Response) {
    this.loggerService.logRouteCall(`workers/search/by-lastname?last=${last}`, 'GET');
    const workers = await this.workerService.findByLastName(last);
    return res.status(HttpStatus.OK).json(workers);
  }

  @Get('search/by-mobile')
  async searchByMobileNo(@Query('mobileNo') mobileNo: number, @Res() res: Response) {
    this.loggerService.logRouteCall(`workers/search/by-mobile?mobileNo=${mobileNo}`, 'GET');
    const worker = await this.workerService.findByMobileNo(mobileNo);
    if (!worker) {
      this.loggerService.warn(`Worker not found with mobileNo: ${mobileNo}`);
      throw new NotFoundException('Worker not found');
    }
    return res.status(HttpStatus.OK).json(worker);
  }

  @Post('login')
  async login(@Body() createLoginDto: CreateLoginDto, @Res() res: Response) {
    this.loggerService.logRouteCall('workers/login', 'POST');
    const result = await this.workerService.login(createLoginDto);
    return res.status(HttpStatus.OK).json({ result });
  }
  @Post('search')
  async searchWorkers(@Body() searchCriteria: any): Promise<WorkerDocument[]> {
    return this.workerService.searchWorkers(searchCriteria);
  }
  @Post('/searched/search-order-by-worker')
  async searchWorkersByOrder(@Body() searchWorkersDto: SearchWorkersDto) {
    return this.workerService.searchWorkers(searchWorkersDto);
  }
}
