import { IsOptional, IsString, IsNumber } from 'class-validator';

export class SearchWorkersDto {
  @IsOptional()
  @IsString()
  readonly firstName?: string;

  @IsOptional()
  @IsString()
  readonly lastName?: string;

  @IsOptional()
  @IsNumber()
  readonly mobileNo?: number;
}
