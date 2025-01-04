// auth.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose'; // Ajout de MongooseModule
import { AuthService } from './auth.service';
import { UserService } from 'src/user/services/user.service';
import { UserModule } from 'src/user/user.module';
import { User, UserSchema } from 'src/user/schemas/user.schema'; // Import du UserModel
import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: 'secretKey', // Changez par une clé secrète sécurisée
      signOptions: { expiresIn: '1h' }, // Configurez la durée de vie du token
    }),
    forwardRef(() => UserModule),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // Ajout de la configuration Mongoose pour UserModel
  ],
  providers: [AuthService, UserService],
  exports: [AuthService, JwtModule],
  controllers: [AuthController],
})
export class AuthModule {}
