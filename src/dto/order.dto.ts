import { IsNotEmpty, IsString, IsDateString, IsArray, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  orderName: string;

  @IsNotEmpty()
  @IsDateString()
  createdAt: Date;

  @IsNotEmpty()
  @IsString()
  createdBy: string;

  @IsOptional()
  @IsString()
  desc: string;

  @IsOptional()
  @IsArray()
  imgUrl: string[];

  @IsOptional()
  audioFileUrl: { mimeType: string, base64Sound: string };

  @IsOptional()
  @IsString()
  worker: string;

  @IsOptional()
  @IsNumber()
  workerRate: number;

  @IsNotEmpty()
  @IsString()
  designId: string;

  @IsOptional()
  @IsString()
  trackingCode: string;

  @IsOptional()
  @IsArray()
  measurements: Map<string, number>;

  @IsOptional()
  @IsBoolean()
  deleted?: boolean;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  orderName?: string;

  @IsOptional()
  @IsDateString()
  createdAt?: Date;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsArray()
  imgUrl?: string[];

  @IsOptional()
  @IsString()
  audioFileUrl?: string;

  @IsOptional()
  @IsString()
  worker?: string;

  @IsOptional()
  @IsNumber()
  workerRate?: number;

  @IsNotEmpty()
  @IsString()
  designId: string;

  @IsOptional()
  @IsString()
  trackingCode?: string;

  @IsOptional()
  measurements?: Map<string, number>;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsString()
  gmId?: string;

  @IsOptional()
  @IsDateString()
  editedAt?: Date; // New field to track the last update timestamp
}

export class CreateInvoiceDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  orderIds: string[];
}

export class CreateSlipDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;
}

export class SearchOrdersDto {
  @IsOptional()
  @IsString()
  firmName?: string;

  @IsOptional()
  @IsString()
  ownerFirstName?: string;

  @IsOptional()
  @IsString()
  ownerLastName?: string;

  @IsOptional()
  @IsNumber()
  mobileNo?: number;
}