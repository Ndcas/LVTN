import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @MaxLength(150, { message: 'Tiêu đề không được vượt quá 150 ký tự' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Nội dung không được để trống' })
  @MaxLength(500, { message: 'Nội dung không được vượt quá 500 ký tự' })
  content: string;
}
