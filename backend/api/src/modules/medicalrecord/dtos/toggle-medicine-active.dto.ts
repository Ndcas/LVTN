import { IsIn } from 'class-validator';

export class ToggleMedicineActiveDto {
  @IsIn(['0', '1'], { message: 'Trạng thái không hợp lệ' })
  isActive: string;
}
