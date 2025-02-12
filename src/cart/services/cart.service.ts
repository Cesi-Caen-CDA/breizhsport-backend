// src/cart/services/cart.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from '../schemas/cart.schema';
import { ProductService } from '../../product/services/product.service';
import { User } from '../../user/schemas/user.schema';
import { NotFoundException } from '@nestjs/common';
import { UserService } from '../../user/services/user.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    private productService: ProductService,
    private userService: UserService,
  ) {}

  async addProductToCart(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<Cart> {
    // Recherche de l'utilisateur
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new Error('Utilisateur introuvable');
    }
    // Conversion explicite en ObjectId
    const userObjectId = new Types.ObjectId(user._id.toString());

    // Recherche du produit
    const product = await this.productService.findOne(productId);
    if (!product || !product._id) {
      throw new NotFoundException(
        'Produit non trouvé ou ID du produit invalide',
      );
    }

    // Conversion explicite en ObjectId
    const productObjectId = new Types.ObjectId(product._id.toString());

    // Trouver ou créer un panier
    let cart = await this.cartModel.findOne({
      user: userObjectId,
      checkedOut: false,
    });

    if (!cart) {
      // Si aucun panier existant, en créer un
      cart = new this.cartModel({
        user: userObjectId,
        products: [{ product: productObjectId, quantity }],
      });
    } else {
      // Si le panier existe, vérifier si le produit est déjà présent
      const existingProductIndex = cart.products.findIndex(
        (p) => p.product.toString() === productObjectId.toString(),
      );

      if (existingProductIndex !== -1) {
        // Si le produit existe déjà dans le panier, on met à jour sa quantité
        cart.products[existingProductIndex].quantity = quantity;
      } else {
        // Sinon, on ajoute un nouveau produit
        cart.products.push({ product: productObjectId, quantity });
      }
    }

    // Sauvegarde du panier
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
        path: 'products.product',
        select: 'name price category description stock',
      });
    // Si le panier n'existe pas ou s'il est vide (produits = [])
    if (!cart || !cart.products || cart.products.length === 0) {
      throw new NotFoundException('Panier non trouvé');
    }

    return cart;
  }

  async removeProductFromCart(
    userId: string | Types.ObjectId,
    productId: string,
  ): Promise<Cart> {
    const productObjectId = new Types.ObjectId(productId);
    const idUser = userId.toString();

    const user = await this.userService.findOne(idUser);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    // Recherche du panier de l'utilisateur
    const cart = await this.cartModel.findOne({
      user: user._id,
      checkedOut: false,
    });
    // Si le panier n'existe pas, on lance une exception
    if (!cart) {
      throw new NotFoundException('Panier non trouvé');
    }

    // Si le tableau de produits est undefined, on l'initialise à un tableau vide
    if (!Array.isArray(cart.products)) {
      cart.products = [];
    }

    // Recherche du produit à supprimer dans le panier
    const productIndex = cart.products.findIndex(
      (p) => p.product.toString() === productObjectId.toString(),
    );

    // Si le produit n'est pas trouvé, on lance une exception
    if (productIndex === -1) {
      throw new NotFoundException('Produit non trouvé dans le panier');
    } else {
      // Si le produit est trouvé, on le supprime
      cart.products.splice(productIndex, 1);
      await cart.save(); // Sauvegarde les modifications dans la base de données
      return cart; // Retourne le panier mis à jour
    }
  }
}
