import {
  IsUrl,
  IsDateString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateUrlDto {
  @IsString()
  @IsOptional()
  customPrefix: string;

  @IsString()
  @IsOptional()
  @Length(3, 10)
  customID: string;

  @IsUrl({ require_host: true })
  url: string;

  @IsDateString()
  @IsOptional()
  expiresAt: string;
}
