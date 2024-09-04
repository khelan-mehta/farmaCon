import { IsNotEmpty, IsNumber, IsString, MaxLength, IsBoolean } from 'class-validator';

export class CreateWorkerDto {
  @IsNotEmpty()
  @IsNumber()
  @MaxLength(10)
  mobileNo: number;

  @IsNotEmpty()
  workerName: {
    first: string;
    last: string;
  };

  @IsString()
  @MaxLength(250)
  deviceId: string;

  @IsBoolean()
  isDeleted: boolean;

  @IsNotEmpty()
  @IsString()
  @MaxLength(256)
  password: string;

  @IsString()
  @MaxLength(256)
  token: string;

  @IsBoolean()
  isSuspended: boolean;

  @IsBoolean()
  isMaster: boolean;

  @IsBoolean()
  isVerified: boolean;

  @IsNumber()
  @MaxLength(16)
  totalOrders: number;
}
