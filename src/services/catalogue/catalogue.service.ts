import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CatalogueDocument } from '../../dto/interfaces/catalogue.interface';
import { CreateCatalogueDto, UpdateCatalogueDto } from '../../dto/create-catalogue.dto';

@Injectable()
export class CatalogueService {
  constructor(
    @InjectModel('Catalogue') private readonly catalogueModel: Model<CatalogueDocument>
  ) {}

  async createCatalogue(createCatalogueDto: CreateCatalogueDto): Promise<CatalogueDocument> {
    const existingCatalogue = await this.catalogueModel.findOne({ designCode: createCatalogueDto.designCode });
    
    if (existingCatalogue) {
      throw new Error('Catalogue with this design code already exists.');
    }
  
    const createdCatalogue = new this.catalogueModel(createCatalogueDto);
    return await createdCatalogue.save();
  }
  

  async findAll(): Promise<CatalogueDocument[]> {
    return await this.catalogueModel.find().exec();
  }

  async findOne(designCode: string): Promise<CatalogueDocument> {
    const catalogue = await this.catalogueModel.findOne({ designCode }).exec();
    if (!catalogue) {
      throw new NotFoundException(`Catalogue with designCode ${designCode} not found`);
    }
    return catalogue;
  }

  async updateCatalogue(designCode: string, updateCatalogueDto: UpdateCatalogueDto): Promise<CatalogueDocument> {
    const updatedCatalogue = await this.catalogueModel.findOneAndUpdate(
      { designCode },
      updateCatalogueDto,
      { new: true }
    ).exec();
    if (!updatedCatalogue) {
      throw new NotFoundException(`Catalogue with designCode ${designCode} not found`);
    }
    return updatedCatalogue;
  }

  async searchByDesignName(designName: string): Promise<CatalogueDocument[]> {
    if (!designName) {
      throw new NotFoundException('Design name query parameter is required');
    }
    return await this.catalogueModel.find({ 
      designName: { $regex: designName, $options: 'i' } 
    }).exec();
  }

  // Uncomment if you need the delete functionality
  // async deleteCatalogue(designCode: string): Promise<any> {
  //   const result = await this.catalogueModel.findOneAndRemove({ designCode }).exec();
  //   if (!result) {
  //     throw new NotFoundException(`Catalogue with designCode ${designCode} not found`);
  //   }
  //   return result;
  // }
}
