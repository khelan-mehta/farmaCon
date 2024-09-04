import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ArrayNotEmpty, ArrayMinSize } from 'class-validator';

export class CreateCatalogueDto {
  @IsNotEmpty()
  @IsString()
  designCode: string;  // This should be a string representation of the ObjectId

  @IsNotEmpty()
  @IsString()
  designName: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(2) // Ensure at least 2 images
  @IsString({ each: true }) // Ensure each item in the array is a string
  imgUrls: string[];

  @IsNotEmpty()
  @IsNumber()
  price: number;
}

export class UpdateCatalogueDto {
  @IsOptional()
  @IsString()
  designCode?: string;

  @IsOptional()
  @IsString()
  designName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(2) // Ensure at least 2 images
  @IsString({ each: true }) // Ensure each item in the array is a string
  imgUrls?: string[];

  @IsOptional()
  @IsNumber()
  price?: number;
}
