// src/user/dto/update-user.dto.ts
import { IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères.',
  })
  password: string;
}
