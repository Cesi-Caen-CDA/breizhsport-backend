// src/cart/cart.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { CartService } from './services/cart.service';
import { CartController } from './controllers/cart.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './schemas/cart.schema';
import { ProductModule } from '../product/product.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    forwardRef(() => AuthModule),
    ProductModule,
    UserModule,
  ],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}
