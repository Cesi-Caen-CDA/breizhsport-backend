// src/product/dto/create-product.dto.ts
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsPositive,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @Min(3, { message: 'Le nom doit comporter au moins 3 caractères.' })
  name: string;

  @IsNumber()
  @IsPositive({ message: 'Le prix doit être un nombre positif.' })
  price: number;

  @IsString()
  @Min(3, { message: 'La catégorie doit comporter au moins 3 caractères.' })
  category: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0, { message: 'Le stock doit être un nombre positif ou nul.' })
  stock: number;
}
