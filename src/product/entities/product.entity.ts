import { ProductType } from '../types/product.type';

export class ProductEntity implements ProductType {
  _id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;

  constructor(partial: Partial<ProductType>) {
    Object.assign(this, partial);
  }
}
