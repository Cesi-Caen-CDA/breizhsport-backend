import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/services/user.service';
import { AuthType } from './types/auth.type';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  private blacklistedTokens: Set<string> = new Set(); // Liste noire des tokens invalidés

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login({
    authBody,
  }: {
    authBody: AuthType;
  }): Promise<{ userId: string; token: string; message: string }> {
    const { email, password } = authBody;

    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // ✅ Assurer que `user._id` est bien un ObjectId et le convertir en string
    const userId: string = (user._id as Types.ObjectId).toString();

    const payload = { userId, email: user.email };
    const token = this.jwtService.sign(payload);

    return { userId, token, message: 'Authentification réussie.' };
  }

  async logout(token: string): Promise<{ message: string }> {
    // Simuler l’invalidation du token en l’ajoutant à une liste noire
    this.blacklistedTokens.add(token);

    return { message: 'Déconnexion réussie.' };
  }

  isTokenBlacklisted(token: string): boolean {
    // Vérifie si le token est dans la liste noire
    return this.blacklistedTokens.has(token);
  }
}
