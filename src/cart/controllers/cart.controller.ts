// src/cart/controllers/cart.controller.ts
import {
  Controller,
  Post,
  Param,
  Body,
  Get,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { UserService } from '../../user/services/user.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { Types } from 'mongoose';

// Vérifie que l'utilisateur est authentifié
@UseGuards(AuthGuard)
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
    return this.cartService.addProductToCart(userId, productId, quantity);
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
    return this.cartService.removeProductFromCart(userId, productId);
  }
}
