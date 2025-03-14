// src/user/dto/update-user.dto.ts
import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères.' })
  lastname: string;
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères.' })
  firstname: string;
  @IsOptional()
  @IsEmail({}, { message: 'Email invalide.' })
  email: string;

  @IsOptional() // Le mot de passe est maintenant optionnel
  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères.',
  })
  password: string;
}
