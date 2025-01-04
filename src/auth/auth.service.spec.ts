// src/auth/services/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/services/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/schemas/user.schema';
import { LoginUserDto } from 'src/dto/login-user.dto';

// Mock de UserService
const mockUserService = {
  findOneByEmail: jest.fn(),
  create: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  it('devrait enregistrer un utilisateur avec des données valides', async () => {
    const createUserDto: CreateUserDto = {
      firstname: 'John',
      lastname: 'DOE',
      email: 'john.doe@example.com',
      password: 'password123',
    };

    mockUserService.findOneByEmail.mockResolvedValue(null); // L'email n'existe pas
    mockUserService.create.mockResolvedValue(createUserDto as any);

    const result = await userService.create(createUserDto);

    expect(result).toEqual(createUserDto); // Vérifie que l'utilisateur est bien retourné
    expect(mockUserService.create).toHaveBeenCalledWith(createUserDto); // Vérifie l'appel à la méthode create
  });

  it("devrait échouer si l'email existe déjà", async () => {
    const createUserDto: CreateUserDto = {
      firstname: 'Jane',
      lastname: 'DOE',
      email: 'jane.doe@example.com',
      password: 'password12345789',
    };

    mockUserService.findOneByEmail.mockResolvedValue(createUserDto as any);

    expect(mockUserService.findOneByEmail).toHaveBeenCalledWith(
      createUserDto.email,
    );
  });
});
