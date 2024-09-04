import { Controller, Get, Post, Put, Delete, Param, Body, HttpException, HttpStatus, Res, Query } from '@nestjs/common';
import { DesignCodeService } from '../../services/design-code/design-code.service';
import { DesignCode } from '../../dto/interfaces/designcode.interface';
import { CreateDesignCodeDto, UpdateDesignCodeDto } from '../../dto/design-code.dto';
import { DesignCodeDocument } from 'src/database/schemas/designcode.schema';

@Controller('design-codes')
export class DesignCodeController {
  constructor(private readonly designCodeService: DesignCodeService) {}

//   @Get('category')
// async findByCategory(
//   @Query('category') category: string,
//   @Query('page') page: string = '1',
//   @Query('pageSize') pageSize: string = '5',
// ): Promise<{ data: any[]; total: number }> {
//   return this.designCodeService.findByCategory(category, parseInt(page), parseInt(pageSize));
// }

@Get('category/:category')
  async findByCategory(
    @Query('category') category: string,
  ): Promise<DesignCodeDocument[]> {
    return this.designCodeService.findByCategory(category);
  }


  
  @Get('getcategory')
  async getCategories(
    @Query() query: { page?: string; pageSize?: string },
  ): Promise<{ total: number; page: number; pageSize: number; categories: string[] }> {
    try {
      const page = query.page ? parseInt(query.page, 10) : 1;
      const pageSize = query.pageSize ? parseInt(query.pageSize, 10) : 5;

      const { categories, total } = await this.designCodeService.getCategories(page, pageSize);

      return {
        total,
        page,
        pageSize,
        categories,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post()
async create(@Body() createDesignCodeDto: any): Promise<any> {
  try {
    const createdDesignCode = await this.designCodeService.create(createDesignCodeDto);
    return createdDesignCode;
  } catch (error) {
    throw new HttpException({
      status: HttpStatus.BAD_REQUEST,
      error: error.message,
    }, HttpStatus.BAD_REQUEST);
  }
}



  @Get(':id')
  async findOne(@Param('id') id: string): Promise<DesignCode> {
    try {
      const designCode = await this.designCodeService.findOne(id);
      return designCode;
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: 'Design code not found',
      }, HttpStatus.NOT_FOUND);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDesignCodeDto: UpdateDesignCodeDto): Promise<DesignCode> {
    try {
      const updatedDesignCode = await this.designCodeService.update(id, updateDesignCodeDto);
      return updatedDesignCode;
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: 'Design code not found',
      }, HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    try {
      await this.designCodeService.delete(id);
      return { message: 'Design code deleted successfully' };
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: 'Design code not found',
      }, HttpStatus.NOT_FOUND);
    }
  }

  @Get()
  async findAll(): Promise<DesignCode[]> {
    try {
      const designCodes = await this.designCodeService.findAll();
      return designCodes;
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: error.message,
      }, HttpStatus.NOT_FOUND);
    }
  }
//   @Get('category')
// async getCategories(
//   @Query() query: { page?: string; pageSize?: string },
// ): Promise<{ total: number; page: number; pageSize: number; categories: string[] }> {
//   try {
//     const page = query.page ? parseInt(query.page, 10) : 1;
//     const pageSize = query.pageSize ? parseInt(query.pageSize, 10) : 5;

//     const { categories, total } = await this.designCodeService.getCategories(page, pageSize);

//     // Handle case where no categories are found
//     if (categories.length === 0) {
//       return {
//         total,
//         page,
//         pageSize,
//         categories: [],
//       };
//     }

//     return {
//       total,
//       page,
//       pageSize,
//       categories,
//     };
//   } catch (error) {
//     throw new HttpException(
//       {
//         status: HttpStatus.INTERNAL_SERVER_ERROR,
//         error: error.message,
//       },
//       HttpStatus.INTERNAL_SERVER_ERROR,
//     );
//   }
// }

// In your designCodeController.ts




}
