import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from '../services/cart.service';
import { UserService } from '../../user/services/user.service';
import { Types } from 'mongoose';
import { AuthGuard } from '../../auth/guards/auth.guard';

describe('CartController', () => {
  let cartController: CartController;
  let cartService: CartService;
  let userService: UserService;

  const mockUser = {
    _id: new Types.ObjectId(),
    name: 'John Doe',
    email: 'john.doe@example.com',
  };

  const mockCart = {
    _id: new Types.ObjectId(),
    user: mockUser._id,
    products: [{ product: new Types.ObjectId(), quantity: 2 }],
    checkedOut: false,
  };

  const mockCartService = {
    addProductToCart: jest.fn().mockResolvedValue(mockCart),
    getCartForUser: jest.fn().mockResolvedValue(mockCart),
    removeProductFromCart: jest.fn().mockResolvedValue(mockCart),
  };

  const mockUserService = {
    findOne: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: mockCartService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      // Mock du AuthGuard pour éviter l'erreur liée au JwtService
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true), // Le guard renvoie toujours `true`
      })
      .compile();

    cartController = module.get<CartController>(CartController);
    cartService = module.get<CartService>(CartService);
    userService = module.get<UserService>(UserService);
  });

  describe('addProductToCart', () => {
    it('devrait ajouter un produit au panier avec succès', async () => {
      const productId = new Types.ObjectId().toString();
      const userId = mockUser._id.toString();
      const quantity = 2;

      const result = await cartController.addProductToCart(
        productId,
        userId,
        quantity,
      );

      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(cartService.addProductToCart).toHaveBeenCalledWith(
        userId,
        productId,
        quantity,
      );
      expect(result).toEqual(mockCart);
    });

    it("devrait lever une erreur si l'utilisateur n'existe pas", async () => {
      mockUserService.findOne.mockResolvedValueOnce(null);

      await expect(
        cartController.addProductToCart(
          new Types.ObjectId().toString(),
          new Types.ObjectId().toString(),
          2,
        ),
      ).rejects.toThrow('Utilisateur introuvable');
    });
  });

  describe('getCart', () => {
    it('devrait retourner le panier pour un utilisateur donné', async () => {
      const userId = mockUser._id.toString();

      const result = await cartController.getCart(userId);

      expect(cartService.getCartForUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockCart);
    });

    it('devrait lever une erreur si le panier est introuvable', async () => {
      mockCartService.getCartForUser.mockRejectedValueOnce(
        new Error('Panier non trouvé'),
      );

      await expect(
        cartController.getCart(mockUser._id.toString()),
      ).rejects.toThrow('Panier non trouvé');
    });
  });

  describe('removeProductFromCart', () => {
    it('devrait supprimer un produit du panier avec succès', async () => {
      const productId = new Types.ObjectId().toString();
      const userId = mockUser._id.toString();

      const result = await cartController.removeProductFromCart(
        productId,
        userId,
      );

      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(cartService.removeProductFromCart).toHaveBeenCalledWith(
        userId,
        productId,
      );
      expect(result).toEqual(mockCart);
    });

    it("devrait lever une erreur si l'utilisateur n'existe pas", async () => {
      mockUserService.findOne.mockResolvedValueOnce(null);

      await expect(
        cartController.removeProductFromCart(
          new Types.ObjectId().toString(),
          mockUser._id.toString(),
        ),
      ).rejects.toThrow('Utilisateur introuvable');
    });

    it('devrait lever une erreur si removeProductFromCart échoue', async () => {
      mockCartService.removeProductFromCart.mockRejectedValueOnce(
        new Error('Erreur de suppression'),
      );

      await expect(
        cartController.removeProductFromCart(
          new Types.ObjectId().toString(),
          mockUser._id.toString(),
        ),
      ).rejects.toThrow('Erreur de suppression');
    });
  });
});
