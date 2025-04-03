// src/user/dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: "Le nom de l'utilisateur",
    example: 'Dupont',
    required: true,
    type: String,
  })
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères.' })
  lastname: string;

  @ApiProperty({
    description: "Le prénom de l'utilisateur",
    example: 'Jean',
    required: true,
    type: String,
  })
  @IsString()
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères.' })
  firstname: string;
  @ApiProperty({
    description: "L'adresse email de l'utilisateur",
    type: String,
    required: true,
    example: 'username@domain.com',
  })
  @IsEmail({}, { message: 'Email invalide.' })
  email: string;
  @ApiProperty({
    description: "Le mot de passe de l'utilisateur",
    example: 'password-utilisateur',
    required: true,
    type: String,
  })
  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères.',
  })
  password: string;
}
