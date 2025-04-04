// src/order/dto/create-order.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

class OrderProductDto {
  @ApiProperty({
    description: 'ID du produit',
    example: '507f1f77bcf86cd799439011',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Quantité commandée',
    example: 1,
    required: true,
    minimum: 1,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: "ID de l'utilisateur",
    example: '507f1f77bcf86cd799439011',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Liste des produits commandés',
    type: [OrderProductDto],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];
}
