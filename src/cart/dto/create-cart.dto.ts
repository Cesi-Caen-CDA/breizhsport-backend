// src/cart/dto/create-cart.dto.ts
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsBoolean,
  Min,
  IsNumber,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateCartDto {
  //   @IsArray()
  //   @IsNotEmpty({ message: 'Le panier doit contenir des produits.' })
  //   products: { product: Types.ObjectId; quantity: number }[];

  @IsMongoId({ message: "L'ID de du produit est invalide." })
  productId: Types.ObjectId;

  @IsMongoId({ message: "L'ID de l'utilisateur est invalide." })
  user: Types.ObjectId;

  @IsOptional()
  @IsBoolean()
  checkedOut: boolean = false; // Par défaut, le panier n'est pas validé

  @IsNumber()
  @Min(1, {
    message: 'au moins 1 unité est requise.',
  })
  quantity: number;
}
