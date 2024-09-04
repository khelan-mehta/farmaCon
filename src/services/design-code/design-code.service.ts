import { Injectable, NotFoundException, BadRequestException, HttpStatus, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DesignCodeDocument, DesignCodeModelName } from '../../database/models/designcode.model';
import { DesignCode } from '../../dto/interfaces/designcode.interface';
import { CreateDesignCodeDto, UpdateDesignCodeDto } from '../../dto/design-code.dto';
import { UploadService } from '../upload.service';
import { log } from 'console';

@Injectable()
export class DesignCodeService {
  constructor(
    @InjectModel(DesignCodeModelName) private readonly designCodeModel: Model<DesignCodeDocument>,
    private readonly uploadService: UploadService, // Inject the UploadService
  ) {}

  async create(createDesignCodeDto: CreateDesignCodeDto): Promise<DesignCode> {
    const { images, ...designCodeDetails } = createDesignCodeDto;
    if (!images || images.length === 0) {
      throw new BadRequestException('No image data provided.');
    }
  
    // Upload images to S3
    const folder = 'designcodes'; // Specify the folder name in S3
    const uploadPromises = images.map(async (imgData, index) => {
      const buffer = Buffer.from(imgData, 'base64');
      const file: Express.Multer.File = {
        buffer,
        originalname: `image_${index}.jpg`, // Assign a default name if none is provided
        mimetype: 'image/jpeg', // or detect based on file content
        size: buffer.length,
        encoding: '7bit', // default encoding
      } as Express.Multer.File;
      return await this.uploadService.uploadFile(file, folder);
    });
  
    const fileUrls = await Promise.all(uploadPromises);
  
    // Create a design code with the uploaded image URLs
    const createdDesignCode = new this.designCodeModel({
      ...designCodeDetails, // This should include designCodePrice if passed in DTO
      images: fileUrls.map(file => file.url), // Save the S3 URLs to the database
    });
    
    return await createdDesignCode.save();
  }
  

  // async findByCategory(category: string, page: number, pageSize: number): Promise<{ data: any[]; total: number }> {
  //   const pageNumber = Number(page);
  //   const pageSizeNumber = Number(pageSize);
  
  //   const matchStage = { $match: { category } };
    
  //   const projectStage = {
  //     $project: {
  //       _id: 1,
  //       image: { $arrayElemAt: ['$images', 0] },
  //       designName: 1,
  //       designCodePrice: 1,
  //     },
  //   };
  
  //   const total = await this.designCodeModel.countDocuments({ category });
  
  //   const data = await this.designCodeModel.aggregate([
  //     matchStage,
  //     projectStage,
  //     { $skip: (pageNumber - 1) * pageSizeNumber },
  //     { $limit: pageSizeNumber },
  //   ]).exec();
  
  //   return { data, total };
  // }
  async findByCategory(category: string): Promise<DesignCodeDocument[]> {
    return this.designCodeModel.aggregate([
      { $match: { category } },
      {
        $lookup: {
          from: 'orders', // The name of the Order collection
          localField: 'designId', // Match the 'designId' in the DesignCode schema
          foreignField: 'designId', // With 'designId' in the Order schema
          as: 'orders',
        },
      },
      {
        $addFields: {
          totalOrder: { $size: '$orders' }, // Count the number of matching orders
        },
      },
      {
        $project: {
          designId: 1, // Include the designId in the result
          image: { $arrayElemAt: ['$images', 0] },
          designName: 1,
          designCodePrice: 1,
          totalOrder: 1,
        },
      },
    ]).exec();
  }
  
  
  
  async getCategories(page: number, pageSize: number): Promise<{ categories: string[]; total: number }> {
    // Get all distinct categories
    const allCategories = await this.designCodeModel
      .distinct('category')
      .exec();

    // Calculate total number of categories
    const total = allCategories.length;

    // Apply pagination manually
    const categories = allCategories.slice((page - 1) * pageSize, page * pageSize);

    return { categories, total };
  }
  async findOne(id: string): Promise<DesignCode> {
    const designCode = await this.designCodeModel.findById(id).exec();
    if (!designCode) {
      throw new NotFoundException(`Design code with ID ${id} not found`);
    }
    return designCode;
  }

  async update(id: string, updateDesignCodeDto: UpdateDesignCodeDto): Promise<DesignCode> {
    const { images, ...designCodeDetails } = updateDesignCodeDto;

    let updatedImages: string[] = [];
    if (images && images.length > 0) {
      // Upload new images to S3
      const folder = 'designcodes'; // Specify the folder name in S3
      const uploadPromises = images.map(async (imgData, index) => {
        const buffer = Buffer.from(imgData, 'base64');
        const file: Express.Multer.File = {
          buffer,
          originalname: `image_${index}.jpg`,
          mimetype: 'image/jpeg',
          size: buffer.length,
          encoding: '7bit',
        } as Express.Multer.File;
        return await this.uploadService.uploadFile(file, folder);
      });

      const fileUrls = await Promise.all(uploadPromises);
      updatedImages = fileUrls.map(file => file.url); // Get the S3 URLs
    }

    const updatedDesignCode = await this.designCodeModel.findByIdAndUpdate(
      id,
      { ...designCodeDetails, ...(updatedImages.length > 0 && { images: updatedImages }) },
      { new: true }
    ).exec();

    if (!updatedDesignCode) {
      throw new NotFoundException(`Design code with ID ${id} not found`);
    }

    return updatedDesignCode;
  }

  async delete(id: string): Promise<DesignCode> {
    const deletedDesignCode = await this.designCodeModel.findByIdAndDelete(id).exec();
    if (!deletedDesignCode) {
      throw new NotFoundException(`Design code with ID ${id} not found`);
    }
    return deletedDesignCode;
  }

  async findAll(): Promise<DesignCode[]> {
    console.log(this.designCodeModel.find().exec());
    
    return await this.designCodeModel.find().exec();
  }

  

  
  

  
}
