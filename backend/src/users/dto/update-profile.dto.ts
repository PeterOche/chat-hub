import { IsOptional, IsString, IsUrl, IsObject, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @IsOptional()
  @IsUrl({ require_protocol: false }, { message: 'photoUrl must be a valid URL' })
  photoUrl?: string;

  @IsOptional()
  @IsObject()
  theme?: Record<string, string>;
}


