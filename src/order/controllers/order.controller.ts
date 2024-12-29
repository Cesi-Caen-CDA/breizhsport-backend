// src/order/controllers/order.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { UserService } from '../../user/services/user.service';

@Controller('orders')
export class OrderController {
  constructor(
    private orderService: OrderService,
    private userService: UserService,
  ) {}

  @Post('create')
  async createOrder(@Body('userId') userId: string) {
    const user = await this.userService.findOne(userId);
    return this.orderService.createOrder(user);
  }

  @Get('history/:userId')
  async getOrderHistory(@Param('userId') userId: string) {
    return this.orderService.getOrderHistory(userId);
  }
}
