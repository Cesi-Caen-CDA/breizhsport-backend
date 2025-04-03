// src/user/controllers/user.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { OwnProfileGuard } from '../../auth/guards/own.profile.guard';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserService } from '../services/user.service';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }
  @ApiOperation({ summary: 'Créer un utilisateur' })
  @Post()
  @ApiResponse({
    status: 201,
    description: 'Utilisateur créé avec succès.',
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 400,
    description: "Erreur pendant la création de l'utilisateur.",
  })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  @ApiOperation({ summary: 'Récuperer tous les utilisateurs' })
  @Get()
  @ApiResponse({
    status: 200,
    description: 'Utilsateurs récupérés avec succès.',
    type: [CreateUserDto],
  })
  async findAll() {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'Récuperer un utilisateur', operationId: 'id' })
  @ApiResponse({
    status: 200,
    description: "L'utilisateur a été trouvé avec succès.",
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 404,
    description: "L'utilisateur n'a pas été trouvé.",
  })
  @ApiResponse({
    status: 500,
    description:
      "Une erreur s'est produite lors de la recherche de l'utilisateur.",
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @ApiOperation({ summary: 'Modifier un utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur modifié avec succès.',
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erreur pendant la modification de l utilisateur.',
  })
  @Patch(':id')
  @ApiBody({ type: UpdateUserDto })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur supprimé avec succès.',
  })
  @ApiResponse({
    status: 404,
    description: "L'utilisateur n'a pas été trouvé.",
  })
  @ApiResponse({
    status: 500,
    description:
      "Une erreur s'est produite lors de la suppression de l'utilisateur.",
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Get('profile/:id')
  // Vérifie que l'utilisateur est authentifié et que c'est son propre profil
  @UseGuards(AuthGuard, OwnProfileGuard)
  @ApiOperation({ summary: "Récérer le profil d'un utilisateur" })
  @ApiResponse({
    status: 200,
    description: 'Profil trouvé avec succès.',
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé.',
  })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur.' })
  async getProfile(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // Modifier les informations du profil utilisateur
  @Patch('profile/:id')
  // Vérifie que l'utilisateur est authentifié et que c'est son propre
  @UseGuards(AuthGuard, OwnProfileGuard)
  @ApiOperation({ summary: "Modifier un profil d'utilisateur" })
  @ApiResponse({
    status: 200,
    description: 'Profil modifié avec succès.',
    type: UpdateUserDto,
  })
  @ApiResponse({ status: 400, description: 'Erreur pendant la modification.' })
  @ApiBody({ type: UpdateUserDto })
  async updateProfile(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }
}
