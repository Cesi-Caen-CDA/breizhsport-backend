// src/user/entities/user.entity.ts
import { UserType } from '../types/user.type';
import { Document } from 'mongoose';

export class UserEntity extends Document implements UserType {
  _id: string;
  lastname: string;
  firstname: string;
  email: string;
  password: string;

  constructor(partial: Partial<UserType>) {
    super();
    Object.assign(this, partial);
  }

  // Méthode d'entité, logique métier
  isPasswordSecure(): boolean {
    return this.password.length >= 8; // Juste un exemple de logique métier
  }
}
