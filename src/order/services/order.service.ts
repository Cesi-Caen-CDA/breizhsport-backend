import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../schemas/order.schema';
import { CartService } from '../../cart/services/cart.service';
import { User } from '../../user/schemas/user.schema';
import { Product } from '../../product/schemas/product.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private cartService: CartService,
    @InjectModel(Product.name) private productModel: Model<Product>, // Ajouter le modèle Product
  ) {}

  // Créer une commande à partir d'un panier validé
  async createOrder(user: User): Promise<Order> {
    const cart = await this.cartService.checkout(user); // Checkout panier
    if (!cart) {
      throw new Error('Panier invalide');
    }

    // Vérification du stock pour chaque produit dans le panier
    for (const item of cart.products) {
      const product = item.product as Product;

      // Vérifiez si le produit a suffisamment de stock
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuffisant pour le produit ${product.name}`);
      }
    }

    // Calcul du prix total de la commande
    const totalPrice = cart.products.reduce((total, item) => {
      // Vérifiez si item.product est de type Product
      if ('price' in item.product) {
        return total + (item.product as Product).price * item.quantity;
      }
      throw new Error('Produit invalide dans le panier');
    }, 0);

    // Créer la commande
    const order = new this.orderModel({
      user: user._id,
      products: cart.products.map((item) => {
        if ('price' in item.product) {
          return {
            product: (item.product as Product)._id,
            quantity: item.quantity,
            price: (item.product as Product).price,
          };
        }
        throw new Error('Produit invalide dans le panier');
      }),
      totalPrice,
      status: 'pending',
      createdAt: new Date(),
    });

    // Sauvegarder la commande
    await order.save();

    // Mise à jour du stock des produits
    for (const item of cart.products) {
      const product = item.product as Product;
      // Réduire le stock du produit en fonction de la quantité commandée
      await this.productModel.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Retourner la commande
    return order;
  }
}
