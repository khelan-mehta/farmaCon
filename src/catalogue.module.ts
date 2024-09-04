import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogueService } from './/services/catalogue/catalogue.service';
import { CatalogueController } from './/controllers/Catalogue/catalogue.controller';
import { CatalogueSchema } from './/database/schemas/catalogue.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Catalogue', schema: CatalogueSchema }])
  ],
  providers: [CatalogueService],
  controllers: [CatalogueController]
})
export class CatalogueModule {}
