import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserType } from '../types/user.type';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private jwtService: JwtService, // Service pour gérer les tokens JWT
  ) {}

  // Créer un utilisateur
  async create(userData: UserType): Promise<{ user: User; token: string }> {
    const { email, password, ...rest } = userData;

    // Vérifier si un utilisateur avec cet email existe déjà
    const existingUser = await this.findOneByEmail(email);
    if (existingUser) {
      throw new BadRequestException(
        'Un utilisateur avec cet email existe déjà.',
      );
    }

    // Hacher le mot de passe avant de sauvegarder
    const saltRounds = 10; // Définir le nombre de rounds pour bcrypt
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer et sauvegarder le nouvel utilisateur avec le mot de passe haché
    const user = new this.userModel({
      ...rest,
      email: email,
      password: hashedPassword,
    });

    const savedUser = await user.save();

    // Générer un token JWT
    const payload = { userId: savedUser._id, email: savedUser.email };
    const token = this.jwtService.sign(payload);

    // Retourner l'utilisateur et le token
    return { user: savedUser, token };
  }

  // Récupérer tous les utilisateurs
  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des utilisateurs: ' + error.message,
      );
    }
  }

  // Récupérer un utilisateur par son ID
  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const { password, ...rest } = updateUserDto;

      const updatedUserDto: any = { ...rest };

      // Si un mot de passe est fourni, le hacher et l'ajouter à updatedUserDto
      if (password) {
        const saltRounds = 10; // Définir le nombre de rounds pour bcrypt
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        updatedUserDto.password = hashedPassword;
      }

      // Mettre à jour l'utilisateur avec les nouveaux champs
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updatedUserDto, { new: true })
        .exec();

      // Si l'utilisateur n'existe pas, lever une exception NotFoundException
      if (!updatedUser) {
        throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
      }

      return updatedUser;
    } catch (error) {
      // Si l'erreur est une NotFoundException, elle doit déjà avoir été levée
      if (error instanceof NotFoundException) {
        throw error; // Laisser l'exception se propager sans la capturer
      }

      // Capturer les autres erreurs et lever une InternalServerErrorException
      throw new InternalServerErrorException(
        "Erreur lors de la mise à jour de l'utilisateur: " + error.message,
      );
    }
  }

  // Supprimer un utilisateur
  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }
  }

  // Méthode pour compter les utilisateurs
  async countUsers(): Promise<number> {
    try {
      return await this.userModel.countDocuments().exec(); // Compter tous les documents utilisateurs
    } catch (error) {
      throw new InternalServerErrorException(
        'Erreur lors du comptage des utilisateurs: ' + error.message,
      );
    }
  }

  // Trouver un utilisateur par email
  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }
}
