import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from 'src/product/schemas/product.schema';

@Schema()
export class Cart extends Document {
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

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ default: false })
  checkedOut: boolean; // Si le panier a été validé pour la commande
}

export const CartSchema = SchemaFactory.createForClass(Cart);
