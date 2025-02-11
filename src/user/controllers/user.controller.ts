// src/user/controllers/user.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { OwnProfileGuard } from '../../auth/guards/own.profile.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Créer un utilisateur
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // Récuperer tout les utilisateurs
  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  // Récuperer un utilisateur en fonction de son Id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // Modifier un utilisateur
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  // Supprimer un utilisateur
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  // Afficher le profil utilisateur
  @Get('profile/:id')
  // Vérifie que l'utilisateur est authentifié et que c'est son propre profil
  @UseGuards(AuthGuard, OwnProfileGuard)
  async getProfile(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // Modifier les informations du profil utilisateur
  @Patch('profile/:id')
  // Vérifie que l'utilisateur est authentifié et que c'est son propre profil
  @UseGuards(AuthGuard, OwnProfileGuard)
  async updateProfile(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }
}
