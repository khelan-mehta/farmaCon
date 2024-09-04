import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RetailerController } from './/controllers/retailer/retailer.controller';
import { RetailerService } from './/services/retailer/retailer.service';
import {RetailerSchema } from './/database/schemas/retailer.schema';
import { LoggerService } from './/services/logger.service'; // Adjust the import path based on your project structure
import { DesignCodeModel, DesignCodeSchema } from './database/models/designcode.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name:'Retailer' , schema: RetailerSchema },{ name: 'DesignCode', schema: DesignCodeSchema }]),
  ],
  controllers: [RetailerController],
  providers: [RetailerService, LoggerService],
  exports: [RetailerService]
})
export class RetailerModule {}
