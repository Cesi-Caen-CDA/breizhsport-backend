import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/services/user.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUser = {
    _id: 'userId123',
    email: 'john.doe@example.com',
    password: 'hashedPassword123',
  };

  const mockUserService = {
    findOneByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('jwtToken123'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('devrait retourner un token JWT en cas de succès', async () => {
      mockUserService.findOneByEmail.mockResolvedValue(mockUser);

      // Mock de la méthode bcrypt.compare
      const bcryptCompare = jest.fn().mockResolvedValue(true); // Ici, on simule une comparaison réussie
      (bcrypt.compare as jest.Mock) = bcryptCompare;

      const result = await authService.login({
        authBody: { email: mockUser.email, password: 'password123' },
      });

      expect(userService.findOneByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(bcryptCompare).toHaveBeenCalledWith(
        'password123',
        mockUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: mockUser._id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        userId: 'userId123',
        token: 'jwtToken123',
        message: 'Authentification réussie.',
      });
    });

    it('devrait lever une UnauthorizedException si l’utilisateur n’est pas trouvé', async () => {
      mockUserService.findOneByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          authBody: { email: 'unknown@example.com', password: 'password123' },
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(userService.findOneByEmail).toHaveBeenCalledWith(
        'unknown@example.com',
      );
    });

    it('devrait lever une UnauthorizedException si le mot de passe est incorrect', async () => {
      mockUserService.findOneByEmail.mockResolvedValue(mockUser);

      // Mock de la méthode bcrypt.compare pour simuler une comparaison échouée
      const bcryptCompare = jest.fn().mockResolvedValue(false); // Ici, on simule un mot de passe incorrect
      (bcrypt.compare as jest.Mock) = bcryptCompare;

      await expect(
        authService.login({
          authBody: { email: mockUser.email, password: 'wrongPassword' },
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(bcryptCompare).toHaveBeenCalledWith(
        'wrongPassword',
        mockUser.password,
      );
    });
  });

  describe('logout', () => {
    it('devrait retourner un message de déconnexion réussie', async () => {
      const result = await authService.logout('someToken123');

      expect(result).toEqual({ message: 'Déconnexion réussie.' });
    });
  });
});
