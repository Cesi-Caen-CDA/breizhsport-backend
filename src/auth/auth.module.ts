import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/services/user.service';

@Module({
  imports: [
    JwtModule.register({
      secret: 'secretKey', // Changez par une clé secrète sécurisée
      signOptions: { expiresIn: '1h' }, // Configurez la durée de vie du token
    }),
  ],
  providers: [AuthService, UserService],
  exports: [AuthService],
})
export class AuthModule {}
