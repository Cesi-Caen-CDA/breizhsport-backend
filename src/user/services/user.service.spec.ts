import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Types, Model } from 'mongoose';
import { UserType } from '../types/user.type';

describe('UserService', () => {
  let userService: UserService;
  let jwtService: JwtService;
  let model: Model<User>;

  const mockUser: UserType = {
    email: 'test@example.com',
    password: 'password123',
    firstname: 'John',
    lastname: 'Doe',
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            new: jest.fn().mockImplementation((data) => {
              const mockDocument = {
                ...data,
                _id: new Types.ObjectId().toString(),
                save: jest.fn().mockResolvedValue({
                  ...data,
                  _id: new Types.ObjectId().toString(),
                }),
              };
              return mockDocument;
            }),
            findOne: jest.fn().mockResolvedValue(null),
            findByIdAndUpdate: jest.fn().mockResolvedValue(mockUser),
            findByIdAndDelete: jest.fn().mockResolvedValue(undefined),
            countDocuments: jest.fn().mockResolvedValue(1),
          },
        },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  describe('create', () => {
    it('devrait créer un utilisateur avec succès et générer un token', async () => {
      const createUserDto: UserType = {
        email: 'test@example.com',
        password: 'password123',
        firstname: 'John',
        lastname: 'Doe',
      };

      userService.findOneByEmail = jest.fn().mockResolvedValue(null);

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = {
        email: createUserDto.email,
        password: hashedPassword,
        firstname: createUserDto.firstname,
        lastname: createUserDto.lastname,
      };
      const result = await userService.create(newUser);

      expect(userService.findOneByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );

      expect(model.constructor).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });

      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: result.user._id,
        email: createUserDto.email,
      });

      expect(result).toEqual({
        user: {
          ...createUserDto,
          password: hashedPassword,
          _id: result.user._id,
        },
        token: 'mocked-jwt-token',
      });
    });

    it("devrait lancer une erreur si l'utilisateur existe déjà", async () => {
      const createUserDto: UserType = { ...mockUser }; // Type UserType

      const existingUser = {
        ...mockUser,
        _id: new Types.ObjectId().toString(),
      }; // _id en string
      userService.findOneByEmail = jest.fn().mockResolvedValue(existingUser);

      await expect(userService.create(createUserDto)).rejects.toThrowError(
        new Error('Un utilisateur avec cet email existe déjà.'),
      );

      expect(userService.findOneByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
    });
  });

  // ... (autres tests)
});
