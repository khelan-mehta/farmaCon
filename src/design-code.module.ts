import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DesignCodeController } from './controllers/design-code/design-code.controller';
import { DesignCodeService } from './services/design-code/design-code.service';
import { DesignCodeSchema } from './database/models/designcode.model';
import { UploadService } from './services/upload.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'DesignCode', schema: DesignCodeSchema }])
    // Import other modules if needed
  ],
  controllers: [DesignCodeController],
  providers: [DesignCodeService,UploadService],
  exports: [DesignCodeService] // Export DesignCodeService to be used in other modules if needed
})
export class DesignCodeModule {}
