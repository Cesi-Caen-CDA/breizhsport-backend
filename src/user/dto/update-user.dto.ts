// src/user/dto/update-user.dto.ts
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  password?: string;
}
