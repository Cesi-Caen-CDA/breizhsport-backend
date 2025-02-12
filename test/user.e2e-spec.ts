import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let mongoConnection: Connection;
  let jwtService: JwtService;
  let userId: string;
  let token: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    mongoConnection = (await connect(mongoUri)).connection;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = app.get(JwtService); // Récupérer le service JWT
    await app.init();
  });

  afterAll(async () => {
    await mongoConnection.close();
    await mongoServer.stop();
    await app.close();
  });

  describe('POST /users', () => {
    it('devrait créer un utilisateur', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstname: 'John',
        lastname: 'Doe',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);
      expect(response.body.user).toHaveProperty('_id');
      expect(response.body.user.email).toBe(createUserDto.email);
    }, 10000000);

    it("devrait retourner 400 si l'email est déjà utilisé", async () => {
      const createUserDto = {
        email: 'test2@example.com',
        password: 'password123',
        firstname: 'Steve',
        lastname: 'Jobs',
      };

      // Créer un premier utilisateur
      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      // Essayer de créer un utilisateur avec le même email
      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400); // BadRequestException
    });
  });

  describe('GET /users', () => {
    it('devrait retourner tous les utilisateurs', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /users/:id', () => {
    it("devrait retourner l'utilisateur par son id", async () => {
      const createUserDto = {
        email: 'user1@example.com',
        password: 'password123',
        firstname: 'Jane',
        lastname: 'Doe',
      };

      const createdUser = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);
      const response = await request(app.getHttpServer())
        .get(`/users/${createdUser.body.user._id}`)
        .expect(200);
      expect(response.body.email).toBe(createUserDto.email);
    });

    it('devrait retourner 404 si l’utilisateur n’existe pas', async () => {
      const nonExistentId = '607f1f77bcf86cd799439011';
      await request(app.getHttpServer())
        .get(`/users/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('devrait mettre à jour un utilisateur', async () => {
      const createUserDto = {
        email: 'updateuser@example.com',
        password: 'password123',
        firstname: 'Update',
        lastname: 'User',
      };

      const createdUser = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      const updateUserDto = {
        password: 'NewSecurePassword',
        email: 'updateuser2@example.com',
        firstname: 'Update2',
        lastname: 'User2',
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUser.body.user._id}`)
        .send(updateUserDto)
        .expect(200);

      // Récupère le mot de passe haché après la mise à jour
      const hashedPassword = response.body.password;

      // Comparaison du mot de passe envoyé avec celui dans la base de données
      const isPasswordValid = await bcrypt.compare(
        updateUserDto.password,
        hashedPassword,
      );
      expect(isPasswordValid).toBe(true); // Vérifie que le mot de passe est bien celui attendu

      // Si nécessaire, on peut aussi vérifier d'autres champs
      expect(response.body.firstname).toBe('Update2');
      expect(response.body.lastname).toBe('User2');
      expect(response.body.email).toBe('updateuser2@example.com');
    });

    it('devrait retourner 404 si l’utilisateur n’existe pas pour la mise à jour', async () => {
      const nonExistentId = '607f1f77bcf86cd799439011';
      const updateUserDto = {
        password: 'NewSecurePasswordTEst',
        email: 'updateusertest@example.com',
        firstname: 'UpdateTEst',
        lastname: 'UserTEst',
      };

      await request(app.getHttpServer())
        .patch(`/users/${nonExistentId}`)
        .send(updateUserDto)
        .expect(404); // NotFoundException
    });
  });

  describe('DELETE /users/:id', () => {
    it('devrait supprimer un utilisateur', async () => {
      const createUserDto = {
        email: 'deleteuser@example.com',
        password: 'password123',
        firstname: 'Delete',
        lastname: 'User',
      };

      const createdUser = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/users/${createdUser.body.user._id}`)
        .expect(200);

      // Vérifier que l'utilisateur a été supprimé
      await request(app.getHttpServer())
        .get(`/users/${createdUser.body.user._id}`)
        .expect(404);
    });

    it('devrait retourner 404 si l’utilisateur n’existe pas pour la suppression', async () => {
      const nonExistentId = '607f1f77bcf86cd799439011';
      await request(app.getHttpServer())
        .delete(`/users/${nonExistentId}`)
        .expect(404); // NotFoundException
    });
  });

  describe('GET /users/profile/:id (protected)', () => {
    beforeAll(async () => {
      const createUserDto = {
        email: 'protected@example.com',
        password: 'password123',
        firstname: 'Protected',
        lastname: 'User',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);
      userId = response.body.user._id;
      const payload = { userId: userId, email: createUserDto.email };
      token = jwtService.sign(payload);
    });

    it('devrait retourner le profil de l’utilisateur authentifié', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/profile/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.email).toBe('protected@example.com');
    });

    it('devrait retourner 403 si le token est invalide', async () => {
      await request(app.getHttpServer())
        .get(`/users/profile/${userId}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
    });
  });
});
