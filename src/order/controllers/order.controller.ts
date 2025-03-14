import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';

@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post('create')
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  @Get('history/:userId')
  async getOrderHistory(@Param('userId') userId: string) {
    return this.orderService.getOrderHistory(userId);
  }

  @Patch(':id')
  async updateOrder(@Param('id') id: string) {
    return this.orderService.updateOrder(id);
  }
}
