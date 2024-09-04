import { Controller, Get, Post, Body, Param, Put, Query, NotFoundException } from '@nestjs/common';
import { CatalogueService } from '../../services/catalogue/catalogue.service';
import { CreateCatalogueDto, UpdateCatalogueDto } from '../../dto/create-catalogue.dto';

@Controller('catalogue')
export class CatalogueController {
  constructor(private readonly catalogueService: CatalogueService) {}

  @Post()
  async create(@Body() createCatalogueDto: CreateCatalogueDto) {
    return await this.catalogueService.createCatalogue(createCatalogueDto);
  }

  @Get('search')
  async searchByDesignName(@Query('designName') designName: string) {
    const results = await this.catalogueService.searchByDesignName(designName);
    if (results.length === 0) {
      throw new NotFoundException(`No catalogues found with designName ${designName}`);
    }
    return results;
  }

  @Get()
  async findAll() {
    return await this.catalogueService.findAll();
  }

  @Get(':designCode')
  async findOne(@Param('designCode') designCode: string) {
    return await this.catalogueService.findOne(designCode);
  }

  @Put(':designCode')
  async update(@Param('designCode') designCode: string, @Body() updateCatalogueDto: UpdateCatalogueDto) {
    return await this.catalogueService.updateCatalogue(designCode, updateCatalogueDto);
  }

  // Uncomment if you need the delete functionality
  // @Delete(':designCode')
  // async remove(@Param('designCode') designCode: string) {
  //   return await this.catalogueService.deleteCatalogue(designCode);
  // }
}
