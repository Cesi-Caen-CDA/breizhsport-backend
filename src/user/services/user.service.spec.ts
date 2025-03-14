import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, BadRequestException } from '@nestjs/common';
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

  describe('findOne', () => {
    it("devrait retourner un utilisateur si l'ID est valide", async () => {
      const mockId = new Types.ObjectId().toString();
      const mockUserDocument = {
        _id: mockId,
        email: 'test@example.com',
        password: 'hashedPassword',
        firstname: 'John',
        lastname: 'Doe',
      };

      model.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUserDocument),
      } as any);

      const result = await userService.findOne(mockId);

      expect(model.findById).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(mockUserDocument);
    });

    it("devrait lancer une NotFoundException si l'utilisateur n'est pas trouvé", async () => {
      const mockId = new Types.ObjectId().toString();

      model.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(userService.findOne(mockId)).rejects.toThrowError(
        new NotFoundException(`Utilisateur avec l'ID ${mockId} non trouvé`),
      );

      expect(model.findById).toHaveBeenCalledWith(mockId);
    });
  });
});
