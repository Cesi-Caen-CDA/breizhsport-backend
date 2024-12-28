// src/order/order.module.ts
import { Module } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { OrderController } from './controllers/order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { CartModule } from '../cart/cart.module';
import { UserModule } from '../user/user.module';
import { ProductSchema, Product } from '../product/schemas/product.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    CartModule,
    UserModule,
  ],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
