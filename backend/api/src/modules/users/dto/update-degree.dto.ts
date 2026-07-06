import { IsString, IsOptional } from 'class-validator';

export class UpdateDegreeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
