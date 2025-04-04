import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';
import { Product } from 'src/product/schemas/product.schema';

export class CartItemDto {
  @ApiProperty({
    description: 'ID du produit (ObjectId)',
    example: '507f1f77bcf86cd799439011',
    type: String,
  })
  product: string;

  @ApiProperty({
    description: 'Quantité du produit',
    example: 2,
    type: Number,
  })
  quantity: number;
}

@Schema()
export class Cart extends Document {
  @ApiProperty({
    description: 'Liste des produits dans le panier',
    type: [CartItemDto],
    example: [
      {
        product: '507f1f77bcf86cd799439011',
        quantity: 2,
      },
    ],
    required: true,
  })
  @Prop({
    type: [
      {
        product: { type: Types.ObjectId, ref: 'Product' },
        quantity: Number,
      },
    ],
    required: true,
  })
  products: { product: Product | Types.ObjectId; quantity: number }[];

  @ApiProperty({
    description: "ID de l'utilisateur propriétaire du panier",
    example: '64b7e34a9d2b3c1e8a4f5678',
    required: true,
    type: String,
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @ApiProperty({
    description: 'Indique si le panier a été validé pour une commande',
    example: false,
    required: false,
    type: Boolean,
    default: false,
  })
  @Prop({ default: false })
  checkedOut: boolean; // Si le panier a été validé pour la commande
}

export const CartSchema = SchemaFactory.createForClass(Cart);
