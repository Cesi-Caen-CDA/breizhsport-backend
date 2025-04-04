// src/product/schemas/product.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema()
export class Product extends Document {
  @ApiProperty({
    description: 'Nom du produit',
    example: 'Laptop',
    required: true,
    type: String,
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description: 'Prix du produit',
    example: 999.99,
    required: true,
    type: Number,
  })
  @Prop({ required: true })
  price: number;
  @ApiProperty({
    description: 'Categorie du produit',
    example: 'Electronics',
    required: true,
    type: String,
  })
  @Prop({ required: true })
  category: string;
  @ApiProperty({
    description: 'Description du produit',
    example: 'Chaussures de running Bike AquaMax 360',
    required: false,
    type: String,
  })
  @Prop()
  description: string;

  @ApiProperty({
    description: 'Stock du produit',
    example: 100,
    required: true,
    type: Number,
  })
  @Prop({ required: true })
  stock: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
