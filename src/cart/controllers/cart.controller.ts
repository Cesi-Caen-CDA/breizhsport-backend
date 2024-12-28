// src/cart/controllers/cart.controller.ts
import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { ProductService } from '../../product/services/product.service';
import { UserService } from '../../user/services/user.service';

@Controller('cart')
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
}
