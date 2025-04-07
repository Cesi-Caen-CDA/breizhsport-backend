// src/product/dto/update-product.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({
    description: 'Nouveau nom du produit',
    example: 'Super Produit Mis à Jour',
    minLength: 3,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Le nom doit comporter au moins 3 caractères.' })
  name?: string; // Correção: O tipo deveria ser string

  @ApiProperty({
    description: 'Nouveau prix du produit',
    example: 29.99,
    minimum: 0.01,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'Le prix doit être un nombre positif.' })
  price?: number;

  @ApiProperty({
    description: 'Nouvelle catégorie du produit',
    example: 'Électronique',
    minLength: 3,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3, {
    message: 'La catégorie doit comporter au moins 3 caractères.',
  })
  category?: string;

  @ApiProperty({
    description: 'Nouvelle description du produit',
    example: 'Une description détaillée du produit mis à jour.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Nouveau stock du produit',
    example: 100,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Le stock doit être un nombre positif ou nul.' })
  stock?: number;
}
