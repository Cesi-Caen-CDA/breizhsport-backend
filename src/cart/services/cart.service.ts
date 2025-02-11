// src/cart/services/cart.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from '../schemas/cart.schema';
import { ProductService } from '../../product/services/product.service';
import { User } from '../../user/schemas/user.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    private productService: ProductService,
  ) {}

  async addProductToCart(
    user: string | Types.ObjectId,
    productId: string,
    quantity: number,
  ): Promise<Cart> {
    const product = await this.productService.findOne(productId);
    if (!product || !product._id) {
      throw new Error('Produit non trouvé ou ID du produit invalide');
    }

    // Conversion explicite en ObjectId
    const productObjectId = new Types.ObjectId(product._id.toString());

    // Trouver le panier existant
    let cart = await this.cartModel.findOne({
      user: user,
      checkedOut: false,
    });

    if (!cart) {
      throw new Error('Panier non trouvé');
    }

    // Si le tableau products est undefined, initialiser à un tableau vide
    if (!Array.isArray(cart.products)) {
      cart.products = [];
    }

    if (cart) {
      // Vérifier si le produit existe déjà dans le panier
      const existingProductIndex = cart.products.findIndex(
        (p) => p.product.toString() === productObjectId.toString(),
      );

      if (existingProductIndex !== -1) {
        // Si le produit existe déjà, mettez à jour sa quantité
        cart.products[existingProductIndex].quantity = quantity; // Remplacez par la nouvelle quantité
      } else {
        // Ajouter le produit si non existant
        cart.products.push({ product: productObjectId, quantity });
      }
    } else {
      // Créez un nouveau panier si aucun n'existe
      cart = new this.cartModel({
        user: user,
        products: [{ product: productObjectId, quantity }],
      });
    }

    // Sauvegardez le panier
    await cart.save();
    return cart;
  }

  // Vérifier le panier (pour passer à la commande)
  async checkout(userId: string | Types.ObjectId): Promise<Cart> {
    const userObjectId = new Types.ObjectId(userId);
    const cart = await this.cartModel
      .findOne({ user: userObjectId, checkedOut: false })
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

  async removeProductFromCart(
    userId: string | Types.ObjectId,
    productId: string,
  ): Promise<Cart> {
    const productObjectId = new Types.ObjectId(productId);

    const cart = await this.cartModel.findOne({
      user: userId,
      checkedOut: false,
    });

    if (!cart) {
      throw new Error('Panier non trouvé');
    }

    // Si le tableau products est undefined, initialiser à un tableau vide
    if (!Array.isArray(cart.products)) {
      cart.products = [];
    }

    const productIndex = cart.products.findIndex(
      (p) => p.product.toString() === productObjectId.toString(),
    );

    if (productIndex === -1) {
      throw new Error('Produit non trouvé dans le panier');
    } else {
      cart.products.splice(productIndex, 1); // Supprime le produit du panier

      await cart.save(); // Sauvegarde les modifications
      return cart;
    }
  }
}
