// src/cart/services/cart.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { ProductService } from '../../product/services/product.service';
import { getModelToken } from '@nestjs/mongoose';
import { Cart } from '../schemas/cart.schema';
import { Types } from 'mongoose';
import { UserService } from '../../user/services/user.service';
import { NotFoundException } from '@nestjs/common';

describe('CartService', () => {
  let cartService: CartService;
  let productService: ProductService;
  let userService: UserService;
  let cartModel: any;

  const mockUserId = new Types.ObjectId().toString(); // 👈 ID utilisateur constant
  const mockCart = {
    _id: new Types.ObjectId(),
    user: new Types.ObjectId(mockUserId), // 👈 Utilisation d'un ObjectId
    products: [
      {
        product: new Types.ObjectId(),
        quantity: 2,
      },
    ],
    checkedOut: false,
    save: jest.fn().mockResolvedValue(true),
  };

  const mockProduct = {
    _id: new Types.ObjectId(),
    name: 'Product 1',
    price: 50,
    category: 'Category 1',
    description: 'Product description',
    stock: 10,
  };

  const mockCartModel = {
    findOne: jest.fn().mockResolvedValue(mockCart),
    create: jest.fn().mockResolvedValue(mockCart),
    save: jest.fn().mockResolvedValue(mockCart),
  };

  const mockProductService = {
    findOne: jest.fn().mockResolvedValue(mockProduct),
  };

  const mockUserService = {
    findOne: jest
      .fn()
      .mockResolvedValue({ _id: new Types.ObjectId(mockUserId) }), // 👈 ID constant
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: ProductService, useValue: mockProductService },
        { provide: getModelToken(Cart.name), useValue: mockCartModel },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    cartService = module.get<CartService>(CartService);
    productService = module.get<ProductService>(ProductService);
    userService = module.get<UserService>(UserService);
    cartModel = module.get(getModelToken(Cart.name));
  });

  describe('addProductToCart', () => {
    it('devrait ajouter un produit au panier avec succès', async () => {
      const user = { _id: new Types.ObjectId(mockUserId) }; // 👈 Utilisation de l'ID fixe
      const productId = mockProduct._id.toString();
      const quantity = 2;

      const result = await cartService.addProductToCart(
        user._id.toString(),
        productId,
        quantity,
      );

      expect(mockProductService.findOne).toHaveBeenCalledWith(productId);
      expect(mockCartModel.findOne).toHaveBeenCalledWith({
        user: user._id, // 👈 ID sous forme d'ObjectId
        checkedOut: false,
      });
      expect(mockCart.save).toHaveBeenCalled();
      expect(result).toEqual(mockCart);
    });

    it('devrait lancer une erreur si le produit est introuvable', async () => {
      mockProductService.findOne.mockResolvedValueOnce(null);
      const user = { _id: new Types.ObjectId(mockUserId) };
      const productId = new Types.ObjectId().toString();
      const quantity = 2;

      await expect(
        cartService.addProductToCart(user._id.toString(), productId, quantity),
      ).rejects.toThrow('Produit non trouvé ou ID du produit invalide');
    });
  });

  describe('removeProductFromCart', () => {
    it('devrait supprimer un produit du panier', async () => {
      const user = { _id: new Types.ObjectId(mockUserId) };
      const productId = mockCart.products[0].product.toString();

      mockCartModel.findOne.mockResolvedValueOnce(mockCart); // 👈 Assurer la cohérence

      const result = await cartService.removeProductFromCart(
        user._id.toString(),
        productId,
      );

      expect(mockCartModel.findOne).toHaveBeenCalledTimes(2); // 👈 Vérifie qu'il est bien appelé 2 fois
      expect(mockCartModel.findOne).toHaveBeenCalledWith({
        user: user._id,
        checkedOut: false,
      });

      expect(mockCart.save).toHaveBeenCalled();
      expect(result).toEqual(mockCart);
    });

    it('devrait lancer une erreur si le panier est introuvable', async () => {
      mockCartModel.findOne.mockResolvedValueOnce(null);

      const user = { _id: new Types.ObjectId(mockUserId) };
      const productId = new Types.ObjectId().toString();

      await expect(
        cartService.removeProductFromCart(user._id.toString(), productId),
      ).rejects.toThrow('Panier non trouvé');
    });

    it('devrait lancer une erreur si le produit n’est pas dans le panier', async () => {
      mockCartModel.findOne.mockResolvedValueOnce({
        ...mockCart,
        products: [], // 👈 Panier vide
      });

      const user = { _id: new Types.ObjectId(mockUserId) };
      const productId = new Types.ObjectId().toString();

      await expect(
        cartService.removeProductFromCart(user._id.toString(), productId),
      ).rejects.toThrow('Produit non trouvé dans le panier');
    });
  });
});
