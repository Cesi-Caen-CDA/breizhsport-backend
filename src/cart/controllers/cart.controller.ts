// src/cart/controllers/cart.controller.ts
import { Controller, Post, Param, Body, Get, Delete } from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { UserService } from '../../user/services/user.service';

@Controller('carts')
export class CartController {
  constructor(
    private cartService: CartService,
    private userService: UserService,
  ) {}

  @Post('add/:productId')
  async addProductToCart(
    @Param('productId') productId: string,
    @Body('userId') userId: string,
    @Body('quantity') quantity: number,
  ) {
    const user = await this.userService.findOne(userId);
    return this.cartService.addProductToCart(user, productId, quantity);
  }

  @Get(':userId')
  async getCart(@Param('userId') userId: string) {
    return this.cartService.getCartForUser(userId);
  }

  @Delete('remove/:productId')
  async removeProductFromCart(
    @Param('productId') productId: string,
    @Body('userId') userId: string,
  ) {
    const user = await this.userService.findOne(userId);
    return this.cartService.removeProductFromCart(user, productId);
  }
}
