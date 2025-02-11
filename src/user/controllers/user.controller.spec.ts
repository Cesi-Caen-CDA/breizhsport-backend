import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { OwnProfileGuard } from '../../auth/guards/own.profile.guard';
import { JwtService } from '@nestjs/jwt';

describe('UserController', () => {
  let controller: UserController;
  let userService: Partial<UserService>;

  // Mocks pour AuthGuard, OwnProfileGuard et JwtService
  const mockAuthGuard = { canActivate: jest.fn(() => true) };
  const mockOwnProfileGuard = { canActivate: jest.fn(() => true) };
  const mockJwtService = {
    verify: jest.fn().mockReturnValue({ userId: '1' }), // Simule le payload du JWT
    sign: jest.fn().mockReturnValue('mocked-token'), // Simule la méthode sign
  };

  beforeEach(async () => {
    userService = {
      create: jest.fn().mockResolvedValue({
        _id: '1',
        lastname: 'Doe',
        firstname: 'John',
        email: 'john.doe@example.com',
        password: 'securepassword',
      }),
      findAll: jest.fn().mockResolvedValue([
        {
          _id: '1',
          lastname: 'Doe',
          firstname: 'John',
          email: 'john.doe@example.com',
          password: 'securepassword',
        },
      ]),
      findOne: jest.fn().mockResolvedValue({
        _id: '1',
        lastname: 'Doe',
        firstname: 'John',
        email: 'john.doe@example.com',
        password: 'securepassword',
      }),
      update: jest.fn().mockResolvedValue({
        _id: '1',
        lastname: 'Doe',
        firstname: 'John',
        email: 'john.doe@example.com',
        password: 'newpassword',
      }),
      remove: jest
        .fn()
        .mockResolvedValue({ message: 'User deleted successfully' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: AuthGuard, useValue: mockAuthGuard },
        { provide: OwnProfileGuard, useValue: mockOwnProfileGuard },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const dto: CreateUserDto = {
        lastname: 'Doe',
        firstname: 'John',
        email: 'john.doe@example.com',
        password: 'securepassword',
      };
      const result = await controller.create(dto);

      expect(result).toEqual({
        _id: '1',
        lastname: 'Doe',
        firstname: 'John',
        email: 'john.doe@example.com',
        password: 'securepassword',
      });
      expect(userService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([
        {
          _id: '1',
          lastname: 'Doe',
          firstname: 'John',
          email: 'john.doe@example.com',
          password: 'securepassword',
        },
      ]);
      expect(userService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual({
        _id: '1',
        lastname: 'Doe',
        firstname: 'John',
        email: 'john.doe@example.com',
        password: 'securepassword',
      });
      expect(userService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const dto: UpdateUserDto = { password: 'newpassword' };
      const result = await controller.update('1', dto);

      expect(result).toEqual({
        _id: '1',
        lastname: 'Doe',
        firstname: 'John',
        email: 'john.doe@example.com',
        password: 'newpassword',
      });
      expect(userService.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('remove', () => {
    it('should delete a user by id', async () => {
      const result = await controller.remove('1');
      expect(result).toEqual({ message: 'User deleted successfully' });
      expect(userService.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('getProfile', () => {
    it('should return the user profile if the user is authenticated', async () => {
      const result = await controller.getProfile('1');
      expect(result).toEqual({
        _id: '1',
        lastname: 'Doe',
        firstname: 'John',
        email: 'john.doe@example.com',
        password: 'securepassword',
      });
      // expect(mockAuthGuard.canActivate).toHaveBeenCalled();
      // expect(mockOwnProfileGuard.canActivate).toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('should update the user profile if the user is authenticated', async () => {
      const dto: UpdateUserDto = { password: 'newpassword' };
      const result = await controller.updateProfile('1', dto);

      expect(result).toEqual({
        _id: '1',
        lastname: 'Doe',
        firstname: 'John',
        email: 'john.doe@example.com',
        password: 'newpassword',
      });
      // expect(mockAuthGuard.canActivate).toHaveBeenCalled();
      // expect(mockOwnProfileGuard.canActivate).toHaveBeenCalled();
      expect(userService.update).toHaveBeenCalledWith('1', dto);
    });
  });
});
