import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateDegreeDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên bằng cấp không được để trống' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
