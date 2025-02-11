import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../schemas/order.schema';
import { CartService } from '../../cart/services/cart.service';
import { Product } from '../../product/schemas/product.schema';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private cartService: CartService,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const { userId, products } = createOrderDto;

    // Vérifier le panier
    const cart = await this.cartService.getCartForUser(userId);
    if (!cart || cart.products.length === 0) {
      throw new Error('Le panier est vide ou invalide.');
    }

    // Vérification du stock
    for (const item of products) {
      const product = await this.productModel.findById(item.productId);
      if (!product) {
        throw new Error(`Produit avec ID ${item.productId} non trouvé.`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuffisant pour le produit ${product.name}.`);
      }
    }

    // Calcul du prix total
    let totalPrice = 0;
    for (const item of products) {
      const product = await this.productModel.findById(item.productId);
      totalPrice += product.price * item.quantity;
    }

    // Créer la commande
    const order = await this.orderModel.create({
      user: userId,
      products: products.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
        price: 0, // Le prix sera peuplé après
      })),
      totalPrice,
      status: 'pending',
      createdAt: new Date(),
    });

    // Mise à jour du stock
    for (const item of products) {
      await this.productModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    return order;
  }

  async getOrderHistory(userId: string): Promise<Order[]> {
    const orderHistory = await this.orderModel
      .find({ user: userId })
      .populate('products.product', 'name price category description stock');

    if (!orderHistory || orderHistory.length === 0) {
      throw new Error(
        'Aucun historique de commandes trouvé pour cet utilisateur.',
      );
    }

    return orderHistory;
  }

  async updateOrder(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      id,
      updateOrderDto,
      {
        new: true,
      },
    );

    if (!updatedOrder) {
      throw new Error(`Commande avec l'ID ${id} non trouvée.`);
    }

    return updatedOrder;
  }
}
