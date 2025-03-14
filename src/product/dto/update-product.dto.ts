// src/product/dto/update-product.dto.ts
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsPositive,
  MinLength,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'La nom doit comporter au moins 3 caractères.' })
  name?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'Le prix doit être un nombre positif.' })
  price?: number;

  @IsOptional()
  @IsString()
  @MinLength(3, {
    message: 'La catégorie doit comporter au moins 3 caractères.',
  })
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Le stock doit être un nombre positif ou nul.' })
  stock?: number;
}
