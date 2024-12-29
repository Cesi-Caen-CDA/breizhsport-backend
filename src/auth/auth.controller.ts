import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthType } from './types/auth.type';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() authBody: AuthType) {
    return this.authService.login({ authBody });
  }

  @Post('logout')
  async logout(@Req() req: any) {
    // Récupérer le token JWT depuis les headers ou la requête
    const token = req.headers.authorization?.split(' ')[1]; // Exemple : "Bearer <token>"
    if (!token) {
      throw new Error('Token manquant ou invalide.');
    }

    // Appeler la méthode de déconnexion
    return this.authService.logout(token);
  }
}
