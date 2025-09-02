import { IsOptional, IsString, IsEmail, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MaxLength(5000)
  content!: string;

  @IsOptional()
  @IsString()
  visitorId?: string;

  @IsOptional()
  @IsString()
  convoId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
