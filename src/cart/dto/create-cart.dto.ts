// src/cart/dto/create-cart.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateCartItemDto {
  @ApiProperty({
    description: 'ID du produit à ajouter au panier (ObjectId)',
    example: '64b7e34a9d2b3c1e8a4f5678',
  })
  @IsMongoId({ message: "L'ID du produit est invalide." })
  productId: Types.ObjectId;

  @ApiProperty({
    description: 'Quantité du produit à ajouter',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @Min(1, { message: 'Au moins 1 unité est requise.' })
  quantity: number;
}

export class CreateCartDto {
  @ApiProperty({
    description: 'Liste des produits à ajouter au panier',
    type: [CreateCartItemDto],
    example: [
      { productId: '64b7e34a9d2b3c1e8a4f5678', quantity: 2 },
      { productId: '64b7e34a9d2b3c1e8a4f5679', quantity: 1 },
    ],
  })
  @IsArray()
  @IsNotEmpty({ message: 'Le panier doit contenir des produits.' })
  @ValidateNested({ each: true })
  @Type(() => CreateCartItemDto)
  items: CreateCartItemDto[];

  @ApiProperty({
    description: "ID de l'utilisateur propriétaire du panier (ObjectId)",
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: "L'ID de l'utilisateur est invalide." })
  user: Types.ObjectId;

  @ApiProperty({
    description: 'Indique si le panier doit être créé comme déjà validé',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  checkedOut: boolean = false; // Par défaut, le panier n'est pas validé
}
