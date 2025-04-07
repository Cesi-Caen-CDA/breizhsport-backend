// src/cart/controllers/cart.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { UserService } from '../../user/services/user.service';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { RemoveFromCartDto } from '../dto/remove-from-cart.dto';
import { Cart } from '../schemas/cart.schema'; // Importe o schema Cart
import { CartService } from '../services/cart.service';

@ApiTags('cart')
// Vérifie que l'utilisateur est authentifié
@UseGuards(AuthGuard)
@Controller('carts')
export class CartController {
  constructor(
    private cartService: CartService,
    private userService: UserService,
  ) { }

  @Post('add/:productId')
  @ApiOperation({ summary: 'Ajouter un produit au panier' })
  @ApiParam({
    name: 'productId',
    description: 'ID du produit à ajouter',
    required: true,
    type: String,
  })
  @ApiBody({ type: AddToCartDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Produit ajouté au panier avec succès',
    type: Cart, // Use o schema Cart para descrever a resposta
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produit ou utilisateur non trouvé',
  })
  async addProductToCart(
    @Param('productId') productId: string,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return await this.cartService.addProductToCart(
      addToCartDto.userId,
      productId,
      addToCartDto.quantity,
    );
  }

  @Get(':userId')
  @ApiOperation({ summary: "Récupérer le panier d'un utilisateur" })
  @ApiParam({
    name: 'userId',
    description: "ID de l'utilisateur",
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Panier récupéré avec succès',
    type: Cart, // Use o schema Cart para descrever a resposta
  })
  async getCart(@Param('userId') userId: string) {
    return this.cartService.getCartForUser(userId);
  }

  @Delete('remove/:productId')
  @ApiOperation({ summary: 'Supprimer un produit du panier' })
  @ApiParam({
    name: 'productId',
    description: 'ID du produit à supprimer',
    required: true,
  })
  @ApiBody({ type: RemoveFromCartDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Produit supprimé du panier avec succès',
    type: Cart, // Use o schema Cart para descrever a resposta (o panier atualisé)
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produit ou panier non trouvé',
  })
  async removeProductFromCart(
    @Param('productId') productId: string,
    @Body() removeFromCartDto: RemoveFromCartDto,
  ) {
    return this.cartService.removeProductFromCart(
      removeFromCartDto.userId,
      productId,
    );
  }
}
