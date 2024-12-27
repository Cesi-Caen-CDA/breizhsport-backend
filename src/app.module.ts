import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [UserModule, DatabaseModule, ProductModule, OrderModule, CartModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
