import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { CartService } from '../../cart/services/cart.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from '../../product/schemas/product.schema';
import { Order } from '../schemas/order.schema';
import { NotFoundException } from '@nestjs/common';

describe('OrderService', () => {
  let orderService: OrderService;
  let cartService: CartService;
  let orderModel: any;
  let productModel: any;

  const mockOrder = {
    _id: 'order-id',
    user: 'user-id',
    products: [
      {
        product: {
          _id: 'product-id',
          name: 'Product 1',
          price: 50,
          category: 'Category 1',
          description: 'Product description',
          stock: 10,
        },
        quantity: 2,
        price: 50,
      },
    ],
    totalPrice: 100,
    status: 'pending',
    createdAt: new Date(),
  };

  const mockProduct = {
    _id: 'product-id',
    name: 'Product 1',
    price: 50,
    stock: 10,
  };

  const mockCartService = {
    getCartForUser: jest.fn().mockResolvedValue({
      products: [{ product: mockProduct, quantity: 2 }],
    }),
  };

  const mockOrderModel = {
    create: jest.fn().mockResolvedValue(mockOrder),
    find: jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue([mockOrder]), // Simule find().populate()
    }),
    findByIdAndUpdate: jest.fn().mockResolvedValue(mockOrder),
  };

  const mockProductModel = {
    findById: jest.fn().mockResolvedValue(mockProduct),
    findByIdAndUpdate: jest.fn().mockResolvedValue(mockProduct),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: CartService, useValue: mockCartService },
        { provide: getModelToken(Order.name), useValue: mockOrderModel },
        { provide: getModelToken(Product.name), useValue: mockProductModel },
      ],
    }).compile();

    orderService = module.get<OrderService>(OrderService);
    cartService = module.get<CartService>(CartService);
    orderModel = module.get(getModelToken(Order.name));
    productModel = module.get(getModelToken(Product.name));
  });

  describe('createOrder', () => {
    it('devrait créer une commande avec succès', async () => {
      const createOrderDto = {
        userId: 'user-id',
        products: [{ productId: 'product-id', quantity: 2 }],
      };

      const result = await orderService.createOrder(createOrderDto);

      expect(cartService.getCartForUser).toHaveBeenCalledWith('user-id');
      expect(productModel.findById).toHaveBeenCalledWith('product-id');
      expect(orderModel.create).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it('devrait lancer une erreur si le panier est vide', async () => {
      mockCartService.getCartForUser.mockResolvedValueOnce(null);

      const createOrderDto = {
        userId: 'user-id',
        products: [{ productId: 'product-id', quantity: 2 }],
      };

      await expect(orderService.createOrder(createOrderDto)).rejects.toThrow(
        'Le panier est vide ou invalide.',
      );
    });

    it('devrait lancer une erreur si le stock est insuffisant', async () => {
      mockProductModel.findById.mockResolvedValueOnce({
        ...mockProduct,
        stock: 1,
      });

      const createOrderDto = {
        userId: 'user-id',
        products: [{ productId: 'product-id', quantity: 2 }],
      };

      await expect(orderService.createOrder(createOrderDto)).rejects.toThrow(
        'Stock insuffisant pour le produit',
      );
    });
  });

  describe('getOrderHistory', () => {
    it('devrait retourner l’historique des commandes', async () => {
      const userId = 'user-id';
      const status = 'completed';
      const result = await orderService.getOrderHistory(userId );

      expect(orderModel.find).toHaveBeenCalledWith({ user: userId, status: status});
      expect(result).toEqual([mockOrder]);
    });
    
      it('devrait lancer une erreur si l’historique des commandes est vide', async () => {
        mockOrderModel.find.mockReturnValueOnce({
          populate: jest.fn().mockResolvedValue([]),
        });
    
        const userId = 'user-id';
    
        try {
          await orderService.getOrderHistory(userId);
          fail('Should have thrown NotFoundException');
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException); // Vérifie le type de l'erreur
        }
      });
  });

  describe('updateOrder', () => {
    it('devrait mettre à jour une commande', async () => {

      const result = await orderService.updateOrder('order-id');

      expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'order-id',
        { new: true },
      );
      expect(result).toEqual(mockOrder);
    });

    it('devrait lancer une erreur si la commande n’est pas trouvée', async () => {
      mockOrderModel.findByIdAndUpdate.mockResolvedValueOnce(null);

      await expect(
        orderService.updateOrder('invalid-id'),
      ).rejects.toThrow("Commande avec l'ID invalid-id non trouvée.");
    });
  });
});
