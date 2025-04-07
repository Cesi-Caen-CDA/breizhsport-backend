import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from '../dto/login-user.dto';
import { AuthService } from './auth.service';
import { AuthType } from './types/auth.type';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      properties: {
        token: { type: 'string' },
        message: { type: 'string', example: 'Authentification réussie.' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: LoginUserDto })
  async login(@Body() authBody: AuthType) {
    return this.authService.login({ authBody });
  }

  @Post('logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      properties: {
        message: { type: 'string', example: 'Déconnexion réussie.' },
      },
    },
  })
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
