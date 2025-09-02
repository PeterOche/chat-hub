import { IsOptional, IsString, MaxLength } from 'class-validator';

export class VisitorReplyDto {
  @IsString()
  @MaxLength(5000)
  content!: string;

  @IsOptional()
  @IsString()
  token?: string; // resume token (signed)
}
