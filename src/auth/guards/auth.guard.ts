import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      return false; // Pas de token, accès refusé
    }

    try {
      // Vérifiez la validité du token
      const payload = this.jwtService.verify(token);
      // Ajoutez les informations de l'utilisateur dans la requête pour un accès ultérieur
      request.user = payload;
      return true; // Accès autorisé
    } catch {
      return false; // Token invalide, accès refusé
    }
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader) return null;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
