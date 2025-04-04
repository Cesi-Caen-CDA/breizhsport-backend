// src/cart/controllers/cart.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
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
    status: 201,
    description: 'Produit ajouté au panier avec succès',
    schema: {
      properties: {
        _id: { type: 'string' },
        user: { type: 'string' },
        products: {
          type: 'array',
          items: {
            properties: {
              product: { type: 'string' },
              quantity: { type: 'number' },
            },
          },
        },
        checkedOut: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 404,
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
    status: 200,
    description: 'Panier récupéré avec succès',
    schema: {
      properties: {
        _id: { type: 'string' },
        user: { type: 'string' },
        products: {
          type: 'array',
          items: {
            properties: {
              product: {
                properties: {
                  _id: { type: 'string' },
                  name: { type: 'string' },
                  price: { type: 'number' },
                  category: { type: 'string' },
                  description: { type: 'string' },
                  stock: { type: 'number' },
                },
              },
              quantity: { type: 'number' },
            },
          },
        },
        checkedOut: { type: 'boolean' },
      },
    },
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
    status: 200,
    description: 'Produit supprimé du panier avec succès',
    schema: {
      properties: {
        _id: { type: 'string' },
        user: { type: 'string' },
        products: {
          type: 'array',
          items: {
            properties: {
              product: { type: 'string' },
              quantity: { type: 'number' },
            },
          },
        },
        checkedOut: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Produit ou panier non trouvé' })
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
