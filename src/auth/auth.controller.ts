import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from 'src/dto/login-user.dto';
import { AuthService } from './auth.service';
import { AuthType } from './types/auth.type';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }
  @ApiOperation({ summary: 'Login' })
  @Post('login')
  @ApiBody({ type: LoginUserDto })
  async login(@Body() authBody: AuthType) {
    return this.authService.login({ authBody });
  }
  @ApiOperation({ summary: 'Logout' })
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
