import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';
import { Product } from '../../product/schemas/product.schema';
import { User } from '../../user/schemas/user.schema';

export class OrderItem {
  @ApiProperty({
    description: 'Informations du produit commandé',
    type: () => ({ _id: String, name: String, price: Number }),
  })
  product: Product;

  @ApiProperty({
    description: 'Quantité du produit commandé',
    example: 2,
  })
  quantity: number;

  @ApiProperty({
    description: 'Prix unitaire du produit au moment de la commande',
    example: 29.99,
  })
  price: number;
}

@Schema()
export class Order extends Document {
  @ApiProperty({
    description: 'Liste des produits dans la commande',
    type: [OrderItem],
    required: true,
  })
  @Prop({
    type: [
      {
        product: { type: Types.ObjectId, ref: 'Product' },
        quantity: Number,
        price: Number,
      },
    ],
    required: true,
  })
  products: { product: Product; quantity: number; price: number }[];

  @ApiProperty({
    description: "Informations de l'utilisateur ayant passé la commande",
    type: () => ({ _id: String, username: String, email: String }),
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User;

  @ApiProperty({
    description: 'Prix total de la commande',
    example: 59.98,
  })
  @Prop({ required: true })
  totalPrice: number;

  @ApiProperty({
    description: 'Statut de la commande',
    example: 'pending',
    enum: ['pending', 'completed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  })
  @Prop({ default: 'pending' })
  status: string; // Statut de la commande (par exemple, pending, completed)

  @ApiProperty({
    description: 'Date et heure de création de la commande',
    example: '2025-04-04T15:00:00.000Z',
  })
  @Prop({ required: true })
  createdAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
