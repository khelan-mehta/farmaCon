import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorkerDocument } from '../../database/schemas/worker.schema';
import { CreateWorkerDto } from '../../dto/create-worker.dto';
import { CreateLoginDto } from '../../dto/create-login.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { SearchWorkersDto } from 'src/dto/worker.dto';

interface LoginResponse {
    message: string;
    token: string;
  }
@Injectable()
export class WorkerService {
  constructor(
    @InjectModel('Worker') private readonly workerModel: Model<WorkerDocument>
  ) {}

  async create(createWorkerDto: CreateWorkerDto): Promise<WorkerDocument> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createWorkerDto.password, salt);
    const createdWorker = new this.workerModel({ ...createWorkerDto, password: hashedPassword });
    return createdWorker.save();
  }

  async findAll(): Promise<WorkerDocument[]> {
    return this.workerModel.find().exec();
  }

  async findOne(id: string): Promise<WorkerDocument | null> {
    return this.workerModel.findById(id).exec();
  }

  async findByFirstName(first: string): Promise<WorkerDocument[]> {
    return this.workerModel.find({ 'workerName.first': first }).exec();
  }

  async findByLastName(last: string): Promise<WorkerDocument[]> {
    return this.workerModel.find({ 'workerName.last': last }).exec();
  }

  async findByMobileNo(mobileNo: number): Promise<WorkerDocument | null> {
    return this.workerModel.findOne({ mobileNo }).exec();
  }
  async searchWorkers(searchCriteria: any): Promise<WorkerDocument[]> {
    const query: any = {};

    if (searchCriteria.firstName) {
      query['workerName.first'] = searchCriteria.firstName;
    }

    if (searchCriteria.lastName) {
      query['workerName.last'] = searchCriteria.lastName;
    }

    if (searchCriteria.mobileNo) {
      query.mobileNo = searchCriteria.mobileNo;
    }

    if (searchCriteria.isVerified !== undefined) {
      query.isVerified = searchCriteria.isVerified;
    }

    return this.workerModel.find(query).exec();
  }

  async login(createLoginDto: CreateLoginDto): Promise<LoginResponse> {
    const { mobileNo, password } = createLoginDto;
    const worker = await this.workerModel.findOne({ mobileNo });

    if (!worker) {
      throw new NotFoundException('Worker not found');
    }

    const isPasswordValid = await bcrypt.compare(password, worker.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = jwt.sign({ id: worker._id, mobileNo: worker.mobileNo }, 'your_jwt_secret', { expiresIn: '1h' });

    return { message: "Login success", token };
  }
  async searchWorkersByOrder(searchWorkersDto: SearchWorkersDto): Promise<WorkerDocument[]> {
    const { firstName, lastName, mobileNo } = searchWorkersDto;

    // Build the query to find workers based on search criteria
    const workerQuery: any = {};
    if (firstName) {
      workerQuery['workerName.first'] = firstName;
    }
    if (lastName) {
      workerQuery['workerName.last'] = lastName;
    }
    if (mobileNo) {
      workerQuery['mobileNo'] = mobileNo;
    }

    // Find matching workers
    const workers = await this.workerModel.find(workerQuery).exec();

    if (!workers.length) {
      throw new NotFoundException('No workers found matching the criteria');
    }

    return workers;
  }
}
