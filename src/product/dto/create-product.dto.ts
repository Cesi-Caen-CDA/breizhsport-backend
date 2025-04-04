// src/product/dto/create-product.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Nom du produit',
    example: 'Chaussures de running',
    required: true,
    minLength: 3,
    type: String,
  })
  @IsString()
  @MinLength(3, { message: 'Le nom doit comporter au moins 3 caractères.' })
  name: string;

  @ApiProperty({
    description: 'Prix du produit',
    example: 99.99,
    required: true,
    minimum: 0,
    type: Number,
  })
  @IsNumber()
  @IsPositive({ message: 'Le prix doit être un nombre positif.' })
  price: number;

  @ApiProperty({
    description: 'Catégorie du produit',
    example: 'Chaussures',
    required: true,
    minLength: 3,
    type: String,
  })
  @IsString()
  @MinLength(3, {
    message: 'La catégorie doit comporter au moins 3 caractères.',
  })
  category: string;

  @ApiProperty({
    description: 'Description du produit',
    example: 'Chaussures de running légères et confortables',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Quantité en stock',
    example: 100,
    required: true,
    minimum: 0,
    type: Number,
  })
  @IsNumber()
  @Min(0, { message: 'Le stock doit être un nombre positif ou nul.' })
  stock: number;
}
