import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RetailerDocument, RetailerModelName } from '../../database/schemas/retailer.schema';
import { CreateRetailerDto } from '../../dto/create-retailer.dto';
import { DesignCodeDocument, DesignCodeModel } from '../../database/schemas/designcode.schema';
import { CreateLoginDto } from '../../dto/create-login.dto';
import {LoginResponse} from '../../dto/login-response.dto'
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RetailerService {
  constructor(
    @InjectModel(RetailerModelName) private readonly retailerModel: Model<RetailerDocument>,
    @InjectModel('DesignCode') private readonly designCodeModel: Model<DesignCodeDocument>
  ) {}

  async create(createRetailerDto: CreateRetailerDto): Promise<RetailerDocument> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createRetailerDto.password, salt);
    const createdRetailer = new this.retailerModel({ ...createRetailerDto, password: hashedPassword });
    return createdRetailer.save();
  }

  async findAll(): Promise<RetailerDocument[]> {
    return this.retailerModel.find().exec();
  }

  async findOne(id: string): Promise<RetailerDocument | null> {
    return this.retailerModel.findById(id).exec();
  }

  async login(createLoginDto: CreateLoginDto): Promise<LoginResponse> {
    const { mobileNo, password } = createLoginDto;
    const retailer = await this.retailerModel.findOne({ mobileNo });

    if (!retailer) {
      throw new NotFoundException('Retailer not found');
    }

    const isPasswordValid = await bcrypt.compare(password, retailer.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = jwt.sign({ id: retailer._id, mobileNo: retailer.mobileNo }, 'your_jwt_secret', { expiresIn: '1h' });

    return { message: "Login success", token };
  }

  async searchByFirstName(firstName: string): Promise<RetailerDocument[]> {
    return this.retailerModel.find({ 'ownerName.first': firstName }).exec();
  }

  async searchByLastName(lastName: string): Promise<RetailerDocument[]> {
    return this.retailerModel.find({ 'ownerName.last': lastName }).exec();
  }

  async searchByMobileNo(mobileNo: number): Promise<RetailerDocument[]> {
    return this.retailerModel.find({ mobileNo }).exec();
  }
  async searchRetailers(searchCriteria: any): Promise<RetailerDocument[]> {
    const query: any = {};

    if (searchCriteria.firstName) {
      query['ownerName.first'] = searchCriteria.firstName;
    }

    if (searchCriteria.lastName) {
      query['ownerName.last'] = searchCriteria.lastName;
    }

    if (searchCriteria.mobileNo) {
      query.mobileNo = searchCriteria.mobileNo;
    }

    if (searchCriteria.firmName) {
      query.firmName = searchCriteria.firmName;
    }

    if (searchCriteria.isPremium !== undefined) {
      query.isPremium = searchCriteria.isPremium;
    }

    return this.retailerModel.find(query).exec();
  }

  // New method to get design codes based on retailer's premium status
  async getDesignCodesForRetailer(retailerId: string): Promise<DesignCodeDocument[]> {
    const retailer = await this.retailerModel.findById(retailerId).exec();

    if (!retailer) {
      throw new NotFoundException('Retailer not found');
    }

    if (retailer.isPremium) {
      return this.designCodeModel.find({ isDeleted: false }).exec(); // Get all design codes
    } else {
      return this.designCodeModel.find({ isDeleted: false, isPremium: false }).exec(); // Get only non-premium design codes
    }
  }
  
}
