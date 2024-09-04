import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkerSchema } from './database/schemas/worker.schema';
import { WorkerController } from './controllers/worker/worker.controller';
import { WorkerService } from './services/worker/worker.service';
import { LoggerService } from './services/logger.service';
import { WorkerModelName } from './database/models/worker.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WorkerModelName, schema: WorkerSchema }]),
  ],
  controllers: [WorkerController],
  providers: [WorkerService, LoggerService],
  exports: [WorkerService] // Ensure WorkerService is exported if needed in other modules
})
export class WorkerModule {}
