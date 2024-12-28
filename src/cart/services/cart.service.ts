// src/cart/services/cart.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from '../schemas/cart.schema';
import { CreateCartDto } from '../dto/create-cart.dto';
import { ProductService } from '../../product/services/product.service';
import { Product } from '../../product/schemas/product.schema';
import { User } from '../../user/schemas/user.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    private productService: ProductService,
  ) {}

  async addProductToCart(
    user: User,
    productId: string,
    quantity: number,
  ): Promise<Cart> {
    const product = await this.productService.findOne(productId);
    if (!product || !product._id) {
      throw new Error('Produit non trouvé ou ID du produit invalide');
    }

    // Conversion explicite en ObjectId
    const productObjectId = new Types.ObjectId(product._id.toString());

    let cart = await this.cartModel.findOne({
      user: user._id,
      checkedOut: false,
    });

    if (cart) {
      const existingProduct = cart.products.find(
        (p) => p.product.toString() === productObjectId.toString(),
      );
      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.products.push({ product: productObjectId, quantity });
      }
      await cart.save();
    } else {
      cart = new this.cartModel({
        user: user._id,
        products: [{ product: productObjectId, quantity }],
      });
      await cart.save();
    }

    return cart;
  }

  // Vérifier le panier (pour passer à la commande)
  async checkout(user: User): Promise<Cart> {
    const cart = await this.cartModel
      .findOne({ user: user._id, checkedOut: false })
      .populate('products.product'); // Peuple la référence "product" avec les détails du produit

    if (!cart) {
      throw new Error('Panier non trouvé');
    }

    cart.checkedOut = true;
    await cart.save();
    return cart;
  }

  async getCartForUser(userId: string): Promise<Cart> {
    const cart = await this.cartModel
      .findOne({
        user: new Types.ObjectId(userId),
        checkedOut: false,
      })
      .populate({
        path: 'products.product', // Peupler les informations du produit
        select: 'name price category description stock', // Sélectionner les informations nécessaires
      });
    if (!cart) {
      throw new Error('Panier non trouvé');
    }
    return cart;
  }
}
