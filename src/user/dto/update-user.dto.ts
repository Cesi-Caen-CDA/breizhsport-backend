// src/user/dto/update-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: "Le nom de l'utilisateur",
    example: 'Dupont',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères.' })
  lastname: string;

  @ApiProperty({
    description: "Le prénom de l'utilisateur",
    example: 'Jean',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères.' })
  firstname: string;

  @ApiProperty({
    description: "L'adresse email de l'utilisateur",
    type: String,
    required: false,
    example: 'username@domain.com',
  })
  @IsOptional()
  @MinLength(8, { message: "L'email doit contenir au moins 2 caractères." })
  @IsEmail({}, { message: 'Email invalide.' })
  email: string;

  @ApiProperty({
    description: "Le mot de passe de l'utilisateur",
    example: 'mot-de-passe-utilisateur',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères.',
  })
  password: string;
}
