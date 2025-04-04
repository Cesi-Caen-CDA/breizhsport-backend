import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderService } from '../services/order.service';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) { }

  @Post('create')
  @ApiOperation({ summary: 'Créer une nouvelle commande' })
  @ApiResponse({
    status: 201,
    description: 'La commande a été créée avec succès.',
    type: CreateOrderDto,
  })
  @ApiResponse({ status: 400, description: 'Données de commande invalides' })
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  @Get('history/:userId')
  @ApiOperation({
    summary: "Récupérer l'historique des commandes d'un utilisateur",
  })
  @ApiParam({
    name: 'userId',
    description: "ID de l'utilisateur",
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Historique des commandes récupéré avec succès',
  })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async getOrderHistory(@Param('userId') userId: string) {
    return this.orderService.getOrderHistory(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: "Mettre à jour l'état d'une commande" })
  @ApiParam({
    name: 'id',
    description: 'ID de la commande',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'La commande a été mise à jour avec succès',
  })
  @ApiResponse({ status: 404, description: 'Commande non trouvée' })
  async updateOrder(@Param('id') id: string) {
    return this.orderService.updateOrder(id);
  }
}
