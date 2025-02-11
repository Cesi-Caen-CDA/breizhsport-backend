import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { ProductService } from '../../product/services/product.service';
import { getModelToken } from '@nestjs/mongoose';
import { Cart } from '../schemas/cart.schema';
import { Types } from 'mongoose';

describe('CartService', () => {
  let cartService: CartService;
  let productService: ProductService;
  let cartModel: any;

  const mockCart = {
    _id: new Types.ObjectId(),
    user: new Types.ObjectId(),
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
    // Ajout d'un mock de save
    save: jest.fn().mockResolvedValue(mockCart),
  };

  const mockProductService = {
    findOne: jest.fn().mockResolvedValue(mockProduct),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: ProductService, useValue: mockProductService },
        { provide: getModelToken(Cart.name), useValue: mockCartModel },
      ],
    }).compile();

    cartService = module.get<CartService>(CartService);
    productService = module.get<ProductService>(ProductService);
    cartModel = module.get(getModelToken(Cart.name));
  });

  describe('addProductToCart', () => {
    it('devrait ajouter un produit au panier avec succès', async () => {
      const user = { _id: new Types.ObjectId() };
      const productId = mockProduct._id.toString();
      const quantity = 2;

      const result = await cartService.addProductToCart(
        user._id,
        productId,
        quantity,
      );

      expect(mockProductService.findOne).toHaveBeenCalledWith(productId);
      expect(mockCartModel.findOne).toHaveBeenCalledWith({
        user: user._id,
        checkedOut: false,
      });
      expect(mockCart.save).toHaveBeenCalled(); // On vérifie que save est bien appelé
      expect(result).toEqual(mockCart);
    });

    it('devrait lancer une erreur si le produit est introuvable', async () => {
      mockProductService.findOne.mockResolvedValueOnce(null);
      const user = { _id: new Types.ObjectId() };
      const productId = new Types.ObjectId().toString();
      const quantity = 2;

      await expect(
        cartService.addProductToCart(user._id, productId, quantity),
      ).rejects.toThrow('Produit non trouvé ou ID du produit invalide');
    });
  });

  describe('removeProductFromCart', () => {
    it('devrait supprimer un produit du panier', async () => {
      const user = { _id: mockCart.user };

      // On s'assure que mockCart contient bien un produit
      const productId = mockCart.products[0].product.toString(); // On utilise l'ID du produit existant dans mockCart

      // Assurons-nous que mockCart contient le produit avant l'appel de la méthode
      mockCart.products = [
        { product: new Types.ObjectId(productId), quantity: 1 }, // Le produit à supprimer
      ];

      const result = await cartService.removeProductFromCart(
        user._id,
        productId,
      );

      expect(mockCartModel.findOne).toHaveBeenCalledWith({
        user: user._id,
        checkedOut: false,
      });
      expect(mockCart.save).toHaveBeenCalled(); // Vérifie que save a bien été appelé
      expect(result).toEqual(mockCart);
    });

    it('devrait lancer une erreur si le panier est introuvable', async () => {
      mockCartModel.findOne.mockResolvedValueOnce(null);

      const user = { _id: new Types.ObjectId() };
      const productId = new Types.ObjectId().toString();

      await expect(
        cartService.removeProductFromCart(user._id, productId),
      ).rejects.toThrow('Panier non trouvé');
    });

    it('devrait lancer une erreur si le produit n’est pas dans le panier', async () => {
      // On simule un panier où le tableau de produits est vide
      mockCartModel.findOne.mockResolvedValueOnce({
        ...mockCart,
        products: [], // Panier vide
      });

      const user = { _id: mockCart.user };
      const productId = new Types.ObjectId().toString(); // Utilisation d'un ID qui n'existe pas dans le panier

      await expect(
        cartService.removeProductFromCart(user._id, productId),
      ).rejects.toThrow('Produit non trouvé dans le panier');
    });
  });
});
