// src/user/dto/create-user.dto.ts
import { IsString, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  lastname: string;

  @IsString()
  firstname: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
