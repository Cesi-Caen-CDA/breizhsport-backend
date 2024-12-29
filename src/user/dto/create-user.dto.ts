// src/user/dto/create-user.dto.ts
import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères.' })
  lastname: string;

  @IsString()
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères.' })
  firstname: string;

  @IsEmail({}, { message: 'Email invalide.' })
  email: string;

  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères.',
  })
  password: string;
}
