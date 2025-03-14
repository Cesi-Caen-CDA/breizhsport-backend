import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('devrait appeler la méthode login du service AuthService avec succès', async () => {
      const authBody = {
        email: 'john.doe@example.com',
        password: 'password123',
      };
      const loginResponse = {
        token: 'jwtToken123',
        message: 'Authentification réussie.',
      };

      mockAuthService.login.mockResolvedValue(loginResponse);

      const result = await authController.login(authBody);

      expect(mockAuthService.login).toHaveBeenCalledWith({ authBody });
      expect(result).toEqual(loginResponse);
    });

    it('devrait lever une UnauthorizedException si les informations sont incorrectes', async () => {
      const authBody = {
        email: 'unknown@example.com',
        password: 'wrongPassword',
      };

      mockAuthService.login.mockRejectedValueOnce(
        new UnauthorizedException('Email ou mot de passe incorrect'),
      );

      await expect(authController.login(authBody)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith({ authBody });
    });
  });

  describe('logout', () => {
    it('devrait appeler la méthode logout du service AuthService avec succès', async () => {
      const token = 'jwtToken123';
      const logoutResponse = { message: 'Déconnexion réussie.' };

      mockAuthService.logout.mockResolvedValue(logoutResponse);

      const req = { headers: { authorization: `Bearer ${token}` } };
      const result = await authController.logout(req);

      expect(mockAuthService.logout).toHaveBeenCalledWith(token);
      expect(result).toEqual(logoutResponse);
    });
    it('devrait lever une exception si le token est manquant', async () => {
      const req = {
        headers: {
          authorization: '', // Pas de token
        },
      };

      // Mock de la méthode logout de AuthService (si nécessaire)
      jest.spyOn(authService, 'logout').mockImplementation(() => {
        throw new Error('Token manquant ou invalide.');
      });

      // Appel de la méthode logout via le contrôleur
      try {
        await authController.logout(req);
      } catch (e) {
        expect(e.message).toBe('Token manquant ou invalide.');
      }
    });
  });
});
