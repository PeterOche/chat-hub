import { IsString, MaxLength } from 'class-validator';

export class ManagerReplyDto {
  @IsString()
  @MaxLength(5000)
  content!: string;
}
