import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            createOrder: jest.fn(),
            getOrderHistory: jest.fn(),
            updateOrder: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('should call OrderService.createOrder with CreateOrderDto and return the result', async () => {
      const createOrderDto: CreateOrderDto = {
        userId: 'user123',
        products: [{ productId: 'product123', quantity: 2 }],
      };

      const mockOrder = { id: 'order123', ...createOrderDto };
      jest.spyOn(service, 'createOrder').mockResolvedValue(mockOrder as any);

      const result = await controller.createOrder(createOrderDto);

      expect(service.createOrder).toHaveBeenCalledWith(createOrderDto);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('getOrderHistory', () => {
    it('should call OrderService.getOrderHistory with userId and return the result', async () => {
      const userId = 'user123';
      const mockHistory = [{ id: 'order1' }, { id: 'order2' }];
      jest
        .spyOn(service, 'getOrderHistory')
        .mockResolvedValue(mockHistory as any);

      const result = await controller.getOrderHistory(userId);

      expect(service.getOrderHistory).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockHistory);
    });
  });

  describe('updateOrder', () => {
    it('should call OrderService.updateOrder with id and UpdateOrderDto and return the result', async () => {
      const orderId = 'order123';
      const updateOrderDto: UpdateOrderDto = { status: 'completed' };
      const mockUpdatedOrder = { id: orderId, status: 'completed' };
      jest
        .spyOn(service, 'updateOrder')
        .mockResolvedValue(mockUpdatedOrder as any);

      const result = await controller.updateOrder(orderId, updateOrderDto);

      expect(service.updateOrder).toHaveBeenCalledWith(orderId, updateOrderDto);
      expect(result).toEqual(mockUpdatedOrder);
    });
  });
});
