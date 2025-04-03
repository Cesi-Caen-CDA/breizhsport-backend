import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    description: "L'adresse email de l'utilisateur",
    example: 'username@domain.com',
    required: true,
    type: String,
  })
  @IsEmail({}, { message: 'Email invalide.' })
  email: string;

  @ApiProperty({
    description: "Le mot de passe de l'utilisateur",
    example: 'password@utilisateur',
    required: true,
    type: String,
  })
  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères.',
  })
  password: string;
}
