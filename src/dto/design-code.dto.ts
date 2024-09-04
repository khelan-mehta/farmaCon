import { IsNotEmpty, IsString, IsBoolean, IsNumber, IsOptional, IsArray, ArrayMaxSize } from 'class-validator';

export class CreateDesignCodeDto {
  @IsNotEmpty()
  @IsString()
  designId: string;

  @IsNotEmpty()
  @IsString()
  designName: string;

  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsBoolean()
  isDeleted: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isSuspended: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isMaster: boolean;

  @IsNotEmpty()
  @IsNumber()
  totalOrders: number;

  @IsNotEmpty()
  @IsBoolean()
  isPremium: boolean;

  @IsArray()
  @ArrayMaxSize(2)
  @IsString({ each: true })
  images: string[];

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  fabricType: string;

  @IsNotEmpty()
  @IsNumber()
  designCodePrice: number; // This is correctly defined

  @IsNotEmpty()
  @IsString()
  category : string;
}

export class UpdateDesignCodeDto {
  @IsOptional()
  @IsString()
  designId?: string;

  @IsOptional()
  @IsString()
  designName?: string;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @IsOptional()
  @IsBoolean()
  isSuspended?: boolean;

  @IsOptional()
  @IsBoolean()
  isMaster?: boolean;

  @IsOptional()
  @IsNumber()
  totalOrders?: number;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(2)
  @IsString({ each: true })
  images?: string[]; // Array for image URLs (maximum 2)

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  fabricType?: string;

  @IsNotEmpty()
  @IsNumber()
  designCodePrice: number;

  @IsNotEmpty()
  @IsString()
  category : string;
}
