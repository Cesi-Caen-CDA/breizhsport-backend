// src/product/dto/update-product.dto.ts
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsPositive,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'Le prix doit être un nombre positif.' })
  price?: number;

  @IsOptional()
  @IsString()
  @Min(3, { message: 'La catégorie doit comporter au moins 3 caractères.' })
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Le stock doit être un nombre positif ou nul.' })
  stock?: number;
}
