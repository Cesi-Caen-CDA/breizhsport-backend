import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [UserModule, DatabaseModule, ProductModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
