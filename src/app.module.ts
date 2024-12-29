import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { CartModule } from './cart/cart.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UserModule, DatabaseModule, ProductModule, OrderModule, CartModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
