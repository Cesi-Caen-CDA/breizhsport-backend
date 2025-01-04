import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/services/user.service';
import { AuthType } from './types/auth.type';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService, // Service pour accéder aux utilisateurs
    private jwtService: JwtService, // Service pour gérer les tokens JWT
  ) {}

  async login({
    authBody,
  }: {
    authBody: AuthType;
  }): Promise<{ token: string; message: string }> {
    const { email, password } = authBody;

    // Vérifiez si l'utilisateur existe
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifiez si le mot de passe est correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Générer un token JWT
    const payload = { userId: user._id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { token: token, message: 'Authentification réussie.' };
  }

  async logout(token: string): Promise<{ message: string }> {
    // Optionnel : Invalider le token côté serveur (par exemple, en l'ajoutant à une liste noire)
    // Pour l'instant, nous retournons simplement une réponse de déconnexion réussie.
    return { message: 'Déconnexion réussie.' };
  }
}
